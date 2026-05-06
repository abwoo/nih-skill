# Clinical Trial Design, Matching & Feasibility Methodology

## Clinical Trial Protocol Design

### Protocol Structure (ICH-GCP E6 R2)

| Section | Content | Key Considerations | Common Deficiency |
|---------|---------|-------------------|-------------------|
| **1. Protocol Synopsis** | Title, phase, design, population, endpoints | Must be self-contained | Missing key design elements |
| **2. Background** | Scientific rationale, unmet need, prior evidence | Gap analysis; risk-benefit | Insufficient rationale |
| **3. Objectives** | Primary, secondary, exploratory | Hierarchical; SMART | Too many primary endpoints |
| **4. Study Design** | Randomization, blinding, control, schema | Minimize bias | Unblinded; no control |
| **5. Population** | Inclusion/exclusion criteria | Enrichment vs broad | Overly restrictive (slow enrollment) |
| **6. Interventions** | Dose, schedule, duration, modifications | Safety; PK-guided | Fixed dose without rationale |
| **7. Endpoints** | Primary, secondary, safety, exploratory | Clinically meaningful; validated | Surrogate without validation |
| **8. Sample Size** | Power, effect size, alpha, dropout | Realistic assumptions | Overoptimistic effect size |
| **9. Statistical Analysis** | Primary analysis, interim, multiplicity | Control Type I error | No multiplicity adjustment |
| **10. Safety Monitoring** | AE reporting, DSMB, stopping rules | Patient safety | No DSMB for Phase III |
| **11. Ethics** | IRB, informed consent, data monitoring | GCP compliance | Inadequate consent process |
| **12. Data Management** | Collection, quality, monitoring | Data integrity | No data quality plan |

### Trial Phase Classification

| Phase | Purpose | Population | Duration | Success Rate | Key Question |
|-------|---------|-----------|----------|-------------|-------------|
| **Phase I** | Safety, PK/PD, MTD | 20-100 healthy/volunteers | Months | ~70% | Is it safe? What dose? |
| **Phase Ia** | Single ascending dose (SAD) | 20-40 | Weeks | — | Maximum tolerated dose |
| **Phase Ib** | Multiple ascending dose (MAD) | 20-60 | Weeks | — | Repeat-dose safety |
| **Phase II** | Efficacy signal, dose-ranging | 100-300 patients | Months-1 year | ~30% | Does it work? Best dose? |
| **Phase IIa** | Proof of concept | 50-100 | Months | — | Any efficacy signal? |
| **Phase IIb** | Dose-ranging | 100-300 | Months-1 year | — | Optimal dose? |
| **Phase III** | Confirmatory efficacy, safety | 300-3000+ patients | 1-4 years | ~60% | Is it effective and safe? |
| **Phase IV** | Post-marketing surveillance | Thousands | Years | — | Real-world safety/efficacy |

### Adaptive Trial Design

| Design Type | Adaptation | Advantage | Risk | FDA Acceptance |
|-------------|-----------|-----------|------|---------------|
| **Group sequential** | Early stopping for efficacy/futility | Saves resources; ethical | Information leakage | Standard |
| **Sample size re-estimation** | Increase N if effect smaller than expected | Preserves power | May unblind | Accepted with pre-specification |
| **Drop-the-loser** | Drop inferior arms | Focus resources on winners | Selection bias | Accepted |
| **Adaptive randomization** | Favor better-performing arms | Ethical; efficient | Complex analysis | Accepted with caution |
| **Seamless Phase II/III** | Combine phases | Faster development | Operational complexity | Accepted with pre-specification |
| **Umbrella/Basket** | Multiple subgroups/indications | Efficient; biomarker-driven | Complex logistics | Increasingly accepted |
| **Platform trial** | Perpetual; add/drop arms | Master protocol efficiency | Infrastructure cost | Accepted (RECOVERY, REMAP-CAP) |

### Platform Trial Design (RECOVERY/REMAP-CAP Model)

```
Master Protocol
    │
    ├─ Eligibility Criteria (broad)
    │
    ├─ Randomization
    │   ├─ Arm A: Standard of Care
    │   ├─ Arm B: Drug X
    │   ├─ Arm C: Drug Y
    │   ├─ Arm D: Drug Z (added later)
    │   └─ Arm E: Drug W (added later)
    │
    ├─ Interim Analyses
    │   ├─ Superiority → Graduate arm; implement
    │   ├─ Futility → Drop arm
    │   └─ Equivalence → Drop arm; move on
    │
    └─ Shared Control Group
        ├─ All arms share SOC control
        ├─ Increases efficiency (fewer total patients needed)
        └─ Requires careful monitoring for time trends
```

**Rule**: Adaptive designs MUST be pre-specified in the statistical analysis plan. Post-hoc adaptations are NOT adaptive designs — they are data dredging.
**Rule**: Platform trials (RECOVERY, REMAP-CAP) are the MOST EFFICIENT design for evaluating multiple treatments simultaneously. They require 30-50% fewer patients than separate RCTs.
**Rule**: The shared control group in platform trials is both a STRENGTH (efficiency) and a VULNERABILITY (time trends, changing SOC). Must use appropriate statistical methods (e.g., time-adjusted analysis).

---

## Clinical Trial Matching — Patient-to-Trial

### Patient-to-Trial Matching Pipeline

| Step | Method | Input | Output | Key Challenge |
|------|--------|-------|--------|--------------|
| **1. Patient profiling** | EHR + molecular data | Demographics, diagnosis, biomarkers | Patient profile | Incomplete EHR data |
| **2. Trial database query** | ClinicalTrials.gov API | Inclusion/exclusion criteria | Eligible trials | Complex criteria parsing |
| **3. Criteria matching** | NLP + rule-based | Patient profile vs trial criteria | Match score | Negation; temporal criteria |
| **4. Geographical filtering** | Location data | Patient location; trial sites | Accessible trials | Travel burden |
| **5. Preference filtering** | Patient preferences | Treatment preference; visit frequency | Preferred trials | Preference elicitation |
| **6. Ranking** | Multi-criteria scoring | Match + access + preference | Ranked trial list | Weighting criteria |
| **7. Enrollment support** | Navigation + consent | Trial information; consent form | Enrollment decision | Consent complexity |

### Trial Eligibility Criteria Parsing

| Criteria Type | Example | Parsing Difficulty | NLP Challenge |
|--------------|---------|-------------------|---------------|
| **Demographic** | Age 18-65; ECOG 0-2 | Low | Simple extraction |
| **Diagnosis** | "Metastatic NSCLC with EGFR mutation" | Moderate | Abbreviation; negation |
| **Lab values** | "ANC > 1500/μL; platelets > 100,000/μL" | Moderate | Unit normalization; operator |
| **Prior treatment** | "No prior EGFR TKI; ≤2 prior lines" | High | Negation; counting; temporal |
| **Comorbidity** | "No uncontrolled CNS metastases" | High | Negation; "uncontrolled" modifier |
| **Temporal** | "Progression within 6 months of adjuvant therapy" | Very High | Temporal reasoning; relative dates |
| **Compound** | "HR+/HER2- by IHC/FISH; ESR1 mutation" | Very High | Multi-condition; AND/OR logic |

### Trial Matching Assessment

| Assessment | Key Question | Required Evidence | Red Flag |
|-----------|-------------|-------------------|---------|
| **Criteria completeness** | Are ALL criteria parsed? | Manual review of 50+ trial protocols | Missing exclusion criteria |
| **Negation handling** | Are "no prior" criteria correctly handled? | Negation detection accuracy > 95% | "No prior chemotherapy" matched as "prior chemotherapy" |
| **Temporal reasoning** | Are time-based criteria correctly evaluated? | Temporal logic test cases | "Within 6 months" not computed |
| **Molecular matching** | Are biomarker criteria matched to patient data? | Genomic report integration | Biomarker criteria ignored |
| **Real-world validation** | Does matching predict actual enrollment? | Enrollment rate comparison | No real-world validation |

**Rule**: The #1 barrier to clinical trial enrollment is ELIGIBILITY CRITERIA COMPLEXITY. The average Phase III trial has 20+ inclusion and 30+ exclusion criteria. AI-based matching must handle ALL of them.
**Rule**: Negation detection is the MOST CRITICAL NLP task for trial matching. "No prior chemotherapy" incorrectly matched as "prior chemotherapy" would exclude eligible patients.
**Rule**: Only ~3-5% of adult cancer patients enroll in clinical trials. AI-based matching can potentially increase this to 10-15% by reducing the search burden, but access and logistics remain barriers.

---

## Clinical Trial Feasibility Assessment

### Feasibility Assessment Framework

| Dimension | Assessment | Data Source | Decision Criteria | Red Flag |
|-----------|-----------|-------------|-------------------|---------|
| **Patient availability** | Prevalence × eligibility rate | SEER, hospital data | Sufficient patients for enrollment | Prevalence < 1/100,000 with strict criteria |
| **Site capability** | Infrastructure, staff, experience | Site survey; prior trials | Certified sites available | No sites with required equipment |
| **Investigator interest** | PI engagement; competing trials | Site network | Committed investigators | PI running 5+ competing trials |
| **Regulatory pathway** | IND/IDE requirements; timeline | FDA guidance; prior approvals | Clear regulatory path | Novel mechanism; no guidance |
| **Competitive landscape** | Similar trials; SOC changes | ClinicalTrials.gov; guidelines | Window of opportunity | 3+ similar Phase III trials ongoing |
| **Budget** | Per-patient cost; total budget | CRO quotes; historical data | Fundable within budget | Per-patient cost > $50K |
| **Timeline** | Enrollment duration; total study | Projection models | Enrollment within 2-3 years | Projected enrollment > 5 years |

### Enrollment Projection Model

| Parameter | Input | Typical Range | Impact |
|-----------|-------|--------------|--------|
| **Disease incidence** | Cases/year in catchment | Variable | Linear |
| **Eligibility fraction** | % meeting all criteria | 5-20% | Linear |
| **Consent rate** | % eligible who consent | 10-50% | Linear |
| **Screen failure rate** | % screened who fail | 20-40% | Linear |
| **Dropout rate** | % who discontinue | 10-30% | Moderate |
| **Site activation rate** | Sites activated/month | 2-5/month | High (early) |
| **Enrollment rate** | Patients/site/month | 0.5-2 | High |

**Rule**: The most common reason for trial FAILURE is not efficacy or safety — it's FAILURE TO ENROLL. Over 80% of clinical trials fail to meet enrollment timelines.
**Rule**: Feasibility assessments that use DISEASE PREVALENCE alone overestimate enrollment by 5-10×. Must apply eligibility fraction (typically 5-20% of prevalent cases meet all criteria).
**Rule**: Competitive trials are the SILENT KILLER of enrollment. If 3 similar Phase III trials are recruiting the same population, each gets ~1/3 of available patients.

---

## Clinical Trial Design Assessment Protocol

### AI-Designed Trial Assessment

| Assessment | Key Question | Required Evidence | Red Flag |
|-----------|-------------|-------------------|---------|
| **Endpoint validity** | Is the primary endpoint clinically meaningful? | Prior validation; regulatory precedent | Surrogate without validation |
| **Control appropriateness** | Is the control arm appropriate? | Current SOC; active vs placebo | Placebo when active control exists |
| **Randomization adequacy** | Is randomization proper? | Central; stratified; blocked | Quasi-randomization |
| **Blinding** | Is the trial properly blinded? | Double-blind; placebo-matched | Open-label Phase III |
| **Sample size justification** | Is the sample size realistic? | Effect size from prior data; power ≥ 80% | Effect size from best-case Phase II |
| **Multiplicity control** | Are multiple endpoints controlled? | Hierarchical testing; Bonferroni; Hochberg | No multiplicity adjustment |
| **Interim analysis plan** | Are stopping rules pre-specified? | O'Brien-Fleming; Haybittle-Peto | Ad hoc interim looks |
| **Subgroup analysis** | Are subgroup analyses pre-specified? | Statistical analysis plan | Post-hoc subgroup claims |

**Rule**: A Phase III trial with a SURROGATE primary endpoint (e.g., PFS instead of OS) is acceptable ONLY if the surrogate is VALIDATED for the indication. PFS is validated in some cancers but NOT all.
**Rule**: Open-label Phase III trials are SUSCEPTIBLE to assessment bias, especially for subjective endpoints (PRO, physician assessment). Objective endpoints (mortality, imaging) are less affected.
**Rule**: The most common statistical ERROR in clinical trials is inadequate multiplicity adjustment. Multiple primary endpoints, multiple comparisons, and interim analyses all inflate Type I error and MUST be controlled.

---

## Sample Size & Statistical Methods

### Sample Size Calculation by Study Type

| Study Type | Primary Endpoint | Formula/Method | Key Parameters | Software |
|-----------|-----------------|----------------|----------------|----------|
| **Superiority (continuous)** | Mean difference | N = 2(Zα+Zβ)²σ²/δ² | σ=SD, δ=minimal detectable difference | G*Power, PASS |
| **Superiority (binary)** | Proportion difference | N = (Zα+Zβ)²[p1(1-p1)+p2(1-p2)]/(p1-p2)² | p1, p2=proportions | G*Power, nQuery |
| **Superiority (time-to-event)** | Hazard ratio | Events = 4(Zα+Zβ)²/ln(HR)² | HR, accrual time, follow-up | PASS, EAST |
| **Non-inferiority (binary)** | Proportion difference | N = (Zα+Zβ)²[p1(1-p1)+p2(1-p2)]/(δ-Δ)² | Δ=non-inferiority margin | nQuery |
| **Equivalence** | Mean difference | N = 2(Zα+Zβ)²σ²/(δ-Δ)² | Δ=equivalence margin | nQuery |
| **Cluster RCT** | Cluster-level | N_inflated = N(1 + (m-1)ICC) | m=cluster size, ICC | CRTsize |
| **Stepped wedge** | Time×cluster | Simulation-based | Steps, clusters, ICC | SWSamp |
| **Adaptive** | Varies | Conditional power; SSR | Interim data | EAST, ADDPLAN |

### Effect Size Reference Values for Common Endpoints

| Disease | Endpoint | Small | Medium | Large | Source |
|---------|----------|-------|--------|-------|--------|
| **Oncology** | HR (OS) | 0.90 | 0.80 | 0.70 | Historical trials |
| **Oncology** | HR (PFS) | 0.85 | 0.70 | 0.55 | Historical trials |
| **Cardiovascular** | HR (MACE) | 0.92 | 0.85 | 0.75 | CTT meta-analysis |
| **Diabetes** | HbA1c difference | 0.3% | 0.5% | 0.8% | FDA guidance |
| **Hypertension** | SBP difference (mmHg) | 3 | 5 | 10 | Meta-analyses |
| **Depression** | HAM-D difference | 2 | 3 | 5 | Historical trials |
| **Pain** | NRS difference | 0.5 | 1.0 | 2.0 | IMMPACT |
| **COPD** | FEV1 difference (mL) | 50 | 100 | 150 | EMA guidance |
| **IPF** | FVC difference (mL) | 50 | 100 | 200 | INPULSIS trials |

### Interim Analysis Methods

| Method | Alpha Spending | Boundary Shape | When to Use | Advantage |
|--------|---------------|----------------|-------------|-----------|
| **O'Brien-Fleming** | Very conservative early | Steep → flat | Standard; preferred by FDA | Preserves most alpha for final |
| **Pocock** | Uniform spending | Flat | Want early stopping option | Equal boundaries at each look |
| **Haybittle-Peto** | Extreme early (p<0.001) | Very steep | Safety; strong evidence | Very conservative early |
| **Lan-DeMets** | Flexible spending function | Customizable | Unequally spaced looks | Accommodates timing changes |
| **Beta-spending** | Futility boundaries | Customizable | Want futility stopping | Saves resources |

### Multiplicity Adjustment Methods

| Method | Type | When to Use | Advantage | Limitation |
|--------|------|-------------|-----------|-----------|
| **Bonferroni** | Single-step | Few comparisons; conservative | Simple; valid for any correlation | Overly conservative for many tests |
| **Holm** | Step-down | General purpose | Less conservative than Bonferroni | Still assumes independence |
| **Hochberg** | Step-up | General purpose | More powerful than Holm | Requires positive dependency |
| **Hommel** | Step-up | General purpose | Most powerful step-up | Complex computation |
| **Fixed-sequence** | Hierarchical | Ordered hypotheses | No alpha penalty if H1 rejected | Order must be pre-specified |
| **Gatekeeping** | Hierarchical | Primary → secondary | Protects primary | Complex; primary must succeed |
| **Dunnett** | Many-to-one | Multiple doses vs control | Optimized for dose-finding | Only for comparisons to control |
| **Closed testing** | General | Complex families | Most flexible | Computationally intensive |

---

## Decentralized & Digital Clinical Trials

### Digital Trial Design Framework

| Component | Traditional | Digital/Decentralized | Hybrid | Key Challenge |
|-----------|------------|----------------------|--------|--------------|
| **Recruitment** | Site-based | Digital advertising; EHR screening | Both | Digital divide; representativeness |
| **Consent** | In-person | eConsent; video consent | Both | Comprehension verification |
| **Assessments** | On-site visits | Wearables; ePRO; telemedicine | Mixed | Data quality equivalence |
| **Drug dispensing** | Site pharmacy | Direct-to-patient shipping | Both | Cold chain; compliance monitoring |
| **Safety monitoring** | On-site AE reporting | Wearable alerts; telecheck | Both | AE detection sensitivity |
| **Follow-up** | Scheduled visits | App-based; passive monitoring | Both | Missing data; engagement |

### Wearable/Remote Monitoring Endpoints

| Endpoint | Wearable/Method | Validation Status | Regulatory Acceptance | Key Limitation |
|----------|----------------|-------------------|----------------------|----------------|
| **Heart rate** | PPG, ECG patch | Well-validated | Accepted | Motion artifact |
| **Physical activity** | Accelerometer | Well-validated | Accepted | Non-specific |
| **SpO2** | Pulse oximetry | Validated (bias in dark skin) | Accepted with caveats | Skin pigmentation bias |
| **Blood pressure** | Cuffless PPG | Emerging | Not yet primary endpoint | Accuracy insufficient |
| **Glucose (CGM)** | Subcutaneous sensor | Well-validated | Accepted (diabetes) | Not approved for all indications |
| **Sleep** | Actigraphy + PPG | Moderate | Accepted (sleep disorders) | Not equivalent to PSG |
| **ECG rhythm** | Single-lead patch | Well-validated | Accepted (AF detection) | Not 12-lead equivalent |
| **Respiratory rate** | PPG/impedance | Moderate | Emerging | Accuracy variable |

**Rule**: Digital/wearable endpoints MUST be validated against gold-standard measurements before use as primary endpoints. Actigraphy-based sleep staging ≠ PSG-based sleep staging.
**Rule**: Decentralized trials risk EXCLUDING patients without digital literacy or internet access. This creates a SELECTION BIAS that may reduce generalizability.
**Rule**: eConsent must demonstrate EQUIVALENT comprehension to in-person consent. A click-through form without comprehension check is NOT informed consent.

---

## Master Protocol & Platform Trial Design

### Master Protocol Types Comparison

| Type | Population | Intervention | Biomarker | Example | Best For |
|------|-----------|-------------|-----------|---------|----------|
| **Basket** | Multiple cancer types, same mutation | Same drug | Yes (mutation) | VEMURAFENIB in BRAF V600 | Tissue-agnostic approval |
| **Umbrella** | Single cancer type, multiple subtypes | Different drugs per subtype | Yes (subtype) | NCI-MATCH, I-SPY2 | Precision oncology |
| **Platform** | Broad population | Multiple drugs; add/drop | Optional | RECOVERY, REMAP-CAP | Pandemic; rapid evaluation |

### Platform Trial Statistical Considerations

| Aspect | Method | Key Requirement | Common Error |
|--------|--------|----------------|-------------|
| **Shared control** | Concurrent + historical | Time trend monitoring | Ignoring time trends in SOC |
| **Allocation ratio** | Varies by arm; may adapt | Pre-specified ratios | Unequal randomization without justification |
| **Interim analysis** | Per-arm; Bayesian or frequentist | Pre-specified stopping rules | Ad hoc arm addition without statistical plan |
| **Multiplicity** | Per-arm control; no cross-arm penalty | Each arm vs control independently | Over-correcting across independent arms |
| **Time trends** | Time-adjusted analysis | Monitor for secular trends | Assuming stable SOC over years |
| **Arm addition** | Pre-specified in master protocol | Statistical plan for new arms | Adding arms without statistical framework |
| **Arm graduation** | Pre-specified superiority/futility criteria | Bayesian posterior probability | Vague "promising" criteria |

### RECOVERY Trial Design Lessons

| Feature | Implementation | Why It Worked | Lesson |
|---------|---------------|---------------|--------|
| **Broad eligibility** | Hospitalized COVID-19; minimal exclusion | Rapid enrollment (40,000+ in 1 year) | Simpler criteria = faster enrollment |
| **Simple interventions** | Widely available drugs (dexamethasone, tocilizumab) | Immediate global impact | Use accessible interventions |
| **Minimal data collection** | ~15 data fields at baseline; outcome at 28 days | Reduced site burden | Less data = more patients |
| **Adaptive design** | Add/drop arms based on interim analysis | Efficient resource use | Platform design enables rapid learning |
| **Shared control** | All arms share same control group | 30-50% fewer patients needed | Shared control is the key efficiency gain |
| **Rapid dissemination** | Preprint + press release before publication | Immediate clinical practice change | Speed of dissemination matters |

---

## Clinical Trial Simulation

### Trial Simulation Framework

| Component | Method | Purpose | Tool |
|-----------|--------|---------|------|
| **Disease progression model** | Parametric survival; Markov | Simulate patient trajectories | SimTrial, FACTS |
| **Enrollment model** | Poisson process; Bayesian | Predict accrual rates | EAST, SimTrial |
| **Treatment effect model** | Hazard ratio; risk difference | Simulate treatment benefit | Custom R/Python |
| **Dropout model** | Exponential; competing risks | Simulate patient dropout | Custom |
| **Interim analysis** | Conditional power; predictive probability | Simulate DSMB decisions | EAST |
| **Operating characteristics** | 10,000+ simulations | Type I error, power, expected sample size | Custom |

### Simulation-Based Sample Size Justification

| Scenario | When to Use | Advantage | Over Traditional Formula |
|----------|------------|-----------|------------------------|
| **Complex design** | Adaptive; platform; multi-arm | Handles complexity | Formulas don't exist |
| **Non-proportional hazards** | Immuno-oncology; delayed effect | Accurate power estimation | Log-rank formula overestimates power |
| **Multiple endpoints** | Co-primary; composite | Joint distribution | Univariate formulas insufficient |
| **Cluster correlation** | Cluster RCT; stepped wedge | Proper ICC modeling | Simple inflation may be wrong |
| **Time-varying effects** | Crossover; treatment switching | Accounts for treatment changes | ITT assumption violated |

**Rule**: Simulation-based sample size is REQUIRED for any trial with non-proportional hazards (common in immuno-oncology), adaptive design, or complex correlation structures. Standard formulas will give WRONG answers.
**Rule**: The minimum number of simulations for operating characteristics is 10,000. Fewer simulations produce unreliable Type I error estimates.

---

## Clinical Trial Quality Checklist

| Item | Required | Common Failure |
|------|----------|---------------|
| Primary endpoint clinically meaningful and validated | ✅ | Surrogate without validation |
| Sample size justified with realistic effect size | ✅ | Overoptimistic effect size from Phase II |
| Randomization method specified (central, stratified) | ✅ | Quasi-randomization |
| Blinding level appropriate for phase | ✅ | Open-label Phase III |
| Multiplicity adjustment for multiple endpoints | ✅ | No adjustment |
| Interim analysis pre-specified with stopping rules | ✅ | Ad hoc interim looks |
| DSMB charter for Phase III | ✅ | No DSMB |
| Inclusion/exclusion criteria justified | ✅ | Overly restrictive (slow enrollment) |
| Control arm appropriate (active vs placebo) | ✅ | Placebo when active control exists |
| Safety monitoring plan | ✅ | No AE reporting plan |
| Statistical analysis plan before database lock | ✅ | SAP after unblinding |
| Subgroup analyses pre-specified | ✅ | Post-hoc subgroup claims |
| Missing data handling plan | ✅ | No plan for missing data |
| Non-inferiority margin justified (if applicable) | ✅ | Arbitrary margin |
| Biomarker assay validated (if biomarker-stratified) | ✅ | Unvalidated assay |
| Enrollment projection realistic | ✅ | 5-10× overestimate |
| Competitive landscape assessed | ✅ | Unaware of competing trials |
| Data safety monitoring plan | ✅ | No stopping rules for safety |
