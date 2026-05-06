# Signal Processing Foundations for BME

## Reference Index

| ID | Method/Paper | Year | Domain | Authority Level |
|----|-------------|------|--------|----------------|
| SP-01 | Pan-Tompkins QRS Detection | 1985 | ECG Preprocessing | ★★★★★ Foundational |
| SP-02 | Hamilton QRS Detection | 1986 | ECG Preprocessing | ★★★★★ Foundational |
| SP-03 | ICA for EEG Artifact Removal (EEGLAB) | 2004 | EEG Preprocessing | ★★★★★ Foundational |
| SP-04 | Wavelet Denoising (Mallat) | 1989 | General Denoising | ★★★★★ Foundational |
| SP-05 | Empirical Mode Decomposition (Huang) | 1998 | Adaptive Decomposition | ★★★★ Authoritative |
| SP-06 | Adaptive Filtering (Widrow) | 1975 | Noise Cancellation | ★★★★★ Foundational |

---

## Signal Processing Pipeline Reference

### ECG Standard Pipeline

```
Raw ECG
  ↓
[1] Baseline Wander Removal
    → High-pass filter: cutoff 0.5Hz (Butterworth, order 2-4)
    → OR: Moving average subtraction
    → OR: Wavelet-based baseline estimation
  ↓
[2] Powerline Interference Removal
    → Notch filter: 50Hz (EU) or 60Hz (US), Q=30-60
    → OR: Adaptive LMS filter
    → OR: Spectrum interpolation
  ↓
[3] Bandpass Filtering
    → Passband: 0.5-40Hz (diagnostic quality)
    → Passband: 0.5-100Hz (research quality, preserves high-freq content)
    → Butterworth (maximally flat) or Chebyshev (sharper rolloff)
  ↓
[4] R-peak Detection
    → Pan-Tompkins (SP-01): Real-time, adaptive, 99.3% on MIT-BIH
    → Hamilton (SP-02): Modified Pan-Tompkins, improved search-back
    → gqrs (WFDB): Open-source, robust across sampling rates
    → NeuroKit2: Python implementation with multiple algorithms
  ↓
[5] Beat Segmentation
    → Fixed window: R-peak ± N samples (e.g., ±250ms)
    → Adaptive: P-onset to T-offset (requires delineation)
    → Heartbeat normalization: resample to fixed length
  ↓
[6] Feature Extraction (if not end-to-end DL)
    → Morphological: P/QRS/T duration, amplitude, intervals
    → Frequency: Power spectral density in bands
    → Wavelet: DWT coefficients at multiple scales
    → Entropy: Sample entropy, approximate entropy
    → HRV: Time-domain (SDNN, RMSSD), frequency-domain (LF/HF ratio)
  ↓
[7] Classification
    → Traditional: SVM / Random Forest / LDA on hand features
    → Deep Learning: 1D-CNN / ResNet / Transformer on raw/filtered signal
```

### EEG Standard Pipeline

```
Raw EEG
  ↓
[1] Re-referencing
    → Common average reference (CAR): subtract mean across all channels
    → Linked mastoid: average of A1+A2
    → Laplacian: local average subtraction (enhances local activity)
    → Choice depends on analysis goal and channel count
  ↓
[2] Bandpass Filtering
    → 0.5-50Hz (standard diagnostic)
    → 0.5-70Hz (high-frequency preservation)
    → Butterworth, order 4-6
  ↓
[3] Notch Filtering
    → 50Hz (EU) or 60Hz (US) for powerline
    → Harmonics at 100/120Hz if needed
  ↓
[4] Artifact Removal
    → ICA (Independent Component Analysis):
       - Extended Infomax (EEGLAB default)
       - Identify ocular (frontal, high amplitude) and muscle (high freq) components
       - Remove artifact components, reconstruct signal
    → ASR (Artifact Subspace Reconstruction): Real-time alternative
    → Regression: EOG/EMG channel regression (if available)
  ↓
[5] Epoch Extraction
    → Event-locked: -200ms to +800ms (ERP) or -1000ms to +3000ms (ERD/ERS)
    → Sleep: 30-second epochs (AASM standard)
    → Baseline correction: subtract pre-stimulus mean
  ↓
[6] Feature Extraction
    → Band power: Delta/Theta/Alpha/Beta/Gamma
    → CSP (Common Spatial Patterns): for motor imagery
    → Connectivity: Phase-locking value, coherence, granger causality
    → Microstates: Clustering of topographic maps
    → Deep features: Raw signal → CNN
  ↓
[7] Classification
    → Traditional: CSP + LDA/SVM (motor imagery)
    → Deep: EEGNet / ConvNet / Transformer
    → Sleep: U-Net / TCN
```

### PPG Standard Pipeline

```
Raw PPG
  ↓
[1] Bandpass Filtering
    → 0.5-8Hz (typical for pulse waveform)
    → OR: 0.5-5Hz (for heart rate estimation only)
  ↓
[2] Motion Artifact Removal
    → Adaptive filtering (accelerometer reference)
    → OR: Wavelet denoising
    → OR: Signal quality index (SQI) based rejection
  ↓
[3] Peak Detection
    → Systolic peaks: adaptive threshold on filtered signal
    → OR: Second derivative method
    → OR: Template matching
  ↓
[4] Feature Extraction
    → Pulse Transit Time (PTT): time between ECG R-peak and PPG foot
    → Pulse Wave Velocity (PWV): PTT / distance
    → Pulse Wave Analysis: augmentation index, reflection magnitude
    → Heart rate variability from peak-to-peak intervals
  ↓
[5] Application
    → Blood pressure estimation: PTT + calibration model
    → Heart rate: peak-to-peak intervals
    → Oxygen saturation: dual-wavelength PPG (SpO2)
    → Respiratory rate: PPG-derived respiration (PDR)
```

### ⚠️ PPG-Based Blood Pressure Estimation — 4 Critical Pitfalls

Based on Baker et al. 2024 systematic analysis, most PPG-BP papers contain one or more of these fatal flaws:

| Pitfall | Description | Detection | Prevalence |
|---------|-------------|-----------|------------|
| **Data Leakage** | Same patient's data in both train and test sets | Check if subject-wise splitting is used; record-wise is insufficient | ~40% of papers |
| **Overconstraining** | Removing "outliers" that are actually hypertensive/hypotensive readings | Check if data is filtered by BP range before evaluation; if so, task is artificially simplified | ~30% of papers |
| **Unreasonable Calibration** | Calibrating per-session using the same session's BP readings | Check calibration timing; if calibration uses same-session data, it's circular | ~25% of papers |
| **Short Calibration Horizon** | Only testing calibration within minutes/hours, not days | Check if calibration stability is tested over >24 hours | ~50% of papers |

**Rule**: If a PPG-BP paper uses record-wise (not subject-wise) splitting, flag: "🔴 Data leakage — same patient appears in train and test."
**Rule**: If a PPG-BP paper discards readings outside 90-180 mmHg SBP, flag: "⚠️ Overconstraining — model only works on normal BP range, not clinically useful."
**Rule**: If calibration uses same-session data, flag: "🔴 Circular calibration — model has access to the answer during calibration."
**Rule**: For PPG-BP papers, the minimum acceptable evaluation is: subject-wise split, no BP range filtering, calibration tested over >24 hours, report BHS/AAMI standards compliance.

---

## Signal Quality Assessment Framework

### ECG Signal Quality Index (SQI)

| Quality Level | Criteria | Action |
|---------------|----------|--------|
| **Excellent** | Clean baseline, sharp QRS, no artifacts | Use directly |
| **Good** | Minor noise, QRS detectable | Apply standard preprocessing |
| **Fair** | Moderate noise, some QRS missed | Aggressive preprocessing; flag uncertain segments |
| **Poor** | Severe noise, QRS undetectable | Discard or use specialized denoising |

### EEG Signal Quality Index

| Quality Level | Criteria | Action |
|---------------|----------|--------|
| **Excellent** | <5% artifact-contaminated epochs | Standard ICA pipeline |
| **Good** | 5-20% artifact epochs | ICA + epoch rejection |
| **Fair** | 20-50% artifact epochs | Aggressive ICA + interpolation of bad channels |
| **Poor** | >50% artifact epochs | Discard recording or use only clean segments |

---

## Frequency Band Reference

### ECG Frequency Content

| Component | Frequency Range | Clinical Significance |
|-----------|----------------|----------------------|
| Baseline wander | 0-0.5 Hz | Motion artifact, respiration |
| P wave | 0.5-10 Hz | Atrial depolarization |
| QRS complex | 5-30 Hz | Ventricular depolarization (dominant energy: 10-20Hz) |
| T wave | 1-10 Hz | Ventricular repolarization |
| Powerline | 50/60 Hz | Electrical interference |
| Muscle noise | 20-1000 Hz | Electromyogram contamination |

### EEG Frequency Bands

| Band | Frequency | Association | Clinical Relevance |
|------|-----------|-------------|-------------------|
| Delta | 0.5-4 Hz | Deep sleep, pathological slow waves | Focal lesions, encephalopathy |
| Theta | 4-8 Hz | Drowsiness, meditation, memory | Cognitive impairment marker |
| Alpha | 8-13 Hz | Relaxed wakefulness, eyes closed | Maturational marker, Berger effect |
| Beta | 13-30 Hz | Active thinking, concentration | Sedation monitoring, anxiety |
| Gamma | 30-100 Hz | Cognitive processing, binding | Feature binding, perception |
| Slow oscillation | 0.5-1 Hz | Sleep slow waves | Sleep depth marker |
| Spindles | 11-16 Hz | Sleep spindles | Sleep stage N2 marker |

## Biosignal Generation Evaluation Guide

When evaluating papers that generate synthetic biosignals (ECG, EEG, PPG):

| Metric | Applicable Signals | What It Measures | Limitations |
|--------|-------------------|-----------------|-------------|
| FID (Fréchet Inception Distance) | ❌ NOT for biosignals | Visual similarity | Designed for images; meaningless for 1D signals |
| PRD (Percent Root Difference) | ECG, PPG | Waveform fidelity | Does not capture morphology |
| RMSE | All signals | Point-wise error | Penalizes phase shifts |
| Spectral distance | All signals | Frequency distribution match | Does not capture temporal structure |
| Downstream task performance | All signals | "TSTR" — Train on Synthetic, Test on Real | Best practical metric; but indirect |
| Classifier-based distance | All signals | Discriminability real vs synthetic | Higher = more realistic, but no clinical guarantee |
| Clinical feature preservation | ECG, EEG | Are clinical markers preserved? | Requires domain-specific feature extraction |

**⚠️ Critical Rule**: FID/IS are IMAGE metrics. Do NOT use them for ECG/EEG/PPG generation papers. Flag if you see this.
**Recommended**: Use TSTR (Train on Synthetic, Test on Real) as primary metric + clinical feature preservation as secondary.
**For ECG**: Check if QRS morphology, PR interval, QT interval are preserved in synthetic signals.
**For EEG**: Check if spectral power distribution and event-related potentials are preserved.

---

## Wearable Device Signal Processing

Wearable biosignals (smartwatch PPG, patch ECG, ear-EEG, IMU) have fundamentally different challenges from clinical-grade signals:

| Challenge | Clinical-Grade | Wearable-Grade | Impact |
|-----------|---------------|----------------|--------|
| **Motion Artifact** | Minimal (supine/rest) | Severe (ambulatory) | Can overwhelm signal of interest |
| **Contact Quality** | Stable (gel electrodes) | Variable (dry contact, skin coupling) | Signal quality fluctuates |
| **Sampling Rate** | 250-1000 Hz | 50-250 Hz (power-constrained) | Loss of high-frequency content |
| **Channel Count** | 12-lead ECG, 32+ch EEG | 1-3 leads/channels | Reduced spatial information |
| **Duration** | Minutes (clinical recording) | Days-weeks (continuous) | Drift, battery, biofouling |
| **Ground Truth** | Expert annotation | Often unavailable | Validation is harder |

### Wearable ECG Preprocessing Pipeline

```
Wearable ECG (single-lead, 128-250 Hz)
  ↓
[1] Signal Quality Assessment
    → SQI (Signal Quality Index): kurtosis + relative power + baseline wander
    → Threshold: SQI > 0.5 → usable; SQI < 0.3 → discard
    → Critical: DO NOT process unusable segments — garbage in = garbage out
  ↓
[2] Motion Artifact Removal
    → Adaptive filtering with accelerometer reference (if available)
    → OR: Wavelet denoising (Daubechies-4, level 4-6)
    → OR: Deep learning denoising (if model available)
    → ⚠️ Simple bandpass filtering is INSUFFICIENT for motion artifacts
  ↓
[3] Baseline Wander Removal
    → High-pass filter: cutoff 0.5Hz (same as clinical)
    → OR: Morphological filtering (better for severe wander)
  ↓
[4] R-peak Detection (Robust)
    → gqrs / Hamilton (more robust than Pan-Tompkins for noisy signals)
    → OR: Deep learning R-peak detector (trained on noisy wearable data)
    → Post-processing: Physiological plausibility check (HR 30-220 bpm)
  ↓
[5] Beat Classification
    → Must handle: noise, motion artifact, poor contact
    → Confidence thresholding: reject low-confidence classifications
    → ⚠️ Wearable ECG classification MUST include a "reject/unclassifiable" option
```

### Wearable PPG Preprocessing Pipeline

```
Wearable PPG (wrist/finger, 25-100 Hz)
  ↓
[1] Signal Quality Assessment
    → SQI: template matching + skewness + signal-to-noise ratio
    → Threshold: SQI > 0.6 → usable
    → Motion detection: accelerometer magnitude > threshold → mark as motion-contaminated
  ↓
[2] Motion Artifact Removal
    → Adaptive LMS/RLS filtering with accelerometer reference
    → OR: TROIKE (Time-domain Reconstruction of Interference-corrupted Kinematic Events)
    → OR: Deep learning-based denoising
    → ⚠️ This is the HARDEST step — motion artifact is the #1 challenge for wearable PPG
  ↓
[3] Peak Detection
    → Adaptive threshold with hysteresis
    → OR: Deep learning peak detector
    → Post-processing: physiological plausibility (IBI 300-1500ms)
  ↓
[4] Application-Specific Processing
    → HR estimation: IBI averaging, median filtering
    → HRV: Same as clinical, but with more artifact handling
    → BP estimation: See PPG-BP pitfalls section above
    → SpO2: Dual-wavelength processing; requires calibration per device
```

**Rule**: Wearable signal processing papers MUST report the proportion of data discarded due to poor signal quality. If >50% is discarded, the system is not practical.
**Rule**: "Accuracy on clean segments only" is a BIASED evaluation. Must report accuracy on ALL data including rejected segments.

## Deep Learning-Based Artifact Removal

Traditional ICA/filtering is being supplemented by deep learning approaches:

| Method | Signal | Architecture | Training Data | Pros | Cons |
|--------|--------|-------------|--------------|------|------|
| **IC-U-Net** | EEG | U-Net | Clean + artificially contaminated | Fast; handles non-stationary artifacts | Needs paired clean/noisy data |
| **EEGDenoseNet** | EEG | CNN+Attention | Synthetic artifacts | End-to-end; no manual ICA | May remove neural signal |
| **Deep Filtering** | ECG | 1D-ResNet | Noisy + clean pairs | Real-time capable | Domain-specific training needed |
| **FCN-Denoiser** | PPG | FCN | Motion-contaminated + clean | Handles severe motion | Limited to specific motion types |

**DL Artifact Removal Assessment**:

| Assessment | Method | Required Output |
|-----------|--------|----------------|
| **Signal Preservation** | Correlation with clean reference | r > 0.95 for preserved segments |
| **Artifact Removal** | Reduction in artifact power | >20dB artifact suppression |
| **Downstream Impact** | Task performance before/after denoising | Improvement on downstream task |
| **Neural Signal Loss** | ERP/spectral feature comparison | No significant loss of neural features |
| **Generalization** | Cross-subject/cross-session test | Performance maintained on unseen subjects |

**Rule**: DL artifact removal that has NOT been validated on downstream task performance is INCOMPLETE. Clean signal ≠ useful signal.
**Rule**: DL denoising trained on synthetic artifacts may not generalize to real artifacts. Must test on real contaminated data.

## Multimodal Signal Fusion Pipeline

When combining multiple biosignals (ECG+PPG, ECG+ACC, EEG+fNIRS, etc.):

| Fusion Level | Description | Example | Pros | Cons |
|-------------|------------|---------|------|------|
| **Signal-level** | Concatenate raw signals | ECG+PPG → joint model | Maximum information | Requires temporal alignment |
| **Feature-level** | Concatenate extracted features | HRV features + PPG features | Interpretable | Information loss from feature extraction |
| **Decision-level** | Combine model outputs | ECG model + PPG model → ensemble | Handles missing modalities | No cross-modal interaction |
| **Attention-level** | Cross-attention between modalities | ECG attends to PPG context | Learns modality interactions | Complex; data-hungry |

### ECG + PPG Fusion for Blood Pressure

```
ECG (R-peaks) + PPG (systolic peaks)
  ↓
[1] Temporal Alignment
    → Align R-peaks with PPG systolic peaks
    → Compute Pulse Transit Time (PTT) = t_PPG_peak - t_ECG_Rpeak
    → Compute Pulse Arrival Time (PAT) = t_PPG_foot - t_ECG_Rpeak
    → ⚠️ PTT ≠ PAT; PAT includes pre-ejection period; PTT does not
  ↓
[2] Feature Extraction
    → PTT / PAT (primary feature for BP)
    → PPG waveform features (augmentation index, reflection magnitude)
    → ECG features (QRS duration, T-wave morphology)
    → HRV features (SDNN, RMSSD, LF/HF)
  ↓
[3] BP Estimation Model
    → Calibration: Individual calibration required (at least 1 BP measurement)
    → Model: XGBoost / LSTM / Neural Network
    → ⚠️ See PPG-BP pitfalls above for critical evaluation criteria
  ↓
[4] Validation
    → Subject-wise split (MANDATORY)
    → Report: MAE, BHS/AAMI standard compliance
    → Calibration horizon: >24 hours
```

### EEG + fNIRS Fusion for BCI

```
EEG (high temporal) + fNIRS (high spatial)
  ↓
[1] Temporal Alignment
    → EEG: millisecond resolution
    → fNIRS: ~1-10 second hemodynamic response
    → Align to event onset; account for hemodynamic delay (~5-7s)
  ↓
[2] Feature Extraction
    → EEG: Band power, CSP, connectivity
    → fNIRS: HbO/HbR concentration changes, spatial patterns
  ↓
[3] Fusion Strategy
    → Feature-level: Concatenate EEG + fNIRS features
    → Decision-level: Separate classifiers + ensemble
    → Attention-level: EEG features attend to fNIRS spatial map
  ↓
[4] Validation
    → Must show improvement over EEG-only (fNIRS-only is typically worse)
    → ⚠️ If EEG+fNIRS ≈ EEG-only, fNIRS adds no value
```

**Rule**: Multimodal fusion MUST demonstrate improvement over the BEST single modality. If fusion does not improve, the additional modality is not justified.
**Rule**: Missing modality handling is CRITICAL for wearable multimodal systems. If one sensor fails, the system must degrade gracefully.
**Rule**: Temporal alignment between modalities must account for physiological delays (e.g., hemodynamic response ~5-7s for fNIRS, pulse transit ~200ms for PPG).

---

## Cuffless Blood Pressure Estimation — Deep Dive

### Methodology Overview

Cuffless BP estimation from PPG/ECG is one of the most commercially significant but scientifically challenging wearable applications.

### Feature-Based (Calibration-Dependent) Methods

| Feature | Formula | Correlation with BP | Limitation |
|---------|---------|-------------------|-----------|
| **Pulse Transit Time (PTT)** | Time from ECG R-peak to PPG foot | r ≈ -0.7 to -0.8 with SBP | Requires ECG + PPG; calibration drift |
| **Pulse Arrival Time (PAT)** | Time from ECG R-peak to PPG peak | r ≈ -0.5 to -0.7 with SBP | Includes pre-ejection period; less accurate than PTT |
| **Pulse Wave Velocity (PWV)** | Distance / PTT | r ≈ -0.7 to -0.8 with SBP | Requires distance measurement; calibration needed |
| **PPG Intensity Ratio** | Ratio of systolic/diastolic amplitude | Moderate correlation | Sensitive to sensor pressure, skin tone |
| **PPG Derivative Features** | dPPG/dt ratios, augmentation index | Moderate correlation | Noisy; requires high-quality PPG |

### Deep Learning Methods for BP Estimation

| Approach | Input | Architecture | MAE (SBP/DBP) | Key Limitation |
|----------|-------|-------------|---------------|----------------|
| **Raw PPG → BP** | PPG waveform | 1D-CNN / ResNet | 5-8 / 3-5 mmHg | Calibration still needed; generalization poor |
| **ECG + PPG → BP** | ECG + PPG | Dual-stream CNN | 4-7 / 3-4 mmHg | Requires both sensors; calibration |
| **PPG + calibration** | PPG + occasional cuff | CNN + personalization | 3-5 / 2-3 mmHg | Periodic recalibration needed |
| **Transfer learning** | PPG from target user | Pretrained + fine-tune | 4-6 / 3-4 mmHg | Needs per-user calibration data |

### ⚠️ Critical Pitfalls in BP Estimation Research

| Pitfall | Description | Impact | Detection |
|---------|-------------|--------|-----------|
| **Calibration hiding** | Paper reports "calibration-free" but uses per-subject normalization | Inflated performance | Check if test set includes unseen subjects |
| **Subject-dependent split** | Train and test contain data from same subjects | Massive overestimation | Must use leave-subject-out validation |
| **Motion artifact exclusion** | Remove all motion-corrupted segments before evaluation | Unrealistic performance | Report performance on ALL data including motion |
| **Narrow BP range** | Test only on normotensive subjects | Cannot assess clinical utility | Must include hypertensive and hypotensive subjects |
| **Missing AAMI/BHS standards** | Not reporting against standard protocols | Cannot compare to clinical devices | Must report AAMI SP10 and BHS criteria |

**AAMI SP10 Criteria for BP Devices**:
| Criterion | Requirement |
|-----------|------------|
| Mean error | ≤5 mmHg |
| SD of error | ≤8 mmHg |
| Minimum subjects | 85 |

**BHS Criteria**:
| Grade | ≤5 mmHg | ≤10 mmHg | ≤15 mmHg |
|-------|---------|----------|----------|
| **A** | ≥60% | ≥85% | ≥95% |
| **B** | ≥50% | ≥75% | ≥90% |
| **C** | ≥40% | ≥65% | ≥85% |

**Rule**: BP estimation papers that do NOT use leave-subject-out validation are NOT clinically meaningful. Same-subject data leakage inflates performance by 30-50%.
**Rule**: "Calibration-free" BP estimation from PPG alone does NOT meet AAMI/BHS standards as of 2025. Periodic cuff calibration is still required.

---

## Advanced Artifact Removal Techniques

### ICA Deep Dive for EEG

```
Raw EEG (contaminated)
  ↓
[1] Run ICA decomposition
    → FastICA: faster; good for large datasets
    → Infomax (EEGLAB default): more stable; recommended
    → Extended Infomax: separates sub- and super-Gaussian sources
    → → Recommended: Extended Infomax for clinical EEG
  ↓
[2] Component Classification
    → Manual: Visual inspection of topo, spectrum, time course
    → ICLabel (EEGLAB plugin): automated; 95%+ accuracy
    → MARA: automated; robust across datasets
    → → Recommended: ICLabel for efficiency; manual review for clinical
  ↓
[3] Artifact Component Identification
    → Eye blink: frontal topography; low frequency; large amplitude
    → Eye movement: frontal; lateralized; low frequency
    → Muscle (EMG): high frequency (>30Hz); diffuse topography
    → Line noise: 50/60Hz narrow band; uniform topography
    → Cardiac (ECG): periodic; temporal correlation with ECG channel
  ↓
[4] Removal & Reconstruction
    → Zero artifact components; reconstruct signal
    → ⚠️ Removing >30% of components → overcleaning; signal distortion
    → ⚠️ Removing components with brain activity → loss of neural information
  ↓
[5] Validation
    → Compare power spectra before/after (should preserve neural bands)
    → Visual inspection of cleaned signal
    → ⚠️ If alpha/beta power decreases >20% after ICA → overcleaning
```

**Rule**: ICA requires at least 2x the number of time points as channels for stable decomposition. For 64-channel EEG: minimum 128 time points per segment.
**Rule**: ICA component classification is NOT perfect. Always review automated labels before removal, especially for clinical applications.

### Adaptive Filtering for Real-Time Applications

| Method | Use Case | Latency | Complexity | Quality |
|--------|---------|---------|-----------|---------|
| **LMS adaptive filter** | Real-time noise cancellation | <1ms | Low | Moderate |
| **RLS adaptive filter** | Faster convergence than LMS | <5ms | Medium | Good |
| **Kalman filter** | State estimation + noise | <1ms | Medium | Good |
| **Wavelet denoising** | Offline or batch processing | Variable | Medium | Good |
| **Deep learning denoising** | Most effective but needs GPU | 10-100ms | High | Best |

**Rule**: For real-time BCI or wearable applications, LMS or Kalman filters are preferred due to low latency. Deep learning denoising adds too much latency for closed-loop systems.

---

## Respiration & Multi-Modal Physiological Signal Processing

### Respiration Signal Extraction

| Source | Method | Accuracy | Comfort | Key Use |
|--------|--------|---------|---------|---------|
| **Respiratory belt** | Direct measurement | High | Low | Clinical polysomnography |
| **ECG-derived respiration (EDR)** | R-peak amplitude modulation | Moderate | High | Wearable monitoring |
| **PPG-derived respiration** | Baseline wander; amplitude modulation | Moderate | High | Wearable monitoring |
| **Impedance pneumography** | Thoracic impedance | High | Medium | ICU monitoring |
| **Acoustic (tracheal)** | Breath sounds | High | Low | Sleep studies |

### ECG-Derived Respiration (EDR) Pipeline

```
ECG Signal
  ↓
[1] R-peak Detection
    → Pan-Tompkins or Hamilton
  ↓
[2] R-Peak Amplitude Extraction
    → Amplitude of each R-peak relative to baseline
    → OR: Area under QRS complex
  ↓
[3] Respiration Signal Construction
    → Interpolate R-peak amplitudes → continuous signal
    → Bandpass filter: 0.1-0.5 Hz (respiratory frequency)
  ↓
[4] Respiratory Rate Estimation
    → Peak counting in respiration signal
    → OR: FFT dominant frequency × 60
    → OR: Autoregressive modeling
  ↓
[5] Validation
    → Compare against respiratory belt (if available)
    → ⚠️ EDR accuracy decreases during motion and arrhythmias
```

### Heart Rate Variability (HRV) Analysis

| Domain | Metric | Formula / Method | Clinical Significance |
|--------|--------|-----------------|---------------------|
| **Time** | SDNN | Std of NN intervals | Overall autonomic tone |
| **Time** | RMSSD | Root mean square of successive differences | Parasympathetic activity |
| **Time** | pNN50 | % of successive intervals >50ms different | Parasympathetic activity |
| **Frequency** | LF power | 0.04-0.15 Hz | Mixed sympathetic + parasympathetic |
| **Frequency** | HF power | 0.15-0.40 Hz | Parasympathetic activity |
| **Frequency** | LF/HF ratio | LF / HF | Sympathovagal balance (controversial) |
| **Nonlinear** | SD1/SD2 (Poincaré) | Short/long-term variability | Autonomic balance |
| **Nonlinear** | Sample entropy | Regularity of RR series | Complexity; reduced in disease |
| **Nonlinear** | DFA α1 | Detrended fluctuation | Fractal correlation properties |

**HRV Recording Requirements**:
| Duration | Recommended For | Minimum |
|----------|----------------|---------|
| **5 minutes** | Frequency domain analysis | Standard short-term |
| **24 hours** | Time domain; circadian patterns | Clinical standard |
| **≥5 minutes** | SDNN, RMSSD, frequency | Minimum for frequency domain |

**Rule**: LF/HF ratio as "sympathovagal balance" is CONTROVERSIAL. Many experts consider it an oversimplification. Report individual LF and HF powers alongside the ratio.
**Rule**: HRV from wearable PPG is LESS accurate than ECG-based HRV. PPG-derived inter-beat intervals have 5-20ms jitter vs <2ms for ECG.

---

## Audio & Auscultation Signal Processing

### Lung & Heart Sound Analysis

| Sound Type | Frequency Range | Clinical Significance | Key Feature | AI Approach |
|-----------|----------------|----------------------|-------------|-------------|
| **Normal breath sounds** | 100-1000 Hz | Baseline vesicular breathing | Expiration < Inspiration | Classification |
| **Crackles (rales)** | 100-2000 Hz | Heart failure, pneumonia, fibrosis | Discontinuous; explosive onset | CNN on spectrogram |
| **Wheezes** | 400-1600 Hz | Asthma, COPD, bronchospasm | Continuous; musical pitch | Spectral peak tracking |
| **Rhonchi** | 150-750 Hz | Secretions; bronchitis | Low-pitched; snoring quality | Spectral + temporal |
| **Pleural rub** | 100-600 Hz | Pleuritis; pleural effusion | Grating; inspiratory | Classification |
| **Heart murmurs** | 50-600 Hz | Valve disease; septal defects | Systolic or diastolic timing | Phono + timing analysis |
| **S3 gallop** | 20-70 Hz | Heart failure | Low frequency; diastolic | Spectral filtering |

### Auscultation AI Pipeline

```
Raw Auscultation Recording
  ↓
[1] Preprocessing
    → Bandpass filter: 20-2000 Hz (lung); 20-600 Hz (heart)
    → Noise reduction: spectral gating; Wiener filter
    → Segmentation: detect respiratory cycles (inspiration/expiration)
    → ⚠️ Ambient noise is the #1 quality issue in auscultation recordings
  ↓
[2] Feature Extraction
    → Spectral: MFCC, spectral centroid, spectral rolloff
    → Temporal: zero-crossing rate, envelope features
    → Time-frequency: mel-spectrogram, wavelet scalogram
    → ⚠️ MFCC from speech recognition need adaptation for medical audio
  ↓
[3] Classification
    → CNN on mel-spectrogram (most common; good performance)
    → CRNN (CNN + RNN) for temporal patterns
    → Audio transformer (AST) for state-of-the-art
    → ⚠️ Most auscultation AI models are trained on <10K recordings — limited generalization
  ↓
[4] Validation
    → Cross-validation with patient-wise splitting
    → External validation on different stethoscope models
    → ⚠️ Stethoscope model affects recording quality — validate across devices
```

**Rule**: Auscultation AI must be validated across DIFFERENT stethoscope models. Electronic stethoscopes have different frequency responses, and models trained on one device may not generalize.
**Rule**: ICBHI (International Conference on Biomedical and Health Informatics) challenge datasets are the standard benchmark for lung sound classification. Report ICBHI-specific metrics (sensitivity, specificity, score).

### Voice & Speech Biomarkers

| Biomarker | Clinical Application | Key Feature | Status |
|-----------|---------------------|-------------|--------|
| **Parkinson's voice** | PD screening & monitoring | Vocal tremor; reduced variation | FDA-cleared (voice biomarker) |
| **Depression voice** | Mental health screening | Reduced prosody; flat affect | Research |
| **Cognitive decline** | MCI/Alzheimer's screening | Speech pauses; word finding difficulty | Research |
| **COVID-19 cough** | COVID screening | Cough sound spectral features | Research (mixed results) |
| **Heart failure voice** | HF decompensation detection | Vocal cord edema → pitch changes | Emerging |

**Rule**: Voice biomarkers are CORRELATIONAL. Voice changes can have many causes — they are screening tools, not diagnostic tests.
**Rule**: COVID-19 cough detection from audio has NOT been reliably validated. Early studies showed promise but failed to generalize across populations and recording conditions.

---

## Ultrasound RF Signal Processing

### Ultrasound Signal Pipeline

```
Raw RF Data from Ultrasound Transducer
  ↓
[1] Beamforming
    → Delay-and-sum (DAS): standard; fast
    → Minimum variance: better resolution; slower
    → Coherent plane-wave compounding: ultrafast imaging
    → ⚠️ Beamforming method significantly affects image quality
  ↓
[2] Signal Processing
    → TGC (Time Gain Compensation): compensate for depth attenuation
    → Envelope detection: Hilbert transform → magnitude
    → Log compression: compress dynamic range for display
    → ⚠️ These steps are often done by the scanner; raw RF access needed for research
  ↓
[3] B-Mode Image Formation
    → Scan conversion (for sector/curvilinear probes)
    → Post-processing: smoothing; edge enhancement
    → ⚠️ B-mode images are HEAVILY processed — not suitable for quantitative analysis
  ↓
[4] Advanced Processing
    → Elastography: strain imaging; shear wave speed
    → Doppler: blood flow velocity estimation
    → Contrast-enhanced: microbubble detection
    → Photoacoustic: optical absorption mapping
```

### Ultrasound AI Considerations

| Challenge | Description | Solution |
|-----------|------------|---------|
| **Operator dependence** | Image quality varies with operator skill | Standardized acquisition protocols; AI guidance |
| **Low SNR** | Ultrasound has inherent speckle noise | Speckle reduction; noise-robust architectures |
| **Limited FOV** | Single frame has limited anatomical context | Multi-frame analysis; panoramic imaging |
| **Probe variation** | Different probes have different characteristics | Probe-specific training; domain adaptation |
| **Real-time requirement** | Clinical use needs real-time inference | Model compression; efficient architectures |

**Rule**: Ultrasound AI models must be validated across OPERATORS and PROBES, not just across patients. Operator dependence is the primary source of variability in ultrasound.
**Rule**: B-mode images are post-processed and lossy. For quantitative ultrasound research, use RF data or at minimum IQ (in-phase/quadrature) data.

---

## Time-Series Foundation Models for Physiological Signals

### Foundation Model Landscape for Biosignals

| Model | Input | Pretraining Data | Architecture | Best For | Status |
|-------|-------|-----------------|-------------|---------|--------|
| **PatchTST** | Univariate/multivariate | Generic time series | Patch-based Transformer | Long-term forecasting | Open |
| **Chronos** | Univariate | Large-scale TS corpus | Language model on tokens | Zero-shot forecasting | Open (Amazon) |
| **TimesFM** | Univariate | Google-scale TS | Decoder-only Transformer | Zero-shot forecasting | API |
| **MOMENT** | Multivariate | Diverse TS datasets | Encoder-only Transformer | Classification; forecasting; anomaly | Open |
| **Lag-Llama** | Univariate | Diverse TS | Llama-style decoder | Probabilistic forecasting | Open |
| **BioSig-PT** | ECG/PPG/EEG | PhysioNet + MIMIC | Custom Transformer | Physiological signal tasks | Research |
| **MERL** | ECG | Large ECG corpus | ResNet + Transformer | ECG representation | Research |

### Biosignal Foundation Model Evaluation

```
Biosignal Foundation Model
  ↓
[1] Zero-Shot Evaluation
    → Can the model classify unseen ECG conditions without fine-tuning?
    → ⚠️ Zero-shot on biosignals is MUCH harder than NLP — no natural language interface
  ↓
[2] Linear Probing
    → Freeze backbone; train linear classifier on frozen features
    → Compare to training from scratch
    → ⚠️ Foundation model features should outperform random initialization
  ↓
[3] Few-Shot Fine-tuning
    → Fine-tune with 1%, 5%, 10% of target data
    → Report learning curve
    → ⚠️ This is where foundation models provide the most value
  ↓
[4] Cross-Dataset Transfer
    → Pretrain on dataset A; evaluate on dataset B
    → ECG: train on PTB-XL → test on CODE-15%
    → ⚠️ Cross-dataset transfer is the real test of generalization
  ↓
[5] Cross-Modality Transfer
    → Pretrain on ECG → evaluate on PPG or EEG
    → ⚠️ Cross-modality transfer for biosignals is LARGELY UNSOLVED
```

**Rule**: Biosignal foundation models are at an EARLY stage compared to NLP/Vision. Do NOT assume they will work as well as LLMs for text. Evaluate carefully on your specific task.
**Rule**: The most valuable property of a biosignal foundation model is FEW-SHOT performance — the ability to learn from very few labeled examples. This is critical for rare conditions.

---

## Wearable Algorithm Deployment

### From Research to Wearable Deployment

```
Research Model (PyTorch, GPU)
  ↓
[1] Model Optimization
    → Pruning: remove redundant weights (2-4x compression)
    → Quantization: FP32 → INT8 (4x compression; <1% accuracy loss)
    → Knowledge distillation: large → small model
    → ⚠️ Quantization can disproportionately affect minority class performance
  ↓
[2] On-Device Constraints
    → Memory: typically <2MB model size for wearable
    → Latency: <100ms inference for real-time applications
    → Power: <10mW sustained for battery life
    → ⚠️ These constraints are MUCH tighter than mobile deployment
  ↓
[3] Inference Framework
    → TensorFlow Lite Micro: most mature; good for Cortex-M
    → ONNX Runtime: cross-platform; growing support
    → CMSIS-NN: ARM-optimized; fastest on Cortex-M
    → Edge TPU: Google; for Pixel Watch type devices
    → ⚠️ Not all operations are supported on all frameworks
  ↓
[4] Signal Processing on Device
    → Fixed-point arithmetic: avoid floating point on low-power MCUs
    → Circular buffer: for streaming signal processing
    → Efficient FFT: ARM CMSIS-DSP library
    → ⚠️ Preprocessing (filtering, feature extraction) must also run on-device
  ↓
[5] Adaptive Power Management
    → Duty cycling: process every Nth sample
    → Event-driven: wake on detected activity
    → Multi-tier: lightweight always-on → heavy model on event
    → ⚠️ Always-on ECG monitoring at full model complexity is NOT feasible on current wearables
```

### Wearable Deployment Checklist

| Aspect | Requirement | Typical Constraint | Solution |
|--------|------------|-------------------|---------|
| **Model size** | <2MB | Flash memory | INT8 quantization; efficient architecture |
| **RAM usage** | <256KB | SRAM | Streaming inference; no full signal buffer |
| **Inference time** | <100ms | Real-time requirement | Optimized ops; CMSIS-NN |
| **Power budget** | <10mW sustained | Battery life | Duty cycling; event-driven |
| **Latency** | <1s end-to-end | User experience | On-device inference (no cloud round-trip) |
| **Robustness** | Motion artifact tolerance | Wearable context | Motion-aware preprocessing; confidence gating |
| **Calibration** | User-specific calibration | Wearable BP, SpO2 | Periodic recalibration protocol |
| **Regulatory** | SaMD classification | FDA/CE mark | Same regulatory pathway as non-wearable AI |

**Rule**: Wearable AI deployment requires a MULTI-TIER architecture: lightweight always-on detector → triggers heavier model → may trigger cloud analysis. Single-tier deployment is insufficient for power-constrained devices.
**Rule**: Motion artifact is the DOMINANT failure mode for wearable biosignal AI. Any wearable algorithm must be validated during ACTIVITY (walking, running), not just at rest.
**Rule**: Wearable blood pressure estimation requires PERIODIC CALIBRATION with a cuff. No cuffless method is calibration-free. Calibration frequency depends on the method (hours to weeks).

### Wearable AI — Clinical Evidence Update (2025-2026)

**SleepFM — Sleep-Based Disease Risk Prediction** (Stanford Medicine, 2026):
- AI model using ONE NIGHT of polysomnography to predict risk of 100+ health conditions
- Trained on ~600,000 hours of sleep data from 65,000 participants
- Input: brain activity, heart activity, respiratory patterns from PSG
- Innovation level: L3 (novel modality for disease risk screening)
- Clinical readiness: V1-V2 (needs external validation)
- Key insight: sleep physiology captures systemic health signals invisible to single-modality awake measurements

**Smartwatch Heart Failure Monitoring** (Nature Medicine 2026):
- 217 heart failure patients tracked with smartwatch
- Key finding: when estimated pVO₂ decreased by 10%, emergency visit risk increased 3.62×
- Warning signal appeared ~7 DAYS before the event
- Innovation level: L3 (wearable-based early warning for heart failure decompensation)
- Clinical readiness: V2 (prospective single-arm)

**Wearable AI Clinical Evidence Ladder**:

| Application | Evidence Level | Key Study | Clinical Impact |
|-------------|---------------|-----------|----------------|
| AF detection | V2 (prospective, single-arm) | Apple Heart Study | Screening tool |
| Heart failure monitoring | V2 (prospective) | Nature Medicine 2026 | Early warning (7-day lead) |
| Sleep-based disease risk | V1-V2 | SleepFM (Stanford 2026) | Screening (needs validation) |
| Blood pressure estimation | V1 (internal) | Multiple studies | Requires calibration |
| Glucose monitoring | V2-V3 (some FDA cleared) | Dexcom, Abbott | Clinical standard (CGM) |

**Rule**: Wearable AI for heart failure monitoring has a 7-DAY LEAD TIME before clinical events. This is clinically actionable — but requires V3+ (prospective interventional) validation before deployment.
**Rule**: SleepFM demonstrates that sleep physiology is an UNDERUTILIZED modality for disease screening. However, PSG is not as accessible as single-lead ECG or PPG — clinical utility depends on scalability.

---

## Rehabilitation AI & Neurorehabilitation

### Rehabilitation AI Task Landscape

| Task | Input Modality | Output | Key Method | Clinical Readiness | Key Dataset |
|------|---------------|--------|-----------|-------------------|------------|
| **Motor recovery prediction** | Clinical scores + neuroimaging | Recovery trajectory | Regression; survival analysis | Emerging | CRIS; custom stroke cohorts |
| **Gait analysis** | IMU; camera; pressure mat | Gait parameters; pathology | Time-series DL; pose estimation | Research | CASIA; OU-ISIR; custom clinical |
| **Movement quality assessment** | IMU; RGB-D video | Exercise form score | Pose estimation + rule-based | Emerging | Custom rehab datasets |
| **Prosthetic control** | EMG; EEG | Prosthetic movement intent | Classification; regression | Emerging (myoelectric) | NinaPro; CAPGMyo |
| **Exoskeleton assistance** | IMU; EMG; force sensors | Assistance level & timing | RL; adaptive control | Research | Custom lab datasets |
| **Stroke rehabilitation monitoring** | Wearable IMU; game scores | Adherence; improvement | Time-series; classification | Emerging | Custom rehab trials |
| **Speech rehabilitation** | Audio recordings | Articulation quality | Speech processing; DL | Research | Custom speech therapy |
| **Cognitive rehab** | Digital cognitive tests | Cognitive trajectory | Sequential modeling | Research | Custom cognitive datasets |

### Stroke Motor Recovery Prediction

```
Stroke Patient (admission)
  ↓
[1] Baseline Assessment
    → NIHSS score: neurological deficit severity
    → Lesion location: cortical vs subcortical vs brainstem (MRI)
    → Lesion volume: volumetric segmentation
    → Motor impairment: Fugl-Meyer Assessment (FMA)
    → ⚠️ NIHSS at admission is the STRONGEST single predictor of motor recovery
    → ⚠️ Lesion LOCATION matters more than lesion SIZE for motor outcomes
  ↓
[2] Neuroimaging Biomarkers
    → Corticospinal tract integrity: DTI (fractional anisotropy)
    → Motor cortex activation: fMRI (affected vs unaffected hemisphere)
    → Structural connectivity: tractography between M1 and spinal cord
    → ⚠️ DTI biomarkers (FA ratio) are the BEST imaging predictors of hand motor recovery
    → ⚠️ fMRI is LESS reliable in acute stroke (hemodynamic changes confound activation)
  ↓
[3] Prediction Model
    → Input: NIHSS + FMA + lesion features + DTI metrics + age + time since stroke
    → Output: FMA at 3 months / 6 months / 12 months
    → Methods: proportional recovery model; random forest; neural network
    → ⚠️ Proportional recovery rule: ~70% of patients recover ~70% of lost function
    → ⚠️ The remaining 30% are "non-recoverers" — identifying them EARLY is the clinical goal
  ↓
[4] Clinical Decision Support
    → Predicted good recovery → standard rehab; home exercises
    → Predicted poor recovery → intensive rehab; novel interventions (TMS, BCI)
    → ⚠️ Self-fulfilling prophecy risk: predicting poor recovery → less therapy → poor recovery
    → ⚠️ Prediction should GUIDE resource allocation, not LIMIT therapy
```

### Prosthetic Control — EMG-Based

| Approach | EMG Type | Classes | Accuracy | Latency | Clinical Status |
|----------|---------|---------|----------|---------|----------------|
| **Pattern recognition** | Surface EMG (sEMG) | 6-12 movements | 90-97% (lab) | 100-300ms | Commercial (COAPT) |
| **Regression control** | sEMG | Continuous DOF | R² = 0.7-0.9 | 50-150ms | Research |
| **Deep learning (CNN/LSTM)** | sEMG | 8-20 movements | 95-99% (lab) | 100-500ms | Research |
| **Ultrasound-based** | Ultrasound imaging | 10-15 movements | 95-99% | 200-500ms | Early research |
| **Implantable EMG (TMR)** | Intramuscular | 10-20 movements | 95-99% | 50-100ms | Emerging (surgery required) |
| **EEG-based (BCI)** | EEG | 2-4 movements | 70-85% | 500-2000ms | Research |

```
EMG Signal → Prosthetic Control Pipeline
  ↓
[1] Signal Acquisition
    → Surface EMG: 4-16 channels; 1000-2000 Hz sampling
    → Electrode placement: targeted muscle reinnervation (TMR) or standard
    → ⚠️ Electrode shift between sessions → catastrophic accuracy drop
  ↓
[2] Feature Extraction (sliding window: 150-250ms)
    → Time-domain: MAV, WL, ZC, SSC, VAR
    → Frequency-domain: AR coefficients, power spectrum
    → Time-frequency: wavelet coefficients
    → Deep: raw EMG → CNN/LSTM (end-to-end)
    → ⚠️ Window length: shorter = lower latency but less accuracy; 200ms is typical
  ↓
[3] Classification / Regression
    → LDA: fast; robust; commercial standard
    → SVM: higher accuracy; slower
    → CNN: highest accuracy; most compute
    → ⚠️ LDA is STILL the clinical standard — deep learning hasn't convincingly beaten it in REAL-WORLD conditions
  ↓
[4] Post-Processing
    → Majority vote: smooth predictions over 3-5 windows
    → Velocity ramp: gradual movement onset/offset
    → Rejection: low-confidence predictions → no movement (safety)
    → ⚠️ Without rejection, the prosthesis makes CONSTANT small unwanted movements
  ↓
[5] Real-Time Constraints
    → Decision latency: <300ms (from EMG to movement)
    → Update rate: 20-50 Hz (continuous control feel)
    → ⚠️ >300ms latency → user perceives delay → abandons prosthesis
```

### Exoskeleton AI — Adaptive Assistance

| Application | Target Population | Control Strategy | AI Role | Status |
|------------|------------------|-----------------|---------|--------|
| **Gait rehabilitation** | Stroke; SCI | Adaptive impedance control | Intent detection; gait phase classification | Research |
| **Upper limb rehab** | Stroke | Assist-as-needed | Effort estimation; difficulty adaptation | Research |
| **Overground walking** | Paraplegia | Predefined trajectory + balance | Balance prediction; terrain adaptation | Emerging (Ekso, ReWalk) |
| **Ankle-foot orthosis** | Drop foot; CP | Triggered assistance | Gait event detection (heel strike/toe off) | Emerging |
| **Hand rehabilitation** | Stroke; CP | EMG-triggered assistance | Grasp intent detection | Research |

**Rule**: Prosthetic control in the LAB (clean EMG, fixed electrodes, able-bodied subjects) is fundamentally different from REAL-WORLD use (sweat, electrode shift, fatigue, varying loads). Always evaluate in amputee populations with DONNING/DOFFING.
**Rule**: The proportional recovery model is a STATISTICAL AVERAGE, not a patient-level prediction. Using it to deny therapy is a misuse of the model.
**Rule**: Exoskeleton "assist-as-needed" is the gold standard for rehabilitation AI. Full assistance prevents motor learning; no assistance prevents practice. The AI must detect the SWEET SPOT.
**Rule**: EMG-based prosthetic control accuracy drops 10-30% from lab to daily life. Report real-world accuracy, not lab accuracy.

## Advanced PPG & Multi-Parameter Estimation

### PPG Signal — Beyond SpO2 and Heart Rate

| Parameter | PPG Feature | Extraction Method | Accuracy (vs Reference) | Clinical Value | Key Challenge |
|-----------|------------|-------------------|------------------------|---------------|---------------|
| **Heart rate** | Peak-to-peak interval | Peak detection; spectral | MAE <2 bpm | High | Motion artifact |
| **SpO2** | Red/IR ratio | Ratio-of-ratios; calibration | ±2% (manufacturer claim) | Very High | Skin pigmentation bias; low perfusion |
| **Respiratory rate** | Baseline wander; amplitude modulation | Bandpass; spectral; demodulation | MAE 1-3 breaths/min | High | Low SNR; motion artifact |
| **Blood pressure (cuffless)** | Pulse transit time (PTT); pulse arrival time (PAT) | PPG + ECG/BCG timing | MAE 5-15 mmHg | Very High (if accurate) | Calibration dependency; posture effects |
| **Blood glucose** | Multi-wavelength PPG absorption | Spectral decomposition; DL | NOT clinically validated | Potentially Very High | No proven accuracy; confounders overwhelming |
| **Hemoglobin** | Multi-wavelength absorption | Beer-Lambert; DL | MAE 0.5-1.5 g/dL | Moderate | Individual calibration; limited validation |
| **Hydration status** | PPG amplitude; waveform morphology | Morphological analysis | Research | Moderate | Many confounders; no gold standard |
| **Atrial fibrillation** | Beat-to-beat variability; PPG morphology | Variability analysis; DL | Sensitivity 90-97%; Specificity 85-95% | High | Motion artifact; premature beats mimic AF |

### Multi-Wavelength PPG — The Frontier

```
PPG Wavelength Selection:
  ↓
[1] Green (525-565 nm)
    → Best SNR for heart rate (absorbed by oxy/deoxy-Hb)
    → Most common in consumer wearables
    → Penetration depth: ~1-2 mm (dermal plexus)
    → ⚠️ Green PPG is MOST affected by melanin — skin pigmentation bias
  ↓
[2] Red (660 nm)
    → Standard for SpO2 (with IR)
    → Penetration depth: ~2-3 mm
    → Less affected by melanin than green
  ↓
[3] Infrared (880-940 nm)
    → Standard for SpO2 (with red)
    → Deepest penetration: ~3-5 mm
    → Least affected by melanin
    → ⚠️ IR PPG has LOWER SNR than green for heart rate
  ↓
[4] Multi-wavelength approach
    → Use multiple wavelengths simultaneously
    → Enables: SpO2, methemoglobin, carboxyhemoglobin estimation
    → Requires: individual calibration for most parameters
    → ⚠️ Multi-wavelength PPG for glucose is NOT CLINICALLY VALIDATED despite commercial claims
```

### PPG-Based Respiratory Rate Estimation

```
PPG Signal → Respiratory Rate Extraction
  ↓
[1] Respiratory Modulations in PPG
    → Baseline wander: thoracic pressure changes → venous return variation
    → Amplitude modulation: stroke volume variation with respiration
    → Frequency modulation: respiratory sinus arrhythmia (RSA)
    → ⚠️ All three modulations are WEAK — respiratory rate from PPG is inherently lower SNR than from impedance pneumography
  ↓
[2] Extraction Methods
    → Bandpass filtering (0.2-0.5 Hz = 12-30 breaths/min)
    → Autoregressive spectral estimation
    → Demodulation: extract AM + FM + BW components separately
    → Deep learning: end-to-end from raw PPG
    → ⚠️ Bandpass is SIMPLEST but fails during motion; DL is most robust but needs training data
  ↓
[3] Accuracy Benchmarks
    → Resting conditions: MAE 1-2 breaths/min (good)
    → Mild activity: MAE 2-4 breaths/min (acceptable)
    → Exercise: MAE 4-8 breaths/min (unreliable)
    → ⚠️ PPG respiratory rate during EXERCISE is UNRELIABLE — motion artifact overwhelms respiratory modulation
  ↓
[4] Clinical Application
    → Continuous respiratory monitoring on general ward (early deterioration)
    → Sleep apnea screening (apnea = respiratory pause >10s)
    → ⚠️ For ward monitoring, PPG respiratory rate is a TREND indicator, not a precise measurement
```

### PPG for Atrial Fibrillation — Consumer Device Validation

| Study | Device | Population | Sensitivity | Specificity | PPV | NPV | Key Limitation |
|-------|--------|-----------|------------|------------|-----|-----|---------------|
| **Apple Heart Study** | Apple Watch | 419K participants | 84% (irregular rhythm → AF on patch) | — | 34% (positive → confirmed AF) | — | Low PPV; young healthy population |
| **FITBIT Heart Study** | Fitbit | 455K participants | 88% | — | 32% | — | Similar low PPV |
| **Huawei Heart Study** | Huawei Band | 187K participants | 87% | 94% | — | — | Asian population; different AF prevalence |
| **KardiaMobile** | AliveCor | Clinical validation | 93-97% | 94-98% | Higher (single-lead ECG) | — | Single-lead ECG, not PPG |

```
⚠️ PPG-BASED AF DETECTION REALITY CHECK:
- Consumer PPG AF detection has HIGH SENSITIVITY but LOW PPV in general population
- Low PPV is EXPECTED: AF prevalence in general population is ~2%, so even 95% specificity → many false positives
- The VALUE is in SCREENING: catching AF in people who would never get an ECG
- Positive PPG screen → CONFIRM with ECG before clinical action
- PPG cannot distinguish AF from other irregular rhythms (PACs, PVCs, MAT) — ECG confirmation is mandatory
- Motion artifact is the #1 cause of FALSE POSITIVE AF detection from PPG
```

**Rule**: Multi-wavelength PPG for blood glucose estimation is NOT CLINICALLY VALIDATED. Commercial claims of non-invasive glucose monitoring via PPG lack rigorous evidence. Treat with extreme skepticism.
**Rule**: PPG-based respiratory rate is a TREND indicator, not a precise measurement. During exercise, it is unreliable.
**Rule**: Consumer PPG AF detection has HIGH sensitivity but LOW PPV. A positive screen must be CONFIRMED with ECG before clinical action.
**Rule**: PPG accuracy is AFFECTED by skin pigmentation. Green LED PPG (most common in wearables) is most affected. IR PPG is least affected. This bias must be addressed in model training and validation.
**Rule**: Pulse oximetry bias is a CAUTIONARY TALE for all PPG-based AI: hardware-level bias (melanin absorption) propagates to algorithm-level bias. For the fairness and equity perspective, see research-ethics-fairness.md (Pulse Oximetry Bias section).

## Ballistocardiography (BCG) & Seismocardiography (SCG)

### BCG/SCG Signal Overview

| Signal | Measurement | Physiological Origin | Frequency Band | Key Parameter | Clinical Application |
|--------|------------|---------------------|---------------|--------------|---------------------|
| **BCG (ballistocardiography)** | Body recoil forces from cardiac ejection | Cardiac contractile force; blood acceleration | 1-20 Hz | I/J/K wave amplitudes; J-wave timing | Cardiac output estimation; heart failure monitoring |
| **SCG (seismocardiography)** | Chest wall vibrations from cardiac events | Valve closure; myocardial contraction | 1-80 Hz | AO (aortic valve opening); AC (aortic closure) | Systolic time intervals; LV function assessment |
| **FBCG (force BCG)** | Force plate under bed/mattress | Whole-body recoil | 0.5-10 Hz | J-wave amplitude; I-J slope | Unobtrusive home monitoring |
| **Wearable BCG** | Accelerometer on sternum or in mattress | Local chest wall motion | 1-40 Hz | Same as SCG | Continuous home monitoring |

### BCG/SCG Processing Pipeline

```
Raw BCG/SCG Signal (accelerometer/force sensor)
  ↓
[1] Preprocessing
    → Bandpass filter: BCG 0.5-20 Hz; SCG 1-80 Hz
    → Motion artifact removal: adaptive filtering; wavelet denoising
    → Respiration removal: BCG is MODULATED by respiration (amplitude varies with breathing)
    → ⚠️ BCG/SCG signals are EXTREMELY sensitive to motion — even slight movement corrupts the signal
    → ⚠️ BCG respiration modulation must be REMOVED before cardiac parameter extraction
  ↓
[2] Beat Detection & Segmentation
    → ECG-gated (if ECG available): use R-peak as reference
    → BCG-only: J-peak detection (largest positive deflection)
    → SCG-only: AO peak detection (sharp spike from aortic valve opening)
    → ⚠️ BCG-only beat detection is UNRELIABLE without ECG reference — morphology varies between subjects
  ↓
[3] Feature Extraction
    → BCG: I-wave (deceleration), J-wave (peak ejection), K-wave (deceleration)
    → SCG: MC (mitral closure), AO (aortic opening), AC (aortic closure), MO (mitral opening)
    → Timing: pre-ejection period (PEP = MC to AO), left ventricular ejection time (LVET = AO to AC)
    → Amplitude: J-wave amplitude (proxy for stroke volume)
    → ⚠️ BCG J-wave amplitude correlates with stroke volume but is NOT a calibrated measurement
    → ⚠️ PEP/LVET from SCG require ECG reference for MC timing in most implementations
  ↓
[4] Clinical Parameters
    → Cardiac output estimation: J-wave amplitude × heart rate (uncalibrated)
    → Systolic time intervals: PEP, LVET, PEP/LVET ratio
    → Contractility changes: J-wave amplitude trends (within-subject)
    → ⚠️ BCG/SCG parameters are RELATIVE (within-subject trends), not ABSOLUTE measurements
    → ⚠️ Between-subject BCG amplitude variation is LARGE — cannot compare across individuals
  ↓
[5] Clinical Integration
    → Home monitoring: trend BCG amplitude for heart failure decompensation
    → Unobtrusive: mattress sensor for elderly; no wearable required
    → ⚠️ BCG/SCG are NOT replacements for echocardiography — they are TRENDING tools
    → ⚠️ The clinical value is in DETECTING CHANGES, not measuring absolute values
```

### BCG/SCG vs Established Cardiac Monitoring

| Parameter | Echocardiography | ECG | BCG/SCG | Invasive (PAC) |
|-----------|-----------------|-----|---------|----------------|
| **EF** | Gold standard | No | Estimated (uncalibrated) | No |
| **Stroke volume** | Good | No | Proxy (J-wave amplitude) | Gold standard (thermodilution) |
| **Cardiac output** | Moderate | No | Proxy (J-wave × HR) | Gold standard |
| **PEP/LVET** | Moderate | No | Good (SCG) | No |
| **Heart rate** | Good | Gold standard | Good | Good |
| **AF detection** | No | Gold standard | Possible (irregular J-wave) | No |
| **Unobtrusive** | No | No (requires electrodes) | YES (mattress/wearable) | No (invasive) |
| **Continuous** | No | Yes (Holter) | Yes | Yes (ICU only) |

**Rule**: BCG/SCG parameters are RELATIVE (within-subject trends), not ABSOLUTE measurements. J-wave amplitude varies greatly between individuals but is relatively stable within an individual.
**Rule**: BCG/SCG are TRENDING tools, not diagnostic tools. Their clinical value is in detecting CHANGES (e.g., heart failure decompensation), not measuring absolute cardiac function.
**Rule**: BCG/SCG are EXTREMELY sensitive to motion. Even slight patient movement corrupts the signal. Robust motion artifact detection is mandatory.
**Rule**: BCG J-wave amplitude correlates with stroke volume but is NOT calibrated. It can detect TRENDS (increase/decrease) but cannot replace echocardiography or thermodilution for absolute cardiac output.
