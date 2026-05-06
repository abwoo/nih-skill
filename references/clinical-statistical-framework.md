# Clinical Evaluation & Statistical Rigor Framework

## Reference Index

| ID | Guideline/Paper | Year | PMID | Domain | Authority Level |
|----|----------------|------|------|--------|----------------|
| CLIN-01 | TRIPOD — Transparent Reporting of Prediction Models | 2015 | 25560730 | Prediction Model Reporting | ★★★★★ Gold Standard |
| CLIN-02 | TRIPOD+AI — Updated Guidance for ML Prediction Models | 2024 | — | AI Prediction Model Reporting | ★★★★★ Gold Standard |
| CLIN-03 | STARD 2015 — Standards for Reporting Diagnostic Accuracy | 2015 | 27004232 | Diagnostic Accuracy | ★★★★★ Gold Standard |
| CLIN-04 | CONSORT — Randomized Controlled Trials | 2010 | 20347092 | RCT Reporting | ★★★★★ Gold Standard |
| CLIN-05 | PRISMA — Systematic Reviews and Meta-Analyses | 2020 | 33559618 | Systematic Review | ★★★★★ Gold Standard |
| CLIN-06 | Johnson et al. — MIMIC-III Clinical Database | 2016 | 27219127 | Clinical Data | ★★★★★ Foundational |
| CLIN-07 | Siontis et al. — Overestimation of Model Performance | 2015 | — | Validation Pitfalls | ★★★★ Authoritative |

---

## CLIN-01: TRIPOD — Prediction Model Reporting

### Citation
Collins GS, Reitsma JB, Altman DG, Moons KGM. Transparent Reporting of a Multivariable Prediction Model for Individual Prognosis or Diagnosis (TRIPOD). Ann Intern Med. 2015;162(1):55-63. PMID: 25560730

### Framework Decomposition

**Core Idea**: A 37-item checklist ensuring complete and transparent reporting of clinical prediction model development and validation studies.

**Key Items for BME Researchers**:

| Category | Critical Items | Why It Matters for BME |
|----------|---------------|----------------------|
| **Participants** | Describe study population, inclusion/exclusion, demographics | Defines generalizability of the model |
| **Outcome** | Define the target condition, how it was determined | Ground truth quality affects all downstream results |
| **Predictors** | Describe all predictors, how and when measured | For BME: signal features, lead configuration, preprocessing |
| **Sample Size** | Justify sample size for model development | Most BME studies are underpowered |
| **Missing Data** | Describe handling of missing data | MIMIC-style data has significant missingness |
| **Model Development** | Specify model type, selection method, regularization | Prevents p-hacking and overfitting |
| **Performance** | Report discrimination (C-statistic/AUC) AND calibration | AUC alone is insufficient; calibration is critical for clinical use |
| **Validation** | Internal (bootstrapping/cross-validation) AND external validation | External validation is the gold standard |
| **Reclassification** | Net reclassification improvement, decision curve analysis | Does the model change clinical decisions? |

**TRIPOD+AI Additions (CLIN-02)**:
- How was the model trained? (optimizer, loss function, hyperparameter tuning)
- Computational resources required
- Model interpretability approach
- Fairness across subgroups
- Data preprocessing pipeline details
- Handling of temporal data (time-series ECG/EEG)

### Interpretability Evaluation Guide for BME-AI

When a paper claims "interpretable" or "explainable", evaluate with this checklist:

| Method | What It Shows | What It Does NOT Show | Common Misuse |
|--------|--------------|----------------------|---------------|
| Attention maps | Where the model "looks" | Why it made the decision; attention ≠ importance | "Attention provides explanation" — NO, it only shows focus |
| GradCAM / Saliency | Gradient-based feature importance | Sensitive to input perturbations; can be misleading | "Heatmap explains the prediction" — partial at best |
| SHAP | Feature contribution per prediction | Computationally expensive; approximations may be inaccurate | Good for tabular data; hard for images/signals |
| LIME | Local linear approximation | Unstable across runs; approximation quality varies | OK for quick check; not for clinical explanation |
| Concept-based (TCAV) | High-level concept sensitivity | Requires predefined concepts; may miss unknown concepts | Best for research; not yet clinical-grade |
| Counterfactual | "What would change the prediction?" | Computationally hard; may produce unrealistic counterfactuals | Most clinically meaningful but hardest to implement |

**⚠️ Key Rules**:
1. **Attention ≠ Explanation**: Attention weights show correlation, not causation. A model can attend to irrelevant features. Flag: "⚠️ Attention maps are NOT explanations — they show where the model looks, not why it decides."
2. **Post-hoc ≠ Inherent**: GradCAM/SHAP are post-hoc explanations. They approximate the model but may not reflect its true reasoning. Flag: "⚠️ Post-hoc explanations may not faithfully represent model reasoning."
3. **Clinical validation required**: If a paper claims clinical interpretability, the explanations must be validated by domain experts. Flag if no expert evaluation: "⚠️ Interpretability claim without clinical validation — explanations may not be clinically meaningful."
4. **Signal-specific**: For ECG, check if the model attends to clinically relevant segments (QRS, T-wave). For EEG, check if attention aligns with known event markers. For imaging, check if heatmaps localize to pathology (not artifacts).

**Methodological Insight — Why This Matters**:
1. Most BME-AI papers fail TRIPOD compliance on: sample size justification, external validation, calibration reporting
2. TRIPOD+AI specifically addresses the reproducibility crisis in medical AI
3. Following TRIPOD is increasingly required by top journals (Lancet, Nature Medicine, JAMA)

**When to Apply This**:
- Writing any clinical prediction model paper
- Reviewing BME-AI papers (use as reviewer checklist)
- Designing validation studies
- Preparing FDA/CE regulatory submissions

---

## CLIN-03: STARD 2015 — Diagnostic Accuracy Reporting

### Citation
Bossuyt PM, Reitsma JB, Bruns DE, et al. STARD 2015: Updated Reporting Guidelines for All Diagnostic Accuracy Studies. BMJ. 2015;351:h5527. PMID: 27004232

### Framework Decomposition

**Core Idea**: A 30-item checklist for reporting studies that assess the accuracy of diagnostic tests.

**Key Items for BME Diagnostic Systems**:

| Item | Description | BME Application |
|------|-------------|-----------------|
| Participants | Consecutive or random enrollment? | Avoids spectrum bias in ECG/EEG studies |
| Index Test | Describe the AI/diagnostic system in detail | Architecture, thresholds, operating points |
| Reference Standard | What is the ground truth? | Expert annotation, gold-standard test |
| Blinding | Were readers blinded to index test results? | Prevents review bias |
| Flow Diagram | Show participant flow through the study | Reveals exclusions and missing data |
| 2x2 Table | Cross-tabulation of index vs reference | Essential for computing Sens/Spec/PPV/NPV |
| ROC Curve | Full ROC with AUC and CI | Multiple operating points, not just one |
| Subgroup Analysis | Performance across demographic groups | Fairness and generalizability |

**Methodological Insight**:
- Sensitivity and Specificity must be reported TOGETHER (not cherry-picked)
- PPV depends on prevalence — always report in context of target population
- ROC curves without confidence bands are incomplete
- For BME: always report performance at clinically relevant operating points

---

## CLIN-06: MIMIC-III — Clinical Database Methodology

### Citation
Johnson AEW, Pollard TJ, Shen L, et al. MIMIC-III, a Freely Accessible Critical Care Database. Sci Data. 2016;3:160035. PMID: 27219127

### Methodology Decomposition

**Core Idea**: A large, freely accessible de-identified clinical database for critical care research, establishing the standard for open clinical data.

**Dataset Structure**:
- ~60,000 ICU admissions from 46,000+ patients
- 26 tables covering: demographics, lab tests, medications, procedures, vital signs, imaging, notes
- Time span: 2001-2012 (Beth Israel Deaconess Medical Center)

**Key Methodological Contributions**:
1. **De-identification Protocol**: HIPAA-compliant de-identification while preserving clinical utility
2. **Data Model**: Star schema with central `icustays` table linked to `patients`, `admissions`, `chartevents`, `labevents`, etc.
3. **Concept IDs**: Uses d_items/d_icd_diagnoses for standardized coding
4. **Time-stamped Events**: All clinical events are time-stamped relative to ICU admission

**Common Research Tasks on MIMIC**:
| Task | Input | Output | Typical Method |
|------|-------|--------|----------------|
| Mortality prediction | First 24/48h clinical data | Binary (in-hospital mortality) | XGBoost / LSTM |
| Sepsis prediction | Vital signs + labs + demographics | Binary (sepsis onset) | LSTM / Transformer |
| Length of stay | Admission data + first 24h | Regression (days) | Gradient Boosting |
| Acuity scoring | Full ICU stay | SOFA / SAPS-II score | Logistic Regression |
| Phenotyping | Full clinical record | Subgroup assignment | Clustering / Topic Model |

**MIMIC Research Protocol**:
```
1. Get credentialed access (CITI training + PhysioNet application)
2. Set up PostgreSQL database with MIMIC-III scripts
3. Use mimic-code repository for concept extraction
4. Define cohort using SQL queries
5. Extract features (first 24h, last 24h, or full stay)
6. Handle missing data (forward fill / imputation / indicator variables)
7. Train with patient-wise cross-validation
8. Evaluate with AUROC + calibration + clinical utility
```

**When to Reference This**:
- Any critical care prediction study
- Designing clinical data extraction pipelines
- Understanding open clinical data standards
- Benchmarking clinical prediction models

---

## Statistical Rigor Framework for BME

### Mandatory Statistical Checklist

| # | Item | Requirement | Common Violation |
|---|------|-------------|------------------|
| 1 | Sample size justification | Power analysis or minimum events per variable (EPV≥10) | No justification; "we used all available data" |
| 2 | Patient-wise data splitting | Train/val/test split with NO patient overlap | Record-wise splits (data leakage) |
| 3 | Multiple comparison correction | Bonferroni or FDR for >1 comparison | No correction; "significant at p<0.05" for 20 tests |
| 4 | Confidence intervals | Report 95% CI for all performance metrics | Only point estimates |
| 5 | Effect sizes | Report Cohen's d, odds ratios, etc. | Only p-values |
| 6 | Cross-validation strategy | Nested CV for hyperparameter tuning; outer CV for performance | Non-nested CV (optimism bias) |
| 7 | Calibration assessment | Calibration plot + Hosmer-Lemeshow or Brier score | Only discrimination (AUC) |
| 8 | External validation | Test on at least one independent dataset | Only internal validation |
| 9 | Subgroup analysis | Report performance by age, sex, disease severity | Only overall performance |
| 10 | Pre-registration | Register analysis plan before data inspection | HARKing (Hypothesizing After Results Known) |
| 11 | Disease definition consistency | Use same definition across train/test; report which definition used | Using Sepsis-2 for training but Sepsis-3 for evaluation; OR not reporting definition |
| 12 | Proxy variable leakage | Check if features contain proxy for the label | Using diagnosis-related features to predict diagnosis; OR using treatment as feature to predict outcome |
| 13 | High-dimensional multiple testing | FDR correction for >20 features/genes tested; report total number tested | "Significant at p<0.05" for 10,000 genes without correction |

### Disease Definition Consistency Check

When a paper studies a clinical condition (sepsis, AKI, COPD, etc.), check:

| Condition | Common Definitions | Impact on Results |
|-----------|-------------------|-------------------|
| **Sepsis** | Sepsis-1 (SIRS-based, 1991) / Sepsis-2 (SIRS+infection, 2001) / Sepsis-3 (SOFA≥2+infection, 2016) | Sepsis-1/2 overdiagnose by ~30% vs Sepsis-3; AUROC can differ by 0.05-0.10 |
| **AKI** | KDIGO (creatinine+UOP) / RIFLE / CIN | KDIGO is current standard; RIFLE gives different prevalence |
| **COPD** | GOLD criteria / ICD codes / self-report | ICD codes have 20-30% misclassification |
| **Heart Failure** | ESC / ACC/AHA / ICD codes | Different criteria give different cohorts |
| **Diabetes** | HbA1c / fasting glucose / ICD codes | ICD codes miss undiagnosed cases |

**Rule**: If a paper does not specify which disease definition it uses, flag as: "⚠️ Disease definition not specified — results may not be comparable to other studies."
**Rule**: If a paper uses different definitions for training vs evaluation, flag as: "🔴 Disease definition mismatch — this is a form of data leakage."

### Proxy Variable Leakage Check

When a paper uses EHR/clinical data, check for proxy variables:

| Feature | May Be Proxy For | Why It Leaks |
|---------|-----------------|-------------|
| Hospital length of stay | Mortality outcome | Longer stay correlates with death |
| Number of lab tests ordered | Disease severity | More tests = sicker patient |
| Medication administration | Diagnosis | Antibiotics → infection; vasopressors → shock |
| ICU transfer | Deterioration | Transfer indicates clinical concern |
| Billing/DRG codes | Diagnosis | Codes are assigned AFTER diagnosis |
| Clinical notes keywords | Diagnosis | Notes document the diagnosis |

**Detection method**: For each feature, ask: "Would this feature be AVAILABLE and IDENTICAL at the time of prediction in a real clinical setting?"
- If the feature is only available AFTER the outcome → 🔴 Temporal leakage
- If the feature is a direct proxy for the label → 🔴 Proxy leakage
- If the feature is correlated but available before → 🟡 Potential confound, report sensitivity analysis

### High-Dimensional Multiple Testing Guide

When analyzing genomics, proteomics, or other high-dimensional data:

| Scenario | Number of Tests | Required Correction | Common Violation |
|----------|----------------|--------------------|--------------------| 
| GWAS | 1M+ SNPs | Bonferroni (p<5×10⁻⁸) or FDR | No correction; p<0.05 |
| Transcriptomics | 20K+ genes | FDR (Benjamini-Hochberg) | Bonferroni too conservative; no correction too liberal |
| Proteomics | 1K-5K proteins | FDR | No correction |
| Radiomics features | 100-1000 features | FDR or Bonferroni | No correction; feature selection on full data |
| DL model comparison | 5-20 models | Bonferroni or Holm | No correction for multiple baselines |

**Rule**: If a paper reports "significant" findings from >20 tests without multiple comparison correction, flag as: "🔴 Multiple comparison violation — findings are likely false positives."

### Common Statistical Pitfalls in BME Papers

| Pitfall | Description | Detection | Fix |
|---------|-------------|-----------|-----|
| **Data Leakage** | Train-test overlap at patient level | Check if same patient appears in both sets | Patient-wise splitting |
| **Optimism Bias** | Non-nested CV inflates performance | CV without held-out test set | Nested CV or separate test set |
| **Label Leakage** | Features contain information about the label | Feature analysis before modeling | Careful feature engineering review |
| **Survivorship Bias** | Only analyzing patients who survived long enough | Exclusion criteria analysis | Include all patients; censor appropriately |
| **Metric Cherry-Picking** | Reporting best metric across multiple | Multiple metrics reported | Pre-specify primary metric |
| **Temporal Leakage** | Using future data to predict past events | Feature timestamp analysis | Ensure all features are available at prediction time |
| **Annotation Bias** | Labels from same source as features | Check annotation methodology | Independent annotation source |
| **Label Noise from ICD Codes** | ICD billing codes used as ground truth ≠ clinical diagnosis; upcoding, miscoding, code-first bias | Check if labels are ICD-based vs expert-annotated | Use expert-annotated subset for validation; report ICD-code positive predictive value |
| **Label Noise from NLP Extraction** | NLP-extracted labels from radiology reports have 20-40% error rate; negation errors, uncertainty errors | Check label extraction methodology | Manual validation on random sample; report NLP accuracy |
| **CI Overlap Fallacy** | Claiming "superior" performance when 95% CIs overlap between model and baseline | Check if CI intervals overlap | If CIs overlap, claim is NOT statistically supported — state "trend toward improvement" not "superior" |

### Label Quality Assessment Framework

When evaluating ANY clinical AI paper, check the label source FIRST:

| Label Source | Typical Noise Rate | Trust Level | Action |
|-------------|-------------------|-------------|--------|
| Expert manual annotation (committee consensus) | 5-15% | 🟢 High | Standard evaluation |
| Expert manual annotation (single annotator) | 15-25% | 🟡 Medium | Report inter-annotator agreement |
| ICD billing codes (MIMIC, eICU) | 20-40% | 🟡 Medium | Validate on expert-annotated subset |
| NLP-extracted from reports (ChestX-ray14, MIMIC-CXR) | 25-40% | 🔴 Low | Must report NLP accuracy; manual validation required |
| Self-reported / patient-reported | 30-50% | 🔴 Low | Cross-validate with clinical records |
| Model-generated pseudo-labels | Unknown | 🔴 Very Low | Only for pretraining, NOT for evaluation |

**⚠️ CRITICAL RULE**: If the label noise rate exceeds the claimed performance improvement, the improvement is NOT reliable.

### Label Noise Rate Estimation Protocol

When a paper does not report label noise rate, estimate it using this decision tree:

```
STEP 1: Identify label source
  → Expert annotation → Go to STEP 2
  → ICD billing codes → Go to STEP 3
  → NLP extraction → Go to STEP 4
  → Model-generated → Noise rate = UNKNOWN (🔴 FB-8)

STEP 2: Expert annotation noise estimation
  → If inter-annotator agreement reported:
     Noise ≈ 1 - agreement (e.g., agreement=0.73 → noise≈27%)
  → If number of annotators = 1:
     Noise ≈ 15-25% (single annotator baseline)
  → If committee consensus with >3 annotators:
     Noise ≈ 5-15% (gold standard)
  → If adjudication process (disagreements resolved by senior):
     Noise ≈ 5-10%

STEP 3: ICD code noise estimation
  → For MIMIC-III/IV:
     Phenotype classification: 20-40% noise (depends on code specificity)
     Mortality: <5% noise (objective outcome)
     Sepsis: 30-50% if ICD-based; <10% if Sepsis-3 criteria used
     Specific procedures: 10-20% (better than diagnoses)
  → For other EHR databases:
     Apply similar rates; adjust for local coding practices
  → Quick check: Compare ICD prevalence vs clinical literature prevalence
     If ICD prevalence >> clinical prevalence → upcoding (inflation)
     If ICD prevalence << clinical prevalence → undercoding (missed cases)

STEP 4: NLP extraction noise estimation
  → For radiology reports (ChestX-ray14, CheXpert, MIMIC-CXR):
     Negation errors: ~10-15% ("no evidence of pneumonia" → labeled positive)
     Uncertainty errors: ~5-10% ("cannot exclude" → labeled positive or negative)
     Missing findings: ~10-15% (finding mentioned but not in structured output)
     Total estimated noise: 25-40%
  → For pathology reports:
     Similar rates, but higher specificity → noise ~20-30%
  → For discharge summaries:
     Higher complexity → noise ~30-45%
  → Quick check: Was manual validation done on a random sample?
     If yes → use reported NLP accuracy
     If no → assume 30% noise as default

STEP 5: Cross-validate noise estimate
  → If multiple label sources available, compare agreement
  → If noise estimate > claimed improvement → flag as unreliable
  → Output format:
     "Label source: [source] | Estimated noise: [X%] | Claimed improvement: [Y%]
      ⚠️ Noise rate [exceeds/is within] improvement margin → Claim is [unreliable/plausible]"
```

### Label Noise Rate Quick Reference by Dataset

| Dataset | Label Source | Estimated Noise | Notes |
|---------|-------------|----------------|-------|
| MIMIC-III mortality | Objective outcome | <5% | Reliable |
| MIMIC-III phenotype | ICD-9 codes | 20-40% | Billing codes ≠ diagnosis |
| MIMIC-III sepsis (ICD) | ICD-9 codes | 30-50% | Use Sepsis-3 instead |
| MIMIC-III sepsis (Sepsis-3) | Clinical criteria | <10% | Preferred |
| ChestX-ray14 | NLP from reports | 25-40% | No manual validation |
| CheXpert | NLP + uncertainty | 15-30% | Better than CXR14 |
| MIMIC-CXR | NLP + validation | 10-25% | Best NLP dataset |
| VinDr-CXR | Expert annotation | 5-10% | Most reliable |
| PTB-XL | Expert annotation | <10% | Multi-annotator |
| CinC 2017 | Expert annotation | <10% | Committee consensus |
| PhysioNet AF | Expert annotation | <5% | Well-validated |
| BraTS | Expert annotation | <10% | Competition-grade |
| ISIC | Expert annotation | 5-15% | Multi-annotator |
| eICU | ICD codes | 25-40% | Same issues as MIMIC |
| Sleep-EDF | Expert scoring | 10-20% | Inter-scorer variability |
| TUH EEG | Expert annotation | 5-15% | Clinical reports |
| BCI Competition | Benchmark labels | <5% | Ground truth defined by paradigm |
| ADNI | Clinical diagnosis | 5-10% | Standardized assessment |
| UK Biobank | Self-report + ICD | 20-40% | Self-report is noisy |

### CI Overlap Quick Check

When a paper claims "Model X outperforms Baseline Y":
```
1. Extract 95% CIs for both Model X and Baseline Y
2. Check overlap:
   - If CIs do NOT overlap → Claim is supported (p < 0.05 approximately)
   - If CIs overlap but point estimates differ → Claim is NOT statistically supported; use "trend" language
   - If CIs substantially overlap → Claim is likely NOT significant; request statistical test
3. If CIs are NOT reported:
   - Calculate them using the Bootstrap CI Protocol below
   - Flag: "⚠️ CIs not reported — significance of improvement cannot be verified"
4. Special case for "outperforms humans":
   - Check if the model was trained on labels from the SAME annotators used for comparison
   - If yes → This is FB-5 (Comparison Fairness) violation, not a valid comparison
```

### Bootstrap CI Calculation Protocol (When CIs Are Not Reported)

When a paper reports point estimates but NOT confidence intervals, use this protocol to compute them:

```
BOOTSTRAP CI FOR PERFORMANCE METRICS
=====================================

Given: N test samples, metric M (e.g., AUROC, F1, accuracy)

Step 1: If the paper provides a confusion matrix or per-sample predictions:
  → Compute metric M on each bootstrap resample (resample N samples with replacement)
  → Repeat B=2000 times → get M_1, M_2, ..., M_B
  → 95% CI = [percentile_2.5(M_1...M_B), percentile_97.5(M_1...M_B)]

Step 2: If only aggregate metrics are reported (no per-sample data):
  → Use NORMAL APPROXIMATION:
  → For proportions (accuracy, sensitivity, specificity):
     CI = p ± 1.96 * sqrt(p*(1-p)/N)
  → For AUROC (Hanley-McNeil approximation):
     Q1 = AUC / (2 - AUC)
     Q2 = 2*AUC^2 / (1 + AUC)
     SE = sqrt((AUC*(1-AUC) + (n_pos-1)*(Q1-AUC^2) + (n_neg-1)*(Q2-AUC^2)) / (n_pos*n_neg))
     CI = AUC ± 1.96 * SE
  → For F1 score:
     SE ≈ sqrt(F1*(1-F1)/N) (rough approximation)
     CI = F1 ± 1.96 * SE

Step 3: Compare CIs between Model X and Baseline Y:
  → If CIs overlap → Claim "superior" is NOT statistically supported
  → If CIs do not overlap → Claim is approximately significant (p < 0.05)

Step 4: Output format:
  "⚠️ CI CALCULATED (not reported in paper):
   Model X: [metric] = [value] (95% CI: [lower]-[upper])
   Baseline Y: [metric] = [value] (95% CI: [lower]-[upper])
   CIs [overlap/do not overlap] → Claim is [NOT supported / supported]"
```

### Quick CI Lookup Table (Normal Approximation for Proportions)

| N (test set size) | Metric value | 95% CI width (±) |
|-------------------|-------------|-------------------|
| 100 | 0.90 | ±0.059 |
| 100 | 0.80 | ±0.078 |
| 200 | 0.90 | ±0.042 |
| 200 | 0.80 | ±0.055 |
| 500 | 0.90 | ±0.026 |
| 500 | 0.80 | ±0.035 |
| 1000 | 0.90 | ±0.019 |
| 1000 | 0.80 | ±0.025 |
| 5000 | 0.90 | ±0.008 |
| 5000 | 0.80 | ±0.011 |

**Rule of thumb**: With N<200, CI width > ±0.04. Most "improvements" of 1-3% are within noise.
With N<100, CI width > ±0.06. Any claim of improvement is unreliable without statistical testing.

### Metric Selection for Imbalanced Datasets

When the positive class prevalence is <10%, AUROC is misleading. Use this guide:

| Prevalence | Recommended Primary Metric | Why AUROC Fails | Example |
|-----------|---------------------------|----------------|---------|
| >20% | AUROC + F1 | AUROC is fine | ECG 5-class classification |
| 10-20% | AUROC + AUPRC | AUROC slightly inflated | Sleep staging N1 class |
| 5-10% | AUPRC + F1 + Sensitivity@FixedFPR | AUROC significantly inflated | Sepsis prediction |
| 1-5% | AUPRC + Sensitivity@HighSpecificity | AUROC very inflated; AUPRC more informative | Seizure detection |
| <1% | AUPRC + Sensitivity@99%Specificity | AUROC meaningless; precision matters | Rare disease screening |

**Rule**: If prevalence <10% and the paper only reports AUROC, flag: "⚠️ AUROC is misleading for rare events — AUPRC should be reported."
**Rule**: For clinical deployment, always report Sensitivity at a clinically relevant Specificity threshold (e.g., Sens@Spec=0.95 for screening).

### Deployment Feasibility Assessment

When evaluating a paper for clinical deployment potential:

| Dimension | Check | 🟢 Deployable | 🟡 Needs Work | 🔴 Not Deployable |
|-----------|-------|--------------|---------------|-------------------|
| Latency | Inference time | <100ms (real-time) | 100ms-1s (near real-time) | >1s (batch only) |
| Compute | GPU requirement | CPU-only or edge GPU | Single GPU | Multi-GPU required |
| Calibration | Probability calibration | Well-calibrated (Brier <0.1) | Partially calibrated | Not calibrated |
| Monitoring | Drift detection | Ongoing monitoring plan | One-time validation | No monitoring |
| Regulatory | FDA/CE pathway | Cleared/approved | Pathway identified | No regulatory plan |
| Integration | EHR/PACS integration | API available | Compatible format | Proprietary format |
| Failure modes | Known failure cases | Documented + mitigated | Documented | Not documented |

**Rule**: If a paper claims clinical utility but has 🔴 on any of Calibration, Monitoring, or Failure modes, flag: "⚠️ Not ready for clinical deployment — critical gaps remain."

### Evidence Level Classification for BME

| Level | Type | Example | Strength |
|-------|------|---------|----------|
| **I** | Systematic review of RCTs | Cochrane meta-analysis | Strongest |
| **II** | Well-designed RCT | Prospective clinical validation of AI-ECG | Strong |
| **III** | Well-designed non-experimental | Retrospective multi-center validation | Moderate |
| **IV** | Single-center retrospective | Most BME-AI papers | Moderate-Weak |
| **V** | Case series / Expert opinion | Single-pilot study | Weak |
| **VI** | In-silico / simulation only | Model trained and tested on same dataset | Weakest |

**Rule**: When evaluating a BME-AI claim, automatically classify its evidence level. If Level IV or below, explicitly state: "⚠️ This evidence is based on retrospective single-center data — external validation is required before clinical application."

---

## Fairness Audit Protocol for Clinical AI

When evaluating fairness of a clinical AI system across demographic groups:

| Audit Dimension | Key Questions | Required Analysis | Red Flag |
|----------------|--------------|-------------------|---------|
| **Performance Parity** | Does accuracy differ across groups? | AUROC/F1 by race, sex, age, insurance | >5% AUROC gap between groups |
| **Calibration Parity** | Are predicted probabilities equally reliable? | Calibration curves per group | Well-calibrated for one group, overconfident for another |
| **Error Type Parity** | Are false positives/negatives distributed equally? | Sensitivity and specificity per group | Higher FNR for minority groups |
| **Representation** | Are all groups adequately represented in training data? | Training set demographics vs target population | <5% representation of a group in training |
| **Feature Equity** | Do features have equal predictive power across groups? | Feature importance by group | Features only predictive for majority group |
| **Access Equity** | Will all groups have equal access to the AI system? | Deployment infrastructure analysis | AI only available at well-resourced hospitals |

**Fairness Metrics**:

| Metric | Formula | Interpretation | When to Use |
|--------|---------|---------------|-------------|
| **Demographic Parity** | P(Ŷ=1\|A=a) = P(Ŷ=1\|A=b) | Equal positive rates across groups | Screening tests |
| **Equalized Odds** | P(Ŷ=1\|Y=y,A=a) = P(Ŷ=1\|Y=y,A=b) | Equal TPR and FPR across groups | Diagnostic tests |
| **Predictive Parity** | P(Y=1\|Ŷ=1,A=a) = P(Y=1\|Ŷ=1,A=b) | Equal PPV across groups | Triage/prioritization |
| **Calibration** | P(Y=1\|Ŷ=p,A=a) = p for all a | Predicted probability = true probability for all groups | Risk prediction |

**Rule**: Fairness metrics can CONFLICT — equalizing TPR may worsen PPV. The choice of fairness metric is a CLINICAL and ETHICAL decision, not a statistical one.
**Rule**: If a clinical AI paper does not report ANY subgroup analysis, flag: "⚠️ No fairness evaluation — performance may vary significantly across demographic groups."
**Rule**: "We evaluated on [single demographic]" is a fairness RED FLAG. At minimum, report performance by age group, sex, and race/ethnicity.

### Skin Tone Fairness for Medical Imaging

When evaluating dermatology or wound imaging AI:

| Fitzpatrick Skin Type | Prevalence in Training Data (typical) | Risk | Required Action |
|----------------------|--------------------------------------|------|----------------|
| I-II (light) | 70-80% | Under-diagnosis of conditions in darker skin | Report performance by skin type |
| III-IV (medium) | 15-20% | Moderate risk | Include in validation |
| V-VI (dark) | 5-10% | HIGH risk of misdiagnosis | Oversample in validation; report separately |

**Rule**: Dermatology AI without skin-tone-stratified evaluation is NOT safe for clinical deployment.

## Model Drift Detection Protocol

When deploying clinical AI models, performance degrades over time. Detection is mandatory:

| Drift Type | Cause | Detection Method | Frequency | Action Threshold |
|-----------|-------|-----------------|-----------|-----------------|
| **Data Drift** | Input distribution changes (new scanner, new patient population) | KL divergence, PSI, MMD on input features | Monthly | PSI > 0.2 or MMD p < 0.05 |
| **Concept Drift** | Relationship between input and output changes (new treatment protocols) | Performance monitoring on labeled subset; DDM, EDDM | Weekly | AUROC drop > 0.03 from baseline |
| **Label Drift** | Disease definition or coding changes | Compare label distribution over time | Quarterly | >10% shift in label prevalence |
| **Infrastructure Drift** | Software/hardware changes affect model behavior | Reproducibility checks on known cases | Per deployment | Any discrepancy on regression suite |

**Drift Response Protocol**:

| Severity | Indicator | Response |
|----------|-----------|----------|
| **Green** | All metrics within 95% CI of baseline | Continue monitoring |
| **Yellow** | One metric approaching threshold; data drift detected | Investigate; increase monitoring frequency |
| **Orange** | Performance drop >1 AUROC point; concept drift confirmed | Alert clinicians; begin retraining |
| **Red** | Performance drop >3 AUROC points; safety concern | Suspend model; revert to manual; emergency retraining |

**Rule**: Clinical AI without drift monitoring is like a drug without pharmacovigilance — dangerous and irresponsible.
**Rule**: "The model was validated 2 years ago" is NOT sufficient. Continuous monitoring is required. Model performance is not static.
**Rule**: When retraining on drifted data, the NEW model must be validated on BOTH new and old data distributions to ensure backward compatibility.

## AI-Specific Clinical Trial Design

When evaluating AI systems in prospective clinical trials:

| Design Type | Description | When Appropriate | Key Consideration |
|------------|------------|-----------------|-------------------|
| **AI vs Standard Care RCT** | Randomize to AI-assisted vs unassisted | AI as decision support | Must measure CLINICAL outcomes, not just AI accuracy |
| **AI-Augmented Cluster RCT** | Sites randomized to AI vs standard | Multi-site deployment | Site-level confounders; Hawthorne effect |
| **Stepped Wedge** | Gradual AI rollout across sites | Ethical constraints on withholding AI | Time-trend confounders |
| **Adaptive Trial** | AI adapts during trial | Learning health systems | Must pre-specify adaptation rules |
| **N-of-1 Trial** | Single patient crossover | Personalized AI (see N-of-1 protocol) | Not generalizable |
| **Shadow Mode** | AI runs in parallel, not affecting decisions | Pre-deployment safety evaluation | No clinical outcome data |

**Rule**: AI clinical trials must measure CLINICAL outcomes (mortality, morbidity, time-to-treatment), not just AI performance metrics (AUROC, F1). Improved AUROC ≠ improved patient outcomes.
**Rule**: The comparator in AI clinical trials must be CURRENT standard of care, not a weak baseline. "AI beats logistic regression" is irrelevant if clinicians outperform both.
**Rule**: AI trials must report TIME-TO-DECISION and WORKFLOW IMPACT. An AI that is accurate but slows down clinical workflow may have negative net impact.

### Model Retraining Failure Protocol

When a deployed clinical AI model is retrained due to drift but the retrained model performs WORSE:

| Scenario | Root Cause | Response | Escalation |
|----------|-----------|----------|-----------|
| **Retrained model worse on old distribution** | New data shifted; old patterns lost | Revert to previous model; investigate data shift | If previous model also degraded → manual operation |
| **Retrained model worse on new distribution** | Insufficient new data; overfitting | Collect more new data; use domain adaptation | If data collection infeasible → hybrid old+new ensemble |
| **Retrained model worse on BOTH distributions** | Training failure; hyperparameter mismatch | Full training audit; compare training curves | If repeated failure → redesign model architecture |
| **Retrained model better on new but worse on old** | Catastrophic forgetting | Use continual learning (EWC/Replay); ensemble | If forgetting unavoidable → deploy separate models per era |

**Rule**: ALWAYS validate retrained model on BOTH old and new data distributions before deployment. A model that only works on new data has FORGOTTEN old patterns.
**Rule**: Maintain a MODEL ROLLBACK PROTOCOL: previous model version must be kept in warm standby for instant rollback.
**Rule**: Retraining failure is a SAFETY EVENT — it must be documented, investigated, and reported to clinical governance.
**Rule**: For domain adaptation technical methods (DANN, test-time adaptation, prompt tuning) and the domain adaptation decision tree, see deep-learning-bme.md (Domain Adaptation section).

### Federated Learning Security Assessment

When evaluating federated learning systems for clinical AI:

| Threat | Detection Method | Mitigation | Severity |
|--------|-----------------|-----------|---------|
| **Malicious participant (data poisoning)** | Gradient anomaly detection; contribution auditing | Robust aggregation (Krum, trimmed mean); participant reputation | 🔴 High |
| **Model inversion attack** | Reconstruction error on held-out data; membership inference | Differential privacy; gradient compression | 🟡 Medium |
| **Free-riding (no contribution)** | Contribution scoring; Shapley value analysis | Minimum contribution threshold | 🟡 Medium |
| **Data heterogeneity (non-IID)** | Per-participant performance variance; Dirichlet distribution test | FedProx / SCAFFOLD / personalized FL | 🟡 Medium |
| **Communication cost** | Rounds to convergence; bandwidth per round | Gradient compression; asynchronous FL | 🟢 Low |

**Rule**: Federated learning papers that do not discuss security threats are INCOMPLETE. At minimum, address data poisoning and model inversion.
**Rule**: FL without differential privacy may leak patient information through gradient analysis. Privacy budget (ε) should be reported.

## Pragmatic Clinical Trial Assessment Protocol

When evaluating AI systems tested in pragmatic clinical trials (e.g., DULCE, aidSurg):

### Pragmatic vs Explanatory Trial Distinction

| Dimension | Explanatory (Efficacy) | Pragmatic (Effectiveness) | Assessment Implication |
|-----------|----------------------|--------------------------|----------------------|
| **Setting** | Controlled research environment | Real-world clinical practice | Pragmatic = stronger evidence for deployment |
| **Population** | Strict inclusion/exclusion | Broad, representative of actual patients | Pragmatic generalizes better |
| **Intervention** | Standardized, protocol-driven | Flexible, clinician-discretion | Pragmatic reflects real adherence |
| **Comparator** | Placebo or active control | Standard of care as practiced | Pragmatic = fairer comparison |
| **Outcome** | Surrogate endpoints | Patient-important outcomes | Pragmatic = more clinically relevant |
| **Adherence** | Monitored and enforced | As in routine practice | Non-adherence = real-world signal |
| **Analysis** | Per-protocol + ITT | Intention-to-treat primary | ITT in pragmatic = true effect size |

### Cluster-Randomized Trial Assessment

When AI trials randomize at the practice/hospital level (not individual patient level):

| Assessment Dimension | Key Questions | Required Evidence | Red Flag |
|---------------------|--------------|-------------------|---------|
| **ICC (Intraclass Correlation)** | Was ICC reported and used in sample size calculation? | ICC for primary outcome; design effect = 1+(m-1)×ICC | No ICC reported; sample size not adjusted for clustering |
| **Design Effect** | Was the effective sample size calculated? | Design effect and effective N reported | Ignored clustering → inflated statistical power |
| **Cluster Balance** | Were clusters balanced at baseline? | Baseline characteristics by cluster group | Imbalanced clusters on key variables |
| **Analysis Method** | Was analysis adjusted for clustering? | Mixed-effects models or GEE with cluster random effect | Individual-level analysis ignoring clustering |
| **Contamination** | Could intervention spill over to control clusters? | Physical/temporal separation assessment | Same clinicians in both arms |
| **Number of Clusters** | Sufficient clusters for valid inference? | ≥20 clusters per arm recommended | <10 clusters per arm |

**Rule**: Cluster-randomized trials that ignore ICC in sample size calculation have INFLATED statistical power. Flag: "⚠️ Clustering not accounted for — effective sample size may be much smaller than reported N."
**Rule**: DULCE (Simonetto 2025, Nature Medicine) = pragmatic cluster-RCT with 98 primary care teams. The 2x detection improvement (OR 2.09, P=0.007) is valid BECAUSE clustering was properly handled.
**Rule**: Pragmatic trials have LOWER internal validity but HIGHER external validity than explanatory trials. Assess both dimensions separately.

### Clinician Adherence Assessment

When AI alerts/recommendations are provided to clinicians in pragmatic trials:

| Adherence Level | Description | Impact on Results | Assessment |
|----------------|-------------|-------------------|-----------|
| **High (>80%)** | Clinicians follow most AI recommendations | Results reflect AI's true clinical impact | ITT ≈ per-protocol |
| **Moderate (50-80%)** | Clinicians selectively follow AI | Results underestimate AI's potential; overestimate real-world effect | Report ITT + per-protocol |
| **Low (<50%)** | Clinicians frequently ignore AI | Results reflect implementation failure, not AI capability | Flag: "⚠️ Low adherence — AI impact underestimated" |
| **Selective** | Clinicians follow AI for some conditions/patients but not others | Results biased toward easy cases | Report adherence by case type |

**Rule**: Low clinician adherence in a pragmatic trial does NOT invalidate the trial — it reflects real-world implementation reality. However, it means the ITT effect size underestimates the AI's potential if fully adhered to.
**Rule**: DULCE trial noted clinician non-adherence as a key factor limiting diagnostic yield. This is a FEATURE of pragmatic design, not a bug — it shows what happens in real practice.
**Rule**: Always report adherence rate AND analyze: What would the effect be IF adherence were 100%? (Per-protocol analysis among adherent clinicians)

### Decision Support vs Autonomous Diagnosis Assessment

| System Type | Human Role | AI Role | Validation Requirement | Innovation Implication |
|------------|-----------|---------|----------------------|----------------------|
| **Decision Support** | Makes final decision; AI suggests | Alert/recommendation | Clinician+AI outcome vs clinician alone | Workflow innovation (L2-L3) |
| **Assisted Diagnosis** | Reviews and approves AI output | Provides primary diagnosis | AI accuracy + human override rate | Diagnostic + workflow (L2-L3) |
| **Autonomous Screening** | No human review for negative results | Screens and triages | Sensitivity at high specificity + missed case analysis | Screening innovation (L3-L4) |
| **Autonomous Diagnosis** | None for routine cases | Makes and communicates diagnosis | Full clinical validation + regulatory approval | Autonomous AI (L4-L5) |

**Rule**: Decision support systems should be evaluated on CLINICAL OUTCOMES (did patient outcomes improve?), not just AI accuracy. The question is: "Did the AI change clinician behavior in a way that helped patients?"
**Rule**: aidSurg (Nature Medicine 2025) = Decision Support (personalized perioperative pathways based on AI risk prediction). Innovation is in the CLINICAL IMPLEMENTATION + PERSONALIZED PATHWAY, not just the prediction model.
**Rule**: DULCE = Autonomous Screening (AI flags high-risk patients without clinician request). Innovation is in the SCREENING PARADIGM (using routine ECG for liver disease case-finding), not just the AI model.

## Health Economics Assessment Protocol

When evaluating AI systems that include cost-effectiveness analysis:

| Assessment Dimension | Key Questions | Required Evidence | Red Flag |
|---------------------|--------------|-------------------|---------|
| **Cost per Case Detected** | What is the incremental cost per additional case found? | Cost analysis of AI pathway vs standard care | Only clinical outcomes reported; no cost data |
| **Cost per QALY** | Does the AI improve quality-adjusted life years cost-effectively? | ICER (Incremental Cost-Effectiveness Ratio) | ICER not calculated for clinical AI |
| **Budget Impact** | Can the health system afford to implement this? | Implementation cost + ongoing operational cost | Only per-patient cost; no system-level analysis |
| **Cost Savings** | Does the AI reduce downstream costs? | Reduced complications, readmissions, unnecessary tests | Only reports cost of AI system, not savings |
| **Time Horizon** | Is the economic analysis time horizon appropriate? | ≥1 year for chronic disease; ≥5 year for screening | <1 year time horizon for screening interventions |
| **Sensitivity Analysis** | Are results robust to parameter uncertainty? | One-way + probabilistic sensitivity analysis | No sensitivity analysis; point estimates only |

**Rule**: AI clinical papers that claim "cost-effective" without formal economic evaluation should be flagged: "⚠️ Cost-effectiveness claimed without formal economic analysis."
**Rule**: aidSurg reported $2,800/patient savings from reduced complications. This is a DIRECT health economics outcome, not just clinical improvement.
**Rule**: EAGLE's 43% reduction in molecular testing = cost saving from reduced unnecessary tests. The value of computational biomarkers is in TRIAGE economics, not diagnostic accuracy alone.

## Data Standardization Assessment

When AI systems use standardized data models for reproducibility:

| Standard | Domain | Purpose | Assessment |
|----------|--------|---------|-----------|
| **OMOP CDM** | Clinical/EHR | Common data model for multi-source EHR data | Enables cross-institution reproducibility |
| **FHIR** | Health IT | Interoperability standard for health data | Enables EHR integration |
| **DICOM** | Medical imaging | Standard for radiology data | Required for PACS integration |
| **HL7** | Health IT | Messaging standard for clinical data | Required for EHR communication |
| **CDISC** | Clinical trials | Standards for clinical trial data | Required for regulatory submissions |

**Rule**: AI models built on OMOP CDM have HIGHER reproducibility potential because the data transformation is standardized and auditable.
**Rule**: aidSurg (Nature Medicine 2025) transformed Danish national registry data into OMOP CDM before model development. This is a BEST PRACTICE for clinical AI reproducibility.
**Rule**: If an AI model uses proprietary data formats without standardized transformation, flag: "⚠️ Data not in standard format — reproducibility and integration are limited."

---

## Regulatory Science Framework for Medical AI

### FDA Software as a Medical Device (SaMD) Classification

| Category | Description | Risk Level | Examples | Regulatory Pathway |
|----------|-------------|-----------|----------|-------------------|
| **Class I** | Non-serious illness/injury; not driving clinical management | Low | ECG heart rate display; simple triage | 510(k) exempt; general controls |
| **Class II** | Serious illness/injury; drives clinical management | Medium | AI-ECG arrhythmia detection; CADe (computer-aided detection) | 510(k) with predicate; special controls |
| **Class III** | Life-threatening; drives critical clinical decisions | High | AI diagnostic for autonomous diagnosis; treatment planning | De Novo or PMA (premarket approval) |

### FDA AI/ML Regulatory Pathway Decision Tree

```
Is your AI/ML system a Medical Device?
│
├─ NO: Wellness, administrative, research-only → No FDA regulation
│   → BUT: If marketed for clinical use, it becomes a device
│
└─ YES: SaMD classification needed
    │
    ├─ Is there a legally marketed predicate device?
    │   ├─ YES → 510(k) pathway (most common for AI)
    │   │   → Must demonstrate substantial equivalence
    │   │   → Typical timeline: 3-12 months
    │   │   → Examples: AI-ECG (predicate: conventional ECG analysis)
    │   │
    │   └─ NO → Novel device
    │       ├─ Low-moderate risk → De Novo pathway
    │       │   → Creates new classification regulation
    │       │   → Typical timeline: 6-18 months
    │       │   → Examples: IDx-DR (first autonomous AI diagnostic)
    │       │
    │       └─ High risk → PMA pathway
    │           → Most stringent; requires clinical evidence
    │           → Typical timeline: 1-3 years
    │           → Examples: AI-guided treatment planning
    │
    └─ Is the AI "locked" or "adaptive"?
        ├─ Locked: Algorithm does not change after deployment
        │   → Standard 510(k)/De Novo/PMA
        │   → Most current FDA-cleared AI is locked
        │
        └─ Adaptive: Algorithm continues to learn after deployment
            → FDA Predetermined Change Control Plan (PCCP)
            → Must specify: what changes, how validated, how implemented
            → FDA guidance: "Marketing Submission Recommendations for a Predetermined Change Control Plan"
            → ⚠️ Very few adaptive AI devices cleared as of 2025
```

### FDA-Cleared AI/ML Medical Devices (Key Examples)

| Device | Year | Indication | Pathway | Key Feature | Clinical Evidence |
|--------|------|-----------|---------|-------------|-------------------|
| **IDx-DR** | 2018 | Diabetic retinopathy detection | De Novo | First autonomous AI diagnostic | 900-patient pivotal trial; 87% sensitivity, 90% specificity |
| **HeartFlow FFRCT** | 2014 | Coronary FFR from CT | 510(k) | AI-computed fractional flow reserve | Multiple clinical trials; outcomes data |
| **Viz.ai Contour** | 2018 | Large vessel occlusion detection | 510(k) | Stroke notification AI | Sensitivity 90%+; time-to-treatment reduction |
| **Lung Cancer Assist** | 2021 | Lung nodule risk assessment | 510(k) | CT-based cancer risk | Multi-center validation |
| **GI Genius** | 2021 | Polyp detection during colonoscopy | 510(k) | Real-time polyp detection | ADR improvement demonstrated |
| **DermaSensor** | 2024 | Skin lesion evaluation | De Novo | Handheld spectral analysis | Multi-center study; sensitivity 96% |

**Rule**: FDA clearance does NOT mean the AI is clinically superior — it means the device is "substantially equivalent" to a predicate (for 510(k)) or safe+effective (for De Novo/PMA).
**Rule**: Most FDA-cleared AI devices are CADe (computer-aided detection) or CADx (computer-aided diagnosis) — NOT autonomous diagnostic systems. The clinician is still in the loop.

### EU AI Act — Medical AI Classification

| Risk Category | Description | Examples | Requirements |
|--------------|-------------|---------|-------------|
| **Unacceptable** | Prohibited AI systems | Social scoring, real-time biometric identification (with exceptions) | Banned |
| **High-Risk** | AI systems affecting health, safety, fundamental rights | Medical device AI; clinical decision support | Full compliance: risk management, data governance, transparency, human oversight, accuracy |
| **Limited Risk** | AI with transparency obligations | Chatbots, deepfakes | Transparency: users must be informed they interact with AI |
| **Minimal Risk** | All other AI | Spam filters, games | No specific requirements |

**EU AI Act High-Risk Medical AI Requirements**:

| Requirement | Description | Implementation |
|-------------|-------------|---------------|
| **Risk Management System** | Continuous identification, analysis, mitigation of risks | ISO 14971 risk management; post-market surveillance |
| **Data Governance** | High-quality training data; bias mitigation | Data provenance; representativeness; bias testing |
| **Technical Documentation** | Complete documentation of AI system | Model cards; data sheets; evaluation reports |
| **Transparency** | Users understand AI capabilities and limitations | Clear intended use; performance metrics; known limitations |
| **Human Oversight** | Humans can understand, monitor, override AI | Override capability; alarm systems; audit trails |
| **Accuracy & Robustness** | Specified accuracy levels; resilience to errors | Performance benchmarks; adversarial testing; error handling |
| **Cybersecurity** | Protection against attacks | Encryption; access control; vulnerability management |

**Rule**: EU AI Act applies to ANY AI system placed on the EU market, regardless of where it was developed. US companies must comply for EU deployment.
**Rule**: EU AI Act is MORE stringent than FDA for transparency and human oversight requirements. Plan for the stricter standard.

### EU AI Act Implementation Timeline (2025-2027 Update)

| Date | Milestone | Impact on Medical AI |
|------|-----------|---------------------|
| Aug 2025 | Prohibited AI practices apply | Real-time biometric identification in healthcare banned (with narrow exceptions) |
| Aug 2025 | General-purpose AI (GPAI) obligations apply | Medical LLMs (GPT-4, Med-PaLM) classified as GPAI with systemic risk if >10^25 FLOPS |
| Feb 2026 | High-risk AI system obligations (non-medical) | AI in employment, education, essential services |
| **Aug 2027** | **Medical device AI high-risk obligations apply** | **ALL SaMD under MDR/IVDR automatically classified as high-risk; full compliance required** |
| Aug 2027 | Existing devices with "significant changes" | Legacy devices need compliance only if significantly modified |

**EU AI Act — Dual Compliance Requirements (MDR + AI Act)**:
- Medical AI must comply with BOTH EU MDR (2017/745) / IVDR (2017/746) AND the AI Act
- MDR Notified Body assessment + AI Act conformity assessment = DUAL review
- Technical documentation must address MDR safety AND AI Act transparency/human oversight
- "Placing on the market" refers to individual devices, not device classes — each new device needs compliance
- Key addition over MDR: AI Act requires algorithmic transparency, bias testing, and human override mechanisms that go beyond MDR requirements

**EU AI Act — GPAI Model Obligations for Medical LLMs**:
- Models trained >10^25 FLOPS → systemic risk classification → additional obligations
- Must provide: detailed training data summary, computational resources, evaluation results, cybersecurity measures
- Downstream medical AI deployers must be informed of known risks and limitations
- Copyright compliance for training data (relevant for PubMed/clinical text training)

### CSEDB — Clinical Safety-Effectiveness Dual-Track Benchmark (2026)

**Source**: npj Digital Medicine 2026 — Chinese research team; first global standard for evaluating clinical applicability of medical AI

**Core Framework**: Dual-track evaluation that separates safety assessment from effectiveness assessment:

| Track | Dimension | Metrics | Threshold |
|-------|-----------|---------|-----------|
| **Safety Track** | Diagnostic safety | Missed diagnosis rate, misdiagnosis rate, harm severity | Missed diagnosis <5% for critical conditions |
| **Safety Track** | Treatment safety | Contraindication violation, dosing error, interaction risk | Zero tolerance for life-threatening errors |
| **Safety Track** | Privacy safety | Data leakage, re-identification risk, adversarial vulnerability | HIPAA/GDPR compliance |
| **Effectiveness Track** | Diagnostic effectiveness | Sensitivity, specificity, AUROC, NPV/PPV at clinical thresholds | Must match or exceed clinical standard |
| **Effectiveness Track** | Workflow effectiveness | Time-to-decision, clinician adoption rate, alert fatigue | Net positive workflow impact |
| **Effectiveness Track** | Equity effectiveness | Performance parity across demographics, access equity | <5% performance gap across subgroups |

**Assessment Protocol for CSEDB**:
1. Safety track is MANDATORY before effectiveness evaluation — unsafe AI cannot be effective
2. Dual-track scoring: Safety (0-100) × Effectiveness (0-100) → Composite score requires BOTH >70 for clinical applicability
3. Safety failure in ANY dimension = automatic disqualification regardless of effectiveness
4. Must be evaluated on INDEPENDENT external data (not training institution data)

**Rule**: When evaluating a medical AI paper, check if it addresses BOTH safety and effectiveness. Papers that only report AUROC without safety assessment are INCOMPLETE per CSEDB standards.

### FDA PCCP — Predetermined Change Control Plan (2025 Final Guidance Update)

**Source**: FDA Final Guidance 2025 — Marketing Submission Recommendations for PCCP for AI-Enabled Device Software Functions

**PCCP Three Mandatory Components**:

| Component | Description | Required Content |
|-----------|-------------|-----------------|
| **Description of Modifications** | What will change and when | Specific algorithm modifications; trigger conditions; scope of changes |
| **Modification Protocol** | How changes will be implemented and validated | Data requirements; validation methodology; acceptance criteria; re-training protocol |
| **Impact Assessment** | What effects the modifications will have | Risk analysis; performance comparison; subgroup impact; clinical workflow effects |

**PCCP Implementation Rules (2025 Final Guidance)**:
- PCCP must be submitted as part of ORIGINAL marketing submission (510(k)/De Novo/PMA)
- Modifications WITHIN PCCP scope → no new submission required
- Modifications OUTSIDE PCCP scope → new 510(k)/De Novo/PMA required
- Labeling MUST disclose that PCCP is in use
- Real-world performance data must be collected and reported per PCCP schedule
- PCCP does NOT allow "unlimited" changes — each modification must be pre-specified with validation criteria

**PCCP vs Traditional 510(k) for AI Updates**:

| Aspect | Traditional 510(k) | PCCP Pathway |
|--------|-------------------|-------------|
| Update speed | Months per update | Pre-authorized schedule |
| Validation | Full re-validation per update | Pre-specified validation protocol |
| Regulatory burden | New submission each time | One-time PCCP + ongoing monitoring |
| Suitable for | Locked algorithms | Continually learning algorithms |
| Risk | Lower (each update reviewed) | Higher (pre-authorized, less per-update review) |

**Rule**: PCCP is the ONLY regulatory pathway that allows continual learning in FDA-cleared medical AI. Without PCCP, ANY algorithm update requires a new 510(k).
**Rule**: PCCP does NOT mean "no oversight" — it means "pre-approved oversight with pre-specified validation criteria." The manufacturer must still demonstrate safety and effectiveness for each modification per the PCCP protocol.

### FDA AI/ML Medical Device Landscape (2025 Update)

**Key Statistics**:
- 295 AI/ML medical device 510(k) clearances in 2025 (source: Innolitics year-in-review)
- Cardiology has >200 FDA-cleared AI algorithms (as of March 2026)
- 29 new cardiology AI products cleared June-December 2025
- Notable 2025 clearances: TAVIPILOT (K243884) — first AI-guided TAVI intra-operative positioning; Ligence Heart (K252105) — echocardiography AI

**FDA Total Product Life Cycle Framework for GenAI** (NEJM 2025):
- FDA released framework for guiding GenAI regulation in medicine
- Key principles: continual validation, post-market surveillance, PCCP for adaptive models
- Critical gap: FDA has NOT traditionally performed continuous post-market surveillance — whether it has executive authority to do so is UNCLEAR
- Current administration signals interest in deregulation — tension between innovation speed and safety

**AI Medical Device Clearance Trends**:

| Year | 510(k) Clearances | Key Trend |
|------|-------------------|-----------|
| 2022 | ~180 | Radiology dominant |
| 2023 | ~220 | Cardiology growing |
| 2024 | ~260 | SaMD expanding |
| 2025 | 295 | Multi-specialty; first interventional guidance |

**Rule**: FDA clearance (510(k)) means SUBSTANTIAL EQUIVALENCE to a predicate device, NOT independent safety/efficacy validation. Do NOT equate FDA clearance with clinical validation.
**Rule**: The rapid growth of FDA AI clearances (180→295 in 3 years) does NOT mean the regulatory framework is keeping pace. Most clearances are for LOCKED algorithms, not adaptive/continually learning systems.
**Rule**: GenAI medical tools face a regulatory GAP — existing frameworks were designed for locked algorithms, not models that change over time. PCCP is the first step but implementation challenges remain.

### Clinical Validation Requirements for Regulatory Submission

| Evidence Level | Description | Required For | Example |
|---------------|-------------|-------------|---------|
| **Analytical Validation** | Does the AI measure what it claims? | All SaMD | Accuracy, precision, reproducibility on test set |
| **Clinical Validation** | Does the AI improve clinical outcomes? | Class II/III | Prospective study; clinical endpoint improvement |
| **Clinical Utility** | Does the AI improve patient management? | De Novo/PMA | RCT or robust observational study; patient outcome improvement |

**Clinical Validation Study Design for AI Medical Devices**:

| Design | Strength | Weakness | When to Use |
|--------|----------|----------|-------------|
| **Retrospective validation** | Fast; uses existing data | Selection bias; not prospective | Initial 510(k) with strong predicate |
| **Prospective observational** | Real-world data; clinical setting | No randomization; confounding | De Novo pathway; CADe devices |
| **Cluster-randomized trial** | Pragmatic; tests workflow impact | Complex analysis; contamination | AI decision support systems |
| **Randomized controlled trial** | Gold standard; causal inference | Expensive; slow | High-risk autonomous AI; PMA pathway |
| **Registry-based study** | Large scale; real-world | Data quality varies | Post-market surveillance |

**Rule**: For 510(k) submissions, retrospective validation on a held-out test set is often sufficient. For De Novo, prospective clinical validation is typically required.
**Rule**: The FDA expects patient-wise (not image-wise or case-wise) data splitting for clinical validation. Data leakage in validation is a regulatory red flag.

### Post-Market Surveillance for AI Medical Devices

| Activity | Frequency | Description | Key Metric |
|----------|-----------|-------------|-----------|
| **Performance monitoring** | Continuous | Track real-world accuracy vs premarket | Performance drift; calibration shift |
| **Adverse event reporting** | Per event | Report serious adverse events to FDA | Malfunction rate; patient harm |
| **Annual report** | Annual | Summary of performance, complaints, changes | Overall safety and effectiveness |
| **Software update assessment** | Per update | Determine if update requires new 510(k) | Is the change "significant"? |
| **Bias monitoring** | Continuous | Track performance across subgroups | Disparate accuracy; equity drift |

**Rule**: AI medical devices MUST have post-market surveillance. "Set and forget" is NOT acceptable for adaptive or even locked AI in clinical use.
**Rule**: Performance drift over time is EXPECTED for AI systems — the question is whether drift is detected and managed, not whether it occurs.
**Rule**: The PCCP (Predetermined Change Control Plan) is the FDA's framework for managing AI algorithm updates. Without a PCCP, each significant change requires a new 510(k). For continual learning technical methods (EWC, replay, etc.), see deep-learning-bme.md (Continual & Lifelong Learning section).

### Regulatory Science Assessment Protocol

When evaluating a paper that claims clinical readiness for an AI system:

| Assessment | Key Question | Required Evidence | Red Flag |
|-----------|-------------|-------------------|---------|
| **Regulatory pathway identified** | Has the appropriate regulatory pathway been determined? | 510(k)/De Novo/PMA classification with rationale | No regulatory discussion |
| **Intended use defined** | Is the intended use clearly specified? | Indication, patient population, clinical setting | Vague intended use ("diagnose disease") |
| **Clinical validation adequate** | Is the clinical validation appropriate for the risk level? | Study design matches regulatory requirements | Retrospective-only for high-risk claim |
| **Bias assessment** | Has performance been evaluated across subgroups? | Demographic subgroup analysis; equity metrics | No subgroup analysis |
| **Post-market plan** | Is there a plan for monitoring after deployment? | Surveillance protocol; drift detection | No post-market consideration |
| **Human oversight** | Is there a mechanism for clinician override? | Override capability; alert fatigue assessment | Fully autonomous with no override |

---

## Causal Inference for Medical AI

### Why Causal Inference Matters in BME

Most medical AI studies report associations (correlations), not causal effects. This distinction is critical:
- **Association**: X is correlated with Y (may be confounded)
- **Causation**: Changing X would change Y (intervention effect)

| Scenario | Association Claim | Causal Claim | Evidence Needed |
|----------|-----------------|-------------|----------------|
| **AI alert → faster diagnosis** | Alert timing correlates with diagnosis speed | AI alert CAUSES faster diagnosis | RCT or quasi-experimental design |
| **Biomarker → survival** | Biomarker level correlates with survival | Biomarker CAUSALLY affects survival | Mendelian randomization or RCT |
| **Treatment → outcome** | Treated patients have better outcomes | Treatment CAUSES better outcomes | RCT; propensity score methods if RCT impossible |
| **AI deployment → reduced cost** | Sites with AI have lower costs | AI CAUSES cost reduction | Difference-in-differences; interrupted time series |

### Causal Inference Methods Hierarchy

| Method | Assumptions | Strength | When to Use | Key Limitation |
|--------|-----------|---------|-------------|---------------|
| **RCT** | Random assignment | Gold standard | Feasible; ethical; affordable | Expensive; slow; may not generalize |
| **Propensity score matching** | No unmeasured confounders | Strong | Observational data; treatment assignment observed | Unmeasured confounding cannot be ruled out |
| **Instrumental variables** | Valid instrument | Strong | Unmeasured confounding present | Finding valid instruments is very hard |
| **Difference-in-differences** | Parallel trends | Moderate | Policy change; before-after with control | Parallel trends assumption untestable |
| **Regression discontinuity** | Continuity at threshold | Moderate | Sharp cutoff in treatment assignment | Only estimates effect at threshold |
| **Mendelian randomization** | Genetic instrument valid | Moderate | Biomarker → disease causality | Requires large GWAS; pleiotropy |
| **Interrupted time series** | No concurrent interventions | Weak-Moderate | Single-site policy change | Confounded by concurrent changes |
| **DAG-based adjustment** | Correct DAG | Moderate | Known causal structure | DAG may be wrong |

### Propensity Score Methods

```
Observational Data (treated + untreated)
  ↓
[1] Define Treatment & Outcome
    → Treatment: binary (received AI-assisted diagnosis or not)
    → Outcome: clinical outcome (mortality, length of stay, etc.)
    → ⚠️ Treatment definition must be PRECISE — vague definitions introduce bias
  ↓
[2] Select Confounders
    → Include all variables that affect BOTH treatment and outcome
    → Do NOT include variables affected by treatment (mediators)
    → Do NOT include colliders (variables affected by both treatment and outcome)
    → ⚠️ Use DAG (Directed Acyclic Graph) to guide confounder selection
    → ⚠️ Including too many variables → increases variance; too few → confounding
  ↓
[3] Estimate Propensity Score
    → Logistic regression: P(treatment | confounders)
    → OR: GBM, random forest for flexible estimation
    → Check overlap: propensity score distributions must overlap between groups
    → ⚠️ If overlap is poor, trim to region of common support
  ↓
[4] Apply Propensity Score Method
    → Matching: match treated to nearest untreated on PS (1:1 or 1:k)
    → Stratification: stratify by PS quintiles; estimate within strata
    → Weighting: IPTW (inverse probability of treatment weighting)
    → Doubly robust: PS + outcome regression (BEST practice)
    → ⚠️ Matching is most common; IPTW is most efficient; doubly robust is safest
  ↓
[5] Balance Diagnostics
    → Standardized mean difference (SMD) for each confounder
    → SMD <0.1 = good balance; SMD >0.2 = poor balance
    → ⚠️ If balance is poor, revise PS model (add terms, interactions, splines)
    → ⚠️ Do NOT use p-values for balance assessment — they depend on sample size
  ↓
[6] Estimate Treatment Effect
    → ATT (Average Treatment Effect on Treated): effect on those who received treatment
    → ATE (Average Treatment Effect): effect on entire population
    → Report: effect estimate + 95% CI
    → ⚠️ Sensitivity analysis for unmeasured confounding (E-value, Rosenbaum bounds)
```

**Rule**: Propensity score methods CANNOT account for unmeasured confounders. Always report sensitivity analysis for unmeasured confounding.
**Rule**: SMD <0.1 for ALL confounders after matching is the MINIMUM standard. P-values are NOT appropriate for balance assessment.

### Instrumental Variables for Medical AI

```
Causal Question with Unmeasured Confounding
  ↓
[1] Identify Potential Instrument
    → Must satisfy 3 conditions:
      (a) Relevance: instrument affects treatment
      (b) Independence: instrument is independent of unmeasured confounders
      (c) Exclusion restriction: instrument affects outcome ONLY through treatment
    → ⚠️ Condition (c) is UNTESTABLE and often violated
  ↓
[2] Common Instruments in Medical AI
    → Geographic variation in AI adoption
    → Calendar time (before/after AI deployment)
    → Distance to AI-equipped facility
    → Physician preference for AI (as preference instrument)
    → ⚠️ Each has potential violations — discuss explicitly
  ↓
[3] Two-Stage Least Squares (2SLS)
    → First stage: Treatment = α + β × Instrument + γ × Confounders + ε
    → Second stage: Outcome = δ + θ × Predicted_Treatment + λ × Confounders + η
    → θ is the causal effect estimate
    → ⚠️ Weak instrument (F-statistic <10 in first stage) → biased estimates
  ↓
[4] Diagnostics
    → First-stage F-statistic >10 (Stock-Yogo weak instrument test)
    → Overidentification test (if multiple instruments): Sargan-Hansen test
    → ⚠️ If F <10, instrument is too weak → 2SLS estimates are unreliable
```

**Rule**: Instrumental variable analysis is only as credible as the instrument. A weak or invalid instrument gives WORSE estimates than naive regression.
**Rule**: Always report the first-stage F-statistic. F <10 means the instrument is too weak to trust the IV estimates.

### Difference-in-Differences for AI Deployment Evaluation

```
AI Deployment Study (treatment site + control site)
  ↓
[1] Study Design
    → Treatment site: deployed AI at time T
    → Control site: did not deploy AI (or deployed later)
    → Pre-period: before time T; Post-period: after time T
    → ⚠️ Control site must be comparable to treatment site
  ↓
[2] Parallel Trends Assumption
    → In the ABSENCE of AI, treatment and control would have followed parallel trends
    → Test: pre-period trends should be parallel
    → ⚠️ This is UNTESTABLE for the post-period; pre-period parallelism is suggestive only
  ↓
[3] Estimation
    → DID estimator: (Y_post_treatment - Y_pre_treatment) - (Y_post_control - Y_pre_control)
    → Regression: Y = β₀ + β₁×Post + β₂×Treatment + β₃×Post×Treatment + ε
    → β₃ is the causal effect of AI deployment
    → ⚠️ Cluster standard errors at site level (not individual level)
  ↓
[4] Robustness Checks
    → Event study: plot effects at each time point (should show no pre-trend)
    → Placebo test: apply DID to outcome that AI should NOT affect
    → Vary control group: test with different control sites
    → ⚠️ If event study shows pre-trends, parallel trends is violated
```

**Rule**: DID requires PARALLEL TRENDS. If treatment and control sites had different trajectories before AI deployment, DID estimates are biased.
**Rule**: Always present an event study plot. A flat pre-period with a change at deployment is the strongest visual evidence for a causal effect.

---

## Directed Acyclic Graphs (DAGs) for Medical AI

### DAG Construction Protocol

```
Clinical Research Question
  ↓
[1] Identify Key Variables
    → Exposure (e.g., AI-assisted diagnosis)
    → Outcome (e.g., patient survival)
    → Potential confounders (affect both exposure and outcome)
    → Mediators (on the causal pathway from exposure to outcome)
    → Colliders (affected by both exposure and outcome or their ancestors)
  ↓
[2] Draw the DAG
    → Nodes = variables; Arrows = causal direction
    → Every arrow represents a hypothesized causal effect
    → Absence of arrow = assumed NO direct causal effect
    → ⚠️ DAG encodes ASSUMPTIONS, not truths — must be justified
  ↓
[3] Identify Adjustment Set
    → Use d-separation to find minimal sufficient adjustment set
    → Tools: dagitty.net (online), R package `dagitty`
    → ⚠️ Must adjust for confounders; must NOT adjust for mediators or colliders
  ↓
[4] Common DAG Mistakes
    → Adjusting for a mediator → blocks the causal effect (overcontrol bias)
    → Adjusting for a collider → OPENS a spurious path (collider bias)
    → Not adjusting for a confounder → confounding remains
    → ⚠️ Collider bias is the most insidious — it CREATES spurious associations
```

### Common DAG Patterns in Medical AI

| Pattern | Example | Correct Adjustment | Common Mistake |
|---------|---------|-------------------|---------------|
| **Confounder** | Severity → both AI use and outcome | Adjust for severity | Ignoring severity → confounded estimate |
| **Mediator** | AI → faster diagnosis → outcome | Do NOT adjust for diagnosis speed | Adjusting for mediator → underestimates total effect |
| **Collider** | AI use and outcome both → hospital type | Do NOT adjust for hospital type | Adjusting → creates spurious association |
| **M-bias** | Pre-existing condition → both selection and outcome | Do NOT adjust for selection if it's a collider | Adjusting for selection variable → opens bias path |
| **Instrument** | Hospital policy → AI use | Do NOT adjust for policy (it's an instrument) | Adjusting for instrument → removes variation |

**Rule**: Before any observational causal analysis, draw a DAG. If you cannot draw a DAG, you cannot identify the correct adjustment set.
**Rule**: Adjusting for MORE variables is NOT always better. Adjusting for mediators and colliders introduces bias.

---

## Sample Size & Power for Medical AI Studies

### Sample Size for Diagnostic Accuracy Studies

| Parameter | Formula | Typical Values |
|-----------|---------|---------------|
| **Sensitivity** | n = Z²α/2 × Se(1-Se) / d² | Se=0.90, d=0.05 → n=138 positives |
| **Specificity** | n = Z²α/2 × Sp(1-Sp) / d² | Sp=0.90, d=0.05 → n=138 negatives |
| **AUC** | Obuchowski formula | AUC=0.85, d=0.05 → n≈200 per group |
| **Kappa** | n = (Zα+Zβ)² × P₀(1-P₀) / (P₁-P₀)² | Depends on expected agreement |

### Sample Size for AI Clinical Trials

| Trial Type | Primary Endpoint | Sample Size Driver | Typical Range |
|-----------|-----------------|-------------------|--------------|
| **Diagnostic accuracy** | Sensitivity/Specificity | Precision of estimate | 200-1000 |
| **Non-inferiority** | Margin of non-inferiority | Margin; expected difference | 300-2000 |
| **Superiority (RCT)** | Clinical outcome | Effect size; event rate | 500-10000 |
| **Cluster-randomized** | Cluster-level outcome | ICC; number of clusters | 10-50 clusters |
| **Stepped wedge** | Time-varying outcome | Number of steps; clusters | 6-12 steps |

### Power Analysis Quick Reference

| Effect Size | AUC Difference | Required Sample (per group) | Power |
|------------|---------------|---------------------------|-------|
| **Small** | 0.02-0.03 | 2000-5000 | 80% |
| **Medium** | 0.05 | 500-1000 | 80% |
| **Large** | 0.10 | 100-200 | 80% |

**Rule**: Medical AI studies claiming "non-inferior" to standard of care MUST pre-specify the non-inferiority margin. Post-hoc non-inferiority claims are not valid.
**Rule**: For AI diagnostic accuracy studies, the Buderer method requires at least 100 positive AND 100 negative cases for reliable sensitivity/specificity estimates with precision ±5%.

---

## Survival Analysis for Medical AI

### Core Methods

| Method | Assumption | Output | When to Use | Key R/Python Function |
|--------|-----------|--------|-------------|----------------------|
| **Kaplan-Meier** | Non-parametric; independent censoring | Survival curve S(t) | Descriptive; univariate comparison | `survival::survfit()` / `lifelines.KaplanMeierFitter` |
| **Log-rank test** | Same survival curve in 2+ groups | p-value for difference | Compare groups; no covariate adjustment | `survival::survdiff()` / `lifelines.statistics.logrank_test` |
| **Cox proportional hazards** | Proportional hazards (PH) assumption | HR + CI + p-value | Multivariate; covariate adjustment | `survival::coxph()` / `lifelines.CoxPHFitter` |
| **Competing risks** | Multiple event types | CIF (cumulative incidence) | When competing events exist | `cmprsk::cuminc()` / `lifelines.CumulativeIncidence` |
| **Fine-Gray** | Subdistribution hazard | Sub-HR for specific event | Competing risks with covariates | `cmprsk::crr()` / `pysurvival` |
| **Restricted mean survival time** | No PH assumption required | RMST difference | When PH assumption violated | `survRM2::rmst2()` / custom |
| **Accelerated failure time** | Log-linear effect on survival time | Time ratio | When effect accelerates/decelerates time | `survival::survreg()` / `lifelines.LogNormalAFTFitter` |

### PH Assumption Testing

```
Cox PH Model
  ↓
[1] Schoenfeld Residuals Test
    → Global test: p >0.05 → PH assumption holds
    → Per-covariate test: identifies which covariates violate PH
    → ⚠️ If PH is violated, Cox PH results are INVALID for that covariate
  ↓
[2] Visual Check
    → Log-log plot: parallel lines → PH holds
    → Schoenfeld residual plot: flat line → PH holds
    → ⚠️ Visual checks are subjective; always supplement with formal test
  ↓
[3] If PH is Violated
    → Stratified Cox: stratify by violating covariate
    → Time-varying coefficients: allow HR to change over time
    → RMST: non-parametric alternative; no PH assumption
    → Landmark analysis: analyze at specific time points
```

**Rule**: ALWAYS test the proportional hazards assumption before reporting Cox PH results. Violated PH → misleading hazard ratios.
**Rule**: When comparing AI vs. non-AI survival, report BOTH the hazard ratio AND the RMST difference. HR alone is insufficient if PH is violated.

### Survival Analysis for AI Risk Scores

```
AI Risk Score → Survival Analysis
  ↓
[1] Calibration
    → Group patients by risk score decile
    → Plot observed vs. predicted survival at key timepoints (1yr, 3yr, 5yr)
    → ⚠️ AI risk scores must be CALIBRATED for survival prediction, not just ranked
  ↓
[2] Discrimination
    → Time-dependent AUC (C-index for survival)
    → C-index >0.7 = acceptable; >0.8 = good; >0.9 = excellent
    → ⚠️ Standard AUC is NOT appropriate for censored survival data
    → Use time-dependent AUC: `survivalROC`, `timeROC` packages
  ↓
[3] Decision Curve Analysis
    → Net benefit of using AI risk score for treatment decisions
    → Compare to "treat all" and "treat none" strategies
    → ⚠️ Discrimination + calibration are NOT sufficient — clinical utility requires DCA
  ↓
[4] Reclassification
    → NRI (Net Reclassification Improvement): does AI reclassify patients correctly?
    → IDI (Integrated Discrimination Improvement): continuous version of NRI
    → ⚠️ NRI can be misleading — always report with calibration and DCA
```

**Rule**: For AI models predicting survival, report: (1) C-index, (2) calibration plot, (3) decision curve analysis, and (4) time-dependent AUC at clinically relevant timepoints. C-index alone is INSUFFICIENT.

---

## Competing Risks & Composite Endpoints

### When to Use Competing Risks

| Scenario | Competing Event | Naive KM Bias | Correct Method |
|----------|----------------|--------------|----------------|
| **Cancer mortality** | Death from other causes | Overestimates cancer-specific survival | Fine-Gray; CIF |
| **CV event in elderly** | Non-CV death | Overestimates CV event rate | Fine-Gray; CIF |
| **Graft failure** | Death with functioning graft | Overestimates graft failure rate | Fine-Gray; CIF |
| **Device revision** | Death before revision | Overestimates revision rate | Fine-Gray; CIF |
| **Readmission** | Death during index admission | Overestimates readmission rate | Fine-Gray; CIF |

**Rule**: When the competing event rate exceeds 10%, Kaplan-Meier with censoring produces MEANINGFUL bias. Use competing risks methods.
**Rule**: In elderly populations or studies with long follow-up, competing risks are almost always present. Default to competing risks analysis.

### Composite Endpoint Design

| Component | Consideration | Example |
|-----------|-------------|---------|
| **Clinical relevance** | Are all components clinically meaningful? | CV death + MI + stroke (MACE) = standard |
| **Direction consistency** | Do all components move in the same direction? | Death + hospitalization = consistent; death + symptom improvement = inconsistent |
| **Frequency** | Are components of similar frequency? | If death is 1% and hospitalization is 30%, death is swamped |
| **Attribution** | Can events be independently adjudicated? | CV death is adjudicable; "worsening" is subjective |
| **Sensitivity** | Does the composite detect treatment effects? | If only one component drives the signal, the composite is misleading |

**Rule**: Composite endpoints must have CLINICALLY MEANINGFUL components that are expected to move in the SAME direction. Do not combine death with improvement metrics.
**Rule**: When reporting composite endpoint results, ALWAYS report individual component rates. A significant composite driven by a soft endpoint (hospitalization) while hard endpoints (death) show no benefit is misleading.

---

## Missing Data Handling for Medical AI

### Missing Data Mechanisms

| Mechanism | Definition | Example | Valid Approach |
|-----------|-----------|---------|---------------|
| **MCAR** (Missing Completely at Random) | Missingness unrelated to any variable | Lab sample accidentally dropped | Complete case analysis is unbiased (but inefficient) |
| **MAR** (Missing at Random) | Missingness related to OBSERVED variables | Sicker patients have more missing labs (severity is observed) | Multiple imputation; inverse probability weighting |
| **MNAR** (Missing Not at Random) | Missingness related to UNOBSERVED value | Patients with high pain scores drop out (pain is the missing value) | Sensitivity analysis; pattern-mixture models; selection models |

**Rule**: You CANNOT determine the missing data mechanism from the data alone. Clinical knowledge is required. Assume MAR for primary analysis; test MNAR in sensitivity analysis.
**Rule**: Complete case analysis (dropping rows with missing data) is ONLY valid under MCAR. Under MAR or MNAR, it produces biased estimates.

### Missing Data Handling Strategies

| Strategy | When Appropriate | Bias Risk | Efficiency | Implementation |
|----------|-----------------|----------|-----------|---------------|
| **Complete case** | MCAR; <5% missing | Low (MCAR); High (MAR/MNAR) | Low | Default in most software |
| **Mean/median imputation** | NEVER for analysis | Very high (underestimates variance) | False precision | DO NOT USE for final analysis |
| **Multiple imputation (MICE)** | MAR; 5-50% missing | Low (if correctly specified) | High | `mice` (R); `sklearn.impute.IterativeImputer` |
| **Inverse probability weighting** | MAR; monotone missingness | Moderate | Moderate | `survey` package (R) |
| **Maximum likelihood (FIML)** | MAR; structural models | Low | High | `lavaan` (R); Mplus |
| **Last observation carried forward** | NEVER for analysis | High (biases toward baseline) | False precision | DO NOT USE |
| **Indicator method** | NEVER for analysis | High (biases estimates) | Misleading | DO NOT USE |
| **Deep learning imputation** | MAR; complex patterns | Unknown (less studied) | Potentially high | Research only; not validated for clinical use |

### Multiple Imputation Protocol

```
Dataset with Missing Values
  ↓
[1] Assess Missingness Pattern
    → Which variables have missing data? What percentage?
    → Is missingness monotone (cascade) or arbitrary?
    → ⚠️ If >50% missing on a variable, consider excluding it
  ↓
[2] Choose Imputation Model
    → MICE (Multiple Imputation by Chained Equations): most flexible; recommended
    → Include ALL analysis variables + auxiliary variables in imputation model
    → ⚠️ Imputation model must be at least as rich as analysis model
    → ⚠️ Include the OUTCOME variable in imputation model (counter-intuitive but correct)
  ↓
[3] Generate Imputed Datasets
    → m = 5-20 imputed datasets (5 is minimum; 20 for high missingness)
    → Check convergence of imputation algorithm
    → ⚠️ If imputation chains haven't converged, results are unreliable
  ↓
[4] Analyze Each Imputed Dataset
    → Run analysis model on each of m datasets separately
    → Obtain point estimates and standard errors from each
  ↓
[5] Pool Results (Rubin's Rules)
    → Pooled estimate = mean of m estimates
    → Pooled SE = √(within-imputation variance + between-imputation variance + between/m)
    → ⚠️ Degrees of freedom adjusted for number of imputations
  ↓
[6] Sensitivity Analysis
    → Test MNAR assumptions: pattern-mixture; delta-adjustment
    → Report how results change under MNAR assumptions
    → ⚠️ If conclusions change under plausible MNAR, results are NOT robust
```

**Rule**: ALWAYS include the outcome variable in the imputation model. Excluding it biases imputed values toward the null.
**Rule**: Mean imputation, last observation carried forward, and indicator methods are NEVER acceptable for medical AI research. They produce biased estimates and false precision.
**Rule**: Report the percentage of missing data for EACH variable and the total percentage of complete cases. If complete case analysis and multiple imputation give different conclusions, the missing data mechanism is likely MNAR.

### Missing Data in AI Model Training

| Scenario | Problem | Solution |
|----------|---------|---------|
| **Training data missingness** | Model learns from incomplete features | Impute BEFORE training; include missingness indicators |
| **Deployment missingness** | Different missingness pattern than training | Monitor missingness drift; retrain if pattern changes |
| **Label missingness** | Outcome not observed for all patients | Inverse probability weighting; multiple imputation |
| **Missing not at random in EHR** | Sicker patients have MORE data (not less) | ⚠️ "Missingness" in EHR is often a SIGNAL, not noise |
| **AI-predicted missingness** | AI model creates missing data (refuses to predict) | Report refusal rate; analyze who is refused |

**Rule**: In EHR data, missingness is often INFORMATIVELY MISSING. A patient with no lab tests may be HEALTHIER than one with many tests. "Missing" can be a feature, not a bug.
**Rule**: When deploying AI models, track the REFUSAL RATE (cases where the model cannot produce a prediction due to missing inputs). High refusal rate = model not applicable to real clinical population.

---

## Clinical Decision Support Systems (CDSS) Integration

### CDSS Architecture Levels

| Level | Name | AI Role | Clinician Role | Example | Regulatory Class |
|-------|------|---------|---------------|---------|-----------------|
| **L0** | Information only | Display data | Full decision | Lab result display | Non-SaMD |
| **L1** | Alerting | Flag abnormal values | Evaluate & act | Critical lab alert | Low-risk SaMD |
| **L2** | Suggestion | Recommend action | Accept/modify/reject | Antibiotic suggestion | Medium-risk SaMD |
| **L3** | Guided | Provide reasoning + recommendation | Final approval | AI-assisted diagnosis | Medium-high risk |
| **L4** | Supervised autonomous | Act with oversight | Monitor & intervene | Closed-loop insulin pump | High-risk SaMD |

### Alert Fatigue — The #1 CDSS Failure Mode

| Metric | Definition | Target | Clinical Impact |
|--------|-----------|--------|----------------|
| **Alert volume** | Alerts per clinician per shift | <10/shift | >50/shift → 90% override rate |
| **Override rate** | % of alerts dismissed without action | <50% | >90% → system is noise, not signal |
| **True positive rate** | % of alerts that are clinically appropriate | >80% | <20% → clinician trust destroyed |
| **Appropriate override rate** | % of overrides that were correct clinical decisions | <30% | >70% → alerts are wrong too often |
| **Alert-to-action time** | Time from alert to clinical response | <5 min | >15 min → alert is not actionable |

### Alert Fatigue Mitigation Protocol

```
CDSS with Alert System
  ↓
[1] Tier Alerts by Severity
    → Critical (life-threatening): interruptive; must acknowledge
    → Warning (potential harm): interruptive; can override with reason
    → Advisory (informational): non-interruptive; passive display
    → ⚠️ If ALL alerts are interruptive, clinicians override ALL of them
  ↓
[2] Context-Aware Filtering
    → Suppress duplicate alerts within time window
    → Suppress alerts already addressed (e.g., antibiotic already ordered)
    → Suppress alerts for conditions the patient already has documented
    → ⚠️ Context suppression can SUPPRESS IMPORTANT alerts — audit regularly
  ↓
[3] Personalize by Clinician Role
    → Nurse: different alert set than physician
    → Specialist: suppress generalist alerts
    → ⚠️ One-size-fits-all alerting is the primary cause of fatigue
  ↓
[4] Measure & Iterate
    → Monthly: override rate, appropriate override rate, near-miss events
    → Quarterly: alert effectiveness review with clinical committee
    → ⚠️ If override rate >90%, the alert system needs redesign, not more alerts
  ↓
[5] Human Factors Design
    → Clear, specific language: "Potassium 6.2 — critical hyperkalemia"
    → NOT: "Abnormal lab value detected"
    → Include suggested action: "Consider calcium gluconate + insulin/dextrose"
    → ⚠️ Alerts without suggested actions are USELESS — they add cognitive load without guidance
```

### Human-AI Collaboration Framework

| Collaboration Mode | AI Role | Human Role | When to Use | Risk |
|-------------------|---------|-----------|-------------|------|
| **AI-first** | AI makes prediction; human reviews | Override if needed | High-volume screening (DR, CXR) | Automation bias; human rubber-stamps |
| **Human-first** | Human makes decision; AI provides second opinion | Primary decision-maker | Complex clinical decisions | AI ignored when it should be followed |
| **Parallel** | Both independently; flag disagreements | Resolve disagreements | High-stakes decisions | Disagreement resolution unclear |
| **Sequential** | AI triages; human handles flagged cases | Handle AI-uncertain cases | Triage & routing | Triage errors propagate |
| **Adaptive** | AI confidence determines mode | High confidence → AI; Low → human | Resource-constrained settings | Confidence miscalibration |

### Automation Bias Prevention

| Bias Type | Description | Prevention |
|-----------|------------|-----------|
| **Automation bias** | Over-reliance on AI; failing to detect AI errors | Regular case review; AI errors shown explicitly |
| **Algorithm aversion** | Under-reliance after seeing AI make mistakes | Show AI error rate in context; compare to human error rate |
| **Confirmation bias** | Accepting AI output that confirms prior belief | Present AI output BEFORE showing human assessment |
| **Anchoring bias** | AI output anchors subsequent human judgment | Present AI as "second opinion" not "first read" |
| **Default bias** | Accepting AI suggestion because it's the default | Require active choice; make override as easy as accept |

**Rule**: CDSS must be evaluated on CLINICAL OUTCOMES, not just model accuracy. A highly accurate model that clinicians ignore has ZERO clinical impact.
**Rule**: Alert fatigue is a PATIENT SAFETY issue, not a usability issue. Every unnecessary alert increases the chance that a critical alert will be missed.
**Rule**: The optimal human-AI collaboration mode depends on the TASK, not the technology. Screening tasks → AI-first; complex diagnosis → Human-first.
**Rule**: Measure AUTOMATION BIAS explicitly: compare clinician accuracy WITH AI vs WITHOUT AI. If WITH AI is worse for cases where AI is wrong, automation bias is present.

---

## Public Health & Epidemiological AI

### Public Health AI Tasks

| Task | Data Source | AI Method | Output | Key Challenge |
|------|-----------|-----------|--------|---------------|
| **Disease surveillance** | EHR, claims, syndromic data | Anomaly detection; time series | Outbreak signal | Lag vs. specificity tradeoff |
| **Outbreak prediction** | Mobility, climate, case data | Compartmental models + ML | Forecast cases | Non-stationarity; intervention effects |
| **Vaccine effectiveness** | Claims, registries, EHR | Causal inference (test-negative design) | VE estimate | Confounding; waning immunity |
| **Epidemic curve nowcasting** | Hospital admissions, testing | Bayesian nowcasting | Current case estimate | Reporting delays; right-truncation |
| **Syndromic surveillance** | ED visits, OTC sales, search trends | NLP + anomaly detection | Early warning | False alarms; seasonal patterns |
| **Contact tracing** | Proximity data, location | Graph analysis | Exposure risk | Privacy; participation bias |

### Epidemiological AI Evaluation

| Metric | Description | Good Value | Note |
|--------|------------|-----------|------|
| **Lead time** | How early before traditional detection | >1 week | Earlier = more valuable but less certain |
| **False alert rate** | Alerts that don't correspond to real outbreaks | <2/month | Too many false alerts → alert fatigue (same as CDSS) |
| **Detection sensitivity** | Fraction of real outbreaks detected | >80% | Missed outbreaks = public health failure |
| **Forecast skill** | MAE / log-score for case predictions | Better than baseline | Compare to simple exponential growth |
| **Calibration** | Predicted vs. observed case counts | Within 95% PI | Over/under-prediction both harmful |

### Outbreak Prediction Pipeline

```
Multi-Source Data (cases, mobility, climate, behavior)
  ↓
[1] Data Integration
    → Temporal alignment: different reporting frequencies (daily/weekly)
    → Spatial alignment: different geographic granularities
    → ⚠️ Reporting delays are UBIQUITOUS — always nowcast before forecasting
  ↓
[2] Feature Engineering
    → Lag features: cases at t-7, t-14, t-21
    → Mobility indices: aggregated, anonymized movement data
    → Climate: temperature, humidity (seasonal drivers)
    → Intervention indicators: NPIs, vaccination coverage
    → ⚠️ Intervention features are CRITICAL — models without them over-predict during lockdowns
  ↓
[3] Model Selection
    → SIR/SEIR + ML correction: mechanistic + data-driven (recommended)
    → Pure ML (LSTM, Transformer): flexible; ignores epidemiology
    → Ensemble: combine multiple models; most robust
    → ⚠️ Pure ML models failed dramatically during COVID — they could not extrapolate
  ↓
[4] Evaluation
    → Out-of-sample temporal validation (NOT random split)
    → Evaluate on MULTIPLE locations and time periods
    → ⚠️ Random train-test split for time series is DATA LEAKAGE
  ↓
[5] Communication
    → Show uncertainty (prediction intervals, not point estimates)
    → Scenario projections (with/without intervention)
    → ⚠️ Overconfident forecasts erode public trust
```

**Rule**: Epidemiological AI models must be evaluated on OUT-OF-SAMPLE TEMPORAL data. Random splitting of time series is scientific malpractice.
**Rule**: Mechanistic models (SIR/SEIR) + ML correction outperform pure ML for outbreak prediction. Epidemiological structure is prior knowledge — use it.
**Rule**: COVID-19 showed that most ML outbreak prediction models FAILED when conditions changed. Models must be evaluated on their ability to handle REGIME CHANGES, not just smooth extrapolation.

---

## Reinforcement Learning for Treatment Optimization

### RL in Medicine — Problem Formulation

| Component | Clinical Meaning | Example (Sepsis) | Example (Ventilation) |
|-----------|-----------------|-------------------|----------------------|
| **State (S)** | Patient condition | Vitals, labs, SOFA score | P/F ratio, plateau pressure, FiO2 |
| **Action (A)** | Treatment decision | Vasopressor dose; IV fluid volume | Tidal volume; PEEP level |
| **Reward (R)** | Clinical outcome | +1 survival; -1 death; intermediate penalties | +1 extubation success; -1 mortality |
| **Transition** | Disease dynamics | Sepsis progression under treatment | Lung mechanics change under ventilation |
| **Policy (π)** | Treatment strategy | "If SOFA >10 and MAP <65 → norepinephrine" | "If P/F <150 → increase PEEP by 2" |
| **Horizon** | Treatment duration | ICU stay (days) | Ventilation duration (days) |

### RL Approaches for Medical AI

| Approach | Data Requirement | Safety | Off-Policy? | Best For | Key Challenge |
|----------|-----------------|--------|-------------|---------|---------------|
| **Dynamic Treatment Regimes (DTR)** | RCT or observational | High (Q-learning with bounds) | Yes | Optimal treatment sequences | Requires strong unconfounding |
| **Offline RL (BCQ, CQL)** | Observational EHR | Moderate (conservative) | Yes | Learning from historical data | Distribution shift; overestimation |
| **Batch RL (FQI)** | Observational | Moderate | Yes | Policy evaluation from batch data | Need accurate model of environment |
| **Online RL** | Interactive | LOW (exploration risk) | No | Adaptive interventions | Cannot explore freely in medicine |
| **RL from Demonstrations (RLfD)** | Expert trajectories | High (constrained by expert) | Yes | Imitating expert + improvement | Expert suboptimality ceiling |
| **Safe RL (CPO, constrained MDP)** | Varies | Highest (hard constraints) | Varies | Safety-critical optimization | Defining safety constraints correctly |

### Offline RL from EHR — Pipeline

```
Historical EHR Data (clinician decisions + patient outcomes)
  ↓
[1] State Representation
    → Select clinically relevant features (vitals, labs, demographics)
    → Handle missing data: forward-fill + missing indicators
    → Discretize time: hourly or 4-hourly bins
    → ⚠️ State representation is the MOST IMPORTANT design choice
    → ⚠️ Including too many features → curse of dimensionality; too few → Markov assumption violated
  ↓
[2] Action Space Definition
    → Discrete: drug dose bins (0, low, medium, high)
    → Continuous: exact dose (harder to learn; more clinically realistic)
    → Multi-action: simultaneous vasopressor + IV fluid (much harder)
    → ⚠️ Action space must match CLINICAL DECISION POINTS, not data availability
  ↓
[3] Reward Design (CRITICAL)
    → Sparse terminal reward: +100 survival, -100 death
    → Shaped reward: intermediate penalties for organ dysfunction
    → Composite reward: survival + cost + quality of life
    → ⚠️ Reward design ENCODES VALUES — what you optimize is what you get
    → ⚠️ Sparse rewards lead to HIGH VARIANCE; shaped rewards lead to REWARD HACKING
  ↓
[4] Confounding Adjustment (MANDATORY)
    → Problem: treatment assignment depends on unobserved severity
    → Methods: inverse probability weighting (IPW); doubly robust estimation
    → ⚠️ WITHOUT confounding adjustment, RL learns the OBSERVATIONAL policy, not the OPTIMAL policy
    → ⚠️ Unmeasured confounders CANNOT be fixed by any statistical method
  ↓
[5] Policy Learning
    → Q-learning: learn Q(s,a); select argmax_a Q(s,a)
    → Policy gradient: directly optimize π(a|s)
    → Conservative Q-learning (CQL): penalize out-of-distribution actions
    → ⚠️ Standard Q-learning OVERESTIMATES Q-values for unseen actions — use CQL
  ↓
[6] Policy Evaluation (OFFLINE — cannot deploy to test)
    → Importance sampling: high variance; unbiased
    → Doubly robust: lower variance; recommended
    → Fitted Q-Evaluation (FQE): model-based; lowest variance
    → ⚠️ Offline policy evaluation is an UNSOLVED problem — estimates can be very biased
  ↓
[7] Clinical Validation
    → Compare learned policy to observed clinician policy
    → Expert review: do RL recommendations make clinical sense?
    → ⚠️ RL policies that outperform clinicians on EHR data may be exploiting DATA ARTIFACTS
    → ⚠️ The ONLY reliable validation is a PROSPECTIVE TRIAL — but this is rarely done
```

### RL for Treatment — Critical Pitfalls

| Pitfall | Description | Impact | Mitigation |
|---------|------------|--------|-----------|
| **Unmeasured confounding** | Severity not captured in EHR → biased policy | Learned policy may harm patients | Sensitivity analysis; domain expert review |
| **Reward hacking** | Policy optimizes reward but not true clinical goal | Non-clinical behavior | Careful reward design; clinical constraints |
| **Distribution shift** | Learned policy differs from data-generating policy | Q-value overestimation | Conservative RL (CQL); importance weighting |
| **Action space mismatch** | RL actions don't match real clinical options | Non-deployable policy | Clinician-informed action space |
| **Non-stationarity** | Clinical practice changes over time | Outdated policy | Time-aware modeling; periodic retraining |
| **Evaluation impossibility** | Cannot safely test RL policy on patients | Unknown real-world performance | Offline evaluation + simulation + cautious deployment |

**Rule**: RL for treatment optimization is RESEARCH, not clinical practice. No RL-derived treatment policy has been validated in a prospective RCT for complex clinical decisions (as of 2025).
**Rule**: Unmeasured confounding is the FUNDAMENTAL LIMITATION of offline RL from EHR. If severity affects both treatment and outcome but isn't measured, the learned policy is BIASED. No statistical method can fix this.
**Rule**: Always compare RL policy to the OBSERVED clinician policy, not to a fixed baseline. If the RL policy doesn't outperform observed practice by a meaningful margin, it's not worth the risk of deployment.
**Rule**: Reward design is a CLINICAL and ETHICAL decision, not a technical one. "Survival" as sole reward ignores quality of life, cost, and patient preferences. Involve clinicians and patients in reward design.

---

## Medical AI Data Engineering

### Healthcare Data Standards

| Standard | Domain | Purpose | Key Feature | Maturity |
|----------|--------|---------|-------------|---------|
| **FHIR (HL7)** | Clinical data exchange | RESTful API for EHR data | Resource-based; JSON/XML; widely adopted | Production |
| **HL7 v2** | Clinical messaging | Legacy hospital messaging | Pipe-delimited; still dominant in hospitals | Legacy |
| **OMOP CDM** | Research data model | Standardized analytics on EHR | Person-centric; vocabulary-mapped; SQL | Production |
| **PCORnet CDM** | Research data model | Patient-centered outcomes research | Similar to OMOP; US-focused | Production |
| **i2b2** | Research data warehouse | Cohort discovery | Star schema; ontology-driven | Production |
| **DICOM** | Medical imaging | Image storage and transmission | Tag-based; network protocol; PACS | Production |
| **OpenEHR** | Clinical data modeling | Archetype-based EHR | Dual-model; future-proof | Emerging |

### FHIR for AI Research

```
FHIR Server (Epic, Cerner, HAPI FHIR)
  ↓
[1] Resource Selection
    → Patient: demographics
    → Condition: diagnoses (ICD-10)
    → Observation: labs, vitals
    → MedicationRequest: prescriptions
    → Procedure: interventions
    → DiagnosticReport: imaging, pathology
    → ⚠️ Not all EHR data is available via FHIR — check implementation guide
  ↓
[2] Data Extraction
    → FHIR API: GET /Patient/{id}/Observation?code=...
    → Bulk FHIR: export entire patient cohorts (FHIR Bulk Data)
    → SMART on FHIR: OAuth2-based app authorization
    → ⚠️ FHIR APIs vary by EHR vendor — same resource may have different extensions
  ↓
[3] Data Transformation
    → FHIR → flat table: one row per patient; one column per feature
    → Handle nested resources: Observation.component → multiple features
    → Time alignment: observations at different times → time series
    → ⚠️ FHIR → ML-ready format is NON-TRIVIAL; use FHIR pipelines (e.g., FHIR-Data-Lake)
  ↓
[4] Vocabulary Mapping
    → Local codes → standard codes (via ConceptMap resource)
    → LOINC for labs; SNOMED for conditions; RxNorm for medications
    → ⚠️ Code mapping is LOSSY — not all local codes have standard equivalents
```

### OMOP CDM for Research

```
Source EHR Data → ETL → OMOP CDM
  ↓
[1] Vocabulary Mapping
    → Map local diagnosis codes → SNOMED/ICD-10
    → Map local drug codes → RxNorm
    → Map local lab codes → LOINC
    → Tools: Usagi (manual mapping); ATHENA (vocabulary download)
    → ⚠️ Unmapped codes are a DATA QUALITY issue — track mapping coverage
  ↓
[2] Data Quality Assessment (DQD)
    → Achilles: automated data quality profiling
    → Data Quality Dashboard (DQD): 2000+ quality checks
    → Key checks: completeness; consistency; plausibility; conformance
    → ⚠️ OMOP CDM quality ≠ clinical data quality — a valid OMOP record can still be clinically wrong
  ↓
[3] Cohort Definition
    → ATLAS: web-based cohort definition tool
    → Define inclusion/exclusion criteria using standard vocabularies
    → Generate SQL for cohort extraction
    → ⚠️ Cohort definition is the MOST IMPORTANT step — garbage in, garbage out
  ↓
[4] Feature Extraction
    → FeatureExtraction R package: 2000+ pre-built features
    → Covariates: demographics, conditions, drugs, observations, procedures
    → Time windows: any time prior; 365d prior; 30d prior
    → ⚠️ Feature selection must be done CAREFULLY to avoid data leakage
```

### Data Quality Framework for Medical AI

| Dimension | Definition | Check Method | Threshold | Example Violation |
|-----------|-----------|-------------|-----------|-------------------|
| **Completeness** | Are all expected values present? | Missing rate per variable | <10% for key variables | 40% missing lab values |
| **Consistency** | Do related values agree? | Cross-variable validation | <5% inconsistency | Male patient with pregnancy code |
| **Timeliness** | Is data available when needed? | Lag between event and availability | <24h for clinical use | 3-month delay in claims data |
| **Accuracy** | Do values reflect reality? | Comparison to gold standard | >95% agreement | Wrong patient weight (units error) |
| **Uniqueness** | Are there duplicate records? | Deduplication checks | <1% duplicates | Same encounter recorded twice |
| **Validity** | Do values conform to expected ranges? | Range checks; value set checks | <1% out-of-range | Heart rate = 999 |
| **Provenance** | Can data be traced to source? | Audit trail; lineage tracking | 100% traceability | Unknown data origin |

**Rule**: Data quality issues are the #1 cause of medical AI failure in production. A perfect model on dirty data produces garbage.
**Rule**: OMOP CDM is the RECOMMENDED data model for medical AI research. It provides standardization, vocabulary mapping, and tooling that raw EHR data lacks.
**Rule**: FHIR is the standard for DATA ACCESS; OMOP is the standard for DATA ANALYSIS. Use FHIR to extract; OMOP to analyze.
**Rule**: Always run Data Quality Dashboard (DQD) on OMOP data BEFORE using it for AI research. Unchecked data quality leads to silent model failures.

---

## Emergency & Critical Care AI

### Critical Care AI Task Landscape

| Task | Data Source | AI Method | Output | Clinical Readiness | Key Challenge |
|------|-----------|-----------|--------|-------------------|---------------|
| **Sepsis onset prediction** | EHR vitals, labs | XGBoost; LSTM; Transformer | Sepsis probability (0-6h ahead) | FDA-cleared (InSight by Dascena) | Label definition (Sepsis-3 vs SIRS); alert fatigue |
| **Deterioration prediction** | EHR vitals, labs, nursing notes | Gradient boosting; LSTM | Deterioration risk score | Deployed (many hospitals) | Defining "deterioration"; action threshold |
| **Cardiac arrest prediction** | EHR vitals, labs | Survival analysis; LSTM | Arrest probability (1-72h) | Research | Extremely low base rate; false positives |
| **ICU readmission** | Discharge summary + vitals | Classification | Readmission risk | Research | Readmission ≠ deterioration |
| **Ventilator weaning** | Ventilator parameters + vitals | RL; classification | Readiness score | Research | Weaning protocol varies by ICU |
| **Acute kidney injury prediction** | EHR labs, vitals, medications | XGBoost; LSTM | AKI stage progression | Emerging | Creatinine lag; definition debate |
| **ED triage** | Vitals, chief complaint, demographics | NLP + classification | Acuity level (ESI 1-5) | Emerging | Over-triage vs under-triage tradeoff |
| **Mortality prediction** | EHR comprehensive | Ensemble; survival | In-hospital mortality probability | Deployed (APACHE, SOFA enhanced) | Calibration; actionability |

### Early Warning Scores — Traditional vs AI

| Score | Year | Inputs | Output | AUROC (deterioration) | Limitation |
|-------|------|--------|--------|----------------------|-----------|
| **MEWS** | 2001 | 5 vitals | 0-20 score | 0.70-0.75 | Manual; intermittent; low specificity |
| **NEWS2** | 2012 | 7 vitals + SpO2 scale | 0-20 score | 0.73-0.78 | UK-specific; no labs |
| **ViEWS** | 2014 | 8 vitals | Continuous score | 0.78-0.82 | No labs; no trends |
| **eCART** | 2014 | Vitals + labs + nursing assessments | Risk probability | 0.82-0.87 | Proprietary; black-box |
| **TREWS** | 2022 | Vitals + labs + notes (ML) | Sepsis risk | 0.85-0.90 | Sepsis definition dependent |
| **AI-EWS (custom)** | 2023+ | All EHR + trends + NLP | Risk probability | 0.85-0.92 | Validation gap; alert fatigue |

### Sepsis Prediction — The Most Studied Critical Care AI Task

```
ICU/ED Patient Data (real-time EHR streaming)
  ↓
[1] Feature Engineering (CRITICAL)
    → Static: age, sex, comorbidities, admission type
    → Vitals: HR, MAP, RR, Temp, SpO2 (trend features: slope, variance)
    → Labs: WBC, lactate, creatinine, bilirubin, platelets
    → Medications: antibiotics, vasopressors, IV fluids
    → Time windows: last 1h, 6h, 12h, 24h
    → ⚠️ Feature engineering is MORE IMPORTANT than model choice for sepsis prediction
    → ⚠️ Lactate is the SINGLE MOST PREDICTIVE lab feature for sepsis
  ↓
[2] Label Definition (THE #1 CONTROVERSY)
    → Sepsis-3: suspected infection + SOFA ≥2 (consensus; delayed)
    → Sepsis-1 (SIRS): ≥2 SIRS criteria + suspected infection (sensitive; non-specific)
    → Composite: antibiotic + culture order + organ dysfunction (operational)
    → ⚠️ Label choice changes AUROC by 5-15% — comparing across labels is meaningless
    → ⚠️ Sepsis-3 label has INHERENT DELAY (SOFA score requires lab results)
    → ⚠️ Using Sepsis-3 as label for "early" prediction is CIRCULAR — you're predicting what already happened
  ↓
[3] Model Architecture
    → XGBoost: best for tabular EHR; fast; interpretable; recommended baseline
    → LSTM/GRU: captures temporal trends; slower; less interpretable
    → Transformer: best long-range context; heaviest; overkill for most sepsis tasks
    → ⚠️ XGBoost with good features OUTPERFORMS LSTM with basic features — features > architecture
  ↓
[4] Prediction Horizon
    → 1h ahead: high accuracy; low clinical value (too late to intervene)
    → 6h ahead: moderate accuracy; clinically actionable (recommended)
    → 24h ahead: lower accuracy; strategic value (resource planning)
    → ⚠️ Shorter horizons inflate AUROC; longer horizons are more clinically useful
    → ⚠️ AUROC without prediction horizon is MEANINGLESS
  ↓
[5] Evaluation (BEYOND AUROC)
    → AUROC: 0.85-0.92 typical; necessary but not sufficient
    → Calibration: Brier score; calibration plot (MUST be well-calibrated for clinical use)
    → Decision curve: net benefit at different thresholds
    → Time-to-event: early detection benefit quantification
    → Alert burden: alerts per true positive (clinical workflow impact)
    → ⚠️ A model with AUROC 0.90 but poor calibration is CLINICALLY USELESS
    → ⚠️ If the model generates 50 alerts per shift with 5 true positives, clinicians will ignore it
  ↓
[6] Deployment Considerations
    → Real-time: EHR integration; FHIR-based data pipeline
    → Alert design: interruptive vs passive; with suggested actions
    → Feedback loop: track outcomes of AI-alerted vs non-alerted patients
    → ⚠️ The InSight sepsis model (FDA-cleared) showed NO MORTALITY BENEFIT in external validation
    → ⚠️ FDA clearance ≠ clinical benefit — prospective RCT evidence is still lacking
```

### ED Triage AI

| Component | Traditional ESI | AI-Enhanced Triage |
|-----------|----------------|-------------------|
| **Input** | Chief complaint + vitals + nurse judgment | Chief complaint + vitals + labs + NLP of notes + history |
| **Output** | ESI 1-5 (5 levels) | Continuous risk score + ESI recommendation |
| **Time to triage** | 2-5 minutes | <30 seconds (automated from EHR) |
| **Under-triage rate** | 5-15% (dangerous) | 2-5% (target) |
| **Over-triage rate** | 30-50% (resource waste) | 20-35% (improved) |
| **Key limitation** | Subjective; varies by nurse experience | Requires real-time EHR data; validation needed |

**Rule**: Sepsis prediction models MUST specify their label definition (Sepsis-3 vs SIRS vs composite) and prediction horizon. AUROC without these is uninterpretable.
**Rule**: Feature engineering beats model architecture for sepsis prediction. Start with XGBoost + trend features before trying LSTM/Transformer.
**Rule**: Sepsis-3 as a label for "early prediction" is CIRCULAR — SOFA ≥2 already indicates organ dysfunction. Use suspected infection + clinical deterioration as the label for early detection.
**Rule**: AI early warning systems must be evaluated by ALERT BURDEN (alerts per true positive), not just AUROC. A model that generates 50 alerts per shift will be ignored regardless of its AUROC.
**Rule**: No sepsis prediction model has demonstrated mortality reduction in a prospective RCT. FDA clearance is based on analytical validation, not clinical outcome validation.

---

## Pediatric & Neonatal AI

### Pediatric AI — Unique Considerations

| Aspect | Adult AI | Pediatric AI | Implication |
|--------|---------|-------------|------------|
| **Data volume** | Large | Small (children are healthier) | Higher overfitting risk |
| **Age dependency** | Minimal | Critical (vital sign norms change by age) | Age-specific models mandatory |
| **Consent** | Patient | Parent/guardian | Additional ethical complexity |
| **Drug dosing** | Weight-based | Weight + BSA + age-based | Dosing errors are #1 pediatric AI risk |
| **Disease spectrum** | Chronic, degenerative | Congenital, infectious, developmental | Different model targets |
| **Imaging** | Standard protocols | Lower radiation; sedation often needed | Image quality variability |
| **Label quality** | Moderate | Poor (rare diseases; atypical presentations) | Noisier supervision |

### Neonatal ICU (NICU) AI

| Task | Input | Output | Key Method | Clinical Readiness |
|------|-------|--------|-----------|-------------------|
| **Sepsis onset (NEC)** | Vitals + labs + feeding data | NEC risk score | LSTM; gradient boosting | Research |
| **Late-onset sepsis** | Vitals + labs + culture | Infection probability | Time-series classification | Emerging |
| **Bronchopulmonary dysplasia** | Ventilator parameters + imaging | BPD severity prediction | Regression; classification | Research |
| **Retinopathy of prematurity** | Fundus images + clinical data | ROP grade | CNN + clinical features | Emerging |
| **Brain injury detection** | aEEG; cranial ultrasound | Injury classification | Signal processing + DL | Research |
| **Growth trajectory** | Weight, length, HC over time | Growth prediction | Time-series; growth curves | Research |
| **Discharge readiness** | Comprehensive NICU data | Readiness score | Multimodal classification | Research |

### Fetal Monitoring AI

| Task | Input | Output | Method | Status |
|------|-------|--------|--------|--------|
| **Fetal heart rate interpretation** | CTG tracing | Normal/suspicious/pathological | CNN; LSTM on FHR | Emerging |
| **Fetal growth restriction** | Ultrasound biometry + Doppler | FGR probability | Regression; classification | Research |
| **Preterm birth prediction** | Cervical length + biomarkers + history | Preterm risk | Ensemble; survival analysis | Emerging |
| **Fetal anomaly screening** | Ultrasound images | Anomaly detection | Object detection; segmentation | Research |
| **Intrapartum asphyxia** | CTG + fetal scalp pH | Acidosis risk | Time-series; multimodal | Research |

```
Cardiotocography (CTG) AI Interpretation
  ↓
[1] Signal Acquisition
    → Fetal heart rate (FHR): 110-160 bpm normal range
    → Uterine contractions (UC): tocodynamometer
    → ⚠️ CTG signal quality is OFTEN poor: signal loss, artifact, deceleration mimics
  ↓
[2] Feature Extraction
    → Baseline FHR; variability (short-term, long-term)
    → Accelerations; decelerations (early, late, variable)
    → Contraction frequency; duration; strength
    → ⚠️ Visual CTG interpretation has INTER-OBSERVER κ = 0.3-0.5 — labels are very noisy
  ↓
[3] Classification
    → FIGO 3-class: normal / suspicious / pathological
    → Binary: reassuring / non-reassuring
    → ⚠️ 3-class is CLINICALLY more useful but HARDER to predict
  ↓
[4] Clinical Integration
    → AI should SUPPLEMENT, not replace, CTG interpretation
    → False positive → unnecessary C-section (major surgery)
    → False negative → intrapartum asphyxia (brain damage)
    → ⚠️ C-section rate is ALREADY too high — AI must REDUCE, not increase, C-sections
```

**Rule**: Pediatric vital sign normals are AGE-DEPENDENT. A heart rate of 150 is normal for a neonate but tachycardic for a 10-year-old. Any pediatric AI must use age-specific thresholds.
**Rule**: Pediatric AI datasets are 5-10× smaller than adult datasets. Overfitting is the primary risk. Use transfer learning from adult models with age-specific fine-tuning.
**Rule**: CTG interpretation AI is limited by label noise (inter-observer κ = 0.3-0.5). No model can exceed the quality of its labels. Report performance against CONSENSUS labels, not single-observer labels.

---

## Chronic Disease AI — Diabetes & Metabolic

### Diabetes AI Task Landscape

| Task | Data Source | AI Method | Output | Clinical Readiness |
|------|-----------|-----------|--------|-------------------|
| **HbA1c prediction** | EHR labs, medications | Regression; LSTM | HbA1c at 3-6 months | Deployed (some EHRs) |
| **Glucose forecasting** | CGM + insulin + meals | LSTM; Transformer; physics-informed | Glucose 30-60min ahead | Emerging (DIY; research) |
| **Insulin dose optimization** | CGM + insulin + meals + activity | RL; MPC | Basal/bolus recommendation | Research (safety critical) |
| **Hypoglycemia prediction** | CGM + insulin + meals | Time-series classification | Hypo risk (15-30min ahead) | Emerging (CGM algorithms) |
| **Diabetic retinopathy screening** | Fundus photography | CNN (EfficientNet; ResNet) | DR grade | FDA-cleared (IDx-DR) |
| **Diabetic foot ulcer** | Thermal imaging; photos | CNN; segmentation | Ulcer risk; wound assessment | Research |
| **Medication adherence** | Claims + EHR + digital | Classification; NLP | Adherence probability | Deployed (some) |

### CGM-Based Glucose Forecasting

```
Continuous Glucose Monitor (CGM) Data (5-min intervals)
  ↓
[1] Data Quality
    → CGM accuracy: MARD 5-10% (vs fingerstick)
    → Signal loss: 5-15% of readings missing
    → Calibration drift: requires periodic fingerstick calibration (some devices)
    → ⚠️ CGM data has TEMPORAL GAPS — interpolation introduces bias
  ↓
[2] Feature Engineering
    → Glucose trajectory: current value, rate of change, acceleration
    → Insulin-on-board: pharmacokinetic model (rapid-acting: peak 60-90min; duration 3-5h)
    → Carbohydrate intake: patient-logged (UNRELIABLE — 30-50% underreporting)
    → Physical activity: wearable data (heart rate, steps)
    → Time of day: circadian patterns in insulin sensitivity
    → ⚠️ Meal logging is the WEAKEST link — patients forget or underestimate carbs
    → ⚠️ Insulin-on-board calculation requires ACCURATE timing and dose logging
  ↓
[3] Model Architecture
    → LSTM: standard for glucose forecasting; captures temporal dynamics
    → Transformer: better long-range; heavier; marginal improvement over LSTM
    → Physics-informed: combine pharmacokinetic model + ML correction (recommended)
    → ⚠️ Pure ML models fail on EDGE CASES (exercise, illness, alcohol) — physics-informed is safer
  ↓
[4] Prediction Horizon
    → 15min: high accuracy (R² >0.9); limited clinical value
    → 30min: moderate accuracy (R² 0.8-0.9); clinically useful for hypo alerts
    → 60min: lower accuracy (R² 0.6-0.8); strategic value for meal planning
    → ⚠️ 30-minute hypoglycemia alerts are the SWEET SPOT — early enough to act, accurate enough to trust
  ↓
[5] Safety Constraints (MANDATORY)
    → Never recommend insulin doses without HUMAN VERIFICATION
    → Hypoglycemia alerts: high sensitivity required (>95%); false alarms acceptable
    → Hyperglycemia alerts: lower sensitivity acceptable; avoid alert fatigue
    → ⚠️ An insulin dose recommendation error can cause HYPOGLYCEMIC COMA or DEATH
    → ⚠️ Closed-loop (artificial pancreas) is FDA-regulated Class III — not a research project
```

**Rule**: Insulin dose optimization AI is SAFETY-CRITICAL. A wrong dose can cause hypoglycemic coma or death. Any insulin recommendation system MUST require human verification before administration.
**Rule**: CGM-based glucose forecasting must use PHYSICS-INFORMED models (pharmacokinetic + ML), not pure ML. Pure ML fails on edge cases (exercise, illness) where safety matters most.
**Rule**: Meal logging is the WEAKEST link in glucose forecasting. 30-50% of meals are underreported. Models must be robust to missing meal data.
**Rule**: Diabetic retinopathy screening AI (IDx-DR) is the first FDA-cleared autonomous AI diagnostic. It is the MODEL for clinical AI deployment — study its validation pathway.

## Neurology & Neurodegenerative Disease AI

### Neurology AI Task Landscape

| Task | Data Source | AI Method | Output | Clinical Readiness | Key Challenge |
|------|-----------|-----------|--------|-------------------|---------------|
| **Alzheimer's prediction** | MRI + CSF + genetics + cognitive tests | Multimodal DL; 3D-CNN | AD progression risk | Emerging | Long prodromal phase; biomarker lag |
| **Dementia screening** | Cognitive tests; speech; digital biomarkers | NLP; classification; time-series | Dementia probability | Emerging | Heterogeneous presentation; cultural bias in cognitive tests |
| **Parkinson's monitoring** | Wearable IMU; voice; gait; medication logs | Time-series DL; speech analysis | Motor fluctuation; ON/OFF state | Emerging | Subjective diaries; fluctuating symptoms |
| **Stroke outcome prediction** | CT/MRI + clinical + vitals | CNN + clinical features | mRS at 90 days | Emerging | Treatment effect confounding; time-window dependency |
| **Epilepsy seizure prediction** | EEG (scalp/implanted); wearables | LSTM; Transformer; spectral | Seizure probability (5-30min ahead) | Research | Low base rate; patient-specific patterns; false alarm burden |
| **Multiple sclerosis progression** | MRI lesions + clinical + CSF | Segmentation + longitudinal modeling | Disability progression | Emerging | Heterogeneous disease course; relapsing-remitting vs progressive |
| **ALS progression** | Clinical scores; voice; EMG | Regression; time-series | ALSFRS-R trajectory | Research | Rare; rapid progression; limited data |
| **Headache/migraine classification** | Clinical features; diary; wearables | Classification; clustering | Migraine subtype; trigger identification | Research | Subjective; overlapping phenotypes |

### Alzheimer's Disease AI — The Grand Challenge

```
Patient at Risk (age 65+, subjective cognitive decline)
  ↓
[1] Risk Stratification
    → APOE ε4 carrier status (genetic risk)
    → Family history (first-degree relative with AD)
    → Cardiovascular risk factors (hypertension, diabetes, obesity)
    → Educational attainment (cognitive reserve proxy)
    → ⚠️ APOE ε4 is NECESSARY but NOT SUFFICIENT — many ε4 carriers never develop AD
    → ⚠️ Cognitive reserve is a CONFOUND: highly educated patients decline faster once symptoms start
  ↓
[2] Biomarker Assessment
    → CSF: Aβ42/40 ratio ↓, p-tau181 ↑, t-tau ↑ (AT(N) framework)
    → Amyloid PET: positive/negative (visual read or SUVR)
    → MRI: hippocampal atrophy (volumetry); white matter hyperintensities
    → Plasma: p-tau217, p-tau181, Aβ42/40 (EMERGING — less invasive)
    → ⚠️ Amyloid positivity ≠ AD dementia — 20-30% of cognitively normal elderly are amyloid+
    → ⚠️ Plasma biomarkers are REVOLUTIONIZING screening but are NOT yet diagnostic
  ↓
[3] AI Prediction Model
    → Input: MRI (3D-CNN) + genetics (polygenic risk score) + cognitive scores + plasma biomarkers
    → Output: probability of progression to MCI/AD within 3-5 years
    → Methods: multimodal fusion (early/late/attention); survival modeling
    → ⚠️ Multimodal models CONSISTENTLY outperform single-modality for AD prediction
    → ⚠️ BUT multimodal = harder to deploy; missing modality handling is CRITICAL
  ↓
[4] Clinical Utility Threshold
    → High-risk: refer for biomarker confirmation (CSF/PET)
    → Moderate-risk: monitor with annual cognitive testing
    → Low-risk: reassurance; lifestyle counseling
    → ⚠️ There is NO curative treatment — prediction utility depends on EARLY INTERVENTION access
    → ⚠️ Lecanemab/aducanumab (anti-amyloid) require amyloid+ confirmation — AI can SCREEN but not REPLACE PET/CSF
  ↓
[5] Validation Requirements
    → Longitudinal validation (5+ year follow-up)
    → Diverse populations (AD disproportionately affects Black/Hispanic populations)
    → External validation across different biomarker platforms
    → ⚠️ Most AD AI studies use ADNI — which is WEALTHY, WHITE, HIGHLY EDUCATED → NOT representative
```

### Seizure Prediction — The Holy Grail of Epilepsy AI

| Approach | Input | Prediction Horizon | Sensitivity | False Positive Rate | Clinical Status |
|----------|-------|-------------------|-------------|---------------------|----------------|
| **Spectral + SVM** | Scalp EEG | 5-30min | 60-80% | 0.5-2 FP/h | Research |
| **LSTM/GRU** | Scalp/implanted EEG | 5-60min | 70-90% | 0.2-1 FP/h | Research |
| **Transformer** | Implanted EEG | 5-30min | 80-95% | 0.1-0.5 FP/h | Clinical trial (NeuroPace) |
| **Patient-specific** | Implanted EEG | 5-30min | 85-97% | 0.05-0.3 FP/h | Emerging (NeuroPace RNS) |
| **Population model** | Scalp EEG | 30-120min | 50-70% | 1-5 FP/h | Research |

```
⚠️ SEIZURE PREDICTION REALITY CHECK:
- Most published results are on SELECTED patients with frequent seizures
- "Prediction" often detects PRE-ICTAL changes that are already visible to epileptologists
- False alarm rate is the RATE-LIMITING factor — >0.5 FP/h makes the system unusable
- Patient-specific models outperform population models by 15-30%
- Implanted EEG >> scalp EEG for prediction (more signal, less artifact)
- The CLINICAL QUESTION is not "can we predict seizures?" but "does prediction improve quality of life?"
- A prediction system that causes ANXIETY about seizures may be WORSE than no prediction
```

**Rule**: Alzheimer's prediction AI must be validated on DIVERSE populations. ADNI is predominantly white, highly educated, and wealthy — results do not generalize to the populations most affected by AD.
**Rule**: Amyloid positivity ≠ Alzheimer's dementia. 20-30% of cognitively normal elderly are amyloid positive. AI must predict PROGRESSION, not just current biomarker status.
**Rule**: Seizure prediction false alarm rate is the RATE-LIMITING factor. A system with >0.5 false alarms per hour is clinically unusable, regardless of sensitivity.
**Rule**: Seizure prediction must be PATIENT-SPECIFIC. Population-level models perform 15-30% worse than patient-specific models. The cost of personalization is more training data per patient.
**Rule**: For Parkinson's voice biomarker and gait analysis signal processing methods, see signal-processing-foundations.md (Voice Biomarkers and Rehabilitation AI sections). For seizure detection EEG processing, see eeg-bci-methodology.md.

## Cardiovascular Medicine AI — Beyond ECG

### Cardiovascular AI Task Landscape (Non-ECG)

| Task | Data Source | AI Method | Output | Clinical Readiness | Key Challenge |
|------|-----------|-----------|--------|-------------------|---------------|
| **Echocardiography interpretation** | Echo video (2D/Doppler) | CNN + LSTM; Transformer | EF; wall motion; valve assessment | Emerging (FDA-cleared for EF) | View classification; operator dependency |
| **Coronary artery disease risk** | CT calcium score + clinical + genetics | CNN + risk model | 10-year ASCVD risk | Emerging | Calcium score ≠ stenosis; race-dependent calibration |
| **Heart failure readmission** | EHR + echo + labs | Classification; survival | 30-day readmission risk | Deployed (some) | Readmission ≠ clinical deterioration |
| **Cardiac MRI analysis** | CMR (cine/LGE) | Segmentation (nnU-Net); classification | LV/RV volumes; scar quantification | Emerging | Long acquisition; expensive; limited access |
| **Aortic stenosis detection** | Echo + CT | Classification; segmentation | AS severity grading | Emerging | Grading criteria evolving (2021 guidelines) |
| **Atrial fibrillation stroke risk** | EHR + echo + clinical | Classification; survival | CHA₂DS₂-VASc augmentation | Research | Existing score is already simple and effective |
| **Pulmonary hypertension** | Echo + RHC + clinical | Classification; regression | PH probability; mPAP estimation | Research | RHC is gold standard but invasive |
| **Hemodynamic monitoring** | Arterial waveform; PAC | Time-series DL | CO/SVR estimation; fluid responsiveness | Research | Invasive reference; limited training data |

### Echocardiography AI — The Highest-Volume Cardiac Imaging

```
Echocardiography Study (50-100 video loops)
  ↓
[1] View Classification (MANDATORY FIRST STEP)
    → Standard views: A4C, A2C, PLAX, PSAX, subcostal, suprasternal
    → 20+ standard views; many "transition" frames between views
    → Methods: CNN (ResNet/EfficientNet); video-based (3D-CNN; Transformer)
    → ⚠️ View classification accuracy >95% is REQUIRED before any measurement — wrong view = wrong measurement
    → ⚠️ Non-standard views (common in community echo) are the HARDEST to classify
  ↓
[2] Quality Assessment
    → Image quality: adequate vs suboptimal (foreshortened, poor acoustic window)
    → Complete vs incomplete study (all required views present?)
    → ⚠️ 20-40% of community echo studies are SUBOPTIMAL — AI must detect and flag this
  ↓
[3] Quantification
    → Ejection fraction: automated from A4C/A2C (EDD/ESD tracking)
    → Wall motion: segmental analysis (17-segment model)
    → Valve assessment: regurgitation severity; stenosis gradient
    → Diastolic function: E/A ratio; E/e'; LA strain
    → ⚠️ EF measurement has 5-10% inter-observer variability — AI must match or exceed this
    → ⚠️ Strain analysis (GLS) is MORE SENSITIVE than EF for early dysfunction
  ↓
[4] Report Generation
    → Structured findings → draft report
    → Measurements + interpretation + recommendations
    → ⚠️ AI-generated measurements must be EDITABLE by cardiologist — final responsibility is human
  ↓
[5] Clinical Integration
    → AI as SECOND READER (parallel interpretation)
    → Discrepancy alert: AI vs cardiologist disagreement → mandatory review
    → ⚠️ The value proposition is NOT replacing cardiologists — it's ensuring NO STUDY IS MISSED
```

| EF Measurement Method | Accuracy (vs Expert) | Speed | Limitation |
|----------------------|---------------------|-------|------------|
| **Manual (Simpson's biplane)** | Reference standard | 3-5 min | Inter-observer variability 5-10% |
| **Auto-EF (AI)** | Within 5% of expert | <30 sec | Fails on poor acoustic windows |
| **3D Echo EF** | More accurate than 2D | 1-2 min | Requires 3D probe; gating |
| **Strain (GLS)** | More sensitive than EF | 1-2 min | Vendor-dependent; load-dependent |
| **Point-of-care EF** | Rough estimate (±10%) | <1 min | Limited views; untrained operators |

**Rule**: Echocardiography AI must start with VIEW CLASSIFICATION. Wrong view → wrong measurement → wrong diagnosis. This is a non-negotiable first step.
**Rule**: Ejection fraction AI must be evaluated against EXPERT cardiologists, not average readers. The clinical value is in matching expert performance at scale, not beating trainees.
**Rule**: 20-40% of community echocardiograms are suboptimal quality. AI must DETECT and FLAG poor quality, not silently produce unreliable measurements.
**Rule**: Global longitudinal strain (GLS) is more sensitive than EF for detecting early cardiac dysfunction. AI should report GLS alongside EF.
**Rule**: For non-invasive cardiac monitoring via BCG/SCG (ballistocardiography/seismocardiography) for home-based heart failure trending, see signal-processing-foundations.md (BCG/SCG section).

## Infectious Disease & Pandemic AI

### Infectious Disease AI Task Landscape

| Task | Data Source | AI Method | Output | Clinical Readiness | Key Challenge |
|------|-----------|-----------|--------|-------------------|---------------|
| **Epidemic forecasting** | Case counts; mobility; wastewater | Time-series; mechanistic+ML hybrid | Case trajectory 1-4 weeks | Deployed (COVID) | Human behavior changes; policy intervention lag |
| **Antimicrobial resistance prediction** | EHR microbiology; genomics | Classification; sequence model | Resistance profile; optimal antibiotic | Emerging | Resistance mechanisms are evolving; local epidemiology varies |
| **Syndromic surveillance** | ED visits; OTC sales; search trends | Anomaly detection; NLP | Outbreak signal | Deployed (some health depts) | Signal-to-noise; privacy concerns |
| **Vaccine effectiveness estimation** | EHR; claims; registry | Causal inference; test-negative design | VE by variant/age/time | Deployed (COVID) | Confounding by indication; healthy vaccinee bias |
| **Diagnostic triage for febrile illness** | Clinical features; labs; travel history | Classification; rule-based | Likely pathogen; recommended tests | Research | Overlapping presentations; emerging pathogens |
| **Antibiotic stewardship** | EHR + microbiology + pharmacy | Classification; RL | Appropriate antibiotic recommendation | Emerging | Prescribing culture; local resistance patterns |
| **Contact tracing optimization** | Proximity data; case interviews | Graph analysis; optimization | Priority contacts for follow-up | Deployed (COVID) | Privacy; adoption; digital divide |
| **Genomic surveillance** | Pathogen sequencing (WGS) | Phylogenetics; ML | Variant classification; spread dynamics | Deployed (GISAID) | Sequencing capacity; representative sampling |

### Epidemic Forecasting — Lessons from COVID-19

```
Epidemic Data (daily cases, hospitalizations, deaths)
  ↓
[1] Data Quality Assessment
    → Reporting delays: cases reported today include infections from 5-14 days ago
    → Testing capacity: apparent case drops may reflect testing drops, not true decline
    → Day-of-week effects: fewer reports on weekends → artificial dips
    → Definition changes: COVID "case" definition changed multiple times
    → ⚠️ NEVER forecast from raw case counts — always adjust for reporting delays and testing volume
  ↓
[2] Model Selection
    → Mechanistic (SIR/SEIR): interpretable; requires assumptions about transmission
    → Statistical (ARIMA, Prophet): data-driven; no mechanism; fails on regime changes
    → Hybrid (mechanistic + ML): best of both; most robust
    → Ensemble: combine multiple models; most reliable in practice
    → ⚠️ No single model was consistently best for COVID — ENSEMBLES outperformed individuals
    → ⚠️ Mechanistic models FAILED when human behavior changed faster than model assumptions
  ↓
[3] Forecast Horizon
    → 1 week: moderate reliability (R² 0.6-0.8)
    → 2 weeks: low reliability (R² 0.3-0.6)
    → 4 weeks: very low reliability (R² 0.1-0.3)
    → ⚠️ Beyond 2 weeks, epidemic forecasts are DIRECTIONAL, not quantitative
    → ⚠️ Communication: show UNCERTAINTY BANDS, not point estimates
  ↓
[4] Intervention Modeling
    → Counterfactual: what would have happened WITHOUT intervention?
    → Prospective: what WILL happen IF we implement intervention X?
    → ⚠️ Intervention compliance is NEVER 100% — model assumptions must account for this
    → ⚠️ The most useful forecast answers "what happens if we do X?" not "what will happen?"
  ↓
[5] Communication (CRITICAL)
    → Show confidence intervals, not point estimates
    → State assumptions explicitly
    → Update forecasts as new data arrives
    → ⚠️ Overconfident forecasts DESTROY public trust — the COVID forecasting community learned this the hard way
```

### Antimicrobial Resistance (AMR) Prediction

| Approach | Input | Output | Accuracy | Clinical Impact | Limitation |
|----------|-------|--------|----------|----------------|------------|
| **Phenotype-based** | Prior culture results; antibiotic history | Resistance probability per drug | AUROC 0.75-0.85 | Targeted empiric therapy | Requires prior cultures; doesn't predict novel resistance |
| **Genomics-based** | WGS of pathogen | Resistance gene detection | AUROC 0.85-0.95 | Rapid resistance detection | Sequencing turnaround; novel mechanisms missed |
| **Clinical prediction** | EHR demographics, comorbidities, prior admissions | Risk of resistant infection | AUROC 0.70-0.80 | Broad empiric guidance | Lower accuracy; population-specific |
| **Hybrid (genomics + clinical)** | WGS + EHR | Resistance + optimal therapy | AUROC 0.85-0.95 | Best performance | Requires both data types; complexity |

**Rule**: Epidemic forecasts beyond 2 weeks are DIRECTIONAL, not quantitative. Always show uncertainty bands. Overconfident forecasts destroy public trust.
**Rule**: No single epidemic forecasting model was consistently best during COVID-19. ENSEMBLES outperform individual models. Use the COVID-19 Forecast Hub as a model.
**Rule**: AMR prediction must account for LOCAL epidemiology. Resistance patterns vary significantly between hospitals and regions. A model trained on Hospital A's data may be dangerous at Hospital B.
**Rule**: Antibiotic stewardship AI should recommend NARROW-SPECTRUM antibiotics when possible. The goal is reducing broad-spectrum use, not just predicting resistance.

## Respiratory & Pulmonary AI

### Respiratory AI Task Landscape

| Task | Data Source | AI Method | Output | Clinical Readiness | Key Challenge |
|------|-----------|-----------|--------|-------------------|---------------|
| **COPD exacerbation prediction** | EHR + wearable + environmental | Time-series; classification | Exacerbation risk (7-14 days) | Emerging | Subjective symptom reporting; environmental triggers |
| **Asthma control prediction** | Peak flow; inhaler sensors; EHR | Time-series; classification | Asthma control level | Emerging | Adherence monitoring; trigger identification |
| **Pulmonary fibrosis progression** | HRCT + clinical + PFT | CNN + regression; survival | FVC decline trajectory | Emerging | Heterogeneous progression; acute exacerbations |
| **Sleep apnea detection** | PPG; airflow; SpO2; actigraphy | Time-series classification | AHI estimation; event detection | Emerging (consumer) | AHI definition varies; positional apnea |
| **Ventilator management** | Ventilator waveforms + EHR | RL; classification | Optimal PEEP; weaning readiness | Research | Protocol variability; safety-critical |
| **Lung nodule management** | CT + clinical + biomarkers | CNN + risk model | Lung-RADS augmentation; malignancy probability | Deployed (some) | Indeterminate nodules; follow-up compliance |
| **Pneumonia etiology** | CXR/CT + labs + clinical | Multimodal classification | Bacterial vs viral vs fungal | Research | Overlapping imaging features; empirical treatment |
| **Oxygen titration** | SpO2 + respiratory rate + vent settings | RL; control | Optimal FiO2/flow | Research | COPD CO2 retainer risk; safety-critical |

### Sleep Apnea AI — From Lab to Home

```
Traditional Path: PSG in sleep lab → manual scoring → AHI → CPAP prescription
    → Wait time: 2-8 weeks for PSG
    → Cost: $1000-3000 per study
    → 80% of moderate-severe OSA is UNDIAGNOSED
  ↓
AI-Enabled Path: Home testing → AI scoring → AHI → auto-CPAP
    → Devices: Type III (portable) or Type IV (finger probe)
    → AI methods: PPG-based; airflow + SpO2; actigraphy + SpO2
    → ⚠️ Home testing MISSES mild OSA and positional OSA — it's a SCREENING tool
  ↓
[1] Signal Acquisition
    → PPG (photoplethysmography): pulse amplitude variation → respiratory effort
    → SpO2: desaturation index → apnea-hypopnea events
    → Actigraphy: movement → sleep/wake discrimination
    → Nasal airflow (if available): direct apnea detection
    → ⚠️ PPG-only detection has LOWER sensitivity than PSG — accept as tradeoff for accessibility
  ↓
[2] Event Detection
    → Apnea: ≥10s cessation of airflow
    → Hypopnea: ≥10s ≥30% reduction in airflow + ≥3% desaturation
    → AASM 2012 scoring rules (1A vs 1B criteria)
    → ⚠️ AHI threshold for diagnosis varies: ≥5 (mild), ≥15 (moderate), ≥30 (severe)
    → ⚠️ AHI is an IMPERFECT metric — it doesn't capture arousal burden or flow limitation
  ↓
[3] AI Scoring
    → CNN/LSTM on PPG + SpO2 → event-by-event detection
    → Output: AHI estimate; event types; sleep stages (if signal available)
    → ⚠️ AI scoring agreement with PSG: kappa 0.7-0.85 (moderate-substantial)
    → ⚠️ AI tends to OVERESTIMATE AHI compared to manual scoring
  ↓
[4] Clinical Decision
    → AHI ≥ 15 + symptoms → CPAP recommendation
    → AHI 5-15 → further evaluation (positional therapy; weight loss)
    → AHI < 5 → alternative diagnosis (insomnia; restless legs)
    → ⚠️ AI screening should INCREASE access, not REPLACE specialist evaluation for complex cases
```

**Rule**: Sleep apnea AI using PPG/SpO2 is a SCREENING tool, not a replacement for PSG. It misses mild and positional OSA. The value is in triaging the 80% of undiagnosed moderate-severe cases. For PPG signal processing methods for respiratory rate and SpO2 extraction, see signal-processing-foundations.md (Advanced PPG section).
**Rule**: COPD exacerbation prediction must include ENVIRONMENTAL data (air quality, temperature, pollen). Environmental triggers are modifiable and underutilized in current models.
**Rule**: Ventilator management AI is SAFETY-CRITICAL. An incorrect PEEP recommendation can cause barotrauma or hemodynamic compromise. Always require clinician confirmation.
**Rule**: Lung nodule AI should AUGMENT Lung-RADS, not replace it. The clinical question is "which nodules can we safely NOT follow up?" not "which nodules are cancer?"

## Women's Health & Obstetrics AI

### Women's Health AI Task Landscape

| Task | Data Source | AI Method | Output | Clinical Readiness | Key Challenge |
|------|-----------|-----------|--------|-------------------|---------------|
| **Preeclampsia prediction** | Maternal demographics + labs + UPI + BP | Classification; survival | Preeclampsia risk (1st/2nd trimester) | Emerging | Low positive predictive value; heterogeneous syndrome |
| **Cervical cancer screening** | Pap smear; HPV; colposcopy; digital cervigram | CNN; classification | CIN grade; referral decision | Emerging (low-resource) | Inter-observer variability; HPV vaccination changing epidemiology |
| **Gestational diabetes prediction** | Clinical risk factors + labs | Classification | GDM risk (1st trimester) | Emerging | Screening already universal in many settings |
| **Preterm birth prediction** | Cervical length + fFN + maternal factors | Classification; survival | Preterm birth risk | Emerging | Low PPV; intervention evidence limited |
| **Fetal growth restriction** | Ultrasound biometry + Doppler + maternal | Regression; classification | Estimated fetal weight; growth trajectory | Emerging | Growth curves population-specific; dating accuracy |
| **IVF embryo selection** | Time-lapse embryo imaging | CNN; classification | Embryo viability score | Emerging (commercial) | Live birth ≠ embryo morphology; selection bias |
| **Breast cancer risk** | Mammogram + genetics + clinical | CNN + risk model | 5-year/10-year risk | Deployed (some) | Dense breast tissue; risk model calibration |
| **Postpartum depression** | EHR + screening tools + social | NLP; classification | PPD risk | Research | Stigma; under-screening; social determinants |

### Preeclampsia Prediction — The Unmet Need

```
Pregnant Patient (1st trimester screening, 11-13 weeks)
  ↓
[1] Risk Factor Assessment
    → Maternal: age >35, BMI >30, chronic hypertension, diabetes, kidney disease
    → Obstetric: prior preeclampsia, prior SGA baby, multifetal gestation
    → Family: preeclampsia in first-degree relative
    → ⚠️ Clinical risk factors alone have POOR discrimination (AUROC 0.65-0.75)
  ↓
[2] Biomarker Assessment (FMF algorithm)
    → Mean arterial pressure (MAP)
    → Uterine artery pulsatility index (UtA-PI)
    → Serum PAPP-A (↓ in PE)
    → Serum PlGF (↓↓ in early PE)
    → ⚠️ The FMF (Fetal Medicine Foundation) algorithm is the STANDARD — AUROC 0.90-0.95 for early PE
    → ⚠️ Biomarker availability varies by setting — PlGF is NOT universally available
  ↓
[3] AI Augmentation
    → Add: longitudinal BP trajectory (not just single MAP)
    → Add: digital biomarkers (sleep quality, activity from wearables)
    → Add: EHR comorbidities and medication history
    → ⚠️ AI must BEAT the FMF algorithm to be clinically useful — it's a HIGH BAR
    → ⚠️ Most "AI for preeclampsia" papers do NOT compare against FMF → unfair evaluation
  ↓
[4] Clinical Action
    → High risk: aspirin prophylaxis (150mg nightly, <16 weeks) — reduces early PE by 60-70%
    → Moderate risk: enhanced monitoring; biomarker surveillance
    → Low risk: routine prenatal care
    → ⚠️ Aspirin is EFFECTIVE only if started <16 weeks — prediction must be EARLY
    → ⚠️ The clinical value of prediction is ONLY realized if it leads to EFFECTIVE intervention
  ↓
[5] Postpartum Monitoring
    → Preeclampsia can develop POSTPARTUM (up to 6 weeks)
    → Post-discharge BP monitoring via remote cuff
    → ⚠️ Postpartum PE is UNDERDETECTED — remote monitoring AI could fill this gap
```

### IVF Embryo Selection AI — Controversy & Evidence

| Approach | Input | Output | Claimed Improvement | Evidence Level | Concern |
|----------|-------|--------|--------------------|---------------|---------|
| **Morphokinetic (time-lapse)** | Embryo time-lapse video | Implantation probability | +5-15% live birth | Moderate (observational) | Selection bias; no RCT |
| **CNN on embryo images** | Static embryo images | Viability score | +3-10% live birth | Low (retrospective) | Overfitting to clinic-specific culture conditions |
| **AI + PGT-A** | Embryo image + genetic testing | Euploid + viable embryo | Combined selection | Emerging | PGT-A is itself controversial |
| **Clinical-only** | Maternal age + embryo grade | Standard selection | Baseline | Standard of care | Subjective grading |

```
⚠️ IVF EMBRYO SELECTION AI REALITY CHECK:
- Most studies use IMPLANTATION as endpoint, not LIVE BIRTH — these are different
- Embryo morphology is a WEAK predictor of live birth (AUROC 0.55-0.65)
- AI adds MARGINAL improvement over embryologist assessment
- No RCT has shown AI embryo selection improves LIVE BIRTH RATE
- Commercial systems (Life Whisperer, Eeva) have LIMITED independent validation
- The biggest factor in IVF success is MATERNAL AGE, not embryo selection
- AI may be most useful for REDUCING EMBRYO WASTE (selecting fewer embryos for transfer with same success)
```

**Rule**: Preeclampsia prediction AI must be compared against the FMF algorithm (MAP + UtA-PI + PAPP-A + PlGF), not just clinical risk factors. The FMF algorithm achieves AUROC 0.90-0.95 — AI must beat this.
**Rule**: Aspirin prophylaxis for preeclampsia is effective ONLY if started before 16 weeks. Prediction without early intervention is pointless.
**Rule**: IVF embryo selection AI must use LIVE BIRTH as the endpoint, not implantation. Implantation ≠ live birth, and most studies use the wrong endpoint.
**Rule**: No RCT has demonstrated that AI embryo selection improves live birth rates. Commercial systems should be evaluated with INDEPENDENT, prospective studies.

## Anesthesiology & Perioperative AI

### Perioperative AI Task Landscape

| Task | Data Source | AI Method | Output | Clinical Readiness | Key Challenge |
|------|-----------|-----------|--------|-------------------|---------------|
| **Depth of anesthesia monitoring** | EEG (processed); BIS; vital signs | Time-series classification | Anesthesia depth index | Deployed (BIS monitor) | BIS limitations; EMG artifact; no gold standard |
| **Perioperative risk prediction** | Preop assessment + labs + comorbidities | Classification; survival | Complication probability | Deployed (ASA score + ML) | Calibration; rare events; outcome definition |
| **Hypotension prediction** | Arterial waveform; vital signs | LSTM; classification | Hypotension probability (5-15min) | FDA-cleared (HPI by Edwards) | HPI validation mixed; intervention threshold unclear |
| **Postoperative nausea/vomiting** | Patient factors + anesthetic + surgical | Classification | PONV risk score | Deployed (Apfel + ML) | Prophylaxis already standard; marginal AI benefit |
| **Pain management** | EHR + vital signs + patient-reported | Regression; RL | Optimal analgesic regimen | Research | Subjective pain; opioid-sparing goal |
| **Postoperative delirium** | Preop risk + intraop events + EEG | Classification | Delirium risk | Emerging | Multifactorial; prevention strategies limited |
| **Airway management** | Preop assessment + imaging | Classification; segmentation | Difficult airway prediction | Research | Low positive predictive value; dynamic assessment |
| **Fluid responsiveness** | Arterial waveform; echocardiography | Classification; regression | Fluid responsive vs unresponsive | Emerging | Dynamic indices context-dependent; protocol variability |

### Hypotension Prediction Index (HPI) — The First FDA-Cleared Perioperative AI

```
Arterial Catheter Waveform (100-500 Hz)
  ↓
[1] Feature Extraction (from arterial waveform)
    → Systolic/diastolic/mean pressure
    → Pulse pressure variation (PPV)
    → Stroke volume variation (SVV)
    → Dynamic elastance (dP/dt)
    → Waveform morphology features (23+ features)
    → ⚠️ Requires ARTERIAL LINE — not available for all surgical patients
  ↓
[2] Prediction Model
    → Input: 30-second arterial waveform window
    → Output: probability of MAP <65 mmHg within next 15 minutes
    → Method: proprietary ML (likely gradient boosting on waveform features)
    → ⚠️ HPI is a PROPRIETARY black box — no external validation of the model itself
  ↓
[3] Clinical Evidence
    → Maheshwari 2020 (JAMA): HPI-guided care reduced hypotension duration by 30%
    → BUT: subsequent studies show MIXED results
    → ⚠️ The INTERVENTION (treating HPI alerts) matters more than the PREDICTION
    → ⚠️ Treating HPI alerts may cause UNNECESSARY vasopressor use
  ↓
[4] Limitations
    → Requires arterial line (invasive)
    → Only predicts MAP <65 — doesn't predict CAUSE (vasodilation vs bleeding vs cardiac)
    → No evidence of improved PATIENT OUTCOMES (mortality, AKI, MI)
    → ⚠️ Reducing hypotension DURATION ≠ improving patient OUTCOMES — this is the key gap
```

**Rule**: Hypotension prediction AI (HPI) reduces hypotension DURATION but has NO evidence of improving patient OUTCOMES. The gap between intermediate and clinical endpoints is the key limitation.
**Rule**: Depth of anesthesia monitoring has NO gold standard. BIS is the most used but has known limitations (EMG artifact, nitrous oxide interference). AI must acknowledge this uncertainty.
**Rule**: Perioperative risk prediction must be CALIBRATED, not just discriminative. A well-calibrated ASA physical status score may be more useful than an uncalibrated ML model.
**Rule**: Fluid responsiveness AI must account for the CLINICAL CONTEXT. The same PPV value means different things in different surgical phases (open vs laparoscopic, one-lung ventilation).
**Rule**: For arterial waveform signal processing and non-invasive hemodynamic monitoring (PPG-based cuffless BP, BCG/SCG cardiac output), see signal-processing-foundations.md (Advanced PPG and BCG/SCG sections).
