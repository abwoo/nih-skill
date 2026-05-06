# Drug Discovery, Repurposing & Pharmacology Methodology

## Drug Repurposing Strategies

### Three Pillars of Drug Repurposing

| Strategy | Principle | Data Sources | Success Rate | Example |
|----------|-----------|-------------|-------------|---------|
| **Target-based** | Same target → different disease | ChEMBL, BindingDB, OpenTargets | Moderate | Sildenafil (PDE5: PA → ED) |
| **Compound-based** | Similar structure → similar activity | DrugBank, PubChem, ZINC | Low-Moderate | Thalidomide analogs |
| **Disease-based** | Shared pathways between diseases | KEGG, Reactome, GWAS Catalog | Moderate | Metformin (diabetes → cancer) |

### Target-Based Repurposing Pipeline

```
Disease of Interest
    │
    ├─ Identify disease-associated targets (GWAS, expression, pathways)
    │   ├─ GWAS Catalog → trait-to-gene mapping
    │   ├─ Open Targets → target-disease associations
    │   └─ DEGs from RNA-seq → upregulated targets
    │
    ├─ Find drugs targeting those genes/proteins
    │   ├─ ChEMBL → bioactivity data (IC50, Ki)
    │   ├─ DrugBank → approved drugs with target info
    │   └─ Open Targets → target-to-drug mapping
    │
    ├─ Filter by druggability & safety
    │   ├─ Is target druggable? (enzyme, GPCR, kinase → YES; TF → HARD)
    │   ├─ Is drug already approved? (faster path to clinic)
    │   └─ Safety profile from FAERS/label data
    │
    └─ Validate computationally & experimentally
        ├─ Network pharmacology → pathway analysis
        ├─ In silico docking → binding prediction
        └─ Cell/animal validation → efficacy confirmation
```

### Disease-Based Repurposing via GWAS

| Step | Method | Tool/Database | Output |
|------|--------|--------------|--------|
| 1 | Identify GWAS loci for target disease | GWAS Catalog, Open Targets Genetics | Lead SNPs + genes |
| 2 | Locus-to-gene mapping | L2G (Open Targets), MAGMA, S-PrediXcan | Causal gene per locus |
| 3 | Druggability assessment | DGIdb, Open Targets Platform | Druggable targets |
| 4 | Identify existing drugs | ChEMBL, DrugBank, ClinicalTrials.gov | Approved/investigational drugs |
| 5 | Prioritize by evidence | Multi-criteria scoring | Ranked repurposing candidates |

### Repurposing Assessment Framework

| Assessment | Key Question | Required Evidence | Red Flag |
|-----------|-------------|-------------------|---------|
| **Target validity** | Is the target causally linked to the disease? | GWAS, Mendelian randomization, functional studies | Only expression correlation |
| **Drug-target affinity** | Does the drug actually hit the target at achievable concentrations? | IC50/Ki < achievable plasma concentration | In vitro affinity only (no PK data) |
| **Safety in new population** | Is the drug safe for the new indication's patient population? | Phase I/II safety data; FAERS analysis | Different population than original approval |
| **Dose feasibility** | Can the repurposed dose achieve therapeutic effect? | PK/PD modeling; exposure-response | Requires dose > approved maximum |
| **Regulatory pathway** | Is there a clear regulatory path? | 505(b)(2) eligibility; new indication filing | Requires new clinical trials from scratch |

**Rule**: Drug repurposing is NOT "just try an approved drug for a new disease." It requires the SAME level of target validation and clinical evidence as de novo drug development — the only shortcut is safety data.
**Rule**: A repurposing candidate without Mendelian randomization or genetic evidence for the target-disease link is SPECULATIVE (L1-L2). Genetic evidence upgrades to L3+.
**Rule**: The most successful repurposing cases have a CLEAR MECHANISTIC rationale, not just computational correlation. Sildenafil works because PDE5 is directly involved in both PA and ED pathophysiology.

---

## Drug-Drug Interaction (DDI) Prediction

### DDI Mechanism Classification

| Mechanism | Enzyme/Transporter | Severity | Example | Management |
|-----------|-------------------|----------|---------|-----------|
| **CYP3A4 inhibition** | CYP3A4 | Major | Ketoconazole + Simvastatin → rhabdomyolysis | Avoid combination |
| **CYP2D6 inhibition** | CYP2D6 | Moderate | Fluoxetine + Codeine → reduced analgesia | Alternative analgesic |
| **CYP2C19 inhibition** | CYP2C19 | Moderate | Omeprazole + Clopidogrel → reduced antiplatelet | Switch PPI |
| **P-gp inhibition** | P-glycoprotein | Major | Verapamil + Digoxin → digoxin toxicity | Monitor levels |
| **CYP3A4 induction** | CYP3A4 | Major | Rifampin + Oral contraceptives → contraceptive failure | Alternative contraception |
| **CYP1A2 induction** | CYP1A2 | Moderate | Smoking + Theophylline → reduced efficacy | Dose adjustment |
| **Transporter competition** | OATP1B1 | Moderate | Gemfibrozil + Statins → statin toxicity | Avoid combination |
| **Pharmacodynamic** | Receptor/Channel | Variable | SSRIs + MAOIs → serotonin syndrome | Absolute contraindication |

### Polypharmacy DDI Assessment Protocol

```
Patient Medication List (3+ drugs)
    │
    ├─ Extract all active ingredients
    │
    ├─ For each pair, check:
    │   ├─ CYP450 interactions (inhibition/induction)
    │   ├─ Transporter interactions (P-gp, OATP, BCRP)
    │   ├─ Pharmacodynamic interactions (additive/opposing effects)
    │   └─ Protein binding displacement
    │
    ├─ Classify severity: Contraindicated / Major / Moderate / Minor
    │
    ├─ For contraindicated/major interactions:
    │   ├─ Suggest alternative medication
    │   ├─ Recommend monitoring if no alternative
    │   └─ Document clinical rationale
    │
    └─ Generate DDI report with:
        ├─ Interaction matrix (N×N)
        ├─ Risk summary by severity
        └─ Recommended actions
```

**Rule**: Polypharmacy (3+ drugs) DDI assessment must be PAIRWISE, not just additive. Three drugs with moderate pairwise interactions may create a SEVERE three-way interaction.
**Rule**: CYP3A4 is involved in the metabolism of >50% of drugs. Any DDI assessment MUST include CYP3A4 evaluation.
**Rule**: Pharmacodynamic DDIs (e.g., serotonin syndrome from SSRI + MAOI) can be MORE DANGEROUS than pharmacokinetic DDIs because they are harder to predict from enzyme data alone.

---

## Pharmacovigilance & Signal Detection

### Signal Detection Methods

| Method | Data Source | Metric | Threshold | Limitation |
|--------|-----------|--------|-----------|-----------|
| **PRR** (Proportional Reporting Ratio) | FAERS | PRR = (a/(a+b)) / (c/(c+d)) | PRR > 2, χ² > 4, N ≥ 3 | Affected by reporting bias |
| **ROR** (Reporting Odds Ratio) | FAERS | ROR = (a×d) / (b×c) | Lower 95% CI > 1 | Same as PRR |
| **BCPNN** (Bayesian Confidence Propagation) | WHO VigiBase | IC (Information Component) | IC025 > 0 | Conservative; slow signal detection |
| **MGPS** (Multi-item Gamma Poisson Shrinker) | FAERS | EB05 (Empirical Bayes) | EB05 > 2 | Shrinks signals for rare events |
| **Disproportionality + Clinical Review** | FAERS + Literature | PRR/ROR + case review | Statistical + clinical significance | Requires clinical expertise |

### Pharmacovigilance Signal Assessment Protocol

| Step | Action | Tool/Source | Output |
|------|--------|-----------|--------|
| 1 | Statistical signal detection | FAERS, VigiBase | PRR, ROR, EB05 |
| 2 | Clinical case review | Literature, case reports | Causality assessment (Naranjo) |
| 3 | Biological plausibility | Drug mechanism, target, pathway | Mechanistic rationale |
| 4 | Temporal assessment | Time-to-onset analysis | Consistent temporal relationship? |
| 5 | Dechallenge/rechallenge | Case reports | Positive dechallenge = stronger signal |
| 6 | Risk factor identification | Subgroup analysis | Populations at highest risk |
| 7 | Regulatory action | FDA/EMA assessment | Label change, REMS, withdrawal |

### Naranjo Adverse Drug Reaction Probability Scale

| Question | Yes (+1) | No (0) | DK (0) |
|----------|----------|--------|--------|
| Are there previous conclusive reports? | +1 | 0 | 0 |
| Did the AE appear after the drug was given? | +2 | -1 | 0 |
| Did the AE improve when drug discontinued? | +1 | 0 | 0 |
| Did the AE reappear on re-administration? | +2 | -1 | 0 |
| Are there alternative causes? | -1 | +2 | 0 |
| Did the AE occur with placebo? | -1 | +1 | 0 |
| Was the drug detected in toxic concentration? | +1 | 0 | 0 |
| Was the AE more severe with higher dose? | +1 | 0 | 0 |
| Was there a similar AE to a similar drug? | +1 | 0 | 0 |
| Was the AE confirmed by objective evidence? | +1 | 0 | 0 |

**Scoring**: ≥9 = Definite; 5-8 = Probable; 1-4 = Possible; ≤0 = Doubtful

**Rule**: PRR/ROR alone is INSUFFICIENT for pharmacovigilance signal confirmation. Statistical disproportionality must be combined with clinical case review and biological plausibility.
**Rule**: FAERS data is subject to REPORTING BIAS — not all ADRs are reported, and reporting rates vary by drug, time, and publicity. Never equate FAERS frequency with true incidence.
**Rule**: Pharmacogenomic DDIs (e.g., CYP2D6 poor metabolizers + codeine → morphine overdose) are OFTEN MISSING from standard DDI databases. Always check pharmacogenomic interactions separately.

---

## Target Intelligence & Validation

### Target Assessment Framework

| Dimension | Assessment | Data Source | Decision Criteria |
|-----------|-----------|-------------|-------------------|
| **Genetic evidence** | Does genetic variation in target affect disease? | GWAS, UK Biobank, FinnGen | OR > 1.5; p < 5×10⁻⁸ |
| **Expression evidence** | Is target expressed in disease-relevant tissue? | GTEx, HPA, scRNA-seq | Tissue-specific expression |
| **Pathway evidence** | Is target in disease-relevant pathway? | KEGG, Reactome, WikiPathways | Key pathway node |
| **Druggability** | Can a drug modulate this target? | DGIdb, CanSar, Open Targets | Enzyme/GPCR/ion channel = YES; TF = HARD |
| **Safety** | What happens when target is inhibited/activated? | Knockout mice, CRISPR screens, FAERS | Essential gene = risky target |
| **Competition** | Are other companies targeting this? | ClinicalTrials.gov, patent databases | Crowded = harder; novel = riskier |
| **Biomarker** | Is there a measurable biomarker for target engagement? | Literature, assay databases | PK/PD biomarker available |

### Target-to-Drug Pipeline

| Stage | Activity | Success Rate | Key Question |
|-------|----------|-------------|-------------|
| **Target ID** | Genetic/functional evidence | ~1000 candidates | Is the target causally linked to disease? |
| **Target validation** | CRISPR, RNAi, chemical probes | ~100 advance | Does modulating the target affect disease? |
| **Hit identification** | HTS, virtual screening, fragment-based | ~50 hits | Does any compound bind the target? |
| **Hit-to-lead** | SAR, optimization, ADMET | ~5 leads | Can we improve potency and drug-likeness? |
| **Lead optimization** | PK/PD, toxicology, scale-up | ~1-2 candidates | Is it ready for clinical testing? |
| **Clinical development** | Phase I → II → III | ~10% success | Is it safe and effective in humans? |

**Rule**: The #1 reason for drug development failure is LACK OF TARGET VALIDATION, not chemistry. Invest in target validation BEFORE hit identification.
**Rule**: Genetic evidence (GWAS, Mendelian randomization) is the STRONGEST form of target validation. Targets with genetic support have 2× higher probability of clinical success.
**Rule**: A "druggable genome" analysis shows only ~3,000 of ~20,000 human proteins are druggable with current modalities. If your target is not druggable, consider PROTACs, RNA therapeutics, or gene therapy instead of small molecules.

---

## Drug Research Profiling

### Comprehensive Drug Profile Structure

| Section | Content | Data Sources |
|---------|---------|-------------|
| **Identity** | Generic name, brand names, ATC code, molecular formula | DrugBank, ChEMBL |
| **Mechanism** | Target, MoA, signaling pathway | DrugBank, Open Targets |
| **Pharmacokinetics** | ADME, bioavailability, half-life, protein binding | Drug labels, literature |
| **Pharmacogenomics** | CYP metabolizer status, PGx associations | CPIC, PharmGKB |
| **Clinical Trials** | Phase, indication, status, results | ClinicalTrials.gov |
| **Safety** | Black box warnings, contraindications, FAERS signals | FDA labels, FAERS |
| **ADMET** | Absorption, distribution, metabolism, excretion, toxicity | ADMETlab, pkCSM |
| **Interactions** | DDI, food interactions, lab interactions | DrugBank, DDI databases |
| **Regulatory** | Approval status, patent expiry, exclusivity | FDA Orange Book |
| **Comparative** | Alternatives, cost-effectiveness | NICE, ICER reports |

### ADMET Assessment Protocol

| Property | Metric | Acceptable Range | Prediction Tool |
|----------|--------|-----------------|----------------|
| **Absorption** | Caco-2 permeability, HIA | >80% HIA | pkCSM, ADMETlab |
| **Distribution** | VDss, BBB penetration | Disease-dependent | pkCSM |
| **Metabolism** | CYP substrate/inhibitor profile | No major CYP inhibition | WhichCyp, pkCSM |
| **Excretion** | Total clearance, renal clearance | Consistent with dosing interval | pkCSM |
| **Toxicity** | hERG inhibition, AMES, hepatotoxicity | No hERG; no AMES positive | pkCSM, Tox21 |

**Rule**: A drug profile without pharmacogenomic information is INCOMPLETE for clinical use. CYP2D6 and CYP2C19 polymorphisms affect >30% of all prescribed drugs.
**Rule**: Black box warnings are the STRONGEST safety signal. Any AI recommending a drug MUST check for black box warnings and contraindications before suggesting.

---

## AI-Driven Drug Discovery

### AI Drug Discovery Pipeline

| Stage | AI Method | Input | Output | Success Metric | Key Challenge |
|-------|----------|-------|--------|---------------|---------------|
| **Target ID** | Knowledge graph; NLP | Literature, omics data | Novel targets | Genetic evidence | Data completeness |
| **Target validation** | CRISPR prediction; network analysis | Gene essentiality | Validated targets | Functional validation | Context-dependency |
| **Hit identification** | Virtual screening; generative models | Target structure | Hit compounds | Hit rate > 1% | Scoring accuracy |
| **Hit-to-lead** | Molecular optimization; QSAR | Hit structures | Lead compounds | Potency improvement | Multi-parameter optimization |
| **Lead optimization** | MPO with ADMET prediction | Lead structures | Clinical candidates | Drug-likeness + potency | ADMET prediction accuracy |
| **Clinical trial design** | Patient stratification; endpoint prediction | Clinical data | Optimized protocol | Trial success probability | Real-world generalizability |

### Virtual Screening Methods

| Method | Type | Throughput | Accuracy | Cost | Best For |
|--------|------|-----------|----------|------|----------|
| **Structure-based docking** | Physics-based | 10⁶-10⁷ compounds | Moderate | Moderate | Known target structure |
| **Pharmacophore screening** | Feature-based | 10⁶-10⁷ | Moderate | Low | Known SAR; feature definition |
| **Shape-based screening** | 3D similarity | 10⁶-10⁷ | Moderate | Low | Known active compound |
| **ML scoring functions** | Learned scoring | 10⁶-10⁷ | Moderate-High | Moderate | Improve docking accuracy |
| **Deep docking** | CNN on docking poses | 10⁸-10⁹ | Moderate | Low | Ultra-large library screening |
| **FBDD (fragment-based)** | Fragment growing/linking | 10³-10⁴ fragments | High | High | Novel chemical space |

### Molecular Generation Models

| Model | Architecture | Input | Output | Key Innovation | Limitation |
|-------|-------------|-------|--------|---------------|-----------|
| **REINVENT** | RNN + RL | SMILES; objective | Optimized molecules | Multi-objective RL | SMILES validity issues |
| **GraphINVENT** | GNN | Graph representation | Novel graphs | Direct graph generation | Scalability |
| **DiffDock** | Diffusion model | Protein + ligand | 3D pose | Flexible docking | Computationally expensive |
| **TargetDiff** | Diffusion | Protein pocket | 3D molecules | Pocket-aware generation | Limited diversity |
| **MolGPT** | Transformer | SMILES | Novel SMILES | Language model approach | Validity rate |
| **ChemRL** | RL + GNN | Molecular graph | Optimized graph | Multi-property optimization | Reward hacking |
| **PBM** | Flow matching | 3D pocket | 3D molecules | SOTA 3D generation | New; limited validation |

### AI Drug Discovery Assessment

| Assessment | Key Question | Required Evidence | Red Flag |
|-----------|-------------|-------------------|---------|
| **Novelty** | Is the molecule genuinely novel? | Tanimoto < 0.4 to known actives | Close analog of known drug |
| **Synthesizability** | Can it be made? | SA score < 6; retrosynthesis plan | SA score > 8; no synthetic route |
| **Selectivity** | Is it selective for the target? | Off-target panel; selectivity ratio > 10× | No selectivity data |
| **ADMET** | Is it drug-like? | Predicted ADMET within acceptable ranges | Multiple ADMET violations |
| **Experimental validation** | Has it been tested? | In vitro IC50/KD; cell-based assay | Computational-only claims |
| **Clinical relevance** | Does it address unmet need? | Disease rationale; target validation | "Me-too" without advantage |

**Rule**: AI-generated molecules are STARTING POINTS, not drugs. The gap between computational hit and clinical candidate requires 2-5 years of medicinal chemistry optimization.
**Rule**: Virtual screening hit rates are typically 1-5%. Claims of >10% hit rate suggest overfitting or trivially similar compounds to the training set.
**Rule**: Molecular generation models can produce VALID SMILES that are UNSYNTHESIZABLE. Always check synthesizability (SA score, retrosynthesis planning) before prioritizing AI-generated molecules.

---

## PROTAC & Molecular Glue Design

### Targeted Protein Degradation Comparison

| Modality | Mechanism | Target Scope | Molecular Weight | Oral Bioavailability | Example |
|----------|-----------|-------------|-----------------|---------------------|---------|
| **PROTAC** | E3 ligase recruiter + target binder + linker | Any protein with binder | 700-1200 Da | Challenging (large) | ARV-110 (androgen receptor) |
| **Molecular glue** | Stabilize E3-target interaction | Limited (serendipitous) | 300-500 Da | Good (small molecule) | Lenalidomide, Pomalidomide |
| **AUTAC** | Autophagy-mediated degradation | Cytosolic proteins | ~800 Da | Unknown | Research stage |
| **LYTAC** | Lysosome-mediated degradation | Extracellular proteins | Large (antibody-based) | No (injectable) | Research stage |
| **DAC** (Degradation-Antibody Conjugate) | Antibody-delivered PROTAC | Tissue-specific | Very large | No (injectable) | Research stage |

### PROTAC Design Framework

| Component | Design Consideration | Options | Key Trade-off |
|-----------|---------------------|---------|---------------|
| **Target binder (warhead)** | Affinity; selectivity; binding site | Known inhibitor; fragment; covalent | Potency vs size |
| **E3 ligase recruiter** | Which E3 ligase? | VHL, CRBN, MDM2, IAP, DCAF15 | Tissue expression; resistance profile |
| **Linker** | Length; composition; rigidity | PEG, alkyl, triazole, rigid linkers | Flexibility vs cell permeability |
| **Linker attachment** | Exit vector; position on warhead | Structure-guided; SAR-driven | Ternary complex formation |
| **Cooperativity** | Ternary complex stability | α = Kbinary/Kternary | α > 1 = positive cooperativity |

### PROTAC Quality Assessment

| Property | Metric | Acceptable | Assessment Method |
|----------|--------|-----------|-------------------|
| **Ternary complex formation** | Cooperativity α | α > 1 | SPR, ITC, TR-FRET |
| **Degradation DC50** | Concentration for 50% degradation | < 100 nM | Western blot; NanoBRET |
| **Dmax** | Maximum degradation | > 80% | Western blot |
| **Hook effect** | Concentration where degradation decreases | > 10× DC50 | Dose-response curve |
| **Selectivity** | Off-target degradation | Minimal | Proteomics (TurboID) |
| **Cell permeability** | PAMPA; Caco-2 | Moderate | PAMPA; MDCK |
| **In vivo PK** | Oral F%; half-life | F% > 10%; t½ > 2h | Rat PK study |

**Rule**: PROTACs follow a HOOK EFFECT — at high concentrations, binary complexes (PROTAC-target or PROTAC-E3) dominate over ternary complexes, REDUCING degradation. Always test a wide dose range.
**Rule**: PROTAC DC50 is NOT the same as inhibitor IC50. A PROTAC with weak binding (IC50 = 1 μM) can be an effective degrader (DC50 = 10 nM) if the ternary complex is highly cooperative.
**Rule**: Molecular glues are DISCOVERED, not designed (currently). Rational design of molecular glues is an active research area but has NOT yet produced clinical candidates de novo.

---

## Real-World Evidence (RWE) for Drug Assessment

### RWE Evidence Hierarchy

| Level | Evidence Type | Strength | Example | Regulatory Acceptance |
|-------|-------------|----------|---------|----------------------|
| **Level 1** | RCT with RWE external control | Strong | RCT + EHR-matched control | FDA accepted (e.g., Bavencio) |
| **Level 2** | Pragmatic clinical trial | Strong-Moderate | Salford Lung Study | Growing acceptance |
| **Level 3** | Registry-based study with propensity matching | Moderate | National cancer registry studies | Accepted for safety signals |
| **Level 4** | EHR-based cohort study | Moderate-Weak | Retrospective EHR analysis | Accepted for hypothesis generation |
| **Level 5** | Claims database analysis | Weak | Insurance claims studies | Accepted for utilization/safety |
| **Level 6** | Case series / single-arm + RWE | Weak | Single-arm + historical control | Accepted in rare diseases |

### RWE Study Design Assessment

| Assessment | Key Question | Required Evidence | Red Flag |
|-----------|-------------|-------------------|---------|
| **Data quality** | Is the RWD source reliable? | Validation against gold standard | Unvalidated claims codes |
| **Confounding** | Are confounders adequately controlled? | Propensity score; IPTW; DAG | No confounding adjustment |
| **Immortal time bias** | Is immortal time handled correctly? | Time-zero definition; landmark analysis | No immortal time consideration |
| **Misclassification** | Is exposure/outcome accurately measured? | Algorithm validation; PPV > 80% | Unvalidated outcome definition |
| **Generalizability** | Does RWE population match target? | Demographic comparison | RWE from different healthcare system |
| **Sample size** | Is the study adequately powered? | Power calculation with effect size | Underpowered negative study |

**Rule**: RWE can SUPPORT but generally cannot REPLACE RCT evidence for regulatory approval. The FDA accepts RWE for label expansions, post-marketing commitments, and rare disease approvals, but NOT for initial approval of novel therapeutics (with rare exceptions).
**Rule**: Propensity score matching CANNOT adjust for UNMEASURED CONFOUNDERS. An RWE study without sensitivity analysis for unmeasured confounding (E-value, Rosenbaum bounds) is incomplete.
**Rule**: EHR data is collected for CLINICAL CARE, not research. Missing data, misclassification, and selection bias are INHERENT. Always validate exposure and outcome definitions against manual chart review.

---

## Drug Discovery & Pharmacology Quality Checklist

| Item | Required | Common Failure |
|------|----------|---------------|
| Target validation with genetic evidence (GWAS/MR) | ✅ | Expression correlation only |
| Druggability assessment before screening | ✅ | Undruggable target (e.g., TF) without alternative strategy |
| Multi-parameter optimization (potency + ADMET + selectivity) | ✅ | Optimizing potency alone |
| Selectivity panel (>10 off-targets) | ✅ | No selectivity data |
| ADMET prediction before synthesis | ✅ | Synthesizing non-drug-like molecules |
| Synthesizability assessment (SA score < 6) | ✅ | AI-generated unsynthesizable molecules |
| DDI assessment including pharmacogenomic interactions | ✅ | CYP-only DDI assessment |
| Black box warning check before recommendation | ✅ | Ignoring contraindications |
| Pharmacogenomic profile included in drug profile | ✅ | No CYP metabolizer information |
| Repurposing candidate has genetic evidence for target-disease link | ✅ | Computational correlation only |
| RWE confounding adequately controlled | ✅ | No propensity score or adjustment |
| PROTAC ternary complex cooperativity measured | ✅ | Binary binding data only |
| Molecular glue discovered (not claimed as designed) | ✅ | Claiming rational glue design |
| Clinical trial feasibility with realistic enrollment projection | ✅ | 5-10× overestimate |
| Competitive landscape assessed for target space | ✅ | Unaware of competing programs |
