# Causal Genomics Methodology

## Mendelian Randomization (MR) Framework

### Core Principle
Use genetic variants as instrumental variables (IVs) to infer causal relationships between exposures and outcomes, leveraging the random assortment of alleles at conception (Mendel's Second Law).

### Three Core Assumptions

| Assumption | Description | Violation Consequence | Detection Method |
|------------|-------------|----------------------|------------------|
| **Relevance** | IV is strongly associated with exposure | Weak instrument bias | F-statistic > 10; R² and partial F² |
| **Independence** | IV is independent of confounders | Biased causal estimate | Assess known confounders; MR-Egger intercept |
| **Exclusion Restriction** | IV affects outcome ONLY through exposure | Horizontal pleiotropy | MR-Egger, MR-PRESSO, heterogeneity tests |

### MR Methods Comparison

| Method | Assumptions | Handles Pleiotropy? | Efficiency | When to Use |
|--------|------------|-------------------|-----------|-------------|
| **IVW** (Inverse Variance Weighted) | All IVs valid (no pleiotropy) | No | High | Primary analysis; when pleiotropy unlikely |
| **MR-Egger** | InSIDE assumption | Yes (directional) | Low | Detect/adjust for directional pleiotropy |
| **Weighted Median** | >50% weight from valid IVs | Yes (balanced) | Moderate | Robustness check; >50% valid IVs |
| **Weighted Mode** | Largest cluster of valid IVs | Yes (clustered) | Low | Complementary robustness |
| **MR-PRESSO** | Outlier detection | Yes (removes outliers) | Moderate | Identify and remove outlier variants |
| **MR-RAPS** | Robust adjusted profile score | Yes (some) | Moderate | Many weak instruments |
| **CAUSE** | Latent factor model | Yes (latent) | Moderate | Distinguish causation from correlation |
| **cML-MA** | Constrained maximum likelihood | Yes (correlated) | Moderate | Correlated pleiotropy |

### MR Analysis Pipeline

| Step | Action | Tool | Key Decision | Common Error |
|------|--------|------|-------------|-------------|
| **1. Select exposure** | Define trait of interest | GWAS Catalog, Open GWAS | Biologically plausible causal pathway | Vague exposure definition |
| **2. Select IVs** | Genome-wide significant SNPs | TwoSampleMR, ieugwasr | P < 5×10⁻⁸; clumping r² < 0.001 | Insufficient clumping → LD contamination |
| **3. Harmonize** | Align alleles between exposure/outcome | TwoSampleMR harmonise() | Remove palindromic SNPs with MAF > 0.42 | Strand flip errors |
| **4. Test assumptions** | F-statistic, heterogeneity | TwoSampleMR, MR-PRESSO | F > 10; Cochran Q p > 0.05 | Ignoring weak instruments |
| **5. Primary analysis** | IVW | TwoSampleMR | Report β, SE, p-value | Only running IVW |
| **6. Sensitivity analysis** | MR-Egger, WM, Mode, MR-PRESSO | TwoSampleMR, MR-PRESSO | Consistent direction across methods | Ignoring discordant results |
| **7. Heterogeneity** | Cochran Q, I² | TwoSampleMR | I² > 50% → explore sources | Not reporting heterogeneity |
| **8. Pleiotropy** | MR-Egger intercept, MR-PRESSO global | MR-PRESSO | Intercept p < 0.05 → pleiotropy present | Not testing for pleiotropy |
| **9. Leave-one-out** | Iteratively remove each SNP | TwoSampleMR | Single SNP driving result? | Not performing LOO |
| **10. Steiger filtering** | Verify direction: exposure→outcome | TwoSampleMR | r²_exposure > r²_outcome | Reverse causation |

### MR Sensitivity Analysis Decision Tree

```
IVW Result
    │
    ├─ Heterogeneity (Cochran Q p < 0.05)?
    │   ├─ YES → Random-effects IVW; explore source of heterogeneity
    │   └─ NO → Fixed-effects IVW
    │
    ├─ MR-Egger intercept p < 0.05?
    │   ├─ YES → Directional pleiotropy detected
    │   │   ├─ MR-Egger slope still significant? → Causal effect likely, but estimate differs
    │   │   └─ MR-Egger slope NOT significant? → Effect may be entirely due to pleiotropy
    │   └─ NO → No evidence of directional pleiotropy
    │
    ├─ Weighted Median agrees with IVW?
    │   ├─ YES → Robustness confirmed (>50% weight from valid IVs)
    │   └─ NO → Investigate which IVs differ; possible pleiotropy
    │
    ├─ MR-PRESSO outlier test significant?
    │   ├─ YES → Remove outliers; re-run IVW
    │   └─ NO → No outliers detected
    │
    └─ Leave-one-out: single SNP drives result?
        ├─ YES → Result NOT robust; report as sensitivity-dependent
        └─ NO → Result robust
```

### Multi-Trait MR Extensions

| Extension | Purpose | Method | Application |
|-----------|---------|--------|-------------|
| **Multivariable MR** | Multiple correlated exposures | MVMR-IVW | Disentangle BMI vs body fat % |
| **Two-step MR** | Mediation analysis | Sequential MR | X → M → Y pathway |
| **Network MR** | Multiple causal pathways | Graph-based MR | Drug target network |
| **Pharmaco-MR** | Drug target effects | cis-MR with eQTL/pQTL | Statin target (HMGCR) → LDL → CHD |
| **Factorial MR** | Interaction effects | 2×2 genetic stratification | BMI × alcohol interaction |
| **Within-family MR** | Control for dynastic effects | Sib-pair MR | Remove family structure bias |
| **Non-linear MR** | Dose-response relationship | Stratified MR | BMI-CHD non-linear threshold |

## Colocalization Analysis

### Core Principle
Test whether two traits (e.g., gene expression and disease) share the SAME causal variant, rather than being in LD with different variants.

### COLOC Posterior Hypotheses

| Hypothesis | Meaning | Action |
|-----------|---------|--------|
| **H0** | No association with either trait | Skip |
| **H1** | Association with trait 1 only | Skip |
| **H2** | Association with trait 2 only | Skip |
| **H3** | Both associated, different causal variants | NOT colocalized — do NOT claim shared mechanism |
| **H4** | Both associated, SAME causal variant | COLOCALIZED — shared causal variant likely |

### COLOC Parameters and Thresholds

| Parameter | Default | Recommendation | Note |
|-----------|---------|---------------|------|
| **p1** (prior: SNP associated with trait 1) | 1×10⁻⁴ | 1×10⁻⁴ for GWAS | Adjust for eQTL (higher prior) |
| **p2** (prior: SNP associated with trait 2) | 1×10⁻⁴ | 1×10⁻⁴ for GWAS | Adjust for eQTL (higher prior) |
| **p12** (prior: SNP associated with both) | 1×10⁻⁵ | 1×10⁻⁵ conservative | Key parameter; sensitivity analysis recommended |
| **PP4 threshold** | > 0.8 | > 0.8 strong; 0.5-0.8 suggestive | Report exact PP4 value |

### Colocalization Methods Comparison

| Method | Strengths | Limitations | When to Use |
|--------|-----------|-------------|-------------|
| **COLOC** | Bayesian; single causal variant assumption | Fails with multiple causal variants | Standard colocalization |
| **eCAVIAR** | Allows multiple causal variants | Computationally intensive | Multiple signals in region |
| **SMR/HEIDI** | Summary-data-based; tests pleiotropy | Single causal variant; HEIDI may be underpowered | eQTL-disease colocalization |
| **ENLOC** | Bayesian; handles multiple signals | Complex setup | Multiple causal variants |
| **fastENLOC** | Fast; genome-wide | Approximation | Genome-wide colocalization scan |
| **coloc-boost** | Boosted colocalization | Newer method | Complementary to COLOC |

### COLOC + MR Integration Protocol

```
MR suggests X → Y
    │
    ├─ Step 1: Identify lead SNP for exposure
    │
    ├─ Step 2: Extract region (±500kb) summary stats for both traits
    │
    ├─ Step 3: Run COLOC
    │   ├─ PP4 > 0.8 → Strong colocalization → MR result credible
    │   ├─ PP3 > 0.8 → Distinct causal variants → MR result likely LD-driven
    │   └─ PP3 ≈ PP4 → Inconclusive → report as uncertain
    │
    ├─ Step 4: If PP3 > PP4, try conditional analysis
    │   ├─ Condition on lead SNP → re-run COLOC
    │   └─ If PP4 increases → secondary signal colocalizes
    │
    └─ Step 5: Report both MR and COLOC results
        ├─ MR significant + COLOC PP4 > 0.8 → Strong causal evidence
        ├─ MR significant + COLOC PP3 > 0.8 → Likely confounded by LD
        └─ MR significant + COLOC inconclusive → Moderate evidence
```

## GWAS-to-Function Pipeline

### From GWAS Hit to Biological Mechanism

| Step | Method | Tool | Output | Key Challenge |
|------|--------|------|--------|---------------|
| **1. GWAS QC** | QC summary statistics | munge_sumstats, GWAS QC | Clean summary stats | Strand alignment; allele coding |
| **2. Fine-mapping** | Identify credible causal variants | SuSiE, FINEMAP, PAINTOR | 95% credible sets | LD reference mismatch |
| **3. Functional annotation** | Annotate variants | VEP, ANNOVAR, CADD | Variant consequences | Non-coding variant interpretation |
| **4. eQTL colocalization** | Link to gene expression | COLOC, SMR, eQTL Catalogue | Gene targets | Tissue-specific eQTL |
| **5. Chromatin annotation** | Regulatory elements | ENCODE, Roadmap, ATAC-seq | Regulatory context | Cell type specificity |
| **6. 3D genome** | Promoter-enhancer contacts | Hi-C, promoter capture Hi-C | Long-range targets | Tissue-matched Hi-C data |
| **7. Pathway analysis** | Gene set enrichment | MAGMA, DEPICT, GSEA | Biological pathways | Gene set bias |
| **8. Drug target** | Druggability assessment | Open Targets, DGIdb | Therapeutic targets | Clinical translation gap |

### Genetic Instrument Selection for MR

| Source | Strengths | Limitations | Best For |
|--------|-----------|-------------|----------|
| **GWAS Catalog** | Curated; well-powered | Winner's curse; heterogeneity | Known trait-SNP associations |
| **Open GWAS** | 40,000+ GWAS summaries | Variable quality; ancestry bias | Comprehensive exposure data |
| **eQTL Catalogue** | Tissue-specific expression | Tissue-specific; context-dependent | Gene expression instruments |
| **pQTL data** | Protein-level instruments | Limited proteins; assay-dependent | Protein biomarker MR |
| **cis-MR** | Single-gene instruments | Limited to nearby variants | Drug target MR |
| **Trans-MR** | Cross-gene instruments | Pleiotropy risk | Pathway analysis |

### Pharmaco-MR: Drug Target Validation

| Step | Method | Key Question | Decision Rule |
|------|--------|-------------|---------------|
| **1. Identify drug target** | DrugBank, ChEMBL | What gene does drug target? | Must have known gene |
| **2. Select cis-instruments** | cis-eQTL/pQTL (±1Mb of gene) | Does genetic proxy mimic drug effect? | F > 10; cis-only |
| **3. Test on disease** | MR analysis | Does target perturbation affect disease? | IVW p < 0.05 |
| **4. Colocalization** | COLOC on cis-region | Same variant drives both? | PP4 > 0.8 |
| **5. Off-target assessment** | Phenome-wide MR | Any adverse effects? | No significant off-target |
| **6. Dose-response** | Non-linear MR | Is effect dose-dependent? | Monotonic relationship |
| **7. Compare with RCT** | Literature search | Does MR agree with RCT? | Concordance strengthens evidence |

### MR Quality Checklist

| Item | Required | Common Failure |
|------|----------|---------------|
| F-statistic > 10 for all instruments | ✅ | Weak instrument bias |
| LD clumping (r² < 0.001, 10,000kb) | ✅ | LD contamination |
| Allele harmonization | ✅ | Strand flip errors |
| Steiger directionality test | ✅ | Reverse causation |
| At least 3 sensitivity methods | ✅ | Only IVW reported |
| Heterogeneity test (Cochran Q) | ✅ | Unreported heterogeneity |
| Pleiotropy test (MR-Egger intercept) | ✅ | Unreported pleiotropy |
| Leave-one-out analysis | ✅ | Single-SNP driven result |
| Population match (exposure = outcome ancestry) | ✅ | Ancestry mismatch |
| Power calculation | 🟡 | Underpowered study |
| Colocalization for cis-MR | ✅ | LD confounding |
| Pre-registration of hypotheses | 🟡 | Fishing expedition |

### Common MR Errors and Red Flags

| Error | Description | Fix |
|-------|-------------|-----|
| **Winner's curse** | Selecting SNPs from same GWAS as outcome | Use independent discovery + outcome datasets |
| **Sample overlap** | Same individuals in exposure and outcome GWAS | Use non-overlapping samples |
| **Ancestry mismatch** | European exposure, Asian outcome | Match ancestries or use trans-ancestry MR |
| **Horizontal pleiotropy** | SNP affects outcome through different pathway | Sensitivity analyses; MR-Egger; MR-PRESSO |
| **Reverse causation** | Outcome actually causes exposure | Steiger filtering; bidirectional MR |
| **LD contamination** | SNPs in LD with each other included | Proper clumping; LD pruning |
| **Weak instruments** | F < 10 | Add more SNPs; use stronger associations |
| **Over-adjustment** | Conditioning on mediator blocks pathway | Do NOT adjust for variables on causal pathway |

### MR Reporting Standards (STROBE-MR)

| Section | Required Elements |
|---------|------------------|
| **Title/Abstract** | Indicate MR design |
| **Introduction** | Rationale; causal question; prior evidence |
| **Methods** | Data sources; IV selection criteria; statistical methods; sensitivity analyses |
| **Results** | IV strength; primary analysis; ALL sensitivity analyses; heterogeneity; pleiotropy |
| **Discussion** | Assumption validity; alternative explanations; clinical implications |
| **Funding** | All data source funding disclosed |
