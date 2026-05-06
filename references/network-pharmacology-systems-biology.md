# Network Pharmacology & Systems Biology Methodology

## Network Pharmacology — Drug-Target-Disease Network Analysis

### Network Pharmacology Pipeline

| Step | Method | Tool/Database | Output | Key Decision |
|------|--------|--------------|--------|-------------|
| **1. Drug target identification** | Database mining + prediction | DrugBank, ChEMBL, STITCH, SwissTargetPrediction | Drug-target list | Include predicted targets? |
| **2. Disease target identification** | Database mining + GWAS | DisGeNET, Open Targets, GWAS Catalog | Disease-gene list | Evidence threshold |
| **3. Network construction** | Intersection + PPI | STRING, BioGRID, NetworkX | Drug-target-disease network | PPI confidence score threshold |
| **4. Topology analysis** | Centrality metrics | Cytoscape, NetworkX | Hub genes, bottlenecks | Degree >2× median as hub |
| **5. Pathway enrichment** | GO/KEGG/Reactome | clusterProfiler, g:Profiler | Enriched pathways | FDR < 0.05 |
| **6. Molecular docking** | Structure-based | AutoDock Vina, CB-Dock | Binding affinity | ΔG < -5 kcal/mol |
| **7. Validation** | Experimental/literature | Literature, databases | Confirmed interactions | In vitro/in vivo evidence |

### Network Pharmacology Quality Assessment

| Assessment | Key Question | Required Evidence | Red Flag |
|-----------|-------------|-------------------|---------|
| **Target completeness** | Are ALL known targets included? | Multi-database cross-reference | Single database source |
| **PPI reliability** | Is the PPI network high-confidence? | STRING score > 0.7; experimental evidence | Low-confidence PPI (score < 0.4) |
| **Pathway relevance** | Are enriched pathways disease-relevant? | Literature validation; pathway hierarchy | Generic pathways (e.g., "signal transduction") |
| **Docking validity** | Is docking performed correctly? | Validated protocol; crystal structure; proper preparation | Homology model without validation |
| **Experimental validation** | Are key predictions validated? | In vitro/in vivo experiments | Computational-only conclusions |

**Rule**: Network pharmacology without experimental validation is HYPOTHESIS-GENERATING, not hypothesis-confirming. The field has a reproducibility problem — many published network pharmacology studies never progress beyond computational prediction.
**Rule**: STRING PPI confidence score MUST be > 0.7 for reliable networks. Scores < 0.4 are dominated by co-expression (which is NOT evidence of physical interaction).
**Rule**: GO/KEGG enrichment of drug targets is EXPECTED (any drug hits multiple pathways). Only pathways that are ALSO disease-relevant AND topologically central are meaningful.

---

## Systems Biology — Multi-Scale Modeling

### Systems Biology Modeling Framework

| Level | Model Type | Example | Input | Output | Tool |
|-------|-----------|---------|-------|--------|------|
| **Molecular** | ODE-based signaling | MAPK cascade | Kinetic parameters | Concentration dynamics | COPASI, BioNetGen |
| **Cellular** | Agent-based | Tumor-immune interaction | Cell rules | Population dynamics | PhysiCell, CompuCell3D |
| **Tissue** | PDE-based | Drug diffusion | Diffusion coefficients | Spatial concentration | FEBio, COMSOL |
| **Organ** | Physiological | PK/PD model | Dose, clearance | Drug concentration-time | NONMEM, Monolix |
| **Organism** | Multi-organ | Whole-body PBPK | Organ volumes, blood flow | Organ-level exposure | PK-Sim, Simcyp |
| **Population** | Epidemiological | SIR/SEIR | Contact rates, R0 | Epidemic trajectory | EpiModel, EMOD |

### Gene Regulatory Network (GRN) Inference

| Method | Data Type | Principle | Scalability | Accuracy | Tool |
|--------|----------|-----------|------------|---------|------|
| **GENIE3** | Expression | Random forest; gene-as-target | Moderate | High | GENIE3 R package |
| **GRNBoost2** | Expression | Gradient boosting; scalable | High | Moderate-High | arboreto |
| **SCENIC** | Single-cell expression | GRN + motif enrichment | Moderate | High | SCENIC/pySCENIC |
| **PIDC** | Single-cell expression | Partial information decomposition | High | Moderate | PIDC.jl |
| **BEELINE** | Benchmarking | Multiple methods | — | Benchmark framework | BEELINE |

### Pathway Analysis Methods

| Method | Type | Input | Output | Multiple Testing | Tool |
|--------|------|-------|--------|-----------------|------|
| **ORA** (Over-Representation Analysis) | Competitive | Gene list | Enriched pathways | Benjamini-Hochberg | clusterProfiler |
| **GSEA** (Gene Set Enrichment Analysis) | Competitive | Ranked gene list | Enriched pathways | FDR | fgsea, GSEA |
| **GSVA** (Gene Set Variation Analysis) | Competitive | Expression matrix | Sample-level pathway scores | — | GSVA |
| **SSGSEA** | Competitive | Expression matrix | Sample-level scores | — | GSVA |
| **PROGENy** | Competitive | Expression | Pathway activity scores | — | PROGENy |
| **DECOLOR** | Self-contained | Expression + pathway | Differential pathway activity | — | DECOLOR |

**Rule**: ORA is the SIMPLEST but LEAST powerful pathway method. It ignores gene expression magnitude and only considers membership. GSEA is preferred because it uses the full ranked list.
**Rule**: GSEA requires a MINIMUM of 7 samples per group. With fewer samples, use GSVA/SSGSEA for sample-level scoring.
**Rule**: Pathway databases (KEGG, Reactome, GO) have SIGNIFICANT overlap. Adjust for pathway dependency using competitive testing or hierarchical correction.

---

## Protein-Protein Interaction (PPI) Analysis

### PPI Database Comparison

| Database | Coverage | Evidence Type | Quality | URL |
|----------|----------|--------------|---------|-----|
| **STRING** | Comprehensive (all organisms) | Experimental + predicted; scored | High (with score filtering) | string-db.org |
| **BioGRID** | Curated experimental | Physical + genetic | High (curated) | thebiogrid.org |
| **IntAct** | Curated experimental | Physical interactions | High (IMEx) | ebi.ac.uk/intact |
| **DIP** | Curated experimental | Physical interactions | Moderate | dip.doe-mbi.ucla.edu |
| **HPRD** | Human-only curated | Physical interactions | Moderate (not updated) | hprd.org |
| **HuRI** | Human interactome | Yeast two-hybrid; systematic | High (systematic) | interactome-atlas.org |
| **Open Targets** | Drug-target-disease | Multi-source | High | opentargets.org |

### PPI Network Analysis Protocol

| Step | Method | Metric | Interpretation |
|------|--------|--------|---------------|
| **1. Network construction** | Database query + threshold | Nodes, edges | Network size |
| **2. Degree centrality** | # connections per node | Degree distribution | Hub identification |
| **3. Betweenness centrality** | Fraction of shortest paths | Bottleneck identification | Critical nodes |
| **4. Closeness centrality** | Average shortest path length | Network accessibility | Central vs peripheral |
| **5. Clustering coefficient** | Triangle density | Local connectivity | Modular structure |
| **6. Community detection** | Louvain, Leiden, MCL | Modules/communities | Functional modules |
| **7. Network robustness** | Node removal simulation | Connectivity after removal | Vulnerability |
| **8. Drug-target mapping** | Overlay drug targets | Target positions | Drug action topology |

### PPI Assessment for Drug Discovery

| Assessment | Key Question | Required Evidence | Red Flag |
|-----------|-------------|-------------------|---------|
| **Interaction confidence** | Is the PPI experimentally verified? | Co-IP, Y2H, FRET, BiFC | Only computational prediction |
| **Binding affinity** | How strong is the interaction? | KD < 1 μM (strong); 1-100 μM (moderate) | No affinity data |
| **Interface druggability** | Can the PPI be disrupted by a drug? | Hot spot residues; pocket analysis | Flat/large interface (hard to drug) |
| **Disease relevance** | Is the PPI disease-relevant? | Genetic evidence; functional studies | Only network topology evidence |

**Rule**: PPIs from STRING with confidence < 0.4 are PREDICTED, not verified. For drug discovery, use ONLY experimentally verified PPIs (IntAct, BioGRID) or high-confidence STRING (score > 0.7).
**Rule**: Hub genes in PPI networks are NOT necessarily good drug targets. Essential hubs (e.g., TP53) are UNDRUGGABLE because disrupting them causes toxicity. Target BOTTLENECK genes instead — they connect modules and may be more selectively druggable.
**Rule**: PPI interfaces are among the HARDEST drug targets (large, flat surfaces). Only ~2% of FDA-approved drugs target PPIs. Consider allosteric modulators or PROTACs instead.

---

## Gene Enrichment & Functional Analysis

### GO/KEGG Enrichment Analysis Protocol

| Step | Method | Tool | Key Parameter | Common Error |
|------|--------|------|--------------|-------------|
| **1. Gene list preparation** | Background definition | — | ALL tested genes as background | Using genome as background (inflates significance) |
| **2. Enrichment test** | Fisher's exact / hypergeometric | clusterProfiler | — | Wrong background set |
| **3. Multiple testing** | Benjamini-Hochberg FDR | clusterProfiler | FDR < 0.05 | No correction (inflated hits) |
| **4. Redundancy reduction** | Semantic similarity | simplify() in clusterProfiler | Similarity threshold 0.7 | Reporting 100+ redundant GO terms |
| **5. Visualization** | Dot plot, cnetplot, enrichMap | enrichplot | — | Unreadable plots with 50+ terms |
| **6. Interpretation** | Biological context | Literature | — | Over-interpreting generic terms |

### Enrichment Analysis Assessment

| Assessment | Key Question | Required Evidence | Red Flag |
|-----------|-------------|-------------------|---------|
| **Background correctness** | Is the background set appropriate? | All tested genes, not whole genome | Using all human genes as background for RNA-seq |
| **Statistical rigor** | Is FDR correction applied? | BH-adjusted p < 0.05 | Nominal p-value only |
| **Biological relevance** | Are enriched terms disease-relevant? | Literature support | Generic terms (e.g., "binding", "cellular process") |
| **Redundancy** | Are redundant terms simplified? | Semantic similarity clustering | 50+ GO terms reported |
| **Direction** | Is up/down regulation considered? | Separate enrichment for up/down | Combined gene list (direction lost) |

**Rule**: The BACKGROUND SET for enrichment analysis must be ALL GENES TESTED in the experiment, NOT all genes in the genome. Using the genome as background inflates significance because many genome genes were never tested.
**Rule**: GO term "binding" or "cellular process" enrichments are UNINFORMATIVE. These are generic terms that apply to most gene sets. Focus on SPECIFIC biological process terms.
**Rule**: ALWAYS perform separate enrichment for UP-regulated and DOWN-regulated genes. Combining them cancels out opposing pathway effects.

---

## Multi-Omics Disease Characterization

### Disease Characterization Pipeline

| Step | Data Type | Method | Output | Integration Point |
|------|----------|--------|--------|-------------------|
| **1. Genomic landscape** | WGS/WES | Mutational signatures, driver identification | SBS/ID signatures, driver genes | Mutation → expression |
| **2. Transcriptomic subtypes** | RNA-seq | ConsensusClustering, NMF | Molecular subtypes | Subtype → epigenome |
| **3. Epigenomic regulation** | ATAC-seq, ChIP-seq | Peak calling, motif analysis | Regulatory elements | Regulation → expression |
| **4. Proteomic validation** | Proteomics | DIA/PRM quantification | Protein-level confirmation | mRNA → protein correlation |
| **5. Metabolomic readout** | Metabolomics | LC-MS/GC-MS | Metabolic pathway activity | Enzyme → metabolite |
| **6. Clinical correlation** | EHR data | Survival, response, phenotype | Clinical subtypes | Molecular → clinical |
| **7. Integrated model** | Multi-omics | MOFA+, iCluster, SNF | Integrated subtypes | Cross-omics patterns |

### Disease Subtype Discovery Methods

| Method | Principle | Input | Output | Strength | Limitation |
|--------|-----------|-------|--------|----------|-----------|
| **ConsensusClustering** | Repeated subsampling | Expression matrix | Optimal k | Robustness assessment | Sensitive to distance metric |
| **NMF** (Non-negative Matrix Factorization) | Parts-based decomposition | Non-negative matrix | Metagenes + coefficients | Interpretable factors | Requires non-negative data |
| **iCluster** | Joint latent variable | Multi-omics | Integrated clusters | Multi-omics integration | Computationally intensive |
| **SNF** (Similarity Network Fusion) | Network fusion | Multi-omics similarity | Fused network + clusters | Handles heterogeneous data | Parameter sensitive |
| **MOFA+** | Multi-omics factor analysis | Multi-omics | Latent factors | Interpretable factors | Linear model assumption |
| **Cobolt** | VAE-based | Multi-omics (including single-cell) | Latent embedding | Non-linear; single-cell | Requires large sample size |

**Rule**: Disease subtypes from transcriptomics alone may NOT be biologically distinct. Validate with at least one additional omics layer (genomics, epigenomics, or proteomics).
**Rule**: Molecular subtypes must have CLINICAL RELEVANCE (different prognosis, treatment response, or both) to be actionable. A subtype with no clinical difference is an academic exercise.
**Rule**: The optimal number of subtypes (k) should be determined by MULTIPLE criteria (silhouette, gap statistic, clinical relevance), not just the elbow method.

---

## Drug Combination Prediction

### Synergy Scoring Methods

| Method | Formula/Model | Range | Synergy Threshold | When to Use |
|--------|--------------|-------|-------------------|-------------|
| **Bliss Independence** | E = Ea + Eb - Ea×Eb | -1 to 1 | > 0 | Independent action assumption |
| **Loewe Additivity** | E = (da/Da) + (db/Db) | -1 to 1 | > 0 | Same target/mechanism |
| **ZIP** | Zero Interaction Potency | -1 to 1 | > 10 | General purpose; most robust |
| **HSA** (Highest Single Agent) | E = max(Ea, Eb) | -1 to 1 | > 0 | Conservative; simple |
| **Delta Score** | D = observed - expected (Bliss) | Continuous | > 10 | NCI ALMANAC standard |
| **SynergyFinder** | Multi-model comparison | Model-dependent | Model-dependent | Compare multiple models |

### Drug Combination Prediction Pipeline

| Step | Method | Tool | Key Decision | Common Error |
|------|--------|------|-------------|-------------|
| **1. Target network** | PPI + pathway mapping | STRING, KEGG | Complementary vs redundant targets | Same-pathway drugs (likely antagonistic) |
| **2. Synergy prediction** | ML models | DeepSynergy, AuDNNsynergy, DrugComb | Model selection | Not comparing multiple models |
| **3. Dose matrix design** | Checkerboard | 5×5 or 6×6 dose matrix | Concentration range | Too narrow range (miss synergy) |
| **4. Synergy scoring** | Multi-model | SynergyFinder 3.0 | ZIP or Bliss as primary | Using only one model |
| **5. Mechanistic validation** | Pathway analysis | Phosphoproteomics, RNA-seq | Confirm complementary mechanism | No mechanistic validation |
| **6. Safety assessment** | Toxicity prediction | pkCSM, Tox21 | Additive toxicity check | Ignoring combination toxicity |

### AI-Based Drug Combination Models

| Model | Architecture | Training Data | Input Features | Performance | Limitation |
|-------|-------------|---------------|----------------|-------------|-----------|
| **DeepSynergy** | Deep neural network | DrugComb (730K+ combinations) | Drug fingerprints + cell line features | AUC ~0.90 | Cell line-specific |
| **AuDNNsynergy** | Autoencoder + DNN | NCI ALMANAC | Drug + gene expression | AUC ~0.85 | Limited to trained cell lines |
| **TranSynergy** | Transformer | DrugComb | SMILES + gene features | AUC ~0.88 | Requires large training set |
| **GraphSynergy** | GNN | DrugComb | Graph drug representation | AUC ~0.87 | Novel drug generalization |
| **PRODeep** | DNN + protein features | DrugComb | Drug + protein features | AUC ~0.86 | Protein feature quality |

**Rule**: Drug synergy is DOSE-DEPENDENT. A combination that is synergistic at one dose may be antagonistic at another. Always test a dose matrix, not a single dose combination.
**Rule**: Bliss Independence and Loewe Additivity can give OPPOSITE conclusions for the same data. Report BOTH models and explain discrepancies.
**Rule**: AI-predicted drug combinations are HYPOTHESES, not prescriptions. They require experimental validation before any clinical consideration.

---

## Network-Based Drug Repurposing

### Network Proximity Method

| Step | Method | Tool | Output | Key Metric |
|------|--------|------|--------|-----------|
| **1. Disease module** | Seed genes → network expansion | STRING, NetworkX | Disease subnetwork | Module size; density |
| **2. Drug module** | Drug targets → first neighbors | DrugBank, ChEMBL | Drug subnetwork | Target coverage |
| **3. Network proximity** | Shortest path; separation | Custom | Z-scored proximity | Z < -1.5 = close proximity |
| **4. Network propagation** | Random walk with restart | RWR, Diffusion | Propagation scores | Score at disease genes |
| **5. Prioritization** | Proximity + propagation rank | Custom | Ranked repurposing list | Top 10 candidates |

### Network Medicine Principles

| Principle | Description | Application | Example |
|-----------|------------|-------------|---------|
| **Disease module hypothesis** | Disease genes cluster in network neighborhoods | Identify disease modules from GWAS | Autoimmune genes cluster in IL signaling |
| **Local hypothesis** | Drugs targeting proteins in disease module are more effective | Prioritize drugs by network proximity | Metformin → diabetes module (close) |
| **Network proximity** | Closer drug-disease network distance → higher efficacy | Drug repurposing ranking | Proximity of statins to Alzheimer module |
| **Network parsimony** | Multi-target drugs are more effective for complex diseases | Prefer polypharmacology for complex disease | Network pharmacology of TCM |
| **Edgetic perturbation** | Different mutations in same gene → different network effects | Precision medicine by mutation type | TP53 missense vs truncation |

**Rule**: Network proximity between drug targets and disease genes is a CORRELATION, not causation. Close proximity suggests repurposing potential but requires experimental validation.
**Rule**: Disease modules from GWAS are often INCOMPLETE. Complement with expression data, pathway databases, and literature curation.
**Rule**: Network-based repurposing works best for COMPLEX DISEASES with polygenic architecture. For monogenic diseases, direct target-based approaches are more appropriate.

---

## Multi-Omics Integration Methods

### Integration Strategy Selection

| Strategy | When to Use | Methods | Strength | Limitation |
|----------|------------|---------|----------|-----------|
| **Early integration** | Similar data types; same scale | Concatenation → PCA/UMAP | Simple; preserves raw features | Scale mismatch; feature explosion |
| **Intermediate integration** | Multi-omics with shared structure | MOFA+, iCluster, MCIA | Latent factors; interpretable | Linear assumptions |
| **Late integration** | Heterogeneous data; different scales | Ensemble of single-omics models | Flexible; handles heterogeneity | No cross-omics patterns |
| **Graph-based** | Network-structured data | Graph fusion, SNF | Preserves topology | Parameter sensitive |
| **Deep learning** | Large sample size; non-linear | VAE, multi-modal transformer | Non-linear; scalable | Needs large N; black box |

### Multi-Omics Quality Control

| Omics | QC Metric | Acceptable | Common Failure |
|-------|-----------|-----------|---------------|
| **Genomics** | Coverage > 30×; >95% capture | ✅ | Low coverage; batch effects |
| **Transcriptomics** | RIN > 7; >20M reads; <5% rRNA | ✅ | Degraded RNA; low depth |
| **Proteomics** | >5000 proteins; <20% missing | ✅ | Low identification rate |
| **Metabolomics** | >500 metabolites; QC-CV < 30% | ✅ | High technical variance |
| **Epigenomics** | FRiP > 0.01 (ATAC); >10M reads | ✅ | Low signal-to-noise |
| **Cross-omics** | Sample matching; batch correction | ✅ | Unmatched samples across omics |

### Batch Effect Correction for Multi-Omics

| Method | Principle | When to Use | Risk |
|--------|-----------|-------------|------|
| **ComBat** | Empirical Bayes | Known batch structure | Over-correction (removing biology) |
| **limma removeBatchEffect** | Linear model | Known batch; continuous covariates | Assumes additive effect |
| **MNN** (Mutual Nearest Neighbors) | Cell-level matching | Single-cell; unknown batch | Computationally intensive |
| **Harmony** | Iterative clustering | Single-cell; complex batch | May merge distinct populations |
| **scVI** | VAE-based | Single-cell; large datasets | Needs GPU; tuning required |

**Rule**: Batch effect correction MUST be performed BEFORE multi-omics integration. Batch effects in one omics layer can create spurious cross-omics correlations.
**Rule**: NEVER apply batch correction that removes the biological variable of interest. Always verify that known biological signals are preserved after correction.
**Rule**: Multi-omics integration requires MATCHED SAMPLES. Integrating unmatched samples across omics layers introduces confounding.

---

## Network Pharmacology & Systems Biology Quality Checklist

| Item | Required | Common Failure |
|------|----------|---------------|
| Multi-database target identification (≥2 databases) | ✅ | Single database source |
| PPI confidence score threshold > 0.7 (STRING) | ✅ | Including low-confidence PPIs |
| Appropriate background set for enrichment | ✅ | Using genome as background |
| FDR correction for enrichment analysis | ✅ | Nominal p-value only |
| Separate up/down-regulation enrichment | ✅ | Combined gene list |
| Redundancy reduction for GO terms | ✅ | 50+ redundant terms reported |
| Experimental validation of key predictions | ✅ | Computational-only conclusions |
| Drug-target binding verified (docking or literature) | ✅ | Network topology alone |
| Synergy assessed with multiple models (Bliss + Loewe) | ✅ | Single model only |
| Dose matrix for combination studies | ✅ | Single dose combination |
| Batch effect correction before integration | ✅ | No batch correction |
| Sample matching across omics layers | ✅ | Unmatched samples |
| Disease subtype clinical relevance validated | ✅ | No clinical correlation |
| Network proximity validated with known drugs | ✅ | No positive control |
| Pathway results disease-relevant (not generic) | ✅ | Generic GO terms only |
| PK/PD feasibility for repurposing candidates | ✅ | No dosing consideration |
