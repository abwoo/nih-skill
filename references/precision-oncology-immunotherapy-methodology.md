# Precision Oncology, Immunotherapy & Protein Design Methodology

## Precision Oncology — Molecular-Guided Treatment

### Precision Oncology Decision Framework

| Step | Action | Data Required | Tool/Database |
|------|--------|--------------|---------------|
| 1 | Tumor molecular profiling | WES/WGS, RNA-seq, IHC | MSK-IMPACT, FoundationOne |
| 2 | Identify actionable mutations | SNV, CNV, fusion, MSI, TMB | OncoKB, CIViC, COSMIC |
| 3 | Match to FDA-approved therapies | Drug-gene evidence levels | OncoKB, NCCN Guidelines |
| 4 | Identify clinical trial eligibility | Molecular criteria, geography | ClinicalTrials.gov, MatchMiner |
| 5 | Assess resistance mechanisms | Prior treatment, resistance mutations | OncoKB resistance notes |
| 6 | Generate treatment recommendation | Evidence-ranked options | Multi-source integration |

### Cancer Variant Interpretation — Evidence Levels

| Level | Evidence | Actionability | Example |
|-------|----------|--------------|---------|
| **Level 1** | FDA-approved drug for this indication | Standard of care | EGFR L858R → Osimertinib (NSCLC) |
| **Level 2** | FDA-approved drug for another indication; NCCN guideline | Standard option (off-label) | BRAF V600E → Vemurafenib (NSCLC, approved for melanoma) |
| **Level 3** | Clinical trial evidence | Clinical trial enrollment | KRAS G12C → Sotorasib (clinical trial) |
| **Level 4** | Preclinical evidence | Investigational | TP53 mutation → experimental therapies |
| **Level R** | Resistance mutation | Avoid this drug | EGFR T790M → resistance to first-gen TKIs |

### Key Actionable Mutations by Cancer Type

| Cancer | Actionable Mutation | Frequency | FDA-Approved Drug | Resistance |
|--------|-------------------|-----------|-------------------|-----------|
| **NSCLC** | EGFR L858R/ex19del | 15% (Western), 40% (Asian) | Osimertinib | T790M, C797S |
| **NSCLC** | ALK rearrangement | 5% | Alectinib, Lorlatinib | L1196M, G1202R |
| **NSCLC** | KRAS G12C | 13% | Sotorasib, Adagrasib | Secondary KRAS mutations |
| **Melanoma** | BRAF V600E | 50% | Dabrafenib + Trametinib | MEK reactivation |
| **Breast** | HER2 amplification | 20% | Trastuzumab + Pertuzumab | PI3K activation |
| **Breast** | ESR1 mutation | 30% (AI-resistant) | Fulvestrant, Elacestrant | Ligand-independent activation |
| **CRC** | KRAS wild-type + EGFR | 60% | Cetuximab, Panitumumab | KRAS mutation emergence |
| **CML** | BCR-ABL fusion | 95% | Imatinib, Dasatinib | T315I |
| **Ovarian** | BRCA1/2 mutation | 15% germline | Olaparib, Rucaparib | BRCA reversion |
| **Prostate** | AR amplification/mutation | 50% (CRPC) | Enzalutamide, Abiraterone | AR-V7 splice variant |

**Rule**: A "precision oncology" recommendation without evidence level assignment is INCOMPLETE. Always specify OncoKB/AMP level.
**Rule**: Resistance mutations MUST be checked before recommending targeted therapy. EGFR T790M + first-gen TKI = treatment failure.
**Rule**: Tumor mutational burden (TMB) and MSI status are INDEPENDENT predictive biomarkers for immunotherapy, not just byproducts of mutation profiling.

---

## Immunotherapy Response Prediction

### Multi-Biomarker Immunotherapy Prediction

| Biomarker | Method | Predictive Value | Limitation |
|-----------|--------|-----------------|-----------|
| **TMB** (Tumor Mutational Burden) | WES; ≥10 mut/Mb | High TMB → better ICI response | Threshold varies by cancer; assay-dependent |
| **MSI-H/dMMR** | IHC, PCR, NGS | Strong predictor of ICI response | Only ~15% of cancers are MSI-H |
| **PD-L1** | IHC (22C3, SP263, SP142) | Higher TPS → better response | Inconsistent across assays; dynamic expression |
| **TIL signatures** | Gene expression (GEP) | Inflamed TME → better response | Heterogeneous within tumor |
| **HLA typing** | NGS | HLA diversity → neoantigen presentation | Complex; not yet standard |
| **Gut microbiome** | 16S rRNA, metagenomics | Certain taxa → better response | Not clinically validated |
| **Peripheral blood** | NLR, LDH, ctDNA dynamics | Low NLR, declining ctDNA → better response | Supportive, not standalone |

### Immunotherapy Response Prediction Model Assessment

| Assessment | Key Question | Required Evidence | Red Flag |
|-----------|-------------|-------------------|---------|
| **Biomarker validation** | Is the biomarker independently validated? | Multi-cohort; prospective | Single retrospective cohort |
| **Clinical utility** | Does the prediction change clinical decisions? | Interventional study | Prediction without actionability |
| **Assay standardization** | Is the measurement reproducible? | Inter-laboratory concordance | No standardized assay |
| **Population specificity** | Does it work across cancer types? | Pan-cancer validation | Only tested in melanoma |
| **Combination prediction** | Can it predict combination therapy response? | Combination ICI data | Only monotherapy data |

**Rule**: No single biomarker reliably predicts immunotherapy response for ALL patients. Multi-biomarker integration (TMB + PD-L1 + TIL + HLA) is the current best practice.
**Rule**: PD-L1 IHC is the MOST CONTROVERSIAL immunotherapy biomarker — different assays (22C3, SP263, SP142) give different results, and PD-L1 expression is DYNAMIC and HETEROGENEOUS within tumors.
**Rule**: MSI-H is the STRONGEST single predictor of ICI response (FDA tissue-agnostic approval), but only applies to ~15% of cancers. For MSS tumors, TMB and TIL signatures are more relevant.

---

## Antibody Engineering & Therapeutic Design

### Antibody Engineering Pipeline

| Stage | Goal | Method | Key Metric | Failure Mode |
|-------|------|--------|-----------|-------------|
| **Discovery** | Identify binding antibody | Phage display; single B-cell; immunization | Affinity (KD < 10 nM) | No binders found |
| **Humanization** | Reduce immunogenicity | CDR grafting; resurfacing; deimmunization | Human content >90% | Loss of affinity |
| **Affinity maturation** | Improve binding | Error-prone PCR; chain shuffling; yeast display | KD improvement >10× | Specificity loss |
| **Developability** | Ensure manufacturability | Aggregation prediction; stability; expression | Tm > 65°C; expression > 1 g/L | Aggregation; low expression |
| **Immunogenicity** | Predict immune response | T-cell epitope prediction; in vitro assays | Low T-cell activation | Anti-drug antibodies (ADA) |
| **Fc engineering** | Optimize effector function | Fc mutations; glycoengineering; isotype switching | ADCC/CDC activity | Unwanted effector function |

### Antibody Developability Assessment

| Property | Assessment | Acceptable | Tool |
|----------|-----------|-----------|------|
| **Aggregation propensity** | SAP score; AC-SINS | Low SAP; <20% aggregation | Therapeutic Antibability Profiler |
| **Chemical liability** | Deamidation, oxidation, isomerization hotspots | No critical liabilities | Liability scanning |
| **Hydrophobicity** | Fv charge; hydrophobic patch | Fv pI 6-9; low hydrophobicity | CamSol, Spatial Aggregation Propensity |
| **Stability** | Tm, Tagg | Tm > 65°C | DSC, nanoDSF |
| **Expression** | Titer in CHO | > 1 g/L | Lab measurement |
| **Polyspecificity** | PSR, baculovirus assay | Low polyspecificity | ELISA-based assays |
| **Immunogenicity** | T-cell epitope content | Minimal epitopes | EpiMatrix, iTope |

### AI-Guided Antibody Design (2025-2026)

| Method | Input | Output | Innovation Level |
|--------|-------|--------|-----------------|
| **RFdiffusion** | Target structure | De novo binder backbone | L4 (paradigm shift) |
| **ProteinMPNN** | Backbone structure | Optimized sequence | L3 (methodological advance) |
| **ESM-2/ESMFold** | Sequence | Structure prediction | L3 (AlphaFold-class) |
| **AbLang/AbBERT** | Antibody sequences | CDR representation | L2 (application) |
| **IgLM** | Partial sequence | CDR completion/generation | L2-L3 |

**Rule**: Antibody humanization is NOT just CDR grafting. Vernier zone residues (framework residues that support CDR conformation) must also be considered. Naive CDR grafting often DESTROYS affinity.
**Rule**: Developability assessment MUST be performed before clinical development. An antibody with high affinity but poor developability (aggregation, low expression, high immunogenicity) will FAIL in manufacturing.
**Rule**: AI-designed antibodies (RFdiffusion + ProteinMPNN) are a genuine L4 innovation but have NOT yet reached clinical proof-of-concept. They are at the computational/preclinical stage.

---

## Immune Repertoire Analysis

### TCR/BCR Repertoire Analysis Pipeline

| Step | Method | Output | Key Metric |
|------|--------|--------|-----------|
| **Sequencing** | 5' RACE; multiplex PCR; single-cell V(D)J | Raw reads | Read depth; coverage |
| **Alignment** | MiXCR, IgBlast, IMGT/HighV-QUEST | V/D/J gene assignments | Alignment rate >90% |
| **Clonotype definition** | CDR3 amino acid sequence | Clone frequency table | Clonotype count |
| **Diversity analysis** | Shannon entropy; Simpson; Hill numbers | Diversity indices | Clonality (1 - normalized entropy) |
| **V/J gene usage** | Frequency tables; differential usage | Gene usage bias | Statistical significance |
| **Clonal expansion** | Frequency ranking; Gini coefficient | Expanded clones | Top clone frequency |
| **Somatic hypermutation** | Mutation count from germline | Mutation rate | SHM rate per clone |
| **Antigen specificity** | GLIPH2; TCRdist; deep learning models | Specificity groups | Prediction accuracy |

### Repertoire Biomarkers for Immunotherapy

| Biomarker | Measurement | Predictive Value | Clinical Stage |
|-----------|------------|-----------------|---------------|
| **Clonal expansion** | Top clone frequency | Expanded clones → ICI response | Research |
| **Diversity** | Shannon entropy | High diversity pre-treatment → better response | Research |
| **Convergence** | Multiple TCRs for same epitope | High convergence → robust immunity | Research |
| **Public clones** | Shared TCRs across patients | Present in responders | Research |
| **BCR class switching** | IgG/IgA ratio | Class-switched → active immune response | Research |

**Rule**: Immune repertoire analysis for immunotherapy prediction is still at V1-V2 (research/observational). No repertoire biomarker has been validated in a prospective interventional trial.
**Rule**: TCR sequencing depth MATTERS. Low depth (<100K reads) misses rare clones. Minimum 500K-1M reads for meaningful diversity estimates.
**Rule**: "Public" TCRs (shared across individuals) are RARE (<5% of repertoire). Most TCRs are PRIVATE. Claims of "universal" TCR biomarkers require extraordinary evidence.

---

## Protein Therapeutic Design — De Novo Methods

### De Novo Protein Design Pipeline

| Stage | Method | Tool | Input | Output |
|-------|--------|------|-------|--------|
| **Structure definition** | Target analysis | PyMOL, DSSP | Target PDB | Binding site definition |
| **Backbone design** | Diffusion-based | RFdiffusion | Target + constraints | Binder backbone |
| **Sequence design** | Inverse folding | ProteinMPNN, LigandMPNN | Backbone | Optimized sequence |
| **Structure prediction** | Folding | AlphaFold2, ESMFold | Sequence | Predicted structure |
| **Binding assessment** | Docking + scoring | Rosetta, AF2-multimer | Complex | Binding energy |
| **Optimization** | Iterative redesign | RFdiffusion + MPNN loop | Scored designs | Improved designs |
| **Experimental validation** | Expression + binding | Lab | DNA | Affinity, specificity |

### Protein Design Assessment Framework

| Assessment | Key Question | Required Evidence | Red Flag |
|-----------|-------------|-------------------|---------|
| **Novelty** | Is this a genuinely new protein? | No sequence homolog in PDB/UniProt | Close homolog exists |
| **Foldability** | Will it fold as designed? | AF2 pLDDT > 80; RMSD < 2Å to design | Low pLDDT; high RMSD |
| **Binding** | Does it bind the target? | SPR/BLI KD < 100 nM | No experimental binding data |
| **Specificity** | Does it bind ONLY the target? | Cross-reactivity panel | Binds off-target |
| **Stability** | Is it thermally stable? | Tm > 65°C; no aggregation | Low Tm; aggregates |
| **Expressibility** | Can it be produced? | Yield > 10 mg/L in E. coli or CHO | Low yield; inclusion bodies |

**Rule**: RFdiffusion + ProteinMPNN is the current SOTA for de novo protein design (Baker Lab, Nature 2023-2025). But computational design ≠ experimental success. Only ~10-50% of designed proteins bind as predicted.
**Rule**: AlphaFold2 pLDDT is a PREDICTION of confidence, NOT a guarantee of correct folding. Experimentally determined structures (X-ray, cryo-EM) remain the gold standard.
**Rule**: De novo designed proteins have NO evolutionary optimization. They may have hidden liabilities (aggregation, protease sensitivity, immunogenicity) that natural proteins have evolved to avoid.

---

## CAR-T Cell Therapy Design

### CAR-T Design Pipeline

| Component | Design Decision | Options | Key Trade-off | Current Best Practice |
|-----------|----------------|---------|---------------|----------------------|
| **ScFv** | Antigen-binding domain | Murine, humanized, fully human | Immunogenicity vs affinity | Humanized or fully human |
| **Hinge** | Flexibility + length | CD8α, IgG4, CD28 | Length vs rigidity | IgG4 Fc for most targets |
| **Transmembrane** | Stability | CD8α, CD28 | Dimerization | CD8α (most common) |
| **Costimulatory** | Signal 2 | CD28, 4-1BB (CD137) | Persistence vs potency | 4-1BB for persistence; CD28 for potency |
| **Signal domain** | Activation | CD3ζ | ITAM number | CD3ζ (standard) |
| **Safety switch** | Emergency elimination | iCasp9, EGFRt, RQR8 | Safety vs complexity | iCasp9 (clinically validated) |

### CAR-T Product Comparison (FDA-Approved)

| Product | Target | Indication | Costim | Response Rate (CR) | Key Toxicity | Manufacturing |
|---------|--------|-----------|--------|-------------------|-------------|---------------|
| **Tisagenlecleucel** | CD19 | B-ALL, DLBCL | 4-1BB | 81% (B-ALL); 40% (DLBCL) | CRS, ICANS | Autologous; 22 days |
| **Axicabtagene ciloleucel** | CD19 | DLBCL, FL | CD28 | 54% (DLBCL); 80% (FL) | CRS, ICANS | Autologous; 17 days |
| **Brexucabtagene autoleucel** | CD19 | MCL | CD28 | 68% (MCL) | CRS, ICANS | Autologous |
| **Lisocabtagene maraleucel** | CD19 | DLBCL | 4-1BB | 53% (DLBCL) | CRS, ICANS | Autologous |
| **Idecabtagene vicleucel** | BCMA | Multiple myeloma | 4-1BB | 33% (MM; sCR) | CRS, ICANS | Autologous |
| **Ciltacabtagene autoleucel** | BCMA | Multiple myeloma | 4-1BB | 43% (MM; sCR) | CRS, ICANS, parkinsonism | Autologous |
| **Tebentafusp** | gp100-HLA-A*02:01 | Uveal melanoma | — (TCR-based) | 1-year OS 73% | CRS, skin reactions | Off-the-shelf |

### CAR-T Toxicity Management

| Toxicity | Grading | First-line | Second-line | Monitoring |
|----------|---------|-----------|-------------|-----------|
| **CRS Grade 1** | Fever ≥38°C | Supportive; antipyretics | — | Q6h vitals |
| **CRS Grade 2** | Hypotension responsive to fluids; hypoxia <40% O2 | Tocilizumab 8mg/kg | Second dose tocilizumab | Q4h vitals; cytokines |
| **CRS Grade 3** | Hypotension requiring vasopressors; hypoxia ≥40% O2 | Tocilizumab + steroids | Siltuximab; anakinra | ICU; continuous monitoring |
| **CRS Grade 4** | Life-threatening | Tocilizumab + high-dose steroids | Escalate immunosuppression | ICU |
| **ICANS Grade 1** | Grade 1 encephalopathy | Supportive | — | ICE score Q12h |
| **ICANS Grade 2** | Grade 2 encephalopathy | Tocilizumab (if CRS) + dexamethasone | Escalate steroids | ICE score Q6h |
| **ICANS Grade 3-4** | Severe; cerebral edema | High-dose steroids; anakinra | Anti-IL-1; neurology consult | ICU; MRI; EEG |

### Next-Generation CAR-T Strategies

| Strategy | Approach | Advantage | Challenge | Clinical Stage |
|----------|----------|-----------|----------|---------------|
| **Allogeneic (off-the-shelf)** | Donor-derived; gene-edited | Immediate availability; scalable | GvHD; rejection | Phase I/II |
| **Dual-target CAR** | Two antigens (e.g., CD19+CD22) | Reduce antigen escape | Complex manufacturing | Phase I/II |
| **Armored CAR** | Secrete cytokines (IL-12, IL-15) | Overcome immunosuppressive TME | Toxicity risk | Phase I |
| **Logic-gated CAR** | AND/NOT gate | Tumor specificity; reduce off-target | Engineering complexity | Preclinical |
| **TRUCK (T-cell redirected for Universal Cytokine Killing)** | CAR + inducible cytokine | Enhanced TME modulation | Safety | Phase I |
| **CAR-NK** | NK cells with CAR | No GvHD; off-the-shelf potential | Short persistence | Phase I/II |
| **CAR-γδ T** | γδ T cells with CAR | MHC-independent; solid tumor potential | Limited expansion | Preclinical |

**Rule**: CAR-T therapy for SOLID TUMORS has NOT achieved the success seen in hematological malignancies. Key barriers: antigen heterogeneity, immunosuppressive TME, T-cell trafficking, and on-target off-tumor toxicity.
**Rule**: Antigen escape (loss of CD19 after CD19 CAR-T) is the MOST COMMON cause of CAR-T relapse. Dual-target strategies (CD19+CD22) reduce but do not eliminate escape.
**Rule**: CRS and ICANS are PREDICTABLE and MANAGEABLE with tocilizumab and steroids. The bigger concern is LONG-TERM B-cell aplasia and hypogammaglobulinemia requiring IVIG replacement.

---

## Tumor Microenvironment (TME) Analysis

### TME Cell Type Deconvolution

| Method | Input | Output | Strength | Limitation |
|--------|-------|--------|----------|-----------|
| **CIBERSORTx** | Bulk RNA-seq | 22 immune cell fractions | Well-validated; GEP-based | Signature matrix dependent |
| **MCPcounter** | Bulk RNA-seq | 8 cell population scores | Simple; robust | No fraction; only scores |
| **EPIC** | Bulk RNA-seq | Cell fractions | Includes cancer cells | Limited cell types |
| **xCell** | Bulk RNA-seq | 64 cell types | Comprehensive | Correlation-based (not deconvolution) |
| **ESTIMATE** | Bulk RNA-seq | Immune/stromal scores | Simple; widely used | No cell-type resolution |
| **quantiseq** | Bulk RNA-seq | 10 immune cell fractions | Validated with flow cytometry | Limited cell types |
| **scRNA-seq** | Single-cell | Individual cell types | Gold standard | Cost; tissue dissociation bias |
| **Spatial transcriptomics** | Tissue section | Spatial cell distribution | Preserves spatial context | Limited resolution (Visium) |

### TME Immune Phenotype Classification

| Phenotype | Features | Immune Status | ICI Response | Therapeutic Strategy |
|-----------|----------|--------------|-------------|---------------------|
| **Inflamed (hot)** | High TILs; PD-L1+; IFN-γ signature | Active immune response | Good | ICI monotherapy may suffice |
| **Excluded** | TILs at margin; stromal barrier | Immune cells present but excluded | Poor | Anti-angiogenesis + ICI; stroma-targeting |
| **Desert (cold)** | Few TILs; immunosuppressive TME | Immune ignorance | Very poor | Combination: ICI + chemo/radio/oncolytic virus |
| **Immune-suppressed** | Tregs, MDSCs, TAM-M2 dominant | Active suppression | Poor | Deplete suppressors (anti-CD25, CSF1R) + ICI |

### Immunoscore Assessment

| Parameter | Method | Scoring | Clinical Validation | Limitation |
|-----------|--------|---------|-------------------|-----------|
| **CD3+/CD8+ T cells (core)** | IHC | I0-I4 density | Validated in CRC (Galon et al.) | Not standardized across cancer types |
| **CD3+/CD8+ T cells (margin)** | IHC | I0-I4 density | Validated in CRC | Inter-observer variability |
| **Combined Immunoscore** | Core + Margin | IS0-IS4 | Prognostic in CRC, NSCLC, melanoma | Not yet standard of care |
| **Digital Immunoscore** | AI-based IHC analysis | Continuous score | More reproducible | Requires validated AI model |

**Rule**: TME phenotype is MORE PREDICTIVE of ICI response than any single biomarker. "Hot" tumors respond; "cold" tumors don't. The therapeutic goal is to convert cold → hot.
**Rule**: Spatial context MATTERS. "Excluded" tumors have TILs but they are TRAPPED at the tumor margin by stromal barriers. These patients may benefit from stroma-targeting + ICI combinations.
**Rule**: Immunoscore (Galon) is validated as a PROGNOSTIC biomarker in CRC but is NOT yet a PREDICTIVE biomarker for ICI response. It tells you prognosis, not treatment benefit.

---

## Resistance Mechanism Analysis

### Targeted Therapy Resistance Classification

| Type | Mechanism | Example | Detection Method | Therapeutic Strategy |
|------|-----------|---------|-----------------|---------------------|
| **On-target** | Secondary mutation in drug target | EGFR T790M; BCR-ABL T315I | ctDNA sequencing | Next-generation inhibitor (osimertinib; ponatinib) |
| **Bypass signaling** | Activation of alternative pathway | MET amplification in EGFR-mutant NSCLC | FISH; NGS; ctDNA | Combination (EGFR + MET inhibitor) |
| **Downstream activation** | Reactivation of downstream effector | KRAS mutation in EGFR-treated CRC | NGS | Combination or switch strategy |
| **Phenotypic transformation** | Histologic change | SCLC transformation in EGFR-mutant NSCLC | Biopsy; NSE/ProGRP | Switch to SCLC regimen |
| **Drug efflux** | ABC transporter upregulation | ABCB1 overexpression | RNA-seq; functional assay | Efflux inhibitor (limited success) |
| **Tumor heterogeneity** | Pre-existing resistant subclone | Subclonal KRAS in EGFR-treated CRC | Ultra-deep NGS; single-cell | Combination upfront |
| **Immune evasion** | MHC loss; PD-L1 upregulation | B2M loss in ICI-treated melanoma | NGS; IHC | Combination immunotherapy |

### ctDNA-Based Resistance Monitoring

| Application | Method | Sensitivity | Turnaround | Clinical Action |
|-------------|--------|------------|-----------|----------------|
| **Early detection of resistance** | Ultra-deep NGS with UMI | VAF 0.01-0.1% | 7-14 days | Switch therapy before radiographic progression |
| **Resistance mechanism identification** | Comprehensive NGS panel | VAF 0.1-0.5% | 10-21 days | Select next-line targeted therapy |
| **MRD detection** | Tumor-informed assay | VAF 0.001-0.01% | 14-28 days | Adjuvant therapy decision |
| **Treatment response monitoring** | Serial ctDNA | VAF dynamics | 7-14 days per timepoint | Early identification of non-response |

**Rule**: Resistance is INEVITABLE for targeted monotherapy. The question is not IF resistance will occur, but WHEN and through WHAT MECHANISM. Serial ctDNA monitoring can detect resistance months before radiographic progression.
**Rule**: Phenotypic transformation (e.g., adenocarcinoma → SCLC) occurs in 5-15% of EGFR-mutant NSCLC after TKI treatment. Tissue re-biopsy is REQUIRED when clinical course changes unexpectedly.
**Rule**: Combination strategies to prevent resistance must be based on the SPECIFIC resistance mechanism, not empirical combinations. MET amplification requires MET inhibition; KRAS mutation requires a different strategy.

---

## Precision Oncology Quality Checklist

| Item | Required | Common Failure |
|------|----------|---------------|
| Molecular profiling (WES or targeted panel ≥300 genes) | ✅ | No molecular data |
| Actionable mutation identification with evidence level (OncoKB/AMP) | ✅ | Mutation listed without evidence level |
| Resistance mutation check before therapy recommendation | ✅ | Recommending TKI without checking resistance |
| TMB and MSI status assessed for immunotherapy eligibility | ✅ | Not reporting TMB/MSI |
| FDA-approved therapy matched before clinical trial suggestion | ✅ | Suggesting trial when approved drug exists |
| Clinical trial eligibility checked for Level 3-4 findings | ✅ | No trial matching for investigational targets |
| Pharmacogenomic interactions checked | ✅ | Ignoring CYP metabolizer status |
| TME phenotype assessed for immunotherapy decisions | ✅ | ICI recommendation without TME context |
| ctDNA monitoring plan for targeted therapy | ✅ | No monitoring strategy |
| Re-biopsy plan at progression | ✅ | No tissue re-biopsy consideration |
| Antibody developability assessed before clinical development | ✅ | High affinity but poor developability |
| Protein design validated experimentally (not just computational) | ✅ | Computational-only protein design claims |
| CAR-T target expression confirmed on tumor (IHC/flow) | ✅ | Target not verified on patient tumor |
| CAR-T toxicity management plan in place | ✅ | No CRS/ICANS management protocol |
| Dual-target strategy for high-risk antigen escape | ✅ | Single-target CAR-T for high-escape-risk disease |
