// ═══════════════════════════════════════════════════════════
// 🧬 BME RESEARCH ACCELERATOR - SKILL COMPLETE ENGINE
// Complete encapsulation of SKILL.md protocol into executable code
// ═══════════════════════════════════════════════════════════

// ╔════════════════════════════════════════════════════════╗
// ║  SECTION 1: REFERENCE KNOWLEDGE BASE (from SKILL.md)    ║
// ╚════════════════════════════════════════════════════════╝

export const REFERENCE_FILES: Record<string, {
  filename: string
  content: string
  loadWhen: string[]
  keywords: string[]
}> = {
  "ecg-methodology": {
    filename: "references/ecg-methodology.md",
    content: "ECG landmark papers, method matching matrix, reproduction difficulty predictor, automatic thinking protocol, wearable ECG, AI-ECG cross-disease screening, DULCE trial (AI-ECG liver disease RCT)",
    loadWhen: ["ecg", "arrhythmia", "qrs", "heart", "cardiac", "af", "wearable ecg", "liver disease ecg", "dulce"],
    keywords: ["ecg", "ekg", "cardiac", "arrhythmia", "qrs", "afib", "wearable"]
  },
  "eeg-bci-methodology": {
    filename: "references/eeg-bci-methodology.md",
    content: "EEG/BCI landmark papers, CSP pipeline, sleep staging, preprocessing decision tree, SSVEP, real-time BCI, intracranial EEG, EEG foundation models (REVE/BrainPro/LaBraM), ICLR 2026 benchmark",
    loadWhen: ["eeg", "bci", "sleep", "motor imagery", "brain", "ssvep", "intracranial", "reve", "brainpro", "labram"],
    keywords: ["eeg", "bci", "brain", "motor imagery", "sleep staging", "ssvep"]
  },
  "deep-learning-bme": {
    filename: "references/deep-learning-bme.md",
    content: "DL architecture selection, training protocol, distributed training, augmentation, evaluation, GNN, diffusion models, SSL, distillation, federated learning, active learning, uncertainty quantification, XAI, multimodal VLM (BiomedCLIP/LLaVA-Med), synthetic data generation, medical AI benchmarking (MedQA/MMLU/HELM), rare disease AI (few-shot/zero-shot/long-tail), adversarial robustness, continual & lifelong learning, domain adaptation, medical foundation models (BrainIAC/TITAN/MUSK), FHAIM fully homomorphic synthetic data, multi-agent medical AI systems",
    loadWhen: ["deep learning", "cnn", "transformer", "model", "architecture", "gpu", "training", "gnn", "graph", "diffusion", "federated", "uncertainty", "xai", "explainability", "vlm", "vision-language", "multimodal", "synthetic data", "gan", "benchmark", "medqa", "mmlu", "rare disease", "few-shot", "zero-shot", "long-tail", "adversarial", "robustness", "distribution shift", "scanner shift", "continual learning", "lifelong learning", "catastrophic forgetting", "pccp", "domain adaptation", "dann", "test-time adaptation", "style transfer", "prompt tuning", "fgsm", "pgd", "corruption error", "subgroup robustness", "ewc", "replay", "adaptive algorithm", "bn adaptation", "brainiac", "titan", "musk", "foundation model", "fhaim", "homomorphic encryption", "multi-agent", "agentic ai"],
    keywords: ["deep learning", "cnn", "rnn", "transformer", "neural network", "gnn", "diffusion", "ssl", "xai", "vlm", "federated", "uncertainty"]
  },
  "clinical-statistical-framework": {
    filename: "references/clinical-statistical-framework.md",
    content: "TRIPOD, STARD, statistical rigor, evidence levels, regulatory science (FDA/EU AI Act), causal inference, survival analysis, competing risks, composite endpoints, missing data (MICE), CDSS integration, alert fatigue, human-AI collaboration, public health/epidemiological AI, RL for treatment optimization (DTR/offline RL/CQL), medical AI data engineering (FHIR/OMOP/ETL/data quality), emergency/critical care AI (sepsis/early warning/ED triage), pediatric/neonatal AI (NICU/CTG/fetal), chronic disease AI (diabetes/CGM/insulin), neurology AI (Alzheimer's/Parkinson's/stroke/epilepsy/dementia), cardiovascular AI (echocardiography/coronary/heart failure/cardiac MRI), infectious disease AI (epidemic forecasting/AMR/vaccine effectiveness/antibiotic stewardship), respiratory AI (COPD/asthma/pulmonary fibrosis/sleep apnea/ventilator), women's health AI (preeclampsia/cervical cancer/IVF embryo/gestational diabetes), anesthesiology AI (perioperative/hypotension prediction/anesthesia depth/PONV/delirium), EU AI Act implementation (GPAI/MDR dual compliance/CSEDB), FDA PCCP 2025 final guidance",
    loadWhen: ["clinical validation", "evaluation", "statistics", "evidence", "regulatory", "fda", "510k", "causal", "survival", "cox", "competing risk", "missing data", "cdss", "alert fatigue", "human-ai", "epidemiology", "outbreak", "surveillance", "rl", "reinforcement learning", "dtr", "offline rl", "cql", "fhir", "omop", "data engineering", "data quality", "sepsis", "early warning", "triage", "nicu", "neonatal", "pediatric", "fetal", "ctg", "diabetes", "cgm", "insulin", "glucose", "alzheimer's", "parkinson's", "stroke", "epilepsy", "dementia", "apoe", "amyloid", "mci", "seizure", "echocardiography", "coronary", "heart failure", "cardiac mri", "aortic stenosis", "amr", "antimicrobial resistance", "epidemic", "vaccine effectiveness", "antibiotic stewardship", "copd", "asthma", "pulmonary fibrosis", "sleep apnea", "ventilator", "preeclampsia", "cervical cancer", "ivf", "gestational diabetes", "preterm birth", "anesthesiology", "perioperative", "hypotension", "ponv", "delirium", "fluid responsiveness", "art line", "central venous pressure", "map", "svr", "scvo2", "ppv"],
    keywords: ["clinical", "statistics", "tripod", "stard", "evidence", "regulatory", "fda", "survival", "causal"]
  },
  "signal-processing-foundations": {
    filename: "references/signal-processing-foundations.md",
    content: "ECG/EEG/PPG pipelines, frequency bands, signal quality, HRV analysis, auscultation/lung sounds, voice biomarkers, ultrasound RF, time-series foundation models, wearable deployment, rehabilitation AI (prosthetic control/exoskeleton/stroke recovery/gait analysis), advanced PPG (respiratory rate/cuffless BP/AF detection/skin pigmentation bias), BCG/SCG (ballistocardiography/seismocardiography/cardiac output/systolic time intervals), SleepFM sleep-based disease risk, smartwatch heart failure monitoring",
    loadWhen: ["preprocessing", "filtering", "denoising", "artifact", "auscultation", "lung sound", "voice", "ultrasound", "wearable", "biosignal foundation model", "rehabilitation", "prosthetic", "exoskeleton", "gait", "emg", "motor recovery", "ppg", "photoplethysmography", "respiratory rate", "cuffless bp", "pulse transit time", "af detection", "skin pigmentation", "ballistocardiography", "bcg", "seismocardiography", "cardiac output", "systolic time intervals", "pep", "lvet", "j-wave", "force plate", "mattress sensor", "sleepfm", "sleep disease risk", "smartwatch", "heart failure monitoring", "pvo2"],
    keywords: ["signal processing", "ecg", "eeg", "ppg", "preprocessing", "filtering", "artifact removal"]
  },
  "physionet-datasets": {
    filename: "references/physionet-datasets.md",
    content: "Dataset reference table, MIMIC-IV sub-modules, experiment roadmaps, credentialing guide, new datasets, quality assessment",
    loadWhen: ["physionet", "dataset", "data acquisition", "mimic", "eicu", "ecg benchmark"],
    keywords: ["physionet", "dataset", "mimic", "eicu", "benchmark"]
  },
  "database-api-guide": {
    filename: "references/database-api-guide.md",
    content: "All database URLs, API endpoints, routing guide (imaging, genomics, drug, AI models, real-world data, cohort studies)",
    loadWhen: ["literature search", "data access", "api", "tcia", "gdc", "hugging face", "seer", "medicare"],
    keywords: ["api", "database", "tcia", "gdc", "seer", "huggingface"]
  },
  "research-synthesis-matching": {
    filename: "references/research-synthesis-matching.md",
    content: "Matching algorithm, synthesis protocols, method flow, automatic thinking chain, full routing rules - THIS IS THE BRAIN",
    loadWhen: [], // ALWAYS loaded first per SKILL.md rules
    keywords: ["all queries"] // Universal brain
  },
  "medical-imaging-methodology": {
    filename: "references/medical-imaging-methodology.md",
    content: "Radiology AI, pathology WSI pipeline, segmentation (nnU-Net/SAM), foundation models, evaluation framework, digital pathology pipeline, endoscopy AI, ophthalmology AI, radiology report generation, surgical AI & robot-assisted surgery, dermatology AI (ISIC/melanoma), medical image quality assessment, oncology AI (radiotherapy/immunotherapy/chemotherapy), radiology workflow AI (worklist prioritization/critical finding alert), hematology AI (blood smear/leukemia subtyping/malaria detection/RBC morphology), musculoskeletal AI (fracture detection/bone age/osteoarthritis/spine analysis), vascular interventional robotic AI (endovascular navigation/TAVI guidance), MASAI RCT mammography screening",
    loadWhen: ["medical imaging", "radiology", "pathology", "segmentation", "ct", "mri", "x-ray", "wsi", "endoscopy", "ophthalmology", "report generation", "surgical ai", "robot-assisted", "phase recognition", "dermatology", "skin lesion", "melanoma", "isic", "image quality", "oncology", "radiotherapy", "immunotherapy", "chemotherapy", "worklist", "critical finding", "triage", "hematology", "blood smear", "leukemia", "malaria", "sickle cell", "rbc morphology", "cbc", "musculoskeletal", "fracture", "bone age", "osteoarthritis", "spine", "orthopedic", "endovascular", "vascular intervention", "tavi", "catheter", "guidewire", "masai", "mammography screening", "ai screening rct"],
    keywords: ["imaging", "radiology", "pathology", "ct", "mri", "segmentation"]
  },
  "reproducibility-infrastructure": {
    filename: "references/reproducibility-infrastructure.md",
    content: "Reproducibility stack, Docker templates, deterministic training, TRIPOD+AI, model cards, data sheets, MLOps, model drift detection, version governance, AI deployment & implementation science (workflow integration/phased rollout/alert fatigue mitigation/ROI measurement/shadow mode)",
    loadWhen: ["reproducibility", "docker", "model card", "data sheet", "experiment tracking", "tripod", "mlops", "drift", "monitoring", "deployment", "implementation science", "workflow integration", "shadow mode", "phased rollout", "roi measurement", "maintenance gap", "alert fatigue mitigation", "automation bias", "clinician adoption"],
    keywords: ["reproducibility", "docker", "mlops", "model card", "deployment"]
  }
}

// Reference Loading Rules (from SKILL.md lines 47-73)
export const REFERENCE_LOADING_RULES = [
  { rule: "ALWAYS load research-synthesis-matching first", priority: 0 },
  { rule: "Load domain-specific references based on matching algorithm output", priority: 1 },
  { rule: "Load maximum 4 reference files per response to maintain focus", priority: 2 },
  { rule: "For imaging queries: load medical-imaging-methodology + database-api-guide", priority: 3 },
  { rule: "For NLP/LLM queries: load clinical-nlp-llm-methodology + clinical-statistical-framework", priority: 4 },
  { rule: "For genomics queries: load genomics-bioinformatics-methodology + database-api-guide", priority: 5 },
  { rule: "For regulatory/clinical deployment queries: load clinical-statistical-framework + research-ethics-fairness", priority: 6 },
  { rule: "For reproducibility/infrastructure queries: load reproducibility-infrastructure + deep-learning-bme", priority: 7 },
]

// ╔════════════════════════════════════════════════════════╗
// ║  SECTION 2: AUTOMATIC REASONING PROTOCOL          ║
// ╚════════════════════════════════════════════════════════╝

export const FULL_TEXT_ACQUISITION_STRATEGY = [
  { 
    priority: 1, 
    source: "PMC", 
    method: "PubMed Central Open Access", 
    url_template: "https://www.ncbi.nlm.nih.gov/pmc/articles/{pmcid}/",
    coverage: "Open-access full text"
  },
  { 
    priority: 2, 
    source: "arXiv/bioRxiv/medRxiv", 
    method: "Preprint Server Full Text", 
    url_template: "https://arxiv.org/abs/{arxiv_id}",
    coverage: "Preprint full text"
  },
  { 
    priority: 3, 
    source: "DOI redirect", 
    method: "Publisher Page via DOI Resolution", 
    url_template: "https://doi.org/{doi}",
    coverage: "Publisher page (may be paywalled)"
  },
  { 
    priority: 4, 
    source: "Semantic Scholar", 
    method: "Structured Summary + PDF Link", 
    url_template: "https://api.semanticscholar.org/graph/v1/paper/{doi}?fields=title,abstract,tldr,openAccessPdf",
    coverage: "PDF link + structured summary"
  },
  { 
    priority: 5, 
    source: "Unpaywall", 
    method: "Legal Open Access PDF", 
    url_template: "https://api.unpaywall.org/v2/{doi}?email={email}",
    coverage: "Legal open-access PDF"
  },
  { 
    priority: 6, 
    source: "Publisher Direct", 
    method: "Publisher Page (may be paywalled)", 
    url_template: "",
    coverage: "Abstract + available sections"
  },
]

// Full-Text Deep Learning Template (10 sections from SKILL.md Step 0)
export const FULL_TEXT_EXTRACTION_TEMPLATE = {
  section_1_research_problem: {
    title: "Research Problem and Motivation",
    required_fields: [
      "Core problem statement",
      "Clinical/engineering gap addressed",
      "Why existing approaches are insufficient",
      "Research hypotheses and objectives"
    ]
  },
  section_2_experimental_design: {
    title: "Complete Experimental Design",
    required_fields: [
      "Study design type (RCT, retrospective, prospective, cross-sectional)",
      "Inclusion/exclusion criteria with exact thresholds",
      "Sample size and power analysis (if reported)",
      "Study timeline and follow-up duration",
      "Ethical approval and informed consent details"
    ]
  },
  section_3_dataset_details: {
    title: "Data Sources and Dataset Details",
    required_fields: [
      "Dataset name(s), version(s), access method(s)",
      "Sample size (total, training, validation, test)",
      "Demographic composition (age, sex, race/ethnicity, comorbidities)",
      "Data collection protocol and quality control",
      "Missing data handling strategy",
      "Data splits strategy (k-fold, hold-out, temporal, site-based)"
    ],
    cross_check_with: ["physionet-datasets.md", "database-api-guide.md"]
  },
  section_4_complete_methods: {
    title: "Methods and Algorithms (COMPLETE)",
    required_fields: [
      "Algorithm/architecture design with exact specifications",
      "Input representation and feature engineering",
      "Preprocessing pipeline (filtering, normalization, augmentation)",
      "Model architecture (layers, dimensions, activation functions)",
      "Training protocol (optimizer, LR, schedule, batch size, epochs, early stopping)",
      "Loss function and regularization",
      "Hyperparameter search strategy and final values",
      "Novel methodological contributions vs. standard components",
      "Comparison/baseline methods and their configurations"
    ]
  },
  section_5_data_processing: {
    title: "Data Processing and Analysis Pipeline",
    required_fields: [
      "Raw data → processed data transformation steps",
      "Quality control and artifact removal procedures",
      "Feature extraction or representation learning approach",
      "Statistical analysis methods (tests, corrections, CI calculation)",
      "Subgroup analysis and stratification",
      "Sensitivity analysis and robustness checks"
    ]
  },
  section_6_results: {
    title: "Results (COMPLETE — All Reported)",
    required_fields: [
      "Primary outcome with exact numbers (mean±SD, median[IQR], effect size, CI, p-value)",
      "Secondary outcomes with exact numbers",
      "Subgroup analysis results",
      "Ablation study results",
      "Comparison with baselines/SOTA (exact metrics, CIs, statistical significance)",
      "Negative or null results (if reported)",
      "Failure cases and error analysis"
    ]
  },
  section_7_logic_chain: {
    title: "Research Reasoning and Logic Chain",
    required_fields: [
      "How the authors justify their methodological choices",
      "Causal reasoning chain: problem → hypothesis → design → evidence → conclusion",
      "Assumptions (explicit and implicit)",
      "Alternative explanations considered and ruled out",
      "How results support or refute the original hypothesis"
    ]
  },
  section_8_limitations: {
    title: "Limitations and Future Directions",
    required_fields: [
      "Author-stated limitations",
      "Reviewer-identified limitations (from our Fatal Blocker analysis)",
      "Generalizability constraints",
      "Open questions and proposed future work",
      "Clinical translation barriers"
    ]
  },
  section_9_reproducibility: {
    title: "Reproducibility Assessment",
    required_fields: [
      "Code availability (GitHub, supplementary, none)",
      "Data availability (public, restricted, proprietary)",
      "Hyperparameter completeness",
      "Protocol detail sufficiency for independent reproduction",
      "Computational requirements (GPU hours, memory, training time)"
    ]
  },
  section_10_knowledge_integration: {
    title: "Knowledge Integration into Skill",
    required_fields: [
      "Which reference file(s) this paper's knowledge should update",
      "Specific facts/methods/thresholds to add or revise",
      "Frontier prediction updates if applicable",
      "Innovation level assessment (L1-L5)"
    ]
  }
}

// Full-Text Learning Rules (from SKILL.md)
export const FULL_TEXT_LEARNING_RULES = [
  { rule: "NEVER analyze a paper based on title + abstract alone when user requests analysis", severity: "CRITICAL" },
  { rule: "ALWAYS attempt full-text acquisition using strategy before proceeding to Step 1", severity: "MANDATORY" },
  { rule: "If full text acquired: extract ALL 10 sections above and integrate into analysis", severity: "MANDATORY" },
  { rule: "If only abstract available: prefix with ⚠️ FULL TEXT NOT ACCESSIBLE warning", severity: "WARNING" },
  { rule: "BME Domain Focus: contextualize within biomedical engineering", severity: "ADVISORY" },
  { rule: "Full-Text Completeness Gate: verify sections 1-6 extracted before proceeding", severity: "MANDATORY" }
]

// ╔════════════════════════════════════════════════════════╗
// ║  SECTION 3: LITERATURE INTENT RECOGNITION        ║
// ╚════════════════════════════════════════════════════════╝

export const INTENT_MODES = {
  QUICK_READ: {
    name: "Quick Read",
    triggers: ["summarize", "what does this paper say", "key points", "single paper input"],
    description: "Rapid comprehension of single paper core contributions",
    priority: 2,
    workflow: "Extract key points → Summarize methodology → Highlight findings → Note limitations"
  },
  EVIDENCE_VERIFY: {
    name: "Evidence Verification",
    triggers: ["is this claim true", "verify", "evidence for", "contradicting"],
    description: "Fact-check scientific claims against evidence base",
    priority: 5,
    workflow: "Identify claim → Search supporting/contradicting evidence → Assess evidence strength → Verdict"
  },
  EXPERIMENT_REPRODUCE: {
    name: "Experiment Reproduction",
    triggers: ["reproduce", "replicate", "how to implement", "code for"],
    description: "Step-by-step blueprint to reproduce an experiment",
    priority: 6,
    workflow: "Full-text extraction → Environment setup → Data/code acquisition → Implementation steps → Validation checklist"
  },
  METHOD_COMPARE: {
    name: "Method Comparison",
    triggers: ["compare", "vs", "difference between", "multiple papers/methods"],
    description: "Multi-paper or multi-method comparative analysis",
    priority: 4,
    workflow: "Extract methods from all sources → Side-by-side comparison → Innovation delta → Paradigm mapping"
  },
  RESEARCH_IDEATION: {
    name: "Research Ideation",
    triggers: ["topic", "research gap", "new idea", "what to study", "选题"],
    description: "Identify research gaps and propose new directions",
    priority: 3,
    workflow: "Literature landscape analysis → Gap identification → Feasibility assessment → Proposal outline"
  },
  DATASET_MATCH: {
    name: "Dataset Recommendation",
    triggers: ["which dataset", "PhysioNet", "data for"],
    description: "Dataset matching and experiment roadmap generation",
    priority: 1,
    workflow: "Identify requirements → Search candidate datasets → Quality assessment → Experiment design roadmap"
  }
}

// Intent Priority Order (for auto-detection)
export const INTENT_PRIORITY_ORDER = [
  "EXPERIMENT_REPRODUCE",
  "EVIDENCE_VERIFY",
  "METHOD_COMPARE",
  "RESEARCH_IDEATION",
  "QUICK_READ",
  "DATASET_MATCH"
]

// ╔════════════════════════════════════════════════════════╗
// ║  SECTION 4: FATAL BLOCKER DETECTION              ║
// ╚════════════════════════════════════════════════════════╝

export const FATAL_BLOCKERS = [
  {
    id: "FB-1",
    name: "Data Availability",
    check: "Are datasets publicly available or has public equivalent?",
    severity_levels: ["🔴 CRITICAL", "🟡 WARNING", "🟢 OK"],
    impact: "Reproducibility blocked if proprietary without substitute",
    mitigation: "Request public release; use synthetic data; cite equivalent public datasets"
  },
  {
    id: "FB-2",
    name: "Code Availability",
    check: "Is source code released with trained weights?",
    severity_levels: ["🔴 CRITICAL", "🟡 WARNING", "🟢 OK"],
    impact: "Cannot verify implementation details",
    mitigation: "Release code on GitHub; provide Docker container; document environment setup"
  },
  {
    id: "FB-3",
    name: "Conflict of Interest",
    check: "Any undisclosed COI? Authors validating own product?",
    severity_levels: ["🔴 CRITICAL", "🟡 WARNING", "🟢 OK"],
    impact: "Potential bias in evaluation",
    mitigation: "Declare all COIs; use independent validation set; disclose funding sources"
  },
  {
    id: "FB-4",
    name: "Ground Truth Quality",
    check: "Labels independent? Agreement >75%? Expert validated?",
    severity_levels: ["🔴 CRITICAL", "🟡 WARNING", "🟢 OK"],
    impact: "Evaluation reliability compromised",
    mitigation: "Use multiple annotators; report Cohen's kappa; validate against gold standard"
  },
  {
    id: "FB-5",
    name: "Comparison Fairness",
    check: "Fair baselines? CIs non-overlapping? Same validation scope as claim?",
    severity_levels: ["🔴 CRITICAL", "🟡 WARNING", "🟢 OK"],
    impact: "Superiority claims may be unsupported",
    mitigation: "Match baseline complexity; use same train/test split; report statistical tests"
  },
  {
    id: "FB-6",
    name: "External Validation",
    check: "Validated on independent external dataset from different institution/demographic?",
    severity_levels: ["🔴 CRITICAL", "🟡 WARNING", "🟢 OK"],
    impact: "Generalizability unknown",
    mitigation: "Conduct multi-center validation; test on different populations; prospective study"
  },
  {
    id: "FB-7",
    name: "Reproducibility Path",
    check: "Can ANY part be independently reproduced?",
    severity_levels: ["🔴 CRITICAL", "🟡 WARNING", "🟢 OK"],
    impact: "Scientific verification impossible",
    mitigation: "Document all hyperparameters; release preprocessing code; specify random seeds"
  },
  {
    id: "FB-8",
    name: "Label Noise",
    check: "NLP/ICD labels validated? Noise <30%?",
    severity_levels: ["🔴 CRITICAL", "🟡 WARNING", "🟢 OK"],
    impact: "Training data quality compromised",
    mitigation: "Manual validation of sample; report noise rate; use weak supervision techniques"
  },
  {
    id: "FB-9",
    name: "Demographic Bias",
    check: "Single-center, single-ethnicity (>80%) AND no subgroup analysis?",
    severity_levels: ["🔴 CRITICAL", "🟡 WARNING", "🟢 OK"],
    impact: "Results may not generalize to diverse populations",
    mitigation: "Multi-site recruitment; stratified analysis; external validation on diverse cohorts"
  },
  {
    id: "FB-10",
    name: "Causality Claim",
    check: "Claims causation from correlational data without causal methods?",
    severity_levels: ["🔴 CRITICAL", "🟡 WARNING", "🟢 OK"],
    impact: "Invalid scientific inference",
    mitigation: "Use Mendelian randomization; instrumental variables; RCT design; state 'correlational' clearly"
  },
  {
    id: "FB-11",
    name: "Sample Size vs Complexity",
    check: "Parameters >> samples (>10:1)? DNN <1000 samples no regularization?",
    severity_levels: ["🔴 CRITICAL", "🟡 WARNING", "🟢 OK"],
    impact: "Overfitting risk extremely high",
    mitigation: "Power analysis; increase sample size; reduce model complexity; use strong regularization"
  }
]

// BME-Specific Fatal Blockers (from SKILL.md)
export const BME_SPECIFIC_BLOCKERS = {
  simulation_fea_cfd: {
    id: "BME-FE-1",
    name: "Mesh Convergence Study",
    check: "FEA/CFD paper includes GCI (Grid Convergence Index) study?",
    status: "WARNING",
    detail: "Results may be mesh-dependent without convergence proof",
    domains: ["simulation", "fea", "cfd", "computational mechanics", "finite element"]
  },
  sensor_biosensor: {
    id: "BME-FE-2",
    name: "Sensor Calibration Curve",
    check: "Biosensor paper includes calibration curve and drift analysis over time?",
    status: "WARNING",
    detail: "Clinical utility unproven without calibration data",
    domains: ["sensor", "biosensor", "wearable", "implantable sensor"]
  },
  device_medical: {
    id: "BME-FE-3",
    name: "Regulatory Context",
    check: "Paper addresses FDA 510k/PMA pathway or CE marking requirements?",
    status: "INFO",
    detail: "Clinical deployment path unclear without regulatory discussion",
    domains: ["device", "medical device", "implantable", "diagnostic device"]
  },
  implantable_invasive: {
    id: "BME-FE-4",
    name: "Biocompatibility Data",
    check: "ISO 10993 biocompatibility testing performed and reported?",
    status: "CRITICAL",
    detail: "Patient safety risk without biocompatibility validation",
    domains: ["implantable", "invasive", "stent", "pacemaker", "neurostimulator"]
  },
  in_vitro_clinical_claim: {
    id: "BME-FE-5",
    name: "In-Vitro to Clinical Claim",
    check: "Does paper make clinical efficacy claims from bench/in-vitro data only?",
    status: "CRITICAL",
    detail: "In-vitro ≠ In-vivo ≠ Clinical — this is a fatal logical leap",
    domains: ["in-vitro", "bench", "cell culture", "organoid", "animal model"]
  },
  signal_quality_reporting: {
    id: "BME-FE-6",
    name: "Signal Quality Reporting",
    check: "Biosignal paper reports proportion of discarded/artifact-contaminated data?",
    status: "WARNING",
    detail: "May hide poor signal quality affecting reported performance",
    domains: ["biosignal", "ecg", "eeg", "ppg", "emg", "mri", "ultrasound"]
  }
}

// Fatal Blocker Verdict System
export const BLOCKER_VERDICT_SYSTEM = {
  YES: { label: "✅ PASS", meaning: "Paper passes basic reproducibility checks - proceed to deeper analysis" },
  PARTIAL: { label: "⚠️ CONDITIONAL PASS", meaning: "Proceed with caution - address warnings before publication/deployment" },
  NO: { label: "❌ FAIL", meaning: "DO NOT accept conclusions without addressing critical blockers first" }
}

// ╔════════════════════════════════════════════════════════╗
// ║  SECTION 5: INNOVATION LEVEL ASSESSMENT           ║
// ╚════════════════════════════════════════════════════════╝

export const INNOVATION_LEVELS = {
  L1: {
    name: "Incremental Improvement",
    description: "Parameter tuning or minor architectural modification on existing approach",
    typical_score: "1-2/10",
    characteristics: ["Small performance gain (<5%)", "No new architectural insight", "Incremental over SOTA"],
    examples: ["Learning rate optimization", "Adding one layer to CNN", "Minor hyperparameter tweak"]
  },
  L2: {
    name: "Methodological Advancement",
    description: "Novel method with meaningful improvement; subtypes: L2b(Robustness) L2c(Benchmark) L2d(Regulatory) L2e(AI Safety) L2f(Automation)",
    typical_score: "3-4/10",
    characteristics: ["Meaningful improvement (5-15%)", "New methodological component", "Reproducible contribution"],
    subtypes: {
      L2b: "Robustness improvement (adversarial/distribution shift/scanner shift)",
      L2c: "Benchmark establishment (new dataset/protocol/metric)",
      L2d: "Regulatory compliance (FDA/EU AI Act alignment)",
      L2e: "AI safety/robustness enhancement (formal verification/certification)",
      L2f: "Automation pipeline (end-to-end automation)"
    }
  },
  L3: {
    name: "Significant Contribution",
    description: "Clear advancement with external validation and reproducible results",
    typical_score: "5-6/10",
    characteristics: ["Clear advancement in field", "External validation present", "Reproducible results reported"],
    examples: ["Novel architecture validated on multiple datasets", "New benchmark established", "Clinical pilot completed"]
  },
  L4: {
    name: "Major Breakthrough",
    description: "Paradigm-shifting contribution with widespread adoption potential",
    typical_score: "7-8/10",
    characteristics: ["Paradigm-level innovation", "Widespread community adoption potential", "Multiple follow-up works"],
    examples: ["Transformer architecture", "AlphaFold protein structure prediction", "BERT language understanding"]
  },
  L5a: {
    name: "Domain-First Disruptive",
    description: "First AI system surpasses human experts in a specific medical domain",
    typical_score: "9/10",
    characteristics: ["Human-expert-level performance in specific domain", "Validated in clinical setting", "Regulatory approval path clear"],
    examples: ["AI dermatologist outperforming board-certified", "AI ECG interpretation exceeding cardiologists"]
  },
  L5b: {
    name: "Historic Problem Solved",
    description: "Solves >10 year open problem (e.g., AlphaFold2 protein folding)",
    typical_score: "9.5/10",
    characteristics: ["Long-standing problem solved", "Community-wide recognition", "Nobel Prize caliber contribution"],
    examples: ["AlphaFold2 protein structure prediction", "COVID-19 mRNA vaccines", "CRISPR gene editing"]
  },
  L5c: {
    name: "Global Disruptive",
    description: "Paradigm shift across multiple disciplines (e.g., Transformer architecture)",
    typical_score: "10/10",
    characteristics: ["Cross-disciplinary paradigm shift", "Foundational technology", "Enables entirely new research directions"],
    examples: ["Transformer (NLP/CV/speech/bio)", "Deep Learning revolution", "CRISPR gene editing"]
  }
}

// ╔════════════════════════════════════════════════════════╗
// ║  SECTION 6: CLINICAL VALIDATION LEVELS            ║
// ╚════════════════════════════════════════════════════════╝

export const CLINICAL_VALIDATION_LEVELS = {
  V0: {
    name: "No Validation",
    description: "No experimental or clinical validation performed",
    flag: "⚠️ Limited to theoretical/conceptual claims",
    credibility: "Lowest - requires further validation before any application"
  },
  V1: {
    name: "Internal Validation",
    description: "Internal cross-validation only (k-fold, hold-out)",
    flag: "⚠️ No generalizability evidence",
    credibility: "Low - internal consistency only"
  },
  V2: {
    name: "External Validation",
    description: "Validation on external hold-out dataset from different source",
    flag: "✓ Basic generalizability shown",
    credibility: "Moderate - single external source"
  },
  V3: {
    name: "Multi-site Validation",
    description: "Multi-center/multi-site validation across institutions",
    flag: "✓✓ Strong generalizability evidence",
    credibility: "High - multiple independent validations"
  },
  V4: {
    name: "Prospective Validation",
    description: "Prospective clinical trial validation (silent/interventional)",
    flag: "✓✓✓ Real-world clinical evidence",
    credibility: "Very High - prospective evidence"
  },
  V5: {
    name: "RCT Validation",
    description: "Randomized Controlled Trial validation (gold standard)",
    flag: "✓✓✓✓ Highest clinical evidence level",
    credibility: "Highest - gold standard evidence"
  }
}

// ╔════════════════════════════════════════════════════════╗
// ║  SECTION 7: DOMAIN DETECTION ENGINE                ║
// ╚════════════════════════════════════════════════════════╝

export const DOMAIN_KEYWORD_MAP: Record<string, { primary: string[]; secondary: string[]; confidence_threshold: number }> = {
  ecg: {
    primary: ["ecg", "ekg", "heart", "cardiac", "arrhythmia", "qrs", "af", "atrial fibrillation", "ecg-dl"],
    secondary: ["signal processing", "wearable", "biosignal", "physionet"],
    confidence_threshold: 2
  },
  eeg: {
    primary: ["eeg", "brain", "bci", "motor imagery", "sleep staging", "seizure", "epilepsy"],
    secondary: ["signal processing", "neuroscience", "brain-computer interface"],
    confidence_threshold: 2
  },
  "deep learning": {
    primary: ["deep learning", "cnn", "rnn", "transformer", "neural network", "gnn", "diffusion", "ssl"],
    secondary: ["machine learning", "ai", "model", "training", "pytorch", "tensorflow"],
    confidence_threshold: 2
  },
  imaging: {
    primary: ["imaging", "x-ray", "ct", "mri", "pathology", "segmentation", "radiology", "mammography"],
    secondary: ["medical imaging", "diagnostic imaging", "computer vision", "dicom"],
    confidence_threshold: 2
  },
  genomics: {
    primary: ["genomics", "protein", "single-cell", "gwas", "rna-seq", "alpha fold", "crispr"],
    secondary: ["bioinformatics", "gene expression", "sequencing", "variant calling"],
    confidence_threshold: 2
  },
  clinical: {
    primary: ["clinical", "trial", "rct", "fda", "survival", "cohort", "epidemiology"],
    secondary: ["medicine", "healthcare", "patient", "hospital", "diagnosis"],
    confidence_threshold: 2
  },
  nlp: {
    primary: ["nlp", "llm", "ner", "rag", "clinical text", "icd", "snomed"],
    secondary: ["language model", "text mining", "clinical notes", "medical coding"],
    confidence_threshold: 2
  },
  drug: {
    primary: ["drug", "pharmacology", "compound", "target", "binding", "admet"],
    secondary: ["medicinal chemistry", "pharmaceutical", "drug discovery", "ddi"],
    confidence_threshold: 2
  },
  trial: {
    primary: ["trial", "phase i", "phase ii", "phase iii", "adaptive", "platform", "basket", "umbrella"],
    secondary: ["clinical trial", "study design", "randomization", "blinding"],
    confidence_threshold: 2
  },
  ethics: {
    primary: ["ethics", "fairness", "bias", "privacy", "consent", "accountability"],
    secondary: ["responsible ai", "equity", "discrimination", "transparency"],
    confidence_threshold: 1
  },
  reproducibility: {
    primary: ["reproducible", "docker", "mlops", "deployment", "monitoring"],
    secondary: ["experiment tracking", "version control", "model card", "open science"],
    confidence_threshold: 1
  }
}

// ╔════════════════════════════════════════════════════════╗
// ║  SECTION 8: MODULE PROTOCOL BINDINGS            ║
// ╚════════════════════════════════════════════════════════╝

export const MODULE_PROTOCOL_BINDINGS: Record<string, {
  module_id: string
  display_name: string
  primary_domain: string
  primary_references: string[]
  protocol_name: string
  protocol_steps: string[]
  focus_areas: string[]
  mandatory_tools: string[]
  output_format: string[]
}> = {
  decompose: {
    module_id: "decompose",
    display_name: "Paper Decomposition & Analysis",
    primary_domain: "deep learning",
    primary_references: ["deep-learning-bme.md", "research-synthesis-matching.md"],
    protocol_name: "Full Decomposition Protocol (Step 0-8)",
    protocol_steps: [
      "Step 0: Full-Text Acquisition (MANDATORY GATE)",
      "Step 1: Literature Intent Recognition",
      "Step 2: Reference Matching (Automatic Brain)",
      "Step 3: Fatal Blocker Detection (MANDATORY FIRST)",
      "Step 4: Deep Probe Layer",
      "Step 5: Adversarial Scientific Checking",
      "Step 6: Reproducibility Extraction",
      "Step 7: Innovation Level Assessment (L1-L5c)",
      "Step 8: Clinical Validation Assessment (V0-V5)"
    ],
    focus_areas: [
      "Paper decomposition",
      "Innovation assessment (L1-L5c)",
      "Fatal blocker detection (FB-1 to FB-11)",
      "Reproducibility scoring"
    ],
    mandatory_tools: ["fetch_paper", "parse_pdf_content", "extract_full_text_knowledge", "check_fatal_blockers", "load_reference"],
    output_format: [
      "Structured decomposition report",
      "Innovation level (L1-L5c)",
      "Blocker verdict (YES/PARTIAL/NO)",
      "Clinical validation level (V0-V5)",
      "Reproducibility score",
      "Knowledge integration recommendations"
    ]
  },
  compare: {
    module_id: "compare",
    display_name: "Multi-Paper Comparison",
    primary_domain: "deep learning",
    primary_references: ["deep-learning-bme.md", "clinical-statistical-framework.md"],
    protocol_name: "Multi-Paper Comparison Protocol",
    protocol_steps: [
      "Step 0: Full-Text Acquisition for ALL papers",
      "Step 1: Method extraction and normalization",
      "Step 2: Side-by-side comparison matrix",
      "Step 3: Innovation delta calculation",
      "Step 4: Paradigm positioning",
      "Step 5: Evidence synthesis"
    ],
    focus_areas: [
      "Method comparison",
      "Dataset comparison",
      "Innovation delta analysis",
      "Paradigm mapping"
    ],
    mandatory_tools: ["fetch_paper", "extract_full_text_knowledge", "load_reference", "search_papers"],
    output_format: [
      "Comparison matrix",
      "Innovation delta scores",
      "Paradigm position map",
      "Recommendation verdict"
    ]
  },
  reproduce: {
    module_id: "reproduce",
    display_name: "Reproduction Blueprint",
    primary_domain: "reproducibility",
    primary_references: ["reproducibility-infrastructure.md", "experimental-design-methodology.md"],
    protocol_name: "Reproduction Blueprint Protocol (Step 0-6)",
    protocol_steps: [
      "Step 0: Full-Text Acquisition (MANDATORY)",
      "Step 1: Environment specification extraction",
      "Step 2: Data/code acquisition roadmap",
      "Step 3: Step-by-step implementation guide",
      "Step 4: Validation checkpoint definition",
      "Step 5: Troubleshooting common issues",
      "Step 6: Deployment considerations"
    ],
    focus_areas: [
      "Environment setup",
      "Data/code acquisition",
      "Implementation steps",
      "Validation checkpoints"
    ],
    mandatory_tools: ["fetch_paper", "extract_full_text_knowledge", "load_reference", "check_fatal_blockers"],
    output_format: [
      "Reproduction blueprint",
      "Environment specs",
      "Code/data links",
      "Validation checklist",
      "Common pitfalls"
    ]
  },
  paradigm: {
    module_id: "paradigm",
    display_name: "Methodological Paradigm Mapping",
    primary_domain: "imaging",
    primary_references: ["medical-imaging-methodology.md", "database-api-guide.md"],
    protocol_name: "Paradigm Mapping Protocol",
    protocol_steps: [
      "Step 0: Literature survey for target domain",
      "Step 1: Method taxonomy creation",
      "Step 2: Timeline evolution mapping",
      "Step 3: Paradigm cluster identification",
      "Step 4: Gap analysis between clusters",
      "Step 5: Frontier prediction"
    ],
    focus_areas: [
      "Methodological landscape mapping",
      "Trend identification",
      "Gap analysis",
      "Frontier prediction"
    ],
    mandatory_tools: ["search_papers", "load_reference", "get_citations"],
    output_format: [
      "Paradigm map visualization",
      "Evolution timeline",
      "Gap analysis report",
      "Frontier predictions"
    ]
  },
  evidence: {
    module_id: "evidence",
    display_name: "Evidence Verification",
    primary_domain: "clinical",
    primary_references: ["clinical-statistical-framework.md", "research-synthesis-matching.md"],
    protocol_name: "Evidence Verification Protocol (TRIPOD/STARD)",
    protocol_steps: [
      "Step 0: Claim identification and structuring",
      "Step 1: Evidence search (supporting + contradictory)",
      "Step 2: Evidence quality assessment (TRIPOD/STARD)",
      "Step 3: Statistical validity checking",
      "Step 4: Causality assessment",
      "Step 5: Final verdict with confidence level"
    ],
    focus_areas: [
      "Supporting evidence collection",
      "Contradictory evidence identification",
      "Evidence strength grading",
      "Causality determination"
    ],
    mandatory_tools: ["search_papers", "load_reference", "resolve_doi", "fetch_paper"],
    output_format: [
      "Evidence table (supporting/contradicting)",
      "Quality assessment (TRIPOD/STARD)",
      "Statistical validity report",
      "Final verdict with confidence interval"
    ]
  },
  datasets: {
    module_id: "datasets",
    display_name: "Dataset Recommendation & Experiment Roadmap",
    primary_domain: "ecg",
    primary_references: ["physionet-datasets.md", "signal-processing-foundations.md"],
    protocol_name: "Dataset Recommendation + Experiment Roadmap",
    protocol_steps: [
      "Step 0: Requirement specification",
      "Step 1: Dataset candidate search",
      "Step 2: Quality assessment (size/diversity/accessibility)",
      "Step 3: Experiment design roadmap",
      "Step 4: Preprocessing pipeline specification",
      "Step 5: Evaluation metric selection"
    ],
    focus_areas: [
      "Dataset matching",
      "Experiment design",
      "Preprocessing pipeline",
      "Evaluation metrics"
    ],
    mandatory_tools: ["search_papers", "load_reference", "fetch_paper"],
    output_format: [
      "Dataset comparison table",
      "Recommended dataset(s)",
      "Experiment roadmap",
      "Preprocessing guidelines"
    ]
  },
  darwin: {
    module_id: "darwin",
    display_name: "Darwin · Idea Evolution Engine",
    primary_domain: "research-ideation",
    primary_references: ["research-synthesis-matching.md", "deep-learning-bme.md", "clinical-statistical-framework.md"],
    protocol_name: "Darwin Evolution Protocol (6 Operators)",
    protocol_steps: [
      "Step 0: Seed Idea Analysis & Domain Identification",
      "Step 1: Operator Selection (Transplant/Constrain/Fuse/Invert/Minimal/Extreme)",
      "Step 2: Cross-Domain Knowledge Retrieval",
      "Step 3: Idea Mutation & Recombination",
      "Step 4: Innovation Level Assessment (L1-L5c)",
      "Step 5: Feasibility & Impact Evaluation"
    ],
    focus_areas: [
      "Cross-domain method transplantation",
      "Resource-constrained adaptation",
      "Paradigm fusion strategies",
      "Objective inversion & minimal viable validation",
      "Scaling law extrapolation"
    ],
    mandatory_tools: ["load_reference", "search_papers", "extract_full_text_knowledge", "check_fatal_blockers"],
    output_format: [
      "Evolved idea cards (3-5 variants)",
      "Novelty assessment (L1-L5c per variant)",
      "Feasibility score (Low/Medium/High)",
      "Research roadmap suggestion",
      "Send-to-Decompose integration"
    ]
  }
}

// ╔════════════════════════════════════════════════════════╗
// ║  SECTION 9: OUTPUT FORMAT SPECIFICATIONS         ║
// ╚════════════════════════════════════════════════════════╝

export const OUTPUT_FORMAT_SPEC = {
  // Standard response structure following SKILL.md format
  standard_response: {
    header: {
      skill_module: "string - which module was used",
      protocol_followed: "string[] - which steps were executed",
      references_loaded: "string[] - which reference files were consulted",
      timestamp: "ISO date string"
    },
    body: {
      executive_summary: "string - 3-5 sentence overview",
      detailed_analysis: "object - structured by step/section",
      innovation_level: "L1-L5c | null",
      clinical_validation_level: "V0-V5 | null",
      fatal_blocker_verdict: "YES/PARTIAL/NO",
      reproducibility_score: "0-100 | null",
      actionable_recommendations: "string[] - concrete next steps"
    },
    footer: {
      confidence_level: "HIGH/MEDIUM/LOW",
      knowledge_gaps: "string[] - what couldn't be determined",
      suggested_follow_up: "string[] - what user should ask next"
    }
  },
  
  // Analysis-specific formats
  decompose_output: {
    sections: [
      "1. Paper Overview (title, authors, year, venue)",
      "2. Research Problem & Gap Addressed",
      "3. Methodology Summary (architecture, data, training)",
      "4. Key Results (with exact metrics)",
      "5. Innovation Assessment (L1-L5c with justification)",
      "6. Fatal Blocker Check (FB-1 to FB-11 results)",
      "7. Clinical Validation Level (V0-V5)",
      "8. Reproducibility Assessment",
      "9. Limitations Identified",
      "10. Knowledge Integration Recommendations"
    ]
  },
  
  compare_output: {
    sections: [
      "1. Comparison Matrix (papers × dimensions)",
      "2. Method Architecture Comparison",
      "3. Dataset & Preprocessing Comparison",
      "4. Results & Metrics Comparison",
      "5. Innovation Delta Analysis",
      "6. Paradigm Position Map",
      "7. Synthesis & Recommendations"
    ]
  },
  
  reproduce_output: {
    sections: [
      "1. Environment Specifications",
      "2. Required Dependencies & Versions",
      "3. Data Acquisition Instructions",
      "4. Code Repository Links (if available)",
      "5. Step-by-Step Implementation Guide",
      "6. Hyperparameter Configuration",
      "7. Validation Checkpoints",
      "8. Common Pitfalls & Solutions",
      "9. Expected Results & Tolerances",
      "10. Deployment Considerations"
    ]
  }
}

// ╔════════════════════════════════════════════════════════╗
// ║  SECTION 10: UTILITY FUNCTIONS                    ║
// ╚════════════════════════════════════════════════════════╝

/**
 * Detect domain from query text using keyword matching
 */
export function detectDomainFromQuery(query: string): { domain: string; confidence: number; matchedKeywords: string[] } {
  const q = query.toLowerCase()
  let bestMatch = ""
  let maxScore = 0
  let matchedKeywords: string[] = []
  
  for (const [domain, config] of Object.entries(DOMAIN_KEYWORD_MAP)) {
    const score = config.primary.filter(kw => q.includes(kw)).length
    
    if (score > maxScore && score >= config.confidence_threshold) {
      maxScore = score
      bestMatch = domain
      matchedKeywords = config.primary.filter(kw => q.includes(kw))
    }
  }
  
  return {
    domain: bestMatch || "general",
    confidence: maxScore > 0 ? Math.min(maxScore * 20, 100) : 0,
    matchedKeywords
  }
}

/**
 * Detect input type (DOI, arXiv, PMID, URL, etc.)
 */
export function detectInputType(input: string): string {
  const trimmed = input.trim()
  
  if (/^10\.\d{4,9}\/.+/.test(trimmed)) return "doi"
  if (/^\d{4}\.\d{4,5}$/.test(trimmed)) return "arxiv"
  if (/^\d+$/.test(trimmed) && trimmed.length <= 10) return "pmid"
  if (/^PMC\d+/i.test(trimmed)) return "pmcid"
  if (/^https?:\/\//.test(trimmed)) return "url"
  if (trimmed.endsWith(".pdf")) return "pdf"
  
  return "unknown"
}

/**
 * Extract DOIs from text using regex patterns
 */
export function extractDOIsFromText(text: string): string[] {
  const doiPatterns = [
    /doi[:\s]*(10\.\d{4,9}\/[^\s]+)/gi,
    /(10\.\d{4,9}\/[^\s]+)/g,
  ]
  const found = new Set<string>()
  
  for (const pattern of doiPatterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      found.add(match[1] || match[0])
    }
  }
  
  return Array.from(found)
}

/**
 * Get references to load based on domain (follows SKILL.md loading rules)
 */
export function getReferencesForDomain(domain: string): { primary: string[]; secondary: string[]; bridge?: string } {
  const config = DOMAIN_KEYWORD_MAP[domain] || DOMAIN_KEYWORD_MAP["deep learning"]
  
  // Bridge rule from SKILL.md: If spans 2+ domains, always load clinical-statistical-framework.md
  const needsBridge = Object.keys(DOMAIN_KEYWORD_MAP).some(d => 
    d !== domain && d !== "general" && config.primary.some(kw => 
      DOMAIN_KEYWORD_MAP[d]?.primary?.includes(kw) || false
    )
  )
  
  return {
    primary: config.primary.slice(0, 4),
    secondary: config.secondary || [],
    bridge: needsBridge ? "clinical-statistical-framework.md" : undefined
  }
}

/**
 * Get complete module configuration for given module ID
 */
export function getModuleConfig(moduleId: string): typeof MODULE_PROTOCOL_BINDINGS[string] {
  return MODULE_PROTOCOL_BINDINGS[moduleId] || MODULE_PROTOCOL_BINDINGS.decompose
}

/**
 * Calculate blocker verdict based on findings
 */
export function calculateBlockerVerdict(findings: Array<{ status: string }>): "YES" | "PARTIAL" | "NO" {
  const criticalCount = findings.filter(f => f.status.includes("🔴")).length
  const warningCount = findings.filter(f => f.status.includes("🟡")).length
  
  if (criticalCount > 0) return "NO"
  if (warningCount >= 3 || criticalCount === 0 && warningCount >= 2) return "PARTIAL"
  return "YES"
}
