# Database & API Reference Guide

## TIER 1: Primary Literature & Citation Databases

### PubMed / NCBI E-utilities
- **URL**: https://pubmed.ncbi.nlm.nih.gov/
- **API Base**: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/
- **API Key**: Free at https://www.ncbi.nlm.nih.gov/account/settings/ (3→10 req/s)
- **Key Endpoints**:
  - `esearch.fcgi` — Search by keywords, MeSH, authors, dates
  - `efetch.fcgi` — Retrieve records (XML/JSON/text)
  - `elink.fcgi` — Related articles, cited-by links
  - `esummary.fcgi` — Document summaries
- **Coverage**: 40M+ citations
- **Search Fields**: `[Title]`, `[Author]`, `[Journal]`, `[MeSH]`, `[Abstract]`, `[PDAT]`, `[DOI]`
- **Python**: `Bio.Entrez` (Biopython), `pubmed-parser`, `metapub`
- **MCP Server**: 16 tools (search_articles, get_article_details, get_full_text, get_cited_by, etc.)

### Europe PMC
- **URL**: https://europepmc.org/
- **API Base**: https://www.ebi.ac.uk/europepmc/webservices/rest/
- **Key Endpoints**: `search`, `{PMCID}/fullTextXML`
- **Coverage**: PubMed + PMC + patents + preprints
- **Python**: `europepmc`

### Semantic Scholar
- **URL**: https://www.semanticscholar.org/
- **API Base**: https://api.semanticscholar.org/graph/v1
- **Auth**: No key required; key available for higher limits
- **Key Endpoints**: `/paper/search`, `/paper/{id}`, `/paper/{id}/citations`, `/paper/{id}/references`
- **Coverage**: 200M+ papers
- **Unique**: AI relevance ranking, TLDR summaries, citation graph, open-access PDF detection

### OpenAlex
- **URL**: https://openalex.org/
- **API Base**: https://api.openalex.org/
- **Auth**: Free API key at https://openalex.org/settings/api
- **Key Endpoints**: `/works`, `/authors`, `/institutions`, `/topics`
- **Coverage**: 240M+ works, 90M+ authors
- **Unique**: Complete scholarly knowledge graph, topic classification

### bioRxiv / medRxiv (CSHL API)
- **API Base**: https://api.biorxiv.org/
- **Key Endpoints**: `details/{server}/{doi}`, `details/{server}/{interval}`
- **Python**: `medrxivr` (R)

## TIER 2: Clinical & Drug Databases

### ClinicalTrials.gov
- **URL**: https://clinicaltrials.gov/
- **API Base**: https://clinicaltrials.gov/api/v2
- **Auth**: Not required (public)
- **Rate Limit**: ~50 req/min
- **Key Endpoints**: `GET /studies`, `GET /studies/{NCTId}`
- **API Spec**: https://clinicaltrials.gov/api/oas/v2/ctg-oas-v2.yaml

### ChEMBL
- **URL**: https://www.ebi.ac.uk/chembl/
- **API Base**: https://www.ebi.ac.uk/chembl/api/data/
- **Key Endpoints**: `/molecule`, `/target`, `/assay`, `/activity`, `/drug`
- **Coverage**: 2M+ compounds, 19M+ activities
- **Python**: `chembl_webresource_client`

### Cochrane Library
- **URL**: https://www.cochranelibrary.com/
- **Coverage**: Gold-standard systematic reviews
- **Note**: API transitioning; always cross-reference clinical claims

## TIER 3: Genomics & Molecular Biology

### Ensembl
- **API Base**: https://rest.ensembl.org/
- **Key Endpoints**: `/lookup/id/{id}`, `/sequence/id/{id}`, `/vep/{id}`, `/homology/id/{id}`

### UniProt
- **API Base**: https://rest.uniprot.org/
- **Key Endpoints**: `/uniprotkb/search`, `/uniprotkb/{accession}`, `/uniprotkb/stream`
- **Proteins API**: https://www.ebi.ac.uk/proteins/api/

### GEO
- **URL**: https://www.ncbi.nlm.nih.gov/geo/
- **API**: Via NCBI E-utilities
- **Python**: `GEOparse`

## TIER 4: PhysioNet
- **URL**: https://physionet.org/
- **API**: https://physionet.org/api/
- **Key Paths**: `/projects/`, `/projects/search/`, `/projects/{slug}/`, `/projects/{slug}/{version}/files/`
- **Python**: `wfdb` (`pip install wfdb`)
- **Access**: Open / Credentialed / Restricted

## TIER 5: Medical Imaging

### The Cancer Imaging Archive (TCIA)
- **URL**: https://www.cancerimagingarchive.net/
- **API Base**: https://services.cancerimagingarchive.net/services/v4/TCIA/
- **Key Endpoints**: `getQueryData` (collection info), `getImage` (download images), `getPatient` (patient metadata), `getSeries` (series metadata), `getSOPInstance` (instance-level)
- **Python**: `tcia-client`
- **Coverage**: 150+ collections, 50M+ images (CT, MRI, PET, X-ray, pathology)
- **Key Collections**:
  - **TCGA-LUNG**: NSCLC CT + pathology + genomics (LUAD, LUSC)
  - **TCGA-BRCA**: Breast cancer MRI + pathology + genomics
  - **CPTAC**: Proteomics + pathology WSI
  - **LIDC-IDRI**: Lung nodule CT with expert annotations
  - **NSCLC-Radiomics**: NSCLC CT with tumor segmentations
- **⚠️ Note**: TCIA collections vary widely in annotation quality. Check per-collection documentation.

### OpenNeuro
- **URL**: https://openneuro.org/
- **API Base**: https://openneuro.org/api/v1/
- **Key Endpoints**: `GET /datasets`, `GET /datasets/{datasetId}`, `GET /datasets/{datasetId}/files`
- **Coverage**: 1,000+ fMRI/MEG/EEG datasets
- **Format**: BIDS (Brain Imaging Data Structure) — standardized
- **Python**: `openneuro-py`
- **⚠️ Note**: BIDS format standardization makes data loading easier than most neuroimaging repositories

### ADNI (Alzheimer's Disease Neuroimaging Initiative)
- **URL**: https://adni.loni.usc.edu/
- **Access**: Free registration required; data use agreement
- **Coverage**: 1,700+ subjects, longitudinal MRI + PET + CSF + cognitive assessments
- **Key Data**: T1/T2 MRI, FDG-PET, amyloid-PET, tau-PET, APOE genotyping, MMSE, CDR
- **⚠️ Note**: Longitudinal design (up to 15 years follow-up) makes this unique for progression modeling

### UK Biobank Imaging
- **URL**: https://www.ukbiobank.ac.uk/enable-your-research/imagining
- **Access**: Application + fees; access via UK Biobank Research Analysis Platform (RAP)
- **Coverage**: 100K+ participants with brain MRI, cardiac MRI, body MRI, DXA, carotid ultrasound
- **Key Modalities**: T1/T2/FLAIR/fMRI/dMRI (brain), cine MRI (cardiac), liver/pancreas MRI
- **Unique**: Paired with genetics (WES/WGS), clinical data, lifestyle data for 500K participants
- **⚠️ Note**: Access requires approved research proposal + significant fees (£3,000-£9,000 depending on access type)
- **⚠️ Note**: RAP (DNAnexus) provides cloud-based analysis without downloading data

### Medical Imaging Datasets Quick Reference

| Database | Modality | Size | Access | Label Quality |
|----------|----------|------|--------|--------------|
| TCIA | CT/MRI/PET/Pathology | 150+ collections, 50M+ images | Open (API) | Varies by collection; check per-dataset |
| OpenNeuro | fMRI/MEG/EEG | 1,000+ datasets | Open (API) | Task-based labels; generally reliable |
| ADNI | MRI/PET | 1,700+ subjects | Registered | Clinical diagnosis; high quality |
| UK Biobank Imaging | Multi-organ MRI/US/DXA | 100K+ participants | Application+fees | Clinical + research-grade |
| CheXpert | Chest X-ray | 224K images | Open | ⚠️ NLP-extracted; uncertainty labels |
| ChestX-ray14 | Chest X-ray | 112K images | Open | 🔴 NLP-extracted; ~30% noise; NOT reliable for evaluation |
| MIMIC-CXR | Chest X-ray | 377K images | Credentialed | ⚠️ NLP-extracted + radiologist validation |
| MIMIC-CXR-JPG | Chest X-ray | 377K images | Credentialed | Same labels as MIMIC-CXR; JPG format for easier use |
| VinDr-CXR | Chest X-ray | 18K images | Open | 🟢 Expert-annotated by radiologists; most reliable |
| PadChest | Chest X-ray | 160K images | Open | ⚠️ NLP-extracted + manual validation subset |
| BRAX | Chest X-ray | 40K images | Open | 🟢 External validation dataset (Brazil) |
| BraTS | Brain MRI | 1,250+ scans | Open | 🟢 Expert-annotated; competition-grade |
| ISIC | Dermoscopy | 30K+ images | Open | 🟢 Expert-annotated; multi-annotator |
| HAM10000 | Dermoscopy | 10K images | Open | 🟢 Expert-validated; skin lesion benchmark |
| Camelyon16/17 | Pathology WSI | 700+ slides | Open | 🟢 Expert-annotated metastasis detection |
| TCGA | Multi-cancer WSI + Genomics | 11K+ patients | Open (GDC) | 🟢 Pathology + molecular data paired |
| PanNuke | Pathology WSI | 190K nuclei | Open | 🟢 Expert-annotated nuclear segmentation |
| LUNA16 | Lung CT | 888 scans | Open | 🟢 Nodule annotations; competition-grade |
| KiTS | Kidney CT | 1,200+ scans | Open | 🟢 Kidney + tumor segmentation |
| AMOS | Abdominal CT/MRI | 500 scans | Open | 🟢 15-organ segmentation |

⚠️ LABEL QUALITY HIERARCHY (Medical Imaging):
🟢 Expert-annotated > ⚠️ NLP + validation > 🔴 NLP-only > ❌ No labels
When choosing a dataset for EVALUATION, prefer 🟢 over ⚠️/🔴 even if smaller.
When choosing for TRAINING, larger ⚠️ datasets are acceptable with label smoothing.

## TIER 6: Genomics & Multi-Omics Data

### UK Biobank (Genetics + Clinical)
- **URL**: https://www.ukbiobank.ac.uk/
- **Access**: Application + fees; RAP platform for cloud analysis
- **Coverage**: 500K participants; WES (all), WGS (200K+), genotyping array (all)
- **Clinical Data**: Diagnoses (ICD-10), procedures, medications, lab values, imaging, lifestyle
- **Key Resources**:
  - **RAP (Research Analysis Platform)**: Cloud-based analysis on DNAnexus
  - **BGERT (BGEN format)**: Genetic data in efficient BGEN format
  - **Phenotype portal**: Curated phenotype definitions
- **Python**: `ukbparse`, `hail` (for genetic data)
- **⚠️ Note**: UK Biobank is VOLUNTEER-biased (healthier than general population) — selection bias affects generalizability

### All of Us Research Program
- **URL**: https://researchallofus.org/
- **Access**: Application required; analysis on Researcher Workbench (cloud)
- **Coverage**: 1M+ participants; WGS (250K+), genotyping array, EHR, surveys, wearables
- **Unique**: Deliberately diverse recruitment (50% underrepresented populations)
- **⚠️ Note**: Most diverse genomic dataset available — critical for health equity research
- **⚠️ Note**: Data cannot be downloaded; analysis must be performed on Researcher Workbench

### GDC (Genomic Data Commons)
- **URL**: https://gdc.cancer.gov/
- **API Base**: https://api.gdc.cancer.gov/
- **Key Endpoints**: `/projects`, `/cases`, `/files`, `/data/{file_id}`, `/manifest`
- **Coverage**: TCGA + TARGET + CGCI; 70K+ cases, multi-omics + clinical
- **Data Types**: WGS, WES, RNA-seq, miRNA-seq, methylation, proteomics, pathology images
- **Python**: `gdc-client` (download), `TCGAbiolinks` (R)
- **⚠️ Note**: TCGA data is the STANDARD for cancer genomics — most published cancer genomics studies use TCGA

### GWAS Catalog
- **URL**: https://www.ebi.ac.uk/gwas/
- **API Base**: https://www.ebi.ac.uk/gwas/rest/api/
- **Key Endpoints**: `/studies`, `/associations`, `/snps`, `/efoTraits`
- **Coverage**: 6,000+ publications, 500K+ associations
- **Python**: `gwas_catalog_client`
- **⚠️ Note**: Curated GWAS summary statistics — always check for the latest version

### ENCODE
- **URL**: https://www.encodeproject.org/
- **API Base**: https://www.encodeproject.org/
- **Coverage**: Functional genomics data (ChIP-seq, ATAC-seq, RNA-seq, Hi-C) for human and mouse
- **⚠️ Note**: Essential for regulatory element annotation and epigenomics

### SRA (Sequence Read Archive)
- **URL**: https://www.ncbi.nlm.nih.gov/sra
- **API**: Via NCBI E-utilities
- **Coverage**: All public high-throughput sequencing data
- **Python**: `pysradb`, `sra-tools` (CLI for download)
- **⚠️ Note**: Largest public sequencing repository but metadata quality varies

### Single-Cell Data Repositories

| Repository | Coverage | Access | Key Feature |
|-----------|---------|--------|-------------|
| **CellxGene** | 70M+ cells, 700+ datasets | Open (API) | Curated, standardized AnnData format |
| **Human Cell Atlas** | Growing | Varies | Reference atlas for human cell types |
| **SCPortalen** | 1,000+ datasets | Open | Japanese single-cell repository |
| **PanglaoDB** | 10M+ cells | Open | Cell type marker gene database |
| **Single Cell Portal** | 500+ datasets | Open | Broad Institute portal |

## TIER 7: Drug & Chemical Databases

### PubChem
- **URL**: https://pubchem.ncbi.nlm.nih.gov/
- **API Base**: https://pubchem.ncbi.nlm.nih.gov/rest/pug/
- **Key Endpoints**: `/compound`, `/substance`, `/assay`, `/bioassay`
- **Coverage**: 100M+ compounds, 300M+ substances, 1M+ bioassays
- **Python**: `pubchempy`

### DrugBank
- **URL**: https://go.drugbank.com/
- **Access**: Free for academic (limited); commercial license for full access
- **Coverage**: 15K+ drug entries (approved + experimental)
- **Key Data**: Drug-target interactions, pathways, ADMET, clinical data
- **⚠️ Note**: Free version has limited data; full version requires license

### ZINC15 / ZINC20
- **URL**: https://zinc15.docking.org/ / https://zinc20.docking.org/
- **API Base**: https://zinc15.docking.org/
- **Coverage**: 1.4B+ purchasable compounds for virtual screening
- **Key Feature**: Pre-filtered by drug-likeness, reactivity, availability
- **Python**: `zinc15` (unofficial)

### DailyMed
- **URL**: https://dailymed.nlm.nih.gov/
- **API Base**: https://dailymed.nlm.nih.gov/dailymed/services/v2/
- **Coverage**: FDA-approved drug labeling (package inserts)
- **Key Use**: Drug dosing, contraindications, adverse reactions — ground truth for LLM verification

## TIER 8: AI/ML Model Repositories

### Hugging Face
- **URL**: https://huggingface.co/
- **API Base**: https://huggingface.co/api/
- **Key Endpoints**: `/models`, `/datasets`, `/spaces`
- **Medical Models**: BioClinicalBERT, MedCPT, BiomedCLIP, LLaVA-Med, UNI, PLIP
- **Medical Datasets**: Growing collection of medical imaging and NLP datasets
- **Python**: `transformers`, `datasets`, `huggingface_hub`
- **⚠️ Note**: Always verify model licenses before commercial use; medical models may have restricted licenses

### Model Zoos (Medical-Specific)

| Repository | Focus | Key Models | Access |
|-----------|-------|-----------|--------|
| **MONAI Model Zoo** | Medical imaging | Medical segmentation, classification | 🟢 Open |
| **TorchXRayVision** | Chest X-ray | Pretrained CXR classifiers | 🟢 Open |
| **PathML** | Pathology | WSI analysis models | 🟢 Open |
| **BioNeMo** | Protein/Genomics | Protein structure, sequence models | 🟡 NVIDIA license |
| **DeepChem** | Drug discovery | Molecular property models | 🟢 Open |

## TIER 9: Open Access Publishing

| Platform | URL | Best For |
|----------|-----|----------|
| PLoS | https://www.plos.org/ | High-impact OA |
| eLife | https://elifesciences.org/ | Non-profit OA, transparent review |
| BMC | https://www.biomedcentral.com/ | Broad biomedical OA |
| DOAJ | https://doaj.org/ | Finding legitimate OA journals |
| PMC | https://www.ncbi.nlm.nih.gov/pmc/ | Free full-text |

---

## Database Routing Guide

| User Need | Primary | Secondary | API Method |
|-----------|---------|-----------|------------|
| Find papers | PubMed | Semantic Scholar, OpenAlex | E-utilities |
| Full text | Europe PMC | bioRxiv/medRxiv | Europe PMC REST |
| Citation network | Semantic Scholar | OpenAlex | S2 Graph API |
| Research trends | OpenAlex | Semantic Scholar | OpenAlex API |
| Clinical evidence | Cochrane, ClinicalTrials.gov | PubMed (RCT filter) | CTG API v2 |
| Drug data | ChEMBL | PubChem, DrugBank | ChEMBL REST |
| Drug dosing/labeling | DailyMed | DrugBank | DailyMed REST |
| Protein info | UniProt | Ensembl, AlphaFold DB | UniProt REST |
| Gene/genome | Ensembl | GEO, GDC | Ensembl REST |
| Cancer genomics | GDC (TCGA) | GEO | GDC API |
| GWAS data | GWAS Catalog | UK Biobank | GWAS REST |
| Single-cell data | CellxGene | GEO, SRA | CellxGene API |
| Virtual screening compounds | ZINC20 | ChEMBL | ZINC REST |
| ECG/EEG/BCI | PhysioNet | — | `wfdb` |
| ICU data | MIMIC-IV | eICU | Credentialed |
| Medical imaging | TCIA, OpenNeuro | ADNI, UK Biobank | TCIA API |
| Pathology WSI | TCGA (GDC), Camelyon | PanNuke, PathML | GDC API |
| Chest X-ray | CheXpert, VinDr-CXR | MIMIC-CXR, PadChest | Dataset-specific |
| Brain MRI | BraTS, ADNI | UK Biobank, OpenNeuro | Dataset-specific |
| Pretrained medical models | Hugging Face | MONAI, TorchXRayVision | HF API |
| Preprints | bioRxiv/medRxiv | Europe PMC | CSHL API |
| Verify claim | Cochrane + PubMed + S2 | ClinicalTrials.gov | Multi-source |
| Diverse population genetics | All of Us | UK Biobank | Researcher Workbench |
| Functional genomics | ENCODE | GEO | ENCODE API |

---

## TIER 10: Real-World Data & Claims Databases

### Overview

Real-world data (RWD) is increasingly important for AI validation, causal inference, and post-market surveillance. These databases contain insurance claims, electronic health records, and patient registries.

| Database | Type | Population | Key Variables | Access | Best For |
|----------|------|-----------|--------------|--------|---------|
| **SEER-Medicare** | Cancer registry + claims | US elderly (65+) cancer patients | Cancer type, treatment, survival, claims | Application required; free | Cancer outcomes; treatment patterns |
| **MarketScan (IBM/Truven)** | Commercial claims | US privately insured | Diagnoses, procedures, drugs, costs | Licensed ($$$) | Treatment patterns; drug safety |
| **OptumLabs Data Warehouse** | Commercial claims + EHR | US insured population | Claims + clinical notes | Licensed ($$$) | AI validation; clinical outcomes |
| **UK CPRD (Clinical Practice Research Datalink)** | Primary care EHR | UK population | Diagnoses, prescriptions, referrals | Application required; free | Drug safety; epidemiology |
| **IQVIA** | Pharmacy claims | Global | Prescriptions, sales, demographics | Licensed ($$$) | Drug utilization; market research |
| **Medicare Fee-for-Service** | Government claims | US 65+ and disabled | All Medicare claims | CMS Virtual Research Data Center | Health policy; disparities |
| **Flatiron Health** | Oncology EHR | US cancer patients | Structured + unstructured oncology data | Licensed ($$$) | Real-world oncology evidence |
| **TriNetX** | Multi-institution EHR | Global network | Diagnoses, procedures, labs | Free (basic); Licensed (premium) | Rapid cohort identification |

### RWD Access Decision Tree

```

---

## TIER 14: Causal Genomics & MR Databases

### GWAS Catalog

| Aspect | Detail |
|--------|--------|
| **URL** | ebi.ac.uk/gwas |
| **API** | ebi.ac.uk/gwas/rest/api |
| **Content** | Published GWAS summary statistics; trait-SNP associations |
| **Key Use** | MR instrument selection; trait heritability; genetic correlation |
| **Key Fields** | EFO trait; p-value; OR/beta; sample size; ancestry |

### IEU OpenGWAS

| Aspect | Detail |
|--------|--------|
| **URL** | gwas.mrcieu.ac.uk |
| **API** | gwas.mrcieu.ac.uk/api |
| **Content** | 40,000+ curated GWAS summary statistics; standardized format |
| **Key Use** | TwoSampleMR analysis; MR instrument extraction; LD reference |
| **Python** | `gwasglue` (R: `TwoSampleMR`, `ieugwasr`) |

### MR-Base / TwoSampleMR

| Aspect | Detail |
|--------|--------|
| **URL** | mrbase.org |
| **R Package** | `TwoSampleMR` (CRAN/GitHub) |
| **Content** | Pre-computed LD; instrument clumping; MR analysis pipeline |
| **Key Use** | End-to-end MR analysis; sensitivity analysis; heterogeneity testing |

### PhenoScanner V2

| Aspect | Detail |
|--------|--------|
| **URL** | phenoscanner.medschl.cam.ac.uk |
| **API** | phenoscanner.medschl.cam.ac.uk/api |
| **Content** | SNP-phenotype and gene-phenotype associations from GWAS |
| **Key Use** | Pleiotropy check for MR; phenotype lookup for genetic variants |

### eQTL Catalogue

| Aspect | Detail |
|--------|--------|
| **URL** | ebi.ac.uk/eqtl |
| **API** | ebi.ac.uk/eqtl/api |
| **Content** | eQTL summary statistics across tissues and cell types |
| **Key Use** | Colocalization analysis; GWAS-to-function; tissue-specific effects |
| **Key Resource** | GTEx v8 (dominant eQTL resource) |

### pQTL & sQTL Resources

| Resource | URL | Content | Key Use |
|----------|-----|---------|---------|
| **SCALLOP/INTERVAL** | ebi.ac.uk/arrayexpress | pQTL summary statistics | Protein biomarker MR |
| **Sun et al. pQTL** | ebi.ac.uk/arrayexpress | 3,000+ protein QTLs | Pharmaco-MR |
| **GTEx sQTL** | gtexportal.org | Splicing QTL by tissue | sQTL colocalization |

---

## TIER 15: Immunoinformatics & Vaccine Databases

### IEDB — Immune Epitope Database

| Aspect | Detail |
|--------|--------|
| **URL** | iedb.org |
| **API** | iedb.org/API |
| **Content** | B-cell and T-cell epitopes; MHC binding data; epitope assay results |
| **Key Use** | Epitope prediction validation; vaccine design; neoantigen discovery |
| **Coverage** | 1.5M+ epitopes; 40,000+ references |

### NetMHCpan Server

| Aspect | Detail |
|--------|--------|
| **URL** | services.healthtech.dtu.dk/services/NetMHCpan-4.1 |
| **API** | REST API for batch prediction |
| **Content** | MHC-I binding prediction for 12,000+ HLA alleles |
| **Key Use** | T-cell epitope prediction; neoantigen ranking |

### VDJdb — T-Cell Receptor Database

| Aspect | Detail |
|--------|--------|
| **URL** | vdjdb.cdr3.net |
| **API** | vdjdb.cdr3.net/api |
| **Content** | Curated TCR-epitope pairs; CDR3 sequences; antigen specificity |
| **Key Use** | TCR specificity prediction; immune repertoire analysis |

### McPAS-TCR

| Aspect | Detail |
|--------|--------|
| **URL** | friedmanlab.weizmann.ac.il/McPAS-TCR |
| **Content** | TCR sequences associated with pathological conditions |
| **Key Use** | Disease-specific TCR annotation; immune repertoire interpretation |

---

## TIER 16: Epitranscriptomics & 3D Genome Databases

### RMBase / m6A-Atlas

| Resource | URL | Content | Key Use |
|----------|-----|---------|---------|
| **RMBase v3.0** | rna.sysu.edu.cn/rmbase | RNA modification sites (m6A, m5C, Ψ, m1A) | Modification site lookup |
| **m6A-Atlas** | xteam.lifeinfo/m6a | High-confidence m6A sites from multiple methods | m6A site validation |
| **REPIC** | repicmod.uchicago.edu | Epitranscriptomic peaks from CLIP-seq | Peak overlap analysis |
| **MODOMICS** | genesilico.pl/modomics | RNA modification chemistry and pathways | Modification type reference |

### 4D Nucleome Data Portal

| Aspect | Detail |
|--------|--------|
| **URL** | data.4dnucleome.org |
| **API** | data.4dnucleome.org/api |
| **Content** | Hi-C, ChIA-PET, ATAC-seq, and other 3D genome data |
| **Key Use** | 3D genome analysis; chromatin interaction validation |
| **Format** | .hic, .cool, .mcool |

### ENCODE 3D Genome

| Aspect | Detail |
|--------|--------|
| **URL** | encodeproject.org |
| **API** | encodeproject.org/api |
| **Content** | Hi-C, ChIA-PET, ATAC-seq, DNase-seq across cell types |
| **Key Use** | Chromatin accessibility; promoter-enhancer interactions |

---

## TIER 17: Liquid Biopsy & ctDNA Databases

### cBioPortal — Cancer Genomics

| Aspect | Detail |
|--------|--------|
| **URL** | cbioportal.org |
| **API** | cbioportal.org/api |
| **Content** | Cancer genomic data; mutation frequencies; co-occurrence |
| **Key Use** | Mutation frequency for ctDNA panel design; co-mutation analysis |

### GENIE — AACR Project GENIE

| Aspect | Detail |
|--------|--------|
| **URL** | genie.cbioportal.org |
| **API** | genie.cbioportal.org/api |
| **Content** | Real-world cancer genomic data from 19 centers; 800K+ samples |
| **Key Use** | Real-world variant frequency; resistance mutation prevalence |

### Cell-Free DNA Atlas

| Aspect | Detail |
|--------|--------|
| **URL** | genboree.org/cfDNA |
| **Content** | cfDNA fragmentomics data; nucleosome positioning |
| **Key Use** | Fragmentomics analysis; tissue-of-origin prediction |

---

## TIER 18: Flow Cytometry & CyTOF Databases

### FlowRepository

| Aspect | Detail |
|--------|--------|
| **URL** | flowrepository.org |
| **API** | flowrepository.org/api |
| **Content** | FCS files with associated metadata and gating annotations |
| **Key Use** | Flow cytometry benchmarking; panel validation |

### ImmPort — Immunology Database

| Aspect | Detail |
|--------|--------|
| **URL** | immport.org |
| **API** | immport.niaid.nih.gov/api |
| **Content** | Immune profiling data; flow cytometry; CyTOF; Luminex |
| **Key Use** | Immune cell phenotyping; vaccine response data |

---

## Additional Workflow Templates

### Causal Genomics (MR) Workflow (Multi-Database)

```
Mendelian Randomization Query
    │
    ├─ [1] Instrument selection
    │   ├─ GWAS Catalog → identify lead SNPs for exposure
    │   ├─ IEU OpenGWAS → extract full summary statistics
    │   ├─ PhenoScanner → check for pleiotropic associations
    │   └─ LD reference → clump instruments (r² < 0.001)
    │
    ├─ [2] Outcome data extraction
    │   ├─ IEU OpenGWAS → outcome GWAS summary stats
    │   └─ GWAS Catalog → verify outcome trait definition
    │
    ├─ [3] Colocalization (if needed)
    │   ├─ eQTL Catalogue → tissue-specific eQTL data
    │   ├─ GTEx → eQTL by tissue
    │   └─ COLOC → formal colocalization test
    │
    ├─ [4] MR analysis
    │   ├─ TwoSampleMR → IVW, MR-Egger, WM, Mode
    │   ├─ MR-PRESSO → outlier detection
    │   └─ Steiger filtering → directionality check
    │
    └─ [5] Sensitivity analysis
        ├─ Heterogeneity test → Cochran's Q
        ├─ Pleiotropy test → MR-Egger intercept
        ├─ Leave-one-out → single-SNP influence
        └─ Multivariable MR → adjust for confounders
```

### Immunoinformatics Workflow (Multi-Database)

```
Vaccine/Epitope Design Query
    │
    ├─ [1] Antigen selection
    │   ├─ UniProt → protein sequence and structure
    │   ├─ IEDB → known epitopes for target antigen
    │   └─ VFDB → virulence factors (for bacterial vaccines)
    │
    ├─ [2] Epitope prediction
    │   ├─ NetMHCpan → MHC-I binding prediction
    │   ├─ NetMHCIIpan → MHC-II binding prediction
    │   ├─ BepiPred-2.0 → B-cell linear epitope prediction
    │   └─ DiscoTope-3.0 → conformational epitope prediction
    │
    ├─ [3] Population coverage
    │   ├─ IEDB Population Coverage tool → HLA allele frequency
    │   └─ AFND → allele frequency by ethnicity
    │
    ├─ [4] Cross-reactivity check
    │   ├─ BLAST → homology to human proteins (autoimmunity risk)
    │   └─ IEDB → cross-reactive epitope search
    │
    └─ [5] Immune response validation
        ├─ VDJdb → known TCR-epitope pairs
        ├─ McPAS-TCR → disease-associated TCRs
        └─ ImmPort → experimental immune response data
```

### Liquid Biopsy Workflow (Multi-Database)

```
ctDNA/Liquid Biopsy Query
    │
    ├─ [1] Target selection
    │   ├─ cBioPortal → mutation frequency by cancer type
    │   ├─ GENIE → real-world variant prevalence
    │   ├─ COSMIC → somatic mutation catalog
    │   └─ OncoKB → actionable mutations
    │
    ├─ [2] Panel design
    │   ├─ gnomAD → filter germline variants (AF > 0.01)
    │   ├─ COSMIC → cancer-specific hotspot inclusion
    │   └─ ClinVar → pathogenic variant inclusion
    │
    ├─ [3] Clinical interpretation
    │   ├─ OncoKB → treatment implications
    │   ├─ CIViC → variant-therapy mapping
    │   └─ ClinicalTrials.gov → trial eligibility
    │
    └─ [4] Fragmentomics (if applicable)
        ├─ Cell-Free DNA Atlas → fragment size reference
        ├─ ENCODE → nucleosome positioning data
        └─ 4D Nucleome → chromatin accessibility
```
Need Real-World Data
  │
  ├─ Cancer outcomes research?
  │   └─ SEER-Medicare (free; US elderly) or Flatiron (paid; broader age)
  │
  ├─ Drug safety / pharmacovigilance?
  │   └─ CPRD (free; UK) or MarketScan (paid; US)
  │
  ├─ Treatment pattern analysis?
  │   └─ MarketScan or OptumLabs (US commercial insurance)
  │
  ├─ Health disparities / policy?
  │   └─ Medicare FFS (US elderly) or CPRD (UK universal)
  │
  ├─ Rapid cohort identification?
  │   └─ TriNetX (free basic; global network)
  │
  └─ AI model validation with RWD?
      └─ TriNetX (screening) + specific claims DB (detailed analysis)
```

### RWD Pitfalls for AI Researchers

| Pitfall | Description | Impact | Mitigation |
|---------|-------------|--------|-----------|
| **Claims ≠ clinical truth** | Billing codes may not reflect actual diagnoses | Misclassification bias | Validate with chart review subset |
| **Missing data** | Claims don't capture OTC drugs, lifestyle, severity | Incomplete picture | Sensitivity analyses; multiple imputation |
| **Selection bias** | Insured population ≠ general population | Limited generalizability | Acknowledge; compare with census data |
| **Temporal gaps** | Enrollment changes; people switch insurers | Loss to follow-up | Require continuous enrollment criteria |
| **Coding changes** | ICD-9 → ICD-10 transition in 2015 | Inconsistent coding over time | Use crosswalk maps; analyze pre/post separately |

**Rule**: Claims data diagnoses have ~80-90% positive predictive value for common conditions. For rare conditions, PPV can be <50%. Always validate your cohort definition.
**Rule**: RWD studies MUST report the code lists used for cohort definition (ICD, CPT, NDC). Opaque code lists are not reproducible.

---

## TIER 11: Clinical Trial Registries & Evidence Synthesis

| Resource | Type | Coverage | API | Best For |
|----------|------|----------|-----|---------|
| **ClinicalTrials.gov** | Trial registry | Global (400K+ trials) | v2 API | Finding trials; recruitment status |
| **EU Clinical Trials Register** | Trial registry | EU/EEA | REST API | EU-specific trials |
| **ICTRP (WHO)** | Meta-registry | Global (15 registries) | Search API | Comprehensive trial search |
| **Cochrane Library** | Systematic reviews | Global | No public API | Evidence synthesis; meta-analysis |
| **PROSPERO** | Protocol registry | Global (400K+ protocols) | REST API | Ongoing systematic reviews |
| **OpenTrials** | Aggregated trial data | Global | REST API | Trial transparency; data mining |

### Clinical Trial Data Extraction Protocol

```
Clinical Trial Question
  ↓
[1] Search Strategy
    → ClinicalTrials.gov: condition + intervention + status
    → ICTRP: broader search across all registries
    → ⚠️ ClinicalTrials.gov has the MOST complete data; start here
  ↓
[2] Data Extraction
    → Trial ID, title, phase, status, enrollment
    → Intervention, comparator, outcomes
    → Sponsor, sites, dates
    → ⚠️ Results are often NOT posted even for completed trials
  ↓
[3] Results Availability
    → Check if results are posted on ClinicalTrials.gov
    → Check PubMed for published results
    → ⚠️ ~50% of completed trials have NO published results within 2 years
  ↓
[4] Bias Assessment
    → Randomization method
    → Blinding status
    → Allocation concealment
    → Selective outcome reporting
    → ⚠️ Registry outcomes vs published outcomes may differ (outcome switching)
```

**Rule**: Always check trial registries in addition to published literature. Many trials are registered but never published, creating publication bias.
**Rule**: Compare registered primary outcomes with published primary outcomes. Outcome switching (changing the primary outcome after seeing results) is a major source of bias.

---

## TIER 12: Cohort & Longitudinal Studies

| Cohort | Population | Size | Follow-up | Key Data | Access |
|--------|-----------|------|-----------|---------|--------|
| **UK Biobank** | UK adults 40-69 | 500K | 15+ years | Genomics, imaging, lifestyle, EHR | Open (registered); ££ for some data |
| **All of Us** | US diverse adults | 1M+ | Ongoing | Genomics, EHR, surveys, wearables | Registered researchers |
| **Framingham Heart Study** | US multi-generational | 15K+ | 75+ years | Cardiovascular, genomics, lifestyle | dbGaP application |
| **Nurses' Health Study** | US female nurses | 280K | 40+ years | Diet, lifestyle, disease outcomes | Application required |
| **ARIC Study** | US adults | 15K | 35+ years | Cardiovascular, cognitive, genomics | dbGaP application |
| **MESA** | US multi-ethnic adults | 6.8K | 20+ years | Cardiovascular, imaging, genomics | dbGaP application |
| **BioBank Japan** | Japanese patients | 200K | 15+ years | Genomics, clinical, multi-disease | Collaborative research |
| **China Kadoorie Biobank** | Chinese adults | 512K | 15+ years | Lifestyle, genomics, disease outcomes | Collaborative research |
| **Generation Scotland** | Scottish families | 24K | 20+ years | Genomics, mental health, EHR | Application required |
| **HUNT Study** | Norwegian adults | 230K | 40+ years | Health surveys, genomics, EHR | Collaborative research |

### Cohort Study Data Access Guide

```
Cohort Data Request
  ↓
[1] Identify Relevant Cohort
    → UK Biobank: largest; most accessible; best for general medical AI
    → All of Us: most diverse US cohort; includes underrepresented groups
    → dbGaP cohorts (Framingham, ARIC, MESA): deep longitudinal data
    → ⚠️ Choose cohort that matches your study population
  ↓
[2] Access Application
    → UK Biobank: online application; typically 2-4 weeks
    → All of Us: Researcher Workbench; requires training
    → dbGaP: IRB + Data Access Committee; typically 2-6 months
    → ⚠️ Plan ahead — access can take months
  ↓
[3] Data Use Restrictions
    → UK Biobank: approved research only; no commercial redistribution
    → dbGaP: specific approved use; annual renewal
    → All of Us: must complete training; no re-identification attempts
    → ⚠️ Violating data use agreements = permanent ban + legal consequences
  ↓
[4] Computational Environment
    → UK Biobank: RAP (Research Analysis Platform) on DNAnexus
    → All of Us: Google Cloud Platform Workbench
    → dbGaP: download to local secure environment
    → ⚠️ Cloud platforms have costs; budget accordingly
```

**Rule**: UK Biobank is NOT representative of the general population — participants are healthier than average ("healthy volunteer bias"). Prevalence estimates will be biased.
**Rule**: All of Us has the BEST diversity among large cohorts but is still enrolling. Sample sizes for some subgroups may be limited.

---

## TIER 13: Biomedical Knowledge Integration Databases (OpenClaw-Enhanced)

### Open Targets Platform

| Aspect | Detail |
|--------|--------|
| **URL** | opentargets.org |
| **API** | platform-api.opentargets.org/api/v4/graphql |
| **Content** | Target-disease associations, target-drug associations, genetic evidence, somatic mutations |
| **Key Use** | Drug target validation; repurposing; genetic evidence scoring |
| **Data Sources** | GWAS Catalog, ChEMBL, UniProt, Reactome, EFO, ClinVar |

**Open Targets GraphQL Query Examples**:
```
# Target-to-disease associations for EGFR
query {
  target(ensemblId: "ENSG00000146648") {
    id
    approvedSymbol
    associatedDiseases(page: {index: 0, size: 10}) {
      count
      rows {
        disease { id name }
        score
      }
    }
  }
}

# Disease-to-target associations for breast cancer
query {
  disease(efoId: "EFO_0003869") {
    id
    name
    associatedTargets(page: {index: 0, size: 10}) {
      count
      rows {
        target { id approvedSymbol }
        score
      }
    }
  }
}
```

### DisGeNET — Disease-Gene Associations

| Aspect | Detail |
|--------|--------|
| **URL** | disgenet.org |
| **API** | api.disgenet.com/api/v1 |
| **Content** | Curated disease-gene associations; variant-disease associations |
| **Key Use** | Disease target identification; network pharmacology |
| **Score** | Gene-Disease Association (GDA) score 0-1; Variant-Disease Association (VDA) score |

### DGIdb — Drug-Gene Interaction Database

| Aspect | Detail |
|--------|--------|
| **URL** | dgidb.org |
| **API** | dgidb.org/api/v2 |
| **Content** | Drug-gene interactions; druggable genome categories |
| **Key Use** | Druggability assessment; repurposing candidate identification |
| **Categories** | kinase, gpcr, ion_channel, transporter, nuclear_hormone_receptor |

### STRING — Protein-Protein Interaction Network

| Aspect | Detail |
|--------|--------|
| **URL** | string-db.org |
| **API** | string-db.org/api |
| **Content** | Known and predicted PPIs; confidence scores; functional enrichment |
| **Key Use** | Network pharmacology; pathway analysis; hub gene identification |
| **Confidence Threshold** | >0.7 high; 0.4-0.7 medium; <0.4 low (avoid for drug discovery) |

### CPIC — Clinical Pharmacogenetics Implementation Consortium

| Aspect | Detail |
|--------|--------|
| **URL** | cpicpgx.org |
| **API** | api.cpicpgx.org |
| **Content** | Gene-drug guidelines; allele functionality; dosing recommendations |
| **Key Use** | Pharmacogenomic-guided dosing; DDI assessment |
| **Key Gene-Drug Pairs** | CYP2D6-codeine; CYP2C19-clopidogrel; TPMT-thiopurines; SLCO1B1-simvastatin |

### PharmGKB — Pharmacogenomics Knowledge Base

| Aspect | Detail |
|--------|--------|
| **URL** | pharmgkb.org |
| **API** | api.pharmgkb.org/v1 |
| **Content** | Variant-drug-disease annotations; clinical guidelines; pathway diagrams |
| **Key Use** | Pharmacogenomic evidence; drug response prediction |
| **Evidence Levels** | 1A = guideline; 1B = strong; 2A = moderate; 2B = weak; 3 = case reports; 4 = in vitro |

### OncoKB — Precision Oncology Knowledge Base

| Aspect | Detail |
|--------|--------|
| **URL** | oncokb.org |
| **API** | oncokb.org/api/v1 |
| **Content** | Cancer variant actionability; FDA-approved therapies; resistance mutations |
| **Key Use** | Cancer variant interpretation; treatment recommendation |
| **Access** | Academic license free; commercial license required |

### CIViC — Clinical Interpretation of Variants in Cancer

| Aspect | Detail |
|--------|--------|
| **URL** | civicdb.org |
| **API** | civicdb.org/api |
| **Content** | Community-curated cancer variant clinical interpretations |
| **Key Use** | Open-access cancer variant interpretation (complements OncoKB) |
| **Evidence Levels** | A = validated; B = clinical; C = case study; D = preclinical; E = inferential |

### COSMIC — Catalogue of Somatic Mutations in Cancer

| Aspect | Detail |
|--------|--------|
| **URL** | cancer.sanger.ac.uk/cosmic |
| **API** | cancer.sanger.ac.uk/cosmic/api |
| **Content** | Somatic mutation catalog; cancer gene census; mutational signatures |
| **Key Use** | Cancer mutation frequency; driver gene identification; mutational signature analysis |
| **Key Resource** | Cancer Gene Census (CGC) — curated list of cancer driver genes |

### gnomAD — Genome Aggregation Database

| Aspect | Detail |
|--------|--------|
| **URL** | gnomad.broadinstitute.org |
| **API** | gnomad.broadinstitute.org/api |
| **Content** | Population allele frequencies; constraint metrics; LOF intolerance |
| **Key Use** | ACMG BA1/BS1 criteria; variant filtering; gene constraint (pLI) |
| **Key Metrics** | pLI (LOF intolerance); Z-score (missense constraint); allele frequency by ancestry |

### FAERS — FDA Adverse Event Reporting System

| Aspect | Detail |
|--------|--------|
| **URL** | fda.gov/drugs/questions-and-answers-drugs/fda-adverse-event-reporting-system-faers |
| **API** | api.fda.gov/drug/event.json |
| **Content** | Spontaneous adverse event reports; drug-AE pairs |
| **Key Use** | Pharmacovigilance signal detection; DDI discovery; safety profiling |
| **Limitation** | Reporting bias; no denominator; cannot calculate true incidence |

---

## Integrated Database Workflow Templates

### Drug Repurposing Workflow (Multi-Database)

```
Drug Repurposing Query
    │
    ├─ [1] Disease target identification
    │   ├─ Open Targets → target-disease associations with genetic evidence
    │   ├─ DisGeNET → disease-gene associations (curated)
    │   └─ GWAS Catalog → trait-to-gene mapping
    │
    ├─ [2] Target druggability assessment
    │   ├─ DGIdb → is target druggable? existing drugs?
    │   ├─ ChEMBL → bioactivity data for known compounds
    │   └─ Open Targets → target classification (safety, druggability)
    │
    ├─ [3] Drug identification
    │   ├─ DrugBank → approved drugs targeting gene
    │   ├─ ChEMBL → investigational compounds
    │   └─ ClinicalTrials.gov → ongoing trials for target
    │
    ├─ [4] Safety assessment
    │   ├─ FAERS → adverse event signals
    │   ├─ PharmGKB → pharmacogenomic interactions
    │   └─ DailyMed → label warnings, black box
    │
    └─ [5] Network context
        ├─ STRING → PPI network for target
        ├─ KEGG/Reactome → pathway context
        └─ Open Targets → pathway enrichment
```

### Precision Oncology Workflow (Multi-Database)

```
Tumor Molecular Profiling
    │
    ├─ [1] Variant annotation
    │   ├─ OncoKB → actionability level (1-4, R)
    │   ├─ CIViC → open-access variant interpretation
    │   ├─ COSMIC → mutation frequency; Cancer Gene Census
    │   └─ gnomAD → population frequency (BA1/BS1 filtering)
    │
    ├─ [2] Clinical actionability
    │   ├─ NCCN guidelines → standard of care
    │   ├─ ClinicalTrials.gov → trial eligibility
    │   └─ MyCancerGenome → variant-therapy mapping
    │
    ├─ [3] Resistance assessment
    │   ├─ OncoKB resistance annotations
    │   └─ Literature → emerging resistance mechanisms
    │
    └─ [4] Biomarker assessment
        ├─ TMB calculation → immunotherapy eligibility
        ├─ MSI status → immunotherapy eligibility
        └─ PD-L1 IHC → checkpoint inhibitor response
```

### Pharmacovigilance Signal Detection Workflow (Multi-Database)

```
Drug Safety Query
    │
    ├─ [1] Statistical signal detection
    │   ├─ FAERS API → PRR, ROR calculation
    │   └─ WHO VigiBase → BCPNN, MGPS (if access)
    │
    ├─ [2] Clinical case review
    │   ├─ PubMed → case reports
    │   └─ Literature → systematic review of AE evidence
    │
    ├─ [3] Mechanistic plausibility
    │   ├─ DrugBank → drug mechanism, targets
    │   ├─ Open Targets → target-pathway mapping
    │   └─ STRING → target interaction network
    │
    ├─ [4] Pharmacogenomic factors
    │   ├─ CPIC → gene-drug guidelines
    │   ├─ PharmGKB → variant-drug annotations
    │   └─ gnomAD → variant frequency by population
    │
    └─ [5] Regulatory status
        ├─ FDA label → current warnings
        ├─ EMA EPAR → European assessment
        └─ DailyMed → updated label information
```

### BME Medical Device IP & Regulatory Workflow (Multi-Database)

```
Medical Device Innovation Query
    │
    ├─ [1] Prior art & IP landscape
    │   ├─ USPTO API → patent search by CPC class (A61B/A61F/A61N)
    │   ├─ Google Patents → prior art search, citation analysis
    │   └─ EPO Espacenet → European patent families
    │
    ├─ [2] Regulatory pathway assessment
    │   ├─ OpenFDA 510(k) → predicate device identification
    │   ├─ OpenFDA PMA → Class III approval history
    │   ├─ OpenFDA Classification → device class and regulation
    │   └─ EU MDR → CE marking requirements
    │
    ├─ [3] Safety & post-market surveillance
    │   ├─ OpenFDA Adverse Events → MAUDE database
    │   ├─ OpenFDA Recalls → recall history for device type
    │   └─ OpenFDA Enforcement → regulatory actions
    │
    └─ [4] Competitive landscape
        ├─ OpenFDA UDI → device registry and manufacturers
        ├─ ClinicalTrials.gov → ongoing device trials
        └─ PubMed → clinical evidence for device type
```

## TIER 19: Patent & Intellectual Property Databases (BME-Relevant)

### USPTO Patent API

| Aspect | Detail |
|--------|--------|
| **URL** | developer.uspto.gov |
| **API Base** | developer.uspto.gov/dataset-api |
| **Content** | US patents and applications; full text; classifications; citations |
| **Key Use** | Prior art search; IP landscape analysis; freedom-to-operate |
| **Key Endpoints** | Patent search, PEDS (examination history), assignments, TSDR (trademark status) |
| **BME-Relevant CPC Classes** | A61B (diagnostics), A61F (implants/prosthetics), A61N (electrotherapy), G16H (healthcare informatics) |
| **Python** | `python-uspto`, direct API calls |

### Google Patents Public Datasets

| Aspect | Detail |
|--------|--------|
| **URL** | console.cloud.google.com/marketplace/details/google_patents_public_datasets |
| **Content** | Full-text patent data; BigQuery access; citation networks |
| **Key Use** | Large-scale patent analytics; citation analysis; technology landscape |
| **Access** | Google BigQuery (free tier available) |

### EPO Espacenet

| Aspect | Detail |
|--------|--------|
| **URL** | worldwide.espacenet.com |
| **API** | developers.epo.org |
| **Content** | Worldwide patent search; European patent families; legal status |
| **Key Use** | International patent families; European filing status; INPADOC legal events |
