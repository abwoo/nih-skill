# EEG/BCI Methodology Authority Framework

## Reference Index

| ID | Paper | Year | Domain | Authority Level |
|----|-------|------|--------|----------------|
| EEG-01 | Ramoser et al. — Optimal Spatial Filtering of Single Trial EEG During Imagery Task | 2000 | BCI/CSP | ★★★★★ Foundational |
| EEG-02 | Blankertz et al. — BCI Competition III & IV | 2006-2008 | BCI Benchmark | ★★★★★ Foundational |
| EEG-03 | Delorme & Makeig — EEGLAB: An Open Source Toolbox for Analysis of Single-Trial EEG Dynamics | 2004 | EEG Processing | ★★★★★ Foundational |
| EEG-04 | Rechtschaffen & Kales — A Manual of Standardized Terminology, Techniques and Scoring System for Sleep Stages | 1968 | Sleep Staging | ★★★★★ Foundational |
| EEG-05 | Phan et al. — Automatic Sleep Stage Classification: A Comparative Study of EEG Features and Classifiers | 2019 | Sleep Staging ML | ★★★★ Authoritative |
| EEG-06 | Perslev et al. — U-Sleep: Resilient High-Frequency Sleep Staging | 2021 | Sleep Staging DL | ★★★★★ Landmark |
| EEG-07 | Schirrmeister et al. — Deep Learning with ConvNets for EEG Decoding (Brain Decode) | 2017 | DL-EEG | ★★★★ Authoritative |

---

## EEG-01: CSP (Common Spatial Patterns) — Ramoser et al.

### Citation
Ramoser H, Muller-Gerking J, Pfurtscheller G. Optimal Spatial Filtering of Single Trial EEG During Imagery Task. IEEE Trans Rehabil Eng. 2000;8(4):441-446.

### Methodology Decomposition

**Core Idea**: Find spatial filters that maximize the variance of one class while minimizing the variance of another class, enabling optimal discrimination of motor imagery EEG.

**Mathematical Framework**:
```
Given: Multi-channel EEG X ∈ R^(C×T) for each trial
Classes: Σ1 (class 1 covariance), Σ2 (class 2 covariance)

Objective: Find W such that:
  - W^T Σ1 W is maximized (large variance for class 1)
  - W^T Σ2 W is minimized (small variance for class 2)

Solution: Simultaneous diagonalization via generalized eigenvalue problem:
  Σ1 w = λ Σ2 w

Features: log-variance of projected signals
  f_i = log(w_i^T Σ w_i) for each spatial filter w_i
```

**Key Technical Decisions**:
1. Uses covariance matrices as the fundamental signal representation
2. Log-variance features are approximately normally distributed → suitable for LDA
3. Typically select top 2-3 and bottom 2-3 eigenvectors (m=2 or 3 pairs)
4. Requires bandpass filtering to relevant frequency band (8-30Hz for motor imagery)

**Performance**: 90%+ on 2-class motor imagery (BCI Competition datasets)

**Methodological Insight — Why This Is Foundational**:
1. CSP is the single most important spatial filtering method for BCI
2. It provides a principled, optimal solution (not heuristic) for binary discrimination
3. The log-variance feature extraction creates a natural interface to standard classifiers
4. All subsequent BCI spatial filtering methods (RCSP, WCSP, CSP-LDA pipeline) are extensions

**Known Limitations**:
- Sensitive to non-stationarity across sessions
- Requires sufficient training trials (typically 50+ per class)
- Binary classification only (multi-class requires one-vs-one or one-vs-rest)
- Overfits with small sample sizes → regularization needed (RCSP)

**Reproducibility**: ★★★★★
- Algorithm fully specified mathematically
- Available in `mne-python` (`mne.decoding.CSP`)
- Standard benchmark datasets on BCI Competition (open access)
- Implementation difficulty: ★★☆☆☆

**When to Reference This**:
- Any motor imagery BCI study
- Spatial filtering for EEG classification
- Understanding the standard BCI pipeline (filter → CSP → LDA)
- Baseline comparison for novel spatial filtering methods

---

## EEG-03: EEGLAB — Delorme & Makeig

### Citation
Delorme A, Makeig S. EEGLAB: An Open Source Toolbox for Analysis of Single-Trial EEG Dynamics. J Neurosci Methods. 2004;134(1):9-21.

### Methodology Decomposition

**Core Idea**: Provide an integrated, open-source toolbox for EEG preprocessing, artifact removal (ICA), and time-frequency analysis.

**Standard EEG Processing Pipeline (EEGLAB)**:
```
Import Data → Channel Location → Re-reference →
Bandpass Filter (0.5-50Hz) → Notch Filter (50/60Hz) →
Run ICA → Identify & Remove Artifacts (ocular, muscle, line noise) →
Epoch Extraction → Baseline Correction → Time-Frequency Analysis → Statistical Analysis
```

**Key Methodological Contributions**:
1. **ICA for Artifact Removal**: Extended Infomax ICA decomposes EEG into independent components; artifact components are identified and removed
2. **Standardized Preprocessing**: EEGLAB established the de facto standard preprocessing pipeline
3. **Time-Frequency Analysis**: Event-related spectral perturbation (ERSP) and inter-trial coherence (ITC)

**Methodological Insight**:
- ICA artifact removal is the gold standard for EEG preprocessing
- The choice of reference (common average, linked mastoids, Laplacian) significantly affects results
- Baseline correction window matters: typically -200ms to 0ms before event

**When to Reference This**:
- Any EEG preprocessing pipeline design
- ICA-based artifact removal methodology
- Standard EEG analysis workflow
- Comparison of preprocessing approaches

---

## EEG-06: U-Sleep — Resilient High-Frequency Sleep Staging

### Citation
Perslev M, Darkner S, Kempfner L, et al. U-Sleep: Resilient High-Frequency Sleep Staging. npj Digit Med. 2021;4:72.

### Methodology Decomposition

**Core Idea**: A fully convolutional U-Net that performs sleep staging at 30-second epoch resolution from any combination of EEG/EOG/EMG channels, trained on massive multi-cohort data.

**Architecture**: U-Net variant with temporal convolutions
**Input**: Raw EEG + EOG + EMG (any channel combination)
**Output**: 5-class sleep staging (W, N1, N2, N3, REM) at 30s epoch resolution
**Training Data**: 15,660 recordings from 8 independent clinical cohorts

**Key Technical Decisions**:
1. Channel-agnostic: works with ANY available channel combination
2. Trained on diverse cohorts → generalizes across populations and recording setups
3. No hand-crafted features — end-to-end from raw signals
4. High-frequency output: can score at sub-epoch resolution

**Performance**:
- Overall accuracy: ~83-87% across cohorts
- Cohen's kappa: ~0.79-0.83
- Outperforms most prior methods including manual scoring agreement boundaries

**Critical Analysis**:
| Dimension | Rating | Detail |
|-----------|--------|--------|
| Contradictory Evidence | 🟢 | Consistent performance across 8 cohorts |
| Statistical Vulnerability | 🟢 | Large multi-cohort training; per-cohort evaluation |
| Reproduction Risk | 🟡 | Code available; but training data from multiple clinical sites |
| Hidden Assumptions | 🟡 | Assumes 30s epoch structure (AASM standard) |

**⚠️ AASM vs R&K Scoring Standard Differences**:
When comparing sleep staging results across papers, check which scoring standard was used:
| Feature | AASM (2007+) | R&K (1968-2007) |
|---------|-------------|-----------------|
| Sleep stages | W, N1, N2, N3, REM | W, 1, 2, 3, 4, REM |
| Slow-wave sleep | N3 (combines stage 3+4) | Stage 3 + Stage 4 (separate) |
| Epoch length | 30 seconds | 30 seconds (same) |
| N1 criteria | More specific arousal-based | Less specific |
| Impact on ML | 5-class standard | 5-class (if merging 3+4) or 6-class |
| **Key issue** | Results from AASM and R&K are NOT directly comparable | Stage 3/4 split affects SWS detection |

**Rule**: If a paper uses Sleep-EDF (which uses R&K), results are NOT directly comparable with papers using MASS or SHHS (which use AASM). Always check the scoring standard before comparing accuracy numbers.
**Dataset-scoring mapping**: Sleep-EDF→R&K, MASS→AASM, SHHS→AASM, DOD-H→AASM, DOD-O→AASM
| Data Leakage Risk | 🟢 | Subject-wise splits; cohort-wise evaluation |

**When to Reference This**:
- Sleep staging automation
- Designing channel-agnostic EEG models
- Multi-cohort training methodology
- Understanding SOTA performance bounds for sleep staging

---

## EEG/BCI Methodology Synthesis Framework

### Automatic Thinking Protocol for EEG/BCI Papers

```
1. SIGNAL LEVEL
   → Channel count and montage (10-20 / 32-ch / 64-ch / custom)
   → Sampling rate (250 / 500 / 1000 Hz)
   → Reference choice (common average / linked mastoid / Laplacian / Cz)
   → Artifact handling (ICA / regression / automated rejection)

2. TASK LEVEL
   → Motor imagery / P300 / SSVEP / Sleep staging / Emotion / Epilepsy detection
   → Classification vs regression vs generation
   → Binary vs multi-class
   → Within-subject vs cross-subject vs cross-dataset

3. PARADIGM LEVEL
   → Standard BCI: Filter → CSP → LDA (EEG-01 pipeline)
   → Deep BCI: Raw EEG → CNN/RNN/Transformer → Classification (EEG-07 pipeline)
   → Hybrid: Filter → CSP features → DL classifier
   → Sleep: Raw PSG → U-Net/TCN → 5-class staging (EEG-06 pipeline)

4. EVALUATION LEVEL
   → Classification accuracy / Cohen's kappa / AUC
   → For BCI: ITR (Information Transfer Rate) in bits/min
   → Cross-subject generalization (critical for clinical deployment)
   → Session-to-session transfer (non-stationarity handling)

**⚠️ Cross-Subject Evaluation Protocol for BCI/EEG**:
When evaluating a BCI or EEG model, the evaluation strategy critically affects results:

| Strategy | Description | Expected Performance | When to Use |
|----------|-------------|---------------------|-------------|
| Within-subject (k-fold) | Train and test on same subject's data | Highest (~80-95%) | Personalized BCI; proof of concept |
| Within-subject (train/test sessions) | Train on early sessions, test on later | Moderate (~70-85%) | More realistic; tests temporal stability |
| Leave-one-subject-out (LOSO) | Train on N-1 subjects, test on 1 | Low-moderate (~55-75%) | Tests cross-subject generalization |
| Cross-subject (random split) | Random subject split, no overlap | Moderate (~65-80%) | Standard for sleep staging |
| Cross-dataset | Train on dataset A, test on dataset B | Lowest (~50-70%) | Strongest generalization test |

**Rule**: If a paper claims "generalizable" or "subject-independent" but only evaluates within-subject, flag: "⚠️ Claim not supported — within-subject results do not demonstrate cross-subject generalization."
**Rule**: For BCI papers, ALWAYS report both within-subject AND cross-subject (LOSO) results.
**Rule**: For sleep staging, cross-dataset evaluation (e.g., train on Sleep-EDF, test on MASS) is the gold standard.

5. CLINICAL LEVEL
   → Online vs offline evaluation
   → Real-time latency requirements
   → Subject calibration burden (zero-calibration is the goal)
   → Population: healthy vs clinical (stroke, ALS, etc.)
```

### EEG/BCI Method Matching Matrix

| User Task | Recommended Method | Key Reference | Dataset | Difficulty |
|-----------|-------------------|---------------|---------|------------|
| Motor imagery (2-class) | Bandpass → CSP → LDA | EEG-01 | BCI Competition III/IV | ★★☆☆☆ |
| Motor imagery (multi-class) | Filter → RCSP → SVM | EEG-01 | BCI Competition | ★★★☆☆ |
| Motor imagery (DL) | Raw EEG → ConvNet | EEG-07 | BCI Competition, PhysioNet | ★★★☆☆ |
| Sleep staging | U-Net on raw PSG | EEG-06 | Sleep-EDF, SHHS | ★★★☆☆ |
| P300 detection | Spatial filter → LDA/SVM | — | BCI Competition III | ★★☆☆☆ |
| SSVEP detection | CCA / TRCA | — | Open datasets | ★★☆☆☆ |
| Epilepsy detection | Wavelet + CNN | — | Bonn EEG, TUH EEG | ★★★☆☆ |
| Emotion recognition | DE features + SVM/DL | — | SEED, DEAP | ★★★☆☆ |
| Cross-subject BCI | Transfer learning / Domain adaptation | — | BCI Competition | ★★★★☆ |

### EEG Preprocessing Decision Tree

```
Raw EEG
├─ Is it sleep staging? → Use PSG pipeline (EEG+EOG+EMG)
│   └─ Reference: EEG-06 U-Sleep pipeline
├─ Is it motor imagery BCI?
│   ├─ Traditional: Bandpass(8-30Hz) → CSP → LDA
│   │   └─ Reference: EEG-01
│   └─ Deep learning: Raw → ConvNet/EEGNet
│       └─ Reference: EEG-07
├─ Is it clinical EEG (epilepsy/diagnostic)?
│   ├─ Standard: EEGLAB pipeline (ICA artifact removal)
│   │   └─ Reference: EEG-03
│   └─ DL: Raw → 1D-CNN with attention
└─ Is it emotion/BCI with few channels?
    └─ Use channel-agnostic models or transfer learning
```

## BCI Performance Baselines (Evidence-Based)

### Motor Imagery Classification Accuracy Baselines

| Task | Classes | Traditional (CSP+LDA) | Deep Learning (EEGNet) | SOTA | Notes |
|------|---------|----------------------|----------------------|------|-------|
| **2-class MI (left/right hand)** | 2 | 80-90% | 85-95% | 95%+ (subject-specific) | BCI Competition IV-2a |
| **4-class MI (left/right hand/feet/tongue)** | 4 | 60-75% | 70-85% | 85%+ | BCI Competition IV-2a |
| **Finger-level decoding (EEG)** | 5+ | N/A (not feasible) | 60-80% | 80% (2025 Nature Comms) | Previously considered impossible with EEG |
| **Finger-level decoding (ECoG)** | 5+ | 80-90% | 90-95% | 95%+ | Invasive; much higher signal quality |

**Rule**: Non-invasive finger-level decoding (60-80%) is a genuine L3+ breakthrough because prior consensus held it was impossible. Compare against "impossible" baseline, not against ECoG.
**Rule**: 2-class MI accuracy >90% is NOT a breakthrough — this has been achievable since 2008. Only improvements in generalization, calibration time, or subject-independence are innovative.

### BCI Transfer Learning Baselines

| Method | Within-Subject | Cross-Subject | Leave-One-Subject-Out | Notes |
|--------|---------------|--------------|----------------------|-------|
| **No transfer (subject-specific)** | 80-95% | N/A | N/A | Gold standard but requires calibration |
| **Cross-subject (no adaptation)** | N/A | 55-70% | 55-70% | Poor generalization |
| **Cross-subject (with adaptation)** | N/A | 70-85% | 70-85% | Few-shot calibration |
| **Foundation model (EEG-Foundation)** | 85-95% | 70-80% | 70-80% | Emerging approach |

**Rule**: Cross-subject BCI accuracy >80% with <5 min calibration would be L3+ innovation. Current cross-subject without adaptation is 55-70%.

### EEG-BCI Innovation Assessment Quick Reference

| Claimed Innovation | Red Flag Check | Genuine Innovation Check |
|-------------------|---------------|------------------------|
| **"95% accuracy on MI-BCI"** | Is it 2-class? Subject-specific? Same dataset as everyone else? | Only innovative if: multi-class, cross-subject, or zero-calibration |
| **"Real-time BCI control"** | What is the latency? How many commands per minute? ITR? | ITR >50 bits/min is competitive; >100 is excellent |
| **"Finger-level EEG control"** | How many fingers? How many subjects? Within or cross-subject? | 5+ fingers, cross-subject, >60% = L3+ |
| **"Zero-calibration BCI"** | What is the accuracy drop vs calibrated? How many subjects? | <5% drop with zero calibration = L3+ |

---

## SSVEP-Based BCI Methodology

### SSVEP Principles & Paradigm Design

| Parameter | Typical Value | Range | Impact on Performance |
|-----------|-------------|-------|----------------------|
| **Stimulus frequency** | 8-15 Hz | 5-30 Hz | Higher freq → stronger SSVEP but less comfortable |
| **Number of targets** | 4-8 | 2-40+ | More targets → lower SNR per target |
| **Stimulus duration** | 3-5 s | 0.5-10 s | Shorter → lower accuracy but higher ITR |
| **Electrode placement** | Oz, POz, PO3/4 | Occipital-parietal | Must cover visual cortex |
| **Reference** | Linked mastoid or Cz | — | Ear reference reduces line noise |

### SSVEP Signal Processing Pipeline

```
Raw EEG (occipital channels)
  ↓
[1] Preprocessing
    → Bandpass filter: 5-40 Hz (covers typical SSVEP range)
    → Notch filter: 50/60 Hz (line noise)
    → ⚠️ Do NOT use aggressive filtering that removes target frequencies
  ↓
[2] Frequency Analysis
    → PSD: Power at each stimulus frequency
    → CCA: Canonical correlation between EEG and reference signals
    → TRCA: Task-related component analysis (BEST for SSVEP)
    → ⚠️ CCA is standard; TRCA is SOTA for short-window SSVEP
  ↓
[3] Target Detection
    → Compare power/correlation at each stimulus frequency
    → Select frequency with maximum response
    → ⚠️ Harmonic frequencies (2f, 3f) should be included in analysis
  ↓
[4] Dynamic Stopping (Optional)
    → Accumulate evidence over time; stop when confident
    → Reduces average decision time while maintaining accuracy
    → ⚠️ Must set minimum and maximum window lengths
```

### SSVEP Method Comparison

| Method | Window Length | Accuracy (4-class) | ITR | Complexity | Best For |
|--------|-------------|-------------------|-----|-----------|---------|
| **PSA (Power Spectral Analysis)** | 3-5s | 85-90% | 30-50 | Low | Simple setups |
| **CCA** | 1-3s | 90-95% | 60-100 | Medium | Standard SSVEP BCI |
| **Extended CCA** | 0.5-2s | 92-97% | 80-150 | Medium | Improved CCA with individual calibration |
| **TRCA** | 0.5-1.5s | 95-99% | 100-200 | Medium-High | SOTA for short-window SSVEP |
| **eTRCA** | 0.5-1s | 96-99% | 150-300 | High | Ensemble TRCA; best ITR |
| **Deep learning (CNN)** | 0.5-1s | 93-97% | 80-150 | High | Cross-subject generalization |

**Rule**: TRCA is the current SOTA for SSVEP BCI. Any paper claiming SSVEP improvement must compare against TRCA.
**Rule**: SSVEP ITR claims >300 bits/min should be treated with skepticism — these typically use idealized conditions (few targets, trained subjects, artifact-free data).

---

## Real-Time BCI Deployment

### Latency Budget for Closed-Loop BCI

| Component | Typical Latency | Maximum Acceptable | Optimization |
|-----------|----------------|-------------------|-------------|
| **Data acquisition** | 5-20 ms | 50 ms | Higher sampling rate; buffer optimization |
| **Preprocessing** | 1-10 ms | 20 ms | Efficient filtering; avoid ICA in real-time |
| **Feature extraction** | 1-5 ms | 10 ms | Precomputed spatial filters; sliding window |
| **Classification** | 1-5 ms | 10 ms | Lightweight model; ONNX export |
| **Command output** | 5-20 ms | 50 ms | Direct hardware interface |
| **Total** | 13-60 ms | 140 ms | Target: <100 ms total for responsive BCI |

### BCI System Architecture

```
[EEG Amplifier] → [Data Acquisition] → [Preprocessing] → [Feature Extraction] → [Classifier] → [Application]
     ↑                  ↑                    ↑                  ↑                   ↑              ↑
  Hardware         LabStreamingLayer     Real-time          CSP/PCA            LDA/SVM        Wheelchair
  (g.tec,         (LSL) for sync        filtering          (precomputed)       (lightweight)   Speller
  OpenBCI,                              + artifact          or: band power      or: CNN        Prosthetic
  BioSemi)                              rejection           features            (quantized)    Robot arm
```

### Real-Time BCI Challenges

| Challenge | Description | Solution | Trade-off |
|-----------|-------------|----------|-----------|
| **Non-stationarity** | EEG changes over time within session | Adaptive classifiers; transfer learning | Adaptation speed vs stability |
| **Inter-subject variability** | Each user has different EEG patterns | Subject-specific calibration; domain adaptation | Calibration time vs accuracy |
| **Artifact contamination** | Blinks, muscle, movement in real use | Real-time artifact detection; robust features | Latency vs artifact rejection |
| **Fatigue** | Performance degrades with prolonged use | Adaptive difficulty; rest prompts | Session length vs performance |
| **Feedback delay** | Delay between intent and visual feedback | Minimize system latency; predictive feedback | System complexity vs responsiveness |

**Rule**: Real-time BCI MUST report Information Transfer Rate (ITR), not just accuracy. ITR accounts for both accuracy and speed.
**Rule**: ITR formula: ITR = log2(N) × [P × log2(P) + (1-P) × log2((1-P)/(N-1))] × 60/T bits/min, where N = number of targets, P = accuracy, T = average selection time.

---

## EEG Foundation Models (2024-2025)

### Emerging EEG Foundation Models

| Model | Year | Pretraining Data | Architecture | Key Capability | Status |
|-------|------|-----------------|-------------|---------------|--------|
| **Labram** | 2024 | 20K+ recordings | Masked autoencoder | Self-supervised EEG representation | Research |
| **BIOT** | 2024 | Multiple datasets | Transformer | Cross-dataset EEG | Research |
| **Neuro-GPT** | 2024 | TUH EEG + others | GPT-style | Generative EEG | Research |
| **EEGPT** | 2024 | Large-scale | Foundation model | Multi-task EEG | Research |
| **LaBraM** | 2024 | 25K+ recordings | Masked Transformer | General EEG encoding | Research |

### EEG Foundation Model Assessment

| Assessment | Key Question | Required Evidence | Red Flag |
|-----------|-------------|-------------------|---------|
| **Pretraining diversity** | Does pretraining data cover multiple paradigms? | MI, SSVEP, ERP, sleep, clinical EEG | Trained on single paradigm |
| **Channel robustness** | Does it handle different channel counts? | Performance with reduced montages | Requires exact channel setup |
| **Sampling rate invariance** | Does it work across sampling rates? | Multi-rate evaluation | Fixed sampling rate required |
| **Few-shot capability** | Can it learn new tasks from few examples? | Learning curves with varying data | No few-shot evaluation |
| **Clinical applicability** | Can it detect clinical abnormalities? | Seizure detection, anomaly detection | Only tested on healthy subjects |

**Rule**: EEG foundation models are VERY EARLY STAGE as of 2025. Channel count, sampling rate, and montage differences make cross-dataset generalization extremely challenging.
**Rule**: An EEG foundation model that cannot handle variable channel counts is NOT a true foundation model — it is a multi-task model with fixed input requirements.

### EEG Foundation Model Landscape (2025-2026 Update)

| Model | Pretraining Data | Key Innovation | Downstream Tasks | Limitation | Reference |
|-------|-----------------|----------------|-----------------|------------|-----------|
| **REVE** | 60,000+ hrs, 92 datasets, 25,000 subjects | 4D positional encoding; arbitrary length & electrode arrangement; masked autoencoding | 10 tasks (MI, seizure, sleep staging, etc.) | SOTA on benchmarks but gap vs traditional decoders in some tasks | ICLR 2026 |
| **BrainPro** | Large EEG corpus | Brain state-decoupling module; retrieval-based spatial learning for cross-layout alignment | MI, sleep, clinical | State-specific vs shared representation separation | NeurIPS 2025 |
| **LaBraM** | ~20,000 hrs | Channel-wise masking; temporal-spatial pretraining | MI, seizure, emotion | Fixed channel requirement | AAAI 2024 |

**ICLR 2026 Benchmark — "Are EEG Foundation Models Worth It?"**:
- Systematic comparison of EEG foundation models vs traditional decoders across diverse BCI tasks
- 6 complementary evaluation protocols: population decoding, transfer, low-data, cross-subject, cross-session, cross-dataset
- Key finding: foundation models excel in LOW-DATA and TRANSFER settings but traditional decoders often MATCH or EXCEED them in DATA-RICH settings
- Model rankings CHANGE with benchmark split construction and preprocessing alone
- Rigorous statistical testing reveals many "improvements" are not significant

**EEG Foundation Model Assessment Decision Tree (2026 Update)**:
```
Paper claims "EEG foundation model"
    │
    ├─ Can it handle VARIABLE channel counts/montages? → YES: Continue → NO: Multi-task model, NOT foundation model
    │
    ├─ Was it compared against TRADITIONAL decoders? → YES: Continue → NO: Cannot claim superiority
    │
    ├─ Does it outperform in LOW-DATA settings? → YES: Genuine transfer value → NO: Same data requirements as training from scratch
    │
    ├─ Was statistical significance tested? → YES: Continue → NO: Improvements may be noise
    │
    ├─ Was it tested on EXTERNAL datasets? → YES: V2+ → NO: V1 (internal only)
    │
    └─ Does preprocessing affect rankings? → YES: Report preprocessing sensitivity → NO: Unusual (usually affects)
```

**Rule**: EEG foundation models are NOT universally superior to traditional decoders. They shine in low-data and transfer settings but may not justify the computational cost in data-rich scenarios (ICLR 2026 benchmark).
**Rule**: EEG benchmark results are SENSITIVE to preprocessing and split construction. Any EEG foundation model paper MUST report preprocessing details and conduct sensitivity analysis.
**Rule**: REVE (ICLR 2026) is the current SOTA EEG foundation model with 25,000 subjects, but its advantage over traditional methods is TASK-DEPENDENT and DATA-REGIME DEPENDENT.

---

## Intracranial EEG (iEEG/ECoG) Methodology

### iEEG vs Scalp EEG Comparison

| Feature | Scalp EEG | ECoG (iEEG) | Depth Electrodes (sEEG) |
|---------|----------|------------|------------------------|
| **Spatial resolution** | ~1-2 cm | ~1-2 mm | ~1 mm |
| **Signal amplitude** | 10-100 μV | 100-1000 μV | 50-500 μV |
| **Frequency range** | 0.5-40 Hz useful | 0.5-200+ Hz useful | 0.5-200+ Hz useful |
| **High-frequency oscillations** | Not detectable | Detectable (80-500 Hz) | Detectable |
| **Spatial coverage** | Whole scalp | Limited surgical field | Limited to electrode tracks |
| **Invasiveness** | Non-invasive | Requires craniotomy | Requires stereotactic surgery |
| **Clinical use** | Routine diagnostics | Epilepsy surgery planning | Epilepsy surgery planning |
| **Artifact level** | High (muscle, eye) | Low (under skull) | Low |

### iEEG Analysis Pipeline

```
Raw iEEG (ECoG or sEEG)
  ↓
[1] Preprocessing
    → Notch filter: 50/60 Hz + harmonics
    → Bandpass: 0.5-500 Hz (iEEG preserves high frequencies)
    → ⚠️ Do NOT apply scalp EEG frequency limits to iEEG
    → Common average reference or bipolar montage
  ↓
[2] High-Frequency Oscillation (HFO) Detection
    → Bandpass filter: 80-500 Hz (ripple); 250-500 Hz (fast ripple)
    → RMS or Hilbert envelope detection
    → Threshold: 3-5 SD above baseline
    → ⚠️ HFOs are biomarkers for epileptogenic zone — clinical significance
  ↓
[3] Functional Connectivity
    → Phase locking value (PLV)
    → Granger causality
    → Transfer entropy
    → ⚠️ Volume conduction less of an issue for iEEG; but reference still matters
  ↓
[4] Seizure Detection/Prediction
    → Feature extraction: spectral power, connectivity, HFO rate
    → Classifier: SVM, LSTM, or CNN
    → ⚠️ Seizure PREDICTION (minutes before) is much harder than detection
    → ⚠️ Most seizure prediction papers suffer from data leakage or overfitting
```

**Rule**: iEEG analysis should ALWAYS exploit high-frequency content (>80 Hz) that is invisible in scalp EEG. Ignoring HFOs wastes the primary advantage of iEEG.
**Rule**: Seizure prediction claims require PROSPECTIVE validation with appropriate controls (e.g., random predictor baseline). Most retrospective seizure prediction results do not generalize.

---

## EEGBCI-01: Yang Liu et al. — Resting-state EEG, Substance use and Abstinence After Chronic use: A Systematic ...

### Citation
Yang Liu, Yujie Chen, Gorka Fraga-González, Veronica Szpak, Judith Laverman, R. Wiers, K. Richard Ridderinkhof. Resting-state EEG, Substance use and Abstinence After Chronic use: A Systematic Review. Clinical EEG and Neuroscience. 2022. PMID: 35142589. DOI: 10.1177/15500594221076347.

### Methodology Decomposition

**Core Idea**: Resting-state EEG reflects intrinsic brain activity and its alteration represents changes in cognition that are related to neuropathology. Thereby, it provides a way of revealing the neurocognitive me...

**Reproducibility Notes**:
- Data availability: ❓ Unknown
- Code availability: To be verified
- Difficulty rating: ★★☆☆☆ (requires manual assessment)

**When to Reference This**:
- General reference for Resting-state EEG, Substance related queries
- Background knowledge for domain-specific questions

---

## EEGBCI-02: R. Menaka et al. — An Improved AlexNet Model and Cepstral Coefficient-Based Classification of Autis...

### Citation
R. Menaka, R. Karthik, S. Saranya, M. Niranjan, S. Kabilan. An Improved AlexNet Model and Cepstral Coefficient-Based Classification of Autism Using EEG. Clinical EEG and Neuroscience. 2023. PMID: 37246419. DOI: 10.1177/15500594231178274.

### Methodology Decomposition

**Core Idea**: Autism is a neurodevelopmental disorder that cannot be completely cured, but early intervention during childhood can improve outcomes. Identifying autism spectrum disorder (ASD) has relied on subjecti...

**Reproducibility Notes**:
- Data availability: ❓ Unknown
- Code availability: To be verified
- Difficulty rating: ★★☆☆☆ (requires manual assessment)

**When to Reference This**:
- General reference for An Improved AlexNet related queries
- Background knowledge for domain-specific questions

---

## EEGBCI-03: S. Keller et al. — Information Contained in EEG Allows Characterization of Cognitive Decline in Neu...

### Citation
S. Keller, Cornelius Reyneke, U. Gschwandtner, P. Fuhr. Information Contained in EEG Allows Characterization of Cognitive Decline in Neurodegenerative Disorders. Clinical EEG and Neuroscience. 2022. PMID: 36069039. DOI: 10.1177/15500594221120734.

### Methodology Decomposition

**Core Idea**: Over the last few decades, electroencephalography (EEG) has evolved from being a method that purely relies on visual inspection into a quantitative method. Quantitative EEG, or QEEG, enables the asses...

**Reproducibility Notes**:
- Data availability: ❓ Unknown
- Code availability: To be verified
- Difficulty rating: ★★☆☆☆ (requires manual assessment)

**When to Reference This**:
- General reference for Information Contained in related queries
- Background knowledge for domain-specific questions

---

## EEGBCI-04: Annibale Antonioni et al. — A Multimodal Analysis to Explore Upper Limb Motor Recovery at 4 Weeks After Stro...

### Citation
Annibale Antonioni, Martina Galluccio, Riccardo Toselli, A. Baroni, G. Fregna, Nicola Schincaglia, Giada Milani, M. Cosma, G. Ferraresi, M. Morelli, I. Casetta, Alessandro De Vito, Stefano Masiero, N. Basaglia, Paola Malerba, G. Severini, Sofía Straudi. A Multimodal Analysis to Explore Upper Limb Motor Recovery at 4 Weeks After Stroke: Insights From EEG and Kinematics Measures. Clinical EEG and Neuroscience. 2023. PMID: 37859431. DOI: 10.1177/15500594231209397.

### Methodology Decomposition

**Core Idea**: Background. Stroke is a leading cause of death and disability worldwide and there is a very short period of increased synaptic plasticity, fundamental in motor recovery. Thus, it is crucial to acquire...

**Reproducibility Notes**:
- Data availability: ❓ Unknown
- Code availability: To be verified
- Difficulty rating: ★★☆☆☆ (requires manual assessment)

**When to Reference This**:
- General reference for A Multimodal Analysis related queries
- Background knowledge for domain-specific questions

---

## EEGBCI-05: Nupur Chugh et al. — The Hybrid Deep Learning Model for Identification of Attention-Deficit/Hyperacti...

### Citation
Nupur Chugh, Swati Aggarwal, Arnav Balyan. The Hybrid Deep Learning Model for Identification of Attention-Deficit/Hyperactivity Disorder Using EEG. Clinical EEG and Neuroscience. 2023. PMID: 37682533. DOI: 10.1177/15500594231193511.

### Methodology Decomposition

**Core Idea**: Common misbehavior among children that prevents them from paying attention to tasks and interacting with their surroundings appropriately is attention-deficit/hyperactivity disorder (ADHD). Studies of...

**Reproducibility Notes**:
- Data availability: ❓ Unknown
- Code availability: To be verified
- Difficulty rating: ★★☆☆☆ (requires manual assessment)

**When to Reference This**:
- General reference for The Hybrid Deep related queries
- Background knowledge for domain-specific questions

---

## EEGBCI-06: Pratima Kaushik et al. — Remediation of Learning Difficulty Utilizing School-Based Cognitive Behavioral I...

### Citation
Pratima Kaushik, P. Shrivastava. Remediation of Learning Difficulty Utilizing School-Based Cognitive Behavioral Intervention Measured by EEG Theta-Alpha and Theta-Beta Ratio During Resting and Cognitive Task Performance Conditions. Clinical EEG and Neuroscience. 2024. PMID: 38751127. DOI: 10.1177/15500594241252483.

### Methodology Decomposition

**Core Idea**: Background. EEG is an effective tool due to its ability to capture and interpret the changes in brain activity under different situations. Quantitative EEG (qEEG) can be essential in evaluating and tr...

**Reproducibility Notes**:
- Data availability: ❓ Unknown
- Code availability: To be verified
- Difficulty rating: ★★☆☆☆ (requires manual assessment)

**When to Reference This**:
- General reference for Remediation of Learning related queries
- Background knowledge for domain-specific questions

---

## EEGBCI-07: Nathaniel A. Shanok et al. — EEG Asymmetry Characteristics in Relation to Childhood Anxiety Subtypes: A Dimen...

### Citation
Nathaniel A. Shanok, N. Jones. EEG Asymmetry Characteristics in Relation to Childhood Anxiety Subtypes: A Dimensional Approach. Clinical EEG and Neuroscience. 2023. PMID: 36604820. DOI: 10.1177/15500594221150213.

### Methodology Decomposition

**Core Idea**: Introduction: Right frontal EEG asymmetry has been a commonly neurophysiological marker of anxiety and depressive symptoms throughout development. Method: In the current study, EEG asymmetry measures ...

**Reproducibility Notes**:
- Data availability: ❓ Unknown
- Code availability: To be verified
- Difficulty rating: ★★☆☆☆ (requires manual assessment)

**When to Reference This**:
- General reference for EEG Asymmetry Characteristics related queries
- Background knowledge for domain-specific questions

---

## EEGBCI-08: Dandi Ma et al. — Characteristics of ADHD Symptoms and EEG Theta/Beta Ratio in Children With Sleep...

### Citation
Dandi Ma, Yunxiao Wu, Changming Wang, Fujun Zhao, Zhifei Xu, Xin Ni. Characteristics of ADHD Symptoms and EEG Theta/Beta Ratio in Children With Sleep Disordered Breathing. Clinical EEG and Neuroscience. 2024. PMID: 38403954. DOI: 10.1177/15500594241234828.

### Methodology Decomposition

**Core Idea**: Objectives. This study aimed to explore parent-reported symptoms of attention deficit-hyperactivity disorder (ADHD) and sleep electroencephalogram (EEG) theta/beta ratio (TBR) characteristics in child...

**Reproducibility Notes**:
- Data availability: ❓ Unknown
- Code availability: To be verified
- Difficulty rating: ★★☆☆☆ (requires manual assessment)

**When to Reference This**:
- General reference for Characteristics of ADHD related queries
- Background knowledge for domain-specific questions

---

## EEGBCI-09: L. Marques et al. — Resting-state EEG as Biomarker of Maladaptive Motor Function and Depressive Prof...

### Citation
L. Marques, S. Barbosa, A. Gianlorenço, K. Pacheco-Barrios, Daniel R Souza, Denise Matheus, L. Battistella, M. Simis, Felipe Fregni. Resting-state EEG as Biomarker of Maladaptive Motor Function and Depressive Profile in Stroke Patients. Clinical EEG and Neuroscience. 2024. PMID: 38460956. DOI: 10.1177/15500594241234394.

### Methodology Decomposition

**Core Idea**: Abstract not available

**Reproducibility Notes**:
- Data availability: ❓ Unknown
- Code availability: To be verified
- Difficulty rating: ★★☆☆☆ (requires manual assessment)

**When to Reference This**:
- General reference for Resting-state EEG as related queries
- Background knowledge for domain-specific questions

---

## EEGBCI-10: S. Farhad et al. — Application of Hybrid DeepLearning Architectures for Identification of Individua...

### Citation
S. Farhad, S. Metin, Ç. Uyulan, Sahar Taghi Zadeh Makouei, B. Metin, T. Ergüzel, N. Tarhan. Application of Hybrid DeepLearning Architectures for Identification of Individuals with Obsessive Compulsive Disorder Based on EEG Data. Clinical EEG and Neuroscience. 2024. PMID: 38192213. DOI: 10.1177/15500594231222980.

### Methodology Decomposition

**Core Idea**: Objective: Obsessive-compulsive disorder (OCD) is a highly common psychiatric disorder. The symptoms of this condition overlap and co-occur with those of other psychiatric illnesses, making diagnosis ...

**Reproducibility Notes**:
- Data availability: ❓ Unknown
- Code availability: To be verified
- Difficulty rating: ★★☆☆☆ (requires manual assessment)

**When to Reference This**:
- General reference for Application of Hybrid related queries
- Background knowledge for domain-specific questions

