# Experimental Design Methodology

## Hypothesis Formulation

### FINER Criteria for Research Questions

| Criterion | Question | Example (Good) | Example (Bad) |
|-----------|----------|----------------|---------------|
| **Feasible** | Can it be done with available resources? | "Compare AI vs radiologist on 500 CXRs" | "Compare AI vs ALL radiologists worldwide" |
| **Interesting** | Does anyone care about the answer? | "Does AI reduce diagnostic errors?" | "Does AI process images faster?" (obvious) |
| **Novel** | Has it been answered before? | "AI for rare disease diagnosis in primary care" | "AI for diabetic retinopathy screening" (done) |
| **Ethical** | Can it be done ethically? | "Shadow mode AI; no patient impact" | "Replace clinician with AI without oversight" |
| **Relevant** | Will it change practice? | "AI triage reduces wait time by 40%" | "AI achieves 0.1% AUC improvement" |

### PICO Framework for Clinical Questions

| Element | Definition | Example |
|---------|-----------|---------|
| **P (Population)** | Who are the patients? | Adults with suspected pulmonary embolism in ED |
| **I (Intervention)** | What is the intervention? | AI-assisted CT angiography interpretation |
| **C (Comparison)** | What is it compared to? | Standard radiologist interpretation |
| **O (Outcome)** | What are the outcomes? | Diagnostic accuracy; time to diagnosis; patient outcomes |

### Hypothesis Types

| Type | Structure | Example | Statistical Test |
|------|-----------|---------|------------------|
| **Superiority** | H₁: μ₁ > μ₂ | AI > standard care | One-sided or two-sided test |
| **Non-inferiority** | H₁: μ₁ > μ₂ - δ | AI not worse than standard by margin δ | One-sided test; non-inferiority margin |
| **Equivalence** | H₁: |μ₁ - μ₂| < δ | AI equivalent to standard | Two one-sided tests (TOST) |
| **Bioequivalence** | H₁: 0.8 < μ₁/μ₂ < 1.25 | Generic = brand drug | TOST with 90% CI |

## Power Analysis

### Core Concepts

| Concept | Definition | Formula/Approach |
|---------|-----------|-----------------|
| **α (Type I error)** | False positive rate | Usually 0.05 |
| **β (Type II error)** | False negative rate | Usually 0.20 (power = 0.80) |
| **Power (1-β)** | Probability of detecting true effect | ≥ 0.80 recommended; 0.90 for pivotal trials |
| **Effect size** | Magnitude of difference | Cohen's d; hazard ratio; risk difference |
| **Sample size (N)** | Number of subjects needed | Depends on α, β, effect size, variability |

### Sample Size Calculation by Study Type

| Study Type | Primary Endpoint | Formula/Tool | Key Parameters |
|-----------|-----------------|-------------|---------------|
| **Two-arm RCT (continuous)** | Mean difference | N = 2(Zα+Zβ)²σ²/δ² | σ (SD), δ (mean diff), α, β |
| **Two-arm RCT (binary)** | Proportion difference | N = (Zα+Zβ)²×[p1(1-p1)+p2(1-p2)]/(p1-p2)² | p1, p2 (proportions) |
| **Survival analysis** | Hazard ratio | N = (Zα+Zβ)²/[(ln HR)²×p_event] | HR, event rate, α, β |
| **Diagnostic accuracy** | AUC | Obuchowski formula | AUC₀, AUC₁, α, β |
| **Non-inferiority** | Margin δ | N = 2(Zα+Zβ)²σ²/(δ-NI_margin)² | NI margin is CRITICAL |
| **Cluster RCT** | Cluster-level | N_individual = N_simple × (1 + (m-1)×ICC) | m (cluster size), ICC |
| **Stepped wedge** | Time × cluster | Hussey & Hughes formula | Steps, clusters, ICC |
| **Equivalence** | Equivalence margin | TOST; N ≈ 2(Zα+Zβ)²σ²/δ² | δ = equivalence margin |

### Effect Size Reference Values

| Metric | Small | Medium | Large | Clinical Context |
|--------|-------|--------|-------|-----------------|
| **Cohen's d** | 0.2 | 0.5 | 0.8 | Behavioral/psychological |
| **Risk difference** | 5% | 10% | 20% | Clinical outcomes |
| **Hazard ratio** | 0.90 | 0.75 | 0.60 | Survival analysis |
| **AUC improvement** | 0.01 | 0.03 | 0.05 | Diagnostic accuracy |
| **Odds ratio** | 1.2 | 1.5 | 2.0 | Case-control studies |
| **Correlation (r)** | 0.1 | 0.3 | 0.5 | Association studies |
| **R² change** | 0.02 | 0.13 | 0.26 | Regression models |

### Power Analysis Tools

| Tool | Type | Best For | Platform |
|------|------|----------|----------|
| **G*Power** | Software | General power analysis | Windows/Mac |
| **pwr (R)** | R package | Standard tests | R |
| **powerSurvEpi (R)** | R package | Survival analysis | R |
| **sampsi (Stata)** | Stata command | Clinical trials | Stata |
| **PASS** | Software | Comprehensive; sample size | Windows |
| **nQuery** | Software | Clinical trial design | Windows |
| **Simulation** | Custom | Complex designs | R/Python |

### Simulation-Based Power Analysis (for complex designs)

```python
# Pseudocode for simulation power analysis
for iteration in range(10000):
    # 1. Generate data under alternative hypothesis
    data = generate_data(effect_size=delta, n_per_group=N, distribution=...)
    
    # 2. Apply analysis method
    result = analyze(data, method=...)
    
    # 3. Record if significant
    if result.p_value < alpha:
        power_count += 1

power = power_count / 10000
```

## Experimental Design Types

### Classification by Design

| Design | Structure | Strengths | Weaknesses | Best For |
|--------|-----------|-----------|------------|----------|
| **Parallel RCT** | 2+ arms; simultaneous | Simple; gold standard | Large N needed | Standard comparison |
| **Factorial** | 2+ factors; all combinations | Test interactions; efficient | Interaction complicates | Multi-intervention |
| **Crossover** | Each subject gets both treatments | Within-subject; smaller N | Carryover effect | Chronic conditions |
| **Cluster RCT** | Randomize groups | Real-world; no contamination | Larger N; ICC | Community/hospital-level |
| **Stepped wedge** | Sequential rollout | All get intervention; ethical | Time effects; complex | Implementation research |
| **Adaptive** | Modify based on interim | Efficient; ethical | Complex analysis | Drug development |
| **N-of-1** | Single subject; repeated | Individualized | Not generalizable | Personalized medicine |
| **Quasi-experimental** | Non-randomized | Feasible; real-world | Selection bias | Policy evaluation |
| **Regression discontinuity** | Threshold-based assignment | Near-random at cutoff | Only local estimate | Eligibility threshold |
| **Difference-in-differences** | Pre-post with control | Causal inference (assumptions) | Parallel trends assumption | Policy evaluation |
| **Synthetic control** | Weighted comparison group | Single treated unit | Donor pool selection | State/country-level policy |

### Randomization Methods

| Method | Description | When to Use | Implementation |
|--------|-------------|------------|---------------|
| **Simple** | Coin flip per subject | Large trials | `random.choice()` |
| **Block** | Equal allocation per block | Ensure balance | Block size 4, 6, 8 |
| **Stratified** | Separate randomization per stratum | Important prognostic factors | Stratify by site, severity |
| **Minimization** | Dynamic; minimize imbalance | Small trials; many factors | Pocock & Simon method |
| **Covariate adaptive** | Adjust for baseline covariates | Heterogeneous population | Minimize covariate imbalance |
| **Urn** | Start equal; adapt | Adaptive randomization | Response-adaptive |
| **Response-adaptive** | Favor better treatment | Ethical; efficient | Thompson sampling; bandit |

### Blinding Protocols

| Level | Who is blinded | Risk if unblinded | Implementation |
|-------|---------------|-------------------|---------------|
| **Open label** | No one | High | Only when blinding impossible |
| **Single blind** | Participant | Moderate | Placebo control |
| **Double blind** | Participant + investigator | Low | Standard for drug trials |
| **Triple blind** | Participant + investigator + analyst | Very Low | Gold standard |
| **PROBE** | Prospective, open, blinded endpoint | Moderate | Outcomes assessed blindly |

## Bias Assessment

### Risk of Bias Tools

| Tool | Study Type | Domains | Rating |
|------|-----------|---------|--------|
| **RoB 2** | Randomized trials | 5 domains: randomization, deviations, missing data, measurement, selection | Low/High/Some concerns |
| **ROBINS-I** | Non-randomized interventions | 7 domains: confounding, selection, classification, deviations, missing, measurement, selection of reported result | Low/Moderate/Serious/Critical |
| **QUADAS-2** | Diagnostic accuracy | 4 domains: patient selection, index test, reference standard, flow/timing | Low/High/Unclear |
| **ROBIS** | Systematic reviews | 3 phases + 4 domains | Low/High/Unclear |
| **PROBAST** | Prediction models | 4 domains: participants, predictors, outcome, analysis | Low/High/Unclear |
| **JBI** | Prevalence studies | 9 items | Yes/No/Unclear |

### Common Bias Types in Medical AI Research

| Bias Type | Description | Detection | Prevention |
|-----------|-------------|-----------|-----------|
| **Selection bias** | Non-representative sample | Compare sample demographics to target population | Prospective consecutive enrollment |
| **Spectrum bias** | Disease severity not representative | Report disease severity distribution | Enroll across severity spectrum |
| **Verification bias** | Not all subjects get reference standard | Report verification rate | Apply reference standard to all |
| **Review bias** | Knowledge of index test influences reference | Blinded reference assessment | Blind reference assessors |
| **Incorporation bias** | Index test incorporated into reference | Check reference standard definition | Independent reference standard |
| **Data leakage** | Training data in test set | Check data splits carefully | Strict patient-level splits |
| **Overfitting** | Model memorizes training data | Large train-test performance gap | Cross-validation; external validation |
| **Publication bias** | Positive results more likely published | Funnel plot; Egger's test | Register all studies |
| **Automation bias** | Humans over-trust AI | Measure agreement with vs without AI | Human states judgment first |
| **Metric gaming** | Cherry-picked metrics | Report ALL relevant metrics | Pre-specify primary metric |

## Preregistration and Reporting Standards

### Preregistration Platforms

| Platform | URL | Study Type | Key Elements |
|----------|-----|-----------|-------------|
| **ClinicalTrials.gov** | clinicaltrials.gov | Clinical trials | Protocol; endpoints; analysis plan |
| **OSF Registries** | osf.io/registries | Any research | Hypothesis; methods; analysis plan |
| **PROSPERO** | crd.york.ac.uk/PROSPERO | Systematic reviews | Search strategy; inclusion criteria |
| **AsPredicted** | aspredicted.org | Any research | 9 questions; quick registration |
| **PreclinicalTrials.eu** | preclinicaltrials.eu | Animal studies | Animal model; intervention; outcome |

### Reporting Standards by Study Type

| Standard | Study Type | Key Requirements | Checklist Items |
|----------|-----------|-----------------|----------------|
| **CONSORT** | RCT | Flow diagram; randomization; blinding; analysis | 25 items + flow diagram |
| **CONSORT-AI** | AI-intervention RCT | + AI intervention details; algorithm version; human-AI interaction | 14 additional AI items |
| **STROBE** | Observational | Design; setting; participants; variables; bias | 22 items |
| **STROBE-AI** | AI observational | + Algorithm description; validation; deployment context | Additional AI items |
| **PRISMA** | Systematic review | Search; selection; data extraction; synthesis | 27 items + flow diagram |
| **TRIPOD** | Prediction model | Development; validation; performance; clinical utility | 37 items |
| **TRIPOD+AI** | AI prediction model | + Algorithm details; code availability; computational requirements | Additional AI items |
| **STARD** | Diagnostic accuracy | Index test; reference standard; flow; accuracy | 30 items + flow diagram |
| **STARD-AI** | AI diagnostic | + AI system details; data description; human comparison | Additional AI items |
| **SPIRIT-AI** | AI trial protocol | + AI intervention; human-AI interaction; analysis | 16 additional AI items |
| **ARRIVE** | Animal experiments | Sample size; randomization; blinding; outcomes | 21 items |
| **MIAME** | Microarray | Raw data; processed data; annotation; design | 6 sections |
| **MINSEQE** | Sequencing | Raw reads; processed data; annotation; protocols | 6 sections |
| **MIAPE** | Proteomics | Sample; preparation; instrument; data | 7 sections |
| **REMARK** | Marker studies | Marker; assay; design; analysis | 20 items |

### AI-Specific Reporting Extensions (CONSORT-AI / SPIRIT-AI)

| Item | Requirement | Why Important |
|------|------------|---------------|
| **AI intervention description** | Algorithm, version, input/output, intended user | Reproducibility; safety |
| **Human-AI interaction** | How humans interact with AI output | Automation bias; workflow |
| **Algorithm training** | Training data, labels, architecture, hyperparameters | Reproducibility; generalizability |
| **Computational requirements** | Hardware, software, runtime | Reproducibility; deployment feasibility |
| **Failure mode analysis** | What happens when AI fails? | Patient safety |
| **Equity considerations** | Subgroup performance; access | Fairness; health equity |
| **Data provenance** | Where data came from; consent; licensing | Ethics; legal compliance |
| **Model updates** | Static vs adaptive; PCCP plan | Regulatory compliance; safety |

## Sample Size Quick Reference

### Minimum Sample Sizes by Study Type

| Study Type | Minimum N | Recommended N | Key Driver |
|-----------|-----------|---------------|-----------|
| **Pilot study** | 12 per arm | 30 per arm | Feasibility estimation |
| **Phase I trial** | 20-80 | 30-50 | Safety; dose-finding |
| **Phase II trial** | 50-200 | 100+ | Preliminary efficacy |
| **Phase III trial** | 300+ | 500+ | Confirmatory efficacy |
| **Diagnostic accuracy** | 50+ per group | 200+ per group | Precision of sensitivity/specificity |
| **Prognostic model** | 10 EPV (events per variable) | 20+ EPV | Model stability |
| **Machine learning** | 10× parameters | 100× parameters | Overfitting prevention |
| **Deep learning** | 1000+ | 10,000+ | Training stability |
| **Survey research** | 100+ | 400+ | Precision of estimates |
| **Qualitative research** | 12-30 (saturation) | 20-50 | Theme saturation |

### AI-Specific Sample Size Considerations

| Scenario | Rule of Thumb | Rationale |
|----------|-------------|-----------|
| **Image classification** | 1000+ images per class | Deep learning data hunger |
| **Rare disease AI** | 100+ positive + 1000+ negative | Class imbalance; rare event estimation |
| **NLP clinical text** | 10,000+ documents | Language variability |
| **Multi-site validation** | 3+ sites; 100+ per site | Generalizability |
| **External validation** | Same N as development | Adequate power for performance estimation |
| **Fairness audit** | 100+ per demographic subgroup | Subgroup performance estimation |
| **Time series** | 1000+ time steps | Temporal pattern learning |
| **Foundation model fine-tuning** | 100-1000 examples | Few-shot capability |

## Multi-Site Study Design

| Design Element | Single-Site Risk | Multi-Site Solution |
|---------------|-----------------|-------------------|
| **Overfitting to site** | Very High | Train on site A, validate on B, C, D |
| **Population bias** | High | Diverse demographics across sites |
| **Equipment bias** | High | Multiple scanner types; harmonization |
| **Protocol variation** | Moderate | Standardized protocol; central monitoring |
| **Statistical power** | Limited | Larger combined N |
| **Generalizability** | Low | Cross-site validation required |

### Multi-Site Validation Protocol

| Step | Action | Key Metric |
|------|--------|-----------|
| **1. Site selection** | 3+ geographically diverse sites | Demographic diversity |
| **2. Protocol harmonization** | Standardized data collection | Protocol adherence > 95% |
| **3. Central vs local annotation** | Central adjudication preferred | Inter-annotator agreement κ > 0.8 |
| **4. Cross-validation** | Leave-one-site-out | Per-site performance |
| **5. Domain adaptation** | Test adaptation methods | Improvement on worst-performing site |
| **6. Fairness audit** | Per-subgroup performance | <5% accuracy gap across groups |
