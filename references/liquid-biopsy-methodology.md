# Liquid Biopsy Methodology

## ctDNA (Circulating Tumor DNA) Analysis

### ctDNA Detection Methods

| Method | Principle | Sensitivity (VAF) | Cost | Turnaround | Best For |
|--------|-----------|-------------------|------|-----------|----------|
| **ddPCR** | Droplet partitioning + PCR | 0.01-0.1% | Low | 1-2 days | Known mutation monitoring |
| **BEAMing** | Beads + emulsion + PCR + flow cytometry | 0.01% | Moderate | 2-3 days | Known mutation quantification |
| **Targeted NGS** | Amplicon/hybrid capture panel | 0.1-0.5% | Moderate | 7-14 days | Multi-gene panels |
| **Ultra-deep NGS** | Deep sequencing with error suppression | 0.01-0.1% | High | 10-21 days | MRD detection |
| **CAPP-Seq** | Cancer personalized profiling | 0.002% | High | 14-21 days | Lung cancer MRD |
| **Safe-SeqS** | Safe sequencing system | 0.01% | Moderate | 7-14 days | Error-suppressed detection |
| **Duplex sequencing** | Both strands sequenced | 0.001% | Very High | 14-28 days | Ultra-sensitive MRD |
| **WGS (low-pass)** | Genome-wide copy number | 1-5% | Moderate | 7-14 days | CNV detection |
| **WGS (ultra-deep)** | Genome-wide mutations | 0.1% | Very High | 21-28 days | Unbiased discovery |
| **Methylation-based** | cfDNA methylation patterns | 0.1-1% | Moderate | 7-14 days | Tissue of origin; multi-cancer |

### Error Suppression Strategies for Ultra-Sensitive Detection

| Strategy | Principle | Error Rate Reduction | Complexity | Best For |
|----------|-----------|---------------------|-----------|----------|
| **Unique Molecular Identifiers (UMI)** | Tag each molecule before PCR | 10-100× | Moderate | Standard ultra-sensitive |
| **Duplex sequencing** | Sequence both DNA strands | 10,000× | High | Ultra-low VAF detection |
| **Molecular barcoding** | Similar to UMI | 10-100× | Moderate | Standard approach |
| **Consensus sequencing** | Aggregate reads from same molecule | 10-100× | Moderate | Post-sequencing filtering |
| **Computational error suppression** | Machine learning on sequencing errors | 5-50× | Low | Add-on to any method |

### ctDNA Analysis Pipeline

| Step | Action | Tool | Key Parameter | Common Error |
|------|--------|------|-------------|-------------|
| **1. Blood collection** | Streck or EDTA tubes | — | Process within 4h (EDTA) or 72h (Streck) | Delayed processing → WBC lysis |
| **2. Plasma separation** | Double centrifugation | — | 1600g then 16,000g | Incomplete separation |
| **3. cfDNA extraction** | Silica column or magnetic beads | QIAamp, MagMAX | Elute in low volume | Low yield; contamination |
| **4. cfDNA QC** | Fragment analysis | Bioanalyzer, TapeStation | Peak at ~167bp (mononucleosome) | Genomic DNA contamination |
| **5. Library preparation** | UMI-based | Various | Unique molecules > 10,000 | Insufficient complexity |
| **6. Sequencing** | Targeted or WGS | Illumina | Depth depends on method | Insufficient depth for target VAF |
| **7. Alignment** | BWA-MEM | — | MAPQ > 30 | Not filtering low-quality reads |
| **8. UMI deduplication** | Consensus building | fgbio, UMI-tools | Min reads per UMI: 3 | Not using UMIs |
| **9. Variant calling** | Error-suppressed calling | Mutect2, VarDict, VarScan2 | VAF threshold per method | Not applying error suppression |
| **10. Annotation** | Functional annotation | VEP, ANNOVAR | — | Not filtering germline |

### ctDNA Clinical Applications

| Application | Sensitivity Needed | Method | Timing | Evidence Level |
|-------------|-------------------|--------|--------|---------------|
| **Treatment selection** | 0.5-5% VAF | Targeted NGS | At progression | High (guideline-recommended) |
| **MRD detection** | 0.01-0.1% VAF | Ultra-deep NGS/duplex | Post-surgery | Moderate-High |
| **Treatment monitoring** | 0.01-0.5% VAF | ddPCR or targeted NGS | Serial sampling | High (for known mutations) |
| **Early detection** | 0.01-0.1% VAF | Multi-cancer methylation | Screening | Moderate (GRAIL/Galleri) |
| **Resistance detection** | 0.1-1% VAF | Targeted NGS | At progression | High |
| **Tissue of origin** | N/A | Methylation profiling | Diagnosis | Moderate |
| **Immunotherapy prediction** | TMB from ctDNA | WES or large panel | Pre-treatment | Emerging |

## CTC (Circulating Tumor Cell) Analysis

### CTC Isolation Methods

| Method | Principle | Sensitivity | Purity | Viable? | Best For |
|--------|-----------|------------|--------|---------|----------|
| **CellSearch** | EpCAM immunomagnetic | 1 CTC/7.5mL | Moderate | No (fixed) | FDA-cleared; breast/prostate/colorectal |
| **GILUPI CellCollector** | EpCAM in vivo capture | High | Moderate | Yes | In vivo; high volume |
| **CTC-iChip** | Size + inertial + immunomagnetic | High | High | Yes | Negative depletion; EpCAM-independent |
| **Parsortix** | Size-based microfluidic | High | Moderate | Yes | EpCAM-independent; viable cells |
| **ClearCell FX** | Inertial microfluidics | Moderate | Moderate | Yes | Label-free; viable |
| **Vortex HT** | Microfluidic vortex trapping | Moderate | High | Yes | Label-free |
| **MACS** | Magnetic separation | Moderate | Moderate | Yes | Simple; fast |
| **FACS** | Fluorescence-activated sorting | High | High | Yes | Multi-marker; rare cell sorting |
| **DEPArray** | Dielectrophoresis | Very High | Very High | Yes | Single-cell isolation |

### CTC Characterization

| Analysis | Method | Information | Clinical Utility |
|----------|--------|------------|-----------------|
| **Enumeration** | CellSearch count | Prognostic | FDA-cleared for breast/prostate/colorectal |
| **Molecular profiling** | RT-PCR, NGS | Mutations; expression | Treatment selection |
| **Single-cell genomics** | scDNA-seq, scRNA-seq | Heterogeneity | Resistance mechanisms |
| **Protein expression** | IF, flow cytometry | PD-L1, HER2, AR | Targeted therapy selection |
| **Culture (CTC-derived organoids)** | 3D culture | Drug sensitivity | Personalized treatment |
| **Xenograft (CDX)** | Mouse implantation | Drug response in vivo | Preclinical modeling |

## Exosome Analysis

### Exosome Isolation Methods

| Method | Principle | Yield | Purity | Cost | Best For |
|--------|-----------|-------|--------|------|----------|
| **Ultracentrifugation** | Density | High | Moderate | Low | Standard; large volume |
| **Density gradient** | Sucrose/iodixanol gradient | Moderate | High | Moderate | High purity |
| **SEC (size exclusion)** | Column chromatography | Moderate | High | Moderate | Clinical-grade purity |
| **Polymer precipitation** | PEG precipitation | High | Low | Very Low | Quick screening |
| **Immunoaffinity** | Antibody capture (CD63/CD81/CD9) | Low | Very High | High | Specific subpopulation |
| **Microfluidics** | Chip-based capture | Low | High | Moderate | Point-of-care |
| **ExoQuick** | Polymer-based | High | Low | Low | Quick; research |

### Exosome Cargo Analysis

| Cargo | Method | Clinical Application | Challenge |
|-------|--------|---------------------|-----------|
| **miRNA** | Small RNA-seq; RT-qPCR | Cancer detection; monitoring | Normalization; reference |
| **mRNA** | RNA-seq | Gene expression profiling | Low abundance; degradation |
| **lncRNA** | RNA-seq; RT-qPCR | Cancer biomarker | Low abundance |
| **DNA (mutations)** | NGS | Mutation detection | Low mutant allele fraction |
| **Protein** | Mass spec; Western blot | Biomarker; functional | Complex; low throughput |
| **Lipid** | Lipidomics | Membrane composition | Technical complexity |

## cfDNA Fragmentomics

### Fragmentation Patterns as Biomarkers

| Feature | Cancer Signal | Method | Sensitivity | Specificity |
|---------|-------------|--------|------------|------------|
| **Fragment size** | Shorter fragments (~100-150bp) | Bioanalyzer; sequencing | Moderate | Moderate |
| **Fragment end motifs** | Altered nucleotide preferences | Sequencing | Moderate | Moderate |
| **Nucleosome positioning** | Altered positioning at TSS | Deep sequencing | Moderate | High |
| **Junctional diversity** | More diverse breakpoints | Sequencing | Moderate | Moderate |
| **5' end motif** | CCA/CCG enrichment in cancer | Sequencing | Moderate | Moderate |
| **Fragmentomics + methylation** | Combined signal | Sequencing | High | High |

### cfDNA Fragment Size Analysis

| Fragment Size | Origin | Cancer Enrichment |
|--------------|--------|-------------------|
| **90-150bp** | Mononucleosome (tumor-derived) | Enriched in cancer |
| **150-180bp** | Mononucleosome (normal) | Both |
| **180-320bp** | Dinucleosome | Both |
| **320-500bp** | Trinucleosome | Normal enriched |
| **>500bp** | Necrotic / non-nucleosomal | Variable |

## Multi-Analyte Liquid Biopsy

### Combined Biomarker Strategy

| Combination | Analytes | Sensitivity | Specificity | Application |
|-------------|---------|------------|------------|-------------|
| **ctDNA + CTC** | DNA mutations + cell count | Higher than either alone | Moderate | Comprehensive monitoring |
| **ctDNA + protein** | Mutations + CA125/CEA/PSA | Higher than ctDNA alone | Higher | Cancer detection |
| **ctDNA + methylation** | Mutations + methylation | Higher than either alone | Higher | Multi-cancer detection |
| **ctDNA + exosome** | Mutations + exoRNA/protein | Higher than ctDNA alone | Higher | Comprehensive profiling |
| **ctDNA + fragmentomics** | Mutations + fragmentation | Higher than ctDNA alone | Higher | Enhanced detection |
| **All combined** | ctDNA + CTC + exosome + protein | Highest | Highest | Multi-cancer early detection |

## MRD (Minimal Residual Disease) Monitoring

### MRD Detection by Cancer Type

| Cancer | Tissue Source | Method | Sensitivity | Clinical Evidence | Guideline |
|--------|-------------|--------|------------|-------------------|-----------|
| **Colorectal (Stage II/III)** | Plasma ctDNA | Ultra-deep NGS | 0.01% VAF | DYNAMIC trial; GALAXY cohort | Emerging |
| **Lung (NSCLC)** | Plasma ctDNA | CAPP-Seq | 0.002% VAF | TRACERx; MERMAID | Emerging |
| **Breast** | Plasma ctDNA | Targeted NGS | 0.01% VAF | c-TRAK TN; IMPACT | Emerging |
| **AML** | BM aspirate | NGS (clonoSEQ) | 10⁻⁶ | Multiple trials | NCCN recommended |
| **CLL** | BM or blood | NGS (clonoSEQ) | 10⁻⁵ | Multiple trials | NCCN recommended |
| **Multiple myeloma** | BM aspirate | NGF (next-gen flow) | 10⁻⁵ | Multiple trials | Recommended |

### ctDNA MRD Clinical Decision Framework

| MRD Status | Post-Surgery | Action | Evidence |
|-----------|-------------|--------|---------|
| **ctDNA positive** | Detectable | Consider adjuvant therapy | DYNAMIC: ctDNA+ → chemo benefit |
| **ctDNA negative** | Undetectable | May omit adjuvant therapy | DYNAMIC: ctDNA- → no chemo benefit |
| **ctDNA conversion** | Positive → Negative | Response to therapy | Serial monitoring |
| **ctDNA rising** | Increasing VAF | Disease progression | Lead time ~3-6 months before imaging |

## Early Cancer Detection (Multi-Cancer Early Detection — MCED)

### MCED Tests

| Test | Company | Method | Cancers Detected | Sensitivity | Specificity | Stage |
|------|---------|--------|-----------------|------------|------------|-------|
| **Galleri** | GRAIL/Exact Sciences | Methylation + fragmentomics | 50+ | ~40% (Stage I) to ~90% (Stage IV) | 99.5% | Available (LDT) |
| **CancerSEEK** | Johns Hopkins | Protein + ctDNA mutation | 8 | ~40-70% (Stage I-III) | >99% | Research |
| **Detector** | Delphi Diagnostics | Methylation | Multiple | — | — | Development |
| **OverC** | Burning Rock | Methylation | Multiple | — | — | Available (China) |

### MCED Performance Metrics

| Metric | Definition | Target | Challenge |
|--------|-----------|--------|-----------|
| **Sensitivity** | True positive rate | >50% for Stage I | Low ctDNA shed in early stage |
| **Specificity** | True negative rate | >99% | False positives = anxiety + procedures |
| **PPV** | Positive predictive value | Depends on prevalence | Low in general population |
| **NPV** | Negative predictive value | >99.9% | High in low-prevalence setting |
| **Tissue of origin accuracy** | Correct cancer type prediction | >80% | Shared methylation patterns |
| **Stage shift** | Earlier detection → earlier stage | Demonstrate in RCT | PATHFINDER; NHS-Galleri |

## Liquid Biopsy in Prenatal Testing (NIPT)

| Application | Method | Sensitivity | Clinical Use |
|-------------|--------|------------|-------------|
| **Trisomy 21** | Low-pass WGS | >99% | Standard of care |
| **Trisomy 18** | Low-pass WGS | >97% | Standard of care |
| **Trisomy 13** | Low-pass WGS | >90% | Standard of care |
| **Sex chromosome aneuploidy** | Low-pass WGS | ~90% | Offered |
| **Microdeletion** | Low-pass WGS | Variable | Emerging |
| **Single-gene disorder** | Targeted NGS | Variable | Research/emerging |
| **Fetal fraction** | WGS quantification | >4% required | QC metric |

## Liquid Biopsy Quality Checklist

| Item | Required | Common Failure |
|------|----------|---------------|
| Blood collection tube appropriate (Streck/EDTA) | ✅ | Wrong tube → WBC lysis contamination |
| Processing within time window | ✅ | Delayed processing |
| Double centrifugation for plasma | ✅ | Cellular contamination |
| cfDNA fragment analysis (peak ~167bp) | ✅ | Genomic DNA contamination |
| UMI-based library preparation | ✅ | PCR duplicates not removed |
| Sufficient unique molecules (>10,000) | ✅ | Low complexity library |
| Matched normal (WBC) for germline filtering | ✅ | Germline variants misidentified as somatic |
| Appropriate VAF threshold for method | ✅ | Overcalling artifacts |
| Biological replicates for MRD | ✅ | Single timepoint |
| Orthogonal validation for clinical decisions | ✅ | Single method only |

---

## CTC (Circulating Tumor Cell) Analysis

### CTC Isolation Methods

| Method | Principle | Sensitivity | Purity | Throughput | Clinical Use |
|--------|-----------|------------|--------|-----------|-------------|
| **CellSearch** | EpCAM immunomagnetic | 1 CTC/7.5mL blood | Moderate | Low | FDA-cleared (metastatic breast, prostate, CRC) |
| **GILUPI CellCollector** | EpCAM in vivo capture | Higher than CellSearch | Moderate | In vivo | CE-marked |
| **CTC-iChip** | Inertial + magnetophoretic | High | Moderate | Moderate | Research |
| **Parsortix** | Size-based microfluidic | High | Moderate | Moderate | CE-marked |
| **ClearCell FX** | Inertial focusing | High | Low | High | Research |
| **HB-Chip** | Herringbone microfluidic | High | Moderate | Moderate | Research |
| **Vortex HT** | Vortex trapping | High | Moderate | High | Research |
| **Negative depletion** | CD45 depletion | Captures EpCAM- CTCs | Variable | Moderate | Research |

### CTC Molecular Characterization

| Application | Method | Clinical Value | Challenge |
|-------------|--------|---------------|-----------|
| **Single-cell sequencing** | WGA + WES/RNA-seq | Tumor heterogeneity; resistance | WGA bias; low coverage |
| **Protein expression** | IF; flow cytometry | PD-L1; AR-V7; HER2 | Limited antibodies; fixation |
| **FISH** | FISH on CTCs | Gene amplification; translocation | Low cell number |
| **Culture (CTC-derived organoids)** | 3D culture | Drug sensitivity testing | Very low success rate (<10%) |
| **Xenograft (CDX)** | Implant in NSG mice | In vivo drug testing | Very low take rate; months |

### CTC Clinical Applications

| Cancer | CTC Count Threshold | Prognostic Value | FDA Status |
|--------|-------------------|-----------------|-----------|
| **Metastatic breast** | ≥5 CTCs/7.5mL | Shorter PFS and OS | FDA cleared |
| **Metastatic prostate** | ≥5 CTCs/7.5mL | Shorter OS | FDA cleared |
| **Metastatic CRC** | ≥3 CTCs/7.5mL | Shorter PFS and OS | FDA cleared |
| **SCLC** | Varies | Prognostic | Not cleared |
| **NSCLC** | Varies | Prognostic | Not cleared |

**Rule**: CellSearch captures ONLY EpCAM+ CTCs. Epithelial-to-mesenchymal transition (EMT) causes EpCAM downregulation, so CellSearch MISSES mesenchymal CTCs that may be the most clinically relevant.
**Rule**: CTC count is PROGNOSTIC but NOT PREDICTIVE. High CTC count = worse prognosis, but it does NOT tell you which treatment will work.
**Rule**: Single-CTC sequencing has HIGH TECHNICAL VARIABILITY due to whole-genome amplification bias. Results should be interpreted with caution and validated with orthogonal methods.

---

## Exosome & Extracellular Vesicle Analysis

### Exosome Isolation Methods

| Method | Principle | Yield | Purity | Time | Cost | Best For |
|--------|-----------|-------|--------|------|------|----------|
| **Ultracentrifugation** | Density + centrifugal force | High | Low-Moderate | 3-4h | Low | Large-scale; standard |
| **Density gradient** | Sucrose/iodixanol gradient | Moderate | High | 16-24h | Moderate | High-purity research |
| **SEC (size exclusion)** | Column-based size separation | Moderate | High | <1h | Moderate | Clinical; high purity |
| **Polymer precipitation** | PEG-based | High | Low | <1h | Low | Quick screening |
| **Immunoaffinity** | Antibody capture (CD63, CD81) | Low | Very High | 2-3h | High | Specific subpopulations |
| **Microfluidics** | Size + immunoaffinity | Low | High | <1h | Moderate | Point-of-care |
| **ExoQuick** | Polymer-based | High | Low | <1h | Moderate | Quick but impure |

### Exosome Cargo Analysis

| Cargo | Method | Clinical Application | Sensitivity Challenge |
|-------|--------|---------------------|----------------------|
| **miRNA** | Small RNA-seq; qPCR panels | Cancer detection; treatment response | Low abundance; normalization |
| **mRNA** | RNA-seq; RT-qPCR | Gene expression profiling | Degraded RNA |
| **lncRNA** | RNA-seq; qPCR | Cancer biomarker | Low abundance |
| **Circulating DNA** | qPCR; NGS | Mutation detection | Low quantity |
| **Protein** | Mass spec; ELISA; Western | Biomarker; drug target | Dynamic range |
| **Lipid** | Lipidomics | Cancer metabolic signature | Standardization |
| **Double-stranded DNA** | WGS; targeted NGS | Mutational profiling | Low quantity; fragmentation |

### Exosome Biomarker Performance

| Cancer | Biomarker | Sensitivity | Specificity | AUC | Sample Size |
|--------|-----------|------------|------------|-----|-------------|
| **Pancreatic** | GPC1+ exosomes | 100% (early stage) | — | — | Small (N=32) |
| **Prostate** | Exosomal PCA3/ERG | 70-90% | 70-90% | ~0.85 | Moderate |
| **Glioblastoma** | EGFRvIII in exosomes | 50-70% | 90%+ | ~0.80 | Small |
| **CRC** | Exosomal miR-21/miR-1246 | 70-85% | 70-85% | ~0.82 | Moderate |
| **NSCLC** | Exosomal PD-L1 | 60-75% | 70-85% | ~0.78 | Small |

**Rule**: Exosome isolation method MATTERS. Ultracentrifugation co-isolates lipoproteins and protein aggregates. SEC provides higher purity but lower yield. Always report isolation method and characterize by NTA, TEM, and Western blot (CD63/CD81/TSG101).
**Rule**: Exosomal RNA is HIGHLY FRAGMENTED and LOW ABUNDANCE. Standard RNA-seq library preparation may fail. Use exosome-specific protocols with spike-in controls.
**Rule**: Exosome biomarker studies are overwhelmingly SMALL and RETROSPECTIVE. No exosome biomarker has achieved regulatory approval. Large prospective validation studies are needed.

---

## Fragmentomics — Cell-Free DNA Fragment Patterns

### Fragmentomics Features

| Feature | Principle | Cancer Signal | Detection Method | Clinical Potential |
|---------|-----------|--------------|-----------------|-------------------|
| **Fragment size** | cfDNA ~167bp (nucleosomal); ctDNA shorter | Shorter fragments enriched for ctDNA | Bioanalyzer; sequencing size distribution | Cancer detection; enrichment |
| **End motif** | Nuclease cleavage preferences | C-end enrichment in cancer | Sequencing read start/end analysis | Cancer detection |
| **Jagged ends** | Asymmetric cleavage | More jagged ends in cancer | Uracil-DNA glycosylase treatment | Cancer detection |
| **Nucleosome positioning** | cfDNA maps nucleosomes | Altered positioning in cancer | cfDNA coverage patterns | Tissue of origin |
| **Fragmentation profile (DELFI)** | Genome-wide coverage pattern | Abnormal coverage in cancer | Low-pass WGS + ML | Multi-cancer detection |
| **5-hmC** | Hydroxymethylation in cfDNA | Tissue-specific; cancer-altered | hMeDIP-seq; oxBS-seq | Cancer detection; tissue origin |

### DELFI (DNA Evaluation of Fragments for early Interception)

| Parameter | Performance | Note |
|-----------|------------|------|
| **Sensitivity (all stages)** | 73% | Low-pass WGS + ML |
| **Specificity** | 98% | Healthy controls |
| **Stage I sensitivity** | ~50% | Needs improvement |
| **Stage IV sensitivity** | >90% | High |
| **Tissue of origin** | ~75% | Moderate accuracy |

**Rule**: Fragmentomics is a COMPLEMENTARY signal to mutation and methylation for liquid biopsy. Combining fragmentomics + methylation + mutations significantly improves sensitivity over any single analyte.
**Rule**: cfDNA fragment size analysis is the SIMPLEST fragmentomics method and should be STANDARD QC for any ctDNA study. A shift toward shorter fragments indicates ctDNA presence.
**Rule**: DELFI and similar genome-wide fragmentation approaches require LOW-PASS WGS (~0.5-1×), making them cost-effective for population screening, but sensitivity for Stage I cancer remains a challenge.

---

## Multi-Analyte Liquid Biopsy Integration

### Multi-Analyte Strategy

| Analyte | Signal Type | Sensitivity | Complementarity | Cost |
|---------|-----------|------------|----------------|------|
| **ctDNA mutations** | Genomic | VAF 0.01-0.5% | Tumor-specific mutations | High |
| **ctDNA methylation** | Epigenomic | VAF 0.1-1% | Tissue of origin | Moderate |
| **Fragmentomics** | Physical | Low (genome-wide) | Complementary signal | Low (low-pass WGS) |
| **CTC** | Cellular | 1/7.5mL | Morphology; protein | Moderate |
| **Exosome** | Vesicular | Variable | RNA; protein cargo | Moderate |
| **Protein biomarkers** | Proteomic | Variable | Complementary; functional | Low |

### Integration Model Performance

| Study | Analytes Combined | Cancer | Sensitivity | Specificity | AUC |
|-------|-------------------|--------|------------|------------|-----|
| **CancerSEEK** | ctDNA + protein (8 cancers) | Multi-cancer | 70% (Stage II) | >99% | ~0.91 |
| **Galleri** | Methylation + fragmentomics | 50+ cancers | ~40% (Stage I) | 99.5% | — |
| **DELFI + mutation** | Fragmentomics + ctDNA | Multi-cancer | ~80% | 98% | ~0.92 |
| **CancerSEEK + imaging** | ctDNA + protein + CT | Lung + ovary | ~90%+ | >99% | — |

**Rule**: No single liquid biopsy analyte achieves >50% sensitivity for Stage I cancer. Multi-analyte integration is ESSENTIAL for early detection.
**Rule**: The PPV of any MCED test in a general population is LOW (<10%) because cancer prevalence is low. A positive MCED test requires confirmatory imaging, and most positive results will be false positives.
**Rule**: Tissue of origin prediction is CRITICAL for MCED tests. A positive test without knowing WHERE the cancer is has limited clinical utility.
