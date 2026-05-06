# Hi-C and 3D Genome Methodology

## Hi-C Experimental Protocol

### Hi-C Workflow Overview

| Step | Action | Key Parameter | Common Error | QC Metric |
|------|--------|---------------|-------------|-----------|
| **1. Crosslinking** | Formaldehyde fixation | 1% formaldehyde; 10min | Over/under-crosslinking | Crosslinking efficiency |
| **2. Digestion** | Restriction enzyme | 6-cutter (HindIII) or 4-cutter (MboI/DpnII) | Incomplete digestion | Digestion efficiency > 80% |
| **3. End filling** | Biotin-labeled nucleotides | Biotin-14-dCTP | Inefficient fill-in | — |
| **4. Ligation** | Proximity ligation | Dilute conditions; T4 DNA ligase | Random ligation (high concentration) | Ligation efficiency |
| **5. Reverse crosslink** | Proteinase K | Overnight at 65°C | Incomplete reversal | — |
| **6. Shearing** | Sonication | 300-500bp fragments | Over/under-shearing | Fragment size distribution |
| **7. Biotin pull-down** | Streptavidin beads | — | Non-specific binding | Enrichment for ligation junctions |
| **8. Library prep** | End repair + adapter | — | PCR duplicates | Duplicate rate < 20% |
| **9. Sequencing** | Paired-end 150bp | 150-500M reads for mammalian | Insufficient depth | See depth requirements |

### Hi-C Resolution and Depth Requirements

| Resolution | Required Reads (Mammalian) | Detects | Application |
|-----------|--------------------------|---------|-------------|
| **1Mb** | ~5M | Chromosome territories | Nuclear organization |
| **100kb** | ~25M | A/B compartments | Compartment analysis |
| **40kb** | ~100M | TAD boundaries | TAD identification |
| **10kb** | ~500M | Sub-TADs; loops | Loop detection |
| **5kb** | ~1-2B | Fine-scale loops | Promoter-enhancer |
| **1kb** | ~5B+ | Single-enhancer resolution | High-resolution mapping |

### Hi-C Variants

| Method | Improvement | Resolution | Best For | Limitation |
|--------|-----------|-----------|----------|-----------|
| **In situ Hi-C** | Nuclear preservation | Standard | Standard 3D mapping | Standard resolution |
| **Dilution Hi-C** | Original method | Standard | Historical comparison | More random ligation |
| **Micro-C** | Micrococcal nuclease | ~200bp | Nucleosome-level | High depth required |
| **Capture Hi-C** | Targeted enrichment | High at targets | Promoter-centric | Limited to target regions |
| **Promoter Capture Hi-C** | Promoter-targeted | High at promoters | Promoter-enhancer | Only promoter-proximal |
| **HiChIP/PLAC-seq** | Protein-directed | High at factor sites | Factor-specific loops | Requires ChIP-grade antibody |
| **CHiC** | Chromatin interaction by capture | Targeted | Specific loci | Low throughput |
| **SPRITE** | Split-pool; multi-way | Multi-way contacts | Complex interactions | Complex protocol |
| **DNA-MERFISH** | Imaging-based | Single-cell | Spatial 3D genome | Limited loci |
| **Hi-C 3.0** | Improved protocol | Higher signal | Lower input | Newer; less validated |

## TAD Identification

### TAD Detection Methods

| Method | Algorithm | Resolution Needed | Strengths | Limitations |
|--------|-----------|-------------------|-----------|-------------|
| **Arrowhead** | Directional index | 10-40kb | Fast; robust | Fixed size bias |
| **Insulation Score** | Directionality index | 10-40kb | Simple; intuitive | Sensitive to parameters |
| **DomainCaller** | Hidden Markov Model | 40kb+ | Statistical framework | Coarse resolution |
| **SpectralTAD** | Spectral clustering | 10-40kb | Hierarchical TADs | Parameter sensitive |
| **TADtree** | Dynamic programming | 10-40kb | Nested TADs | Computationally intensive |
| **Epidaurus** | Multi-scale | 10-40kb | Multi-resolution | Complex |
| **3DNetMod** | Network-based | 10-40kb | Hierarchical; robust | Network construction choices |
| **OnTAD** | Neural network | 10-40kb | Data-driven | Training data bias |

### TAD Calling Pipeline

| Step | Action | Tool | Key Parameter | Common Error |
|------|--------|------|-------------|-------------|
| **1. Map reads** | Align to genome | HiC-Pro, Juicer, distiller | — | MAPQ < 30 not filtered |
| **2. Filter artifacts** | Remove dangling ends, self-circles | HiC-Pro, Juicer | — | Not filtering PCR duplicates |
| **3. Generate matrix** | Bin at chosen resolution | cooler, Juicer | 10-40kb bins | Too coarse resolution |
| **4. Normalize** | KR or ICE normalization | cooler, Juicer | — | Not normalizing (bias in matrix) |
| **5. Call TADs** | Arrowhead or Insulation Score | Juicer, cooltools | Window size | Window size too small/large |
| **6. Validate** | Compare with CTCF/RAD21 ChIP | — | TAD boundary enrichment | Not validating boundaries |

### TAD Boundary Features

| Feature | Enrichment at Boundaries | Biological Significance |
|---------|------------------------|----------------------|
| **CTCF** | Strong enrichment | Loop extrusion anchor |
| **Cohesin (RAD21/SMC3)** | Strong enrichment | Loop extrusion motor |
| **Active histone marks** (H3K4me3, H3K27ac) | Moderate | Active regulatory elements |
| **Housekeeping genes** | Moderate | Constitutively active |
| **SINE/LINE elements** | Variable | Species-specific |
| **tRNA genes** | Moderate (yeast) | Barrier function |

## Loop Detection

### Loop Calling Methods

| Method | Input | Sensitivity | Specificity | Best For |
|--------|-------|------------|------------|----------|
| **HiCCUPS** | Juicer matrix | High | High | Standard loop detection |
| **FitHiC2** | Contact matrix | Moderate | High | Variable resolution |
| **Mustache** | Contact matrix | High | Moderate | Multi-resolution |
| **Peakachu** | Contact matrix | High | High | ML-based; robust |
| **SIP** | Contact matrix | Moderate | High | Fast |
| **Chromosight** | Contact matrix | Moderate | High | Pattern detection |

### Loop Calling Pipeline (HiCCUPS)

| Step | Action | Parameter | Common Error |
|------|--------|-----------|-------------|
| **1. Generate Hi-C matrix** | Juicer pipeline | 5kb or 10kb resolution | Resolution too low for loops |
| **2. Run HiCCUPS** | GPU-accelerated | Default thresholds | No GPU available (use HiCCUPS2) |
| **3. Filter loops** | FDR < 0.01 | — | Not applying FDR |
| **4. Annotate loops** | Overlap with ChIP-seq | CTCF + cohesin at anchors | Not validating with ChIP |
| **5. Motif analysis** | CTCF motif orientation | Convergent CTCF motifs | Not checking motif orientation |
| **6. Compare conditions** | Differential loops | DiffLoop, multiHiCcompare | Not normalizing between conditions |

### Loop Classification

| Type | Size | Features | Mechanism | Example |
|------|------|----------|-----------|---------|
| **CTCF-mediated loop** | 100kb-2Mb | Convergent CTCF at anchors | Loop extrusion | TAD boundary-to-boundary |
| **Promoter-enhancer loop** | 10-500kb | H3K27ac + H3K4me1 at enhancer | Transcription activation | Gene regulation |
| **Promoter-promoter loop** | 10-200kb | Active promoters at both anchors | Co-regulation | Gene co-expression |
| **Super-enhancer hub** | 100kb-1Mb | Dense H3K27ac; multiple loops | Phase separation | Cell identity genes |

## A/B Compartment Analysis

### Compartment Identification

| Step | Action | Tool | Key Parameter |
|------|--------|------|-------------|
| **1. Generate contact matrix** | 100kb-1Mb resolution | cooler, Juicer | 100kb bins |
| **2. Compute observed/expected** | Normalize by distance | cooler | — |
| **3. Correlation matrix** | Pearson correlation of O/E | cooltools | — |
| **4. PCA** | First principal component | cooltools, R | PC1 = compartment |
| **5. Assign A/B** | PC1 positive = A; negative = B | — | Gene density confirms assignment |
| **6. Validate** | Correlate with histone marks | — | A = H3K27ac; B = H3K9me3 |

### Compartment Switching Analysis

| Switch | Histone Mark Change | Gene Expression | Clinical Relevance |
|--------|-------------------|----------------|-------------------|
| **A → B** | Active → repressive | Downregulated | Tumor suppressor silencing |
| **B → A** | Repressive → active | Upregulated | Oncogene activation |
| **Stable A** | Active | Maintained | Housekeeping |
| **Stable B** | Repressive | Silenced | Heterochromatin |

## 3D Genome Visualization

| Tool | Type | Input | Strengths | Platform |
|------|------|-------|-----------|----------|
| **Juicebox** | Interactive | .hic files | Standard; easy; many features | Desktop/Web |
| **HiGlass** | Web-based | cooler/.hic | Multi-track; collaborative | Web |
| **cooler** | Python API | .mcool | Programmatic; flexible | Python |
| **pyGenomeTracks** | Static plots | Various | Publication quality | Python |
| **Sushi.R** | R-based | Various | R integration | R |
| **3D Genome Browser** | Web | Various | Pre-loaded datasets | Web |
| **WashU Epigenome Browser** | Web | Various | Rich annotation tracks | Web |

## Multi-Omics Integration with 3D Genome

### Integration Strategies

| Data Type | Integration Point | Method | Biological Question |
|-----------|------------------|--------|-------------------|
| **RNA-seq** | Gene expression at TADs/loops | Correlate compartment with expression | Compartment → expression? |
| **ChIP-seq (CTCF)** | Loop anchors | Overlap loops with CTCF peaks | CTCF-mediated loops? |
| **ChIP-seq (H3K27ac)** | Enhancers in loops | Overlap loops with enhancers | Active enhancer-promoter? |
| **ATAC-seq** | Accessible regions at boundaries | Overlap boundaries with ATAC peaks | Boundary accessibility? |
| **eQTL** | SNPs in loops | Map eQTL to loop-connected genes | eQTL target gene assignment |
| **GWAS** | Risk variants in TADs | Map GWAS SNPs to TADs | Disease-relevant TADs |
| **HiChIP** | Factor-specific loops | Compare with Hi-C loops | Factor-specific vs structural |
| **scRNA-seq** | Cell-type-specific expression | Map to cell-type-specific loops | Cell-type 3D organization |

### GWAS-to-3D-Genome Pipeline

```
GWAS significant SNPs
    │
    ├─ [1] Map SNPs to TADs
    │   └─ Which TADs are enriched for GWAS signals?
    │
    ├─ [2] Identify target genes via loops
    │   ├─ SNPs in promoter → gene is obvious
    │   ├─ SNPs in enhancer → loop connects to promoter
    │   └─ SNPs in TAD → all genes in TAD are candidates
    │
    ├─ [3] Prioritize with eQTL
    │   └─ SNP affects expression of loop-connected gene?
    │
    ├─ [4] Validate with Capture Hi-C
    │   └─ Confirm promoter-enhancer contact
    │
    └─ [5] Functional validation
        ├─ CRISPRi of enhancer → gene expression change?
        └─ CRISPR deletion of loop anchor → gene expression change?
```

## Single-Cell Hi-C

| Method | Throughput | Resolution | Best For | Limitation |
|--------|-----------|-----------|----------|-----------|
| **scHi-C** | 1,000-10,000 cells | 40kb-100kb | Cell-type-specific TADs | Low per-cell coverage |
| **sci-Hi-C** | 10,000+ cells | 40kb-100kb | Higher throughput | Combinatorial indexing complexity |
| **Dip-C** | 1,000+ cells | 20kb | Chromosome haplotyping | Complex analysis |
| **snHi-C** | 5,000+ cells | 100kb | Nuclear organization | Low resolution per cell |
| **Hi-C + scRNA-seq** | Multi-ome | 100kb + gene-level | Joint 3D + expression | Separate assays |

### Single-Cell Hi-C Analysis Pipeline

| Step | Action | Tool | Key Decision |
|------|--------|------|-------------|
| **1. Aggregate by cell type** | Pool cells of same type | scHiCluster, SnapHiC | Minimum 50-100 cells per type |
| **2. Imputation** | Enhance sparse contacts | scHiCluster, HiC-Reg | Balance imputation vs artifact |
| **3. Call TADs per type** | Cell-type-specific TADs | Same as bulk | Lower resolution expected |
| **4. Differential analysis** | Compare TADs across types | diffHiC, multiHiCcompare | Multiple testing correction |
| **5. Integrate with scRNA** | 3D + expression | Custom | Correlate compartment with expression |

## Hi-C Disease Association

### Disease-Associated 3D Genome Changes

| Disease | 3D Genome Change | Mechanism | Clinical Impact |
|---------|-----------------|-----------|----------------|
| **Cancer** | TAD boundary loss | CTCF mutation → enhancer hijacking | Oncogene activation |
| **Cancer** | Compartment switching | A→B or B→A | Gene silencing/activation |
| **Limb malformation** | TAD disruption | Structural variant at boundary | Ectopic enhancer-promoter contact |
| **Neurodevelopmental** | TAD boundary disruption | De novo SV at boundary | Gene misregulation |
| **Congenital heart disease** | Enhancer hijacking | SV creates new enhancer contact | Developmental gene misexpression |

### Structural Variant 3D Impact Assessment

| SV Type | 3D Impact | Example | Assessment Method |
|---------|----------|---------|-------------------|
| **Deletion of TAD boundary** | TAD fusion; enhancer hijacking | Lumbar → Shh limb enhancer | Hi-C of patient cells |
| **Duplication with boundary** | Neo-TAD creation | Sox9 Kittenkopf | Hi-C + expression |
| **Inversion** | Loop reorientation | Factor VIII inversion (Hemophilia A) | Hi-C of patient cells |
| **Translocation** | New inter-chromosomal contacts | BCR-ABL (CML) | Hi-C of patient cells |
| **SNV at CTCF site** | Boundary weakening | CTCF binding loss | CTCF ChIP + Hi-C |

## Hi-C Quality Checklist

| Item | Required | Common Failure |
|------|----------|---------------|
| Sequencing depth appropriate for resolution | ✅ | Insufficient reads for target resolution |
| PCR duplicate rate < 20% | ✅ | High duplicate rate |
| Intra-chromosomal contact fraction > 60% | ✅ | Low signal-to-noise |
| TAD boundary enrichment for CTCF/cohesin | ✅ | Poor TAD calling |
| Replicate concordance (HiCRep > 0.8) | ✅ | Poor reproducibility |
| KR or ICE normalization applied | ✅ | Biased contact matrix |
| Resolution stated and justified | ✅ | Overclaiming resolution |
| Appropriate restriction enzyme choice | ✅ | 6-cutter for high-resolution |
| Validated with orthogonal data (ChIP, RNA) | 🟡 | No validation |
| Cell type matched to biological question | ✅ | Mismatched cell type |
