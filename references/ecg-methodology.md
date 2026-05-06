# ECG Methodology Authority Framework

## Reference Index

| ID | Paper | Year | PMID | DOI | Domain | Authority Level |
|----|-------|------|------|-----|--------|----------------|
| ECG-01 | Pan & Tompkins — A Real-Time QRS Detection Algorithm | 1985 | — | 10.1109/TBME.1985.325532 | QRS Detection | ★★★★★ Foundational |
| ECG-02 | Hamilton & Tompkins — Quantitative Investigation of QRS Detection Rules | 1986 | — | 10.1109/TBME.1986.325696 | QRS Detection | ★★★★★ Foundational |
| ECG-03 | Hannun et al. — Cardiologist-Level Arrhythmia Detection and Classification in Ambulatory ECGs Using a Deep Neural Network | 2019 | 30617341 | 10.1038/s41591-018-0268-3 | DL Arrhythmia | ★★★★★ Landmark |
| ECG-04 | Attia et al. — An AI-Enabled ECG Algorithm for Identification of Patients with Atrial Fibrillation during Sinus Rhythm | 2019 | 31378384 | 10.1016/S0140-6736(19)31721-0 | AI-ECG AF | ★★★★★ Landmark |
| ECG-05 | Wagner et al. — PTB-XL, a Large Publicly Available Electrocardiography Dataset | 2020 | 32561867 | 10.1038/s41597-020-0495-6 | Dataset/Benchmark | ★★★★★ Foundational |
| ECG-06 | Strodthoff et al. — Deep Learning for Electrocardiography: A Comparative Review | 2021 | — | — | DL-ECG Review | ★★★★ Authoritative |
| ECG-07 | Hughes et al. — Deep Learning for ECG Arrhythmia Detection and Classification (2017–2023 Overview) | 2023 | 37794693 | 10.3390/jcdd10100369 | DL-ECG Review | ★★★★ Authoritative |

---

## ECG-01: Pan-Tompkins QRS Detection Algorithm

### Citation
Pan J, Tompkins WJ. A Real-Time QRS Detection Algorithm. IEEE Trans Biomed Eng. 1985;BME-32(3):230-236.

### Methodology Decomposition

**Core Idea**: Detect QRS complexes in real-time by combining slope, amplitude, and width information through a cascade of digital signal processing stages.

**Algorithm Pipeline**:
```
Raw ECG → Bandpass Filter (5-15Hz cascaded LP+HP) → Derivative (5-point) →
Squaring Function → Moving Window Integration → Adaptive Thresholding → QRS Detection
```

**Key Technical Decisions**:
1. Bandpass achieved by cascading low-pass (cutoff ~11Hz) + high-pass (cutoff ~5Hz) rather than a single filter — computationally efficient for real-time
2. Derivative extracts slope information — QRS has the steepest slope
3. Squaring emphasizes large differences and makes all values positive
4. Moving window integration smooths and provides width information
5. Dual adaptive thresholds (signal peak vs noise peak) with search-back mechanism

**Performance**: 99.3% detection rate on MIT-BIH Arrhythmia Database

**Methodological Insight — Why This Works**:
- The cascade design is not arbitrary: each stage addresses a specific signal characteristic (frequency → slope → energy → width)
- Adaptive thresholding is the key innovation: it handles varying signal quality without fixed thresholds
- Search-back mechanism prevents missed beats during sudden amplitude changes

**Reproducibility Notes**:
- Fully reproducible: algorithm described in sufficient mathematical detail
- Standard benchmark: MIT-BIH Arrhythmia Database (open access on PhysioNet)
- Implementation available in `wfdb`, `biosppy`, `neurokit2` Python packages
- Difficulty: ★★☆☆☆ (well-documented, standard implementation)

**When to Reference This**:
- Any ECG processing pipeline requiring R-peak detection
- Baseline comparison for new QRS detection methods
- Understanding the standard preprocessing approach for arrhythmia classification
- Designing real-time ECG systems

---

## ECG-03: Hannun et al. — Cardiologist-Level Arrhythmia Detection

### Citation
Hannun AY, Rajpurkar P, Haghpanahi M, et al. Cardiologist-Level Arrhythmia Detection and Classification in Ambulatory Electrocardiograms Using a Deep Neural Network. Nat Med. 2019;25(1):65-69. PMID: 30617341

### Methodology Decomposition

**Core Idea**: A 34-layer deep residual CNN can classify 12 rhythm classes from single-lead ECG at cardiologist-level performance, using a large proprietary dataset.

**Architecture**:
- 34-layer residual CNN (ResNet-style)
- Input: single-lead ECG, 30-second windows, sampled at 200Hz
- Output: 12 classes (1 normal + 11 arrhythmia types)
- Training data: 91,232 single-lead ECG records from 53,549 patients (iRhythm Zio patch)

**Key Technical Decisions**:
1. End-to-end learning: raw signal → classification, no hand-crafted features
2. Residual connections enable training very deep networks on ECG
3. 30-second input windows balance temporal context and computational cost
4. Data labeled by 3 cardiologists with consensus adjudication
5. Evaluation against 6 cardiologists on a held-out test set

**Performance**:
- F1 score 0.805 (model) vs 0.777 (average cardiologist)
- Model beat average cardiologist on 10/12 classes
- On the 2 classes where cardiologists won: the model's errors were "reasonable"

**Critical Analysis — Adversarial Check**:
| Dimension | Rating | Detail |
|-----------|--------|--------|
| Contradictory Evidence | 🟡 | Subsequent studies (e.g., on PTB-XL) show lower performance on external datasets |
| Statistical Vulnerability | 🟡 | No confidence intervals on F1; single test set; no external validation |
| Reproduction Risk | 🔴 | Proprietary dataset (Zio patch); not publicly available; code not officially released |
| Hidden Assumptions | 🟡 | Assumes clean single-lead input; real-world noise may degrade performance |
| Data Leakage Risk | 🟢 | Patient-wise split reported; but dataset curation details limited |

**Methodological Insight — What Makes This a Landmark**:
1. **Scale**: First paper to demonstrate DL matching cardiologists on a large, clinically diverse dataset
2. **Evaluation Design**: Comparison against multiple cardiologists (not just one) is methodologically rigorous
3. **Clinical Framing**: 12-class output maps to clinically actionable categories
4. **Limitation**: Proprietary data makes this a "trust but cannot verify" result — this is the #1 reproduction blocker

**Reproducibility Blueprint**:
| Component | Status | Detail |
|-----------|--------|--------|
| Data | ❌ | Proprietary Zio patch data; not available |
| Architecture | ✅ | 34-layer ResNet described in supplementary |
| Hyperparameters | ⚠️ | Learning rate, batch size stated; some training details missing |
| Evaluation | ✅ | F1 per class, cardiologist comparison methodology described |
| Code | ❌ | No official code release at publication |

**Alternative Reproduction Strategy**:
- Use PTB-XL (21,837 records, open access) as substitute dataset
- Use MIT-BIH Arrhythmia Database for beat-level comparison
- Use CPSC 2018 challenge data for AF-specific comparison
- Expected performance gap: 5-15% lower F1 due to smaller dataset and different label granularity

**When to Reference This**:
- Establishing that DL can match cardiologist-level ECG interpretation
- Designing end-to-end ECG classification systems
- Understanding the gap between proprietary-data results and open-data reproduction
- Benchmarking new architectures against the "cardiologist-level" standard

---

## ECG-04: Attia et al. — AI-ECG for AF Detection During Sinus Rhythm

### Citation
Attia ZI, Noseworthy PA, Lopez-Jimenez F, et al. An Artificial Intelligence-Enabled ECG Algorithm for the Identification of Patients with Atrial Fibrillation during Sinus Rhythm. Lancet. 2019;394(10201):861-867. PMID: 31378384

### Methodology Decomposition

**Core Idea**: A CNN can detect subtle ECG signatures of paroxysmal AF even when the patient is currently in sinus rhythm — effectively "seeing" what human cardiologists cannot.

**Architecture**: Deep CNN applied to standard 12-lead ECG
**Training Data**: 180,922 12-lead ECGs from Mayo Clinic (n=36,280 unique patients)
**Key Finding**: AUC 0.90 for identifying AF during sinus rhythm; validated on external cohort

**Methodological Insight — Why This Is Revolutionary**:
1. **Paradigm Shift**: The model detects a condition that is NOT currently present — this is not pattern recognition but predictive inference from subtle morphological changes
2. **Clinical Impact**: Could enable screening for "silent AF" from routine ECGs, potentially preventing strokes
3. **Validation Rigor**: External validation on separate cohort; temporal validation (different time period)

**Critical Analysis**:
| Dimension | Rating | Detail |
|-----------|--------|--------|
| Contradictory Evidence | 🟡 | External reproduction studies show variable AUC (0.79-0.87) |
| Statistical Vulnerability | 🟢 | Large sample, external validation, AUC with CI reported |
| Reproduction Risk | 🔴 | Proprietary Mayo Clinic data; model not publicly available |
| Hidden Assumptions | 🟡 | Assumes AF causes persistent ECG morphology changes even in sinus rhythm — biological plausibility debated |
| Data Leakage Risk | 🟢 | Patient-wise and temporally separated splits |

**When to Reference This**:
- AI-ECG for detecting conditions not currently manifest (predictive ECG)
- Designing screening studies for paroxysmal conditions
- Understanding the "AI sees what humans cannot" paradigm
- External validation methodology for clinical AI

---

## ECG-05: PTB-XL Dataset

### Citation
Wagner P, Strodthoff N, Bousseljot RD, et al. PTB-XL, a Large Publicly Available Electrocardiography Dataset. Sci Data. 2020;7:154. PMID: 32561867

### Methodology Decomposition

**Core Idea**: Provide the largest freely accessible clinical 12-lead ECG dataset with multi-label annotation to enable reproducible ML research.

**Dataset Characteristics**:
- 21,837 records from 18,885 patients
- 10-second 12-lead ECG recordings
- Sampling rate: 100Hz (also available at 500Hz)
- Multi-label annotation by up to 2 cardiologists
- Diagnostic superclasses: NORM, MI, STTC, CD, HYP (5 categories)
- Diagnostic subclasses: 44 fine-grained categories
- Proposed 10-fold train/test splits (patient-disjoint)

**⚠️ PTB-XL Label Hierarchy Selection Guide**:
When using PTB-XL, choose the label level based on your research goal:
| Label Level | # Classes | When to Use | Performance Expectation |
|-------------|-----------|-------------|------------------------|
| Superclass (5) | NORM, MI, STTC, CD, HYP | Initial benchmarking; limited data; multi-label classification | AUROC 0.90-0.97 achievable |
| Subclass (24, recommended) | 24 clinically distinct categories | Standard benchmarking; most papers use this | AUROC 0.80-0.95 depending on class |
| Subclass (44, full) | All diagnostic statements | Fine-grained analysis; rare classes have very few samples | AUROC highly variable; some classes <0.70 |
| Form (all statements) | Raw diagnostic statements | Not recommended for ML — too many rare classes | Unreliable for most classes |

**Recommendation**: Use 24-subclass for benchmarking (as in Strodthoff et al. 2020). Use 5-superclass for quick prototyping. Avoid 44-subclass unless specifically studying rare conditions.
**⚠️ Multi-label**: PTB-XL is MULTI-LABEL (one ECG can have multiple diagnoses). Use multi-label loss (BCE), NOT softmax.

**Methodological Insight — Why This Is Foundational**:
1. **Scale + Open Access**: First dataset large enough for deep learning with open access
2. **Multi-label**: Reflects clinical reality where patients have multiple concurrent conditions
3. **Proposed Evaluation Protocol**: Pre-defined folds prevent data leakage and enable fair comparison
4. **Metadata Richness**: Age, sex, height, weight, medical history included

**Benchmark Results (from paper)**:
| Method | Superclass F1 | Subclass F1 |
|--------|---------------|-------------|
| ResNet (baseline) | 0.896 | 0.647 |
| XResNet1d101 | 0.916 | 0.702 |

**When to Reference This**:
- Any ECG classification study needing a large, open-access benchmark
- Designing evaluation protocols for ECG ML papers
- Comparing multi-label vs single-label classification approaches
- Understanding the gap between proprietary dataset results and open-data results

---

## ECG Methodology Synthesis Framework

### Automatic Thinking Protocol for ECG Papers

When analyzing ANY ECG paper, automatically apply this reasoning chain:

```
1. SIGNAL LEVEL
   → What lead configuration? (12-lead / single-lead / multi-lead)
   → What sampling rate? (125/250/360/500 Hz)
   → What preprocessing? (filtering / normalization / segmentation)

2. TASK LEVEL
   → Beat-level or rhythm-level classification?
   → Multi-class or multi-label?
   → Detection or prediction?

3. DATA LEVEL
   → Open or proprietary dataset?
   → If proprietary → flag as non-reproducible, suggest PTB-XL/MIT-BIH alternative
   → Patient-wise split or record-wise? (patient-wise is mandatory for clinical validity)

4. MODEL LEVEL
   → End-to-end or feature-based?
   → CNN / RNN / Transformer / hybrid?
   → Input window length and overlap?

5. EVALUATION LEVEL
   → Metrics: F1 / AUC / Sensitivity / Specificity / Accuracy?
   → For clinical tasks: MUST report Sens/Spec, not just Accuracy
   → External validation? Cross-dataset generalization?
   → Comparison against clinical baseline (cardiologist / existing algorithm)?

6. CLINICAL LEVEL
   → What is the clinical workflow this supports?
   → Screening vs diagnostic vs monitoring?
   → What are the consequences of false positives vs false negatives?
   → Regulatory pathway consideration (FDA 510(k) / De Novo / CE)
```

### ECG Method Matching Matrix

| User Task | Recommended Starting Method | Key Reference | Dataset | Difficulty |
|-----------|---------------------------|---------------|---------|------------|
| R-peak detection | Pan-Tompkins / Hamilton | ECG-01/02 | MIT-BIH | ★★☆☆☆ |
| Beat-level arrhythmia classification | CNN (ResNet) on segmented beats | ECG-03 | MIT-BIH, PTB-XL | ★★★☆☆ |
| Rhythm-level classification | End-to-end CNN on 30s windows | ECG-03 | PTB-XL | ★★★☆☆ |
| AF detection from short ECG | CNN/LSTM on 9-60s windows | ECG-03, ECG-04 | CPSC 2018 | ★★★☆☆ |
| AF prediction during sinus rhythm | CNN on 12-lead ECG | ECG-04 | Proprietary (reproduce on PTB-XL) | ★★★★☆ |
| Multi-label diagnostic classification | ResNet/XResNet with multi-label loss | ECG-05 | PTB-XL | ★★★☆☆ |
| ECG denoising | Wavelet / AE / U-Net | — | MIT-BIH (noise stress test) | ★★★☆☆ |
| ECG generation | GAN / Diffusion / VAE | — | PTB-XL | ★★★★☆ |

### ECG Reproduction Difficulty Predictor

| Factor | Easy (★) | Medium (★★★) | Hard (★★★★★) |
|--------|----------|---------------|---------------|
| Dataset | Open, well-documented | Open, needs preprocessing | Proprietary / restricted |
| Architecture | Standard CNN/RNN | Custom hybrid | Novel architecture, limited detail |
| Preprocessing | Standard filtering | Custom pipeline | Undocumented steps |
| Evaluation | Standard metrics | Clinical metrics + CI | External validation + clinical comparison |
| Code | Official repo available | Community implementation | No code, limited detail |

---

## ECG-08: AI-ECG Cross-Disease Screening (2023-2025)

### Landmark Papers

| Paper | Year | Disease Detected | AUC | Key Innovation | Validation Level |
|-------|------|-----------------|-----|---------------|-----------------|
| **Attia et al.** — AI-ECG for EF ≤35% | 2019 | Reduced EF | 0.93 | ECG → cardiac function | V2 (External) |
| **Awni et al.** — AI-ECG for LVH | 2023 | Left ventricular hypertrophy | 0.89 | ECG → structural heart disease | V2 |
| **Ko et al.** — AI-ECG for hyperkalemia | 2020 | Hyperkalemia | 0.88 | ECG → electrolyte abnormality | V2 |
| **Smith et al.** — AI-ECG for pulmonary hypertension | 2023 | Pulmonary HTN | 0.85 | ECG → hemodynamics | V1-V2 |
| **Attia et al.** — AI-ECG for silent AF | 2019 | Paroxysmal AF | 0.87 | ECG → future arrhythmia risk | V2 |
| **Awni et al.** — AI-ECG for aortic stenosis | 2024 | Aortic stenosis | 0.86 | ECG → valve disease | V2 |
| **Hughes et al.** — AI-ECG for COVID-19 | 2021 | COVID-19 | 0.80 | ECG → infectious disease | V1 |

### AI-ECG Cross-Disease Assessment Protocol

```
AI-ECG Cross-Disease Claim
  ↓
[1] Biological Plausibility Check
    → Does the ECG contain information relevant to the disease?
    → Known ECG manifestations of the condition?
    → ⚠️ If no known ECG-disease link, claim requires EXTRAORDINARY evidence
    → ⚠️ "AI finds signal invisible to humans" → possible but needs rigorous validation
  ↓
[2] Temporal Leakage Check
    → Is the ECG recorded BEFORE the diagnosis? (Prospective)
    → OR: ECG recorded AFTER diagnosis? (Retrospective — may capture treatment effects)
    → ⚠️ ECGs from diagnosed patients may reflect treatment, not pre-disease state
  ↓
[3] Confounding Check
    → Is the AI detecting the disease or a confounder?
    → Age, sex, BMI, medications can all alter ECG
    → ⚠️ If disease prevalence differs by age/sex, AI may learn demographics not disease
  ↓
[4] Clinical Utility Check
    → Does AI-ECG screening improve outcomes over standard care?
    → What's the positive predictive value in the target population?
    → ⚠️ High AUC ≠ clinical utility if prevalence is very low
  ↓
[5] Generalization Check
    → Validated across: different ECG machines, demographics, clinical settings?
    → ⚠️ AI-ECG trained on Mayo Clinic data may not generalize to community hospitals
```

**Rule**: AI-ECG cross-disease screening claims MUST address confounding by age, sex, and comorbidities. ECG changes with all three.
**Rule**: "AI detects X from ECG" where X has no known ECG manifestation requires INDEPENDENT external validation before clinical consideration.

### AI-ECG Cross-Disease Screening — RCT Evidence (2025 Update)

**DULCE Trial — AI-ECG for Liver Disease Detection** (Nature Medicine 2025):
- Source: Simonetto et al., Nature Medicine 2025; NCT05782283
- Design: Pragmatic, cluster-randomized clinical trial; 15,596 patients; 248 clinicians; 9 sites
- AI model: ACE (AI-Cirrhosis-ECG) score analyzing routine ECG for advanced chronic liver disease patterns
- Key result: AI-ECG DOUBLED the number of advanced chronic liver disease diagnoses in asymptomatic patients
- All AI-detected cases confirmed by validated imaging or blood tests
- Clinical significance: liver disease often asymptomatic until irreversible; early detection enables intervention
- Validation level: V5 (pragmatic RCT) — highest evidence for AI-ECG cross-disease screening

**Cross-Disease AI-ECG RCT Evidence Summary**:

| Condition | Trial | Design | Key Result | Validation Level |
|-----------|-------|--------|------------|-----------------|
| **Advanced liver disease** | DULCE (Mayo Clinic) | Cluster-RCT, 15,596 pts | 2× diagnosis rate | V5 (pragmatic RCT) |
| **Low LVEF** | Multiple observational | Retrospective, multi-site | AUROC 0.93 | V2-V3 |
| **Atrial fibrillation** | Apple Heart Study | Prospective, 419K | 0.84 positive predictive value | V2 (single-arm) |
| **Hyperkalemia** | Observational only | Retrospective | AUROC 0.85-0.93 | V1 (internal) |

**Rule**: DULCE is the FIRST RCT evidence for AI-ECG cross-disease screening. Prior AI-ECG cross-disease claims (low EF, AF, hyperkalemia) are based on OBSERVATIONAL data only (V1-V2).
**Rule**: AI-ECG cross-disease screening is most valuable when: (1) the target condition is prevalent but underdiagnosed, (2) ECG is routinely available, (3) early detection changes management. Liver disease meets ALL three criteria.

---

## Wearable & Ambulatory ECG Methodology

### Wearable ECG Quality Challenges

| Challenge | Description | Impact | Mitigation |
|-----------|-------------|--------|-----------|
| **Motion artifact** | Movement corrupts ECG signal | 30-70% of wearable ECG unusable during activity | Adaptive filtering; motion-aware quality scoring |
| **Dry electrode noise** | Higher impedance than gel electrodes | Baseline wander; intermittent contact | Ag/AgCl electrodes; pressure optimization |
| **Single-lead limitation** | Only 1-3 leads available | Cannot diagnose conditions requiring 12-lead | Focus on rhythm analysis; refer for 12-lead |
| **Sampling rate** | Often 250-512 Hz vs 1000 Hz clinical | Reduced high-frequency resolution | Adequate for rhythm; insufficient for detailed morphology |
| **Battery constraints** | Limited processing power | Cannot run complex models on-device | Edge-cloud hybrid; model compression |

### Wearable ECG Application Decision Matrix

| Application | Feasibility | Required Lead Count | Key Metric | Current Performance |
|-------------|-----------|-------------------|-----------|-------------------|
| **AF detection** | ✅ High | 1-lead | Sensitivity, specificity | >95% / >95% (Apple Watch, KardiaMobile) |
| **Premature beat detection** | ✅ High | 1-lead | Sensitivity, PPV | >85% / >80% |
| **Heart rate monitoring** | ✅ Very high | Any | MAE | <5 bpm |
| **ST-segment analysis** | ⚠️ Limited | ≥3 leads | Sensitivity | Not validated for clinical use |
| **QT interval monitoring** | ❌ Low | 12-lead | Measurement error | Not feasible on single-lead |
| **STEMI detection** | ❌ Low | 12-lead | Sensitivity | Not feasible on wearable |
| **Sleep apnea screening** | ✅ Moderate | 1-lead + PPG | AUC | 0.80-0.85 |
| **Stress/fatigue monitoring** | ⚠️ Moderate | 1-lead + HRV | Correlation | Moderate; not clinically validated |

**Rule**: Wearable ECG is CLINICALLY VALIDATED only for AF detection. All other applications are screening/research only as of 2025.
**Rule**: Apple Watch AF detection has the MOST clinical evidence (600K+ participants in Apple Heart Study). It is the benchmark for wearable cardiac monitoring.

### Smartwatch ECG Research Protocol

```
Wearable ECG Study Design
  ↓
[1] Study Type Selection
    → Diagnostic accuracy: Compare wearable vs clinical ECG
    → Screening: Large population; measure detection rate
    → Interventional: Wearable detection → clinical action → outcome
    → ⚠️ Most wearable studies are diagnostic accuracy only (no outcome data)
  ↓
[2] Reference Standard
    → Gold standard: 12-lead ECG interpreted by cardiologist
    → OR: Continuous cardiac monitor (e.g., Zio patch) for AF
    → ⚠️ Single-time-point ECG is INADEQUATE for paroxysmal AF reference
  ↓
[3] Population
    → Target: general population vs high-risk vs known disease
    → ⚠️ Pre-test probability affects PPV/NPV dramatically
    → General population AF prevalence ~1%; PPV will be low even with high sensitivity
  ↓
[4] Endpoint
    → Primary: Sensitivity, specificity for condition detection
    → Secondary: Time to detection; clinical action taken; patient outcomes
    → ⚠️ Detection ≠ clinical benefit. Must show outcome improvement.
  ↓
[5] Regulatory
    → Consumer wellness device: No FDA clearance needed
    → AF detection feature: FDA De Novo or 510(k) required
    → ⚠️ "Wellness" vs "medical" claim boundary is critical
```

---

## ECG Foundation Models (2024-2025)

### Emerging ECG Foundation Models

| Model | Year | Pretraining Data | Architecture | Key Capability | Status |
|-------|------|-----------------|-------------|---------------|--------|
| **MERL** | 2024 | 10M+ ECGs | Transformer | Multi-task ECG | Research |
| **ECG-FM** | 2024 | PTB-XL + MIMIC-IV-ECG | ViT variant | Zero-shot arrhythmia detection | Research |
| **PANORAMA** | 2024 | 2M+ ECGs | Multi-modal | ECG + clinical text | Research |
| **ZeroECG** | 2025 | Large-scale | CLIP-style | Zero-shot ECG understanding | Preprint |

### ECG Foundation Model Assessment

| Assessment | Key Question | Required Evidence | Red Flag |
|-----------|-------------|-------------------|---------|
| **Pretraining data** | What data was used for pretraining? | Dataset size, source, demographics | Proprietary data; no demographic info |
| **Zero-shot capability** | Can it diagnose unseen conditions? | Performance on held-out pathologies | Only tested on training pathologies |
| **Fine-tuning efficiency** | How much labeled data needed? | Learning curves with varying data | No few-shot evaluation |
| **Generalization** | Does it generalize across sites? | Cross-site evaluation | Same-site train/test only |
| **Interpretability** | Can it explain its predictions? | Attention maps, feature importance | Black box with no interpretability |
| **Computational cost** | Can it run on edge devices? | Inference time, model size | Too large for wearable deployment |

**Rule**: ECG foundation models are in EARLY STAGE as of 2025. Most have NOT been validated on diverse external datasets. Treat with appropriate skepticism.
**Rule**: A foundation model fine-tuned on a specific task should be compared against a STRONG task-specific baseline. If the fine-tuned foundation model does not outperform a well-trained 1D-CNN, the foundation model adds no value for that task.
