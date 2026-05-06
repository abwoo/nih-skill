# Clinical Documentation & Decision Support Protocol

## Clinical Report Types & Standards

### Report Type Classification

| Report Type | Standard/Guideline | Key Sections | Compliance |
|-------------|-------------------|--------------|------------|
| **Case Report** | CARE (CAse REport) | Title, keywords, introduction, patient info, timeline, diagnostic findings, therapeutic interventions, follow-up, discussion | CARE checklist 13 items |
| **Diagnostic Report** | ACR/RCP/Lab standards | Clinical indication, technique, findings, impression/recommendation | Specialty-specific |
| **Clinical Trial Report** | ICH-E3 | Title, synopsis, ethics, investigators, methods, efficacy results, safety results, discussion, appendices | ICH-E3 + FDA/EMA |
| **Clinical Study Report (CSR)** | ICH-E3 R1 | Full protocol results with statistical analysis, safety narratives, individual patient data listings | Regulatory submission |
| **SOAP Note** | Standard clinical | Subjective, Objective, Assessment, Plan | Clinical documentation |
| **H&P (History & Physical)** | Joint Commission | Chief complaint, HPI, PMH, ROS, physical exam, assessment, plan | Hospital admission |
| **Discharge Summary** | Joint Commission | Admission diagnosis, hospital course, discharge diagnosis, medications, follow-up, patient instructions | Transition of care |
| **Operative Note** | CMS/Joint Commission | Pre-op diagnosis, post-op diagnosis, procedure, findings, specimens, EBL, complications | Surgical documentation |
| **Pathology Report** | CAP protocols | Specimen, diagnosis, tumor size, grade, margins, staging, biomarkers | CAP cancer protocols |
| **Radiology Report** | ACR | Indication, comparison, technique, findings, impression | ACR Practice Parameters |

### CARE Guidelines — Case Report Checklist

| # | Item | Description |
|---|------|-------------|
| 1 | Title | Words "case report" + most important finding |
| 2 | Key Words | 2-5 keywords identifying the case |
| 3 | Introduction | Brief background; why case is important |
| 4 | Patient Information | Demographics, symptoms, medical/family/psycho-social history |
| 5 | Clinical Findings | Physical exam; relevant clinical findings |
| 6 | Timeline | Visual timeline of dates and events |
| 7 | Diagnostic Assessment | Diagnostic methods; challenges; reasoning |
| 8 | Therapeutic Intervention | Types of intervention; administration; changes |
| 9 | Follow-up and Outcomes | Summary; adherence; adverse events |
| 10 | Discussion | Strengths/limitations; relevant literature; rationale |
| 11 | Patient Perspective | Patient's own experience in their words |
| 12 | Informed Consent | Did patient provide informed consent? |

### SOAP Note Structure

| Section | Content | Example |
|---------|---------|---------|
| **S (Subjective)** | Patient's complaints, symptoms, history in their words | "Chest pain for 2 hours, radiating to left arm" |
| **O (Objective)** | Vital signs, physical exam, lab results, imaging | BP 160/95, HR 98, troponin 0.8 ng/mL |
| **A (Assessment)** | Diagnosis, differential, clinical reasoning | Acute coronary syndrome vs GERD vs anxiety |
| **P (Plan)** | Treatment, further testing, referrals, follow-up | Heparin drip, cardiology consult, serial troponins |

### ICH-E3 Clinical Study Report Structure

1. Title Page
2. Synopsis
3. Table of Contents
4. List of Abbreviations
5. Ethics Committee / IRB
6. Investigators and Study Administrative Structure
7. Introduction
8. Study Objectives
9. Investigational Plan (design, population, treatments, endpoints, sample size, analysis)
10. Study Patients (disposition, protocol deviations)
11. Efficacy Evaluation (primary, secondary, exploratory)
12. Safety Evaluation (exposure, adverse events, lab data, vital signs)
13. Discussion and Overall Conclusions
14. Tables, Figures, Graphs
15. Reference List
16. Appendices

---

## Clinical Decision Support (CDS) Document Generation

### CDS Document Types

| CDS Type | Purpose | Key Components | Evidence Standard |
|----------|---------|----------------|-------------------|
| **Patient Cohort Analysis** | Identify patient subgroups for targeted therapy | Inclusion/exclusion criteria, demographics, biomarker prevalence, outcomes | Real-world evidence |
| **Treatment Recommendation** | Guide clinical decision-making | Indication, contraindications, dosing, alternatives, monitoring | GRADE evidence grading |
| **Biomarker Integration Report** | Link biomarkers to treatment decisions | Biomarker, test method, prevalence, predictive value, therapeutic implications | Clinical validation |
| **Statistical Output Report** | Quantify treatment effects | Hazard ratios, survival curves, confidence intervals, NNT | Statistical rigor |

### GRADE Evidence Grading System

| Grade | Quality | Interpretation | Implication |
|-------|---------|---------------|-------------|
| **A (High)** | RCTs without important limitations | Confident that effect estimate is close to true effect | Strong recommendation |
| **B (Moderate)** | RCTs with important limitations; exceptionally strong observational | Moderate confidence in effect estimate | Moderate recommendation |
| **C (Low)** | Observational studies with important limitations | Limited confidence in effect estimate | Weak recommendation |
| **D (Very Low)** | Case series; expert opinion | Very little confidence in effect estimate | Insufficient evidence |

### GRADE Assessment Dimensions

| Factor | Upgrades | Downgrades |
|--------|----------|-----------|
| **Risk of bias** | — | Serious/very serious limitation |
| **Inconsistency** | — | Substantial heterogeneity (I² >50%) |
| **Indirectness** | — | Indirect population/intervention/comparison/outcome |
| **Imprecision** | — | Wide CI; small sample; optimal information size not met |
| **Publication bias** | — | Strong suspicion of publication bias |
| **Large effect** | Large magnitude (RR >2 or <0.5) | — |
| **Dose-response** | Evidence of gradient | — |
| **Confounding** | All plausible confounders would reduce effect | — |

---

## Clinical Practice Guidelines Retrieval & Integration

### Major Guideline Sources

| Source | Coverage | Update Frequency | URL/Access |
|--------|----------|-----------------|------------|
| **NICE** (UK) | All specialties; health technology assessment | 3-5 year review | nice.org.uk |
| **WHO** | Global; infectious disease; public health | Variable | who.int/publications/guidelines |
| **ADA** (American Diabetes Association) | Diabetes; endocrinology | Annual (Standards of Care) | diabetes.org |
| **AHA/ACC** (American Heart/College of Cardiology) | Cardiology; cardiovascular | 3-5 year review | ahajournals.org |
| **NCCN** (National Comprehensive Cancer Network) | Oncology; all cancer types | Annual | nccn.org |
| **SIGN** (Scottish Intercollegiate Guidelines) | Multiple specialties | 5 year review | sign.ac.uk |
| **CPIC** (Clinical Pharmacogenetics Implementation) | Pharmacogenomics; drug-gene pairs | As evidence emerges | cpicpgx.org |
| **ESMO** (European Society for Medical Oncology) | Oncology | 2-3 year review | esmo.org |
| **ASCO** (American Society of Clinical Oncology) | Oncology | 2-3 year review | asco.org |
| **KDIGO** (Kidney Disease Improving Global Outcomes) | Nephrology | 3-5 year review | kdigo.org |

### Guideline Quality Assessment (AGREE II)

| Domain | Items | Key Question |
|--------|-------|-------------|
| **Scope & Purpose** | 3 | Are objectives and clinical questions specific? |
| **Stakeholder Involvement** | 3 | Were target users and patients involved? |
| **Rigor of Development** | 8 | Were systematic methods used for evidence search and selection? |
| **Clarity of Presentation** | 3 | Are recommendations specific and identifiable? |
| **Applicability** | 4 | Are facilitators/barriers to application described? |
| **Editorial Independence** | 2 | Are conflicts of interest disclosed? |

### Guideline Integration into AI Assessment

**Rule**: When evaluating a medical AI paper, check whether the AI's recommendations ALIGN with current clinical guidelines. An AI that contradicts established guidelines without strong evidence is a RED FLAG.
**Rule**: Clinical guidelines have a HALF-LIFE of 3-5 years. An AI trained on guidelines >5 years old may be giving outdated recommendations. Always check guideline currency.
**Rule**: Multiple guidelines may exist for the same condition (e.g., AHA vs ESC for atrial fibrillation). AI must specify WHICH guideline it follows and acknowledge alternatives.

---

## FHIR API Development Guide

### FHIR Resource Types for Medical AI

| Resource | Purpose | Key Fields | AI Integration |
|----------|---------|-----------|---------------|
| **Patient** | Demographics | name, birthDate, gender, identifier | Patient cohort selection |
| **Observation** | Lab values, vitals | code, value, effectiveDateTime, referenceRange | Input features for AI models |
| **Condition** | Diagnoses | code, clinicalStatus, verificationStatus | Ground truth labels |
| **MedicationRequest** | Prescriptions | medication, dosageInstruction, status | Treatment outcome analysis |
| **DiagnosticReport** | Imaging/lab reports | code, conclusion, presentedForm | NLP input; AI output |
| **Procedure** | Interventions | code, performedDateTime, outcome | Treatment tracking |
| **Encounter** | Visits/admissions | type, period, reasonCode | Episode of care |
| **ImagingStudy** | DICOM references | series, instance, endpoint | Imaging AI input |
| **GenomicStudy** | Genetic testing | focus, interpreter, reasonCode | Genomics AI input |

### FHIR API Endpoint Patterns

```
GET /Patient/{id}                          — Read patient
GET /Patient?name=Smith&birthdate=1990     — Search patients
POST /Observation                          — Create observation
PUT /Condition/{id}                        — Update condition
GET /Observation?patient={id}&code=2345-7  — Glucose for patient
GET /MedicationRequest?patient={id}&status=active — Active medications
```

### FHIR for AI Model Integration

| Integration Point | FHIR Resource | Direction | Example |
|-------------------|--------------|-----------|---------|
| **AI Input** | Observation, Condition | Read | Fetch patient vitals for sepsis prediction |
| **AI Output** | Observation (with device reference) | Write | Store AI-generated risk score |
| **Decision Support** | ServiceRequest, CarePlan | Write | Generate AI-guided care plan |
| **Audit Trail** | Provenance | Write | Log AI model version and confidence |
| **Population Health** | Measure, MeasureReport | Read/Write | Cohort-level AI analytics |

**Rule**: AI-generated predictions stored in FHIR MUST include: (1) Provenance resource linking to AI model version, (2) confidence score in Observation.interpretation, (3) reference to input data used.
**Rule**: FHIR Observation resources from AI models should use a device reference to identify the AI system, NOT a practitioner reference. This distinguishes AI-generated from human-generated observations.

---

## Patient Communication & Health Literacy

### Medical Document Simplification Protocol

| Original | Simplified | Principle |
|----------|-----------|-----------|
| "Myocardial infarction" | "Heart attack" | Use common terms |
| "Hypertension" | "High blood pressure" | Replace jargon |
| "NPO after midnight" | "Don't eat or drink after midnight" | Expand abbreviations |
| "BID dosing" | "Take twice a day" | Use everyday language |
| "Prognosis is guarded" | "The outlook is uncertain" | Avoid euphemisms |
| "Negative for malignancy" | "No cancer was found" | Use positive framing |

### Health Literacy Assessment

| Level | Reading Level | Comprehension | Document Adaptation |
|-------|--------------|---------------|-------------------|
| **Basic** | Below 5th grade | Understands simple words | Pictures + very simple text |
| **Below Basic** | 5th-8th grade | Can read simple health materials | Short sentences; common words |
| **Intermediate** | 9th-12th grade | Can read moderately complex health info | Standard patient education |
| **Proficient** | Above 12th grade | Can read complex health info | Standard medical documents |

**Rule**: Patient-facing AI output MUST be at or below 6th grade reading level (Flesch-Kincaid). Use readability scoring before deployment.
**Rule**: Always provide key information in the patient's preferred language. Machine translation of medical content requires clinical review.
**Rule**: When simplifying medical documents, do NOT remove critical safety information (contraindications, warning signs, emergency instructions).

---

## Medical Entity Extraction Protocol

### Entity Types & Extraction Framework

| Entity Type | Examples | Extraction Method | Validation |
|-------------|---------|-------------------|-----------|
| **Symptoms** | Chest pain, dyspnea, fatigue | NER + negation detection | Clinical context verification |
| **Medications** | Metformin 500mg BID | NER + dosage extraction | Drug database cross-reference |
| **Lab Values** | Troponin 0.8 ng/mL, HbA1c 7.2% | NER + unit normalization | Reference range check |
| **Diagnoses** | Type 2 DM, ACS, COPD | NER + ICD mapping | ICD code verification |
| **Procedures** | Cardiac catheterization, CABG | NER + CPT mapping | Procedure database check |
| **Allergies** | Penicillin, contrast dye | NER + negation + certainty | Allergy list verification |
| **Vital Signs** | BP 160/95, HR 98, SpO2 94% | Regex + normalization | Physiological range check |
| **Temporal** | "2 hours ago", "since 2020", "for 3 days" | Temporal NER | Timeline consistency |

### Extraction Quality Assessment

| Metric | Definition | Threshold | Clinical Impact |
|--------|-----------|-----------|----------------|
| **Precision** | Correct extractions / Total extractions | >0.90 | False positives → incorrect treatment |
| **Recall** | Correct extractions / Total true entities | >0.85 | False negatives → missed conditions |
| **F1** | Harmonic mean of precision and recall | >0.87 | Balance of both |
| **Negation Accuracy** | Correct negation handling / Total negated entities | >0.95 | "No history of" misread as positive = DANGEROUS |

**Rule**: Negation detection is the MOST CRITICAL component of medical entity extraction. A missed negation ("no penicillin allergy" → "penicillin allergy") can be LIFE-THREATENING.
**Rule**: Dosage extraction must normalize units (e.g., "0.5 g" = "500 mg"). Unit confusion is a leading cause of medication errors.
**Rule**: Entity extraction for clinical use MUST be validated on the target institution's data. Performance on benchmark data does not guarantee production performance.
