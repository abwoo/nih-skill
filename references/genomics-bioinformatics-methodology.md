# Genomics & Bioinformatics Methodology Authority Framework

## Reference Index

| ID | Paper | Year | PMID | Domain | Authority Level |
|----|-------|------|------|--------|----------------|
| GEN-01 | Jumper et al. — AlphaFold2: Highly Accurate Protein Structure Prediction | 2021 | 34265844 | Protein Structure | ★★★★★ Landmark |
| GEN-02 | Stuart et al. — Scanpy: Single-Cell Analysis in Python | 2019 | 29409406 | Single-Cell | ★★★★★ Foundational |
| GEN-03 | Hao et al. — Seurat v5: Integration of Multi-Modal Single-Cell Data | 2024 | — | Single-Cell | ★★★★★ Foundational |
| GEN-04 | Võsa et al. — GWAS Catalog: Curated Summary Statistics | 2021 | 33125629 | GWAS | ★★★★★ Foundational |
| GEN-05 | Love et al. — DESeq2: RNA-Seq Differential Expression | 2014 | 25516281 | RNA-seq | ★★★★★ Foundational |
| GEN-06 | Abramson et al. — AlphaFold3: Accurate Structure Prediction for All Biomolecules | 2024 | 38728558 | Protein Structure | ★★★★★ Landmark |
| GEN-07 | Watson et al. — RFdiffusion: De Novo Protein Design | 2023 | 38077560 | Protein Design | ★★★★★ Landmark |
| GEN-08 | Stokes et al. — AI-Antibiotic Discovery (Halicin) | 2020 | 31913273 | AI Drug Discovery | ★★★★★ Landmark |
| GEN-09 | Poplin et al. — DeepVariant: Universal SNP/Indel Caller | 2018 | 30247488 | Variant Calling | ★★★★★ Foundational |
| GEN-10 | The ENCODE Project — Encyclopedia of DNA Elements | 2020 | 33128621 | Functional Genomics | ★★★★★ Foundational |

---

## GEN-01: AlphaFold2 — Protein Structure Prediction

### Citation
Jumper J, Evans R, Pritzel A, et al. Highly Accurate Protein Structure Prediction Using Deep Learning. Nature. 2021;596(7873):583-589. PMID: 34265844

### Methodology Decomposition

**Core Idea**: A deep learning system that predicts 3D protein structures from amino acid sequences with atomic accuracy, using an attention-based architecture and evolutionary information.

**Architecture**:
```
Input: Amino Acid Sequence + MSA (Multiple Sequence Alignment)
  ↓
[1] Input Embeddings
    → Target sequence: one-hot + positional encoding
    → MSA: row-wise + column-wise attention
    → Pair representation: 2D features (distance, orientation priors)
  ↓
[2] Evoformer (48 blocks)
    → MSA track: attention across sequences and positions
    → Pair track: triangular attention (captures 3D geometry)
    → Communication: MSA → Pair (extract co-evolution signals)
    → Communication: Pair → MSA (inject structural constraints)
  ↓
[3] Structure Module (8 iterations)
    → Invariant point attention (IPA): 3D-aware attention
    → Backbone frame update: SE(3)-equivariant transformation
    → Side chain placement: chi angle prediction
  ↓
[4] Output
    → 3D coordinates for all atoms
    → Per-residue confidence (pLDDT): 0-100 scale
    → Predicted aligned error (PAE) matrix
```

**AlphaFold2 Confidence Interpretation**:

| pLDDT Range | Confidence | Structural Interpretation | Action |
|-------------|-----------|--------------------------|--------|
| **90-100** | Very high | Well-ordered, likely correct | Use directly |
| **70-90** | High | Generally correct backbone, side chains may vary | Use backbone confidently |
| **50-70** | Low | Possibly incorrect fold | Verify with experimental data |
| **0-50** | Very low | Likely disordered or unstructured | Do NOT use for structural analysis |

**AlphaFold2 Limitations**:

| Limitation | Description | Impact | Mitigation |
|-----------|-------------|--------|-----------|
| **No dynamics** | Predicts static structure, not conformational ensemble | Misses allosteric states, induced fit | Use AF2 for initial model; MD for dynamics |
| **MSA dependency** | Requires deep MSA for accuracy | Orphan proteins with few homologs get low confidence | Use AF2-multimer, templates, or protein language models |
| **No ligands** | Predicts apo structure only | Misses ligand-induced conformational changes | AF3 addresses this; use docking on AF2 structure |
| **Protein complexes** | AF2 monomer cannot predict complexes | Misses quaternary structure | Use AF2-multimer or AF3 |
| **Intrinsically disordered regions** | Low pLDDT regions are disordered | Cannot predict IDP conformations | Use dedicated IDP predictors |
| **Novel folds** | May hallucinate plausible but incorrect structures | False confidence in novel folds | Check PAE matrix; verify with experimental data |

**Rule**: AlphaFold2 predictions with pLDDT <70 should NOT be used for drug design or detailed mechanistic analysis. Require experimental validation.
**Rule**: Always check the PAE (Predicted Aligned Error) matrix, not just pLDDT. Low pLDDT with high PAE between domains suggests incorrect domain orientation.
**Rule**: AF2 is NOT a replacement for experimental structure determination. It is a HYPOTHESIS GENERATOR that must be validated.

---

## GEN-02/03: Single-Cell Analysis (Scanpy/Seurat)

### Standard Single-Cell RNA-seq Pipeline

```
Raw FASTQ Files
  ↓
[1] Quality Control & Alignment
    → Cell Ranger (10x Genomics): standard pipeline
    → OR: STARsolo / kallisto-bustools (faster alternatives)
    → Output: gene × cell count matrix
  ↓
[2] Quality Filtering
    → Min genes per cell: 200 (remove empty droplets)
    → Max genes per cell: 5000-8000 (remove doublets)
    → Mitochondrial %: <20% (remove dying cells)
    → Doublet detection: Scrublet / DoubletFinder
    → ⚠️ Thresholds are dataset-dependent — visualize distributions first
  ↓
[3] Normalization
    → Library size normalization: counts per cell → 10K
    → Log1p transformation: log(1 + x)
    → OR: SCTransform (Seurat v5): variance-stabilizing transformation
    → ⚠️ Normalization choice affects ALL downstream results
  ↓
[4] Feature Selection
    → Highly variable genes (HVGs): top 2000-5000
    → Methods: Seurat (vst), Scanpy (seurat_v3)
    → ⚠️ HVG selection determines what biological signal is captured
  ↓
[5] Dimensionality Reduction
    → PCA: 50 components (standard)
    → OR: scVI / scANVI (deep generative, better for batch correction)
    → ⚠️ PCA on HVGs only; do NOT use all genes
  ↓
[6] Batch Correction / Integration
    → Harmony: fast, scalable, good for large datasets
    → Scanorama: good for complex batch structures
    → scVI: deep generative, best for subtle biological signals
    → Seurat v5 integration: RPCA / CCA / reciprocal
    → ⚠️ Over-integration removes biological signal; under-integration leaves batch effects
    → ⚠️ ALWAYS check: do known biological differences survive integration?
  ↓
[7] Clustering
    → Graph-based: Leiden (preferred) or Louvain
    → Resolution parameter: controls cluster granularity
    → ⚠️ Resolution is ARBITRARY — try multiple values
    → ⚠️ Clusters ≠ cell types — require annotation
  ↓
[8] Cell Type Annotation
    → Manual: marker gene expression per cluster
    → Automated: CellTypist, scType, Azimuth (reference-based)
    → ⚠️ Automated annotation requires validation
    → ⚠️ Novel cell types will be MISCLASSIFIED by reference-based methods
  ↓
[9] Downstream Analysis
    → Differential expression: rank genes per cluster
    → Trajectory analysis: Monocle3, PAGA, scVelo (RNA velocity)
    → Cell-cell communication: CellChat, LIANA
    → Gene regulatory networks: SCENIC, Dictys
```

### Single-Cell Analysis Pitfalls

| Pitfall | Description | Consequence | Mitigation |
|---------|-------------|-------------|-----------|
| **Batch effect confounded with biology** | Different conditions processed in different batches | Cannot distinguish biological from technical variation | Balanced experimental design; integration with batch-aware methods |
| **Over-clustering** | Too many clusters for the data resolution | Spurious cell types; over-interpretation | Use resolution sweep; validate with marker genes |
| **Doublet contamination** | Two cells in one droplet | Artificial "intermediate" cell types | Scrublet/DoubletFinder; remove doublets |
| **Ambient RNA** | Free-floating RNA from lysed cells contaminating droplets | False expression signals | SoupX / CellBender for ambient RNA removal |
| **Dying cell artifacts** | High mitochondrial % from dying cells | Inflammatory stress signatures | Filter by mitochondrial %; use dying cell markers |
| **Reference bias in annotation** | Reference atlas missing novel cell types | Novel cells forced into known categories | Always validate automated annotations manually |
| **Pseudotime ≠ real time** | Trajectory inference shows ordering, not dynamics | Over-interpretation of pseudotime as developmental time | RNA velocity for directionality; lineage tracing for validation |

**Rule**: Single-cell papers that do not report batch correction method and quality metrics are INCOMPLETE. Flag: "⚠️ No batch correction reported — results may reflect technical rather than biological variation."
**Rule**: Cell type annotation MUST be validated with known marker genes. Automated annotation alone is INSUFFICIENT.
**Rule**: Differential expression in single-cell data requires pseudobulk aggregation or mixed models — NOT simple Wilcoxon tests on individual cells (inflated p-values due to non-independence).

### Multi-Modal Single-Cell Integration

| Modality | Technology | Information | Integration Method |
|----------|-----------|-------------|-------------------|
| **RNA + Protein (CITE-seq)** | 10x + antibody tags | Gene expression + surface proteins | Seurat WNN, totalVI |
| **RNA + ATAC (10x Multiome)** | Joint profiling | Gene expression + chromatin accessibility | ArchR, Signac, MultiVI |
| **RNA + Spatial** | MERFISH, Visium, Slide-seq | Gene expression + spatial location | Squidpy, SpatialDE, tangram |
| **RNA + TCR/BCR** | 10x VDJ | Gene expression + immune repertoire | Scirpy, dandelion |

**Rule**: Multi-modal single-cell papers MUST demonstrate that integration improves over single-modality analysis. If RNA+ATAC ≈ RNA-only, the ATAC data adds no value.

---

## GEN-04: GWAS — Genome-Wide Association Studies

### Standard GWAS Pipeline

```
Genotype Data (PLINK format: .bed/.bim/.fam)
  ↓
[1] Quality Control
    → Sample QC: call rate >95%, heterozygosity check, sex check
    → Variant QC: call rate >95%, HWE p>1e-6, MAF >1%
    → Relatedness: remove one from each pair with PI_HAT >0.2
    → Population stratification: PCA → identify ancestry outliers
    → ⚠️ QC thresholds are study-dependent; visualize distributions
  ↓
[2] Imputation
    → Pre-phasing: SHAPEIT4 / Eagle2
    → Imputation: Minimac4 / IMPUTE5
    → Reference panels: TOPMed, HRC, 1000G (in order of preference)
    → Post-imputation QC: INFO score >0.8, MAF >1%
    → ⚠️ Imputation quality varies by ancestry — non-European panels may be less accurate
  ↓
[3] Association Testing
    → Linear regression (quantitative trait): PLINK2 / REGENIE / BOLT-LMM
    → Logistic regression (binary trait): PLINK2 / SAIGE
    → Covariates: age, sex, top 10-20 PCs, study-specific covariates
    → Mixed models for related individuals: BOLT-LMM / SAIGE / REGENIE
    → ⚠️ SAIGE is preferred for binary traits with case-control imbalance
  ↓
[4] Multiple Testing Correction
    → Genome-wide significance: p < 5×10⁻⁸ (Bonferroni for ~1M independent tests)
    → Suggestive significance: p < 1×10⁻⁵
    → ⚠️ 5×10⁻⁸ threshold was derived for European populations — may be too lenient for diverse ancestries
  ↓
[5] Post-GWAS Analysis
    → Fine-mapping: SuSiE / FINEMAP (identify causal variants)
    → Gene-based tests: MAGMA / VEGAS2
    → Pathway enrichment: GSEA / DEPICT
    → Polygenic risk scores: PRS-CS / LDpred2
    → Mendelian randomization: TwoSampleMR / MR-Base
    → Colocalization: COLOC / eCAVIAR (GWAS + eQTL overlap)
  ↓
[6] Cross-Ancestry Analysis
    → Meta-analysis across ancestries: METAL / MR-MEGA
    → Trans-ancestry fine-mapping: PAINTOR
    → ⚠️ Most GWAS are European-only — this is a MAJOR equity concern
    → ⚠️ PRS from European GWAS lose 2-5x accuracy in non-European populations
```

### GWAS Critical Assessment Protocol

| Assessment | Key Question | Required Evidence | Red Flag |
|-----------|-------------|-------------------|---------|
| **Sample size** | Is the sample size sufficient for the expected effect sizes? | Power calculation; N >50K for common variants | N <10K for common variant GWAS |
| **Population stratification** | Is population structure adequately controlled? | QQ plot (λGC ≈ 1.0); LDSC intercept; PC adjustment | λGC >1.1; residual inflation after PC adjustment |
| **Replication** | Are top hits replicated in independent cohort? | Replication p <0.05 with same direction | No replication attempted |
| **Ancestry diversity** | Is the study limited to European populations? | Ancestry composition; cross-ancestry analysis | >90% European with no cross-ancestry validation |
| **Phenotype definition** | Is the phenotype well-defined and reproducible? | ICD code validation; PheWAS consistency | Vague phenotype; ICD-only without validation |
| **Effect size interpretation** | Are effect sizes clinically meaningful? | Odds ratio per allele; population attributable fraction | OR <1.1 per allele claimed as "important" |

**Rule**: GWAS papers that do not report ancestry composition and population stratification metrics are INCOMPLETE.
**Rule**: A GWAS hit is NOT a causal variant. Fine-mapping and functional validation are required to establish causality.
**Rule**: PRS from European-only GWAS should NOT be applied to non-European populations without explicit validation and calibration.

---

## GEN-05: DESeq2 — RNA-seq Differential Expression

### Citation
Love MI, Huber W, Anders S. Moderated Estimation of Fold Change and Dispersion for RNA-seq Data with DESeq2. Genome Biol. 2014;15(12):550. PMID: 25516281

### Standard RNA-seq Pipeline

```
Raw FASTQ Files
  ↓
[1] Quality Control
    → FastQC: per-base quality, adapter content, GC distribution
    → MultiQC: aggregate QC across samples
    → Trimming: Trim Galore / fastp (adapter removal, quality trimming)
  ↓
[2] Alignment
    → STAR: splice-aware aligner (standard for RNA-seq)
    → OR: HISAT2 (faster, lower memory)
    → OR: Salmon / kallisto (pseudoalignment, faster, transcript-level)
    → ⚠️ Alignment vs pseudoalignment: similar results for gene-level; pseudoalignment preferred for speed
  ↓
[3] Quantification
    → FeatureCounts: gene-level counts from aligned BAM
    → OR: Salmon quant: transcript-level from pseudoalignment
    → OR: tximport: aggregate transcript to gene level
    → ⚠️ Gene-level vs transcript-level: most DE analysis uses gene-level
  ↓
[4] Differential Expression (DESeq2)
    → Input: raw count matrix (NOT normalized)
    → Model: negative binomial GLM with shrinkage estimators
    → Normalization: size factors (median-of-ratios method)
    → Dispersion estimation: gene-wise → fitted → shrunk (moderation)
    → Wald test for significance
    → LFC shrinkage: apeglm (recommended) or ashr
    → Output: log2 fold change, p-value, adjusted p-value (BH)
  ↓
[5] Multiple Testing Correction
    → Benjamini-Hochberg (BH) FDR: padj < 0.05 (standard)
    → ⚠️ FDR <0.05 with |log2FC| >1 is a common threshold but arbitrary
    → ⚠️ For large sample sizes, many genes may be "significant" with tiny effect sizes
  ↓
[6] Downstream Analysis
    → Gene set enrichment: clusterProfiler / GSEA
    → Pathway analysis: Reactome / KEGG
    → Visualization: volcano plot, heatmap, PCA
```

### RNA-seq Pitfalls

| Pitfall | Description | Consequence | Mitigation |
|---------|-------------|-------------|-----------|
| **Batch effects** | Different processing dates, reagents, operators | Spurious DE genes | Include batch in DESeq2 design; ComBat-seq |
| **Low replication** | <3 biological replicates per condition | Low power, unreliable DE | Minimum 3 replicates; 5+ preferred |
| **Technical vs biological replicates** | Multiple libraries from same sample | Pseudoreplication → inflated significance | Use biological replicates only |
| **Gene length bias** | Longer genes accumulate more reads | Apparent DE driven by gene length | DESeq2 normalizes for library size, not gene length; use TPM for cross-gene comparison |
| **Multi-mapping reads** | Reads mapping to multiple genes (paralogs) | Ambiguous quantification | Use unique mapping or RSEM for proportional assignment |
| **Normalization method** | Different methods give different results | Inconsistent DE gene lists | DESeq2: use raw counts + size factors; NEVER use FPKM/TPM as DESeq2 input |

**Rule**: RNA-seq DE analysis MUST use raw counts as input to DESeq2/edgeR. FPKM/TPM-normalized values are for visualization only, NOT for statistical testing.
**Rule**: <3 biological replicates per condition is INSUFFICIENT for reliable differential expression. Flag: "⚠️ Insufficient replication — DE results may not be reproducible."
**Rule**: Batch effects are the #1 confounder in RNA-seq. Always check PCA for batch clustering before and after correction.

---

## GEN-07: RFdiffusion — De Novo Protein Design

### Citation
Watson JL, Juergens D, Bennett NR, et al. De Novo Design of Protein Structure and Function with RFdiffusion. Nature. 2023;620(7976):1089-1100. PMID: 38077560

### Methodology Decomposition

**Core Idea**: A diffusion model built on RoseTTAFold2 that generates protein structures from scratch, enabling design of novel enzymes, binders, and symmetric assemblies.

**Architecture**:
```
Input: Noise + Conditioning (partial structure, motif, symmetry)
  ↓
RFdiffusion (RoseTTAFold2 backbone + diffusion)
  → 3-track network: MSA / pair / structure
  → Denoising: iterative structure refinement
  → Conditioning: inpaint known motifs, scaffold around active sites
  ↓
Output: Designed protein backbone structure
  ↓
Sequence Design: ProteinMPNN (inverse folding)
  → Backbone → optimal amino acid sequence
  ↓
Validation: AlphaFold2 self-consistency check
  → Designed sequence → AF2 prediction → compare to design
  → pAE <5 and backbone RMSD <2Å = high confidence design
```

**Protein Design Assessment Protocol**:

| Assessment | Key Question | Required Evidence | Red Flag |
|-----------|-------------|-------------------|---------|
| **In silico validation** | Does AF2 predict the designed structure? | pAE <5; RMSD <2Å between design and AF2 prediction | No AF2 self-consistency check |
| **Experimental validation** | Was the designed protein expressed and characterized? | Expression yield, CD spectra, SEC, functional assay | In silico only — no wet lab validation |
| **Design novelty** | Is the design truly novel or similar to existing proteins? | Fold classification; TM-score to PDB | TM-score >0.5 to existing structure |
| **Functional specificity** | Does the design perform the intended function? | Binding assay (Kd), enzymatic assay (kcat/KM) | Only structural characterization, no function |
| **Stability** | Is the designed protein stable? | Tm from DSF/CD; aggregation from SEC | No stability data |
| **Activity-stability tradeoff** | Does functional design compromise stability? | Compare Tm of functional vs non-functional designs | Activity without stability assessment |

**Rule**: Protein design papers without experimental validation are HYPOTHESES, not results. In silico design + AF2 check = promising but UNPROVEN.
**Rule**: AF2 self-consistency (design → sequence → AF2 → RMSD check) is the MINIMUM validation for computational protein design. Without it, the design may not be foldable.
**Rule**: The activity-stability tradeoff is the CENTRAL CHALLENGE in enzyme design. Active sites are often destabilizing — a designed enzyme that is active but unstable is not practically useful.

---

## GEN-08: AI Drug Discovery

### AI Drug Discovery Pipeline

```
Target Identification
  → GWAS / multi-omics → disease-associated genes
  → Knowledge graph → drug-target interactions
  → LLM literature mining → novel target hypotheses
  ↓
Hit Discovery (Virtual Screening)
  → Structure-based: molecular docking (AutoDock Vina, Glide)
  → Ligand-based: similarity search, pharmacophore matching
  → AI-based: graph neural networks (GNN), diffusion models
  → ⚠️ Hit rate from virtual screening: typically 0.1-5%
  → ⚠️ Claims >10% hit rate need strong justification
  ↓
Lead Optimization
  → Molecular property prediction: ADMET (absorption, distribution, metabolism, excretion, toxicity)
  → Generative chemistry: design molecules with desired properties
  → Multi-objective optimization: potency + selectivity + ADMET + synthesizability
  → ⚠️ AI-designed molecules must be SYNTHESIZABLE — check retrosynthesis
  ↓
Preclinical Validation
  → In vitro: binding assays, cell-based assays
  → In vivo: animal models (efficacy, safety, PK/PD)
  → ⚠️ AI drug discovery papers that skip preclinical validation are INCOMPLETE
  ↓
Clinical Translation
  → Phase I/II/III trials
  → ⚠️ Insilico Medicine's Rentosertib (Phase IIa) is the FIRST AI-designed drug to reach Phase II
```

### AI Drug Discovery Assessment Protocol

| Assessment | Key Question | Required Evidence | Red Flag |
|-----------|-------------|-------------------|---------|
| **Target validation** | Is the AI-identified target causally linked to disease? | Genetic evidence (GWAS, CRISPR); functional validation | Target from AI prediction only |
| **Virtual screening hit rate** | Is the hit rate plausible? | Experimental validation of top hits; dose-response curves | Hit rate >10% without explanation |
| **Molecule novelty** | Are AI-designed molecules truly novel? | Tanimoto similarity to known drugs; patent search | High similarity to existing drugs |
| **Synthesizability** | Can the AI-designed molecules be synthesized? | Retrosynthesis analysis; actual synthesis attempt | No synthesizability assessment |
| **ADMET prediction** | Are drug-like properties predicted? | QED, Lipinski's rule of 5, predicted solubility/permeability | Only potency optimization |
| **Experimental validation** | Are computational predictions validated experimentally? | IC50/Kd, cell viability, animal efficacy | Computational only |
| **Clinical progress** | Has any AI-designed molecule reached clinical trials? | Clinical trial registration; published results | Claiming "clinical potential" without any preclinical data |

**Rule**: AI drug discovery papers without experimental validation are SPECULATIVE. Computational predictions MUST be validated with at least in vitro assays.
**Rule**: Virtual screening hit rates >10% are SUSPECT. The typical range is 0.1-5%. Higher rates may indicate trivial predictions or biased validation.
**Rule**: Synthesizability is a CRITICAL and often overlooked constraint. AI-generated molecules that cannot be synthesized are useless regardless of predicted properties.
**Rule**: Insilico Medicine's Rentosertib (TNIK inhibitor for idiopathic pulmonary fibrosis) is the ONLY AI-designed drug to reach Phase II as of 2025. Claims of "AI-designed drugs in clinical use" should be verified.

---

## GEN-09: DeepVariant — AI Variant Calling

### Citation
Poplin R, Chang PC, Alexander D, et al. A Universal SNP and Small-Indel Variant Caller Using Deep Neural Networks. Nat Biotechnol. 2018;36(10):983-987. PMID: 30247488

### Methodology Decomposition

**Core Idea**: Reformulate variant calling as an image classification problem — pileup images from aligned reads are classified by a CNN as reference/heterozygous/homozygous-alt.

**Pipeline**:
```
Aligned BAM/CRAM
  ↓
[1] Pileup Image Generation
    → For each candidate position: extract reads in window
    → Encode as multi-channel image:
       - Read base (A/C/G/T/N)
       - Base quality
       - Mapping quality
       - Strand direction
       - Read position
    → 6 channels × 100 reads × 221 positions
  ↓
[2] CNN Classification (Inception-v3)
    → Input: pileup image
    → Output: P(ref), P(het), P(hom-alt)
    → Trained on Genome in a Bottle (GIAB) truth sets
  ↓
[3] Variant Calling
    → Apply classification threshold
    → Output: VCF with genotype and quality scores
```

**DeepVariant vs Traditional Variant Callers**:

| Caller | Method | Strength | Weakness | Best For |
|--------|--------|----------|----------|----------|
| **DeepVariant** | CNN on pileup images | Universal (WGS, WES, RNA-seq); high accuracy | Slow; GPU recommended | General-purpose; best accuracy |
| **GATK HaplotypeCaller** | Bayesian + local assembly | Industry standard; well-validated | Requires extensive parameter tuning | Clinical WGS/WES |
| **Strelka2** | Bayesian + k-mer | Fast; good for somatic | Less accurate for indels | Somatic variant calling |
| **FreeBayes** | Bayesian | Simple; haplotype-based | Lower accuracy than DV/GATK | Quick exploration |

**Rule**: For clinical-grade variant calling, DeepVariant or GATK HaplotypeCaller are the standard. Other callers may be used for research but require validation.
**Rule**: DeepVariant requires GPU for practical runtime. On CPU, it is 10-100x slower than GATK.

---

## Genomics & Bioinformatics Automatic Thinking Protocol

When analyzing ANY genomics/bioinformatics paper, automatically apply this reasoning chain:

```
1. DATA LEVEL
   → What omics data type? (WGS / WES / RNA-seq / scRNA-seq / ATAC-seq / proteomics)
   → What species/organism?
   → Sample size and statistical power?
   → Multi-ancestry or single population?
   → Public or proprietary data?

2. METHOD LEVEL
   → Established pipeline or novel method?
   → If novel: comparison against established baseline?
   → Reproducibility: code + data available?
   → Computational requirements: feasible for typical lab?

3. STATISTICAL LEVEL
   → Multiple testing correction appropriate?
   → Effect sizes reported (not just p-values)?
   → Confounders controlled (batch, population structure)?
   → Validation: internal (cross-validation) and external (independent cohort)?

4. BIOLOGICAL LEVEL
   → Do results make biological sense?
   → Consistency with known biology?
   → Functional validation (in vitro / in vivo)?
   → Causal inference or just association?

5. CLINICAL LEVEL (if applicable)
   → Clinical significance of findings?
   → Actionability of genetic variants?
   → Population applicability (ancestry diversity)?
   → Comparison with existing clinical tests?

6. ETHICAL LEVEL
   → Ancestry representation and equity?
   → Genetic privacy considerations?
   → Incidental findings policy?
   → Return of results to participants?
```

---

## Genomics Method Matching Matrix

| User Task | Recommended Method | Key Reference | Dataset/Tool | Difficulty |
|-----------|-------------------|---------------|-------------|------------|
| Protein structure prediction | AlphaFold2 / ColabFold | GEN-01 | AF2 DB, ColabFold | ★★☆☆☆ |
| Protein complex prediction | AlphaFold3 / AF2-multimer | GEN-06 | AF3 server | ★★★☆☆ |
| De novo protein design | RFdiffusion + ProteinMPNN | GEN-07 | RFdiffusion GitHub | ★★★★☆ |
| Single-cell clustering | Scanpy / Seurat v5 | GEN-02, GEN-03 | 10x datasets | ★★★☆☆ |
| Multi-omic integration | Seurat WNN / totalVI / MultiVI | GEN-03 | 10x Multiome | ★★★★☆ |
| GWAS | PLINK2 + SAIGE + REGENIE | GEN-04 | UK Biobank, GWAS Catalog | ★★★★☆ |
| Polygenic risk scores | PRS-CS / LDpred2 | GEN-04 | GWAS summary stats | ★★★☆☆ |
| RNA-seq DE analysis | DESeq2 / edgeR | GEN-05 | GEO, SRA | ★★☆☆☆ |
| Variant calling | DeepVariant / GATK | GEN-09 | GIAB, 1000G | ★★★☆☆ |
| AI virtual screening | GNN + docking + ADMET | GEN-08 | ChEMBL, ZINC | ★★★★☆ |
| Spatial transcriptomics | Squidpy / SpatialDE | GEN-03 | Visium, MERFISH | ★★★★☆ |
| Trajectory inference | Monocle3 / scVelo | GEN-02 | scRNA-seq | ★★★☆☆ |

---

## Emerging Directions in Genomics & AI (2024-2026)

| Direction | Frontier Stage | Key Papers/Trends | Momentum |
|-----------|---------------|-------------------|----------|
| **Protein language models** | Frontier | ESM-3, ProGen2, ProtGPT2 | 🔥🔥🔥🔥🔥 |
| **AI enzyme design** | Frontier | RFdiffusion2, de novo active site design | 🔥🔥🔥🔥🔥 |
| **Spatial multi-omics** | Emerging | MERFISH + proteomics, Visium HD | 🔥🔥🔥🔥 |
| **Single-cell foundation models** | Emerging | scGPT, Geneformer, scBERT | 🔥🔥🔥🔥 |
| **Multi-ancestry GWAS** | Frontier | All of Us, GBMI, MEGA | 🔥🔥🔥🔥 |
| **AI-guided gene therapy** | Pre-frontier | CRISPR guide design, AAV optimization | 🔥🔥🔥🔥 |
| **Long-read sequencing analysis** | Emerging | PacBio HiFi, ONT + AI basecalling | 🔥🔥🔥 |
| **Pangenome analysis** | Emerging | Human Pangenome Reference + graph genomes | 🔥🔥🔥 |
| **AI for epigenomics** | Pre-frontier | Chromatin accessibility, histone modification | 🔥🔥 |
| **Generative molecular design** | Frontier | Diffusion models for drug design, 3D molecule generation | 🔥🔥🔥🔥🔥 |
| **AI clinical trial design** | Pre-frontier | Synthetic control arms, adaptive design | 🔥🔥🔥 |
| **Multi-omics + clinical data integration** | Emerging | UK Biobank multi-omics, All of Us | 🔥🔥🔥🔥 |

---

## Spatial Transcriptomics Methodology

### Technology Comparison

| Platform | Resolution | Genes/Spot | Tissue | Key Feature | Cost |
|----------|-----------|-----------|--------|-------------|------|
| **10x Visium** | 55μm spots | Whole transcriptome | FFPE, Fresh-frozen | Most widely used; good for discovery | $$$ |
| **10x Visium HD** | 2μm bins | Whole transcriptome | FFPE, Fresh-frozen | Near single-cell resolution | $$$$ |
| **MERFISH** | Subcellular | 100-10,000 genes | Fresh-frozen | High multiplexing; protein co-detection | $$$$ |
| **Slide-seq V2** | 10μm | Whole transcriptome | Fresh-frozen | High spatial resolution | $$$ |
| **CODEX/PhenoCycler** | Subcellular | 40-100 proteins | FFPE | Protein-level spatial; clinical samples | $$$ |
| **Xenium (10x)** | Subcellular | 100-5,000 genes | FFPE, Fresh-frozen | Integrated platform; easy workflow | $$$$ |
| **CosMx (NanoString)** | Subcellular | 1,000+ genes | FFPE | Clinical FFPE compatible | $$$$ |

### Spatial Transcriptomics Analysis Pipeline

```
Raw Data (images + expression matrices)
  ↓
[1] Quality Control
    → Filtering: min genes per spot, min spots per gene
    → Mitochondrial %: <20% (similar to scRNA-seq)
    → Spatial artifact detection: edge effects, tissue tears
    → ⚠️ Spots outside tissue must be removed
  ↓
[2] Normalization
    → Library size normalization (same as scRNA-seq)
    → Log1p transformation
    → ⚠️ Spatial autocorrelation must be considered
    → SCTransform (Seurat v5): variance-stabilizing; recommended
  ↓
[3] Spatial Feature Engineering
    → Spatially Variable Genes (SVG): Moran's I, SPARK-X
    → Spatial domains: BayesSpace, SpaGCN, STAGATE
    → Cell-type deconvolution: Cell2location, RCTD, Tangram
    → ⚠️ Visium spots contain 5-20 cells — deconvolution is REQUIRED
  ↓
[4] Spatial Clustering
    → Graph-based: Louvain/Leiden on spatial neighbors
    → Bayesian: BayesSpace (Markov random field)
    → GNN-based: SpaGCN, STAGATE
    → ⚠️ Spatial clustering should respect tissue boundaries
  ↓
[5] Cell-Cell Communication
    → Ligand-receptor analysis: CellChat, NicheNet, COMMOT
    → Spatial proximity constraints
    → ⚠️ L-R databases are INCOMPLETE — negative results don't mean no communication
  ↓
[6] Integration with scRNA-seq
    → Deconvolution: Cell2location, Tangram, RCTD
    → Label transfer: Seurat v5 transfer anchors
    → ⚠️ Integration quality depends on reference atlas quality
```

**Rule**: Spatial transcriptomics WITHOUT deconvolution for Visium data is INCOMPLETE — each spot contains multiple cells.
**Rule**: Spatial autocorrelation (Moran's I) is the spatial equivalent of differential expression. Report SVGs alongside DEGs.

---

## Long-Read Sequencing Methodology

### Platform Comparison

| Feature | PacBio HiFi | Oxford Nanopore (ONT) | Illumina Short-Read |
|---------|-------------|----------------------|-------------------|
| **Read length** | 10-25 kb | 1-100+ kb | 150-300 bp |
| **Accuracy** | >99.9% (Q30+) | 95-99% (Q13-Q20); R10.4.1 ~Q20 | >99.9% (Q30+) |
| **Throughput** | 30-50 Gb/SMRT cell | 50-100+ Gb/PromethION | 300-600 Gb/run |
| **Cost/Gb** | $$$ | $$ | $ |
| **Key advantage** | Long + accurate reads | Ultra-long reads; portable; direct RNA | Highest accuracy; cheapest |
| **Key limitation** | Lower throughput; DNA damage artifacts | Higher error rate; homopolymer issues | Cannot resolve repeats/structural variants |

### Long-Read Analysis Pipeline

```
Raw Long Reads (FASTQ / POD5)
  ↓
[1] Basecalling (ONT only — PacBio produces HiFi reads directly)
    → Guppy (ONT): standard basecaller
    → Dorado (ONT): newer; ONT + modified base detection
    → Bonito (ONT): alternative; higher accuracy but slower
    → ⚠️ Basecalling model version affects results — document version
  ↓
[2] Quality Control
    → NanoPlot: read length distribution, quality scores
    → NanoStat: summary statistics
    → PycoQC: run-level quality metrics
    → ⚠️ ONT quality varies by run; check per-run QC
  ↓
[3] Alignment
    → Minimap2: standard long-read aligner (PacBio + ONT)
    → pbmm2: PacBio-specific wrapper around minimap2
    → ⚠️ Use appropriate preset: -x map-hifi (PacBio) or -x map-ont (ONT)
  ↓
[4] Variant Calling
    → SNVs/Indels: DeepVariant (PacBio HiFi), Clair3 (ONT), PEPPER-Margin-DeepVariant (ONT)
    → Structural Variants: Sniffles2, cuteSV, SVIM
    → ⚠️ SV calling requires MINIMUM 10x coverage; 20-30x recommended
    → ⚠️ Long-read SV callers have HIGH false positive rate — filter with quality scores
  ↓
[5] Methylation Detection (ONT direct)
    → Dorado / Guppy: 5mC and 6mA calling from signal
    → modkit: methylation processing and filtering
    → Nanopolish: alternative methylation caller
    → ⚠️ Direct RNA methylation: lower accuracy than DNA methylation
```

**Rule**: Long-read sequencing is ESSENTIAL for structural variant detection. Short-read sequencing misses 50-80% of SVs >50bp.
**Rule**: PacBio HiFi is the gold standard for long-read variant calling (near short-read accuracy). ONT excels at ultra-long reads and direct methylation detection.

---

## Multi-Omics Integration Methodology

### Integration Strategies

| Strategy | Method | Tools | When to Use | Limitation |
|----------|--------|-------|-------------|-----------|
| **Concatenation** | Simple feature merging | — | Same samples, same features | Ignores modality-specific structure |
| **Multi-omics factor analysis (MOFA)** | Bayesian factor model | MOFA+ | Different modalities, same samples | Linear; may miss nonlinear relationships |
| **Canonical correlation analysis (CCA)** | Find correlated components | Seurat v5 (multi-modal) | scRNA-seq + scATAC-seq | Linear; sensitive to noise |
| **Weighted nearest neighbor (WNN)** | Modality-weighted neighbors | Seurat v5 | Multi-modal single-cell | Requires same cells across modalities |
| **Graph-based integration** | Graph neural networks | MOGONET, SpaGCN | Multi-omics with complex relationships | Requires careful hyperparameter tuning |
| **Contrastive learning** | Learn shared embeddings | CLIP-style, MOLI | Cross-modal alignment | Requires large paired datasets |
| **Bayesian integration** | Probabilistic modeling | MultiVI, totalVI | scRNA + scATAC + protein | Model misspecification risk |

### Multi-Omics Integration Decision Tree

```
Multi-Omics Integration Task
│
├─ Same cells, multiple modalities (e.g., CITE-seq, 10x Multiome)
│   └─ Seurat v5 WNN or totalVI
│       → Best for: joint clustering, cell type annotation
│       → Not for: cross-study integration
│
├─ Same samples, different platforms (e.g., WGS + RNA-seq + proteomics)
│   └─ MOFA+ or DIABLO (mixOmics)
│       → Best for: discovering shared factors, biomarker panels
│       → Not for: single-cell resolution
│
├─ Different samples, same condition (e.g., bulk + spatial + scRNA)
│   └─ Reference mapping: Cell2location, Tangram, UniCell
│       → Best for: deconvolution, spatial mapping
│       → Not for: direct statistical integration
│
└─ Cross-species or cross-cohort
    └─ Harmonization: Harmony, scVI, LIGER
        → Best for: batch correction, cross-study comparison
        → Not for: causal inference
```

**Rule**: Multi-omics integration WITHOUT understanding each modality independently is DANGEROUS — artifacts in one modality can propagate to the integrated analysis.
**Rule**: Always analyze each omics layer SEPARATELY before integration. If results differ between individual and integrated analyses, investigate why.

---

## CRISPR & AI-Guided Gene Editing

### AI for CRISPR Guide Design

| Tool | Purpose | Input | Output | Key Feature |
|------|---------|-------|--------|-------------|
| **CRISPR-GPT** | Automated guide design | Gene target, cell type, experiment type | Guide sequences, off-target predictions | LLM-based; full experimental design |
| **DeepCRISPR** | On/off-target prediction | Guide + PAM sequence | On-target score, off-target sites | Deep learning; considers epigenomics |
| **CRISPRscan** | Guide efficiency scoring | 30mer guide sequence | Efficiency score (0-1) | Simple; widely used |
| **GuideScan2** | Genome-wide guide enumeration | Reference genome | All possible guides with scores | Comprehensive; multi-species |
| **CRISPRoff** | Off-target prediction | Guide sequence | Off-target sites + scores | Deep learning; considers chromatin |
| **BE-Hive** | Base editing outcome prediction | Target site + editor type | Editing outcomes + frequencies | Predicts byproducts |

### CRISPR Screening Analysis Pipeline

```
CRISPR Screen (Pooled)
  ↓
[1] Read Processing
    → MAGeCK count: extract guide counts from FASTQ
    → PinAPL-Py: alternative; cloud-based
    → ⚠️ Check library representation: >95% guides detected
  ↓
[2] Normalization
    → Median ratio normalization (MAGeCK)
    → TMM normalization (edgeR-based)
    → ⚠️ Low-count guides should be filtered (<30 reads)
  ↓
[3] Differential Abundance Testing
    → MAGeCK test: robust rank aggregation (RRA)
    → CRISPRcleanR: removes copy number bias
    → JACKS: Bayesian; accounts for guide efficiency
    → ⚠️ Copy number bias: amplified regions show false positives — MUST correct
  ↓
[4] Gene-Level Scoring
    → Aggregate guide-level to gene-level (RRA, STARS, RIGER)
    → ⚠️ Minimum 3-5 guides per gene for reliable scoring
  ↓
[5] Pathway Analysis
    → GSEA on gene scores
    → STRING network analysis
    → ⚠️ Screen hits ≠ validated targets — follow-up experiments required
```

**Rule**: CRISPR screen results WITHOUT copy number correction are UNRELIABLE for cancer cell lines (amplified regions dominate).
**Rule**: Positive selection screens (drug resistance) are easier to analyze than negative selection screens (essential genes). Negative screens require careful normalization.

### CRISPR AI Assessment Protocol

| Assessment | Key Question | Required Evidence | Red Flag |
|-----------|-------------|-------------------|---------|
| **Guide design** | Are guides optimized for on-target efficiency and off-target specificity? | On-target score + off-target prediction | No off-target analysis |
| **Delivery method** | Is the delivery method appropriate for the cell type? | Transfection efficiency data | Assumed delivery without validation |
| **Editing verification** | Is editing efficiency measured? | T7E1 assay, Sanger sequencing, NGS amplicon | No editing verification |
| **Off-target assessment** | Are off-target effects evaluated? | GUIDE-seq, CIRCLE-seq, or in silico prediction | No off-target assessment |
| **Phenotype validation** | Is the phenotype specifically due to the target gene? | Rescue experiment; multiple guides; conditional knockout | Single guide; no rescue |
| **Clinical safety** | For therapeutic applications, is the safety profile acceptable? | Biodistribution; immunogenicity; long-term follow-up | No safety data for clinical claims |

---

## Epigenomics & Chromatin Accessibility

### Single-Cell ATAC-seq Methodology

| Platform | Resolution | Cells | Key Feature | Best For |
|----------|-----------|-------|-------------|---------|
| **10x Chromium scATAC** | Single-cell | 5K-20K | Most widely used; good for discovery | General chromatin accessibility |
| **sci-ATAC-seq3** | Single-cell | 100K+ | Combinatorial indexing; ultra-high throughput | Large-scale atlas |
| **SNARE-seq2** | Single-cell | 5K-10K | Paired scRNA-seq + scATAC-seq | Multi-modal single-cell |
| **10x Multiome** | Single-cell | 5K-10K | Same cell: RNA + ATAC | Best for paired analysis |
| **CUT&Tag / CUT&RUN** | Bulk or low-input | Low input | Antibody-targeted; low background | Histone marks; TF binding |

### scATAC-seq Analysis Pipeline

```
Raw scATAC-seq Data (FASTQ)
  ↓
[1] Preprocessing
    → CellRanger-ATAC (10x): alignment, fragment file generation
    → OR: chromap: faster alternative; recommended for large datasets
    → ⚠️ Fragment file is the fundamental data structure for scATAC
  ↓
[2] Quality Control
    → TSS enrichment: >6 (good); <4 (poor)
    → Fraction of reads in peaks (FRiP): >0.3 (good); <0.2 (poor)
    → Nucleosome signal: <4 (good)
    → Duplicate rate: <50%
    → ⚠️ scATAC is SPARSER than scRNA-seq — most entries are zero (binary)
  ↓
[3] Feature Engineering
    → Peak calling: MACS2 on aggregated pseudo-bulk
    → OR: Gene activity scores: accessibility in gene body + promoter
    → OR: Latent semantic indexing (LSI): TF-IDF → SVD
    → ⚠️ Gene activity scores are NOISY — use for visualization, not quantification
  ↓
[4] Dimensionality Reduction & Clustering
    → LSI (equivalent of PCA for scATAC)
    → UMAP on LSI components
    → Leiden/Louvain clustering
    → ⚠️ First LSI component often correlates with sequencing depth — remove it
  ↓
[5] Cell Type Annotation
    → Gene activity score → label transfer from scRNA-seq reference
    → OR: chromVAR: motif deviation scores → TF activity per cell
    → ⚠️ scATAC annotation is HARDER than scRNA — use paired multiome when possible
  ↓
[6] Differential Accessibility
    → Logistic regression (for binary data): LR test on peak accessibility
    → OR: Wilcoxon rank-sum on gene activity scores
    → ⚠️ Do NOT use methods designed for scRNA-seq counts on scATAC binary data
```

**Rule**: scATAC-seq data is BINARY (accessible or not), not count-based. Methods designed for scRNA-seq (e.g., Seurat's FindMarkers with Wilcoxon) may not be appropriate for scATAC.
**Rule**: Gene activity scores from scATAC are NOISY approximations of gene expression. For quantitative gene expression, use paired scRNA-seq (10x Multiome or SNARE-seq2).

### Epigenomic Clock & DNA Methylation

| Application | Method | Input | Output | Key Tool |
|------------|--------|-------|--------|---------|
| **Epigenetic age** | Horvath clock, GrimAge | DNA methylation array | Biological age estimate | DNAmAge, pyAge |
| **Cancer detection** | Methylation signatures | cfDNA methylation | Cancer type + origin | Galleri (Grail) |
| **Cell type deconvolution** | Reference-based | Bulk methylation | Cell type proportions | EpiDISH, Houseman |
| **Imprinting disorders** | DMR analysis | Methylation array | Imprinting status | Minfi, conumee |

**Rule**: Epigenetic clocks are CORRELATIONAL, not causal. They estimate biological age but do not measure aging mechanism directly.
**Rule**: cfDNA methylation for cancer detection (e.g., Galleri) has high specificity (>99%) but moderate sensitivity (~40% for stage I). Performance varies by cancer type.

---

## Proteomics & Metabolomics

### Proteomics Platforms

| Platform | Method | Proteins Detected | Quantification | Throughput | Best For |
|----------|--------|------------------|---------------|-----------|---------|
| **LC-MS/MS (DDA)** | Data-dependent acquisition | 2K-8K | Semi-quantitative | Medium | Discovery proteomics |
| **LC-MS/MS (DIA)** | Data-independent acquisition | 5K-10K | Quantitative | Medium | Comprehensive quantification |
| **TMT multiplexed** | Tandem mass tags | 3K-6K | Relative quantification | High (16-plex) | Comparative studies |
| **Olink PEA** | Proximity extension assay | 1K-3K (targeted) | Relative (NPX) | Very high | Biomarker panels |
| **SomaScan** | Aptamer-based | 7K+ | Relative | Very high | Large-scale screening |
| **SWATH-MS** | DIA variant | 4K-6K | Quantitative | Medium | Reproducible quantification |

### Proteomics Analysis Pipeline

```
Raw Mass Spectrometry Data
  ↓
[1] Identification
    → Database search: MaxQuant, MSFragger, Proteome Discoverer
    → Spectral library: DIA-specific; build from DDA data
    → ⚠️ Database choice affects results — use species-specific + contaminants
  ↓
[2] Quantification
    → Label-free: MaxLFQ intensity
    → TMT: reporter ion intensities
    → DIA: extracted ion chromatograms
    → ⚠️ Missing values are COMMON (30-50%) — imputation strategy matters
  ↓
[3] Normalization
    → Total intensity normalization
    → Median normalization
    → Variance stabilization normalization (VSN)
    → ⚠️ Normalization method affects differential protein results
  ↓
[4] Differential Protein Analysis
    → limma: standard; robust; recommended
    → MSstats: designed for proteomics; handles complex designs
    → DEP: R package; integrates with TMT/label-free
    → ⚠️ Use moderated t-statistics (limma) — more stable with few replicates
  ↓
[5] Functional Analysis
    → GO enrichment, KEGG pathways
    → GSEA on ranked protein list
    → Protein-protein interaction: STRING, BioGRID
    → ⚠️ Proteomics has FEWER quantified features than RNA-seq — adjust expectations
```

### Metabolomics Platforms

| Platform | Method | Metabolites | Quantification | Best For |
|----------|--------|-----------|---------------|---------|
| **LC-MS (untargeted)** | Reversed-phase + HILIC | 500-2000 features | Semi-quantitative | Discovery |
| **GC-MS** | Gas chromatography | 200-500 | Quantitative | Volatile metabolites; fatty acids |
| **NMR** | 1H-NMR | 50-200 | Absolute quantification | Quantitative; reproducible |
| **Targeted LC-MS/MS** | MRM/PRM | 50-500 | Absolute quantification | Biomarker validation |

### Metabolomics Analysis Pipeline

```
Raw Metabolomics Data
  ↓
[1] Peak Detection & Alignment
    → XCMS: standard for LC-MS metabolomics
    → MZmine: alternative; GUI available
    → ⚠️ Peak picking parameters significantly affect results — optimize for your data
  ↓
[2] Annotation
    → Level 1: confirmed by authentic standard (GOLD standard)
    → Level 2: probable by MS/MS spectral match
    → Level 3: tentative by mass + database
    → Level 4: unknown feature
    → ⚠️ >70% of features in untargeted metabolomics are UNIDENTIFIED
    → Tools: HMDB, METLIN, GNPS, SIRIUS
  ↓
[3] Normalization
    → Total ion count (TIC)
    → Probabilistic quotient normalization (PQN)
    → Internal standards (BEST if available)
    → ⚠️ Batch effects are SEVERE in metabolomics — use QC samples
  ↓
[4] Statistical Analysis
    → Univariate: t-test / Wilcoxon (with FDR correction)
    → Multivariate: PCA (unsupervised), PLS-DA (supervised)
    → ⚠️ PLS-DA is PRONE to overfitting — always validate with permutation test
    → ⚠️ Report Q2 and permutation p-value for PLS-DA
  ↓
[5] Pathway Analysis
    → MetaboAnalyst: standard web tool
    → Mummichog: pathway annotation from untargeted data
    → ⚠️ Pathway databases are INCOMPLETE for metabolites — many pathways missing
```

**Rule**: Metabolomics annotation levels are CRITICAL. Only Level 1 (authentic standard) is reliable for clinical claims. Level 2-3 annotations are HYPOTHETICAL.
**Rule**: PLS-DA in metabolomics is OVERFITTING-PRONE. Always report permutation test results (≥200 permutations). If Q2 <0.5 or permutation p >0.05, the model is not valid.

## Spatial Multi-Omics & AI-CRISPR Agent Systems (2025-2026 Update)

### Spatial Multi-Omics Technologies

**Spatial-Mux-seq** (Nature Methods 2025 — Year Method selection):
- Simultaneously captures: chromatin accessibility + histone modifications + protein expression + transcriptome in single experiment
- Elevates spatial multi-omics analysis to new dimensionality
- Key challenge: data integration across 4+ modalities with different sparsity and noise profiles
- AI methods needed: multi-view representation learning, cross-modality imputation, spatially-aware clustering

**Deep-STARmap / Deep-spatial technologies**:
- Deep learning-enhanced spatial transcriptomics with improved resolution and gene coverage
- AI for: spot deconvolution, cell type annotation, spatial domain identification, ligand-receptor interaction inference

**Spatial Multi-Omics AI Assessment Protocol**:

| Assessment | Key Question | Required Evidence | Red Flag |
|-----------|-------------|-------------------|---------|
| **Multi-modality integration** | Are modalities integrated correctly? | Cross-modality consistency metrics | Treating modalities independently |
| **Spatial awareness** | Does method account for spatial structure? | Spatial autocorrelation metrics | Ignoring spatial coordinates |
| **Scalability** | Can it handle >1M cells × >4 modalities? | Computational benchmarks | Only tested on <100K cells |
| **Biological validation** | Are results biologically plausible? | Known marker gene concordance; experimental validation | No biological validation |
| **Missing modality handling** | How does it handle missing modalities? | Imputation accuracy on held-out data | Assuming complete data |

**Rule**: Spatial multi-omics papers MUST demonstrate that spatial information IMPROVES results over non-spatial methods. If spatial coordinates don't help, use standard single-cell methods.
**Rule**: Multi-modal integration is NOT just concatenation. Proper integration must account for modality-specific noise, sparsity, and scale differences.

### AlphaFold3 & Drug Design Updates (2025-2026)

**AlphaFold3 Capabilities (2024-2025)**:
- Predicts protein-ligand, protein-DNA, protein-RNA complexes (not just protein-protein)
- >200M protein structures predicted with >95% accuracy (2025 benchmark)
- Drug design applications: structure-based virtual screening, antibody engineering, variant effect prediction
- Key limitation: RNA structure prediction still L2 (not L5 like protein); metal-protein binding L1

**AI Drug Discovery Pipeline Maturity**:

| Stage | AI Method | Hit Rate | Validation Level | Key Risk |
|-------|----------|----------|-----------------|----------|
| Target identification | Network analysis; KG | N/A | CV-0 to CV-1 | Target not druggable |
| Virtual screening | AF3 + docking; ML scoring | 5-15% | CV-1 to CV-2 | Scoring function bias |
| De novo design | Generative models (diffusion, RL) | 5-20% | CV-1 | Synthesizability gap |
| ADMET prediction | GNN; Transformer | N/A | CV-1 to CV-2 | Distribution shift |
| Clinical trial design | RL; causal inference | N/A | CV-0 | Regulatory acceptance |

**FDA New Guidelines for AI-Based Drug Development (Dec 2025)**:
- FDA announced new guidelines specifically for AI-driven drug development
- Key requirement: AI-generated drug candidates must undergo SAME clinical validation as traditional candidates
- AI can accelerate DISCOVERY but cannot bypass VALIDATION
- PCCP pathway may apply to AI systems used in ongoing drug development

**Rule**: AlphaFold3 structure prediction is NOT experimental validation. Computational metrics (pLDDT, PAE) ≠ biochemical assay. Must verify: structure (crystal/Cryo-EM) + function (biochemical assay) + specificity + immunogenicity.
**Rule**: AI virtual screening hit rate of 5-15% is SEARCH EFFICIENCY improvement, not claim inflation. But hit → lead → drug still has <5% success rate.

### AI-CRISPR Agent Systems (2025-2026)

**Agentic AI for CRISPR Experiment Design**:
- AI agents that autonomously design CRISPR gene editing experiments
- Pipeline: target identification → guide RNA design → off-target prediction → delivery optimization → experimental validation
- Key milestone: AI-designed CRISPR experiments successfully validated in laboratory (2025)
- Innovation level: L2f (AI-Driven Experiment Automation) → L3 if experimentally validated

**Assessment Protocol for AI-CRISPR Papers**:

| Assessment | Key Question | Required Evidence | Red Flag |
|-----------|-------------|-------------------|---------|
| **Guide RNA design** | Is on-target efficiency predicted accurately? | Experimental validation of ≥20 guides | Only computational prediction |
| **Off-target assessment** | Are off-target sites comprehensively evaluated? | CHANGE-seq-BE or CIRCLE-seq (unbiased) | Only predicted-site-only assessment |
| **Delivery method** | Is delivery efficiency and specificity addressed? | In vivo delivery data | Ignoring delivery challenges |
| **Safety** | Are immunogenicity and long-term effects considered? | Immunogenicity assay; long-term follow-up | No safety assessment |
| **Autonomy level** | Is the AI truly autonomous or human-guided? | Clear description of human-AI interaction | Claiming "autonomous" with human checkpoints |
| **Generalizability** | Does it work across cell types / organisms? | Multi-cell-type validation | Single cell line only |

**Gene Editing Safety Levels**:
- GE-V0 (In Vitro): computational + cell culture → SPECULATIVE
- GE-V1 (Ex Vivo): edited cells returned to patient → early clinical
- GE-V2 (Animal): in vivo editing in animal models → preclinical
- GE-V3 (Phase I/II): human clinical trial → clinical validation
- GE-V4 (Approved): regulatory approval → clinical standard

**Rule**: AI-designed CRISPR experiments are at GE-V0 to GE-V1 (computational + early cell culture). Any claim of clinical readiness is INFLATED.
**Rule**: Base editing is SAFER than Cas9 but NOT safe by default. Off-target must use UNBIASED methods (CHANGE-seq-BE > CIRCLE-seq > predicted-site-only).
**Rule**: AI-CRISPR agent autonomy must be clearly specified. "AI-designed" ≠ "AI-autonomous." Most current systems are AI-assisted with human oversight.

---

## AI for Protein-Protein Interaction & Drug-Target Prediction

### PPI Prediction Methods

| Method | Input | Architecture | Accuracy | Best For |
|--------|-------|-------------|---------|---------|
| **AlphaFold-Multimer** | Protein sequences | Structure-based | High (for dimers) | Complex structure prediction |
| **ESM-2 + fine-tune** | Protein sequences | PLM + classifier | Moderate-High | Large-scale PPI screening |
| **D-SCRIPT** | Sequences | Language model + interaction | Moderate | Genome-wide PPI prediction |
| **STRING** | Multiple evidence | Database + scoring | Variable | Known + predicted PPIs |
| **DeepPPI** | Sequence features | CNN/MLP | Moderate | Binary PPI classification |

### Drug-Target Interaction (DTI) Prediction

| Method | Input | Architecture | Key Feature | Limitation |
|--------|-------|-------------|-------------|-----------|
| **DeepDTA** | SMILES + protein seq | CNN + CNN | End-to-end; no 3D needed | No structural information |
| **GraphDTA** | Molecular graph + protein seq | GNN + CNN | Graph representation of drug | Limited by GNN capacity |
| **MGraphDTA** | Molecular graph | Multi-scale GNN | Better molecular features | Still no 3D structure |
| **AlphaFold2 + docking** | 3D structures | Structure + physics | Physically grounded | Slow; needs good structures |
| **DiffDTI** | 3D structures | Diffusion model | Predicts binding pose | Computationally expensive |
| **K-BERT** | KG + BERT | Knowledge-enhanced LLM | Uses biomedical KG | KG quality dependent |

### DTI Assessment Protocol

```
Drug-Target Interaction Prediction
  ↓
[1] Data Split Strategy
    → Random split: easiest; overestimates performance
    → Cold-start (new drug): test on unseen drugs
    → Target-split (new target): test on unseen targets
    → ⚠️ Random split is NOT meaningful for DTI — real use involves NEW drugs/targets
    → ⚠️ Must report at least cold-start AND target-split performance
  ↓
[2] Negative Sample Handling
    → Random negatives: may include unknown positives (label noise)
    → Pairing strategy: match by molecular weight / protein length
    → ⚠️ Negative sample strategy is the #1 source of DTI performance variation
  ↓
[3] Evaluation Metrics
    → AUROC, AUPRC (AUPRC more informative for imbalanced data)
    → Top-K recall: of top K predictions, how many are true?
    → ⚠️ AUROC is MISLEADING for highly imbalanced DTI data — use AUPRC
  ↓
[4] Experimental Validation
    → In vitro binding assay (SPR, ITC)
    → Cell-based functional assay
    → ⚠️ Computational DTI predictions without experimental validation are HYPOTHETICAL
  ↓
[5] Clinical Relevance
    → Does predicted binding lead to functional effect?
    → Is the affinity in therapeutically relevant range?
    → ⚠️ Binding ≠ therapeutic effect. Many binders have no functional consequence.
```

**Rule**: DTI papers using only random split are NOT clinically meaningful. Real-world drug discovery involves NEW drugs and NEW targets — cold-start and target-split are required.
**Rule**: AUPRC is the correct metric for DTI evaluation, not AUROC. With 1:100 positive:negative ratio, AUROC can be >0.9 with a trivial model.

---

## Polygenic Risk Scores (PRS) — Comprehensive Methodology

### PRS Construction Pipeline

| Step | Method | Tool | Key Decision | Common Error |
|------|--------|------|-------------|-------------|
| **1. GWAS summary stats** | Quality control | munge_sumstats.py (PRSice) | Harmonize alleles; remove ambiguous SNPs | Strand flips; allele coding errors |
| **2. LD reference** | Match ancestry | 1000G, UKB, custom panel | MUST match target population ancestry | Using European LD for non-European target |
| **3. SNP selection & weighting** | Clumping + thresholding / Bayesian | PRSice, PRS-CS, LDpred2 | p-value threshold or prior | Overfitting to discovery sample |
| **4. PRS computation** | Weighted sum | PLINK, PRSice | Allele alignment | Misaligned alleles → wrong direction |
| **5. Validation** | Independent cohort | R, Python | Adjusted R²; AUC; NRI | Testing in discovery cohort (circular) |
| **6. Calibration** | Ancestry-matched | Custom | Decile-based risk stratification | Miscalibration across ancestries |

### PRS Methods Comparison

| Method | Principle | Advantages | Disadvantages | Best For |
|--------|-----------|-----------|---------------|---------|
| **P+T** (Clumping + Thresholding) | Prune LD; select by p-value | Simple; interpretable | Suboptimal; grid search overfitting | Initial exploration |
| **PRS-CS** | Bayesian shrinkage with continuous shrinkage prior | Automatic; no tuning; robust | Requires LD reference | General-purpose (recommended default) |
| **LDpred2** | Bayesian; LD-adjusted | Flexible; grid/auto modes | Sensitive to LD panel | Large GWAS (>100K) |
| **SBayesR** | Bayesian mixture prior | Handles large GWAS efficiently | Computationally intensive | Very large GWAS (>1M) |
| **PRS-CSx** | Multi-ancestry Bayesian | Cross-ancestry improvement | Requires multi-ancestry GWAS | Non-European populations |
| **CT-SLEB** | Cross-validation + stacking | Robust to heterogeneity | Complex pipeline | Heterogeneous cohorts |

### PRS Clinical Translation Assessment

| Assessment | Key Question | Required Evidence | Red Flag |
|-----------|-------------|-------------------|---------|
| **Discrimination** | Does PRS separate cases from controls? | AUC improvement over clinical factors alone | AUC improvement < 0.02 |
| **Calibration** | Does predicted risk match observed risk? | Calibration plot; Hosmer-Lemeshow | Poor calibration in minority groups |
| **Net reclassification** | Does PRS change clinical decisions? | NRI > 0; decision curve analysis | NRI not computed |
| **Ancestry portability** | Does PRS work across ancestries? | Multi-ancestry validation | European-only validation |
| **Clinical utility** | Does PRS-guided action improve outcomes? | RCT or prospective study | No outcome data |

**Rule**: PRS from European GWAS lose 2-5× predictive accuracy in non-European populations. ALWAYS report ancestry-specific performance. PRS-CSx is the current best method for cross-ancestry PRS.
**Rule**: A PRS with AUC improvement <0.02 over clinical risk factors alone has MINIMAL clinical utility, regardless of statistical significance.
**Rule**: PRS decile-based risk reporting is MORE CLINICALLY INTERPRETABLE than continuous scores. Top 5% decile risk is actionable; a 0.3 SD increase is not.

---

## ACMG Variant Classification — Clinical Interpretation Framework

### ACMG/AMP Classification Criteria

| Category | Criteria | Type | Description |
|----------|----------|------|-------------|
| **Population data** | BA1 | Stand-alone Benign | Allele frequency >5% in gnomAD |
| **Population data** | BS1 | Benign Strong | Allele frequency greater than expected for disorder |
| **Population data** | PM2 | Pathogenic Moderate | Absent from controls (gnomAD) |
| **Computational** | BP4 | Benign Supporting | Multiple lines of computational evidence suggest no impact |
| **Computational** | PP3 | Pathogenic Supporting | Multiple lines of computational evidence support deleterious effect |
| **Functional** | BS3 | Benign Strong | Well-established functional studies show no damaging effect |
| **Functional** | PS3 | Pathogenic Strong | Well-established functional studies show damaging effect |
| **Segregation** | BS4 | Benign Strong | Lack of segregation in family members |
| **Segregation** | PP1 | Pathogenic Supporting | Co-segregation with disease in family |
| **De novo** | PS2 | Pathogenic Strong | De novo in patient with confirmed paternity/maternity |
| **De novo** | PM6 | Pathogenic Moderate | Assumed de novo (paternity/maternity not confirmed) |
| **Allelic data** | BP2 | Benign Supporting | Observed in trans with pathogenic variant for dominant disorder |
| **Allelic data** | PM3 | Pathogenic Moderate | Detected in trans with pathogenic variant for recessive disorder |
| **Other database** | BP5 | Benign Supporting | Found with alternate molecular basis for disease |
| **Other database** | BP6 | Benign Strong | Reputable source reports benign but evidence not available |
| **Other database** | PP5 | Pathogenic Supporting | Reputable source reports pathogenic but evidence not available |
| **Domain/Hotspot** | PM1 | Pathogenic Moderate | Located in mutational hotspot or critical functional domain |
| **Protein change** | BP1 | Benign Supporting | Missense where only truncating cause disease |
| **Protein change** | BP3 | Benign Supporting | In-frame in repeat region without known function |
| **Protein change** | PM4 | Pathogenic Moderate | Protein length change due to in-frame indel/stop-loss |
| **Protein change** | PM5 | Pathogenic Moderate | Novel missense at same position as known pathogenic missense |
| **Protein change** | PP2 | Pathogenic Supporting | Missense in gene with low rate of benign missense |
| **LOF mechanism** | PVS1 | Pathogenic Very Strong | Null variant in gene where LOF is known mechanism |
| **LOF mechanism** | BP7 | Benign Supporting | Synonymous with no splice impact predicted |

### ACMG Classification Combinations

| Classification | Required Combination |
|---------------|---------------------|
| **Pathogenic** | 1 Very Strong + ≥1 Strong; OR ≥2 Strong; OR 1 Strong + ≥3 Moderate; OR 1 Strong + 2 Moderate + ≥2 Supporting; OR ≥2 Moderate + ≥4 Supporting |
| **Likely Pathogenic** | 1 Very Strong + 1 Moderate; OR 1 Strong + 1-2 Moderate; OR 1 Strong + ≥2 Supporting; OR ≥3 Moderate; OR 2 Moderate + ≥2 Supporting; OR 1 Moderate + ≥4 Supporting |
| **VUS** | Does not meet Benign or Pathogenic criteria |
| **Likely Benign** | 1 Strong Benign + 1 Supporting Benign; OR ≥2 Supporting Benign |
| **Benign** | 1 Stand-alone (BA1); OR ≥2 Strong Benign |

### Cancer-Specific ACMG Adaptations (AMP/ASCO/CAP 2017)

| Tier | Evidence Level | Clinical Action |
|------|---------------|----------------|
| **Tier I** | Strong clinical significance (FDA-approved, guideline) | Direct treatment decision |
| **Tier II** | Potential clinical significance (clinical trial, off-label) | Consider for treatment |
| **Tier III** | Unknown clinical significance | Research; no clinical action |
| **Tier IV** | Benign or likely benign | No clinical action |

**Rule**: VUS (Variant of Uncertain Significance) should NEVER be used for clinical decision-making. A VUS is NOT "probably pathogenic" — it means insufficient evidence exists.
**Rule**: PVS1 (null variant) should be applied ONLY when LOF is a KNOWN disease mechanism. ~20% of genes have LOF as a mechanism. Applying PVS1 to genes where LOF is not established is a common error.
**Rule**: ACMG classification is NOT deterministic — different labs can classify the same variant differently. Inter-laboratory concordance for VUS is only ~60-70%.

---

## GWAS Fine-Mapping — Causal Variant Identification

### Fine-Mapping Pipeline

| Step | Method | Tool | Input | Output |
|------|--------|------|-------|--------|
| **1. Locus definition** | ±500kb from lead SNP | — | GWAS summary stats | Locus boundaries |
| **2. LD computation** | Population-matched reference | PLINK, LDstore2 | Reference panel | LD matrix |
| **3. Statistical fine-mapping** | Bayesian | SuSiE, FINEMAP, CAVIAR | Summary stats + LD | Credible sets |
| **4. Functional annotation** | eQTL, chromatin, conservation | VEP, RegulomeDB, Open Targets | Credible set SNPs | Functional evidence |
| **5. Causal inference** | Colocalization | COLOC, eCAVIAR, SMR | GWAS + eQTL | Causal gene assignment |
| **6. Cross-ancestry refinement** | Multi-ancestry LD | PAINTOR, MR-MEGA | Multi-ancestry GWAS | Refined credible set |

### Fine-Mapping Methods Comparison

| Method | Model | Key Feature | Credible Set Size | Computational Cost |
|--------|-------|------------|-------------------|-------------------|
| **SuSiE** | Sum of single effects | Scalable; handles multiple signals | Moderate | Low |
| **FINEMAP** | Bayesian shotgun stochastic search | Exhaustive search; Bayes factors | Small (best) | High (for >5 causal) |
| **CAVIAR** | Causal Variants Identification | Accounts for uncertainty | Large | Moderate |
| **PAINTOR** | Functional annotation-informed | Integrates functional data | Smaller with annotations | Moderate |
| **SuSiE-RSS** | SuSiE with summary stats | Works without individual data | Moderate | Low |

### Fine-Mapping Quality Assessment

| Assessment | Key Question | Required Evidence | Red Flag |
|-----------|-------------|-------------------|---------|
| **LD accuracy** | Is the LD reference matched to GWAS population? | Same ancestry; similar allele frequencies | Using 1000G EUR for non-European GWAS |
| **Credible set coverage** | Is 95% credible set truly 95%? | Calibration across loci | Coverage << 95% |
| **Multiple signals** | Are secondary signals accounted for? | Conditional analysis; GCTA-COJO | Only lead SNP fine-mapped |
| **Functional validation** | Do fine-mapped SNPs have functional evidence? | eQTL, MPRA, CRISPR screens | No functional data for credible set |
| **Cross-ancestry consistency** | Same causal variant across ancestries? | Multi-ancestry fine-mapping | European-only fine-mapping |

**Rule**: A GWAS locus without fine-mapping has UNKNOWN causal variant(s). The lead SNP is often NOT the causal variant — it's just the most significant tag SNP.
**Rule**: 95% credible sets from European-only fine-mapping typically contain 10-50 variants. Cross-ancestry fine-mapping can reduce this to 1-5 variants by leveraging different LD patterns.
**Rule**: COLOC (colocalization) assumes a SINGLE causal variant per locus. If there are multiple causal variants (one for GWAS, one for eQTL), COLOC will give misleading results. Use eCAVIAR or SuSiE-coloc instead.

---

## Structural Variant & CNV Analysis

### SV/CNV Detection Methods

| Method | Platform | SV Type | Size Range | Resolution | Key Tool |
|--------|----------|---------|-----------|-----------|---------|
| **Read-depth** | WGS/WES | CNV (del/dup) | >1kb | Low | CNVkit, XHMM, CODEX |
| **Split-read** | WGS | All SV types | >50bp | High | Manta, DELLY, LUMPY |
| **Read-pair** | WGS | Insertion, deletion, inversion | >100bp | Moderate | Manta, DELLY |
| **Assembly-based** | Long-read WGS | Complex SV | >50bp | Very high | SVIM, Sniffles2, CuteSV |
| **Optical mapping** | Bionano | Large SV | >500bp | Very high | Bionano Solve |
| **SNP array** | Microarray | CNV | >100kb | Very low | PennCNV, QuantiSNP |

### Cancer CNV Analysis Pipeline

| Step | Method | Tool | Output | Key Decision |
|------|--------|------|--------|-------------|
| **1. Read counting** | Window/bin counting | CNVkit, Sequenza | Bin-level log2 ratios | Bin size (100kb for WES, 1kb for WGS) |
| **2. Normalization** | GC correction; reference | CNVkit | Normalized log2 ratios | Matched normal vs pooled reference |
| **3. Segmentation** | CBS; HMM | DNAcopy, CNVkit | Segmented copy number | Minimum segments; pruning |
| **4. Calling** | Threshold-based | CNVkit, GISTIC2 | Gain/loss/LOH | Threshold (log2 > 0.3 for gain, < -0.6 for loss) |
| **5. Purity/ploidy estimation** | Model fitting | ABSOLUTE, Sequenza, FACETS | Tumor purity; ploidy | Critical for absolute CN calling |
| **6. Driver identification** | Frequency-based | GISTIC2 | Recurrent CNVs | FDR < 0.25; broad vs focal |
| **7. Clinical annotation** | Oncogene/TSG | OncoKB, CIViC | Actionable CNVs | Amplification of oncogene; deletion of TSG |

### SV/CNV Assessment Protocol

| Assessment | Key Question | Required Evidence | Red Flag |
|-----------|-------------|-------------------|---------|
| **Purity adjustment** | Is CN calling adjusted for tumor purity? | Purity estimation (ABSOLUTE, pathology) | Raw log2 ratios without purity correction |
| **Ploidy estimation** | Is ploidy accounted for? | Ploidy model fit | Assumed diploid for aneuploid tumor |
| **Validation** | Are CNVs validated by orthogonal method? | FISH, qPCR, ddPCR, array | No validation for clinical CNV calls |
| **Clinical actionability** | Is the CNV actionable? | OncoKB, NCCN | HER2 amplification without IHC/FISH confirmation |
| **Tumor heterogeneity** | Are subclonal CNVs detected? | Subclonal deconvolution | Only clonal CNVs reported |

**Rule**: CNV calling in cancer WITHOUT tumor purity estimation is UNRELIABLE. A 30% pure tumor with a true copy number of 6 will appear as copy number 2.5 without purity correction.
**Rule**: GISTIC2 identifies RECURRENT CNVs across a cohort, NOT patient-specific driver CNVs. A patient-specific focal amplification may be a driver even if not GISTIC-significant.
**Rule**: Long-read sequencing (PacBio HiFi, ONT) detects 2-5× MORE SVs than short-read WGS. For clinical SV detection, long-read is increasingly recommended.

---

## CRISPR Screen Analysis — Deep Dive

### CRISPR Screen Types & Analysis

| Screen Type | Library | Readout | Analysis Tool | Key Metric |
|-------------|---------|---------|--------------|-----------|
| **Knockout (CRISPRko)** | GeCKO, Brunello, Brie | Depletion/enrichment | MAGeCK, CRISPResso2 | Log2 fold change; FDR |
| **Interference (CRISPRi)** | Dolcetto | Gene repression | MAGeCK, CRISPRi-score | Repression efficiency |
| **Activation (CRISPRa)** | Calabrese | Gene activation | MAGeCK, CRISPRa-score | Activation level |
| **Base editing** | BE4, ABE8e | Specific nucleotide change | CRISPResso2 | Editing efficiency |
| **In vivo** | AAV/ligand delivery | Tumor growth | MAGeCK, PinAPL-Py | In vivo selection |

### CRISPR Screen Analysis Pipeline (MAGeCK)

```
Raw FASTQ
    │
    ├─ Read trimming (adapter removal)
    │   └─ cutadapt / fastp
    │
    ├─ sgRNA counting
    │   └─ MAGeCK count → sgRNA count matrix
    │
    ├─ Quality control
    │   ├─ Mapping rate > 70%
    │   ├─ Gini index < 0.2 (even library representation)
    │   ├─ Pearson correlation between replicates > 0.9
    │   └─ Zero-count sgRNAs < 5%
    │
    ├─ Normalization & differential analysis
    │   └─ MAGeCK test / RRA → gene-level FDR
    │
    ├─ Pathway enrichment
    │   └─ GSEA on ranked gene list
    │
    └─ Validation
        ├─ Individual sgRNA validation (Western blot, qPCR)
        ├─ Rescue experiments (overexpression of target gene)
        └─ Orthogonal validation (RNAi, small molecule)
```

### CRISPR Screen Quality Metrics

| Metric | Definition | Acceptable | Critical Threshold |
|--------|-----------|-----------|-------------------|
| **Mapping rate** | % reads mapping to library | >70% | <50% = library problem |
| **Gini index** | Library representation evenness | <0.2 | >0.3 = bottleneck |
| **Replicate correlation** | Pearson r between replicates | >0.9 | <0.7 = poor reproducibility |
| **Zero-count sgRNAs** | sgRNAs with 0 reads | <5% | >10% = dropout |
| **LFC distribution** | Symmetric around 0 (control) | Centered at 0 | Shifted = normalization issue |
| **Essential gene depletion** | Known essentials depleted? | >90% of essentials depleted | <70% = screen failure |
| **Non-essential neutral** | Non-essentials near 0 LFC? | Median | |LFC| < 0.3 | |LFC| > 0.5 = noise |

**Rule**: CRISPR screen results without replicate concordance (Pearson r > 0.9) are UNRELIABLE. Biological replicates are ESSENTIAL, not optional.
**Rule**: CRISPRko screens have OFF-TARGET effects. A hit gene should be validated with ≥2 independent sgRNAs AND an orthogonal method (RNAi, small molecule, or rescue).
**Rule**: Positive selection screens (drug resistance) are MORE PRONE to false positives than negative selection screens (essential genes) because a single resistant clone can dominate the population.

---

## Bioinformatics Pipeline Orchestration (Adapted from OpenClaw)

### Genomics Data File Type Routing

When a user provides or references data files, detect the file type and route to the appropriate analysis pipeline:

| File Extension | Data Type | Primary Pipeline | Key Tools | Reference Section |
|---------------|-----------|-----------------|-----------|-------------------|
| `.fastq` / `.fq` | Raw sequencing reads | QC → Alignment → Quantification | FastQC, fastp, STAR, HISAT2 | RNA-seq / Variant Calling |
| `.bam` / `.sam` | Aligned reads | Quantification / Variant Calling | samtools, GATK, DeepVariant | Variant Calling |
| `.vcf` / `.bcf` | Variant calls | Annotation → Filtering → Interpretation | VEP, ANNOVAR, SnpEff, bcftools | ACMG / PRS / Fine-Mapping |
| `.bed` / `.bedgraph` | Genomic intervals | Peak calling / Overlap analysis | bedtools, pybedtools | Epigenomics |
| `.bigWig` / `.bw` | Coverage tracks | Visualization / Signal extraction | pyBigWig, IGV | Epigenomics |
| `.h5ad` / `.h5` | Single-cell data | Scanpy / Seurat pipeline | Scanpy, Seurat, scVI | Single-Cell |
| `.mtx` / `.mtx.gz` | Sparse matrix (10x) | Single-cell pipeline | Scanpy, Seurat | Single-Cell |
| `.fast5` | Nanopore reads | Basecalling → Alignment → Analysis | Guppy, Dorado, Minimap2 | Long-Read |
| `.pdb` / `.cif` | Protein structure | Structure analysis / Design | AlphaFold, PyMOL, RFdiffusion | Protein Structure |
| `.fasta` / `.fa` | Sequence data | Alignment / Search / Annotation | BLAST, DIAMOND, MMseqs2 | Multiple |
| `.gff` / `.gtf` | Gene annotations | Feature counting / Overlap | HTSeq, featureCounts, gffread | RNA-seq |
| `.hic` / `.cool` / `.mcool` | Hi-C contact maps | TAD/Loop calling | Juicer, HiCExplorer, cooltools | Hi-C 3D Genome |
| `.fcs` / `.csv` (FACS) | Flow cytometry | Gating / High-dim analysis | FlowJo, FlowSOM, CytoExploreR | Flow Cytometry |

### Pipeline Decision Tree

```
User provides data file
    │
    ├─ FASTQ → What organism? What assay?
    │   ├─ Human RNA-seq → STAR + RSEM/Salmon + DESeq2
    │   ├─ Human WGS → BWA-MEM2 + GATK + DeepVariant
    │   ├─ Human WES → BWA-MEM2 + GATK + VEP
    │   ├─ Mouse RNA-seq → STAR + Salmon + DESeq2 (mm10/GRCm39)
    │   └─ Non-model → HISAT2 + StringTie (de novo)
    │
    ├─ VCF → What analysis?
    │   ├─ Clinical interpretation → VEP + ACMG classification
    │   ├─ PRS calculation → PRSice2 / PRS-CS + GWAS summary stats
    │   ├─ Fine-mapping → SuSiE / FINEMAP + LD reference
    │   ├─ MR analysis → TwoSampleMR + GWAS catalog
    │   └─ Population genetics → PLINK + ADMIXTURE + PCA
    │
    ├─ h5ad → What analysis?
    │   ├─ Clustering → Scanpy (Leiden/Louvain)
    │   ├─ Cell type annotation → scType / CellTypist / Azimuth
    │   ├─ Trajectory → Monocle3 / PAGA / scVelo
    │   ├─ Multi-modal → WNN (Seurat v5) / MOFA+
    │   └─ Spatial integration → Tangram / Cell2location
    │
    ├─ PDB → What analysis?
    │   ├─ Structure prediction → AlphaFold3 / ESMFold
    │   ├─ Protein design → RFdiffusion + ProteinMPNN
    │   ├─ Binding prediction → AutoDock / DiffDock
    │   └─ Antibody design → ABodyBuilder2 + ABlooper
    │
    └─ Hi-C → What analysis?
        ├─ TAD calling → Arrowhead / InsulationScore
        ├─ Loop detection → HiCCUPS / FitHiC
        ├─ Compartment → Eigenvector decomposition
        └─ Visualization → Juicebox / HiGlass
```

### Pipeline Reproducibility Requirements

| Pipeline Component | Minimum Requirement | Best Practice | Verification |
|-------------------|--------------------|--------------|-------------|
| **Reference genome** | GRCh38/hg38 (human) | Specific build + version (e.g., GRCh38.p14) | Checksum of FASTA |
| **Annotation** | GENCODE v44+ | GENCODE + Ensembl comparison | Feature count comparison |
| **Tool versions** | Major version (e.g., GATK 4) | Exact version (e.g., GATK 4.5.0.0) | `--version` output |
| **Parameters** | Default parameters | Documented non-default parameters | Config file |
| **QC metrics** | Basic QC (FastQC) | MultiQC report + custom QC | Automated QC pipeline |
| **Container** | Conda environment | Docker/Singularity container | Container hash |

**Rule**: Always specify the exact reference genome build (GRCh38 vs GRCh37/hg19) — liftover between builds introduces errors.
**Rule**: For clinical genomics, use GRCh38. GRCh37 is deprecated for new clinical analyses.
**Rule**: Document ALL non-default parameters. "We used GATK" without parameters is NOT reproducible.
