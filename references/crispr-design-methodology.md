# CRISPR Design Methodology

## gRNA Design Pipeline

### On-Target Efficiency Prediction

| Tool | Model | Input | Output | Accuracy | Speed |
|------|-------|-------|--------|----------|-------|
| **CRISPRscan** | Logistic regression | 30bp sequence | Score 0-1 | Moderate | Fast |
| **DeepCRISPR** | Deep CNN | Sequence + epigenomic | Score 0-1 | High | Moderate |
| **CRISPR-Net** | Deep learning | Sequence | Score 0-1 | High | Fast |
| **Rule Set 2** | Gradient boosted trees | Sequence + features | Score 0-1 | High | Fast |
| **Azimuth** | Gradient boosted trees | 30bp sequence | Score 0-1 | High | Fast |
| **CRISPR-DO** | Deep learning | Sequence + chromatin | Score 0-1 | High | Moderate |
| **DeepSpCas9** | Deep learning | 30bp sequence | Score 0-1 | High | Fast |

### On-Target Design Rules

| Position | Nucleotide Preference | Effect | Rule |
|----------|----------------------|--------|------|
| **PAM** | NGG (SpCas9) | Required for Cas9 binding | Must have NGG at 3' end |
| **-3 to -4** | G preferred | Strong cleavage | G at position -3 or -4 |
| **+1** | G preferred | Transcription start | G at +1 for U6 promoter |
| **-1** | C preferred | Efficiency | C at -1 enhances activity |
| **Seed region** (1-12 from PAM) | Match critical | Specificity | Avoid mismatches in seed |
| **GC content** | 40-70% | Stability | <40% or >70% → reduced efficiency |
| **Poly-T** | Avoid TTTT | Pol III termination | 4+ consecutive T → premature termination |

### Off-Target Scoring and Prediction

| Tool | Method | Sensitivity | Specificity | Best For |
|------|--------|------------|------------|----------|
| **Cas-OFFinder** | Alignment-based | Very High | Moderate | Comprehensive off-target search |
| **CRISPOR** | CFD score + MIT score | High | High | Integrated design + scoring |
| **GuideScan** | Genome-wide enumeration | High | High | Genome-wide off-target atlas |
| **CCTop** | Alignment + scoring | Moderate | High | Quick screening |
| **CRISPRitz** | Variant-aware search | High | High | Population-specific off-targets |
| **FlashFry** | Pre-computed index | High | High | Fast batch design |

### Off-Target Scoring Methods

| Score | Range | Interpretation | Threshold |
|-------|-------|---------------|-----------|
| **MIT score** | 0-100 | Higher = fewer off-targets | > 80 recommended |
| **CFD score** | 0-1 | Higher = more off-target potential | < 0.2 recommended |
| **Specificity score** | 0-100 | Higher = more specific | > 50 recommended |
| **CRISPRoff** | 0-1 | Lower = fewer off-targets | < 0.05 recommended |

## CRISPR-Cas System Selection

| System | PAM | Editing Type | Size | Best For | Limitation |
|--------|-----|-------------|------|----------|-----------|
| **SpCas9** | NGG | Knockout, knockin | 4.1kb | Standard gene editing | Relatively large; NGG constraint |
| **SpCas9-HF1** | NGG | High-fidelity knockout | 4.1kb | Reduced off-target | Slightly lower on-target |
| **eSpCas9** | NGG | Enhanced specificity | 4.1kb | Reduced off-target | Slightly lower on-target |
| **xCas9 3.7** | NG/GAA/GAT | Broad PAM | 4.1kb | More target sites | Lower efficiency at some sites |
| **SpCas9-NG** | NG | Relaxed PAM | 4.1kb | More target sites | Reduced specificity |
| **SaCas9** | NNGRRT | Knockout | 3.2kb | AAV delivery | Restrictive PAM |
| **Cas12a (Cpf1)** | TTTV | Knockout; multiplex | 3.7kb | AT-rich regions; multiplex | Different PAM; staggered cut |
| **Cas13** | NA (RNA) | RNA knockdown | 3.5kb | RNA editing; no DNA change | Collateral RNA cleavage |
| **ABE8e** | NGG | A→G (A•T to G•C) | 5.3kb | Precise point mutations | Only A→G transitions |
| **ABEmax** | NGG | A→G | 5.3kb | Higher efficiency ABE | Only A→G transitions |
| **CBE (BE4max)** | NGG | C→T (G•C to A•T) | 5.3kb | Precise point mutations | Only C→T transitions; bystander edits |
| **Prime Editor (PE3)** | NGG | All 12 transitions/transversions + small indels | 6.3kb | Most versatile editing | Lower efficiency; large construct |
| **PE5max** | NGG | Enhanced prime editing | 6.3kb | Higher PE efficiency | Still lower than nuclease |

### Cas System Selection Decision Tree

```
What type of edit?
    │
    ├─ Gene knockout
    │   ├─ AAV delivery needed? → SaCas9 (smaller)
    │   ├─ AT-rich target? → Cas12a
    │   ├─ Need multiplex? → Cas12a (self-processing crRNA array)
    │   └─ Standard → SpCas9-HF1 or eSpCas9 (high fidelity)
    │
    ├─ Point mutation (transition)
    │   ├─ A→G needed? → ABE8e or ABEmax
    │   └─ C→T needed? → BE4max
    │
    ├─ Point mutation (transversion) or small indel
    │   └─ Prime Editor (PE3/PE5max)
    │
    ├─ RNA knockdown (no DNA change)
    │   └─ Cas13d (RfxCas13d)
    │
    └─ Large insertion (>50bp)
        ├─ HDR template available? → SpCas9 + ssODN/dsDNA
        └─ No HDR → Prime Editor (up to ~44bp insert)
```

## Delivery Optimization

| Method | Cargo Capacity | Efficiency | In Vivo? | Best For | Limitation |
|--------|---------------|-----------|---------|----------|-----------|
| **Plasmid** | Unlimited | Moderate | No | Cell culture; easy | Slow; integration risk |
| **mRNA + sgRNA** | N/A | High | Yes (LNP) | Therapeutic; transient | RNA stability; innate immunity |
| **RNP** | N/A | Very High | Limited | Ex vivo; minimal off-target | Protein production cost |
| **AAV** | ~4.7kb | High | Yes | In vivo gene therapy | Size limit; immunogenicity |
| **LNP** | Large | High | Yes | Liver targeting | Organ specificity |
| **Lentivirus** | ~8kb | High | Yes | Stable integration | Integration risk; biosafety |
| **Adenovirus** | ~35kb | High | Yes | Large cargo | Immunogenicity |

### AAV Packaging Strategy for CRISPR

| Component | Size | Strategy |
|-----------|------|----------|
| SpCas9 | 4.1kb | Too large for single AAV with promoter + gRNA |
| SaCas9 | 3.2kb | Fits in single AAV with minimal promoter + gRNA |
| Split-Cas9 | 2× ~2.5kb | Dual AAV; intein-mediated reconstitution |
| ABE/BE | ~5.3kb | Dual AAV or split-intein |
| PE | ~6.3kb | Dual AAV required |

## HDR vs NHEJ Repair Prediction

| Factor | HDR Favored | NHEJ Favored |
|--------|------------|-------------|
| Cell cycle | S/G2 phase | G1 phase |
| Template | ssODN or dsDNA donor | No template |
| Distance from cut | <20bp from DSB | N/A |
| Cell type | Dividing cells | Non-dividing cells |
| Drug | RS-1 (HDR enhancer) | N/A |
| Timing | Synchronized S/G2 | Default pathway |

### HDR Enhancement Strategies

| Strategy | Method | Improvement | Risk |
|----------|--------|------------|------|
| **Cell cycle synchronization** | Thymidine block; nocodazole | 2-5× | Cell toxicity |
| **RS-1** | RAD51 stimulator | 2-3× | Off-target recombination |
| **NHEJ inhibition** | SCR7 (DNA Lig4 inhibitor) | 2-4× | Genomic instability |
| **ssODN orientation** | Sense vs antisense | Variable | Test both |
| **Asymmetric donor** | Longer homology on one side | 2-3× | Design complexity |
| **Cold shock** | 32°C for 24h post-editing | 2-3× | Cell stress |
| **HDR enhancer virus** | AAV6 donor delivery | 5-10× | Viral integration |

## CRISPR Screen Design

### Screen Types

| Type | Library | Readout | Best For | Cost |
|------|---------|---------|----------|------|
| **Pooled knockout** | Genome-wide sgRNA library | Cell viability/growth | Essential genes; drug resistance | Low-Moderate |
| **CRISPRi** | dCas9-KRAB + sgRNA | Gene repression | Essential gene function | Moderate |
| **CRISPRa** | dCas9-VP64/VPR + sgRNA | Gene activation | Gain-of-function; resistance | Moderate |
| **Base editing screen** | ABE/CBE library | Specific mutations | Variant functional annotation | High |
| **Arrayed** | Individual sgRNAs per well | Phenotype per well | Morphological/complex phenotypes | Very High |
| **In vivo screen** | AAV/retroviral library | Tumor growth; metastasis | In vivo gene function | Very High |

### Pooled Screen Pipeline

| Step | Action | Tool | Key Parameter | Common Error |
|------|--------|------|-------------|-------------|
| **1. Library design** | Select sgRNAs per gene | CRISPRko library (Brunello/GeCKO) | 4-6 sgRNAs/gene | Too few sgRNAs/gene |
| **2. Library synthesis** | Oligo pool | Twist Bioscience/Agilent | 100× coverage per sgRNA | Insufficient representation |
| **3. Lentiviral packaging** | Produce virus | HEK293T transfection | MOI ~0.3 | MOI too high (multiple integrations) |
| **4. Transduction** | Infect target cells | Spinfection | 500-1000× coverage | Insufficient coverage |
| **5. Selection** | Puromycin/blasticidin | 3-7 days | Verify >95% transduced | Premature selection |
| **6. Phenotype** | Growth/selection/sorting | 14-21 days | Maintain 500× coverage | Coverage drops below 200× |
| **7. DNA extraction** | Genomic DNA | Kit-based | 6.6µg DNA per 10⁶ cells | Insufficient DNA |
| **8. PCR + sequencing** | Amplify sgRNA region | NGS (Illumina) | 50M reads per sample | PCR bias; over-amplification |
| **9. Analysis** | Count sgRNAs; test enrichment | MAGeCK/MAGeCK-VISPR | FDR < 0.05 | Not normalizing for library bias |
| **10. Validation** | Individual sgRNAs | Western blot; functional assay | 2+ sgRNAs per hit | Not validating screen hits |

### CRISPR Screen Analysis Tools

| Tool | Method | Strengths | Best For |
|------|--------|-----------|----------|
| **MAGeCK** | Negative binomial | Robust; multiple conditions | Standard knockout screens |
| **MAGeCK-VISPR** | Variational inference | Quality control; visualization | Interactive analysis |
| **MAGeCK-Flute** | Pipeline | Integrated QC + analysis | End-to-end workflow |
| **CRISPResso2** | Alignment-based | Amplicon-level editing quantification | Validation experiments |
| **PinAPL-Py** | Web-based | No installation | Quick analysis |
| **CRISPR-SURF** | Statistical | False discovery control | High-confidence hits |
| **BAGEL2** | Bayesian | Essential gene classification | Essential gene screens |
| **CERES** | Copy-number corrected | Reduces CNV artifact | Cancer cell line screens |

## Off-Target Detection Methods

| Method | Type | Sensitivity | Throughput | Best For |
|--------|------|------------|-----------|----------|
| **GUIDE-seq** | Unbiased; dsODN integration | High | Moderate | Comprehensive off-target mapping |
| **CHANGE-seq** | Unbiased; in vitro | Very High | High | Most sensitive; gold standard |
| **CIRCLE-seq** | Unbiased; in vitro | High | High | No cellular context needed |
| **Digenome-seq** | Unbiased; in vitro | Moderate | High | Genome-wide in vitro |
| **DISCOVER-seq** | Unbiased; MRE11 ChIP | Moderate | Moderate | Cellular context |
| **BLESS** | In situ; DSB labeling | Moderate | Moderate | Direct DSB detection |
| **SITE-Seq** | In vitro; sequencing | High | High | Comprehensive screening |
| **Predicted sites only** | Computational | Low | Very High | NOT sufficient for therapeutic |

### Off-Target Assessment Hierarchy

```
Therapeutic CRISPR Safety Assessment
    │
    ├─ Level 1: Computational prediction (REQUIRED but INSUFFICIENT)
    │   └─ Cas-OFFinder, CRISPOR, GuideScan
    │
    ├─ Level 2: Unbiased in vitro detection (REQUIRED for therapeutic)
    │   ├─ CHANGE-seq (most sensitive, recommended)
    │   └─ CIRCLE-seq (alternative)
    │
    ├─ Level 3: Cellular validation (REQUIRED for therapeutic)
    │   ├─ GUIDE-seq (gold standard cellular)
    │   └─ DISCOVER-seq (alternative)
    │
    ├─ Level 4: Amplicon deep sequencing (REQUIRED for detected sites)
    │   └─ CRISPResso2 quantification
    │
    └─ Level 5: Functional consequence assessment
        ├─ Whole genome sequencing (long-term)
        └─ Transcriptome analysis (gene expression changes)
```

## Therapeutic CRISPR Safety Assessment

### Safety Dimension Assessment

| Dimension | Assessment | Method | Threshold | Failure Consequence |
|-----------|-----------|--------|-----------|-------------------|
| **On-target efficiency** | Desired editing rate | Amplicon sequencing | >50% for knockout; >20% for correction | Therapeutic failure |
| **Off-target editing** | Undesired editing rate | CHANGE-seq + amplicon | <0.1% at any site | Genotoxicity |
| **Large deletions** | On-target large del | Long-read sequencing | No >1kb deletions | Gene disruption |
| **Chromosomal rearrangements** | Translocations | CAST-seq, PEM-seq | No detectable rearrangements | Oncogenic risk |
| **p53 activation** | DNA damage response | p53 Western blot | No sustained p53 activation | Selection for p53 mutants |
| **Immune response** | Anti-Cas9 antibodies | ELISA; T-cell assay | No significant immune response | Treatment failure; adverse events |
| **Insertional mutagenesis** | Viral integration | LAM-PCR; WGS | No integration in oncogenes | Oncogenic risk |
| **Mosaicism** | Mixed editing outcomes | Single-cell sequencing | <10% mosaicism (embryonic) | Variable therapeutic effect |

### Therapeutic CRISPR Development Stages

| Stage | Milestone | Required Evidence |
|-------|-----------|-------------------|
| **In vitro** | Editing confirmed in cell culture | Efficiency + specificity + functional readout |
| **Ex vivo** | Patient cells edited | Autologous cells; GMP manufacturing |
| **In vivo (animal)** | Delivery + editing in animal | Biodistribution; off-target; toxicology |
| **Phase I/II** | Safety + preliminary efficacy in humans | Dose escalation; adverse events; biomarker |
| **Phase III** | Efficacy in humans | Randomized; powered; clinical endpoints |
| **Approved** | Regulatory approval | Full safety dossier; long-term follow-up plan |

### CRISPR Therapeutic Landscape (2025-2026)

| Product | Target | Indication | Stage | Editing Type |
|---------|--------|-----------|-------|-------------|
| **Casgevy (exa-cel)** | BCL11A | Sickle cell disease / β-thalassemia | **Approved (UK/US)** | Ex vivo knockout |
| **NTLA-2001** | TTR | Hereditary ATTR amyloidosis | Phase III | In vivo LNP delivery |
| **NTLA-2002** | KLKB1 | Hereditary angioedema | Phase II | In vivo LNP delivery |
| **EDIT-301** | BCL11A | Sickle cell disease | Phase I/II | Ex vivo base editing |
| **BEAM-201** | Multiple | T-cell lymphoma | Phase I | Ex vivo base editing |
| **VERVE-101** | PCSK9 | Heterozygous FH | Phase Ib | In vivo base editing |
| **INT-001** | G6PC | GSD Ia | Preclinical | In vivo AAV delivery |

### CRISPR Design Quality Checklist

| Item | Required | Common Failure |
|------|----------|---------------|
| On-target efficiency score > 0.5 (Rule Set 2) | ✅ | Low editing efficiency |
| Off-target CFD score < 0.2 for all sites | ✅ | Off-target editing |
| GC content 40-70% | ✅ | Poor gRNA stability |
| No poly-T (4+ consecutive T) | ✅ | Premature termination |
| PAM accessible in target region | ✅ | No suitable gRNA |
| CHANGE-seq or GUIDE-seq for therapeutic | ✅ | Inadequate off-target assessment |
| p53 response tested | 🟡 | Selection for p53 mutants |
| Large deletion assessment | 🟡 | Undetected genomic damage |
| Delivery optimization for cell type | ✅ | Poor editing efficiency |
| At least 2 independent gRNAs per target | ✅ | gRNA-specific artifacts |
