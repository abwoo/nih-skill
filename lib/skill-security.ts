// ═══════════════════════════════════════════════════════════
// 🔒 SKILL SECURITY ENCAPSULATION LAYER v1.0
// Prevents direct exposure of raw Skill/Reference Markdown content
// ═══════════════════════════════════════════════════════════

import * as fs from 'fs'
import * as path from 'path'

// ╔════════════════════════════════════════════════════════╗
// ║  SECTION 1: REFERENCE METADATA REGISTRY            ║
// ╚════════════════════════════════════════════════════════╝

export interface ReferenceMetadata {
  id: string
  filename: string
  displayName: string
  category: string
  description: string
  keywords: string[]
  domains: string[]
  version: string
  lastUpdated: string
  size: number
  sections: string[]
  keyFrameworks: string[]
  applicableProtocols: string[]
}

const REFERENCE_METADATA_REGISTRY: Record<string, ReferenceMetadata> = {
  'ecg-methodology': {
    id: 'ecg-methodology',
    filename: 'ecg-methodology.md',
    displayName: 'ECG Analysis Methodology',
    category: 'Signal Processing & Biosignals',
    description: 'Comprehensive ECG signal processing, arrhythmia detection, and clinical validation protocols for biomedical engineering research.',
    keywords: ['ECG', 'electrocardiogram', 'arrhythmia', 'signal processing', 'cardiac', 'heartbeat'],
    domains: ['cardiology', 'signal processing', 'biosensors', 'wearable devices', 'clinical monitoring'],
    version: '2.1.0',
    lastUpdated: '2024-01-15',
    size: 0,
    sections: [
      'Signal Acquisition & Preprocessing',
      'Feature Extraction Methods',
      'Classification Algorithms (ML/DL)',
      'Clinical Validation Protocols',
      'Real-time Implementation Guidelines'
    ],
    keyFrameworks: [
      'AHA/ACC ECG Standards',
      'MIT-BIH Database Protocols',
      'PTB Diagnostic Criteria',
      'FDA Medical Device Guidelines'
    ],
    applicableProtocols: ['decompose', 'compare', 'reproduce', 'evidence']
  },
  
  'eeg-bci-methodology': {
    id: 'eeg-bci-methodology',
    filename: 'eeg-bci-methodology.md',
    displayName: 'EEG & Brain-Computer Interface Methods',
    category: 'Signal Processing & Biosignals',
    description: 'EEG signal processing, BCI paradigms, neural decoding algorithms, and real-time brain signal analysis methodologies.',
    keywords: ['EEG', 'BCI', 'brain-computer interface', 'neural signals', 'neuroscience', 'motor imagery'],
    domains: ['neuroscience', 'rehabilitation', 'cognitive science', 'human-computer interaction', 'neuroengineering'],
    version: '2.0.3',
    lastUpdated: '2024-02-20',
    size: 0,
    sections: [
      'EEG Signal Acquisition Systems',
      'Preprocessing & Artifact Removal',
      'Feature Extraction (Time-Frequency-Spatial)',
      'BCI Paradigms (P300, SSVEP, Motor Imagery)',
      'Real-time Decoding Algorithms'
    ],
    keyFrameworks: [
      '10-20 International System',
      'BCI Competition Standards',
      'Ethical Guidelines for Neural Interfaces',
      'Clinical EEG Interpretation Protocols'
    ],
    applicableProtocols: ['decompose', 'reproduce', 'paradigm']
  },
  
  'signal-processing-foundations': {
    id: 'signal-processing-foundations',
    filename: 'signal-processing-foundations.md',
    displayName: 'Signal Processing Foundations',
    category: 'Signal Processing & Biosignals',
    description: 'Fundamental signal processing theory, digital filtering, time-frequency analysis, and statistical signal processing for biomedical applications.',
    keywords: ['DSP', 'filtering', 'Fourier transform', 'wavelet', 'statistical processing', 'noise reduction'],
    domains: ['all biomedical domains', 'general signal processing', 'data preprocessing', 'feature engineering'],
    version: '3.0.0',
    lastUpdated: '2024-03-10',
    size: 0,
    sections: [
      'Digital Filter Design (FIR/IIR)',
      'Time-Frequency Analysis (STFT, Wavelet)',
      'Statistical Signal Processing',
      'Adaptive Filtering & Noise Cancellation',
      'Multirate Signal Processing'
    ],
    keyFrameworks: [
      'Nyquist-Shannon Sampling Theorem',
      'Parseval\'s Theorem Applications',
      'Wiener Filtering Theory',
      'Kalman Filter Fundamentals'
    ],
    applicableProtocols: ['decompose', 'compare', 'reproduce', 'datasets']
  },
  
  'physionet-datasets': {
    id: 'physionet-datasets',
    filename: 'physionet-datasets.md',
    displayName: 'PhysioNet Datasets Guide',
    category: 'Signal Processing & Biosignals',
    description: 'Complete guide to PhysioNet databases including MIT-BIH, PTB, MIMIC, and other critical biomedical datasets with usage protocols.',
    keywords: ['PhysioNet', 'datasets', 'MIT-BIH', 'MIMIC', 'PTB', 'benchmark data', 'training data'],
    domains: ['cardiology', 'ICU monitoring', 'sleep research', 'biomedical benchmarks', 'algorithm validation'],
    version: '2.5.1',
    lastUpdated: '2024-04-05',
    size: 0,
    sections: [
      'MIT-BIH Arrhythmia Database',
      'PTB Diagnostic ECG Database',
      'MIMIC-III Clinical Database',
      'Sleep Datasets (Sleep-EDF)',
      'Data Access & Usage Guidelines'
    ],
    keyFrameworks: [
      'PhysioNet Challenge Protocols',
      'HIPAA Compliance for Clinical Data',
      'Data Preprocessing Standards',
      'Cross-validation Methodologies'
    ],
    applicableProtocols: ['datasets', 'reproduce', 'evidence', 'compare']
  },
  
  'deep-learning-bme': {
    id: 'deep-learning-bme',
    filename: 'deep-learning-bme.md',
    displayName: 'Deep Learning for Biomedical Engineering',
    category: 'Deep Learning & AI',
    description: 'Comprehensive deep learning architectures, training strategies, and optimization techniques specifically tailored for biomedical data and applications.',
    keywords: ['deep learning', 'CNN', 'RNN', 'transformer', 'neural networks', 'training', 'optimization'],
    domains: ['medical imaging', 'genomics', 'signal processing', 'NLP', 'drug discovery', 'all AI applications'],
    version: '3.2.0',
    lastUpdated: '2024-05-12',
    size: 0,
    sections: [
      'Architecture Selection Guide (CNN/RNN/Transformer)',
      'Transfer Learning Strategies',
      'Data Augmentation for Medical Data',
      'Training Protocols & Hyperparameter Tuning',
      'Model Interpretability & Explainability'
    ],
    keyFrameworks: [
      'ImageNet Pre-training Paradigm',
      'Self-supervised Learning in Medicine',
      'Federated Learning for Privacy',
      'Model Compression Techniques'
    ],
    applicableProtocols: ['decompose', 'compare', 'reproduce', 'paradigm', 'evidence']
  },
  
  'clinical-nlp-llm-methodology': {
    id: 'clinical-nlp-llm-methodology',
    filename: 'clinical-nlp-llm-methodology.md',
    displayName: 'Clinical NLP & LLM Methodology',
    category: 'Deep Learning & AI',
    description: 'Natural language processing methods for clinical text, large language model fine-tuning, medical entity extraction, and clinical note analysis.',
    keywords: ['NLP', 'LLM', 'clinical text', 'medical NER', 'BERT', 'GPT', 'fine-tuning', 'prompting'],
    domains: ['clinical documentation', 'medical coding', 'literature mining', 'decision support', 'patient communication'],
    version: '2.8.0',
    lastUpdated: '2024-06-18',
    size: 0,
    sections: [
      'Clinical Text Preprocessing',
      'Medical Named Entity Recognition',
      'Relation Extraction & Assertion Detection',
      'LLM Fine-tuning on Clinical Data',
      'Prompt Engineering for Medical Tasks'
    ],
    keyFrameworks: [
      'i2b2 Challenge Benchmarks',
      'UMLS Metathesaurus Integration',
      'HIPAA-compliant Text Processing',
      'Clinical BERT Models'
    ],
    applicableProtocols: ['decompose', 'reproduce', 'evidence']
  },
  
  'clinical-statistical-framework': {
    id: 'clinical-statistical-framework',
    filename: 'clinical-statistical-framework.md',
    displayName: 'Clinical Statistical Framework',
    category: 'Clinical & Statistical',
    description: 'Statistical methods for clinical trials, diagnostic test evaluation, survival analysis, and evidence-based medicine frameworks.',
    keywords: ['statistics', 'clinical trials', 'diagnostic accuracy', 'survival analysis', 'p-values', 'confidence intervals'],
    domains: ['clinical research', 'epidemiology', 'diagnostic testing', 'regulatory affairs', 'evidence-based medicine'],
    version: '2.6.0',
    lastUpdated: '2024-07-22',
    size: 0,
    sections: [
      'Diagnostic Test Evaluation (Sensitivity/Specificity)',
      'Survival Analysis Methods (Cox, Kaplan-Meier)',
      'Clinical Trial Statistics (RCT Analysis)',
      'Meta-analysis & Systematic Review Methods',
      'Bayesian Approaches in Clinical Research'
    ],
    keyFrameworks: [
      'STARD Reporting Guidelines',
      'CONSORT Statement for RCTs',
      'TRIPOD Prediction Model Guidelines',
      'GRADE Evidence Grading System'
    ],
    applicableProtocols: ['decompose', 'compare', 'evidence', 'verify']
  },
  
  'clinical-documentation-decision-support': {
    id: 'clinical-documentation-decision-support',
    filename: 'clinical-documentation-decision-support.md',
    displayName: 'Clinical Documentation & Decision Support',
    category: 'Clinical & Statistical',
    description: 'CDSS implementation, clinical workflow integration, decision tree algorithms, and evidence-based clinical guidelines automation.',
    keywords: ['CDSS', 'decision support', 'clinical workflow', 'guidelines', 'alerts', 'clinical pathways'],
    domains: ['health informatics', 'clinical practice', 'hospital systems', 'patient safety', 'quality improvement'],
    version: '1.9.0',
    lastUpdated: '2024-08-14',
    size: 0,
    sections: [
      'CDSS Architecture & Implementation',
      'Clinical Alert Systems',
      'Decision Tree & Rule-based Systems',
      'Integration with EHR Systems',
      'Usability & Workflow Considerations'
    ],
    keyFrameworks: [
      'AMIA CDSS Guidelines',
      'HL7 FHIR Standards',
      'CDS Hooks Specification',
      'Meaningful Use Criteria'
    ],
    applicableProtocols: ['decompose', 'reproduce', 'evidence']
  },
  
  'clinical-trial-design-methodology': {
    id: 'clinical-trial-design-methodology',
    filename: 'clinical-trial-design-methodology.md',
    displayName: 'Clinical Trial Design Methodology',
    category: 'Clinical & Statistical',
    description: 'RCT design, sample size calculation, randomization methods, blinding protocols, and regulatory requirements for clinical trials.',
    keywords: ['RCT', 'clinical trial', 'randomization', 'sample size', 'blinding', 'protocol design', 'ICH-GCP'],
    domains: ['pharmaceutical research', 'medical device testing', 'regulatory science', 'clinical epidemiology'],
    version: '2.3.0',
    lastUpdated: '2024-09-30',
    size: 0,
    sections: [
      'Trial Phase Design (I-IV)',
      'Randomization & Blinding Methods',
      'Sample Size & Power Calculation',
      'Endpoint Selection & Analysis',
      'Regulatory Submission Requirements'
    ],
    keyFrameworks: [
      'ICH-GCP Guidelines',
      'FDA 21 CFR Part 11',
      'EU Clinical Trial Regulation',
      'Declaration of Helsinki'
    ],
    applicableProtocols: ['decompose', 'reproduce', 'evidence']
  },
  
  'research-ethics-fairness': {
    id: 'research-ethics-fairness',
    filename: 'research-ethics-fairness.md',
    displayName: 'Research Ethics & Fairness',
    category: 'Clinical & Statistical',
    description: 'Research ethics principles, bias detection/mitigation, fairness in ML models, informed consent, and IRB approval processes.',
    keywords: ['ethics', 'fairness', 'bias', 'IRB', 'informed consent', 'privacy', 'equity', 'AI ethics'],
    domains: ['all research domains', 'AI/ML development', 'clinical research', 'genomics', 'health equity'],
    version: '2.4.0',
    lastUpdated: '2024-10-08',
    size: 0,
    sections: [
      'Belmont Report Principles',
      'Bias Detection in Datasets & Models',
      'Fairness Metrics & Mitigation',
      'Privacy-Preserving Techniques',
      'IRB Approval Process & Documentation'
    ],
    keyFrameworks: [
      'IEEE Ethical Guidelines',
      'EU AI Act Requirements',
      'NIH Data Sharing Policy',
      'GDPR Compliance Framework'
    ],
    applicableProtocols: ['decompose', 'evidence', 'verify']
  },
  
  'reproducibility-infrastructure': {
    id: 'reproducibility-infrastructure',
    filename: 'reproducibility-infrastructure.md',
    displayName: 'Reproducibility Infrastructure',
    category: 'Clinical & Statistical',
    description: 'Code sharing platforms, containerization (Docker), environment specification, version control workflows, and reproducible research best practices.',
    keywords: ['reproducibility', 'Docker', 'containerization', 'version control', 'open source', 'environment specs'],
    domains: ['computational research', 'software development', 'collaborative research', 'publication standards'],
    version: '2.7.0',
    lastUpdated: '2024-11-15',
    size: 0,
    sections: [
      'Version Control Best Practices (Git)',
      'Containerization with Docker/Singularity',
      'Environment Specification (conda, pipenv)',
      'Code Repository Management (GitHub/GitLab)',
      'Reproducibility Checklists & Badges'
    ],
    keyFrameworks: [
      'FAIR Data Principles',
      'CODECHECK Certification',
      'Reproducibility Badge Standards',
      'Open Science Framework (OSF)'
    ],
    applicableProtocols: ['reproduce', 'decompose', 'evidence']
  },
  
  'genomics-bioinformatics-methodology': {
    id: 'genomics-bioinformatics-methodology',
    filename: 'genomics-bioinformatics-methodology.md',
    displayName: 'Genomics & Bioinformatics Methods',
    category: 'Genomics & Bioinformatics',
    description: 'Sequencing technologies, variant calling pipelines, genome assembly, transcriptomics analysis, and bioinformatics workflow management.',
    keywords: ['genomics', 'sequencing', 'variant calling', 'RNA-seq', 'bioinformatics', 'pipeline', 'NGS'],
    domains: ['precision medicine', 'cancer genomics', 'population genetics', 'microbiology', 'agricultural biotech'],
    version: '3.1.0',
    lastUpdated: '2024-12-01',
    size: 0,
    sections: [
      'NGS Technologies (Illumina, PacBio, Oxford Nanopore)',
      'Variant Calling Pipelines (GATK, DeepVariant)',
      'Transcriptomics Analysis (RNA-seq)',
      'Genome Assembly & Annotation',
      'Workflow Management (Nextflow, Snakemake)'
    ],
    keyFrameworks: [
      'GA4GH Standards',
      'SAM/BAM File Format Specifications',
      'VCF Variant Call Format',
      'ENCODE Data Standards'
    ],
    applicableProtocols: ['decompose', 'reproduce', 'datasets', 'compare']
  },
  
  'causal-genomics-methodology': {
    id: 'causal-genomics-methodology',
    filename: 'causal-genomics-methodology.md',
    displayName: 'Causal Genomics Methods',
    category: 'Genomics & Bioinformatics',
    description: 'Causal inference methods for genomic data, Mendelian randomization, eQTL analysis, and causal pathway discovery techniques.',
    keywords: ['causal inference', 'Mendelian randomization', 'eQTL', 'GWAS', 'causality', 'genetic instruments'],
    domains: ['genetic epidemiology', 'drug target discovery', 'precision medicine', 'systems biology'],
    version: '1.8.0',
    lastUpdated: '2025-01-10',
    size: 0,
    sections: [
      'Mendelian Randomization Fundamentals',
      'eQTL Colocalization Analysis',
      'Causal Mediation Analysis',
      'Genetic Instrument Selection',
      'Pleiotropy & Horizontal Pleiotropy Correction'
    ],
    keyFrameworks: [
      'MR Base Platform',
      'Two-sample MR Methods',
      'Steiger Filtering Approach',
      'CAUSE Method for Shared Genetics'
    ],
    applicableProtocols: ['decompose', 'evidence', 'paradigm']
  },
  
  'crispr-design-methodology': {
    id: 'crispr-design-methodology',
    filename: 'crispr-design-methodology.md',
    displayName: 'CRISPR Design Methods',
    category: 'Genomics & Bioinformatics',
    description: 'CRISPR/Cas9 guide RNA design, off-target prediction, editing efficiency optimization, and therapeutic CRISPR application protocols.',
    keywords: ['CRISPR', 'gene editing', 'gRNA design', 'off-target', 'Cas9', 'base editing', 'prime editing'],
    domains: ['gene therapy', 'functional genomics', 'agricultural biotechnology', 'synthetic biology'],
    version: '2.2.0',
    lastUpdated: '2025-02-05',
    size: 0,
    sections: [
      'Guide RNA Design Principles',
      'Off-target Prediction Algorithms',
      'Delivery Methods (viral/non-viral)',
      'Editing Efficiency Optimization',
      'Therapeutic Application Workflows'
    ],
    keyFrameworks: [
      'CRISPOR Design Tool',
      'CHOPCHOP gRNA Designer',
      'Off-target Scoring Metrics',
      'FDA Gene Therapy Guidelines'
    ],
    applicableProtocols: ['decompose', 'reproduce', 'datasets']
  },
  
  'epitranscriptomics-methodology': {
    id: 'epitranscriptomics-methodology',
    filename: 'epitranscriptomics-methodology.md',
    displayName: 'Epitranscriptomics Methods',
    category: 'Genomics & Bioinformatics',
    description: 'RNA modification detection (m6A, m5C, pseudouridine), epitranscriptomic profiling, and functional analysis of RNA modifications.',
    keywords: ['epitranscriptomics', 'm6A', 'RNA modification', 'MeRIP-seq', 'pseudouridine', 'RNA methylation'],
    domains: ['RNA biology', 'cancer research', 'developmental biology', 'immunology', 'neurobiology'],
    version: '1.6.0',
    lastUpdated: '2025-03-12',
    size: 0,
    sections: [
      'RNA Modification Types & Functions',
      'Detection Methods (MeRIP-seq, miCLIP)',
      'Bioinformatics Analysis Pipelines',
      'Functional Validation Experiments',
      'Disease Association Studies'
    ],
    keyFrameworks: [
      'RMBase Database',
      'MODOMICS Resource',
      'Standardized Peak Calling Methods',
      'Epitranscriptome Mapping Guidelines'
    ],
    applicableProtocols: ['decompose', 'compare', 'evidence']
  },
  
  'hi-c-3d-genome-methodology': {
    id: 'hi-c-3d-genome-methodology',
    filename: 'hi-c-3d-genome-methodology.md',
    displayName: 'Hi-C & 3D Genome Methods',
    category: 'Genomics & Bioinformatics',
    description: 'Hi-C experimental protocols, 3D genome reconstruction, chromatin interaction analysis, and TAD/topologically associating domain identification.',
    keywords: ['Hi-C', '3D genome', 'chromatin interaction', 'TAD', 'chromosome conformation', 'capture Hi-C'],
    domains: ['chromatin biology', 'gene regulation', 'cancer genomics', 'developmental biology', 'evolutionary genomics'],
    version: '2.0.0',
    lastUpdated: '2025-04-18',
    size: 0,
    sections: [
      'Hi-C Experimental Protocols',
      'Data Processing & Normalization',
      'TAD & Loop Calling Algorithms',
      '3D Genome Reconstruction Methods',
      'Comparative Hi-C Analysis'
    ],
    keyFrameworks: [
      'Juicer Tools Pipeline',
      'HiC-Pro Processing',
      'Fit-Hi-C Interaction Calling',
      '3D Genome Browser Visualization'
    ],
    applicableProtocols: ['decompose', 'reproduce', 'compare', 'paradigm']
  },
  
  'medical-imaging-methodology': {
    id: 'medical-imaging-methodology',
    filename: 'medical-imaging-methodology.md',
    displayName: 'Medical Imaging Methodology',
    category: 'Medical Imaging',
    description: 'Medical image acquisition (CT, MRI, X-ray, ultrasound), DICOM standards, image segmentation, computer-aided diagnosis, and radiomics analysis.',
    keywords: ['medical imaging', 'CT', 'MRI', 'X-ray', 'DICOM', 'segmentation', 'CAD', 'radiomics'],
    domains: ['radiology', 'pathology', 'radiotherapy', 'oncology', 'neurology', 'cardiology'],
    version: '3.0.0',
    lastUpdated: '2025-05-22',
    size: 0,
    sections: [
      'Image Acquisition Modalities',
      'DICOM Standard & PACS Systems',
      'Image Preprocessing & Enhancement',
      'Segmentation Methods (U-Net, nnU-Net)',
      'Radiomics Feature Extraction'
    ],
    keyFrameworks: [
      'DICOM Supplement Standards',
      'TI-RADS Classification',
      'RECIST Tumor Response Criteria',
      'AAPM TG-132 QA Protocol'
    ],
    applicableProtocols: ['decompose', 'compare', 'reproduce', 'datasets']
  },
  
  'drug-discovery-pharmacology-methodology': {
    id: 'drug-discovery-pharmacology-methodology',
    filename: 'drug-discovery-pharmacology-methodology.md',
    displayName: 'Drug Discovery & Pharmacology Methods',
    category: 'Drug Discovery & Pharmacology',
    description: 'Virtual screening, molecular docking, ADMET prediction, QSAR modeling, lead optimization, and drug repurposing methodologies.',
    keywords: ['drug discovery', 'virtual screening', 'docking', 'ADMET', 'QSAR', 'lead optimization', 'pharmacokinetics'],
    domains: ['pharmaceutical research', 'medicinal chemistry', 'computational biology', 'toxicology', 'chemical biology'],
    version: '2.9.0',
    lastUpdated: '2025-06-30',
    size: 0,
    sections: [
      'Target Identification & Validation',
      'Virtual Screening Libraries',
      'Molecular Docking Protocols',
      'ADMET Property Prediction',
      'Lead Optimization Strategies'
    ],
    keyFrameworks: [
      'Lipinski Rule of Five',
      'ChEMBL Database Standards',
      'PDBbind Benchmark Dataset',
      'FDA Drug Approval Process'
    ],
    applicableProtocols: ['decompose', 'reproduce', 'datasets', 'paradigm']
  },
  
  'network-pharmacology-systems-biology': {
    id: 'network-pharmacology-systems-biology',
    filename: 'network-pharmacology-systems-biology.md',
    displayName: 'Network Pharmacology & Systems Biology',
    category: 'Drug Discovery & Pharmacology',
    description: 'Network-based drug discovery, protein-protein interaction networks, systems pharmacology, polypharmacology, and multi-target drug design.',
    keywords: ['network pharmacology', 'systems biology', 'PPI network', 'polypharmacology', 'multi-target', 'pathway analysis'],
    domains: ['systems pharmacology', 'TCM modernization', 'complex disease treatment', 'drug combination therapy'],
    version: '2.1.0',
    lastUpdated: '2025-07-14',
    size: 0,
    sections: [
      'Network Construction Methods',
      'Target Prediction Algorithms',
      'Pathway Enrichment Analysis',
      'Drug-Target Network Visualization',
      'Multi-target Drug Design Principles'
    ],
    keyFrameworks: [
      'STRING Database Integration',
      'KEGG Pathway Analysis',
      'Cytoscape Network Analysis',
      'Systems Pharmacology Society Guidelines'
    ],
    applicableProtocols: ['decompose', 'paradigm', 'evidence']
  },
  
  'precision-oncology-immunotherapy-methodology': {
    id: 'precision-oncology-immunotherapy-methodology',
    filename: 'precision-oncology-immunotherapy-methodology.md',
    displayName: 'Precision Oncology & Immunotherapy Methods',
    category: 'Drug Discovery & Pharmacology',
    description: 'Precision oncology approaches, biomarker-driven therapy, immunotherapy response prediction, tumor microenvironment analysis, and personalized cancer treatment.',
    keywords: ['precision oncology', 'immunotherapy', 'biomarker', 'tumor mutational burden', 'neoantigen', 'checkpoint inhibitor'],
    domains: ['oncology', 'immunology', 'cancer immunotherapy', 'personalized medicine', 'translational research'],
    version: '2.5.0',
    lastUpdated: '2025-08-20',
    size: 0,
    sections: [
      'Genomic Biomarker Discovery',
      'Immunotherapy Response Prediction',
      'Tumor Microenvironment Analysis',
      'Neoantigen Prediction & Validation',
      'Clinical Trial Design for Precision Oncology'
    ],
    keyFrameworks: [
      'TMB & MSI Testing Standards',
      'PD-L1 IHC Scoring (22C3, 28-8)',
      'RECIST 1.1 vs iRECIST',
      'FoundationOne CDx Panel'
    ],
    applicableProtocols: ['decompose', 'evidence', 'compare']
  },
  
  'immunoinformatics-methodology': {
    id: 'immunoinformatics-methodology',
    filename: 'immunoinformatics-methodology.md',
    displayName: 'Immunoinformatics Methods',
    category: 'Drug Discovery & Pharmacology',
    description: 'Vaccine design, epitope prediction, MHC binding affinity, immunogenicity assessment, and computational vaccinology approaches.',
    keywords: ['vaccine design', 'epitope prediction', 'MHC binding', 'immunogenicity', 'B-cell/T-cell epitopes', 'immunoinformatics'],
    domains: ['vaccinology', 'infectious diseases', 'cancer vaccines', 'autoimmune disease', 'transplantation immunology'],
    version: '1.9.0',
    lastUpdated: '2025-09-25',
    size: 0,
    sections: [
      'B-cell Epitope Prediction',
      'T-cell Epitope (MHC) Prediction',
      'Immunogenicity Assessment Tools',
      'Vaccine Construct Design',
      'Population Coverage Analysis'
    ],
    keyFrameworks: [
      'IEDB Analysis Resource',
      'NetMHCpan Algorithm',
      'Vaxijen Immunogenicity Predictor',
      'WHO Vaccine Development Guidelines'
    ],
    applicableProtocols: ['decompose', 'reproduce', 'datasets']
  },
  
  'experimental-design-methodology': {
    id: 'experimental-design-methodology',
    filename: 'experimental-design-methodology.md',
    displayName: 'Experimental Design Methodology',
    category: 'Experimental Methods',
    description: 'DOE principles, factorial designs, power analysis, confounding control, randomization strategies, and reproducible experiment planning.',
    keywords: ['DOE', 'factorial design', 'power analysis', 'randomization', 'confounding', 'replication', 'blocking'],
    domains: ['wet lab research', 'preclinical studies', 'behavioral experiments', 'animal studies', 'in vitro assays'],
    version: '2.4.0',
    lastUpdated: '2025-10-08',
    size: 0,
    sections: [
      'Factorial & Fractional Factorial Designs',
      'Sample Size & Power Calculations',
      'Randomization & Blocking Strategies',
      'Confounding Control Methods',
      'Replication & Repeatability Assessment'
    ],
    keyFrameworks: [
      'ARRIVE Guidelines for Animal Research',
      'NIH Experimental Design Checklist',
      'Statistical Power Analysis Standards',
      'Good Laboratory Practice (GLP)'
    ],
    applicableProtocols: ['decompose', 'reproduce', 'datasets']
  },
  
  'flow-cytometry-methodology': {
    id: 'flow-cytometry-methodology',
    filename: 'flow-cytometry-methodology.md',
    displayName: 'Flow Cytometry Methods',
    category: 'Experimental Methods',
    description: 'Flow cytometry panel design, compensation controls, gating strategies, spectral flow cytometry, and high-dimensional data analysis.',
    keywords: ['flow cytometry', 'FACS', 'panel design', 'compensation', 'gating', 'spectral cytometry', 'CyTOF'],
    domains: ['immunology', 'hematology', 'cancer research', 'stem cell biology', 'infectious disease'],
    version: '2.2.0',
    lastUpdated: '2025-11-12',
    size: 0,
    sections: [
      'Panel Design Principles',
      'Compensation & Controls',
      'Manual vs Automated Gating',
      'High-dimensional Data Analysis (t-SNE, UMAP)',
      'Quality Control & Standardization'
    ],
    keyFrameworks: [
      'MI Flow Cytometry Standards',
      'ISHLT Graft Monitoring Guidelines',
      'EuroFlow Protocol Standardization',
      'BD FACSDiva Software Suite'
    ],
    applicableProtocols: ['decompose', 'reproduce', 'datasets']
  },
  
  'liquid-biopsy-methodology': {
    id: 'liquid-biopsy-methodology',
    filename: 'liquid-biopsy-methodology.md',
    displayName: 'Liquid Biopsy Methods',
    category: 'Experimental Methods',
    description: 'ctDNA/cfDNA analysis, circulating tumor cells (CTCs), exosomes, liquid biopsy technologies, and non-invasive cancer detection methods.',
    keywords: ['liquid biopsy', 'ctDNA', 'cfDNA', 'CTC', 'exosome', 'non-invasive', 'cancer detection'],
    domains: ['oncology', 'prenatal diagnostics', 'organ transplantation', 'early cancer detection', 'monitoring'],
    version: '2.0.0',
    lastUpdated: '2025-12-18',
    size: 0,
    sections: [
      'ctDNA Extraction & Quantification',
      'Digital PCR & NGS Detection Methods',
      'CTC Isolation & Characterization',
      'Exosome Isolation & Analysis',
      'Clinical Implementation Guidelines'
    ],
    keyFrameworks: [
      'ddPCR Technical Standards',
      'Guardant360 Platform',
      'IVD Regulatory Pathways',
      'NCCN Liquid Biopsy Guidelines'
    ],
    applicableProtocols: ['decompose', 'evidence', 'datasets']
  },
  
  'database-api-guide': {
    id: 'database-api-guide',
    filename: 'database-api-guide.md',
    displayName: 'Database & API Integration Guide',
    category: 'Data & Integration',
    description: 'Comprehensive guide to biomedical database APIs (PubMed, ClinicalTrials.gov, UniProt, etc.), data retrieval protocols, and API integration patterns.',
    keywords: ['API', 'database', 'PubMed', 'UniProt', 'ClinicalTrials.gov', 'bioinformatics', 'data integration'],
    domains: ['data science', 'bioinformatics', 'literature mining', 'systems biology', 'meta-analysis'],
    version: '3.0.0',
    lastUpdated: '2026-01-02',
    size: 0,
    sections: [
      'NCBI E-utilities (PubMed/PubMed Central)',
      'ClinicalTrials.gov API',
      'UniProt REST API',
      'Ensembl Genomes API',
      'Rate Limiting & Authentication'
    ],
    keyFrameworks: [
      'RESTful API Design Patterns',
      'OAuth 2.0 Authentication',
      'GraphQL for Complex Queries',
      'Data Caching Strategies'
    ],
    applicableProtocols: ['datasets', 'reproduce', 'evidence', 'compare']
  },
  
  'research-synthesis-matching': {
    id: 'research-synthesis-matching',
    filename: 'research-synthesis-matching.md',
    displayName: 'Research Synthesis & Matching Engine',
    category: 'Data & Integration',
    description: 'Core "automatic brain" module for intelligent reference matching, literature synthesis, cross-domain knowledge integration, and automated reasoning chain construction.',
    keywords: ['research synthesis', 'knowledge matching', 'automatic reasoning', 'cross-domain', 'literature integration', 'SKILL protocol'],
    domains: ['ALL DOMAINS - Core Module', 'systematic reviews', 'meta-analysis', 'research planning', 'hypothesis generation'],
    version: '4.0.0',
    lastUpdated: '2026-01-15',
    size: 0,
    sections: [
      'Automatic Reference Loading Rules (SKILL.md §2)',
      'Domain-to-Reference Matching Algorithm',
      'Literature Intent Recognition Modes',
      'Cross-Domain Knowledge Synthesis',
      'Protocol Step Orchestration (Step 0-8)'
    ],
    keyFrameworks: [
      'SKILL.md Automatic Reasoning Protocol',
      'Reference Loading Priority Rules',
      'Innovation Level Assessment Matrix',
      'Fatal Blocker Detection System'
    ],
    applicableProtocols: ['ALL MODULES - Mandatory First Load']
  },

  'darwin-idea-evolution': {
    id: 'darwin-idea-evolution',
    filename: 'darwin-idea-evolution.md',
    displayName: 'Darwin · Idea Evolution Engine',
    category: 'Research Ideation & Innovation',
    description: 'Core innovation engine with 6 evolution operators (Transplant, Constrain, Fuse, Invert, Minimal, Extreme) for cross-domain research ideation and paradigm engineering.',
    keywords: ['innovation', 'evolution', 'cross-domain', 'paradigm shift', 'ideation', 'creativity', 'mutation', 'recombination'],
    domains: ['ALL DOMAINS - Innovation Module', 'research planning', 'hypothesis generation', 'creative thinking', 'methodology design'],
    version: '1.0.0',
    lastUpdated: '2026-01-15',
    size: 0,
    sections: [
      '6 Evolution Operators (Transplant/Constrain/Fuse/Invert/Minimal/Extreme)',
      'Operator Selection Matrix (Scenario-based)',
      'Darwin Protocol Workflow (Phase 1-6)',
      'Innovation Assessment (L1-L5c per variant)',
      'Integration with Decompose/Compare/Reproduce Modules'
    ],
    keyFrameworks: [
      'Cross-domain Knowledge Transfer Theory',
      'Constraint-based Innovation Methodology',
      'Paradigm Fusion Strategies',
      'TRIZ Inventive Principles (adapted for research)'
    ],
    applicableProtocols: ['darwin', 'decompose', 'compare', 'paradigm']
  }
}

// Update sizes dynamically
function updateMetadataSizes(): void {
  const refsDir = path.join(process.cwd(), 'references')
  
  for (const [id, metadata] of Object.entries(REFERENCE_METADATA_REGISTRY)) {
    try {
      const filePath = path.join(refsDir, metadata.filename)
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath)
        metadata.size = stats.size
        metadata.lastUpdated = stats.mtime.toISOString().split('T')[0]
      }
    } catch (error) {
      console.warn(`[skill-security] Failed to update size for ${id}:`, error)
    }
  }
}

updateMetadataSizes()

// ╔════════════════════════════════════════════════════════╗
// ║  SECTION 2: SKILL CONTENT ENCAPSULATOR              ║
// ╚════════════════════════════════════════════════════════╝

export interface EncapsulatedReference {
  metadata: ReferenceMetadata
  summary: string
  keyInsights: string[]
  applicableUseCases: string[]
  relatedReferences: string[]
  quickStartGuide: string
  _securityNote: string
}

export class SkillContentEncapsulator {
  private static instance: SkillContentEncapsulator | null = null
  
  private constructor() {}
  
  static getInstance(): SkillContentEncapsulator {
    if (!SkillContentEncapsulator.instance) {
      SkillContentEncapsulator.instance = new SkillContentEncapsulator()
    }
    return SkillContentEncapsulator.instance
  }
  
  /**
   * Get encapsulated reference information (NO raw content exposed)
   */
  getEncapsulatedReference(referenceId: string): EncapsulatedReference | null {
    const metadata = REFERENCE_METADATA_REGISTRY[referenceId]
    
    if (!metadata) {
      console.warn(`[skill-security] Unknown reference ID: ${referenceId}`)
      return null
    }
    
    return {
      metadata,
      summary: this.generateSummary(metadata),
      keyInsights: this.generateKeyInsights(metadata),
      applicableUseCases: this.generateUseCases(metadata),
      relatedReferences: this.findRelatedReferences(referenceId),
      quickStartGuide: this.generateQuickStart(metadata),
      _securityNote: '🔒 Content encapsulated - Raw Markdown not accessible via UI'
    }
  }
  
  /**
   * Get all available references (metadata only)
   */
  getAllReferenceMetadata(): ReferenceMetadata[] {
    return Object.values(REFERENCE_METADATA_REGISTRY)
  }
  
  /**
   * Search references by keyword/domain
   */
  searchReferences(query: string): ReferenceMetadata[] {
    const queryLower = query.toLowerCase()
    
    return Object.values(REFERENCE_METADATA_REGISTRY).filter(ref => 
      ref.displayName.toLowerCase().includes(queryLower) ||
      ref.description.toLowerCase().includes(queryLower) ||
      ref.keywords.some(kw => kw.toLowerCase().includes(queryLower)) ||
      ref.domains.some(domain => domain.toLowerCase().includes(queryLower)) ||
      ref.category.toLowerCase().includes(queryLower)
    )
  }
  
  /**
   * Get references by category
   */
  getReferencesByCategory(category: string): ReferenceMetadata[] {
    return Object.values(REFERENCE_METADATA_REGISTRY).filter(ref =>
      ref.category === category
    )
  }
  
  /**
   * Get references for specific domain (intelligent matching)
   */
  getReferencesForDomain(domain: string, maxResults: number = 4): ReferenceMetadata[] {
    const domainLower = domain.toLowerCase()
    const scoredRefs: Array<{ ref: ReferenceMetadata; score: number }> = []
    
    for (const ref of Object.values(REFERENCE_METADATA_REGISTRY)) {
      let score = 0
      
      // Domain match
      if (ref.domains.some(d => d.toLowerCase().includes(domainLower))) score += 3
      
      // Keyword match
      if (ref.keywords.some(kw => kw.toLowerCase().includes(domainLower))) score += 2
      
      // Description match
      if (ref.description.toLowerCase().includes(domainLower)) score += 1
      
      // Category match
      if (ref.category.toLowerCase().includes(domainLower)) score += 1
      
      // Special boost for core modules
      if (ref.id === 'research-synthesis-matching') score += 5
      if (ref.id === 'deep-learning-bme') score += 3
      
      if (score > 0) {
        scoredRefs.push({ ref, score })
      }
    }
    
    return scoredRefs
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(item => item.ref)
  }
  
  /**
   * Check if reference exists
   */
  referenceExists(referenceId: string): boolean {
    return referenceId in REFERENCE_METADATA_REGISTRY
  }
  
  /**
   * Get statistics about the reference library
   */  
  getLibraryStats(): {
    totalReferences: number
    categories: Record<string, number>
    totalSize: number
    lastUpdated: string
    versions: Record<string, number>
  } {
    const refs = Object.values(REFERENCE_METADATA_REGISTRY)
    
    const categories: Record<string, number> = {}
    refs.forEach(ref => {
      categories[ref.category] = (categories[ref.category] || 0) + 1
    })
    
    const versions: Record<string, number> = {}
    refs.forEach(ref => {
      const majorVersion = ref.version.split('.')[0]
      versions[majorVersion] = (versions[majorVersion] || 0) + 1
    })
    
    return {
      totalReferences: refs.length,
      categories,
      totalSize: refs.reduce((sum, ref) => sum + ref.size, 0),
      lastUpdated: new Date().toISOString(),
      versions
    }
  }
  
  // Private helper methods
  
  private generateSummary(metadata: ReferenceMetadata): string {
    return `${metadata.displayName} (${metadata.version}) provides comprehensive guidance for ${metadata.domains.slice(0, 3).join(', ')}${metadata.domains.length > 3 ? ` and ${metadata.domains.length - 3} more domains` : ''}. Key focus areas include ${metadata.sections.slice(0, 3).join(', ')}. This reference is essential for ${metadata.applicableProtocols.join('/')} analysis modules.`
  }
  
  private generateKeyInsights(metadata: ReferenceMetadata): string[] {
    return [
      `📊 Covers ${metadata.sections.length} major methodological areas`,
      `🎯 Optimized for ${metadata.applicableProtocols.length} SKILL protocol modules`,
      `📚 Aligned with ${metadata.keyFrameworks.length} industry/academic standards`,
      `🔬 Applicable to ${metadata.domains.length}+ biomedical subdomains`,
      `⚡ Version ${metadata.version} - Last updated: ${metadata.lastUpdated}`
    ]
  }
  
  private generateUseCases(metadata: ReferenceMetadata): string[] {
    const useCases: string[] = []
    
    if (metadata.applicableProtocols.includes('decompose')) {
      useCases.push('Paper decomposition & methodology extraction')
    }
    if (metadata.applicableProtocols.includes('compare')) {
      useCases.push('Multi-paper comparative analysis')
    }
    if (metadata.applicableProtocols.includes('reproduce')) {
      useCases.push('Experiment reproduction blueprint creation')
    }
    if (metadata.applicableProtocols.includes('evidence')) {
      useCases.push('Evidence strength verification')
    }
    if (metadata.applicableProtocols.includes('datasets')) {
      useCases.push('Dataset recommendation & preprocessing')
    }
    if (metadata.applicableProtocols.includes('paradigm')) {
      useCases.push('Methodological paradigm mapping')
    }
    
    return useCases
  }
  
  private findRelatedReferences(currentRefId: string): string[] {
    const currentRef = REFERENCE_METADATA_REGISTRY[currentRefId]
    if (!currentRef) return []
    
    const related: Array<{ id: string; sharedKeywords: number }> = []
    
    for (const [id, ref] of Object.entries(REFERENCE_METADATA_REGISTRY)) {
      if (id === currentRefId) continue
      
      const sharedKeywords = currentRef.keywords.filter(kw =>
        ref.keywords.includes(kw)
      ).length
      
      const sharedDomains = currentRef.domains.filter(domain =>
        ref.domains.includes(domain)
      ).length
      
      const relevanceScore = sharedKeywords * 2 + sharedDomains
      
      if (relevanceScore >= 2) {
        related.push({ id, sharedKeywords })
      }
    }
    
    return related
      .sort((a, b) => b.sharedKeywords - a.sharedKeywords)
      .slice(0, 5)
      .map(item => item.id)
  }
  
  private generateQuickStart(metadata: ReferenceMetadata): string {
    return `To use ${metadata.displayName}: Select the '${metadata.applicableProtocols[0]}' module → Upload or input your paper/data → The system will automatically apply ${metadata.keyFrameworks[0]} compliant analysis protocols. Key outputs include innovation level assessment (L1-L5c), fatal blocker detection (FB-1 to FB-11), and clinical validation scoring (V0-V5).`
  }
}

// ╔════════════════════════════════════════════════════════╗
// ║  SECTION 3: CONTENT FILTER                          ║
// ╚════════════════════════════════════════════════════════╝

export interface FilteredContent {
  safe: boolean
  type: 'metadata' | 'summary' | 'structured' | 'blocked'
  data: unknown
  originalLength?: number
  filteredLength?: number
  securityLevel: 'PUBLIC' | 'RESTRICTED' | 'INTERNAL' | 'BLOCKED'
}

export class SkillContentFilter {
  /**
   * Filter content to remove raw markdown and expose only structured data
   */
  static filterContent(contentType: string, rawData?: string): FilteredContent {
    switch (contentType) {
      case 'reference':
        return SkillContentFilter.filterReference(rawData)
        
      case 'skill-md':
        return SkillContentFilter.filterSkillMD(rawData)
        
      case 'batch-references':
        return SkillContentFilter.filterBatchReferences(rawData)
        
      default:
        return {
          safe: false,
          type: 'blocked',
          data: { error: 'Unknown content type' },
          securityLevel: 'BLOCKED'
        }
    }
  }
  
  private static filterReference(rawData?: string): FilteredContent {
    if (!rawData) {
      return {
        safe: false,
        type: 'blocked',
        data: { error: 'No content provided' },
        securityLevel: 'BLOCKED'
      }
    }

    try {
      const encapsulator = SkillContentEncapsulator.getInstance()
      
      // Try to extract reference ID from raw data (filename pattern)
      const refMatch = rawData.match(/([a-z0-9-]+)\.md$/i)
      
      if (refMatch && refMatch[1]) {
        const refId = refMatch[1]
        const encapsulated = encapsulator.getEncapsulatedReference(refId)
        
        if (encapsulated) {
          return {
            safe: true,
            type: 'structured',
            data: encapsulated,
            originalLength: rawData.length,
            filteredLength: JSON.stringify(encapsulated).length,
            securityLevel: 'PUBLIC'
          }
        }
      }
      
      return {
        safe: true,
        type: 'summary',
        data: {
          message: 'Reference processed successfully',
          characterCount: rawData.length,
          previewAvailable: true,
          fullContentAccess: '🔒 RESTRICTED - Use structured API endpoints instead',
          alternative: 'Use /api/skill-info with action=get_metadata for safe access'
        },
        originalLength: rawData.length,
        filteredLength: JSON.stringify({ message: 'processed' }).length,
        securityLevel: 'RESTRICTED'
      }
      
    } catch (error) {
      return {
        safe: false,
        type: 'blocked',
        data: { error: 'Processing failed' },
        securityLevel: 'BLOCKED'
      }
    }
  }
  
  private static filterSkillMD(rawData?: string): FilteredContent {
    if (!rawData) {
      return {
        safe: false,
        type: 'blocked',
        data: { error: 'No content provided' },
        securityLevel: 'BLOCKED'
      }
    }

    return {
      safe: true,
      type: 'metadata',
      data: {
        name: 'BME Research Accelerator · 生物医学工程研究加速器',
        version: '2.0.0 (Round 81+)',
        totalSections: 9,
        protocolSteps: 8,
        referenceFiles: 27,
        keyFeatures: [
          'Automatic Reasoning Protocol (Step 0-8)',
          'Fatal Blocker Detection (FB-1 to FB-11)',
          'Innovation Level Assessment (L1-L5c)',
          'Clinical Validation Levels (V0-V5)',
          'Dynamic Reference Loading (max 4 files)',
          'BME Domain-specific Checks'
        ],
        securityNotice: '🔒 Full SKILL.md content is internal-only. Use /api/skill-info endpoint for structured access.'
      },
      originalLength: rawData.length,
      filteredLength: JSON.stringify({
        name: 'BME Research Accelerator',
        version: '2.0.0'
      }).length,
      securityLevel: 'INTERNAL'
    }
  }
  
  private static filterBatchReferences(rawData?: string): FilteredContent {
    const encapsulator = SkillContentEncapsulator.getInstance()
    const allMetadata = encapsulator.getAllReferenceMetadata()
    
    return {
      safe: true,
      type: 'metadata',
      data: allMetadata.map(ref => ({
        id: ref.id,
        displayName: ref.displayName,
        category: ref.category,
        version: ref.version,
        size: ref.size,
        applicableProtocols: ref.applicableProtocols,
        _note: '🔒 Metadata only - Full content requires authenticated API calls'
      })),
      originalLength: rawData?.length || 0,
      filteredLength: JSON.stringify(allMetadata.map(ref => ({ id: ref.id }))).length,
      securityLevel: 'PUBLIC'
    }
  }
}

export const skillEncapsulator = SkillContentEncapsulator.getInstance()
export const skillFilter = SkillContentFilter
