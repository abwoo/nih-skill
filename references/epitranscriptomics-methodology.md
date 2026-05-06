# Epitranscriptomics Methodology

## RNA Modification Types

### Major RNA Modifications

| Modification | Chemical Change | Abundance | Writer | Eraser | Reader | Distribution |
|-------------|----------------|-----------|--------|--------|--------|-------------|
| **m6A** | N6-methyladenosine | Most abundant mRNA mod | METTL3/METTL14/WTAP | FTO, ALKBH5 | YTHDF1/2/3, YTHDC1/2, IGF2BP1/2/3 | DRACH motif; 3'UTR enriched |
| **m6Am** | N6,2'-O-dimethyladenosine | Cap-proximal | PCIF1 (cap-specific) | FTO | — | First transcribed nucleotide |
| **m5C** | 5-methylcytosine | Moderate | NSUN1-7, DNMT2 | TET2 (oxidation) | ALYREF, YBX1 | Various; tRNA enriched |
| **Pseudouridine (Ψ)** | C-C' isomerization | Most abundant total RNA mod | PUS1-7, dyskerin | — (stable) | — | tRNA; rRNA; mRNA |
| **2'-O-methylation (Nm)** | 2'-OH methylation | Common | FBL, CMTR1, CMTR2 | — | — | rRNA; cap; mRNA |
| **m1A** | N1-methyladenosine | Less abundant | TRMT6/TRMT61A, TRMT10C | ALKBH1, ALKBH3 | YTHDF1 (disputed) | tRNA; mRNA 5'UTR |
| **m7G** | N7-methylguanosine | Cap + internal | METTL1/WDR4, RNMT | — | — | tRNA; mRNA cap; internal |
| **Am** | N6-methyladenosine (2'-O-me) | Cap-proximal | — | — | — | Cap structure |
| **ac4C** | N4-acetylcytidine | Rare | NAT10 | — | — | mRNA; rRNA; tRNA |
| **m3C** | N3-methylcytidine | Rare | METTL8, METTL2A | — | — | tRNA; mRNA |

## m6A Detection Methods

### Transcriptome-Wide m6A Mapping

| Method | Principle | Resolution | Input | Quantitative? | Strengths | Limitations |
|--------|-----------|-----------|-------|--------------|-----------|-------------|
| **MeRIP-seq / m6A-seq** | Anti-m6A IP + sequencing | ~100-200nt | ~300μg RNA | No (enrichment only) | Gold standard; widely used | Low resolution; requires lots of RNA |
| **m6A-CLIP / miCLIP** | UV crosslinking + IP | Single-nucleotide | ~300μg RNA | No | Single-nucleotide resolution | Technically demanding |
| **m6A-REF-seq** | Enzyme-based; m6A-sensitive RNase | Single-nucleotide | Low | Semi-quantitative | No antibody needed | Limited to specific motifs |
| **DART-seq** | APOE1 fusion protein + sequencing | ~20-50nt | Moderate | Semi-quantitative | No antibody; easier | Indirect detection |
| **m6A-SEAL** | FTO oxidation + chemical labeling | ~100nt | Moderate | Semi-quantitative | Chemical capture | FTO substrate specificity |
| **Nanopore direct RNA** | Electrical signal changes | Single-nucleotide | Low | Yes | Direct; no amplification | Lower accuracy; requires training |
| **m6A-SAC-seq** | Chemical conversion + sequencing | Single-nucleotide | Low | Yes | Quantitative; no antibody | Chemical conversion efficiency |
| **GLORI** | Chemical conversion + sequencing | Single-nucleotide | Low | Yes | Quantitative; high sensitivity | Newer; less validated |
| **TET-assisted m6A-seq** | TET oxidation + sequencing | Single-nucleotide | Moderate | Semi-quantitative | High specificity | TET efficiency |
| **NanoVIP** | Nanopore + VIP analysis pipeline | Single-nucleotide | Low | Yes | Direct detection; quantitative | Nanopore platform required |

### m6A Detection Method Selection

```
What is your research question?
    │
    ├─ Global m6A landscape (where are m6A sites?)
    │   ├─ Standard resolution → MeRIP-seq (easiest; most established)
    │   └─ Single-nucleotide → miCLIP or m6A-CLIP
    │
    ├─ Quantification (how much m6A at each site?)
    │   ├─ Relative quantification → GLORI or m6A-SAC-seq
    │   └─ Absolute quantification → LC-MS/MS (site-specific)
    │
    ├─ Dynamic m6A changes (condition A vs B)
    │   ├─ Enrichment changes → MeRIP-seq (both conditions)
    │   └─ Quantitative changes → GLORI or Nanopore
    │
    ├─ Single-cell m6A
    │   └─ scMeRIP-seq (emerging; low coverage)
    │
    └─ Validation of specific sites
        ├─ LC-MS/MS (gold standard; quantitative)
        └─ Site-directed mutagenesis + functional assay
```

### MeRIP-seq Pipeline

| Step | Action | Tool | Key Parameter | Common Error |
|------|--------|------|-------------|-------------|
| **1. RNA extraction** | High-quality total RNA | TRIzol; RNeasy | RIN > 8 | Degraded RNA |
| **2. Fragmentation** | Chemical fragmentation | Fragmentation buffer | ~100nt fragments | Over/under-fragmentation |
| **3. Immunoprecipitation** | Anti-m6A antibody | Synaptic Systems, Millipore | 3-5μg antibody per 300μg RNA | Insufficient antibody; non-specific binding |
| **4. Library prep** | IP + Input libraries | NEBNext, TruSeq | — | Not including Input control |
| **5. Sequencing** | Paired-end 150bp | Illumina | 30-50M reads per sample | Insufficient depth |
| **6. Peak calling** | Identify m6A peaks | exomePeak2, MACS2, MeTPeak | FDR < 0.05 | Not using Input as control |
| **7. Differential methylation** | Compare conditions | exomePeak2, MeTDiff | FDR < 0.05; fold change > 1.5 | Not normalizing for expression |
| **8. Motif analysis** | DRACH motif enrichment | HOMER, MEME | — | Not checking for motif |
| **9. Functional analysis** | GO/KEGG of m6A genes | clusterProfiler | FDR < 0.05 | Not accounting for expression changes |

## Writer/Reader/Eraser Analysis

### m6A Writer Complex (METTL3/METTL14/WTAP)

| Component | Function | Essential? | KO Phenotype | Disease Association |
|-----------|----------|-----------|-------------|-------------------|
| **METTL3** | Catalytic subunit (methyltransferase) | Yes | Embryonic lethal | Cancer (AML, lung, liver) |
| **METTL14** | Structural support; allosteric activation | Yes | Embryonic lethal | Cancer (AML, glioblastoma) |
| **WTAP** | Regulatory subunit; localization | Yes | Embryonic lethal | Cancer; splicing regulation |
| **VIRMA (KIAA1429)** | Region-specific deposition | No | Viable; fertility defects | Cancer (hepatocellular) |
| **RBM15/15B** | Recruitment to specific transcripts | No | Viable | X-linked disease |
| **ZC3H13** | Nuclear localization | No | Viable | Cancer |
| **HAKAI** | Complex stability | No | Viable | — |

### m6A Erasers

| Eraser | Substrate | Activity | Cellular Localization | Disease |
|--------|----------|---------|---------------------|---------|
| **FTO** | m6Am > m6A (in vivo debate) | Demethylase | Nucleus + cytoplasm | Obesity; cancer; metabolic disease |
| **ALKBH5** | m6A only | Demethylase | Nucleus | Cancer (glioblastoma, breast) |

### m6A Readers

| Reader | Binding | Function | Localization | Disease |
|--------|---------|----------|-------------|---------|
| **YTHDF1** | m6A | Translation promotion | Cytoplasm | Cancer |
| **YTHDF2** | m6A | mRNA degradation | Cytoplasm (P-body) | Cancer; inflammation |
| **YTHDF3** | m6A | Assists DF1/DF2 | Cytoplasm | Cancer |
| **YTHDC1** | m6A | Splicing; nuclear export | Nucleus | Cancer; X chromosome inactivation |
| **YTHDC2** | m6A | Translation; RNA stability | Cytoplasm | Cancer; spermatogenesis |
| **IGF2BP1/2/3** | m6A | mRNA stabilization | Cytoplasm | Cancer (oncofetal) |
| **HNRNPA2B1** | m6A (indirect?) | Pri-miRNA processing | Nucleus | Cancer |
| **eIF3** | m6A (5'UTR) | Cap-independent translation | Cytoplasm | Stress response |

## Epitranscriptomic Regulation Mechanisms

### m6A Functional Consequences

| Location | Effect | Mechanism | Reader | Outcome |
|----------|--------|-----------|--------|---------|
| **3'UTR** | mRNA degradation | YTHDF2 recruitment → deadenylation | YTHDF2 | Reduced protein output |
| **3'UTR** | Translation promotion | eIF complex recruitment | YTHDF1 | Increased protein output |
| **5'UTR** | Cap-independent translation | eIF3 direct binding | eIF3 | Stress-responsive translation |
| **CDS** | Translation elongation | Ribosome dynamics alteration | YTHDF1/3 | Altered protein isoforms |
| **Stop codon** | Splicing + stability | YTHDC1 recruitment | YTHDC1 | Nuclear processing |
| **Intron** | Alternative splicing | HNRNPA2B1; YTHDC1 | Multiple | Isoform switching |
| **Pri-miRNA** | miRNA processing | DGCR8 recruitment | HNRNPA2B1 | Altered miRNA levels |
| **lncRNA** | Structure + function | RNA structure alteration | Multiple | Chromatin regulation |

### m6A in Disease

| Disease | m6A Change | Mechanism | Therapeutic Target |
|---------|-----------|-----------|-------------------|
| **AML** | METTL3/14 upregulated | m6A on MYC/PTEN → oncogene activation | METTL3 inhibitors (STM2457) |
| **Glioblastoma** | METTL3/ALKBH5 dysregulated | m6A on SOX2 → stemness | ALKBH5 inhibitors |
| **Breast cancer** | METTL3 up; ALKBH5 variable | m6A on EMT genes → metastasis | METTL3/ALKBH5 targeting |
| **Lung cancer** | METTL3 upregulated | m6A on oncogenes → proliferation | METTL3 inhibitors |
| **HCC** | METTL3/14 upregulated | m6A on SOCS2 → degradation | METTL3 inhibitors |
| **Colorectal cancer** | METTL3 upregulated | m6A on β-catenin pathway | METTL3 inhibitors |
| **Type 2 diabetes** | FTO variant | m6A on gluconeogenic genes | FTO inhibitors |
| **Obesity** | FTO variant (rs9939609) | m6A on energy metabolism genes | FTO inhibitors |
| **Neurodegeneration** | FTO/ALKBH5 dysregulated | m6A on neuronal genes | Reader modulation |

## Therapeutic Targeting of RNA Modifications

### Small Molecule Inhibitors

| Target | Inhibitor | IC50 | Stage | Selectivity | Note |
|--------|----------|------|-------|------------|------|
| **METTL3** | STM2457 | 16.9nM | Preclinical | High | AML xenograft efficacy |
| **METTL3** | UZH1a | 280nM | Research | High | Covalent inhibitor |
| **METTL3/14** | BT-01 | — | Research | Moderate | Allosteric |
| **FTO** | CS1/CS2 | μM range | Research | Low (ALKBH2/3) | First-gen FTO inhibitors |
| **FTO** | FB23-2 | 570nM | Preclinical | Moderate | AML efficacy |
| **FTO** | Dac51 | — | Preclinical | — | Immunotherapy sensitization |
| **ALKBH5** | ALK-004 | — | Preclinical | Moderate | Glioblastoma |
| **ALKBH5** | Ena15 | — | Research | — | Limited validation |

### Epitranscriptomic Therapeutic Pipeline

| Stage | Milestone | Required Evidence |
|-------|-----------|-------------------|
| **Target identification** | Writer/eraser implicated in disease | Genetic perturbation (KO/KD) + phenotype |
| **Mechanism validation** | m6A targets identified | MeRIP-seq + eCLIP + functional assays |
| **Inhibitor development** | Small molecule identified | Biochemical assay; IC50; selectivity |
| **Cellular efficacy** | Cancer cell growth inhibition | EC50; target engagement; m6A reduction |
| **In vivo efficacy** | Xenograft tumor regression | Dose-response; PK/PD; toxicity |
| **Biomarker** | m6A signature predicts response | Patient-derived samples; m6A profiling |
| **Clinical trial** | Safety + efficacy in patients | Phase I/II |

---

## m6A Functional Consequences

### m6A Effects on RNA Metabolism

| Process | m6A Effect | Reader | Mechanism | Outcome |
|---------|-----------|--------|-----------|---------|
| **mRNA stability** | Decay promotion | YTHDF2 | Recruit CCR4-NOT deadenylase | Reduced half-life |
| **mRNA stability** | Stabilization | IGF2BP1/2/3 | Protect from endonucleolytic cleavage | Increased half-life |
| **Translation efficiency** | Enhancement | YTHDF1 | Recruit eIF3; ribosome loading | Increased protein output |
| **Translation efficiency** | Enhancement | eIF3 (direct) | Direct binding to 5'UTR m6A | Cap-independent translation |
| **Nuclear export** | Facilitation | YTHDC1 | Recruit NXF1 | Cytoplasmic export |
| **Splicing** | Regulation | YTHDC1 | Recruit SRSF3; repel SRSF10 | Exon inclusion/skipping |
| **Pri-miRNA processing** | Enhancement | DGCR8 (direct) | m6A marks pri-miRNA for processing | Increased mature miRNA |
| **Circular RNA** | Inhibition | YTHDC1 | m6A promotes back-splicing alternative | Altered circRNA biogenesis |
| **R-loop resolution** | Facilitation | — | m6A reduces R-loop formation | Genome stability |

### m6A in Cancer — Dual Role

| Cancer | m6A Writer/Eraser | Direction | Key Targets | Functional Consequence | Therapeutic Implication |
|--------|-------------------|-----------|-------------|----------------------|----------------------|
| **AML** | METTL3 ↑ | Oncogenic | MYC, BCL2, PTEN | Stabilization of oncogenic transcripts | METTL3 inhibitor (STM2457) |
| **AML** | FTO ↑ | Oncogenic | ASB2, RARA | Demethylation → decay of tumor suppressors | FTO inhibitor (FB23-2) |
| **HCC** | METTL3 ↑ | Oncogenic | SOCS2, IDH1 | Degradation of tumor suppressors | METTL3 inhibition |
| **HCC** | ALKBH5 ↑ | Oncogenic | LY6K | Stabilization of oncogenic mRNA | ALKBH5 inhibition |
| **Breast cancer** | METTL3 ↑ | Oncogenic | BCL-2, HBXIP | Anti-apoptotic; proliferation | METTL3 inhibition |
| **Breast cancer** | ALKBH5 ↑ | Oncogenic | NANOG | Stemness maintenance | ALKBH5 inhibition |
| **Glioblastoma** | METTL3 ↓ | Tumor suppressive | SRSF3, GLI1 | Loss → splicing defects; oncogene activation | m6A restoration? |
| **Glioblastoma** | ALKBH5 ↑ | Oncogenic | FOXM1 | Stemness; radioresistance | ALKBH5 inhibition |
| **Lung cancer** | METTL3 ↑ | Oncogenic | JUNB, MYC | Proliferation; metastasis | METTL3 inhibition |
| **CRC** | METTL14 ↓ | Tumor suppressive | SRSF3 | Loss → oncogene splicing | m6A restoration? |

### m6A Reader as Therapeutic Target

| Reader | Function | Cancer Role | Druggability | Inhibitor Status |
|--------|----------|-------------|-------------|-----------------|
| **YTHDF1** | Translation enhancement | Oncogenic (multiple cancers) | Moderate (YTH domain) | No selective inhibitor |
| **YTHDF2** | mRNA decay | Context-dependent | Moderate | No selective inhibitor |
| **YTHDC1** | Nuclear export/splicing | Context-dependent | Moderate | DC-Y13 (research tool) |
| **IGF2BP1** | mRNA stabilization | Oncogenic (multiple) | Moderate (KH domains) | BTYNB (research tool) |
| **IGF2BP2** | mRNA stabilization | Oncogenic | Moderate | No selective inhibitor |
| **IGF2BP3** | mRNA stabilization | Oncogenic; metastasis | Moderate | No selective inhibitor |

**Rule**: m6A has a DUAL ROLE in cancer — it can be oncogenic OR tumor-suppressive depending on tissue context and target genes. NEVER assume m6A is universally "good" or "bad."
**Rule**: METTL3 inhibition is NOT equivalent to "reducing m6A." METTL3 also has m6A-independent functions (e.g., promoting translation of certain mRNAs). Phenotypic effects of METTL3 KD may be partially m6A-independent.
**Rule**: IGF2BP proteins STABILIZE m6A-marked mRNAs (opposite of YTHDF2). The net effect of m6A on any given transcript depends on the BALANCE of readers, not just the presence of m6A.

---

## m5C & Pseudouridine Methodology

### m5C Detection Methods

| Method | Principle | Resolution | Quantitative | Input | Strength | Limitation |
|--------|-----------|-----------|-------------|-------|----------|-----------|
| **Bisulfite-seq (RNA-BS-seq)** | C→U conversion (unmodified C); m5C resists | Single-nucleotide | Semi-quantitative | ~1μg RNA | Gold standard | Cannot distinguish m5C from hm5C; RNA degradation |
| **Aza-IP** | 5-azacytidine trapping + IP | Single-nucleotide | No | Moderate | Enzyme-specific | Only captures NSUN-targeted m5C |
| **miCLIP** | UV crosslinking + IP | Single-nucleotide | No | ~3μg RNA | Enzyme-specific sites | Technically demanding |
| **TET-assisted bisulfite-seq** | TET oxidation of m5C → hm5C | Single-nucleotide | Semi-quantitative | Moderate | Distinguishes m5C from hm5C | Complex protocol |

### Pseudouridine Detection Methods

| Method | Principle | Resolution | Input | Strength | Limitation |
|--------|-----------|-----------|-------|----------|-----------|
| **Ψ-seq (CMC-based)** | CMC modification blocks RT at Ψ | Single-nucleotide | ~5μg RNA | Widely used | False positives; CMC specificity |
| **Pseudo-seq** | CMC + ligation-based | Single-nucleotide | ~5μg RNA | Improved specificity | Still CMC-dependent |
| **CeU-seq** | Chemical labeling + enrichment | Single-nucleotide | Moderate | Enrichment for low-abundance | Chemical artifacts |
| **Nanopore direct RNA** | Electrical signal changes | Single-nucleotide | Low | Direct; no chemical treatment | Training data limited; lower accuracy |

### m5C Functional Roles

| Context | Writer | Target | Function | Disease Association |
|---------|--------|--------|----------|-------------------|
| **mRNA export** | NSUN2 | mRNA m5C | ALYREF-mediated nuclear export | Intellectual disability (NSUN2 mutation) |
| **tRNA stability** | NSUN2, NSUN6 | tRNA | Prevent tRNA cleavage | Neurodevelopmental disorders |
| **Translation** | NSUN2 | mRNA 5'UTR | Cap-independent translation | Cancer (NSUN2 overexpression) |
| **rRNA** | NSUN1, NSUN5 | rRNA | Ribosome biogenesis | Aging (NSUN5 loss → longevity in yeast) |
| **Chromatin** | DNMT2 | tRNA | tRNA stability; transgenerational epigenetics | DNMT2 KO → tRNA fragmentation |

**Rule**: m5C detection by bisulfite sequencing has a HIGH FALSE POSITIVE RATE because incomplete conversion of unmodified C is indistinguishable from m5C. Always include non-bisulfite controls.
**Rule**: Pseudouridine is the MOST ABUNDANT RNA modification but the LEAST STUDIED in mRNA. Most Ψ research focuses on rRNA and tRNA. mRNA Ψ functions are still emerging.
**Rule**: NSUN2 is the major mRNA m5C writer, but it also modifies tRNA. Phenotypic effects of NSUN2 perturbation may be dominated by tRNA effects, not mRNA effects.

---

## Epitranscriptomics Quality Checklist

| Item | Required | Common Failure |
|------|----------|---------------|
| Appropriate detection method for modification type | ✅ | Using MeRIP-seq for single-nucleotide resolution questions |
| Input RNA quality (RIN > 7) | ✅ | Degraded RNA → artifacts |
| Biological replicates (≥3) | ✅ | No replicates |
| Spike-in controls for quantification | ✅ | No normalization control |
| Antibody specificity validated (MeRIP) | ✅ | Non-specific IP |
| Bisulfite conversion efficiency > 99% (m5C) | ✅ | Incomplete conversion → false positives |
| CMC treatment controls (Ψ) | ✅ | No -CMC control |
| Differential modification analysis with proper statistics | ✅ | No statistical testing |
| Validation by orthogonal method | ✅ | Single method only |
| Functional validation (not just mapping) | ✅ | Mapping without functional data |
| Reader/Writer/Eraser perturbation + phenotypic assay | ✅ | Modification change without functional consequence |
| m6A-independent effects controlled (METTL3 KD) | ✅ | Attributing all effects to m6A |
| Cancer context specified (oncogenic vs tumor-suppressive) | ✅ | Universal claim without tissue context |
| Therapeutic inhibitor selectivity profile provided | ✅ | Non-selective inhibitor claims |

## Epitranscriptomics Quality Checklist

| Item | Required | Common Failure |
|------|----------|---------------|
| Input control for MeRIP-seq | ✅ | No Input → cannot call peaks |
| RIN > 8 for RNA input | ✅ | Degraded RNA → artifacts |
| Biological replicates (n ≥ 3) | ✅ | No replicates → no statistics |
| Spike-in controls for quantification | 🟡 | No normalization standard |
| Antibody specificity validated | ✅ | Non-specific IP |
| Fragmentation size 80-120nt | ✅ | Over/under-fragmentation |
| Peak calling with FDR control | ✅ | No multiple testing correction |
| Expression normalization for differential methylation | ✅ | Expression changes confounding |
| DRACH motif enrichment check | ✅ | Non-m6A peaks |
| Validation of key sites (LC-MS or mutagenesis) | 🟡 | No orthogonal validation |
| Functional follow-up (KO/KD of writer) | ✅ | Correlation only; no causation |
