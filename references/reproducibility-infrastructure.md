# Reproducibility Infrastructure for Biomedical AI

## Reproducibility Crisis in Biomedical AI

### Scope of the Problem

| Dimension                        | Issue                                    | Evidence                                              | Impact                                    |
| -------------------------------- | ---------------------------------------- | ----------------------------------------------------- | ----------------------------------------- |
| **Data reproducibility**         | Same data → different results            | Different preprocessing → different model performance | Most common failure mode                  |
| **Code reproducibility**         | Same code → different results            | GPU nondeterminism; library version differences       | Subtle but pervasive                      |
| **Experimental reproducibility** | Same experiment → different results      | Hyperparameter sensitivity; random seeds              | Results may not hold with different seeds |
| **Clinical reproducibility**     | Same model → different clinical outcomes | Population shift; deployment context                  | Most consequential failure mode           |

**Rule**: Reproducibility in biomedical AI is NOT optional — it is a prerequisite for clinical deployment and patient safety.
**Rule**: "We used PyTorch" without version number = NOT reproducible. "We used PyTorch 2.1.0 with CUDA 11.8 on NVIDIA A100" = reproducible.

---

## Reproducibility Stack

### Level 1: Environment Reproducibility

| Component            | Tool                    | Purpose                   | Configuration                           |
| -------------------- | ----------------------- | ------------------------- | --------------------------------------- |
| **Python version**   | pyenv / conda           | Lock Python version       | `python=3.10.x`                         |
| **Package versions** | pip freeze / conda lock | Exact dependency versions | `requirements.txt` or `environment.yml` |
| **CUDA version**     | CUDA toolkit            | GPU computation version   | `cuda=11.8` or `cuda=12.1`              |
| **GPU driver**       | NVIDIA driver           | Hardware interface        | `driver >= 525.x` for CUDA 12           |
| **OS**               | Docker / Singularity    | Complete OS environment   | Dockerfile with base image              |

**Docker Template for Medical AI**:

```dockerfile
FROM pytorch/pytorch:2.1.0-cuda11.8-cudnn8-runtime

RUN pip install --no-cache-dir \
    monai==1.3.0 \
    wfdb==4.1.2 \
    scipy==1.11.4 \
    scikit-learn==1.3.2 \
    pandas==2.1.4 \
    nibabel==5.1.0 \
    pydicom==2.4.3 \
    opencv-python-headless==4.9.0.80 \
    matplotlib==3.8.2 \
    seaborn==0.13.0

ENV PYTHONHASHSEED=42
ENV CUBLAS_WORKSPACE_CONFIG=:4096:8
```

**Rule**: `CUBLAS_WORKSPACE_CONFIG=:4096:8` is REQUIRED for CUDA deterministic operations. Without it, GPU operations are nondeterministic even with seeds set.

### Level 2: Code Reproducibility

| Practice                     | Implementation                             | Verification                                                 |
| ---------------------------- | ------------------------------------------ | ------------------------------------------------------------ |
| **Version control**          | Git with semantic versioning               | `git tag v1.0.0` for each experiment                         |
| **Deterministic training**   | Set all random seeds                       | `torch.manual_seed(42); np.random.seed(42); random.seed(42)` |
| **Deterministic CUDA**       | `torch.use_deterministic_algorithms(True)` | May reduce performance; required for exact reproducibility   |
| **Configuration management** | Hydra / argparse + YAML configs            | Save config with each run                                    |
| **Experiment tracking**      | Weights & Biases / MLflow / Neptune        | Log all hyperparameters, metrics, artifacts                  |
| **Code review**              | PR review before merging                   | Prevent subtle bugs that affect reproducibility              |

**Deterministic Training Setup**:

```python
import torch
import numpy as np
import random
import os

def set_seed(seed=42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    os.environ['PYTHONHASHSEED'] = str(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False
    torch.use_deterministic_algorithms(True, warn_only=True)
```

**Rule**: `torch.backends.cudnn.benchmark = False` is REQUIRED for deterministic CNN training. Benchmark=True selects fastest algorithm but may be nondeterministic.
**Rule**: Some PyTorch operations have NO deterministic implementation (e.g., `torch.interpolate` with some modes). Use `warn_only=True` to catch these.

### Level 3: Data Reproducibility

| Practice                   | Implementation                      | Verification                          |
| -------------------------- | ----------------------------------- | ------------------------------------- |
| **Data versioning**        | DVC / Git LFS / SHA256 checksums    | Verify data integrity before each run |
| **Preprocessing pipeline** | Fixed pipeline with versioned code  | Same preprocessing → same features    |
| **Train/val/test split**   | Fixed random seed for splitting     | Same split → comparable results       |
| **Data provenance**        | Document data source, version, date | Trace any result back to source data  |
| **Feature store**          | Centralized feature computation     | Same features → same model inputs     |

**Data Splitting Protocol**:

```
⚠️ CRITICAL: Data splitting is the #1 source of irreproducibility in medical AI

Patient-wise splitting (REQUIRED for medical AI):
  → Split by patient_id, NOT by sample/image
  → Same patient's data must NOT appear in both train and test
  → Leakage detection: check that no patient_id appears in multiple sets

Temporal splitting (for prospective evaluation):
  → Train on data before date X; test on data after date X
  → More realistic than random splitting
  → Required for clinical deployment claims

Site-wise splitting (for external validation):
  → Train on site A; test on site B
  → Most rigorous evaluation of generalization
  → Required for multi-site deployment claims

Stratified splitting:
  → Ensure class balance across splits
  → Ensure demographic balance across splits
  → Use sklearn.model_selection.StratifiedGroupKFold
  → Group = patient_id; Stratify = label
```

**Rule**: NEVER use random train/test split without grouping by patient. This causes data leakage and inflated performance.
**Rule**: Report the exact splitting strategy, random seed, and library version used for splitting. Different sklearn versions may produce different splits.

### Level 4: Model Reproducibility

| Practice                       | Implementation                        | Verification                      |
| ------------------------------ | ------------------------------------- | --------------------------------- |
| **Model checkpointing**        | Save model at best epoch + last epoch | Load and verify on test set       |
| **Model architecture logging** | `print(model)` or `torchsummary`      | Verify architecture matches paper |
| **Training curve logging**     | Log train/val loss per epoch          | Verify convergence behavior       |
| **Hyperparameter logging**     | Log ALL hyperparameters               | Verify matches paper description  |
| **Ensemble reproducibility**   | Fix seed for each ensemble member     | Same seeds → same ensemble        |

---

## Reporting Standards

### TRIPOD+AI Statement (2024)

| Section                 | Item    | Description                                               | Common Failure                                |
| ----------------------- | ------- | --------------------------------------------------------- | --------------------------------------------- |
| **Title/Abstract**      | 1a, 1b  | Identify as AI/ML; describe model and clinical use        | Generic title; no clinical context            |
| **Background**          | 2a, 2b  | Medical context; rationale for AI approach                | No justification for AI over existing methods |
| **Objectives**          | 3       | Specific objectives; intended use                         | Vague objectives ("improve diagnosis")        |
| **Data sources**        | 4a, 4b  | Databases; eligibility criteria                           | No inclusion/exclusion criteria               |
| **Participants**        | 5a-5c   | Participant flow; demographic details; sample size        | No CONSORT flow diagram                       |
| **Outcome**             | 6       | Define outcome clearly; time frame                        | Ambiguous outcome definition                  |
| **Predictors**          | 7       | All input features described                              | "We used all available features"              |
| **Sample size**         | 8       | Justification for sample size                             | No power calculation                          |
| **Missing data**        | 9       | How missing data handled                                  | Complete case analysis without justification  |
| **Data preparation**    | 10a-10c | Preprocessing; feature selection; class imbalance         | No preprocessing details                      |
| **Model development**   | 11a-11e | Algorithm; hyperparameters; training; internal validation | "We used deep learning" without details       |
| **Model evaluation**    | 12a-12d | Performance metrics; calibration; subgroup analysis       | AUC only; no calibration or subgroup          |
| **External validation** | 13a-13c | External dataset; performance; comparison                 | No external validation                        |
| **Interpretation**      | 14a-14f | Results in context; clinical utility; limitations         | Overclaimed clinical impact                   |
| **Implications**        | 15      | Clinical implementation; future research                  | No implementation considerations              |

### Model Card Template

```markdown
## Model Card: [Model Name]

### Basic Information

- **Model type**: [e.g., 3D U-Net for organ segmentation]
- **Intended use**: [e.g., Liver segmentation on contrast-enhanced CT]
- **Out-of-scope use**: [e.g., Non-contrast CT, other organs, pediatric patients]
- **Developed by**: [Team/institution]
- **Model date**: [YYYY-MM]
- **Model version**: [v1.0.0]

### Training Data

- **Dataset**: [e.g., LiTS (Liver Tumor Segmentation Challenge)]
- **Size**: [e.g., 131 training CT scans]
- **Population**: [e.g., Adult patients with suspected liver tumors; European hospital]
- **Demographics**: [e.g., Age: 18-85; 60% male; ethnicity not reported]
- **Preprocessing**: [e.g., Resampled to 1mm isotropic; clipped to [-200, 400] HU]

### Performance

- **Internal validation**: Dice = 0.96 ± 0.03 (liver)
- **External validation**: Dice = 0.92 ± 0.05 (on 3D-IRCADb)
- **Subgroup performance**:
  - Male: Dice = 0.96; Female: Dice = 0.95
  - Age <60: Dice = 0.96; Age ≥60: Dice = 0.94
- **Failure modes**: Poor performance on cirrhotic livers (Dice <0.85)

### Limitations

- Trained only on contrast-enhanced CT
- Limited diversity in training population
- Not validated on pediatric patients
- Performance degrades with severe liver pathology

### Ethical Considerations

- Training data from single geographic region
- No pediatric representation
- Potential for disparate performance across ethnic groups
```

### Data Sheet Template

```markdown
## Data Sheet: [Dataset Name]

### Motivation

- **Purpose**: Why was this dataset created?
- **Creator**: Who created the dataset?
- **Funding**: Who funded the creation?

### Composition

- **Instances**: What does each instance represent?
- **Size**: How many instances?
- **Labels**: Is there a label/target associated with each instance?
- **Missing data**: Is any information missing?
- **Confidential data**: Does the dataset contain confidential data?

### Collection Process

- **Methodology**: How was the data collected?
- **Sampling strategy**: Was sampling random, stratified, convenience?
- **Demographics**: What population does the data represent?
- **Time period**: When was the data collected?
- **Ethics review**: Was there IRB/ethics approval?

### Preprocessing/Cleaning

- **Preprocessing**: What preprocessing was applied?
- **Raw data**: Is raw data available?
- **Software**: What software was used for preprocessing?

### Uses

- **Intended use**: What tasks is this dataset suitable for?
- **Out-of-scope use**: What tasks should this dataset NOT be used for?
- **Known issues**: Are there known biases or limitations?

### Distribution

- **Access**: How can the dataset be accessed?
- **License**: Under what license is it distributed?
- **DUA**: Is a data use agreement required?
```

---

## Experiment Management

### Experiment Tracking Comparison

| Tool                 | Strengths                                                 | Weaknesses                               | Best For               |
| -------------------- | --------------------------------------------------------- | ---------------------------------------- | ---------------------- |
| **Weights & Biases** | Rich visualization; team collaboration; artifact tracking | Commercial; cost at scale                | Industry; large teams  |
| **MLflow**           | Open source; model registry; deployment                   | Less polished UI; self-hosted            | Academic; small teams  |
| **Neptune**          | Good collaboration; metadata management                   | Commercial                               | Medium teams           |
| **TensorBoard**      | Free; PyTorch/TensorFlow native                           | Limited collaboration; no model registry | Individual researchers |
| **Aim**              | Open source; fast; good comparison                        | Newer; smaller community                 | Individual researchers |

### Experiment Logging Protocol

| What to Log               | Format                          | When to Log              |
| ------------------------- | ------------------------------- | ------------------------ |
| **Hyperparameters**       | YAML/JSON config file           | Before training          |
| **Training metrics**      | Loss, accuracy per epoch        | Every epoch              |
| **Validation metrics**    | All evaluation metrics          | Every epoch              |
| **Best model checkpoint** | PyTorch `.pt` file              | When val metric improves |
| **Random seeds**          | All seeds used                  | Before training          |
| **Git commit hash**       | `git rev-parse HEAD`            | Before training          |
| **Environment**           | `pip freeze > requirements.txt` | Before training          |
| **GPU info**              | `nvidia-smi` output             | Before training          |
| **Data version**          | DVC commit or SHA256            | Before training          |
| **Final test results**    | All metrics on held-out test    | After training complete  |

---

## Reproducibility Assessment Protocol

When evaluating a biomedical AI paper for reproducibility:

| Dimension                     | Assessment                           | Required Evidence                          | Red Flag                                            |
| ----------------------------- | ------------------------------------ | ------------------------------------------ | --------------------------------------------------- |
| **Code availability**         | Is code publicly available?          | GitHub/GitLab link with README             | "Code available upon request"                       |
| **Data accessibility**        | Can the data be accessed?            | Public dataset link or DUA process         | Proprietary data with no access path                |
| **Environment specification** | Are all dependencies specified?      | requirements.txt; Dockerfile; CUDA version | "PyTorch" without version                           |
| **Random seed**               | Are seeds reported?                  | Seed values for all random sources         | No seed reported                                    |
| **Preprocessing details**     | Is preprocessing fully described?    | Step-by-step pipeline; code                | "Standard preprocessing"                            |
| **Train/test split**          | Is the split strategy described?     | Split method; seed; patient-level grouping | No split description; random split without grouping |
| **Hyperparameters**           | Are all hyperparameters reported?    | Complete hyperparameter table              | "Default hyperparameters"                           |
| **Model architecture**        | Is the architecture fully specified? | Architecture diagram or code               | "Modified ResNet" without details                   |
| **External validation**       | Is there external validation?        | Performance on independent dataset         | Internal validation only                            |
| **Statistical testing**       | Are results statistically tested?    | Confidence intervals; significance tests   | Point estimates only                                |

---

## MLOps for Medical AI

### Medical AI Lifecycle vs. Traditional Software

| Aspect         | Traditional Software       | Medical AI                                    | Implication                             |
| -------------- | -------------------------- | --------------------------------------------- | --------------------------------------- |
| **Testing**    | Deterministic; pass/fail   | Probabilistic; statistical                    | Need statistical process control        |
| **Deployment** | Feature flags; A/B testing | Clinical validation; regulatory approval      | Cannot A/B test on patients without IRB |
| **Monitoring** | Uptime; latency; errors    | Performance drift; fairness drift; data drift | Need medical-specific monitoring        |
| **Rollback**   | Revert to previous version | Revert requires regulatory consideration      | Rollback plan must be pre-approved      |
| **Updates**    | Continuous delivery        | Change control; revalidation                  | Each update may need new validation     |
| **Logging**    | Application logs           | Decision logs; audit trail; patient-level     | HIPAA-compliant logging required        |

### MLOps Maturity Levels for Medical AI

| Level  | Name      | Description                                                 | Regulatory Readiness | Example                                |
| ------ | --------- | ----------------------------------------------------------- | -------------------- | -------------------------------------- |
| **L0** | Manual    | Jupyter notebook → saved model → manual deployment          | Not ready            | Research prototype                     |
| **L1** | scripted  | Training script + config → automated evaluation             | Partially ready      | Scripted pipeline with version control |
| **L2** | Automated | CI/CD pipeline; automated testing; model registry           | Nearly ready         | Full pipeline with data validation     |
| **L3** | Monitored | + Drift detection; automated alerts; audit logging          | Ready for deployment | Production system with monitoring      |
| **L4** | Adaptive  | + Automated retraining triggers; human-in-the-loop approval | Production-grade     | Continuously learning with oversight   |

**Rule**: Medical AI intended for clinical use must be at L2+ before deployment. L0-L1 is acceptable for research only.
**Rule**: L4 (adaptive/continuously learning) systems require SPECIAL regulatory consideration. FDA currently requires pre-specified retraining protocols; uncontrolled continuous learning is NOT approved.

### Clinical MLOps Framework (2025-2026 Update)

**Source**: Clinical MLOps framework (PMC 2025); MedMLOps for radiology (PMC 2026); 80% healthcare AI pilot failure analysis

**4-Layer Clinical MLOps Architecture**:

| Layer                                | Component                                                  | Function                                | Key Requirement                                                         |
| ------------------------------------ | ---------------------------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------- |
| **1. Privacy-Preserving Deployment** | Federated inference; edge computing; de-identification     | Patient data never leaves clinical site | HIPAA/GDPR compliance at inference time                                 |
| **2. Clinical Observability**        | Performance dashboards; drift alerts; subgroup monitoring  | Detect degradation before patient harm  | Real-time monitoring with clinical thresholds                           |
| **3. Compliance Audit Trail**        | Decision logs; model versioning; data lineage              | Regulatory traceability                 | Every prediction traceable to model version + input data                |
| **4. Human-in-the-Loop Governance**  | Override mechanisms; escalation protocols; periodic review | Clinical safety net                     | Human review at predetermined intervals regardless of automated signals |

**Why 80% of Healthcare AI Pilots Never Reach Production**:

1. **Data engineering gap**: research uses clean datasets; production has messy, heterogeneous data
2. **Model drift**: performance degrades as patient populations and clinical practices change
3. **Workflow integration failure**: AI doesn't fit into existing clinical workflows
4. **Regulatory compliance burden**: moving from research to regulated deployment is expensive
5. **Organizational resistance**: clinicians don't trust or adopt AI tools
6. **Sustainability**: no maintenance plan after research project ends

**Clinical AI Deployment Checklist**:

1. ☐ Data pipeline: production data quality matches training data quality?
2. ☐ Drift monitoring: real-time performance tracking with clinical thresholds?
3. ☐ Fairness monitoring: subgroup performance tracking over time?
4. ☐ Workflow integration: AI fits into existing clinical workflow without disruption?
5. ☐ Alert fatigue: AI alerts are actionable and not excessive?
6. ☐ Override mechanism: clinicians can override AI recommendations?
7. ☐ Audit trail: every AI decision is logged with model version and input data?
8. ☐ Rollback plan: can revert to previous model version safely?
9. ☐ Regulatory compliance: FDA/EU AI Act requirements met?
10. ☐ Sustainability: funding and personnel for ongoing maintenance?

**Rule**: Clinical MLOps is NOT optional — it is the difference between a research prototype and a clinical tool. 80% of healthcare AI pilots fail because they treat deployment as an afterthought.
**Rule**: Privacy-preserving deployment (Layer 1) must be designed FROM THE START, not retrofitted. Federated inference and edge computing require architectural decisions during model design.
**Rule**: Human-in-the-loop governance (Layer 4) must include PERIODIC REVIEW regardless of automated monitoring signals. Automated systems can miss subtle degradation patterns that clinicians would notice.

---

## Model Drift Detection & Monitoring

### Types of Drift in Medical AI

| Drift Type            | Definition                           | Detection Method                               | Clinical Impact                                  | Example                                   |
| --------------------- | ------------------------------------ | ---------------------------------------------- | ------------------------------------------------ | ----------------------------------------- |
| **Data drift**        | Input distribution changes           | KS test; PSI; MMD                              | Model may be operating outside validated range   | New patient population; different scanner |
| **Concept drift**     | P(Y\|X) relationship changes         | Performance monitoring; residual analysis      | Model predictions become systematically wrong    | New treatment protocol changes outcomes   |
| **Label drift**       | Ground truth definition changes      | Label distribution monitoring; clinical review | Training labels no longer match current practice | ICD code updates; new diagnostic criteria |
| **Performance drift** | Overall model performance degrades   | Rolling AUC; calibration monitoring            | Patient harm if undetected                       | COVID changing chest X-ray patterns       |
| **Fairness drift**    | Performance gap across groups widens | Stratified performance monitoring              | Disparate impact on protected groups             | New demographic in patient population     |

### Drift Detection Protocol

```
Deployed Medical AI Model
  ↓
[1] Continuous Data Monitoring (Real-time)
    → Input feature distribution: PSI <0.1 (stable); 0.1-0.2 (moderate); >0.2 (significant drift)
    → Prediction distribution: compare to baseline
    → ⚠️ If PSI >0.2, trigger IMMEDIATE investigation
  ↓
[2] Periodic Performance Monitoring (Weekly/Monthly)
    → Rolling AUC on labeled subset (if available)
    → Calibration: Hosmer-Lemeshaw test; calibration plots
    → ⚠️ If AUC drops >0.05 from baseline, trigger revalidation
  ↓
[3] Fairness Monitoring (Monthly)
    → Stratified performance by race, sex, age, insurance
    → Disparity metrics: Equalized Odds difference
    → ⚠️ If disparity widens >2x from baseline, trigger fairness audit
  ↓
[4] Clinical Outcome Monitoring (Quarterly)
    → Compare AI-assisted vs. non-AI-assisted outcomes
    → Adverse event rate related to AI recommendations
    → ⚠️ If AI-assisted outcomes worsen, trigger clinical review
  ↓
[5] Drift Response Protocol
    → Level 1 (Minor): Document; increase monitoring frequency
    → Level 2 (Moderate): Alert clinical team; add disclaimer
    → Level 3 (Significant): Suspend AI; initiate revalidation
    → Level 4 (Critical): Withdraw AI; notify regulator; incident report
```

**Rule**: Medical AI models MUST have drift monitoring from day 1 of deployment. "Deploy and forget" is UNACCEPTABLE for patient-facing AI.
**Rule**: PSI (Population Stability Index) is the standard metric for data drift. PSI >0.2 = significant drift requiring investigation. PSI >0.25 = model should be retrained or withdrawn.

### Monitoring Dashboard Requirements

| Metric                 | Frequency                     | Alert Threshold                        | Action                             |
| ---------------------- | ----------------------------- | -------------------------------------- | ---------------------------------- |
| **Prediction volume**  | Daily                         | <50% or >200% of baseline              | Check for data pipeline issues     |
| **Input feature PSI**  | Weekly                        | >0.1 (warning); >0.2 (critical)        | Investigate data source changes    |
| **Rolling AUC**        | Monthly (if labels available) | Drop >0.03 (warning); >0.05 (critical) | Revalidation required              |
| **Calibration slope**  | Monthly                       | Deviation >0.1 from ideal (1.0)        | Recalibration or retraining        |
| **Fairness disparity** | Monthly                       | Equalized Odds diff >0.05              | Fairness audit required            |
| **Adverse events**     | Continuous                    | Any AI-related adverse event           | Immediate clinical review          |
| **Override rate**      | Weekly                        | >30% override rate                     | Clinician trust issue; investigate |

---

## Model Versioning & Governance

### Version Control for Medical AI Models

```
Model Version: v2.3.1
│
├─ MAJOR (2): Architecture change or new training data
│   → Requires full revalidation; new regulatory submission
│   → Example: Changed from ResNet to ViT backbone
│
├─ MINOR (3): Hyperparameter update; data augmentation change
│   → Requires abbreviated revalidation; document change
│   → Example: Adjusted learning rate schedule; added mixup
│
└─ PATCH (1): Bug fix; inference optimization
    → Requires regression testing only
    → Example: Fixed preprocessing bug; optimized ONNX export
```

### Model Registry Requirements

| Field                 | Description                      | Required            | Example                                        |
| --------------------- | -------------------------------- | ------------------- | ---------------------------------------------- |
| **Model ID**          | Unique identifier                | Yes                 | cardio-ai-v2.3.1                               |
| **Training data**     | Dataset(s) + version + date      | Yes                 | MIMIC-IV v2.2 (2024-01-15)                     |
| **Architecture**      | Model type + key hyperparameters | Yes                 | ViT-B/16; lr=3e-4; epochs=100                  |
| **Performance**       | Primary + subgroup metrics       | Yes                 | AUC=0.89 (overall); 0.87 (Black); 0.91 (White) |
| **Validation**        | Internal + external sites        | Yes                 | Internal: MIMIC-IV; External: eICU             |
| **Regulatory status** | FDA/CE mark status               | For deployed models | FDA 510(k) K234567                             |
| **Known limitations** | Documented failure modes         | Yes                 | Poor performance on pediatric patients         |
| **Drift status**      | Current monitoring status        | For deployed models | Stable (PSI=0.05); last checked 2025-04-28     |
| **Predecessor**       | Previous model version           | Yes                 | cardio-ai-v2.2.0                               |
| **Changelog**         | What changed and why             | Yes                 | Added 5K new training samples from site B      |

### Change Control Protocol

```
Proposed Model Change
  ↓
[1] Classify Change
    → Major: Full revalidation + regulatory review
    → Minor: Abbreviated revalidation + documentation
    → Patch: Regression testing only
  ↓
[2] Impact Assessment
    → Which patient populations are affected?
    → Does performance change on any subgroup?
    → Does the change affect regulatory compliance?
  ↓
[3] Validation
    → Major: Full validation suite (internal + external + fairness)
    → Minor: Targeted validation on affected components
    → Patch: Regression test on held-out test set
  ↓
[4] Approval
    → Major: Clinical review board + regulatory (if required)
    → Minor: Technical lead + clinical champion
    → Patch: Technical lead
  ↓
[5] Deployment
    → Shadow mode first (parallel run; no clinical impact)
    → Canary deployment (small fraction of predictions)
    → Full deployment (with monitoring)
  ↓
[6] Post-Deployment Monitoring
    → Intensified monitoring for 2 weeks
    → Compare shadow vs. production performance
    → Document outcomes
```

**Rule**: ANY change to a deployed medical AI model must go through change control. "Hot-fixing" a production medical AI without validation is a regulatory violation.
**Rule**: Shadow mode deployment (running new model alongside old model without affecting clinical decisions) is MANDATORY before any model update goes live.

---

## Data Versioning & Lineage

### Data Versioning Strategy

| Tool           | Best For            | Key Feature                                     | Medical AI Suitability             |
| -------------- | ------------------- | ----------------------------------------------- | ---------------------------------- |
| **DVC**        | ML datasets         | Git-like versioning; tracks data alongside code | Good; integrates with ML pipelines |
| **LakeFS**     | Data lakes          | Branch, merge, revert on data lakes             | Good for large-scale medical data  |
| **Delta Lake** | Tabular data        | ACID transactions; time travel                  | Good for EHR/structured data       |
| **MLflow**     | Experiment tracking | Tracks data + model + metrics together          | Good; end-to-end tracking          |

### Data Lineage Requirements for Medical AI

```
Patient Data → De-identification → Feature Extraction → Training Set
     │                │                    │                │
     │                │                    │                ├─ Version: train_v2.3
     │                │                    │                ├─ N=50,000 patients
     │                │                    │                └─ Date: 2025-01-15
     │                │                    │
     │                │                    ├─ Pipeline version: feat_ext_v1.2
     │                │                    └─ Code: github.com/org/feat_ext@abc123
     │                │
     │                ├─ Method: Safe Harbor
     │                └─ Verified: 2024-12-01
     │
     ├─ Source: MIMIC-IV v2.2
     └─ DUA: PhysioNet Credentialed Access
```

**Rule**: For any medical AI model, you must be able to trace EVERY prediction back to: (1) which training data was used, (2) which preprocessing pipeline, (3) which model version, (4) which data version. This is required for audit and incident investigation.
**Rule**: Data lineage is NOT optional for medical AI. If you cannot reproduce the exact data pipeline that produced a model, you cannot investigate failures or validate updates.

## AI Deployment & Implementation Science

### The Deployment Gap — From Research to Clinical Practice

| Stage                      | Success Rate                 | Key Barrier                                  | Time to Complete |
| -------------------------- | ---------------------------- | -------------------------------------------- | ---------------- |
| **Research (publication)** | ~100% (of completed studies) | Publication bias; selective reporting        | 1-3 years        |
| **Regulatory clearance**   | ~30-50% (of submitted)       | Evidence sufficiency; clinical validation    | 1-3 years        |
| **Clinical deployment**    | ~10-20% (of cleared)         | Workflow integration; clinician adoption     | 1-2 years        |
| **Sustained use**          | ~5-10% (of deployed)         | Alert fatigue; model drift; maintenance cost | Ongoing          |

```
⚠️ THE DEPLOYMENT GAP:
- 96% of medical AI publications NEVER reach clinical deployment
- Of those that deploy, most are ABANDONED within 2 years
- The #1 reason for abandonment is NOT technical failure — it's WORKFLOW MISFIT
- A model that requires extra clicks, adds alerts, or slows down clinicians will be BYPASSED
- The #2 reason is LACK OF MAINTENANCE — models drift, and no one is funded to maintain them
```

### Implementation Science Framework for Medical AI

```
Pre-Deployment Phase
  ↓
[1] Needs Assessment
    → Clinical problem: what decision is being supported?
    → Current workflow: how are decisions made NOW?
    → Gap analysis: where does AI add value vs add burden?
    → Stakeholder analysis: who uses it? who is affected? who pays?
    → ⚠️ If clinicians don't perceive a problem, they won't use a solution
  ↓
[2] Workflow Integration Design
    → Where in the workflow does AI fit? (pre-read, concurrent, post-read)
    → What is the user interface? (EHR-embedded, standalone, mobile)
    → What triggers AI analysis? (automatic on new study, on-demand, scheduled)
    → How are results displayed? (overlay, report, alert, score)
    → ⚠️ AI that requires SEPARATE login or application will NOT be used
    → ⚠️ EHR-embedded AI (SMART on FHIR) has HIGHEST adoption rate
  ↓
[3] Validation at Deployment Site
    → Local performance evaluation (different population/scanner/protocol)
    → Fairness audit across local demographic groups
    → Edge case testing (what happens with poor quality inputs?)
    → Failure mode analysis (what are the consequences of wrong predictions?)
    → ⚠️ External validation at the DEPLOYMENT SITE is mandatory — published results don't transfer
  ↓
Deployment Phase
  ↓
[4] Phased Rollout
    → Shadow mode: AI runs silently; predictions logged but not shown (2-4 weeks)
    → Pilot: AI shown to select clinicians; feedback collected (4-8 weeks)
    → Expanded: AI available to all intended users; support team available (4-12 weeks)
    → Full: AI integrated into standard workflow; monitoring active
    → ⚠️ NEVER skip shadow mode — it reveals problems before they affect patients
  ↓
[5] Training & Education
    → What does the AI do? (and what does it NOT do?)
    → How to interpret AI output? (probabilities, confidence, limitations)
    → When to OVERRULE AI? (clinical judgment always supersedes)
    → How to report AI errors? (feedback mechanism)
    → ⚠️ Automation bias: clinicians may OVER-TRUST AI — training must address this explicitly
    → ⚠️ "AI said X" is NOT a clinical justification — the clinician must independently verify
  ↓
Post-Deployment Phase
  ↓
[6] Monitoring & Maintenance
    → Performance tracking: monthly accuracy metrics (if labels available)
    → Drift detection: input distribution monitoring; prediction distribution
    → User feedback: structured error reporting; satisfaction surveys
    → Incident reporting: any patient harm or near-miss involving AI
    → ⚠️ WHO maintains the model? This must be defined BEFORE deployment — not after
    → ⚠️ Maintenance funding is the #1 sustainability challenge
  ↓
[7] Model Updates
    → Update protocol: when and how is the model retrained?
    → Validation: every update must be validated before deployment
    → Version control: which model version made which prediction?
    → Regulatory: does the update require new FDA clearance?
    → ⚠️ See deep-learning-bme.md (Continual Learning) for update strategies
```

### Clinical Workflow Integration Patterns

| Integration Pattern              | Description                                       | Adoption Rate | Alert Fatigue Risk       | Best For                           |
| -------------------------------- | ------------------------------------------------- | ------------- | ------------------------ | ---------------------------------- |
| **EHR-embedded (SMART on FHIR)** | AI runs within EHR; results in patient chart      | High          | Low (contextual)         | Decision support; risk scores      |
| **PACS-integrated**              | AI runs on imaging; results in PACS viewer        | High          | Low (visual overlay)     | Radiology AI                       |
| **Standalone application**       | Separate app; requires separate login             | Low           | Varies                   | Research tools; niche applications |
| **Passive monitoring**           | AI runs in background; alerts only on abnormality | High          | Moderate                 | Early warning; deterioration       |
| **Pre-populated report**         | AI drafts report; clinician edits                 | Moderate      | Low                      | Report generation; documentation   |
| **Mobile notification**          | Push notification for critical findings           | Moderate      | High (if not calibrated) | Time-sensitive alerts              |

### Alert Fatigue Mitigation

| Strategy                           | Description                                                 | Alert Reduction  | Missed Event Risk               | Implementation                  |
| ---------------------------------- | ----------------------------------------------------------- | ---------------- | ------------------------------- | ------------------------------- |
| **Threshold optimization**         | Adjust alert threshold to reduce false positives            | 30-60%           | Slight increase                 | Easy                            |
| **Tiered alerts**                  | Critical = interruptive; moderate = passive; low = log only | 50-70%           | Very low                        | Moderate                        |
| **Contextual suppression**         | Suppress duplicate alerts; respect DNR orders               | 20-40%           | Very low                        | Moderate                        |
| **AI confidence gating**           | Only alert when AI confidence > threshold                   | 40-60%           | Moderate (depends on threshold) | Easy                            |
| **Human-in-the-loop confirmation** | AI suggests; clinician confirms before alert fires          | 60-80%           | Low                             | Complex                         |
| **Outcome-linked feedback**        | Track whether alerts led to action; adjust thresholds       | 30-50% over time | Low                             | Complex; requires feedback loop |

```
⚠️ ALERT FATIGUE BY THE NUMBERS:
- ICU monitors: ~85% of alarms are FALSE or clinically insignificant → alarm fatigue
- CDSS drug interaction alerts: 49-96% override rate → clinicians ignore them
- Sepsis early warning: 30-50% false positive rate → alert fatigue → missed true positives
- The PARADOX: more sensitive AI → more alerts → more fatigue → MISSED critical events
- Solution: tiered alerts with VERY HIGH threshold for interruptive alerts
```

### ROI Measurement for Medical AI

| ROI Dimension              | Metric                                    | Measurement Method | Typical Timeline |
| -------------------------- | ----------------------------------------- | ------------------ | ---------------- |
| **Clinical outcome**       | Mortality; morbidity; readmission         | Before-after; RCT  | 1-3 years        |
| **Operational efficiency** | Time-to-report; throughput; wait time     | Time-motion study  | 3-12 months      |
| **Financial**              | Revenue; cost savings; avoided tests      | Cost accounting    | 1-2 years        |
| **Clinician satisfaction** | Satisfaction score; burnout measure       | Survey             | 3-6 months       |
| **Patient experience**     | Satisfaction; wait time; outcomes         | Survey; EHR data   | 6-12 months      |
| **Equity**                 | Disparity in AI performance across groups | Fairness audit     | Ongoing          |

```
⚠️ ROI REALITY CHECK:
- Most medical AI ROI analyses are BEFORE-AFTER studies without controls → confounded
- "Time saved" does NOT automatically equal "cost saved" — freed time may be used for other tasks
- The most robust ROI evidence comes from RCTs, but these are EXPENSIVE and RARE
- Negative ROI studies are RARELY PUBLISHED — publication bias inflates perceived ROI
- The HIDDEN COST of AI: maintenance, monitoring, updates, training, IT support, liability insurance
- Total cost of ownership (TCO) is typically 3-5× the initial deployment cost
```

### Implementation Failure Modes

| Failure Mode              | Description                                          | Frequency   | Prevention                                       |
| ------------------------- | ---------------------------------------------------- | ----------- | ------------------------------------------------ |
| **Workflow misfit**       | AI doesn't fit into clinical workflow                | Very Common | Co-design with clinicians                        |
| **Alert fatigue**         | Too many false alerts → clinicians ignore all alerts | Very Common | Tiered alerts; threshold optimization            |
| **Automation bias**       | Clinicians over-trust AI; stop thinking critically   | Common      | Training; display uncertainty                    |
| **Deskilling**            | Clinicians lose skills that AI replaces              | Moderate    | Design AI as augmentation, not replacement       |
| **Model drift**           | Performance degrades over time                       | Common      | Continuous monitoring; update protocol           |
| **Maintenance gap**       | No one funded to maintain the model after deployment | Very Common | Budget for ongoing maintenance BEFORE deployment |
| **Equity harm**           | AI works worse for underrepresented groups           | Common      | Fairness audit at deployment site                |
| **Liability confusion**   | Unclear who is responsible for AI-assisted decisions | Common      | Clear governance; documented responsibility      |
| **Data pipeline failure** | Upstream data changes break AI input                 | Moderate    | Input validation; monitoring                     |
| **Vendor lock-in**        | Dependent on single vendor; can't switch or modify   | Moderate    | Open standards; data portability                 |

**Rule**: 96% of medical AI publications NEVER reach clinical deployment. The #1 reason is WORKFLOW MISFIT, not technical failure. Co-design with clinicians from the start.
**Rule**: EHR-embedded AI (SMART on FHIR) has the HIGHEST adoption rate. AI that requires a separate login or application will NOT be used.
**Rule**: Alert fatigue is the PARADOX of medical AI: more sensitive AI → more alerts → more fatigue → missed critical events. Use tiered alerts with very high thresholds for interruptive alerts.
**Rule**: Total cost of ownership (TCO) for medical AI is typically 3-5× the initial deployment cost. Budget for ongoing maintenance, monitoring, updates, and training BEFORE deployment, not after.
**Rule**: NEVER skip shadow mode deployment. Running AI silently for 2-4 weeks reveals problems before they affect patients.
**Rule**: For distribution shift detection and domain adaptation methods (DANN, test-time adaptation), see deep-learning-bme.md (Adversatile Robustness and Domain Adaptation sections).

---

## Reproducibility Bundle Generation (Adapted from OpenClaw)

### Overview

A Reproducibility Bundle is a self-contained package that enables any researcher to fully reproduce a computational analysis from start to finish. This protocol defines the minimum requirements for generating a complete bundle.

### Bundle Structure

```
reproducibility_bundle/
├── README.md                    # Overview, requirements, quick start
├── environment/
│   ├── Dockerfile               # Complete container definition
│   ├── requirements.txt         # Python dependencies (pinned versions)
│   ├── environment.yml          # Conda environment (alternative)
│   └── cuda_version.txt         # CUDA version if GPU required
├── data/
│   ├── data_manifest.json       # File checksums, sizes, sources
│   ├── download_script.sh       # Automated data download
│   ├── preprocessing/           # Preprocessing scripts
│   └── processed/               # Processed data (if shareable)
├── code/
│   ├── src/                     # Source code
│   ├── configs/                 # Configuration files (YAML/JSON)
│   ├── notebooks/               # Analysis notebooks
│   └── scripts/                 # Entry-point scripts
├── models/
│   ├── model_architecture.py    # Model definition
│   ├── trained_weights/         # Model weights (if shareable)
│   └── training_log.json        # Training hyperparameters & metrics
├── results/
│   ├── figures/                 # Generated figures
│   ├── tables/                  # Generated tables
│   └── metrics.json             # Quantitative results
├── tests/
│   ├── test_data_pipeline.py    # Data pipeline tests
│   ├── test_model.py            # Model output tests
│   └── test_reproducibility.py  # Seed-based reproducibility tests
└── metadata/
    ├── experiment_log.json      # Complete experiment log
    ├── git_commit_hash.txt      # Code version
    └── hardware_spec.json       # GPU, CPU, RAM specifications
```

### Bundle Quality Checklist

| Component       | Minimum Required                      | Full Reproducibility                          | Verification Method    |
| --------------- | ------------------------------------- | --------------------------------------------- | ---------------------- |
| **Environment** | requirements.txt with pinned versions | Dockerfile + CUDA version                     | Fresh install test     |
| **Data**        | Download script + checksums           | Preprocessed data included                    | Hash verification      |
| **Code**        | Main analysis scripts                 | Full source + configs + notebooks             | Clean run from scratch |
| **Model**       | Architecture definition               | Trained weights + training config             | Inference test         |
| **Results**     | Key metrics in README                 | All figures + tables + metrics                | Comparison test        |
| **Tests**       | Basic smoke test                      | Full test suite with assertions               | pytest run             |
| **Metadata**    | Git hash                              | Hardware spec + training log + experiment log | Completeness check     |

### Bundle Generation Protocol

```
Step 1: Environment Capture
  → Run `pip freeze > requirements.txt` (or conda env export)
  → Record CUDA version: `nvcc --version`
  → Record GPU: `nvidia-smi --query-gpu=name,driver_version --format=csv`
  → Generate Dockerfile from current environment
  → ⚠️ Test: Can a fresh Docker container install all dependencies?

Step 2: Data Documentation
  → For each data file: record source URL, checksum (SHA256), size, access requirements
  → Write download script that handles authentication if needed
  → Document any manual steps that cannot be automated
  → ⚠️ Test: Does download_script.sh produce files matching data_manifest.json checksums?

Step 3: Code Organization
  → Ensure all hardcoded paths are replaced with config variables
  → Create config files for all hyperparameters
  → Add entry-point scripts with clear argument documentation
  → ⚠️ Test: Does `python scripts/run_experiment.py --config configs/default.yaml` work?

Step 4: Model & Results Archival
  → Save model weights (if shareable) with version tag
  → Export training metrics log (WandB/MLflow export)
  → Generate all figures and tables from code (not manual)
  → ⚠️ Test: Do generated figures match published figures?

Step 5: Reproducibility Verification
  → Run complete pipeline from scratch in fresh Docker container
  → Compare results with published results (allow small numerical differences)
  → Run test suite: `pytest tests/ -v`
  → ⚠️ Test: Does `test_reproducibility.py` pass with different random seeds?

Step 6: Documentation
  → Write README with: overview, requirements, quick start, expected results, troubleshooting
  → Include "Expected Results" section with exact metric values
  → Document known issues and limitations
  → ⚠️ Test: Can a new researcher reproduce results using ONLY the README?
```

### Reproducibility Tiers

| Tier                          | Requirements                                                | Achievable Reproducibility              | Typical For                  |
| ----------------------------- | ----------------------------------------------------------- | --------------------------------------- | ---------------------------- |
| **Tier 1: Code Available**    | Public repo; requirements.txt                               | Same code, different results possible   | Most open-source papers      |
| **Tier 2: Code + Data**       | Public repo; download scripts; checksums                    | Same code + data, similar results       | Good open-source papers      |
| **Tier 3: Full Environment**  | Docker + data + configs                                     | Same results within numerical precision | Top-tier reproducible papers |
| **Tier 4: Verified Bundle**   | Tier 3 + test suite + verified by third party               | Exact reproducibility confirmed         | Rare; gold standard          |
| **Tier 5: Live Reproducible** | Tier 4 + continuous integration + automated re-verification | Always reproducible                     | Very rare; ongoing projects  |

**Rule**: Aim for Tier 3 minimum for any publication. Tier 4 should be the goal for high-impact clinical AI papers.
**Rule**: If a paper claims clinical applicability but is only Tier 1, flag: "⚠️ Insufficient reproducibility for clinical claims — full environment bundle needed."

---

## Search Strategy Protocol (Adapted from OpenClaw)

### Systematic Literature Search Framework

When conducting a comprehensive literature review, follow this structured search strategy:

### Database-Specific Search Construction

| Database             | Primary Use                                   | Query Construction                   | Key Filters                          |
| -------------------- | --------------------------------------------- | ------------------------------------ | ------------------------------------ |
| **PubMed**           | Biomedical literature                         | MeSH terms + title/abstract keywords | Date range; article type; species    |
| **OpenAlex**         | Multi-disciplinary literature (supplementary) | Natural language + field-specific    | Citation count; venue; open access   |
| **EMBASE**           | Drug/pharmacology literature                  | Emtree terms + keywords              | Drug name; route; adverse event      |
| **Cochrane Library** | Systematic reviews                            | MeSH + keywords                      | Review type; last assessment date    |
| **IEEE Xplore**      | Engineering/BME                               | Thesaurus terms + keywords           | Conference/journal; application area |
| **arXiv / bioRxiv**  | Preprints                                     | Natural language                     | Category; date; author               |

### Search Strategy Template

```
Step 1: Define PICO Elements
  P (Population/Patient): Who/what is the subject?
  I (Intervention/Exposure): What is being studied?
  C (Comparison): What is it compared to?
  O (Outcome): What is the measured result?

Step 2: Construct Boolean Query
  → Combine PICO elements with AND
  → Within each element, combine synonyms with OR
  → Use MeSH/Emtree terms where available
  → Example: ("deep learning" OR "neural network" OR "AI") AND ("ECG" OR "electrocardiogram") AND ("atrial fibrillation" OR "AF") AND ("detection" OR "screening")

Step 3: Apply Filters
  → Date range (typically last 5 years for AI; last 10 for methodology)
  → Article type (exclude editorials, letters unless specifically needed)
  → Language (English + relevant local languages)
  → Species (human vs animal studies)

Step 4: Screening Process
  → Title/abstract screening (2 independent reviewers)
  → Full-text screening (2 independent reviewers)
  → Conflict resolution by third reviewer
  → PRISMA flow diagram for documentation

Step 5: Quality Assessment
  → Use appropriate tool: QUADAS-2 (diagnostic), PROBAST (prediction), RoB2 (RCT), ROBINS-I (observational)
  → Assess risk of bias for each included study
  → Document assessment in standardized table

Step 6: Data Extraction
  → Pre-defined extraction form
  → Extract: study design, population, intervention, outcomes, key metrics, limitations
  → Verify extraction by second reviewer

Step 7: Synthesis
  → Narrative synthesis (always)
  → Meta-analysis (if studies are sufficiently homogeneous)
  → GRADE assessment for certainty of evidence
```

### Search Completeness Verification

| Check                       | Method                                                | Action if Failed                                  |
| --------------------------- | ----------------------------------------------------- | ------------------------------------------------- |
| **Key paper included?**     | Check if 5-10 known landmark papers appear in results | Expand search terms; check alternative databases  |
| **Search saturation?**      | Track new relevant papers per 100 results             | If still finding new papers, search is incomplete |
| **Cross-database overlap?** | Compare results across PubMed, Embase, Scopus         | If minimal overlap, search is incomplete          |
| **Reference harvesting?**   | Check reference lists of included studies             | Add any missed papers; update search              |
| **Expert review?**          | Domain expert reviews included/excluded lists         | Add missed papers; remove false positives         |

**Rule**: A literature search that does not find the known landmark papers in the field is INCOMPLETE. Always verify against known key references.
**Rule**: For systematic reviews, search at minimum PubMed + Embase + Cochrane. Single-database searches are insufficient.
