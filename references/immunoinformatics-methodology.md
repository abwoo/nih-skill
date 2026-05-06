# Immunoinformatics Methodology

## Epitope Prediction

### B-Cell Epitope Prediction

| Type | Method | Tool | Input | Output | Performance |
|------|--------|------|-------|--------|-------------|
| **Linear (continuous)** | Sequence-based | BepiPred-2.0, ABCpred, LBtope | Protein sequence | Epitope residues + scores | AUC ~0.57-0.70 |
| **Conformational (discontinuous)** | Structure-based | DiscoTope-3.0, ElliPro, EPITOPIA, PEPITOPE | 3D structure (PDB) | Surface epitope patches | AUC ~0.60-0.75 |
| **B-cell mimicry** | Cross-reactivity | MimicDB, BepiMimic | Sequence + epitope | Mimicry candidates | Experimental validation required |

### B-Cell Epitope Prediction Pipeline

| Step | Action | Tool | Key Decision | Common Error |
|------|--------|------|-------------|-------------|
| **1. Antigen selection** | Target protein | UniProt, PDB | Disease relevance; immunogenicity | Selecting non-surface protein |
| **2. Structure retrieval** | Get 3D structure | PDB, AlphaFold DB | Experimental > predicted structure | Using low-confidence AF region |
| **3. Linear epitope prediction** | Sequence scan | BepiPred-2.0 | Score threshold > 0.5 | Too low threshold → many false positives |
| **4. Conformational prediction** | Structure scan | DiscoTope-3.0 | Score threshold; surface accessibility | Ignoring flexibility |
| **5. Conservation filter** | Remove conserved regions | ConSurf | Remove highly conserved (cross-reactivity) | Conserved epitope → autoimmunity risk |
| **6. Allergenicity check** | Assess allergy risk | AllerTOP, AllergenFP | Non-allergenic preferred | Not checking allergenicity |
| **7. Toxicity check** | Assess toxicity | ToxinPred | Non-toxic required | Not checking toxicity |
| **8. Cross-reactivity** | Check similarity to human | BLAST vs human proteome | <30% identity to human proteins | Autoimmunity risk |
| **9. Prioritization** | Rank candidates | Combine scores | Top 3-5 candidates | Too many candidates |

### T-Cell Epitope Prediction

#### MHC-I Binding Prediction

| Tool | Method | Alleles Covered | Performance | Speed |
|------|--------|----------------|-------------|-------|
| **NetMHCpan-4.1** | Neural network | 12,000+ HLA alleles | AUC ~0.85-0.95 | Fast |
| **MHCflurry 2.0** | Neural network | Common HLA alleles | AUC ~0.85-0.93 | Fast |
| **HLAthena** | Deep learning | Common HLA alleles | AUC ~0.85-0.92 | Moderate |
| **DeepLigand** | Deep learning | Limited alleles | AUC ~0.80-0.90 | Moderate |

#### MHC-II Binding Prediction

| Tool | Method | Alleles Covered | Performance | Note |
|------|--------|----------------|-------------|------|
| **NetMHCIIpan-4.0** | Neural network | 40,000+ HLA-DR/DP/DQ | AUC ~0.75-0.88 | Best for MHC-II |
| **MHCnuggets** | LSTM | Common alleles | AUC ~0.70-0.85 | Open source |
| **MARIA** | Integration | HLA-DR | AUC ~0.75-0.85 | Includes processing |

#### MHC Binding Affinity Classification

| Category | IC50 (nM) | % Rank | Interpretation |
|----------|-----------|--------|---------------|
| **Strong binder** | < 50 | < 0.5% | Highly immunogenic |
| **Weak binder** | 50-500 | 0.5-2% | Moderately immunogenic |
| **Non-binder** | > 500 | > 2% | Unlikely to elicit response |

### T-Cell Epitope Prediction Pipeline

| Step | Action | Tool | Key Decision | Common Error |
|------|--------|------|-------------|-------------|
| **1. Define HLA coverage** | Target population HLA | IEDB HLA frequency tool | Cover >90% population | Using only HLA-A*02:01 |
| **2. Peptide generation** | Sliding window | NetMHCpan | 8-11mer (MHC-I); 15mer (MHC-II) | Wrong peptide length |
| **3. Binding prediction** | Score all peptides | NetMHCpan / NetMHCIIpan | IC50 < 50nM or %rank < 0.5 | Using only IC50 (use %rank too) |
| **4. Processing prediction** | Proteasomal cleavage | NetChop, PCPS | Cleavage score > 0.5 | Ignoring processing |
| **5. TAP transport** | TAP binding prediction | TAPREG, NetCTLpan | TAP transport efficiency | Not filtering for TAP |
| **6. Immunogenicity** | T-cell response prediction | IEDB immunogenicity tool | Immunogenicity score | Not assessing immunogenicity |
| **7. Cross-reactivity** | Similarity to human | BLAST vs human proteome | <80% identity over 8mer | Autoimmunity risk |
| **8. Population coverage** | Calculate coverage | IEDB population coverage | >80% global coverage | Not reporting coverage |
| **9. Epitope clustering** | Remove overlapping | Custom | Minimal set covering max alleles | Redundant epitopes |

### Population Coverage Calculation

| Population | Key HLA Alleles | Coverage with Top 5 Epitopes | Note |
|-----------|----------------|----------------------------|------|
| **North American** | A*02:01, A*24:02, B*07:02, B*08:01 | ~85% | Diverse; need broad coverage |
| **European** | A*02:01, A*01:01, B*08:01, B*07:02 | ~88% | Similar to North American |
| **East Asian** | A*24:02, A*02:01, B*40:01, B*52:01 | ~82% | Different allele frequencies |
| **African** | A*02:01, A*23:01, B*58:01, B*53:01 | ~75% | Most diverse; hardest to cover |
| **Global** | Mixed | ~70-80% | Need 10+ epitopes for >90% |

## Vaccine Design Pipeline

### Vaccine Platform Comparison

| Platform | Speed | Immune Response | Storage | Safety | Best For | Example |
|----------|-------|----------------|---------|--------|----------|---------|
| **mRNA** | Very Fast | Strong (Th1+Th2) | -20°C to -80°C | High | Rapid response; variants | COVID-19 (BNT162b2/mRNA-1273) |
| **Viral vector** | Fast | Strong (cellular) | 2-8°C | Moderate | Cellular immunity needed | COVID-19 (Ad26.COV2.S); Ebola (rVSV-ZEBOV) |
| **Protein subunit** | Moderate | Moderate (antibody) | 2-8°C | Very High | Antibody-focused; boosters | HepB; Shingrix; Novavax COVID |
| **Inactivated** | Moderate | Moderate (antibody) | 2-8°C | High | Established approach | Polio (IPV); Sinovac COVID |
| **Live attenuated** | Slow | Strong (broad) | -20°C | Lower risk | Long-lasting immunity | MMR; Yellow fever |
| **DNA** | Fast | Moderate | Room temp | High | Electroporation needed | ZyCoV-D (COVID-19, India) |
| **VLP** | Moderate | Strong (antibody) | 2-8°C | Very High | Mimics virus structure | HPV (Gardasil); HBV |

### Reverse Vaccinology Pipeline

| Step | Action | Tool/Database | Output | Key Decision |
|------|--------|--------------|--------|-------------|
| **1. Pathogen genome** | Get genome sequence | NCBI GenBank, RefSeq | Complete genome | Strain selection |
| **2. ORF prediction** | Identify open reading frames | Prodigal, Glimmer | Protein sequences | Include hypothetical proteins? |
| **3. Subcellular localization** | Predict surface/secreted | PSORTb, SignalP, TMHMM | Surface-exposed proteins | Filter for surface proteins |
| **4. Adhesin prediction** | Predict adhesion molecules | Vaxign, SPAAN | Adhesin candidates | Adhesins = good vaccine targets |
| **5. Epitope prediction** | B-cell + T-cell epitopes | NetMHCpan, BepiPred | Epitope map | HLA coverage |
| **6. Conservation analysis** | Cross-strain conservation | BLAST, OrthoMCL | Conserved epitopes | Strain coverage |
| **7. Allergenicity/toxicity** | Safety screening | AllerTOP, ToxinPred | Safe candidates | Must be non-allergenic |
| **8. Population coverage** | HLA frequency analysis | IEDB population coverage | Coverage report | >80% target population |
| **9. Structural modeling** | 3D epitope structure | AlphaFold, Rosetta | Epitope structure | Conformational epitopes |
| **10. Immunogenicity simulation** | Predict immune response | C-ImmSim | Simulated response | Dose optimization |

### Neoantigen Prediction Pipeline (Cancer Vaccines)

| Step | Action | Tool | Key Decision | Common Error |
|------|--------|------|-------------|-------------|
| **1. Tumor sequencing** | WES + RNA-seq | GATK, STAR | Matched tumor-normal required | No normal → germline contamination |
| **2. Variant calling** | Somatic mutations | Mutect2, Strelka2 | Filter: PASS; VAF > 5% | Including germline variants |
| **3. HLA typing** | Class I + II typing | OptiType, HLA-HD, arcasHLA | 4-digit resolution required | 2-digit resolution insufficient |
| **4. Peptide generation** | Mutant + wild-type | pVACseq, MuPeXI | 8-11mer (I); 15mer (II) | Not generating wild-type controls |
| **5. MHC binding** | Predict binding | NetMHCpan, NetMHCIIpan | IC50 < 500nM; %rank < 2 | Not comparing mutant vs WT |
| **6. Differential binding** | Mutant vs WT | Custom | ΔIC50 > 5× or WT non-binder | Not filtering for differential |
| **7. RNA expression** | Confirm expression | RNA-seq TPM | TPM > 1 recommended | Including unexpressed neoantigens |
| **8. Clonality** | Clonal vs subclonal | PyClone, ABSOLUTE | Prefer clonal neoantigens | Subclonal only → immune escape |
| **9. Immunogenicity** | T-cell response prediction | DeepImmuno, PRIME | Score > threshold | Not predicting immunogenicity |
| **10. Prioritization** | Rank candidates | pVACtools ranking | Top 10-20 per patient | Too many candidates |

## MHC Binding Prediction Deep Dive

### MHC-I Binding Rules

| Feature | Rule | Exception |
|---------|------|-----------|
| **Peptide length** | 8-11 amino acids | 12mer possible for some alleles |
| **Anchor positions** | Position 2 (P2) and C-terminal (PΩ) | Some alleles use P1, P3 |
| **P2 anchor** | HLA-A*02:01 → L/M/V; A*24:02 → Y/F | Check allele-specific motifs |
| **PΩ anchor** | HLA-A*02:01 → V/L/I; A*24:02 → F/L/I | Hydrophobic preferred |
| **Binding groove** | Closed at both ends | Fixed length requirement |

### MHC-II Binding Rules

| Feature | Rule | Note |
|---------|------|------|
| **Peptide length** | 13-25 amino acids | Core 9mer + flanking |
| **Open groove** | Both ends open | Variable length |
| **Core 9mer** | P1, P4, P6, P9 are anchor positions | Register-dependent |
| **Binding register** | Multiple possible registers | Predict all registers |
| **Challenge** | Less accurate than MHC-I | AUC ~0.75-0.88 vs 0.85-0.95 |

## Immune Response Simulation

| Tool | Type | Output | Strengths | Limitations |
|------|------|--------|-----------|-------------|
| **C-ImmSim** | Agent-based | Immune cell dynamics over time | Comprehensive; visual | Simplified; not validated for all scenarios |
| **ImmuneSIM** | Stochastic | Antibody/TCR repertoire | Repertoire-level | Not antigen-specific |
| **SIMIAN** | Network | Cytokine dynamics | Cytokine storm modeling | Limited cell types |
| **SIS** | ODE-based | Population-level immunity | Epidemiological coupling | Not individual-level |

## Vaccine Adjuvant Selection

| Adjuvant | Type | Mechanism | Best For | Approved Vaccines |
|----------|------|-----------|----------|-------------------|
| **Alum (Al(OH)₃)** | Mineral salt | Th2; depot effect | Antibody response | DTaP; HepB; HPV |
| **MF59** | Oil-in-water emulsion | Th1+Th2; recruitment | Pandemic; elderly | Fluad (influenza) |
| **AS01** | Liposome + MPL + QS21 | Strong cellular + humoral | Cellular immunity needed | Shingrix; Mosquirix |
| **AS03** | Oil-in-water emulsion | Th1+Th2; antigen sparing | Pandemic | Prepandrix (H5N1) |
| **CpG 1018** | TLR9 agonist | Th1; B-cell activation | Chronic infections | Heplisav-B (HepB) |
| **Matrix-M** | Saponin-based | Th1+Th2; T-cell | Broad immunity | Novavax COVID-19 |
| **Poly(I:C)** | TLR3 agonist | Th1; cross-presentation | Cancer vaccines | Research use |
| **GM-CSF** | Cytokine | DC maturation | Cancer vaccines | Sipuleucel-T (prostate) |

## Immunoinformatics Quality Checklist

| Item | Required | Common Failure |
|------|----------|---------------|
| HLA allele coverage > 80% target population | ✅ | Single allele only |
| Both MHC-I and MHC-II epitopes | ✅ | Only MHC-I predicted |
| Allergenicity assessment | ✅ | Not checked |
| Toxicity assessment | ✅ | Not checked |
| Cross-reactivity with human proteome | ✅ | Autoimmunity risk |
| Conservation across strains | ✅ | Strain-specific only |
| Population coverage calculation | ✅ | Not reported |
| Differential binding (neoantigen: mutant vs WT) | ✅ | Not comparing to WT |
| RNA expression confirmation (neoantigen) | ✅ | Including unexpressed |
| Clonality assessment (neoantigen) | 🟡 | Subclonal only |
| Experimental validation plan | ✅ | Computational only |
| Structural modeling of epitope-MHC complex | 🟡 | Not modeled |

---

## mRNA Vaccine Design Methodology

### mRNA Vaccine Design Pipeline

| Step | Action | Tool/Method | Key Decision | Common Error |
|------|--------|------------|-------------|-------------|
| **1. Antigen selection** | Choose immunogen | Literature; structural biology | Full-length vs domain vs epitope string | Selecting non-neutralizing antigen |
| **2. Sequence optimization** | Codon optimization; GC content | DNAworks; IDT codon optimization | GC content 50-60%; avoid rare codons | Non-optimized codons → low expression |
| **3. UTR design** | 5' and 3' UTR selection | UTRdb; literature-derived UTRs | α/β-globin UTRs (standard); custom UTRs | Weak UTR → poor translation |
| **4. Cap structure** | 5' cap selection | CleanCap (triphosphate); ARCA | Cap1 (standard); Cap2 (more stable) | No cap → rapid degradation |
| **5. Poly(A) tail** | Tail length optimization | Template-encoded; enzymatic | 100-150 nt; segmented (A30-linker-A70) | Too short → reduced stability |
| **6. Modified nucleosides** | N1-methylpseudouridine (m1Ψ) | Standard for therapeutic mRNA | m1Ψ (reduces innate immunity) | Unmodified U → TLR activation |
| **7. LNP formulation** | Lipid nanoparticle design | MC3; SM-102; ALC-0315 | Ionizable lipid + helper lipids | Non-optimized LNP → poor delivery |
| **8. In vitro validation** | Expression + immunogenicity | Western blot; ELISA; neutralization | Confirm protein expression | No expression validation |
| **9. In vivo immunogenicity** | Animal model | Mouse; NHP | Antibody titer; T-cell response | No functional immunity assay |

### LNP Formulation Design

| Component | Function | Typical % (mol) | Key Properties | Example |
|-----------|----------|-----------------|----------------|---------|
| **Ionizable lipid** | Endosomal escape; mRNA complexation | 40-50% | pKa 6.2-6.5; biodegradable | SM-102 (Moderna); ALC-0315 (Pfizer) |
| **DSPC** | Structural lipid | 10% | Bilayer stability | Standard |
| **Cholesterol** | Membrane stability; fluidity | 38-40% | Enhances stability | Standard |
| **PEG-lipid** | Stealth; prevents aggregation | 1.5-2% | Circulation time; size control | PEG2000-DMG; ALC-0159 |

### mRNA Vaccine Stability

| Parameter | Target | Impact | Optimization |
|-----------|--------|--------|-------------|
| **Storage temperature** | -20°C to 2-8°C | Cold chain logistics | Lyophilization; optimized LNP |
| **In-vial stability** | >6 months at storage temp | Shelf life | Antioxidants; buffer optimization |
| **Thaw stability** | Stable after 1-5 thaw cycles | Clinical use | Minimize freeze-thaw |
| **Dilution stability** | Stable 6-12h post-dilution | Administration window | Formulation buffer |

**Rule**: mRNA vaccine immunogenicity is DOMINATED by the encoded antigen, not the mRNA chemistry. Optimizing UTRs and codons improves EXPRESSION, but a poorly chosen antigen will still fail regardless of mRNA optimization.
**Rule**: LNP formulation is the KEY DELIVERY TECHNOLOGY. The same mRNA in different LNPs can have 10-100× different expression levels and tissue distribution.
**Rule**: Modified nucleosides (m1Ψ) are ESSENTIAL to avoid innate immune sensing that would degrade the mRNA before translation. Unmodified mRNA triggers TLR3/7/8 and RIG-I, leading to translation shutdown.

---

## Cancer Vaccine Clinical Trial Design

### Cancer Vaccine Trial Design Considerations

| Aspect | Standard Drug Trial | Cancer Vaccine Trial | Key Difference |
|--------|--------------------|---------------------|---------------|
| **Patient selection** | Biomarker-positive | Neoantigen-positive + HLA-matched | Requires personalized manufacturing |
| **Control arm** | Placebo/standard | Placebo + adjuvant (ethical) | Adjuvant alone as control |
| **Primary endpoint** | ORR/PFS/OS | PFS/OS (delayed effect) | Immune response takes time |
| **Response kinetics** | Immediate (weeks) | Delayed (months) | Standard RECIST may miss responses |
| **Sample size** | Standard power calculation | Larger (smaller effect size; delayed separation) | Underpowered trials common |
| **Manufacturing** | Mass-produced | Patient-specific (neoantigen) | Each patient = new product |
| **Statistical design** | Standard | Bayesian adaptive; platform | Small N per patient |

### Immune Response Assessment in Vaccine Trials

| Assay | Purpose | Timepoint | Interpretation |
|-------|---------|-----------|---------------|
| **ELISpot (IFN-γ)** | T-cell response | Baseline, post-vaccination, follow-up | >2× baseline; >50 SFC/10⁶ PBMC |
| **Intracellular cytokine staining** | T-cell phenotype | Same as ELISpot | CD8+ IFN-γ+; polyfunctional |
| **Tetramer staining** | Antigen-specific T cells | Same | Frequency of epitope-specific T cells |
| **Serum antibody** | Humoral response | Same | Neutralizing titer; IgG subclass |
| **TCR sequencing** | Clonal expansion | Same | New clones; expanded clones |
| **DTH skin test** | In vivo response | Post-vaccination | Induration > 5mm |

### Neoantigen Vaccine Manufacturing Timeline

| Step | Duration | Bottleneck | Optimization |
|------|----------|-----------|-------------|
| **Tumor biopsy + sequencing** | 1-2 weeks | Tissue acquisition; sequencing queue | Rapid WES pipeline |
| **Variant calling + HLA typing** | 2-3 days | Bioinformatics pipeline | Automated pipeline |
| **Neoantigen prediction** | 1-2 days | Computational; ranking | Pre-validated pipeline |
| **mRNA synthesis** | 3-5 days | GMP manufacturing slot | Modular GMP facility |
| **Quality control** | 2-3 days | Release testing | Rapid QC methods |
| **Total** | 3-5 weeks | Manufacturing is the bottleneck | Pre-positioned capacity |

**Rule**: Cancer vaccine trials MUST account for DELAYED IMMUNE EFFECTS. PFS curves may not separate until 6-12 months. Short follow-up will miss the benefit.
**Rule**: Neoantigen vaccines are PERSONALIZED — each patient gets a unique product. This makes standard RCT design challenging. Consider Bayesian adaptive designs with shared control arms.
**Rule**: iRECIST (immune-related RECIST) should be used for cancer vaccine trials, not standard RECIST. Pseudoprogression (initial growth followed by response) occurs in 5-10% of immunotherapy patients.

---

## Epitope-Based Diagnostics

### T-Cell Based Diagnostics (IGRA/Tuberculin)

| Test | Principle | Sensitivity | Specificity | Advantage | Limitation |
|------|-----------|------------|------------|-----------|-----------|
| **TST** (Tuberculin Skin Test) | Delayed-type hypersensitivity | 75-90% | 50-80% | Simple; cheap | BCG cross-reactivity; reader variability |
| **IGRA** (QuantiFERON-TB Gold) | IFN-γ release from T cells | 80-95% | 95-99% | BCG-independent; single visit | Cost; lab requirement; indeterminate results |
| **T-SPOT.TB** | ELISpot for TB-specific T cells | 85-95% | 90-97% | Better in immunocompromised | More complex; expensive |

### Emerging Epitope-Based Diagnostics

| Application | Method | Biomarker | Stage | Key Challenge |
|-------------|--------|-----------|-------|---------------|
| **COVID-19 exposure** | Peptide pool ELISpot | SARS-CoV-2-specific T cells | Clinical use | Distinguishing infection vs vaccination |
| **Cancer immune monitoring** | TCR sequencing + epitope mapping | Tumor-reactive TCRs | Research | Defining tumor-reactive vs by-stander TCRs |
| **Autoimmune disease** | MHC tetramer + autoantigen panel | Autoreactive T cells | Research | Low frequency; tissue inaccessibility |
| **Transplant rejection** | Donor-specific antibody + T cell | Alloreactive T cells | Research | Donor antigen availability |
| **Allergy** | Epitope mapping (linear/conformational) | IgE-binding epitopes | Clinical use | Cross-reactivity interpretation |

---

## Immunoinformatics Quality Checklist (Extended)

| Item | Required | Common Failure |
|------|----------|---------------|
| HLA allele coverage > 80% target population | ✅ | Single allele only |
| Both MHC-I and MHC-II epitopes | ✅ | Only MHC-I predicted |
| Allergenicity assessment | ✅ | Not checked |
| Toxicity assessment | ✅ | Not checked |
| Cross-reactivity with human proteome | ✅ | Autoimmunity risk |
| Conservation across strains | ✅ | Strain-specific only |
| Population coverage calculation | ✅ | Not reported |
| Differential binding (neoantigen: mutant vs WT) | ✅ | Not comparing to WT |
| RNA expression confirmation (neoantigen) | ✅ | Including unexpressed |
| Clonality assessment (neoantigen) | 🟡 | Subclonal only |
| Experimental validation plan | ✅ | Computational only |
| Structural modeling of epitope-MHC complex | 🟡 | Not modeled |
| mRNA codon optimization with GC content 50-60% | ✅ | Non-optimized sequence |
| Modified nucleosides (m1Ψ) specified | ✅ | Unmodified U → TLR activation |
| LNP formulation components specified | ✅ | No delivery system defined |
| Cancer vaccine trial accounts for delayed immune effect | ✅ | Short follow-up only |
| iRECIST criteria for immunotherapy trials | ✅ | Standard RECIST only |
| Neoantigen manufacturing timeline realistic (3-5 weeks) | ✅ | No manufacturing consideration |
| Immune response assay panel defined (ELISpot + ICS + tetramer) | ✅ | Single assay only |
| Epitope conservation across target pathogen strains | ✅ | Single strain only |
