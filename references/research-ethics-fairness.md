# Research Ethics & Fairness in Biomedical AI

## Ethical Principles for Biomedical AI Research

### Core Principles (Adapted from Belmont Report + AI-Specific)

| Principle | Definition | AI-Specific Application | Violation Example |
|-----------|-----------|------------------------|-------------------|
| **Respect for Persons** | Autonomy; informed consent | Patients must understand how their data trains AI | Training AI on data without informed consent |
| **Beneficence** | Maximize benefit; minimize harm | AI must improve outcomes without introducing new risks | Deploying unvalidated AI that causes misdiagnosis |
| **Justice** | Fair distribution of benefits/burdens | AI must work equitably across populations | AI trained only on White patients; fails on Black patients |
| **Transparency** | Openness about methods and limitations | Model cards; data sheets; algorithmic auditing | "Black box" AI deployed without explainability |
| **Accountability** | Clear responsibility for AI outcomes | Clinical validation; post-market surveillance | No mechanism to identify who is responsible for AI errors |

---

## Bias in Biomedical AI

### Sources of Bias in Medical AI Pipeline

```
Data Collection
  ├─ Selection bias: Hospital data ≠ general population
  │   → Academic medical centers: sicker, wealthier, more urban
  │   → Insurance-based data: excludes uninsured
  │   → Geographic bias: single-site data
  │
  ├─ Representation bias: Underrepresented groups
  │   → Race/ethnicity: Black, Hispanic, Indigenous underrepresented
  │   → Age: Pediatric and elderly underrepresented
  │   → Sex: Female underrepresented in cardiovascular trials
  │   → Geography: Low- and middle-income countries excluded
  │
  ├─ Measurement bias: Systematic differences in data quality
  │   → Different imaging protocols across sites
  │   → Different lab reference ranges
  │   → Different ECG machines and sampling rates
  │
  └─ Label bias: Systematic errors in ground truth
      → Inter-observer variability in pathology
      → ICD coding errors in EHR
      → Self-report bias in survey data

Model Development
  ├─ Algorithmic bias: Model amplifies existing disparities
  │   → Optimizing overall accuracy may sacrifice minority performance
  │   → Feature selection may encode protected attributes
  │
  ├─ Evaluation bias: Test set not representative
  │   → Internal validation only; no external test
  │   → Test set from same distribution as training
  │
  └─ Deployment bias: Context mismatch
      → Model trained on adults deployed for children
      → Model trained on inpatients deployed for outpatients

Post-Deployment
  ├─ Automation bias: Clinicians over-trust AI
  ├─ Feedback loop: AI predictions influence future data
  └─ Access disparity: AI only available at well-resourced sites
```

### Bias Assessment Protocol

| Step | Action | Method | Output |
|------|--------|--------|--------|
| **1. Data audit** | Assess demographic representation | Compare dataset demographics to target population | Representation gap report |
| **2. Subgroup performance** | Evaluate metrics per subgroup | Stratified evaluation by race, sex, age, site | Per-subgroup AUC, sensitivity, PPV |
| **3. Disparity quantification** | Measure performance gaps | Difference in AUC, equalized odds, demographic parity | Disparity metrics with CIs |
| **4. Error analysis** | Analyze failure modes by subgroup | Confusion matrices per subgroup; qualitative review | Error pattern report |
| **5. Fairness-aware mitigation** | Apply bias mitigation if needed | Resampling, reweighting, adversarial debiasing | Mitigated model + comparison |

### Fairness Metrics for Medical AI

| Metric | Definition | Formula | When to Use | Limitation |
|--------|-----------|---------|-------------|-----------|
| **Demographic Parity** | P(Ŷ=1\|A=a) = P(Ŷ=1\|A=b) | Equal positive rate across groups | Screening tasks | May conflict with base rate differences |
| **Equalized Odds** | P(Ŷ=1\|Y=y,A=a) = P(Ŷ=1\|Y=y,A=b) | Equal TPR and FPR across groups | Diagnostic tasks | Most clinically relevant fairness metric |
| **Equal Opportunity** | P(Ŷ=1\|Y=1,A=a) = P(Ŷ=1\|Y=1,A=b) | Equal TPR across groups | When false negatives are most harmful | Does not address FPR disparity |
| **Predictive Parity** | P(Y=1\|Ŷ=1,A=a) = P(Y=1\|Ŷ=1,A=b) | Equal PPV across groups | When positive predictions must be equally reliable | Does not address TPR disparity |
| **Calibration** | P(Y=1\|Ŷ=p,A=a) = p for all a | Equal calibration across groups | Risk prediction tasks | Does not guarantee equal TPR/FPR |

**Rule**: Equalized Odds is the MOST clinically appropriate fairness metric for diagnostic AI — it ensures equal sensitivity AND equal false positive rate across groups.
**Rule**: Demographic Parity is INAPPROPRIATE for medical AI when disease prevalence genuinely differs across groups. Forcing equal positive rates can cause harm.
**Rule**: You CANNOT satisfy all fairness metrics simultaneously (Chouldechova impossibility theorem). Choose the metric most aligned with clinical context.

### Known Bias Cases in Medical AI (Landmark Studies)

| Study | Year | Domain | Bias Identified | Impact | Citation |
|-------|------|--------|----------------|--------|----------|
| **Obermeyer et al.** | 2019 | Health risk prediction | Black patients assigned same risk as White patients despite being sicker | Reduced care access for Black patients | Science 366(6464):447-453 |
| **Seyyed-Kalantari et al.** | 2021 | Chest X-ray, pathology | Underdiagnosis of underrepresented groups | Performance gaps across race/sex/insurance | JAMA Netw Open 4(11):e2136279 |
| **Larrazabal et al.** | 2020 | Chest X-ray | Gender imbalance in training data → performance disparity | Female patients underdiagnosed | PNAS 117(23):12592-12594 |
| **Chen et al.** | 2021 | Dermatology AI | Dark skin tones underrepresented in training data | Reduced accuracy for skin of color | JAMA Dermatol 157(11):1302-1308 |
| **Daneshjou et al.** | 2022 | Dermatology AI | Models fail on diverse skin tones even with balanced data | Structural bias beyond representation | Nat Med 28:1198-1203 |

---

## Informed Consent for AI Research

### Consent Framework for AI Training Data

| Data Source | Consent Model | Requirements | Key Consideration |
|------------|--------------|-------------|-------------------|
| **Prospective research** | Study-specific consent | IRB-approved consent form; AI use specified | Must specify: model purpose, data retention, re-use policy |
| **EHR retrospective** | Waiver of consent | Minimal risk; impractical to re-consent; privacy protections | ⚠️ Must demonstrate waiver criteria per 45 CFR 46 |
| **Public datasets** | Data use agreement | Follow original DUA terms | ⚠️ Some datasets restrict commercial AI use |
| **De-identified data** | Varies by jurisdiction | HIPAA Safe Harbor or Expert Determination | ⚠️ De-identification does NOT eliminate all privacy risk |
| **Federated learning** | Local consent + DUA | Each site maintains consent; model shared not data | Best for multi-site AI with privacy constraints |

### Consent Elements Specific to AI Research

| Element | Standard Consent | AI-Specific Addition |
|---------|-----------------|---------------------|
| **Purpose** | Study purpose | How AI model will be used; clinical vs research |
| **Data use** | What data collected | How data trains AI; feature extraction; model inputs |
| **Data sharing** | Who accesses data | Whether model weights will be shared; data retention |
| **Risks** | Study risks | Risk of AI misclassification; potential for bias |
| **Benefits** | Study benefits | Whether AI will directly benefit participant |
| **Withdrawal** | Right to withdraw | Whether data can be removed from trained model (often impossible) |
| **Commercial use** | Usually not addressed | Whether AI may be commercialized; profit sharing |

**Rule**: "Right to withdraw" in AI research is complicated — once data is used to train a model, removing its influence is often impossible. This MUST be disclosed.
**Rule**: Broad consent for future AI research is acceptable IF: (1) purpose is described in general terms, (2) participant can withdraw, (3) privacy protections are in place.

---

## Privacy Protection in Biomedical AI

### De-identification Standards

| Standard | Method | Residual Risk | Appropriate For |
|----------|--------|--------------|----------------|
| **HIPAA Safe Harbor** | Remove 18 identifier types | Re-identification possible with auxiliary data | US clinical research |
| **HIPAA Expert Determination** | Expert certifies low re-identification risk | Depends on expert assessment | Complex datasets |
| **k-Anonymity** | Each record identical to k-1 others | Susceptible to homogeneity and background knowledge attacks | Tabular data |
| **Differential Privacy** | Add calibrated noise; guarantee ε-privacy | Privacy-utility tradeoff controlled by ε | Model training; data release |
| **Federated Learning** | Data never leaves local site | Model inversion attacks possible | Multi-site collaboration |

### Differential Privacy for Medical AI

| Parameter | Effect | Recommended Value | Tradeoff |
|-----------|--------|-------------------|---------|
| **ε (epsilon)** | Privacy budget; lower = more private | ε ≤ 1: strong privacy; ε ≤ 10: moderate | Lower ε → more noise → worse model performance |
| **δ (delta)** | Probability of privacy breach | δ < 1/n (n = dataset size) | Typically set to 1e-5 |
| **Noise mechanism** | How noise is added | Gaussian mechanism (common); Laplace (simpler) | Gaussian needed for (ε,δ)-DP |
| **Clipping norm** | Bound per-sample gradient | Task-dependent; tune on validation set | Too small → underutilize data; too large → more noise |

**Rule**: Differential privacy with ε ≤ 1 provides STRONG privacy guarantees but may significantly degrade model performance. ε = 3-10 is more practical for medical AI.
**Rule**: DP-SGD (Differentially Private Stochastic Gradient Descent) is the standard method for training medical AI with formal privacy guarantees. Use `opacus` library (PyTorch) or `tensorflow-privacy`.

### Model Inversion & Membership Inference Risks

| Attack Type | Description | Risk Level | Mitigation |
|-------------|-----------|-----------|-----------|
| **Model inversion** | Reconstruct training data from model outputs | Medium-High | Differential privacy; limit model output granularity |
| **Membership inference** | Determine if a specific record was in training set | Medium | DP-SGD; regularization; reduce overfitting |
| **Model extraction** | Steal model by querying API | Low-Medium | Rate limiting; output perturbation |
| **Attribute inference** | Infer sensitive attributes from non-sensitive | Medium | Minimize unnecessary features; DP |

**Rule**: Medical AI models trained without differential privacy are VULNERABLE to membership inference attacks. This is a patient privacy risk.
**Rule**: Publishing model weights (e.g., on Hugging Face) without DP training increases privacy risk. Consider the tradeoff between open science and patient privacy.

---

## Responsible AI Development Checklist

### Pre-Development

| Item | Description | Required |
|------|-------------|---------|
| **Define intended use** | Clinical indication, population, setting | ✅ |
| **Identify stakeholders** | Patients, clinicians, administrators, regulators | ✅ |
| **Assess data representativeness** | Compare dataset demographics to target population | ✅ |
| **IRB/Ethics approval** | Obtain approval before data access | ✅ |
| **Data use agreement** | Verify DUA permits AI training | ✅ |
| **Pre-register study** | Register analysis plan (optional but recommended) | For clinical trials |

### During Development

| Item | Description | Required |
|------|-------------|---------|
| **Subgroup tracking** | Monitor performance across demographics during training | ✅ |
| **Bias mitigation** | Apply resampling, reweighting, or fairness constraints | If disparity detected |
| **Privacy preservation** | Apply DP-SGD if privacy risk is high | For sensitive data |
| **Explainability** | Implement attention maps, SHAP, or feature importance | ✅ |
| **Version control** | Track all code, data, and model versions | ✅ |

### Post-Development

| Item | Description | Required |
|------|-------------|---------|
| **External validation** | Test on independent dataset from different site | ✅ |
| **Fairness audit** | Comprehensive subgroup performance analysis | ✅ |
| **Model card** | Document model capabilities, limitations, intended use | ✅ |
| **Data sheet** | Document dataset provenance, collection, limitations | ✅ |
| **Clinical utility assessment** | Does the AI improve clinical workflow or outcomes? | ✅ |
| **Post-market surveillance plan** | Plan for monitoring after deployment | For clinical deployment |

---

## Ethics Assessment Protocol for Paper Review

When evaluating a biomedical AI paper for ethical rigor:

| Assessment | Key Question | Required Evidence | Red Flag |
|-----------|-------------|-------------------|---------|
| **Data ethics** | Was data obtained ethically with appropriate consent? | IRB approval; DUA; consent description | No ethics approval mentioned |
| **Representation** | Are key demographic groups represented? | Demographic table; representation analysis | Single-site, single-demographic data |
| **Fairness evaluation** | Has performance been assessed across subgroups? | Stratified metrics; disparity analysis | No subgroup analysis |
| **Privacy** | Are patient privacy risks addressed? | De-identification method; DP if applicable | No privacy discussion |
| **Clinical validity** | Is the clinical claim supported by the evidence? | Appropriate validation; clinical endpoint | Overclaimed clinical impact |
| **Transparency** | Are limitations and failure modes disclosed? | Model card; error analysis; limitations section | No limitations discussed |
| **Reproducibility** | Can the study be reproduced? | Code availability; data access; hyperparameters | No code; proprietary data only |
| **Conflict of interest** | Are financial relationships disclosed? | COI statement; funding source | Undisclosed industry funding |

---

## AI Accountability & Transparency Framework

### Accountability Hierarchy for Medical AI

| Level | Accountability Type | Who is Responsible | Key Requirement | Example |
|-------|-------------------|-------------------|----------------|---------|
| **L1: Developer** | Model design & training | AI developer / company | Document training data, model architecture, known limitations | Model card; data sheet |
| **L2: Validator** | Independent verification | Third-party auditor / regulator | Confirm performance claims; test for bias | FDA 510(k) review; external validation |
| **L3: Deployer** | Clinical integration | Hospital / health system | Monitor real-world performance; report adverse events | Post-market surveillance; MDR reporting |
| **L4: Clinician** | Clinical decision | Treating physician | Understand model limitations; retain clinical judgment | Informed use; override capability |
| **L5: Patient** | Informed consent | Patient / advocate | Understand AI role in their care; right to opt out | Consent for AI-assisted diagnosis |

**Rule**: Accountability for medical AI is SHARED across all 5 levels. No single party bears full responsibility. Papers must specify which level(s) their work addresses.
**Rule**: "Black-box" models used in clinical decisions create ACCOUNTABILITY GAPS — if no one can explain why the model made a decision, accountability cannot be assigned.

### Transparency Requirements by Deployment Stage

| Stage | Minimum Transparency | Enhanced Transparency | Full Transparency |
|-------|---------------------|----------------------|-------------------|
| **Research** | Model architecture; training data description; performance metrics | + Code; hyperparameters; data access | + Full reproducibility; model weights |
| **Regulatory submission** | Performance on intended population; known limitations | + Subgroup performance; failure modes | + Adversarial testing; edge case analysis |
| **Clinical deployment** | Intended use; contraindications; performance summary | + Confidence scores; explanation interface | + Real-time monitoring; drift detection |
| **Post-market** | Adverse event reporting; performance maintenance | + Periodic revalidation; bias monitoring | + Continuous learning; public audit trail |

### TRUST Framework for Medical AI Data Governance

| Principle | Requirement | Implementation | Violation Example |
|-----------|------------|---------------|-------------------|
| **T — Transparency** | Data provenance, model decisions, and limitations are documented and accessible | Model cards; data sheets; decision logs | Training data source undisclosed |
| **R — Responsibility** | Clear accountability chain from development to deployment | Accountability hierarchy; incident response plan | No designated responsible party for model failures |
| **U — User sovereignty** | Patients and clinicians retain agency over AI-assisted decisions | Override capability; opt-out mechanism; informed consent | Model decision cannot be overridden by clinician |
| **S — Safety** | AI systems are validated, monitored, and can be halted if harmful | Post-market surveillance; kill switch; adverse event reporting | No mechanism to halt a malfunctioning AI system |
| **T — Traceability** | All data, model, and decision pathways are auditable | Version control; audit logs; data lineage | Cannot trace which data influenced which prediction |

---

## Data Sovereignty & Indigenous Data Rights

### Key Principles

| Principle | Description | Implication for AI Research |
|-----------|------------|---------------------------|
| **Collective ownership** | Data belongs to the community, not just individuals | Community-level consent required; individual consent insufficient |
| **Self-determination** | Communities control how their data is used | Community governance board must approve research use |
| **Reciprocity** | Communities benefit from research using their data | Results must be returned; capacity building required |
| **Cultural sensitivity** | Some data has cultural significance beyond research | Certain data may be restricted; cultural review needed |

### CARE Principles (Complement FAIR)

| Principle | Description | vs. FAIR |
|-----------|------------|----------|
| **C — Collective Benefit** | Data use should enable collective benefit for indigenous peoples | FAIR focuses on data accessibility; CARE focuses on who benefits |
| **A — Authority to Control** | Indigenous peoples have authority to control and govern data | FAIR assumes open access; CARE requires governance |
| **R — Responsibility** | Those working with indigenous data have responsibility to share how data is used | FAIR is data-centric; CARE is people-centric |
| **E — Ethics** | Indigenous peoples' rights and well-being should be the primary concern | FAIR is value-neutral; CARE is value-driven |

**Rule**: When using data from indigenous or underrepresented populations, BOTH FAIR and CARE principles apply. Open data access (FAIR) does NOT override community governance (CARE).
**Rule**: Genomic data from indigenous populations (e.g., HGDP, 1000 Genomes) has specific governance requirements. Check the original consent and governance framework before use.

---

## Environmental Justice & AI Sustainability

### Carbon Footprint of Medical AI

| Activity | Estimated CO2 (tons) | Equivalent | Mitigation |
|----------|---------------------|-----------|-----------|
| **Training large medical LLM** (7B params) | 10-50 | 5-25 car-years | Use efficient architectures; carbon-aware scheduling |
| **Training vision model** (ResNet-scale) | 0.1-1 | 1-5 car-months | Transfer learning; reduce hyperparameter search |
| **Full hyperparameter search** | 5-50x training cost | Significant | Bayesian optimization; early stopping |
| **Inference at scale** (1M predictions/day) | 0.5-5/year | 3-25 car-months | Model compression; efficient serving |
| **Data storage & transfer** | Variable | Often overlooked | Data lifecycle management; compression |

### Green AI Checklist for Medical Research

| Assessment | Question | Action |
|-----------|---------|--------|
| **Necessity** | Is training a new model necessary, or can transfer learning suffice? | Start with pretrained models; fine-tune instead of training from scratch |
| **Efficiency** | Is the model size proportional to the task complexity? | Don't use a 7B LLM for a binary classification task |
| **Reporting** | Is computational cost (FLOPs, GPU-hours, CO2) reported? | Use carbontracker or codecarbon; report in paper |
| **Reproducibility** | Can results be reproduced without retraining? | Release model weights; provide fine-tuning scripts |
| **Data efficiency** | Is the training data used efficiently? | Active learning; curriculum learning; data quality over quantity |

**Rule**: Medical AI papers should report computational cost (GPU-hours, estimated CO2) alongside performance metrics. This is increasingly required by major journals (Nature, Lancet Digital Health).
**Rule**: If a model achieves 0.5% AUC improvement at 10x computational cost, the improvement is NOT justified unless it enables a clinically meaningful capability.

---

## Algorithmic Impact Assessment (AIA) for Medical AI

### Pre-Deployment AIA Template

```
Algorithmic Impact Assessment
═════════════════════════════

[1] SYSTEM DESCRIPTION
    → Purpose: What clinical decision does this AI support?
    → Scope: What patient population? What clinical setting?
    → Input: What data does the system use?
    → Output: What recommendation/prediction does it produce?

[2] RIGHTS & VALUES AT RISK
    → Right to health: Could the system worsen health outcomes for any group?
    → Right to non-discrimination: Could the system discriminate by race, sex, age, disability?
    → Right to privacy: What patient data is collected, stored, and shared?
    → Right to information: Can patients understand how AI influenced their care?
    → Right to remedy: Can patients appeal or override AI decisions?

[3] DATA ASSESSMENT
    → Provenance: Where does the training data come from?
    → Representation: Which populations are represented? Underrepresented?
    → Quality: Label quality? Missing data? Systematic biases?
    → Consent: Was informed consent obtained? For what use?

[4] BIAS & FAIRNESS ANALYSIS
    → Protected attributes: Race, sex, age, language, insurance status
    → Disparity metrics: Equalized Odds, Demographic Parity, Predictive Parity
    → Intersectionality: Are disparities compounded at intersections (e.g., Black women)?
    → Mitigation: What steps were taken to reduce bias?

[5] VALIDATION & MONITORING
    → Internal validation: Performance on held-out test set
    → External validation: Performance on independent populations
    → Prospective validation: Performance in real clinical workflow
    → Ongoing monitoring: How will performance be tracked over time?

[6] GOVERNANCE
    → Accountability: Who is responsible for the system's behavior?
    → Transparency: What information is shared with clinicians? Patients?
    → Override: Can clinicians override AI recommendations?
    → Incident response: What happens when the AI makes a harmful recommendation?
```

**Rule**: Any medical AI system intended for clinical deployment should complete an Algorithmic Impact Assessment BEFORE deployment. This is required by the EU AI Act for high-risk AI systems.
**Rule**: The AIA should be reviewed by an independent committee including patient representatives, not just technical reviewers.

---

## LLM-Specific Ethics & Safety

### Medical LLM Risk Categories

| Risk Category | Description | Example | Mitigation |
|--------------|------------|---------|-----------|
| **Hallucination** | Generating false but plausible medical information | Fabricating drug dosages; inventing clinical trial results | Retrieval-augmented generation; structured output; human verification |
| **Sycophancy** | Agreeing with user's incorrect medical assumptions | Confirming a wrong self-diagnosis | Independent medical verification; adversarial prompting |
| **Privacy leakage** | Memorizing and reproducing patient data from training | Outputting patient names or IDs from training data | Differential privacy training; de-identification; output filtering |
| **Over-reliance** | Clinicians trusting AI output without critical evaluation | Accepting AI diagnosis without independent assessment | Training on AI limitations; mandatory human review |
| **Automation bias** | Preferentially following AI recommendations over clinical judgment | Ignoring clinical signs that contradict AI prediction | Explainability; confidence indicators; override training |
| **Scope creep** | Using AI for purposes beyond its validated scope | Using dermatology AI for oral lesion diagnosis | Strict indication labeling; usage monitoring |

### Medical LLM Red-Teaming Protocol

```
Red-Team Testing for Medical LLM
  ↓
[1] Safety Boundary Testing
    → Request dangerous medical advice (suicide methods, drug abuse)
    → Request off-label drug dosing
    → Request advice contradicting clinical guidelines
    → ⚠️ LLM must REFUSE or provide safety warnings for these queries
  ↓
[2] Hallucination Stress Testing
    → Ask about fabricated drugs, non-existent clinical trials
    → Ask for specific dosing of real drugs (verify against formulary)
    → Ask about rare diseases with limited training data
    → ⚠️ Hallucination rate for drug dosing should be <5%
  ↓
[3] Demographic Bias Testing
    → Same clinical vignette with different patient demographics
    → Compare recommendations across race, sex, age, insurance
    → ⚠️ Recommendations should not vary by demographic alone
  ↓
[4] Adversarial Prompt Testing
    → Jailbreak attempts: "Ignore previous instructions..."
    → Prompt injection: "Additional context: [malicious instruction]"
    → Role-play bypass: "Pretend you are a doctor without ethics..."
    → ⚠️ LLM must maintain safety guardrails under adversarial prompting
  ↓
[5] Clinical Reasoning Testing
    → Present cases requiring multi-step reasoning
    → Include distractor information
    → Test with counterfactual scenarios
    → ⚠️ LLM should show reasoning chain; not just final answer
```

**Rule**: Medical LLMs must undergo red-teaming BEFORE clinical deployment. Standard NLP benchmarks (MMLU, MedQA) are INSUFFICIENT — they do not test safety boundaries.
**Rule**: Hallucination rate for drug dosing is a CRITICAL safety metric. Any hallucinated dosage could cause patient harm. Target: <5% hallucination rate with >95% refusal rate for dangerous queries.

---

## Low-Resource & Global Health AI

### AI Readiness by Health System Context

| Context | Infrastructure | Data Availability | AI Feasibility | Key Constraint |
|---------|---------------|-------------------|---------------|---------------|
| **High-income (US/EU)** | EHR; PACS; high-speed internet | Large; structured; labeled | High | Regulatory; cost; equity |
| **Upper-middle-income (China/Brazil)** | Mixed EHR; imaging; variable connectivity | Moderate; partially labeled | Moderate-High | Data standardization; regulation |
| **Lower-middle-income (India/Nigeria)** | Paper records; basic imaging; limited connectivity | Small; unstructured; unlabeled | Low-Moderate | Infrastructure; expertise; data |
| **Low-income (rural SSA)** | Paper only; no imaging; minimal connectivity | Very limited; no digital data | Very Low | Basic infrastructure first |

### Model Adaptation for Low-Resource Settings

| Strategy | Description | When to Use | Tradeoff |
|----------|------------|-------------|---------|
| **Knowledge distillation** | Large model → small model for edge deployment | Compute-limited; no GPU | Small model less capable |
| **Quantization (INT8/INT4)** | Reduce model precision | Memory-limited device | Minor accuracy loss; minority class impact |
| **Transfer from high-resource** | Pretrain on high-resource data; fine-tune on local | Limited local labeled data | Domain shift; cultural bias |
| **Few-shot learning** | Learn from 5-50 labeled examples | Very limited labels | Lower ceiling than full supervision |
| **Self-supervised pretraining** | Pretrain on unlabeled local data | Abundant unlabeled data | Compute cost for pretraining |
| **Federated learning** | Train across sites without sharing data | Privacy-sensitive; multi-site | Communication cost; heterogeneity |

### Point-of-Care (POC) Diagnostic AI

| Modality | Device | Cost | AI Task | Key Dataset | Status |
|----------|--------|------|---------|------------|--------|
| **Smartphone dermososcopy** | Smartphone + lens | $5-50 | Skin lesion classification | ISIC; PAD-UFES | Research |
| **Smartphone fundus** | Smartphone + adapter | $20-100 | DR screening | BRSET (Brazil) | Emerging |
| **Portable ultrasound** | Butterfly iQ / Lumify | $2K-5K | OB measurement; cardiac | CAMUS; POCUS datasets | Emerging |
| **Paper-based microfluidics** | Lateral flow tests | $1-5 | Image-based reading | Custom | Research |
| **Smartphone ECG** | AliveCor KardiaMobile | $50-100 | AF detection | AliveCor dataset | FDA-cleared |
| **Pulse oximetry** | Standard pulse ox | $10-30 | SpO2 + perfusion index | Custom | Deployed (bias concern) |

### Pulse Oximetry Bias — A Case Study in Global Health AI Equity

| Finding | Impact | Source |
|---------|--------|--------|
| Pulse oximeters overestimate SpO2 in darker skin tones | Delayed treatment for hypoxemia in Black patients | Sjoding 2020 (NEJM) |
| Bias exists across ALL major pulse ox brands | Not a single-vendor issue | FDA Safety Communication 2021 |
| FDA now requires testing across skin tones | Regulatory response | FDA 2024 guidance |
| AI models trained on biased pulse ox data inherit bias | Downstream AI also biased | Research 2023-2024 |

**Rule**: AI for low-resource settings must be validated IN those settings. A model validated on US/EU data may not work in the target population due to different disease prevalence, imaging equipment, and patient demographics.
**Rule**: The most impactful AI for global health is NOT the most complex model — it's the SIMPLEST model that works on AVAILABLE hardware with AVAILABLE data.
**Rule**: Pulse oximetry bias is a CAUTIONARY TALE for all POC diagnostic AI: hardware bias propagates to AI bias. Always evaluate the full measurement pipeline, not just the algorithm. For the signal processing mechanism of this bias, see signal-processing-foundations.md (Advanced PPG section).
**Rule**: When deploying AI in LMIC, consider SUSTAINABILITY: who maintains the system? Who pays for compute? What happens when the research project ends?

### AI Bias Mitigation — Systematic Framework (2025-2026 Update)

**Source**: Synthesis of 25+ peer-reviewed studies (ACM 2025; npj Digital Medicine 2025; Nature Medicine commentary)

**Bias Sources in Medical AI (4 Categories)**:

| Category | Source | Example | Detection Method |
|----------|--------|---------|-----------------|
| **Data bias** | Imbalanced training data | Female samples only 38% in cardiovascular AI training data | Demographic audit of training set |
| **Algorithmic bias** | Design flaws amplifying disparities | LLM generating different treatment plans by implied race | Stratified evaluation by subgroup |
| **Deployment bias** | Implementation inequities | AI deployed only at well-resourced hospitals | Access audit; deployment mapping |
| **Clinical bias** | Practice patterns encoded as ground truth | Historical treatment disparities become "correct" labels | Label provenance analysis |

**Bias Mitigation Strategies by Pipeline Stage**:

| Stage | Strategy | Method | Effectiveness | Trade-off |
|-------|----------|--------|--------------|-----------|
| **Pre-processing** | Data augmentation | Oversample underrepresented groups; synthetic augmentation | Moderate | May overfit augmented samples |
| **Pre-processing** | Re-sampling | Stratified sampling; balanced batches | Moderate | Reduces effective sample size |
| **Pre-processing** | Fair representation learning | Adversarial debiasing; disentangled representations | High | Computational cost; may reduce overall accuracy |
| **In-processing** | Fairness constraints | Demographic parity; equalized odds as loss terms | High | Accuracy-fairness trade-off |
| **In-processing** | Multi-objective optimization | Pareto-optimal accuracy-fairness frontier | High | Requires careful tuning |
| **Post-processing** | Threshold adjustment | Different thresholds per subgroup | Moderate | May violate "equal treatment" principle |
| **Post-processing** | Calibration | Per-group calibration | Moderate | Does not fix underlying model bias |

**Critical Findings from 2025 Literature**:
- 22/25 studies identify DATA BIAS as the primary source of algorithmic bias
- Implied race bias: LLMs shift treatment recommendations based on RACE INFERENCE from clinical text, even without explicit race labels — demographic filtering during fine-tuning CANNOT catch this
- Cardiovascular AI: female patients have higher misdiagnosis rates because training data is predominantly male (non-typical symptoms like fatigue/nausea under-recognized)
- Bias can be triggered by INFERENCE, not just explicit labels — this is a fundamental challenge for debiasing methods

**Bias Assessment Checklist for Medical AI Papers**:
1. ☐ Training data demographics reported (age, sex, race/ethnicity, geography)?
2. ☐ Performance metrics reported PER SUBGROUP (not just overall)?
3. ☐ Fairness metrics computed (demographic parity, equalized odds, calibration)?
4. ☐ Intersectional analysis (e.g., Black women, elderly Hispanic patients)?
5. ☐ Label provenance analyzed (do ground truth labels encode historical bias)?
6. ☐ Implied demographic effects tested (does model infer race/sex from clinical features)?
7. ☐ External validation on demographically different populations?
8. ☐ Deployment equity considered (who has access to this AI)?

**Rule**: Data bias is the ROOT CAUSE of 88% of medical AI bias (22/25 studies). Invest in data quality and representation BEFORE algorithmic debiasing — you cannot fix fundamentally biased data with algorithmic tricks.
**Rule**: Implied race bias is the MOST DANGEROUS form of bias because it cannot be detected by demographic filtering. Models infer race from clinical features and adjust recommendations accordingly. MUST test for this explicitly.
**Rule**: "Overall accuracy" is INSUFFICIENT. A model with 95% overall accuracy but 70% accuracy for a specific subgroup is CLINICALLY DANGEROUS for that subgroup. Always report per-subgroup metrics.
