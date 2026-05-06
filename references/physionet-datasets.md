# PhysioNet Datasets & Experiment Roadmaps

## Dataset Reference Table

### Open Access Datasets

| ID | Dataset | Signal | Size | FS (Hz) | Leads/Channels | Key Tasks | Annotation |
|----|---------|--------|------|---------|----------------|-----------|------------|
| PN-01 | MIT-BIH Arrhythmia | ECG | 48 records (30min each) | 360 | 2-lead (MLII, V1) | Beat classification (AAMI 5-class) | Beat-by-beat |
| PN-02 | MIT-BIH AF | ECG | 25 records (~10h each) | 250 | 2-lead | AF detection, rhythm analysis | Rhythm annotations |
| PN-03 | PTB Diagnostic | ECG | 549 records | 1000 | 12-lead + 3 Frank | MI detection, diagnostic classification | Diagnostic labels |
| PN-04 | PTB-XL | ECG | 21,837 records (10s) | 100/500 | 12-lead | Multi-label classification, benchmark | Multi-label (5 super + 44 sub) |
| PN-05 | LUDB | ECG | 200 records | 500 | 12-lead | ECG delineation (P/QRS/T boundaries) | Boundary annotations |
| PN-06 | CPSC 2018 | ECG | 6,877 records | 500 | 12-lead | AF detection (challenge) | Normal / AF / other |
| PN-07 | CinC 2017 | ECG | 8,528 records (9-60s) | 300 | Single-lead | AF classification | Normal / AF / noise / other |
| PN-08 | G12EC | ECG | 1,094 records | 500 | 12-lead | Multi-class arrhythmia | 12 diagnostic classes |
| PN-09 | Sleep-EDF Expanded | EEG/EOG/EMG | 197 recordings | 100 | 2 EEG + EOG/EMG | Sleep staging (5-class) | 30s epoch scoring |
| PN-10 | BCI2000 | EEG | ~1,200 sessions | 160 | 64-channel | Motor imagery BCI | Event markers |
| PN-11 | CapnoBase | Capnography/PPG | 42 records | 300 | PPG + CO2 | Respiratory rate estimation | Breath-by-breath |
| PN-12 | Gait ND | Gait | 15 subjects | 300 | Force sensors | Neurodegenerative gait analysis | Stride annotations |
| PN-13 | PTT PPG | PPG+ECG+BP | Multi-site | Variable | Multi-site PPG + ECG | PTT estimation, cuffless BP | Synchronized BP |

### Credentialed Access Datasets

| ID | Dataset | Signal | Size | Key Tasks | Credentialing |
|----|---------|--------|------|-----------|---------------|
| PN-14 | MIMIC-III Clinical | Tabular | ~60K patients | Mortality, sepsis, LOS prediction | CITI + PhysioNet credential |
| PN-15 | MIMIC-IV | Tabular | ~180K patients | Critical care prediction | CITI + PhysioNet credential |
| PN-16 | MIMIC-III Waveform | ECG/PPG/ABP | ~30K records | BP estimation, vital signs | CITI + PhysioNet credential |
| PN-17 | MIMIC-CXR | Chest X-ray | 377K images | Radiology diagnosis | CITI + PhysioNet credential |
| PN-18 | eICU | Tabular | ~200K patients | Critical care (MIMIC alternative) | CITI + PhysioNet credential |

**⚠️ MIMIC-IV vs MIMIC-III — Critical Differences for Reproduction**:
| Feature | MIMIC-III | MIMIC-IV | Impact |
|---------|-----------|----------|--------|
| Time period | 2001-2012 | 2008-2019 | IV has more recent data |
| Patients | ~60K | ~180K | IV is 3x larger |
| Database | PostgreSQL | PostgreSQL (same) | Compatible |
| ICD codes | ICD-9 only | ICD-9 + ICD-10 | ⚠️ IV requires ICD version handling |
| Structure | 26 tables | 11 modules (hierarchical) | IV restructured; different query patterns |
| ED data | Limited | Comprehensive ED module | IV includes pre-ICU data |
| Lab events | Different item IDs | Different item IDs | ⚠️ Cannot directly copy MIMIC-III feature extraction code |
| ⚠️ Key issue | Many papers use III | Newer papers use IV | Results from III and IV are NOT directly comparable |

**Rule**: When reproducing a MIMIC-III paper on MIMIC-IV (or vice versa), flag: "⚠️ MIMIC version mismatch — feature IDs, ICD codes, and table structures differ. Direct code transfer is NOT possible."
**Rule**: For new projects, prefer MIMIC-IV (larger, more recent). For reproducing old papers, use MIMIC-III.

---

## Experiment Roadmaps by Domain

### Roadmap 1: ECG Arrhythmia Classification

```
STEP 1: Dataset Selection
├─ Beat-level (AAMI 5-class): MIT-BIH Arrhythmia (PN-01)
├─ Rhythm-level: CinC 2017 (PN-07) or CPSC 2018 (PN-06)
└─ Multi-label diagnostic: PTB-XL (PN-04) — RECOMMENDED for new research

STEP 2: Preprocessing
├─ Bandpass filter: 0.5-40Hz (Butterworth, order 4)
├─ R-peak detection: Pan-Tompkins or gqrs
├─ Segmentation: R-peak ± 250ms (beat-level) or 30s windows (rhythm-level)
├─ Normalization: Per-record z-score or min-max
└─ Train/test split: Use PTB-XL proposed folds (patient-disjoint)

STEP 3: Model Architecture
├─ Baseline: ResNet1D (34-layer, per ECG-03)
├─ Modern: XResNet1d101 (per ECG-05 benchmark)
├─ Transformer: 1D-ViT or Informer-style
└─ Lightweight: 1D-CNN with depthwise separable convolutions

STEP 4: Training Protocol
├─ Optimizer: AdamW, lr=1e-4, weight_decay=1e-4
├─ Scheduler: CosineAnnealing
├─ Loss: CrossEntropy (single-label) or BCEWithLogits (multi-label)
├─ Class imbalance: Weighted loss or focal loss
├─ Early stopping: patience=15 on val loss
└─ Batch size: 64-128

STEP 5: Evaluation
├─ Primary: Macro-F1 score
├─ Secondary: Per-class F1, AUC-ROC, confusion matrix
├─ Clinical: Sensitivity/Specificity at operating point
├─ Statistical: 95% CI via bootstrap
└─ External: Test on at least one other dataset

STEP 6: Benchmark Targets
├─ MIT-BIH (5-class AAMI): >95% accuracy (SOTA: ~98%)
├─ PTB-XL (5 superclass): >90% F1 (SOTA: ~91.6%)
├─ CinC 2017 (4-class): >80% F1 (SOTA: ~83%)
└─ PTB-XL (44 subclass): >65% F1 (SOTA: ~70%)
```

### Roadmap 2: Sleep Staging

```
STEP 1: Dataset Selection
├─ Primary: Sleep-EDF Expanded (PN-09)
├─ Large-scale: SHHS, MESA (require application)
└─ Multi-cohort: Train on multiple for generalization (per EEG-06)

STEP 2: Preprocessing
├─ Bandpass: 0.5-30Hz on EEG channels
├─ Epoch: 30-second segments (AASM standard)
├─ Channels: Fpz-Cz and Pz-Oz (Sleep-EDF standard)
└─ Normalization: Per-recording z-score

STEP 3: Model Architecture
├─ Baseline: U-Sleep (U-Net variant, per EEG-06)
├─ Alternative: TCN (Temporal Convolutional Network)
├─ Transformer: SleepTransformer
└─ Lightweight: 1D-CNN + LSTM

STEP 4: Evaluation
├─ Primary: Overall accuracy + Cohen's kappa
├─ Per-class: F1 for W, N1, N2, N3, REM
├─ Clinical: Agreement with manual scoring (kappa > 0.6 = acceptable)
└─ Benchmark: Acc >83%, Kappa >0.79 (U-Sleep level)

STEP 5: Key Pitfalls
├─ N1 is hardest class (low inter-scorer agreement even for humans)
├─ Class imbalance: N2 dominant, N1 rare
├─ Cross-subject generalization is the real challenge
└─ First-night effect vs. subsequent nights
```

### Roadmap 3: Motor Imagery BCI

```
STEP 1: Dataset Selection
├─ BCI Competition III Dataset IVa (2-class MI)
├─ BCI Competition IV Dataset 2a (4-class MI)
├─ PhysioNet BCI2000 (PN-10)
└─ OpenBMI dataset

STEP 2: Preprocessing
├─ Bandpass: 8-30Hz (motor imagery band)
├─ Re-reference: Common average reference (CAR) or Laplacian
├─ Epoch: 0-4s after cue onset
└─ Artifact removal: ICA or automated rejection

STEP 3: Feature Extraction + Classification
├─ Traditional: CSP (2-3 pairs) → log-variance → LDA
├─ DL: EEGNet (per DL-03) on raw filtered EEG
├─ Hybrid: CSP features → DL classifier
└─ Advanced: Riemannian geometry methods

STEP 4: Evaluation
├─ Primary: Classification accuracy + Cohen's kappa
├─ BCI-specific: ITR (Information Transfer Rate) in bits/min
├─ Cross-validation: 5x5-fold or leave-one-session-out
└─ Benchmark: 2-class >85%, 4-class >70%

STEP 5: Key Pitfalls
├─ Subject variability: accuracy ranges 60-95% across subjects
├─ Session-to-session non-stationarity
├─ Small training sets (typically 50-200 trials per class)
└─ Online vs offline performance gap
```

### Roadmap 4: ICU Clinical Prediction (MIMIC)

```
STEP 1: Access & Setup
├─ Complete CITI training (Data or Specimens Only Research)
├─ Apply for PhysioNet credentialing (1+ week)
├─ Set up PostgreSQL with MIMIC-III/IV
└─ Use mimic-code repository for concept extraction

STEP 2: Cohort Definition
├─ Define inclusion/exclusion criteria
├─ Extract first ICU stay per patient
├─ Define prediction window (e.g., first 24h)
└─ Define outcome (mortality / sepsis / LOS)

⚠️ LABEL QUALITY WARNING (MIMIC-SPECIFIC):
├─ ICD-9 codes in MIMIC are BILLING codes, NOT clinical diagnoses
│  → Upcoding bias: sicker patients get more codes
│  → Missing codes: conditions treated without billing
│  → Code-first bias: diagnosis driven by reimbursement, not pathology
├─ For mortality prediction: label is reliable (objective outcome)
├─ For phenotype classification: label is NOISY (ICD-based, 20-40% error)
│  → Validate on expert-annotated subset if possible
│  → Report ICD code positive predictive value
├─ For sepsis: use Sepsis-3 criteria (SOFA ≥ 2 + suspected infection), NOT ICD codes
│  → See Alistair Johnson's sepsis cohort definition in mimic-code
└─ For decompensation: no gold standard exists; use composite clinical endpoints

⚠️ TIME WINDOW SELECTION GUIDE:
├─ 24h window: Most common for mortality; captures acute deterioration
│  → Risk: misses late-onset events; benefits from early prediction
├─ 48h window: Harutyunyan benchmark standard; balances information vs timeliness
│  → Risk: 48h may be too late for intervention in some cases
├─ First 6h window: Early warning; clinically actionable but less data
│  → Use for real-time monitoring applications
├─ Full stay: Maximum information but not clinically actionable
│  → Use for retrospective analysis, NOT for clinical deployment
└─ Decision rule: Choose the SHORTEST window that achieves acceptable performance
   → If 24h and 48h give similar AUROC, prefer 24h (more clinically useful)

STEP 3: Feature Engineering
├─ Vital signs: heart rate, BP, SpO2, temperature, respiratory rate
├─ Lab values: WBC, lactate, creatinine, etc.
├─ Comorbidities: Charlson comorbidity index
├─ Medications: vasopressors, antibiotics
├─ Time-series features: trends, variability, extremes
└─ Handle missing data: forward fill + indicator variables

STEP 4: Model Architecture
├─ Static: XGBoost / Random Forest on aggregated features
├─ Temporal: LSTM / Transformer on time-series
├─ Hybrid: Static features + temporal model
└─ Benchmark: SOFA/SAPS-II clinical scores as baseline

STEP 5: Evaluation
├─ Primary: AUROC + AUPRC (imbalanced outcomes)
├─ Calibration: Calibration plot + Brier score
├─ Clinical utility: Decision curve analysis
├─ Comparison: Must beat clinical scores (SOFA, SAPS-II)
└─ Fairness: Performance across demographic subgroups
```

---

## MIMIC-IV Sub-Modules (2023-2025)

MIMIC-IV has expanded significantly beyond the core clinical database. Each sub-module requires separate credentialing.

| Module | Content | Size | Key Use Case |
|--------|---------|------|-------------|
| **MIMIC-IV** | Core clinical (ICU + ED + hospital) | ~180K patients | Mortality, sepsis, LOS prediction |
| **MIMIC-IV-ED** | Emergency department triage + vitals | ~425K ED stays | ED triage, acuity scoring |
| **MIMIC-IV-Note** | De-identified clinical notes | ~800K notes | Clinical NLP, note classification |
| **MIMIC-IV-Waveform** | ECG/PPG/ABP waveforms | ~200K records | BP estimation, vital sign monitoring |
| **MIMIC-CXR** | Chest X-ray images + reports | 377K images | Radiology AI, report generation |
| **MIMIC-CXR-JPG** | CXR in JPG format (easier to use) | 377K images | Same as MIMIC-CXR but no DICOM handling |
| **MIMIC-IV-ECG** | Diagnostic 12-lead ECG | ~800K ECGs | ECG AI, arrhythmia detection |
| **MIMIC-IV-Ext** | External validation datasets | Varies | Cross-site generalization testing |

**⚠️ MIMIC-IV vs MIMIC-III — Updated Comparison**:

| Feature | MIMIC-III | MIMIC-IV | Impact |
|---------|-----------|----------|--------|
| Time period | 2001-2012 | 2008-2019 | IV has more recent data |
| Patients | ~60K | ~180K | IV is 3x larger |
| Database | PostgreSQL | PostgreSQL (same) | Compatible |
| ICD codes | ICD-9 only | ICD-9 + ICD-10 | ⚠️ IV requires ICD version handling |
| Structure | 26 tables | 11 modules (hierarchical) | IV restructured; different query patterns |
| ED data | Limited | Comprehensive ED module | IV includes pre-ICU data |
| Lab events | Different item IDs | Different item IDs | ⚠️ Cannot directly copy MIMIC-III feature extraction code |
| Notes | Not in MIMIC-III proper | MIMIC-IV-Note (separate module) | IV has dedicated note module |
| ECG | Not in MIMIC-III | MIMIC-IV-ECG (separate module) | IV has dedicated ECG module |
| ⚠️ Key issue | Many papers use III | Newer papers use IV | Results from III and IV are NOT directly comparable |

**MIMIC-IV Module Loading Guide**:

```
MIMIC-IV Core:
  → hosp/ module: admissions, patients, diagnoses, procedures, prescriptions, lab events
  → icu/ module: icustays, chartevents, procedureevents, outputevents, inputevents
  → ed/ module: triage, vitalsign, medrecon, pyxis
  → cxr/ module: record_ids linking to MIMIC-CXR
  → Load: https://github.com/mit-lcp/mimic-code/tree/main/mimiciv

MIMIC-IV-Note:
  → discharge: discharge summary notes
  → radiology: radiology reports
  → nursing: nursing notes
  → physician: physician progress notes
  → Load: Same repository, separate module

MIMIC-IV-ECG:
  → 12-lead diagnostic ECGs in WFDB format
  → Linked to MIMIC-IV patients via subject_id
  → Load: https://github.com/mit-lcp/mimic-iv-ecg
```

---

## Additional Key Datasets (2023-2025)

### Critical Care & Clinical

| Dataset | Signal | Size | Access | Key Feature |
|---------|--------|------|--------|-------------|
| **eICU-CRD** | Tabular + waveforms | ~200K patients | Credentialed | Multi-site (200+ hospitals); complementary to MIMIC |
| **AUMCdb** | ICU tabular | ~23K patients | Open | Amsterdam UMC; European ICU data |
| **HiRID** | ICU tabular | ~34K patients | Restricted | Swiss ICU; high-resolution (2-min) vitals |
| **SICdb** | ICU tabular | ~16K patients | Open | Swiss ICU; surgical focus |
| **MIMIC-IV-Ext-Braggs** | ICU + outcomes | External validation | Credentialed | Cross-site MIMIC validation |

### Wearable & Ambulatory

| Dataset | Signal | Size | Access | Key Feature |
|---------|--------|------|--------|-------------|
| **PPG-BP** | PPG + ECG + BP | 657 subjects | Open | Cuffless BP estimation benchmark |
| **WESAD** | ECG + EDA + ACC + TEMP | 15 subjects | Open | Wearable stress detection |
| **DALI** | ECG + ACC | 16 subjects | Open | Daily life ambulatory ECG |
| **SleepACC** | Accelerometry | 23K+ nights | Open | Sleep staging from actigraphy |
| **PPG-DaLiA** | PPG + ECG + ACC + EDA | 15 subjects | Open | PPG-based HR estimation benchmark |

### Fetal & Neonatal

| Dataset | Signal | Size | Access | Key Feature |
|---------|--------|------|--------|-------------|
| **CTU-UHB** | Fetal ECG + UC | 552 records | Open | Intrapartum fetal monitoring |
| **African Fetal ECG** | Fetal ECG | 5 subjects | Open | Low-resource setting fetal monitoring |
| **Neonatal-PhysioNet** | Neonatal ECG + SpO2 | 1,400+ infants | Open | Neonatal sepsis detection |

### Large-Scale ECG Benchmarks

| Dataset | Size | Leads | Labels | Access | Key Use |
|---------|------|-------|--------|--------|---------|
| **PTB-XL+** | 21,837 + 71,821 | 12-lead | Enriched labels | Open | Extended PTB-XL with additional annotations |
| **CPSC 2018-2021** | 6,877-22,351 | 12-lead | Challenge labels | Open | AF, multi-class arrhythmia |
| **CODE-15** | 15K+ | 12-lead | Chagas + other | Open | Brazilian ECG; diverse population |
| **Chapman-Shaoxing** | 45,152 | 12-lead | 9 arrhythmia classes | Open | Large-scale arrhythmia classification |
| **Ningbo** | 20,000+ | 12-lead | Multi-class | Restricted | Chinese ECG; external validation |

---

## Credentialed Access Guide

### MIMIC-III/IV Credentialing Process

```
1. Register at https://physionet.org/register/
2. Complete CITI Training:
   → Go to https://about.citiprogram.org/
   → Select "Data or Specimens Only Research" course
   → Complete all required modules
   → Save completion certificate
3. Apply on PhysioNet:
   → Navigate to desired dataset page
   → Click "Request Access"
   → Upload CITI certificate
   → Provide institutional email and research description
   → Wait 1-2 weeks for approval
4. After Approval:
   → Download data from PhysioNetWorks
   → For MIMIC-III: Use build scripts from https://github.com/MIT-LCP/mimic-code
   → Load into PostgreSQL
   → Verify row counts against documentation
```

### ⚠️ Access Restriction Notice
As of 2025, PhysioNet restricts access to certain controlled-access datasets for users connecting from specific regions. Check current policy at https://physionet.org/ before applying.

---

## 2024-2025 New & Emerging Datasets

### Large-Scale Multimodal Datasets

| Dataset | Year | Modality | Size | Key Feature | Access |
|---------|------|----------|------|------------|--------|
| **MIMIC-IV-ECG** | 2023 | 12-lead ECG + clinical | 800K+ ECGs | Paired ECG + MIMIC-IV clinical data | Credentialed |
| **MIMIC-IV-Note** | 2023 | Clinical notes + structured | 1M+ notes | De-identified nursing + physician notes | Credentialed |
| **MIMIC-IV-ED** | 2023 | ED triage + vitals + outcomes | 400K+ ED stays | Emergency department workflow data | Credentialed |
| **MIMIC-CXR-JPG v2** | 2024 | Chest X-ray + labels | 377K images | Updated labels; better quality control | Open |
| **PTB-XL+** | 2024 | 12-lead ECG + rich metadata | 21K recordings | Age, sex, diagnosis hierarchy, follow-up | Open |
| **CODE-15%** | 2024 | 12-lead ECG | 1.5M+ recordings | Largest open ECG dataset; Brazilian population | Open |
| **ER-ECG** | 2024 | ECG + emergency outcomes | 700K+ | ECG in emergency room; outcomes linked | Application |
| **Abnormal Lung Sound** | 2024 | Lung auscultation | 4K+ recordings | ICBHI challenge; respiratory sounds | Open |

### Wearable & Consumer Device Datasets

| Dataset | Year | Device | Signals | Size | Key Feature | Access |
|---------|------|--------|---------|------|------------|--------|
| **PPG-BP** | 2024 | Finger PPG | PPG + BP | 2K+ subjects | PPG-based BP estimation benchmark | Open |
| **WESAD (expanded)** | 2024 | Chest + wrist | ECG, EDA, EMG, ACC, TEMP | 20 subjects | Stress detection; multi-sensor | Open |
| **DALI** | 2024 | Smartwatch | ACC, PPG, HR | 100+ subjects | Daily activity + physiological | Open |
| **Sleep-EDF Expanded** | 2024 | Headband | EEG, EOG, EMG | 200+ subjects | Expanded sleep staging dataset | Open |
| **Apple Heart Study Data** | 2024 | Apple Watch | PPG + ECG | 400K+ participants | Largest wearable AF study; restricted | Application |
| **Wearable Blood Pressure** | 2024 | Cuffless | PPG + ECG + cuff BP | 500+ subjects | Calibration-dependent BP estimation | Application |

### Multimodal Medical AI Datasets

| Dataset | Year | Modalities | Size | Task | Access |
|---------|------|-----------|------|------|--------|
| **MIMIC-IV Multi-Modal** | 2024 | EHR + ECG + CXR + notes | 50K+ patients | Multi-modal prediction | Credentialed |
| **PadChest Multi-Modal** | 2024 | CXR + reports + clinical | 160K+ images | Report generation; classification | Open |
| **BraTS 2024** | 2024 | MRI (4 sequences) + genomics | 2K+ patients | Brain tumor segmentation + molecular | Open (challenge) |
| **HECKTOR 2024** | 2024 | PET/CT + clinical | 1K+ patients | Head-neck tumor segmentation | Open (challenge) |
| **RadImageNet** | 2024 | CT, MRI, US | 1.3M+ images | Radiology foundation model pretraining | Open |
| **MedMD** | 2024 | Multi-modality medical | 10M+ samples | Medical foundation model pretraining | Partially open |

### Genomics + Clinical Linked Datasets

| Dataset | Year | Genomics | Clinical | Size | Key Feature |
|---------|------|----------|----------|------|------------|
| **UK Biobank v3** | 2024 | WGS + exome | EHR + imaging | 500K | Full genome + phenotype; most comprehensive |
| **All of Us v7** | 2024 | WGS + array | EHR + surveys | 1M+ | Most diverse US genomic cohort |
| **BioVU (Vanderbilt)** | 2024 | Array + WGS | EHR (de-identified) | 100K+ | Linked DNA + EHR; research only |
| **eMERGE** | 2024 | Array + WGS | EHR + phenotypes | 80K+ | Genomics + EHR phenotyping network |

---

## Dataset Selection Decision Framework

### By Research Question

```
Research Question
  │
  ├─ ECG arrhythmia classification?
  │   └─ PTB-XL (open, 21K) → CODE-15% (open, 1.5M) → MIMIC-IV-ECG (credentialed, 800K)
  │       → Start with PTB-XL for development; scale to CODE-15% for large-scale
  │
  ├─ Sleep staging?
  │   └─ Sleep-EDF (open, 200+) → SHHS (application, 6K+) → MESA (dbGaP, 2K+)
  │
  ├─ ICU clinical prediction?
  │   └─ MIMIC-IV (credentialed) → eICU (credentialed) → AmsterdamUMCdb (open)
  │
  ├─ Wearable health monitoring?
  │   └─ WESAD (open, 20) → DALI (open, 100+) → Apple Heart Study (restricted)
  │
  ├─ Multi-modal medical AI?
  │   └─ MIMIC-IV Multi-Modal (credentialed) → PadChest (open) → custom collection
  │
  ├─ Medical imaging + genomics?
  │   └─ UK Biobank (registered) → BraTS 2024 (open challenge) → TCGA + TCIA (open)
  │
  └─ Drug discovery / molecular?
      → MoleculeNet (open) → ChEMBL (open) → ZINC20 (open)
```

### By Data Scale Requirements

| Scale | ECG | Imaging | ICU | Genomics |
|-------|-----|---------|-----|---------|
| **Small (<1K)** | PTB Diagnostic | CheXpert subset | MIMIC-III subset | MoleculeNet |
| **Medium (1K-100K)** | PTB-XL, LUDB | PadChest, VinDr | MIMIC-IV | GEO datasets |
| **Large (100K-1M)** | CODE-15% | MIMIC-CXR | eICU | UK Biobank |
| **Very Large (>1M)** | ER-ECG, proprietary | RadImageNet | Proprietary EHR | All of Us |

---

## Dataset Quality Assessment Protocol

### Before Using Any Dataset

```
Dataset Under Consideration
  ↓
[1] Provenance Check
    → Who collected the data? When? Where?
    → What was the original purpose?
    → ⚠️ Datasets repurposed from clinical workflows may have systematic biases
  ↓
[2] Population Representativeness
    → Age, sex, race/ethnicity distribution
    → Inpatient vs outpatient vs community
    → ⚠️ Hospital-based datasets over-represent severe disease
  ↓
[3] Label Quality
    → How were labels generated? (Expert, algorithm, billing codes)
    → Inter-rater agreement if expert-labeled
    → ⚠️ Billing code labels have ~80-90% PPV; expert labels are gold standard
  ↓
[4] Data Leakage Risk
    → Same patient in train and test? (Patient-wise split required)
    → Temporal leakage? (Future data in training set)
    → ⚠️ Random split on medical data = patient leakage almost certainly
  ↓
[5] Preprocessing Documentation
    → What preprocessing was already applied?
    → Can you access raw data?
    → ⚠️ Pre-processed data may have artifacts from unknown transformations
  ↓
[6] Reproducibility
    → Is the dataset versioned?
    → Can you download the exact same version as the paper?
    → ⚠️ Datasets that are updated without versioning = irreproducible results
```

**Rule**: ALWAYS use patient-wise splitting for medical datasets. Random splitting causes data leakage because multiple samples from the same patient appear in both train and test.
**Rule**: Report the EXACT dataset version and download date. Medical datasets are updated frequently, and results may not be reproducible across versions.
**Rule**: If a dataset has <100 positive cases for your target condition, it is likely INSUFFICIENT for training a reliable model. Consider data augmentation or transfer learning.
