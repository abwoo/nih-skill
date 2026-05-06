# Flow Cytometry Methodology

## Panel Design

### Fluorochrome Selection Principles

| Principle | Rule | Violation Consequence |
|-----------|------|----------------------|
| **Spectral separation** | Minimize overlap between fluorochromes | Compensation artifacts; reduced sensitivity |
| **Brightness matching** | Dim fluorochromes on abundant antigens; bright on rare antigens | Missing rare populations |
| **Antigen density** | Match fluorochrome brightness to antigen density | Weak signal or saturation |
| **Instrument configuration** | Match fluorochromes to available lasers and detectors | Cannot detect fluorochrome |
| **Spillover spreading** | Minimize spillover into detectors of dim markers | Reduced resolution in affected channel |

### Fluorochrome Brightness Ranking (Common Panel)

| Rank | Fluorochrome | Laser | Brightness | Best For |
|------|-------------|-------|-----------|----------|
| 1 | BV750 | 405 | Very Bright | CD45 (abundant) |
| 2 | APC | 640 | Very Bright | CD3, CD19 |
| 3 | PE | 561 | Very Bright | CD4, CD8 |
| 4 | BV650 | 405 | Bright | CD14 |
| 5 | FITC | 488 | Bright | CD16 |
| 6 | PerCP-Cy5.5 | 488 | Moderate | CD56 |
| 7 | BV421 | 405 | Moderate | CD25 |
| 8 | APC-Cy7 | 640 | Moderate | CD127 |
| 9 | PE-Cy7 | 561 | Moderate-Dim | CD45RA |
| 10 | BV510 | 405 | Dim | Rare markers |

### Panel Design Workflow

| Step | Action | Tool | Key Decision | Common Error |
|------|--------|------|-------------|-------------|
| **1. Define biological question** | Cell types + markers | — | Must be specific | Too many markers |
| **2. List required markers** | All antigens needed | — | Core vs optional | Including unnecessary markers |
| **3. Check instrument** | Lasers + detectors | Cytometer configuration | Available channels | Fluorochrome not on instrument |
| **4. Assign fluorochromes** | Brightness × antigen density | FluoroFinder, Chromocyte | Bright → rare antigen | Dim fluor on rare antigen |
| **5. Check spillover** | Spillover spreading matrix (SSM) | FlowJo, FCS Express | Minimize spreading error | Ignoring spillover |
| **6. Optimize panel** | Titrate antibodies | Titration protocol | Optimal concentration | Using vendor-recommended only |
| **7. Validate** | Stain control samples | — | All populations resolved | Not validating with controls |

### Spillover Spreading Matrix (SSM)

| Concept | Definition | Impact |
|---------|-----------|--------|
| **Spillover** | Signal from one fluorochrome detected in another's channel | Requires compensation |
| **Spreading error** | Variance added to detector from spillover | Reduces resolution in affected channel |
| **SSM** | Quantifies spreading error for all fluorochrome pairs | Guides panel design |
| **Critical pair** | High spreading error into dim marker's channel | Must avoid or redesign |

## Compensation and Spectral Unmixing

### Traditional Compensation

| Step | Action | Key Rule | Common Error |
|------|--------|---------|-------------|
| **1. Single-stained controls** | One fluorochrome per tube | Must match exact fluorochrome | Using wrong fluorochrome |
| **2. Unstained control** | No fluorochrome | Set negative baseline | Omitting unstained |
| **3. Calculate matrix** | Linear regression | Automatic in FlowJo/Spectral | Manual errors |
| **4. Apply compensation** | Subtract spillover | Check N-by-N plots | Over/under-compensation |
| **5. Validate** | Check median fluorescence | Medians should align | Not checking all pairs |

### Spectral Flow Cytometry Unmixing

| Aspect | Traditional | Spectral |
|--------|------------|---------|
| **Detection** | Bandpass filters → peak emission | Full spectrum (32-64 channels) |
| **Separation** | Compensation (linear subtraction) | Unmixing (spectral decomposition) |
| **Controls** | Single-stained per fluorochrome | Single-stained + unstained |
| **Fluorochromes** | Limited by filter overlap | 30-40 colors possible |
| **Autofluorescence** | Cannot separate | Can extract as separate channel |
| **Unmixing artifacts** | — | Negative values; "ring of fire" |

### Spectral Unmixing Quality Checks

| Check | What to Look For | Fix |
|-------|-----------------|-----|
| **Negative values** | Events with negative fluorescence | Check reference spectra; add autofluorescence |
| **Ring of fire** | Circular artifact in bivariate plots | Spectral overlap; redesign panel |
| **Residual spillover** | Population not aligned after unmixing | Re-acquire reference controls |
| **Autofluorescence extraction** | AF spectrum correct? | Use appropriate AF reference |

## Gating Strategies

### Standard Gating Hierarchy

```
All events
    │
    ├─ [1] Time → Remove acquisition artifacts
    │
    ├─ [2] FSC-A vs SSC-A → Remove debris
    │
    ├─ [3] FSC-H vs FSC-A → Singlets (remove doublets)
    │
    ├─ [4] Live/Dead → Remove dead cells
    │
    ├─ [5] CD45+ → Leukocytes (if blood/tissue)
    │
    ├─ [6] Lineage markers → Major populations
    │   ├─ CD3+ → T cells
    │   │   ├─ CD4+ → Helper T
    │   │   └─ CD8+ → Cytotoxic T
    │   ├─ CD19+/CD20+ → B cells
    │   ├─ CD56+/CD3- → NK cells
    │   └─ CD14+/CD16+ → Monocytes
    │
    └─ [7] Subset markers → Detailed phenotyping
```

### Gating Controls

| Control | Purpose | Required? |
|---------|---------|-----------|
| **Unstained** | Baseline autofluorescence | ✅ |
| **FMO (Fluorescence Minus One)** | Set gate boundaries for dim markers | ✅ for dim markers |
| **Isotype control** | Non-specific binding | 🟡 (often misused; FMO preferred) |
| **Compensation control** | Single-stained for compensation | ✅ |
| **Biological control** | Known positive/negative sample | ✅ |
| **Viability dye** | Dead cell exclusion | ✅ |

## High-Dimensional Analysis

### Dimensionality Reduction Methods

| Method | Type | Input | Speed | Best For | Limitation |
|--------|------|-------|-------|----------|-----------|
| **t-SNE** | Non-linear | Preprocessed | Moderate | Visualization; 2D | Slow; not preserving global structure |
| **UMAP** | Non-linear | Preprocessed | Fast | Visualization; preserves more structure | Parameter sensitive |
| **FlowSOM** | SOM-based | Preprocessed | Very Fast | Clustering; large datasets | Grid structure artifact |
| **Phenograph** | Graph-based | Preprocessed | Moderate | Clustering; community detection | k parameter sensitive |
| **DiffusionMap** | Non-linear | Preprocessed | Moderate | Trajectory inference | Not for discrete populations |
| **FITSNE** | FFT-accelerated t-SNE | Preprocessed | Fast | Large datasets t-SNE | Same as t-SNE |
| **PACMAP** | Pairwise | Preprocessed | Fast | Preserves local+global | Newer; less validated |

### Clustering Pipeline

| Step | Action | Tool | Key Parameter | Common Error |
|------|--------|------|-------------|-------------|
| **1. Preprocessing** | Transform; normalize | FlowJo, Cytobank | arcsinh or logicle transform | Not transforming |
| **2. Downsampling** | Equal events per sample | FlowJo, R | 10,000-50,000 per sample | Unequal sampling |
| **3. Dimensionality reduction** | UMAP or t-SNE | R (uwot, Rtsne) | n_neighbors, min_dist | Not tuning parameters |
| **4. Clustering** | FlowSOM or Phenograph | R (FlowSOM, Rphenograph) | k (number of clusters) | Too many/few clusters |
| **5. Annotation** | Manual cluster labeling | Expert knowledge | Marker expression per cluster | Not using biological knowledge |
| **6. Validation** | Compare with manual gating | — | Concordance with known populations | Not validating clusters |
| **7. Differential abundance** | Compare conditions | diffcyt, edgeR | FDR < 0.05 | Not correcting for multiple testing |

### FlowSOM vs Phenograph Comparison

| Feature | FlowSOM | Phenograph |
|---------|---------|-----------|
| **Speed** | Very fast (SOM-based) | Moderate (graph-based) |
| **Scalability** | 1M+ events | 500K events |
| **Cluster shape** | Grid-based; may split populations | Community-based; natural shapes |
| **Parameters** | Grid size; meta-clustering k | k (nearest neighbors) |
| **Best for** | Large datasets; rapid exploration | Moderate datasets; natural clusters |
| **Implementation** | R (FlowSOM); Python (FlowCytometryTools) | R (Rphenograph); Python (phenograph) |

## Mass Cytometry (CyTOF)

### CyTOF vs Conventional Flow Cytometry

| Feature | Conventional Flow | CyTOF |
|---------|------------------|-------|
| **Detection** | Fluorescence photons | Metal isotope mass |
| **Parameters** | 8-30 colors | 40-60 metals |
| **Spectral overlap** | Yes (compensation needed) | No (mass resolution) |
| **Sensitivity** | Higher (bright fluorochromes) | Lower (detection efficiency ~30%) |
| **Throughput** | 10,000-50,000 events/sec | 300-500 events/sec |
| **Viability** | Live cell sorting possible | Cells destroyed |
| **Cost** | Lower per sample | Higher per sample |
| **Best for** | Routine clinical; sorting | Deep immunophenotyping |

### CyTOF Panel Design

| Principle | Rule | Note |
|-----------|------|------|
| **Isotope purity** | Use high-purity isotopes | >98% enrichment |
| **Oxidation** | Avoid elements with high oxidation | Barium; lead |
| **Signal intensity** | Match metal signal to antigen density | 139La (bright) → rare antigens |
| **Barcoding** | Use Pd barcoding for sample multiplexing | Up to 20-plex |
| **EQ beads** | Include for normalization | Required for inter-run comparison |

## Spectral Flow Cytometry

| Feature | Traditional | Spectral |
|---------|------------|---------|
| **Detector** | PMT with bandpass filter | Multichannel detector (full spectrum) |
| **Channels** | 8-30 | 32-64 |
| **Colors** | 8-30 | 30-40+ |
| **Autofluorescence** | Cannot remove | Can extract and subtract |
| **Fluorochrome choice** | Limited by filter overlap | More flexible |
| **Unmixing** | Linear compensation | Spectral decomposition |
| **Instruments** | BD LSRFortessa, CytoFLEX | Cytek Aurora, Sony ID7000 |

## Quality Control

### Daily QC Checklist

| Item | Method | Acceptable | Action if Failed |
|------|--------|-----------|-----------------|
| **Laser alignment** | CS&T beads (BD) | Within specification | Service call |
| **Fluidics** | Flow rate check | Stable | Clean fluidics |
| **PMT voltage** | CS&T or Rainbow beads | Within CV target | Adjust voltages |
| **Compensation** | Single-stained controls | Median alignment | Re-run compensation |
| **Sensitivity** | Rainbow beads | MESF within range | Adjust PMT |
| **Background** | Unstained cells | Low autofluorescence | Check laser alignment |

### Sample QC

| Item | Method | Acceptable | Common Issue |
|------|--------|-----------|-------------|
| **Viability** | Live/Dead dye | >85% viable | Dead cells bind antibodies non-specifically |
| **Cell count** | Hemocytometer/automated | Sufficient for panel | Too few cells |
| **Aggregation** | FSC-H vs FSC-A | <5% doublets | Cell clumping |
| **Fc receptor blocking** | Fc block before staining | Reduced non-specific | Not blocking FcR |
| **Antibody titration** | Serial dilution | Optimal S/N ratio | Using stock concentration |

## Clinical Flow Cytometry

### Leukemia/Lymphoma Immunophenotyping

| Disease | Key Markers | Diagnostic Pattern | WHO Classification |
|---------|-----------|-------------------|-------------------|
| **B-ALL** | CD19, CD10, CD34, TdT, CD20, sIg | CD19+ CD10+ TdT+ CD34+ | B-lymphoblastic leukemia |
| **T-ALL** | cCD3, CD7, CD1a, CD2, CD5, TdT | cCD3+ CD7+ TdT+ | T-lymphoblastic leukemia |
| **AML** | CD13, CD33, CD117, MPO, CD34, HLA-DR | CD13+ CD33+ MPO+ | Acute myeloid leukemia |
| **APL** | CD13, CD33, CD117, MPO, HLA-DR neg | CD33+ HLA-DR- CD34- | Acute promyelocytic leukemia |
| **CLL** | CD19, CD5, CD23, CD20 dim, sIg dim | CD19+ CD5+ CD23+ CD20 dim | Chronic lymphocytic leukemia |
| **MCL** | CD19, CD5, FMC7, CD23 neg, Cyclin D1 | CD19+ CD5+ CD23- Cyclin D1+ | Mantle cell lymphoma |
| **FL** | CD19, CD10, BCL2, CD23, FMC7 | CD19+ CD10+ BCL2+ | Follicular lymphoma |
| **DLBCL** | CD19, CD20, CD10, BCL6, MUM1 | GCB vs ABC subtype | Diffuse large B-cell lymphoma |
| **MM** | CD138, CD38, CD56, CD117, cytoIg | CD138+ CD38+ clonal cytoIg | Multiple myeloma |

### MRD (Minimal Residual Disease) Detection

| Method | Sensitivity | Sample | Turnaround | Best For |
|--------|------------|--------|-----------|----------|
| **Multiparameter flow (MFC)** | 10⁻⁴ to 10⁻⁵ | BM aspirate | 4-6 hours | Rapid; widely available |
| **NGS (clonoSEQ)** | 10⁻⁵ to 10⁻⁶ | BM or blood | 7-10 days | Highest sensitivity |
| **PCR (IG/TCR)** | 10⁻⁴ to 10⁻⁵ | BM aspirate | 1-2 days | Standardized; requires primer |

### Flow Cytometry Quality Checklist

| Item | Required | Common Failure |
|------|----------|---------------|
| Daily instrument QC | ✅ | Skipping QC |
| Compensation with single-stained controls | ✅ | Using wrong fluorochrome controls |
| FMO controls for dim markers | ✅ | Using isotype instead |
| Viability dye included | ✅ | Dead cell contamination |
| Fc receptor blocking | ✅ | Non-specific binding |
| Antibody titration | ✅ | Using stock concentration |
| Appropriate gating controls | ✅ | Subjective gating |
| Sample viability > 85% | ✅ | Dead cells affecting results |
| At least 100,000 events acquired | ✅ | Insufficient events for rare populations |
| Replicate concordance | 🟡 | Not running replicates |
