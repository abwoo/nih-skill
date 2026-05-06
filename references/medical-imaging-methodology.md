# Medical Imaging Methodology Authority Framework

## Reference Index

| ID | Paper | Year | PMID | Domain | Authority Level |
|----|-------|------|------|--------|----------------|
| IMG-01 | Rajpurkar et al. — CheXNet: Radiologist-Level Pneumonia Detection | 2017 | — | Chest X-ray DL | ★★★★★ Landmark |
| IMG-02 | Isensee et al. — nnU-Net: A Self-Configuring Method for Deep Learning-Based Segmentation | 2021 | 33288931 | Segmentation | ★★★★★ Landmark |
| IMG-03 | Kirillov et al. — Segment Anything (SAM) | 2023 | — | Foundation Seg | ★★★★★ Landmark |
| IMG-04 | Esteva et al. — Dermatologist-Level Classification of Skin Cancer | 2017 | 28417463 | Dermatology DL | ★★★★★ Landmark |
| IMG-05 | Liu et al. — A Benchmark for Computational Pathology (CLAM) | 2021 | 34017140 | Pathology WSI | ★★★★★ Foundational |
| IMG-06 | Zhou et al. — Models Genesis: Generic Autodidactic Models for 3D Medical Image Segmentation | 2021 | 33128064 | Self-Supervised | ★★★★ Authoritative |
| IMG-07 | Azizi et al. — Robust and Data-Efficient Generalization of Self-Supervised Machine Learning for Diagnostic Imaging | 2021 | 34711956 | Self-Supervised Path | ★★★★ Authoritative |
| IMG-08 | Huang et al. — UNI: Towards Generalizable Pathology Foundation Models | 2024 | — | Path Foundation | ★★★★★ Emerging Landmark |
| IMG-09 | Moor et al. — Foundation Models for Generalist Medical Artificial Intelligence | 2023 | 36827359 | Foundation Model | ★★★★★ Landmark |
| IMG-10 | Chambon et al. — BiomedCLIP: A Multimodal Biomedical Foundation Model | 2024 | — | VLM Medical | ★★★★ Authoritative |

---

## IMG-01: CheXNet — Radiologist-Level Pneumonia Detection

### Citation
Rajpurkar P, Irvin J, Zhu K, et al. CheXNet: Radiologist-Level Pneumonia Detection on Chest X-Rays with Deep Learning. arXiv:1711.05225. 2017.

### Methodology Decomposition

**Core Idea**: A 121-layer DenseNet trained on ChestX-ray14 (112K images, 14 disease labels) achieving radiologist-level pneumonia detection.

**Architecture**:
```
Input: Single-view chest X-ray (224×224, grayscale→3-channel)
  ↓
DenseNet-121 (pretrained on ImageNet)
  ↓
Global Average Pooling → FC → Sigmoid (multi-label)
  ↓
Output: 14 pathology probabilities
```

**Key Technical Decisions**:
1. DenseNet-121 over ResNet: parameter-efficient, feature reuse via dense connections
2. Multi-label (not multi-class): chest X-ray pathologies co-occur
3. Sigmoid output + binary cross-entropy: independent pathology predictions
4. ImageNet pretraining + fine-tuning: standard transfer learning for medical imaging
5. F1 score as primary metric (not AUC): more clinically relevant for imbalanced data

**Performance**: AUC 0.841 for pneumonia; exceeded average radiologist F1 score

**Critical Analysis**:
| Dimension | Rating | Detail |
|-----------|--------|--------|
| Data Quality | 🔴 | ChestX-ray14 labels are NLP-extracted from radiology reports; ~30% label noise |
| Label Noise Impact | 🔴 | NLP labels without manual validation — model may learn label noise patterns |
| Comparison Fairness | 🟡 | Model vs individual radiologists on F1, but radiologists saw images only (no clinical context) |
| External Validation | 🟡 | No external validation at publication; subsequent studies show performance degradation |
| Reproducibility | 🟢 | Code and pretrained weights publicly available |

**Methodological Insight — Why This Matters**:
1. First paper to claim "radiologist-level" on a large chest X-ray dataset — sparked the medical AI revolution
2. The NLP label noise issue became a defining challenge for the field — CheXpert was created specifically to address this
3. Demonstrated that ImageNet pretraining transfers well to medical imaging (contrary to some expectations)
4. The "radiologist-level" claim methodology (F1 comparison) became a standard — and a controversy

**When to Reference This**:
- Baseline comparison for chest X-ray classification
- Understanding NLP label noise impact on medical AI
- Designing multi-label medical image classification systems
- Discussing the "radiologist-level" claim methodology

---

## IMG-02: nnU-Net — Self-Configuring Medical Image Segmentation

### Citation
Isensee F, Jaeger PF, Kohl SAA, et al. nnU-Net: A Self-Configuring Method for Deep Learning-Based Biomedical Image Segmentation. Nat Methods. 2021;18(2):203-211. PMID: 33288931

### Methodology Decomposition

**Core Idea**: A framework that automatically configures all hyperparameters (patch size, batch size, network architecture, preprocessing, postprocessing) based on dataset properties, achieving SOTA without manual tuning.

**Automatic Configuration Pipeline**:
```
Dataset Fingerprint Extraction
  → Image spacing, median shape, class ratios, modality count
  ↓
Rule-Based Configuration
  → Patch size (GPU memory × median shape)
  → Batch size (maximize GPU utilization)
  → Network topology (depth, features per level)
  → Preprocessing (resampling, normalization, cropping)
  → Data augmentation (spatial, intensity)
  → Postprocessing (largest component, etc.)
  ↓
3 U-Net Configurations (2D, 3D fullres, 3D lowres + cascade)
  → Ensemble of best configurations
  ↓
SOTA Segmentation Without Manual Tuning
```

**Key Technical Decisions**:
1. **Dataset fingerprint**: Automatically extracts geometric and intensity statistics
2. **Rule-based configuration**: No hyperparameter search — heuristics derived from medical imaging best practices
3. **3 configurations**: 2D (fast, good for slice-by-slice), 3D fullres (best for 3D context), 3D lowres+cascade (for large structures)
4. **Intensive augmentation**: Rotation, scaling, Gaussian noise, blur, brightness, contrast, gamma, mirroring — all with medical imaging-appropriate ranges
5. **Postprocessing**: Remove all but the largest component per class (simple but effective for connected organs)

**Performance**: Won 33/54 medical segmentation challenges (as of 2021 publication)

**Methodological Insight — Why This Is the Most Important Medical Segmentation Paper**:
1. **Configuration > Architecture**: The key insight is that proper configuration (preprocessing, augmentation, patch size) matters MORE than architectural novelty
2. **Baseline before innovation**: Any new segmentation architecture MUST be compared against nnU-Net as baseline — beating nnU-Net is the minimum bar for claiming improvement
3. **Reproducibility by design**: No manual tuning means anyone can reproduce results by running the same pipeline
4. **Challenge dominance**: nnU-Net's challenge performance proved that most "novel" architectures were not actually better than a well-configured U-Net

**nnU-Net Configuration Rules (for understanding, not manual use)**:

| Parameter | Rule | Rationale |
|-----------|------|-----------|
| Target spacing | Median spacing of dataset | Resample to common resolution |
| Patch size | Largest power-of-2 crop fitting in GPU | Maximize receptive field |
| Batch size | Maximize GPU memory utilization | Larger batch = more stable training |
| Network depth | Based on patch size (each level halves) | Deeper for larger patches |
| Feature count | 32 base, doubling per level | Standard U-Net pattern |
| Resampling | 3rd order spline (images), nearest (labels) | Smooth interpolation for images |
| Normalization | CT: clip to [0.5, 99.5] percentile then z-score; MRI: z-score per patient | Modality-specific normalization |
| Augmentation | 13 spatial + intensity transforms | Prevent overfitting on small datasets |

**Rule**: Any medical image segmentation paper that does NOT compare against nnU-Net is INCOMPLETE. Flag: "⚠️ No nnU-Net baseline — improvement claim is unsubstantiated."
**Rule**: If a new architecture beats nnU-Net by <2 Dice points, the improvement is likely within noise. Require statistical significance testing.
**Rule**: nnU-Net v2 (2024) adds residual U-Net, improved augmentation, and better cascade. Always use v2 for comparisons.

**When to Reference This**:
- ANY medical image segmentation study
- Designing segmentation pipelines for new datasets
- Understanding the importance of configuration vs architecture
- Baseline comparison for novel segmentation architectures
- Medical imaging challenge participation

---

## IMG-03: SAM — Segment Anything Model

### Citation
Kirillov A, Mintun E, Ravi N, et al. Segment Anything. ICCV 2023.

### Methodology Decomposition

**Core Idea**: A foundation model for image segmentation trained on 1.1B masks from 11M images, capable of zero-shot segmentation with various prompts (points, boxes, text).

**Architecture**:
```
Image Encoder: ViT-H (632M params)
  → Produces image embedding
  ↓
Prompt Encoder:
  → Point/box: positional encoding
  → Text: CLIP text encoder
  ↓
Mask Decoder: Lightweight transformer (4 layers)
  → Cross-attention: mask queries attend to image embedding
  → Predicts 3 mask levels (whole, part, subpart)
  ↓
Output: Binary mask(s) + confidence score(s)
```

**SAM for Medical Imaging — Assessment Protocol**:

| Assessment | Key Question | Required Evidence | Red Flag |
|-----------|-------------|-------------------|---------|
| **Zero-shot capability** | Does SAM segment medical structures without fine-tuning? | Dice score on medical datasets without any medical training | Dice <0.5 on standard medical tasks |
| **Prompt sensitivity** | How sensitive is SAM to prompt placement? | Dice variance across different point placements | High variance → unreliable in clinical use |
| **Fine-tuning benefit** | How much does medical fine-tuning improve SAM? | Before/after fine-tuning Dice comparison | <5% improvement → SAM already captures structure |
| **Small structure performance** | Can SAM segment small medical structures (vessels, nodules)? | Dice on small target structures | Poor small structure segmentation |
| **3D capability** | Can SAM handle 3D medical volumes? | 3D segmentation performance | SAM is 2D only; slice-by-slice loses 3D context |
| **Boundary quality** | Are SAM boundaries clinically acceptable? | Boundary Dice / Hausdorff distance | Smooth but inaccurate boundaries |

**SAM Medical Variants**:

| Model | Adaptation | Medical Domain | Performance vs SAM |
|-------|-----------|---------------|-------------------|
| **MedSAM** | Fine-tuned on 1.5M medical masks | General medical | +10-20% Dice on medical structures |
| **SAM-Med2D** | Fine-tuned on 4.6M medical masks | 2D medical imaging | +15-25% Dice; 2D only |
| **SegVol** | 3D adaptation of SAM | CT volumes | 3D capability; competitive with nnU-Net on some tasks |
| **FoundationSAM** | Medical-specific encoder pretraining | General medical | Better feature representations |
| **SkinSAM** | Dermatology-specific fine-tuning | Skin lesions | +20%+ on skin lesion segmentation |

**Rule**: SAM is NOT a replacement for nnU-Net in medical segmentation. SAM excels at interactive/zero-shot segmentation; nnU-Net excels at automatic, task-specific segmentation. Choose based on use case.
**Rule**: For clinical deployment, fine-tuned SAM (MedSAM/SAM-Med2D) is preferred over vanilla SAM. Zero-shot SAM performance on medical images is INSUFFICIENT for clinical use.
**Rule**: SAM's interactive prompting (click-to-segment) is valuable for clinical workflows where radiologists want quick annotations — this is the genuine clinical use case.

**When to Reference This**:
- Interactive medical image segmentation
- Foundation model adaptation for medical imaging
- Zero-shot vs fine-tuned segmentation comparison
- Designing annotation-efficient medical imaging workflows

---

## IMG-04: Esteva et al. — Dermatologist-Level Skin Cancer Classification

### Citation
Esteva A, Kuprel B, Novoa RA, et al. Dermatologist-Level Classification of Skin Cancer with Deep Neural Networks. Nature. 2017;542(7639):115-118. PMID: 28417463

### Methodology Decomposition

**Core Idea**: A GoogleNet (Inception v3) trained on 129,450 clinical images (2,032 diseases) achieving board-certified dermatologist-level performance on carcinoma and melanoma detection.

**Key Technical Decisions**:
1. Inception v3 pretrained on ImageNet, fine-tuned on dermatology images
2. 2,032 disease categories — one of the largest medical image classification tasks at the time
3. Evaluation against 21 board-certified dermatologists on biopsy-proven cases
4. Two key tasks: carcinoma vs benign, melanoma vs benign

**Critical Analysis**:
| Dimension | Rating | Detail |
|-----------|--------|--------|
| Data Source | 🟡 | Clinical images from Google Images + medical archives; selection bias unclear |
| Ground Truth | 🟡 | Biopsy-proven for test set (gold standard); training labels less certain |
| Clinical Workflow | 🔴 | Dermatologists in practice use dermoscopy + history; model uses only images |
| Comparison Fairness | 🟡 | Model vs dermatologists on images only — removes dermatologist's clinical advantage |
| Generalizability | 🟡 | No external validation; performance on diverse skin tones not assessed |

**Methodological Insight**:
1. First "dermatologist-level" claim in a top journal — set the template for medical AI evaluation
2. The image-only evaluation is UNFAIR to dermatologists — in practice, they use history, dermoscopy, and clinical judgment
3. Skin tone bias was NOT assessed — became a major criticism and led to subsequent fairness studies
4. The "Google Images" data source raised questions about selection bias and representation

**When to Reference This**:
- Dermatology AI evaluation
- Understanding "specialist-level" claim methodology
- Medical AI fairness and skin tone bias
- Transfer learning from ImageNet to medical imaging

---

## IMG-05: CLAM — Computational Pathology Framework

### Citation
Lu MY, Williamson DFK, Chen TY, et al. Data-Efficient and Weakly Supervised Computational Pathology on Whole-Slide Images. Nat Biomed Eng. 2021;5(6):555-570. PMID: 34017140

### Methodology Decomposition

**Core Idea**: A weakly supervised framework for whole-slide image (WSI) classification using multiple instance learning (MIL), requiring only slide-level labels (not pixel-level annotations).

**Architecture**:
```
WSI (e.g., 100,000×100,000 pixels)
  ↓
[1] Tissue Detection & Patching
    → Otsu thresholding → tissue mask
    → Extract 256×256 or 512×512 patches (e.g., 10K-100K patches per WSI)
  ↓
[2] Feature Extraction (Frozen Pretrained Encoder)
    → ResNet-50 (ImageNet) or UNI (pathology foundation model)
    → Each patch → 512-d or 768-d feature vector
  ↓
[3] Multiple Instance Learning (MIL) Aggregation
    → Attention-based MIL (AB-MIL):
       - Patch features → FC → attention scores → weighted sum → slide representation
    → Or: Transformer-based MIL (TransMIL):
       - Pyramid + self-attention across patches
    → Or: CLAM (dual-branch attention):
       - Instance-level + slide-level attention branches
  ↓
[4] Classification Head
    → Slide-level prediction (cancer type, grade, biomarker status)
  ↓
[5] Interpretability
    → Attention heatmap: which patches contributed most to prediction
    → Top-attended patches → pathologist review
```

**WSI Processing Pipeline (Standard)**:

```
Raw WSI (.svs / .ndpi / .mrxs / .tiff)
  ↓
[1] Format Reading
    → OpenSlide / cuCIM / tifffile
    → Multi-resolution pyramid: base (40×) + intermediate + thumbnail
  ↓
[2] Tissue Detection
    → Otsu thresholding on HSV/gray thumbnail
    → OR: Deep learning tissue detector (better for stained/artifact slides)
    → Morphological operations (closing, opening) to clean mask
  ↓
[3] Patch Extraction
    → Patch size: 256×256 (common) or 512×512 (more context)
    → Stride: 256 (no overlap) or 128 (50% overlap)
    → Filter: tissue % > 50% per patch
    → Result: 1K-100K patches per slide
  ↓
[4] Stain Normalization (Optional but Recommended)
    → Macenko method: normalize stain appearance across slides
    → OR: Reinhard method: simpler, less robust
    → OR: StainGAN: learned normalization
    → ⚠️ Critical for multi-site data; less important for single-site
  ↓
[5] Feature Extraction
    → Pretrained encoder (frozen):
       - ResNet-50 (ImageNet): baseline, free
       - UNI (pathology foundation): SOTA, requires license
       - CONCH (multimodal pathology): text + image
       - CTransPath: self-supervised pathology encoder
    → Output: feature vector per patch (512-768 dims)
  ↓
[6] MIL Aggregation & Classification
    → AB-MIL / TransMIL / CLAM / DTFD-MIL
    → Slide-level prediction
  ↓
[7] Evaluation
    → Patient-wise split (MANDATORY — not slide-wise)
    → C-index for survival; AUC for classification
    → Cross-validation: 5-fold with patient-level splits
    → External validation on independent cohort
```

**WSI-Specific Pitfalls**:

| Pitfall | Description | Consequence | Mitigation |
|---------|-------------|-------------|-----------|
| **Slide-level data leakage** | Multiple slides from same patient in train and test | Inflated performance | Patient-wise split; check for duplicate patient IDs |
| **Stain variation** | Different staining protocols across sites | Poor generalization | Stain normalization; multi-site training |
| **Patch boundary effects** | Important features at patch boundaries | Missed information | Overlap patches; larger patch size |
| **Class imbalance at slide level** | Some cancer types much rarer | Biased model | Weighted loss; oversample rare slides |
| **Annotation granularity mismatch** | Slide-level labels for patch-level task | Noisy supervision | MIL framework handles this by design |
| **Tissue artifact** | Folded tissue, air bubbles, pen marks | Spurious features | Tissue quality filtering; artifact detection |

**Rule**: Pathology AI papers that use slide-wise (not patient-wise) splits have INFLATED performance. Flag: "⚠️ Slide-wise split — performance may not generalize to new patients."
**Rule**: MIL attention heatmaps are NOT pixel-level explanations — they show which regions contributed to the slide-level prediction, not which pixels are malignant.
**Rule**: Stain normalization is MANDATORY for multi-site pathology studies. Without it, the model may learn stain patterns instead of tissue morphology.

**When to Reference This**:
- Whole-slide image classification
- Multiple instance learning for pathology
- Designing computational pathology pipelines
- Weakly supervised medical image analysis

---

## Medical Image Preprocessing Reference

### Chest X-ray Preprocessing Pipeline

```
Raw Chest X-ray (DICOM or PNG)
  ↓
[1] Format Handling
    → DICOM: pydicom → pixel_array; apply rescale slope/intercept
    → PNG/JPG: already windowed; check for burned-in annotations
    → ⚠️ DICOM PhotometricInterpretation: MONOCHROME1 (inverted) vs MONOCHROME2
  ↓
[2] Lung Field Detection (Optional but Recommended)
    → U-Net lung segmentation
    → OR: Anatomical landmark detection
    → Crop to lung region (reduces background, improves classification)
  ↓
[3] Resolution Standardization
    → Resize to 224×224 (CheXNet standard) or 512×512 (higher detail)
    → ⚠️ Aspect ratio: maintain (pad) vs distort (resize) — pad is safer
    → Resampling: bilinear (images), nearest (masks)
  ↓
[4] Intensity Normalization
    → Single-channel (grayscale) or 3-channel (replicate for pretrained models)
    → Min-max normalization to [0,1] or ImageNet mean/std normalization
    → ⚠️ CLAHE (Contrast Limited Adaptive Histogram Equalization): improves contrast but may introduce artifacts
  ↓
[5] Data Augmentation
    → Standard: horizontal flip, rotation (±15°), translation, scaling
    → Medical-specific: intensity jitter, Gaussian noise, cutout/random erasing
    → ⚠️ Vertical flip: NOT appropriate for chest X-rays (anatomically incorrect)
    → ⚠️ Large rotations: NOT appropriate (changes anatomical orientation)
  ↓
[6] Multi-view Handling
    → Frontal (PA/AP): standard view for classification
    → Lateral: complementary view; concatenate or separate model
    → ⚠️ PA vs AP: AP images have larger cardiac silhouette — model may learn projection artifact
```

### CT Preprocessing Pipeline

```
Raw CT (DICOM series)
  ↓
[1] DICOM to Volume
    → Sort slices by InstanceNumber or SliceLocation
    → Construct 3D volume (D×H×W)
    → Apply rescale slope/intercept to get Hounsfield Units (HU)
    → ⚠️ Slice thickness and spacing may vary — resample to isotropic
  ↓
[2] Hounsfield Unit Windowing
    → Lung window: [-1500, 400] HU — for lung nodule detection
    → Soft tissue window: [-175, 275] HU — for organ segmentation
    → Bone window: [-500, 1300] HU — for bone fracture detection
    → Liver window: [-150, 250] HU — for liver lesion detection
    → ⚠️ Window selection is TASK-DEPENDENT; wrong window = lost information
    → ⚠️ Some methods use full HU range with clipping (e.g., [-1000, 1000])
  ↓
[3] Resampling
    → Resample to isotropic spacing (e.g., 1×1×1mm)
    → OR: Resample to target spacing from dataset median (nnU-Net approach)
    → Trilinear interpolation for images, nearest-neighbor for labels
  ↓
[4] Skull Stripping (for brain CT)
    → Threshold-based: HU > 300 → bone mask → dilate → remove
    → OR: U-Net skull stripping model
  ↓
[5] Organ-Specific Cropping
    → Crop to region of interest (ROI) to reduce computation
    → Use coarse organ localization model
    → Pad with margin (e.g., 20px) to avoid cutting structures
  ↓
[6] Intensity Normalization
    → CT: clip to window range → z-score normalization
    → OR: percentile-based clipping (nnU-Net: [0.5, 99.5]) → z-score
    → ⚠️ Do NOT use ImageNet normalization for CT — HU scale is fundamentally different
```

### MRI Preprocessing Pipeline

```
Raw MRI (DICOM or NIfTI)
  ↓
[1] Format Handling
    → NIfTI (.nii.gz): standard neuroimaging format; nibabel library
    → DICOM: convert to NIfTI using dcm2niix
    → ⚠️ MRI has multiple sequences per study (T1, T2, FLAIR, etc.) — handle each separately
  ↓
[2] Brain Extraction (for brain MRI)
    → BET (FSL): standard tool, good for most brains
    → HD-BET: deep learning, better for pathological brains
    → SynthStrip: robust across contrasts and pathologies
    → ⚠️ Brain extraction quality significantly affects downstream results
  ↓
[3] Registration
    → Rigid registration to MNI152 template (standard space)
    → OR: Within-subject registration (T1→T2, etc.)
    → Tools: ANTs, FLIRT (FSL), NiftyReg
    → ⚠️ Registration errors propagate to all downstream analyses
  ↓
[4] Bias Field Correction
    → N4BiasFieldCorrection (ANTs): standard method
    → OR: Deep learning bias correction
    → ⚠️ Intensity inhomogeneity is common in MRI; correction is essential for segmentation
  ↓
[5] Intensity Normalization
    → Z-score normalization per channel (most common)
    → OR: White matter normalization (divide by WM mean)
    → OR: Histogram matching to template
    → ⚠️ MRI intensity is NOT standardized across scanners — normalization is CRITICAL
    → ⚠️ Do NOT use min-max normalization — MRI has no fixed intensity scale
  ↓
[6] Data Augmentation
    → Spatial: rotation (±15°), translation, scaling, elastic deformation
    → Intensity: Gaussian noise, blur, brightness, contrast
    → MRI-specific: random bias field, ghosting, motion simulation
    → ⚠️ Deformation augmentation is particularly effective for medical segmentation
```

### Pathology WSI Preprocessing Pipeline

(See IMG-05 CLAM section above for detailed pipeline)

**Key Additional Considerations**:
- Tissue microarrays (TMAs): different from standard WSI; require core-level extraction
- Immunohistochemistry (IHC): different from H&E; requires color deconvolution (DAB/Hematoxylin separation)
- Frozen sections: lower quality, more artifacts; need specific handling
- Cytology: different from histology; cell-level rather than tissue-level analysis

---

## Medical Image Segmentation Evaluation Framework

### Standard Metrics

| Metric | Formula | Range | When to Use | Caveat |
|--------|---------|-------|-------------|--------|
| **Dice Score (F1)** | 2\|A∩B\|/( \|A\|+\|B\| ) | 0-1 | General segmentation | Sensitive to small structures; 0 if no overlap |
| **Jaccard/IoU** | \|A∩B\|/\|A∪B\| | 0-1 | Strict overlap assessment | Lower than Dice; same information |
| **Hausdorff Distance (HD95)** | 95th percentile max surface distance | 0-∞ | Boundary quality assessment | Outlier-sensitive; use HD95 not HD100 |
| **Average Surface Distance (ASD)** | Mean surface-to-surface distance | 0-∞ | Boundary smoothness | Less outlier-sensitive than HD |
| **Volume Similarity** | 1 - \|V_A - V_B\|/(V_A + V_B) | 0-1 | Volumetric accuracy | Ignores spatial overlap |
| **Sensitivity/Recall** | TP/(TP+FN) | 0-1 | Detection completeness | Does not measure false positives |
| **Precision** | TP/(TP+FP) | 0-1 | Detection specificity | Does not measure false negatives |

**Rule**: Report Dice AND HD95 for any medical segmentation study. Dice alone does not capture boundary quality.
**Rule**: For small structures (vessels, nodules), HD95 is MORE informative than Dice — a single missed branch can destroy Dice but HD95 captures boundary fidelity.
**Rule**: Statistical significance of segmentation improvements: use paired Wilcoxon signed-rank test on per-case Dice scores, NOT unpaired t-test.

### Segmentation Challenge Benchmarks

| Challenge | Organ/Task | Dataset Size | SOTA Dice | Key Insight |
|-----------|-----------|-------------|-----------|-------------|
| **BraTS** | Brain tumor segmentation | ~500 multi-institution | 0.88-0.92 (WT) | Multi-class; enhancing/non-enhancing/edema |
| **KiTS** | Kidney tumor | ~300 CT volumes | 0.90+ (kidney), 0.75+ (tumor) | Large organ + small tumor |
| **AMOS** | Multi-organ segmentation | 500 CT/MRI | 0.85-0.90 | 15 organs; cross-modality |
| **Synapse** | Abdominal organ | 30 CT volumes | 0.80-0.85 | Small dataset; high variance |
| **ISIC** | Skin lesion | 2,500+ dermoscopic | 0.90+ | Boundary quality critical |
| **BACH** | Breast cancer | 400 WSI patches | 0.85-0.90 | Multi-class; staining variation |

---

## Medical Image Classification Evaluation Framework

### Beyond AUC: Clinically Meaningful Metrics

| Metric | Definition | Clinical Meaning | When to Use |
|--------|-----------|-----------------|-------------|
| **Sensitivity at 95% Specificity** | TPR when FPR = 5% | "Will we catch 95% of cases while only scaring 5% of healthy?" | Screening tasks |
| **NPV at operating point** | P(disease-free \| negative) | "Can we safely rule out disease?" | Triage/rule-out tasks |
| **PPV at operating point** | P(disease \| positive) | "How many positive results are true?" | Confirmatory testing |
| **F1 score** | Harmonic mean of precision and recall | Balance between detection and false alarms | Imbalanced datasets |
| **Number Needed to Read** | 1/PPV | How many AI-flagged cases must a radiologist review to find one true positive? | Workflow efficiency |
| **Turnaround time reduction** | Time saved by AI pre-read | Clinical workflow impact | Deployment evaluation |

**Rule**: AUC is NECESSARY but NOT SUFFICIENT for medical imaging classification. Always report sensitivity and specificity at clinically relevant operating points.
**Rule**: For screening applications, report Sensitivity at ≥90% Specificity. For triage, report NPV at ≥95% Sensitivity.
**Rule**: CheXpert leaderboard AUC values (0.93+) are MISLEADING — they reflect NLP label noise ceiling, not true clinical performance.

### Multi-Label Chest X-ray Classification Benchmarks

| Dataset | Size | Labels | Best AUC | Key Issue |
|---------|------|--------|----------|-----------|
| **ChestX-ray14** | 112K | 14 | 0.82-0.85 | 🔴 NLP labels; ~30% noise |
| **CheXpert** | 224K | 14 | 0.92-0.95 | 🟡 Uncertainty labels; single-site |
| **MIMIC-CXR** | 377K | 14 | 0.90-0.93 | 🟡 NLP labels; multi-site but same network |
| **PadChest** | 160K | 193 | 0.80-0.85 | 🟡 Spanish reports; diverse labels |
| **NIH ChestX-ray14** | 112K | 14 | 0.82-0.85 | Same as ChestX-ray14 |
| **BRAX** | 40K | 14 | 0.85-0.90 | Brazilian; external validation |

**Rule**: When evaluating chest X-ray AI, prefer CheXpert over ChestX-ray14 — CheXpert has radiologist-validated labels and uncertainty handling.
**Rule**: MIMIC-CXR and CheXpert are from the SAME hospital network (Beth Israel). External validation requires a DIFFERENT hospital system.
**Rule**: AUC >0.95 on CheXpert may reflect label leakage or overfitting to the specific label noise pattern — be skeptical.

---

## Foundation Models for Medical Imaging

### Pathology Foundation Models

| Model | Training Data | Architecture | Key Capability | Availability |
|-------|-------------|-------------|---------------|-------------|
| **UNI** | 100K+ WSI, 20+ organs | ViT-L | Zero-shot pathology classification | 🟡 Limited license |
| **CONCH** | 1.17M image-text pairs | ViT-L + text encoder | Multimodal pathology | 🟡 Limited license |
| **Virchow** | 1.5M WSI | ViT-G | Large-scale pathology | 🔴 Proprietary (Paige) |
| **Phikon** | 60K WSI | iBOT ViT-L | Self-supervised pathology | 🟢 Open |
| **CTransPath** | 15K WSI | Swin Transformer | Self-supervised pathology | 🟢 Open |
| **PLIP** | Pathology image-text pairs | CLIP | Zero-shot pathology | 🟢 Open |

**Pathology Foundation Model Assessment Protocol**:

| Assessment | Key Question | Required Evidence | Red Flag |
|-----------|-------------|-------------------|---------|
| **Zero-shot claim** | Is zero-shot evaluation truly zero-shot? | No downstream task data in pretraining | Downstream data leaked into pretraining |
| **Feature quality** | Do frozen features outperform trained-from-scratch? | Linear probe comparison | Frozen features worse than scratch |
| **Scale benefit** | Does more pretraining data help? | Scaling curve (1K, 10K, 100K WSI) | No scaling benefit → data quality issue |
| **Multi-organ generalization** | Does the model generalize across organs? | Evaluation on ≥5 organ systems | Only evaluated on 1-2 organs |
| **Stain generalization** | Does the model handle different staining protocols? | Cross-site evaluation | Single-site evaluation only |

**Rule**: Pathology foundation model papers that only evaluate on 1-2 cancer types are INCOMPLETE. Require ≥5 cancer type evaluation.
**Rule**: UNI (Chen et al. 2024) is the current SOTA for pathology foundation models. Any new pathology foundation model MUST compare against UNI.

### Radiology Foundation Models

| Model | Modality | Architecture | Key Capability | Availability |
|-------|---------|-------------|---------------|-------------|
| **RadImageNet** | CT, MRI, US | ResNet50/DenseNet121 | Pretrained radiology encoder | 🟢 Open |
| **Med3D** | CT | ResNet variants | 3D medical pretrained encoder | 🟢 Open |
| **Models Genesis** | CT | U-Net encoder | Self-supervised 3D pretraining | 🟢 Open |
| **BiomedCLIP** | Multi-modal | CLIP | Zero-shot medical classification | 🟢 Open |
| **RadFM** | Multi-modal | Flamingo-style | Radiology report generation | 🟡 Limited |
| **M3D** | 3D medical | Autoencoder | 3D medical representation | 🟢 Open |

**Rule**: RadImageNet pretraining consistently outperforms ImageNet pretraining for radiology tasks. Use RadImageNet as default pretrained encoder for radiology classification.
**Rule**: For 3D tasks, Models Genesis or Med3D pretraining is preferred over training from scratch.

---

## Medical Image Generation & Synthesis

### Evaluation Protocol for Synthetic Medical Images

| Assessment | Method | Required Output | Clinical Relevance |
|-----------|--------|----------------|-------------------|
| **Fidelity** | FID, KID | Distribution similarity | Low FID ≠ clinically useful |
| **Diversity** | LPIPS between generated | Mode collapse detection | Must cover disease spectrum |
| **Downstream Utility (TSTR)** | Train on synthetic, test on real | Classification accuracy | Most clinically relevant metric |
| **Anatomical Consistency** | Organ shape/metrics analysis | No impossible anatomy | Safety-critical for generation |
| **Privacy Risk** | Membership inference attack | Training data leakage | Regulatory requirement |
| **Hallucinated Pathology** | Expert review of generated images | No fabricated disease | Safety-critical |
| **Clinical Equivalence** | Radiologist study: real vs synthetic | Indistinguishability | Gold standard |

**Rule**: FID is NECESSARY but NOT SUFFICIENT for medical image generation. Low FID can coexist with anatomically impossible images.
**Rule**: TSTR (Train on Synthetic, Test on Real) is the most clinically meaningful metric for synthetic medical images.
**Rule**: Medical image generation MUST check for hallucinated pathology — generated images should not contain artifacts that could be misinterpreted as disease.

---

## Medical Imaging Automatic Thinking Protocol

When analyzing ANY medical imaging paper, automatically apply this reasoning chain:

```
1. MODALITY LEVEL
   → What imaging modality? (X-ray / CT / MRI / Pathology / Dermoscopy / Endoscopy)
   → What acquisition protocol? (contrast / non-contrast / sequence type)
   → What resolution and bit depth?

2. TASK LEVEL
   → Classification / Detection / Segmentation / Generation / Registration?
   → Single-label / Multi-label / Multi-class?
   → Binary (normal vs abnormal) or multi-category?

3. DATA LEVEL
   → Open or proprietary dataset?
   → Label source: Expert annotation / NLP extraction / ICD codes?
   → If NLP labels → flag as potentially noisy (30%+ error rate)
   → Patient-wise split? (MANDATORY for clinical validity)
   → Multi-site or single-site?

4. MODEL LEVEL
   → Architecture: CNN / ViT / U-Net / MIL / Foundation model?
   → Pretrained: ImageNet / RadImageNet / Domain-specific?
   → Input: 2D slices / 3D volumes / Patches / WSI?
   → Training strategy: From scratch / Fine-tuning / Self-supervised?

5. EVALUATION LEVEL
   → Metrics: AUC / Dice / HD95 / Sensitivity / Specificity?
   → Baselines: nnU-Net (segmentation) / CheXpert SOTA (CXR)?
   → External validation? Different hospital system?
   → Statistical significance of improvements?

6. CLINICAL LEVEL
   → What clinical workflow does this support?
   → Screening / Diagnosis / Treatment planning / Monitoring?
   → Consequences of FP vs FN?
   → Regulatory pathway: SaMD classification?
   → Deployment: Real-time requirement? GPU availability?

7. FAIRNESS LEVEL
   → Evaluated across demographics (age, sex, race/ethnicity)?
   → Skin tone representation (dermatology)?
   → Scanner/protocol variation (multi-site)?
   → Disease prevalence variation?
```

---

## Medical Imaging Method Matching Matrix

| User Task | Recommended Starting Method | Key Reference | Dataset | Difficulty |
|-----------|---------------------------|---------------|---------|------------|
| Chest X-ray classification | DenseNet-121 / ViT on CheXpert | IMG-01 | CheXpert, MIMIC-CXR | ★★★☆☆ |
| Lung nodule detection | 3D CNN (RetinaNet-3D) on LUNA16 | — | LUNA16, NLST | ★★★★☆ |
| Organ segmentation (CT/MRI) | nnU-Net (default) | IMG-02 | AMOS, KiTS | ★★☆☆☆ |
| Brain tumor segmentation | nnU-Net + BraTS-specific augmentation | IMG-02 | BraTS | ★★★☆☆ |
| Pathology WSI classification | AB-MIL / TransMIL with UNI features | IMG-05, IMG-08 | TCGA, Camelyon | ★★★☆☆ |
| Pathology WSI segmentation | HoverNet / StarDist (cell) + UNI features | IMG-08 | Consep, PanNuke | ★★★★☆ |
| Interactive segmentation | MedSAM / SAM-Med2D with prompts | IMG-03 | Various | ★★☆☆☆ |
| Skin lesion classification | EfficientNet + dermoscopy augmentation | IMG-04 | ISIC, HAM10000 | ★★★☆☆ |
| Zero-shot medical classification | BiomedCLIP / UNI linear probe | IMG-08, IMG-10 | Various | ★★☆☆☆ |
| Medical image generation | Diffusion model (LDM) with TSTR eval | — | Various | ★★★★★ |
| Cross-site generalization | Domain adaptation + multi-site training | — | Multi-site datasets | ★★★★☆ |
| 3D medical segmentation | nnU-Net v2 (3D config) | IMG-02 | AMOS, KiTS | ★★☆☆☆ |

---

## Medical Imaging Reproduction Difficulty Predictor

| Factor | Easy (★) | Medium (★★★) | Hard (★★★★★) |
|--------|----------|---------------|---------------|
| Dataset | Open, well-annotated (CheXpert, BraTS) | Open, NLP labels (ChestX-ray14) | Proprietary / restricted |
| Task | Binary classification | Multi-label / Multi-class | Segmentation with rare classes |
| Architecture | Standard (DenseNet, U-Net) | Custom hybrid | Foundation model fine-tuning |
| Preprocessing | Standard resize + normalize | Modality-specific (CT windowing, stain norm) | Complex pipeline (WSI, multi-sequence MRI) |
| Evaluation | Standard metrics | Clinical metrics + statistical tests | External validation + clinical comparison |
| Code | Official repo available | Community implementation | No code, limited detail |
| GPU requirement | Single GPU (<24GB) | Multi-GPU (1-4×A100) | Large-scale cluster (8+ A100s) |

---

## Emerging Directions in Medical Imaging AI (2024-2026)

| Direction | Frontier Stage | Key Papers/Trends | Momentum |
|-----------|---------------|-------------------|----------|
| **Pathology foundation models** | Frontier | UNI, CONCH, Virchow | 🔥🔥🔥🔥🔥 |
| **3D medical foundation models** | Emerging | SegVol, M3D, Universal Model | 🔥🔥🔥🔥 |
| **Report generation from images** | Frontier | RadFM, BiomedCLIP, LLaVA-Med | 🔥🔥🔥🔥 |
| **Federated learning for imaging** | Emerging | NVFlare, Substra | 🔥🔥🔥 |
| **Self-supervised pretraining** | Frontier | DINOv2 for medical, iBOT pathology | 🔥🔥🔥🔥 |
| **Diffusion models for medical imaging** | Emerging | SynthRAD, MedDiff, anomaly detection | 🔥🔥🔥 |
| **AI for surgical video** | Pre-frontier | OR workflow analysis, instrument tracking | 🔥🔥🔥 |
| **Multi-modal medical AI** | Emerging | BiomedCLIP, LLaVA-Med, Med-PaLM M | 🔥🔥🔥🔥🔥 |
| **Continual learning for imaging** | Pre-frontier | Model updating without forgetting | 🔥🔥 |
| **AI for low-resource imaging** | Emerging | Few-shot, self-supervised, synthetic data | 🔥🔥🔥 |
| **Explainability for medical imaging** | Frontier | Concept-based, counterfactual, prototypical | 🔥🔥🔥 |
| **AI for ophthalmology** | Frontier | Retinal AI (DR, AMD, glaucoma) | 🔥🔥🔥🔥 |

---

## 3D Medical Image Analysis

### 3D Architecture Selection

| Architecture | Input | Memory | Best For | Key Model |
|-------------|-------|--------|---------|-----------|
| **3D CNN (V-Net style)** | Full 3D volume | Very high | Small volumes (<128³) | V-Net, 3D U-Net |
| **2.5D (multi-slice)** | Adjacent 2D slices | Medium | Large volumes; limited GPU | Most practical approach |
| **Patch-based 3D** | 3D patches (64³-128³) | Controlled | Any size; nnU-Net default | nnU-Net, MedNeXt |
| **2D + 3D ensemble** | 2D + 3D predictions | High | Competition-level performance | Winning solutions |
| **Transformer 3D** | 3D volume/patches | Very high | Long-range dependencies | UNETR, Swin UNETR, SegVol |

### 3D Segmentation Decision Tree

```
3D Segmentation Task
  │
  ├─ Volume size < 128³ AND GPU ≥ 24GB?
  │   └─ Full 3D U-Net / V-Net
  │       → Simplest; no patch stitching artifacts
  │
  ├─ Volume size 128³-512³?
  │   └─ Patch-based 3D (nnU-Net)
  │       → Patches: 128³ or 64³ with overlap ≥ 0.5
  │       → ⚠️ Patch stitching: weighted averaging at overlap regions
  │
  ├─ Volume size > 512³ (e.g., whole-body CT)?
  │   └─ 2.5D approach or cascade
  │       → 2.5D: 3 adjacent slices as input channels
  │       → Cascade: first localize ROI, then segment in ROI
  │
  └─ Very limited GPU (<8GB)?
      └─ 2D slice-by-slice + post-processing
          → Simplest but loses 3D context
          → Post-processing: largest connected component; morphological smoothing
```

**Rule**: nnU-Net should be the FIRST baseline for any 3D medical segmentation task. Custom architectures must beat nnU-Net to justify their complexity.
**Rule**: 3D medical image segmentation MUST report 3D metrics (Dice3D, Hausdorff3D), NOT 2D slice-wise metrics averaged. Slice-wise metrics overestimate performance.

---

## Medical Image Registration

### Registration Method Selection

| Method Type | Speed | Accuracy | Deformation | Best For |
|------------|-------|---------|-------------|---------|
| **Rigid** | Fast | — | 6 DOF | Brain (same subject) |
| **Affine** | Fast | — | 12 DOF | Initial alignment; atlas registration |
| **B-spline free-form** | Medium | High | Smooth local | Lung, liver (breathing motion) |
| **Diffeomorphic (SyN)** | Slow | Very high | Topology-preserving | Brain; longitudinal studies |
| **Learning-based (VoxelMorph)** | Very fast | Good | Learned | Real-time; batch processing |
| **Learning-based (TransMorph)** | Fast | Very high | Transformer-based | Complex deformations |

### Registration Pipeline

```
Fixed Image + Moving Image
  ↓
[1] Preprocessing
    → Resample to same spacing
    → Intensity normalization (N4 bias field for MRI)
    → Brain extraction (for neuroimaging)
    → ⚠️ Registration accuracy depends heavily on preprocessing quality
  ↓
[2] Initial Alignment
    → Center of mass alignment
    → Affine registration (12 DOF)
    → ⚠️ Skip initial alignment → registration may converge to local minimum
  ↓
[3] Deformable Registration
    → ANTs SyN: gold standard; slow but accurate
    → VoxelMorph: fast; learning-based; good for large batches
    → TransMorph: Transformer-based; state-of-the-art accuracy
    → ⚠️ Choose based on speed vs accuracy trade-off
  ↓
[4] Validation
    → Overlap: Dice coefficient of registered labels
    → Distance: Target registration error (TRE) on landmarks
    → Inverse consistency: reg(A→B) ≈ inv(reg(B→A))
    → ⚠️ Dice alone is insufficient — high Dice can hide local misalignment
    → ⚠️ Folding check: Jacobian determinant must be >0 everywhere
```

### Registration Quality Checklist

| Check | Method | Pass Criterion | Red Flag |
|-------|--------|---------------|---------|
| **Visual** | Overlay fixed + registered moving | Structures aligned | Obvious misalignment |
| **Dice** | Label overlap | >0.8 for same-subject organs | <0.7 for same-subject |
| **TRE** | Landmark distance | <2mm for brain; <5mm for body | >5mm for brain |
| **Folding** | Jacobian determinant | >0 everywhere | Negative Jacobian = invalid deformation |
| **Inverse consistency** | Forward vs inverse | <1mm difference | Large asymmetry |

**Rule**: Medical image registration MUST report at least one quantitative metric (Dice or TRE) in addition to visual inspection. "Visual alignment looks good" is not acceptable.
**Rule**: Learning-based registration (VoxelMorph) should be validated against ANTs SyN on the target dataset before deployment. VoxelMorph may fail on out-of-distribution images.

---

## Radiomics & Imaging Genomics (Radiogenomics)

### Radiomics Feature Extraction Pipeline

```
Medical Image (CT/MRI)
  ↓
[1] Tumor Segmentation
    → Manual: Expert delineation (gold standard)
    → Semi-automatic: Seed + grow
    → Automatic: nnU-Net / SAM
    → ⚠️ Segmentation quality is the #1 source of radiomics variability
  ↓
[2] Preprocessing
    → Resampling: 1×1×1 mm³ (standardize voxel spacing)
    → Intensity discretization: Bin width = 25 HU (CT) or fixed bins (MRI)
    → ⚠️ Bin width significantly affects texture features; must report
  ↓
[3] Feature Extraction (IBSI-compliant)
    → Shape: volume, surface area, sphericity, compactness
    → First-order: mean, median, skewness, kurtosis, entropy
    → GLCM: contrast, correlation, homogeneity, energy
    → GLRLM: run length features
    → GLSZM: zone size features
    → NGTDM: neighborhood features
    → ⚠️ Use PyRadiomics with IBSI-compliant settings
  ↓
[4] Feature Selection
    → Remove redundant: correlation >0.9 → keep one
    → Remove unstable: ICC <0.8 across segmentations
    → Statistical: LASSO, univariate testing
    → ⚠️ Feature selection MUST be within cross-validation to avoid leakage
  ↓
[5] Model Building
    → Classification: SVM, Random Forest, XGBoost
    → Survival: Cox regression, Random Survival Forest
    → ⚠️ Report C-index for survival; AUC for classification
    → ⚠️ Must use nested CV or independent test set
  ↓
[6] Validation
    → Internal: Cross-validation (nested)
    → External: Independent cohort (different scanner/institution)
    → ⚠️ Radiomics models without external validation have HIGH risk of overfitting
```

### Radiomics Quality Scoring (RQS)

| Criterion | Points | Description |
|-----------|--------|-------------|
| Image segmentation robustness | 1 | Inter-observer variability assessed |
| Feature extraction standardization | 1 | IBSI-compliant; PyRadiomics used |
| Feature selection in CV | 1 | No data leakage in feature selection |
| Multivariable analysis | 1 | Adjusted for clinical variables |
| Biological validation | 2 | Correlation with genotype or pathology |
| External validation | 3 | Independent cohort validation |
| Prospective study | 3 | Prospective data collection |
| **Maximum** | **12** | |

**Rule**: Radiomics studies scoring <4 on RQS have HIGH risk of bias and overfitting. External validation is the single most important criterion.
**Rule**: The "radiomics signature" must be compared against a clinical-only model. If clinical variables alone achieve similar performance, radiomics adds no value.

### Radiogenomics Integration

| Imaging Feature | Genomic Correlation | Clinical Application | Evidence Level |
|----------------|--------------------|--------------------|---------------|
| **EGFR mutation → CT texture** | EGFR-mut NSCLC has specific texture patterns | Non-invasive EGFR prediction | Moderate |
| **IDH mutation → MRI texture** | IDH-mut glioma has distinct MRI appearance | Glioma molecular subtyping | Strong |
| **MSI status → CT radiomics** | MSI-H tumors show heterogeneous enhancement | Immunotherapy response prediction | Emerging |
| **BRCA → MRI enhancement** | BRCA-mut breast cancer shows specific patterns | Risk stratification | Weak |
| **TP53 → multi-omics imaging** | TP53-mut across cancers shows imaging signatures | Pan-cancer genomics | Emerging |

**Rule**: Radiogenomics is CORRELATIONAL, not causal. Imaging features do not directly measure genotype. Always validate with molecular testing.
**Rule**: Radiogenomics studies MUST use independent test sets. Same-cohort train/test leads to massive overfitting due to high feature-to-sample ratios.

---

## Digital Pathology — End-to-End Workflow

### Whole Slide Image (WSI) Processing Pipeline

```
Raw WSI (SVS / TIFF / NDPI — typically 1-5 GB per slide)
  ↓
[1] Slide Quality Control
    → Tissue detection: Otsu thresholding on downsampled image
    → Artifact detection: pen marks, folds, air bubbles, blur
    → ⚠️ Artifacts in WSI are COMMON — 15-30% of slides have significant artifacts
    → Tools: OpenSlide, ASAP, CLAM
  ↓
[2] Tiling / Patching
    → Patch size: 256×256 or 512×512 at 20× magnification
    → Overlap: 0-50% (0% for inference; 25-50% for training)
    → Foreground filtering: discard patches with <50% tissue
    → ⚠️ Patch size and magnification are CRITICAL hyperparameters
    → ⚠️ Different magnifications capture different features:
       - 40×: nuclear detail; mitotic figures
       - 20×: cell morphology; tissue architecture
       - 10×: glandular structure; tumor microenvironment
       - 5×: overall tissue pattern; tumor-stroma ratio
  ↓
[3] Stain Normalization (CRITICAL)
    → Macenko method: standard; most widely used
    → Vahadane method: better for sparse stains
    → Reinhard method: simple; fast; less accurate
    → Stain augmentation: augment during training instead of normalizing
    → ⚠️ Stain variation is the #1 domain shift in pathology AI
    → ⚠️ Stain normalization can REMOVE diagnostic information (e.g., H&E intensity matters)
  ↓
[4] Patch-Level Model
    → CNN (ResNet, EfficientNet): standard; well-validated
    → ViT: better for global context; needs more data
    → CLAM (attention-based): multiple instance learning
    → ⚠️ Patch-level predictions must be AGGREGATED to slide-level
  ↓
[5] Slide-Level Aggregation
    → Multiple Instance Learning (MIL): most common for weak supervision
    → Attention MIL: learn which patches matter
    → Graph-based: model spatial relationships between patches
    → ⚠️ Bag-of-patches MIL loses spatial information
    → ⚠️ Slide-level labels are NOISY — inter-pathologist agreement ~80-90%
  ↓
[6] Report Generation (optional)
    → Template-based: structured; safe; limited
    → LLM-based: flexible; hallucination risk
    → ⚠️ Pathology report generation must be VERIFIED by pathologist
```

### Pathology AI by Clinical Task

| Task | Input | Output | Key Method | Validation Standard | Difficulty |
|------|-------|--------|-----------|-------------------|-----------|
| **Cancer detection** | WSI | Binary (cancer/no cancer) | MIL; attention | Sensitivity >95%; specificity >90% | Medium |
| **Cancer grading** | WSI | Grade (Gleason, Nottingham, etc.) | Ordinal regression; MIL | Kappa >0.6 with pathologists | High |
| **Biomarker prediction** | WSI | Molecular status (MSI, HER2, etc.) | MIL + molecular labels | Concordance with IHC/PCR >85% | Very High |
| **Tumor segmentation** | WSI | Pixel-level tumor mask | U-Net; nnU-Net | Dice >0.7 | High |
| **Cell detection/counting** | WSI | Cell coordinates + types | Detection head; HoVer-Net | F1 >0.7 per cell type | Medium |
| **Survival prediction** | WSI | Risk score | Cox + MIL | C-index >0.65 | Very High |

**Rule**: Pathology AI must be validated on EXTERNAL slides from DIFFERENT labs. Stain variation across labs is the primary failure mode.
**Rule**: Pathologist agreement is the CEILING for pathology AI. If inter-pathologist agreement is κ=0.7, AI cannot meaningfully exceed κ=0.7.

---

## Endoscopy AI

### Endoscopy AI Tasks

| Task | Input | Output | Key Challenge | SOTA Performance | Clinical Readiness |
|------|-------|--------|--------------|-----------------|-------------------|
| **Polyp detection** | Colonoscopy video | Bounding boxes | Real-time; small polyps | Sensitivity >95% | FDA-cleared |
| **Polyp characterization** | Polyp image | Histology prediction (neoplastic vs hyperplastic) | Optical diagnosis accuracy | Accuracy ~85-90% | Emerging |
| **Ulcer detection** | Upper GI endoscopy | Segmentation | Variable appearance | Dice ~0.7 | Research |
| **Barrett's detection** | Upper GI | Segmentation | Subtle color change | Dice ~0.6 | Research |
| **Bleeding detection** | GI endoscopy | Detection | Blood obscures view | Sensitivity ~90% | Research |
| **Blind spot detection** | Colonoscopy video | Coverage map | Incomplete inspection | Coverage >95% | Emerging |

### Endoscopy AI Deployment Considerations

| Challenge | Description | Solution |
|-----------|------------|---------|
| **Real-time requirement** | <33ms per frame (30fps) | Efficient architecture; GPU at edge |
| **Video stream** | Process continuous frames | Temporal consistency; smoothing |
| **Variable quality** | Fog, bubbles, debris, motion blur | Quality-aware inference; confidence gating |
| **Device variation** | Different endoscope models | Device-specific training; domain adaptation |
| **Workflow integration** | Overlay on endoscope monitor | CADe/CADx standards; minimal latency |

**Rule**: Endoscopy AI must operate in REAL-TIME (<33ms per frame). Offline processing is clinically unacceptable for screening procedures.
**Rule**: CADe (Computer-Aided Detection) and CADx (Computer-Aided Diagnosis) have different regulatory requirements. CADe is lower risk; CADx requires higher evidence.

---

## Ophthalmology AI

### Retinal Imaging AI Tasks

| Task | Imaging Modality | Output | Key Dataset | Clinical Status |
|------|-----------------|--------|------------|----------------|
| **DR screening** | Fundus photo | DR grade (0-4) | EyePACS, APTOS | FDA-cleared (IDx-DR) |
| **Glaucoma detection** | Fundus / OCT | Cup-to-disc ratio; RNFL thickness | REFUGE | Emerging |
| **AMD classification** | Fundus / OCT | Early/intermediate/late AMD | AREDS; ODIR | Research |
| **Multi-disease screening** | Fundus photo | Multiple disease labels | DeepDRiD; ODIR | Research |
| **CV risk prediction** | Fundus photo | CVD risk factors | UK Biobank | Controversial |

### Retinal AI Assessment Protocol

```
Retinal AI Model
  ↓
[1] Dataset Quality
    → Grading standard: who labeled? (ophthalmologist vs technician)
    → Inter-grader agreement: κ >0.7 required
    → Disease prevalence: matches clinical setting?
    → ⚠️ EyePACS has known label quality issues — verify before use
  ↓
[2] Clinical Validation
    → Sensitivity >90% for referable DR (screening requirement)
    → Specificity >85% to avoid excessive referrals
    → ⚠️ High sensitivity at the cost of specificity = overwhelmed referral system
  ↓
[3] Population Validation
    → Validate across ethnicities (retinal appearance varies by pigmentation)
    → Validate across imaging devices (different fundus cameras)
    → ⚠️ IDx-DR was validated on specific cameras — device dependence is real
  ↓
[4] Non-ocular Disease Claims
    → Fundus → CVD risk: CORRELATIONAL only
    → Fundus → kidney function: plausible but not validated
    → ⚠️ Non-ocular disease prediction from fundus is CONTROVERSIAL
    → ⚠️ Poplin 2018 (fundus → CVD risk factors) was NOT reliably replicated
```

**Rule**: Retinal AI for DR screening must achieve sensitivity ≥90% for referable DR. This is the minimum threshold for a screening tool per clinical guidelines.
**Rule**: Non-ocular disease prediction from retinal images is NOT ready for clinical use. These models may be learning confounds (e.g., image quality, camera type) rather than true disease signals.

---

## Radiology Report Generation

### Report Generation Architecture

| Approach | Input | Output | Key Advantage | Key Limitation |
|----------|-------|--------|--------------|---------------|
| **Template-based** | Image features | Fixed template with slots | Safe; no hallucination | Rigid; limited expressiveness |
| **Retrieval-based** | Image → similar images | Retrieved report | Grounded in real reports | Limited novelty; retrieval errors |
| **Generation (LLM)** | Image + prompt | Free-form text | Flexible; detailed | Hallucination risk; unverified |
| **Hybrid (RAG + LLM)** | Image + retrieved reports | LLM-generated with grounding | Flexible + grounded | Complex pipeline; still hallucinates |

### Report Generation Evaluation

| Metric | What It Measures | Good Value | Limitation |
|--------|----------------|-----------|-----------|
| **BLEU** | N-gram overlap with reference | >0.3 | Does not measure clinical accuracy |
| **ROUGE-L** | Longest common subsequence | >0.4 | Does not measure clinical accuracy |
| **BERTScore** | Semantic similarity | >0.85 | May rate hallucinated but plausible text highly |
| **RadGraph F1** | Entity-level overlap | >0.4 | Measures entity extraction, not correctness |
| **CheXpert F1** | Label extraction accuracy | >0.8 | Measures label correctness |
| **Clinical correctness** | Expert rating of accuracy | >90% | Subjective; expensive; gold standard |
| **Hallucination rate** | Fraction of unsupported claims | <5% | Critical for safety; hard to automate |

**Rule**: BLEU/ROUGE are INSUFFICIENT for evaluating medical report generation. A report with high BLEU but incorrect clinical findings is DANGEROUS.
**Rule**: The MINIMUM evaluation for radiology report generation is: (1) CheXpert label accuracy, (2) RadGraph entity F1, (3) hallucination rate, and (4) clinical correctness by radiologist.
**Rule**: Report generation models MUST be evaluated on their ERROR RATE for clinically significant findings. Missing a pneumothorax or misattributing a mass is a patient safety issue, not just a metric issue.

### Report Generation Safety Protocol

```
Generated Report
  ↓
[1] Factuality Check
    → Are all mentioned findings supported by the image?
    → Cross-reference with image-level classification output
    → ⚠️ LLMs can "hallucinate" findings that are not in the image
  ↓
[2] Negation Consistency
    → If classification says "no effusion" but report mentions effusion → error
    → If report says "no acute findings" but mentions pneumothorax → contradiction
    → ⚠️ Negation errors are the most dangerous type of hallucination
  ↓
[3] Clinical Actionability
    → Does the report lead to appropriate clinical action?
    → Are recommendations consistent with findings?
    → ⚠️ Over-calling leads to unnecessary procedures; under-calling leads to missed diagnoses
  ↓
[4] Human Verification
    → ALL generated reports must be reviewed by radiologist before clinical use
    → ⚠️ Report generation is a DRAFTING tool, not an autonomous system
```

---

## Surgical AI & Robot-Assisted Surgery

### Surgical AI Task Hierarchy

| Task | Input | Output | Key Method | Real-Time? | Clinical Readiness |
|------|-------|--------|-----------|-----------|-------------------|
| **Phase recognition** | Surgical video | Current surgical phase | TCN; Transformer; LSTM | Yes | FDA-cleared (some) |
| **Instrument detection** | Surgical video | Bounding boxes + class | YOLO; Faster R-CNN | Yes | Research |
| **Instrument segmentation** | Surgical video | Pixel-level instrument mask | U-Net; ISINet | Near-real-time | Research |
| **Action recognition** | Surgical video | Surgical action triplet | ResNet + LSTM; Transformer | No | Research |
| **Skill assessment** | Surgical video + kinematics | Skill score / classification | LSTM; GCN; Transformer | No | Emerging |
| **Adverse event detection** | Surgical video | Bleeding; tissue damage | Anomaly detection; classification | Yes | Research |
| **Critical view safety** | Laparoscopic video | Safety view achievement | Classification; segmentation | Yes | Emerging |
| **Procedural step prediction** | Surgical video | Next K steps | Sequence prediction | No | Research |

### Surgical Video Analysis Pipeline

```
Raw Surgical Video (endoscopic/laparoscopic)
  ↓
[1] Preprocessing
    → Frame extraction: 1-5 fps (surgery is slow; 30fps is wasteful)
    → De-hazing: remove smoke and fog from cauterization
    → Color normalization: different cameras have different color profiles
    → ⚠️ Surgical video is MESSY: smoke, blood, tool occlusion, camera motion
  ↓
[2] Feature Extraction
    → Spatial: CNN backbone (ResNet-50; EfficientNet-B2)
    → Temporal: TCN (temporal convolution) or Transformer
    → Multi-scale: combine frame-level + clip-level features
    → ⚠️ Temporal context is ESSENTIAL — single frame is insufficient for phase recognition
  ↓
[3] Temporal Modeling
    → TCN: fast; good for real-time; limited long-range context
    → LSTM/GRU: sequential; slower; vanishing gradients
    → Transformer: best long-range; computationally heavy
    → ⚠️ Surgical phases have LONG-TERM dependencies — Transformer preferred
  ↓
[4] Output Smoothing
    → Temporal smoothing: prevent rapid phase switching
    → Constraint: phases must follow surgical workflow order
    → ⚠️ Without smoothing, frame-level predictions are NOISY (flickering)
  ↓
[5] Evaluation
    → Phase recognition: accuracy, F1, edit distance
    → Instrument detection: mAP@0.5
    → Skill assessment: Spearman correlation with expert scores
    → ⚠️ Use LEAVE-ONE-SURGEON-OUT cross-validation — not random splits
```

### Surgical AI Datasets

| Dataset | Surgery Type | Duration | Annotations | Key Feature |
|---------|-------------|----------|-------------|------------|
| **Cholec80** | Laparoscopic cholecystectomy | 80 videos | 7 phases + tools | Standard benchmark |
| **m2cai16** | Laparoscopic cholecystectomy | 27 videos | Phases + tools | Workshop challenge |
| **SARAS-ESAD** | Laparoscopic | Multiple | Action triplets | Action recognition |
| **JIGSAWS** | Robot-assisted (da Vinci) | Robot kinematics + video | Gestures + skill | Skill assessment standard |
| **Heidelberg Colorectal** | Laparoscopic colorectal | Multiple | Phases + steps | Complex multi-phase |
| **AutoLaparo** | Laparoscopic gynecology | 21 videos | Phase + step | High-resolution |
| **SurgToolLoc** | Various | 24K clips | 14 tool categories | Large-scale tool detection |

### Robot-Assisted Surgery (RAS) AI

| Application | Description | Key Data | Method | Status |
|------------|------------|---------|--------|--------|
| **Kinematic skill analysis** | Analyze robot arm movements for skill | da Vinci kinematics (ISI) | DTW; LSTM; GCN | Research |
| **Force estimation** | Estimate tissue-tool forces from vision | Vision + force sensor | CNN regression | Research |
| **Autonomous suturing** | Robot performs suturing autonomously | Simulation + real | RL; imitation learning | Early research |
| **Surgeon fatigue detection** | Detect fatigue from eye tracking + kinematics | Eye tracker + robot data | Multimodal classification | Research |
| **Collision avoidance** | Prevent tool-tissue collision | 3D reconstruction + planning | Path planning + RL | Research |

### Surgical AI Safety Considerations

| Risk | Description | Mitigation |
|------|------------|-----------|
| **Latency** | Delayed AI feedback during critical steps | Edge computing; lightweight models; <100ms |
| **False phase detection** | AI says "dissection phase" during "clipping phase" | Confidence threshold; human override |
| **Tool misidentification** | Confusing suction with grasper | Multi-view verification; temporal consistency |
| **Over-reliance** | Surgeon trusts AI phase detection blindly | Display confidence; require confirmation |
| **Distribution shift** | New surgeon technique or anatomy | Continuous monitoring; OOD detection |

**Rule**: Surgical AI must be validated LEAVE-ONE-SURGEON-OUT. Random splitting leaks surgeon-specific style into both train and test.
**Rule**: Real-time surgical AI must have LATENCY <100ms from frame to output. Delayed warnings during bleeding are worse than no warning.
**Rule**: Surgical phase recognition accuracy >90% on Cholec80 is the MINIMUM threshold for clinical consideration. Below this, the system is unreliable.
**Rule**: Autonomous surgical actions (suturing, cutting) are at TRL 3-4 (lab demonstration). Do NOT claim clinical readiness for autonomous surgical AI.

### AI-Assisted Endovascular & Vascular Interventional Robotics (2025-2026)

**Task Landscape**:

| Task | Input | Output | Key Method | Clinical Readiness | Key Challenge |
|------|-------|--------|-----------|-------------------|--------------|
| **Autonomous navigation** | Fluoroscopy + force sensing | Catheter/guidewire trajectory | Model-based RL (TD-MPC2); SAC | TRL 3 (phantom) | Safety in tortuous anatomy |
| **AI-guided positioning** | 3D anatomical model + real-time imaging | Valve/implant placement coordinates | CNN + geometric constraint | TRL 4-5 (in vivo) | Patient-specific anatomy |
| **Collision avoidance** | Vascular model + sensor feedback | Safe trajectory planning | Reinforcement learning + physics | TRL 2-3 | Real-time computation |
| **Procedural phase recognition** | Video + fluoroscopy | Current procedural step | Temporal CNN; Transformer | TRL 4 | Multi-modality fusion |
| **Complication prediction** | Pre-op imaging + patient data | Risk of dissection/perforation | Gradient boosting; DNN | TRL 2 | Rare event prediction |

**Key Milestones (2025-2026)**:
- FDA clearance for AI-based guidance software for in-human use in TAVI (K243884, July 2025) — first AI-guided interventional positioning
- TD-MPC2 world model for autonomous endovascular navigation: 65% success vs SAC 37% in multi-task learning across 10 patient vasculatures
- Teleoperative TAVI demonstrated in vivo: single operator controls instruments via remote interface
- Soft-robotic platforms and microsurgical robotics remain longer-term (TRL 2-3)

**Assessment Protocol for Vascular Interventional AI**:
1. Was it tested on REAL patient anatomy (not simplified phantoms)? → Phantom-only = TRL 3 max
2. Is there a safety override mechanism? → MANDATORY for any autonomous action
3. What is the failure mode? → Perforation, dissection, embolization = life-threatening
4. Is the latency acceptable? → Navigation decisions <50ms; positioning <200ms
5. Was it validated across anatomical variability? → Tortuous, calcified, anomalous vessels
6. Is there regulatory pathway clarity? → FDA De Novo or PMA likely required (Class II/III)

**Rule**: Autonomous endovascular navigation is at TRL 3 (lab/phantom). Any paper claiming clinical readiness for autonomous vascular intervention is INFLATED.
**Rule**: AI-guided positioning (e.g., TAVI) has achieved FDA clearance for GUIDANCE only — the human operator still makes the final deployment decision. This is A1 (recommendation) autonomy, NOT A3+ (semi-autonomous).

### MASAI Trial — AI-Assisted Mammography Screening RCT Final Results (2025)

**Source**: Lancet 2025 — MASAI (Mammography Screening with Artificial Intelligence) trial; 105,915 participants; 5-year follow-up

**Key Results**:

| Endpoint | AI-Assisted Screening | Standard Double-Reading | Interpretation |
|----------|----------------------|------------------------|----------------|
| **Cancer detection rate** | 6.1 per 1000 | 5.5 per 1000 | AI detected MORE cancers |
| **Interval cancer rate** | Non-inferior | Standard | Primary endpoint MET |
| **Workload (screening readings)** | 44% reduction | Standard | WORKFLOW innovation |
| **False positive rate** | Comparable | Standard | No increase in overdiagnosis |
| **Recall rate** | Slightly higher | Standard | Trade-off: more detection = more recalls |

**Innovation Assessment**:
- This is a WORKFLOW innovation (44% workload reduction), NOT primarily an accuracy innovation
- Innovation level: L4 (paradigm shift in clinical workflow) — first large-scale RCT proving AI can replace one reader in double-reading
- Clinical validation level: V5 (RCT) — highest possible
- Key insight: AI screening value is in WORKFORCE EFFICIENCY, not just detection accuracy
- The trial proves AI can safely reduce human workload by 44% WITHOUT increasing interval cancers

**Assessment Protocol for AI Screening RCTs**:
1. Must report: cancer detection + interval cancers + workload + overdiagnosis + recall rate
2. "AI detected more cancers" ≠ sufficient — must show clinical significance + no overdiagnosis increase
3. Workload reduction IS a valid clinical endpoint (MASAI proves this)
4. Non-inferiority design is appropriate: AI screening should NOT miss MORE cancers than standard
5. Long-term follow-up needed: interval cancer rate is the SAFETY endpoint
6. Cost-effectiveness: 44% workload reduction → significant cost savings → must be quantified

**Rule**: MASAI is the GOLD STANDARD for AI screening RCT design. Any AI screening paper without RCT evidence is at V2 (external validation) maximum.
**Rule**: AI screening trials must be NON-INFERIORITY trials for interval cancer rate. Superiority in detection is a BONUS, not the primary endpoint.

---

## Dermatology AI & Skin Lesion Analysis

### Dermatology AI Task Landscape

| Task | Input | Output | Key Method | Clinical Readiness | Key Dataset |
|------|-------|--------|-----------|-------------------|------------|
| **Melanoma detection** | Dermoscopic image | Malignant vs benign | EfficientNet; ResNet + attention | FDA-cleared (DermaSensor) | ISIC 2016-2020; HAM10000 |
| **Lesion segmentation** | Dermoscopic image | Lesion boundary mask | U-Net; DeepLabV3+ | Research | ISIC 2017 Task 1; PH2 |
| **Lesion classification (multi-class)** | Dermoscopic image | 7-9 disease categories | Ensemble; ViT | Research | HAM10000; PAD-UFES-20 |
| **Lesion tracking** | Sequential images | Change detection | Siamese network; registration | Research | Custom longitudinal |
| **Body region detection** | Clinical photo | Anatomical location | Object detection; classification | Research | Custom |
| **Teledermatology triage** | Smartphone photo | Refer vs manage | CNN + clinical metadata | Emerging | Custom; Stanford telederm |
| **Nail disease** | Nail image | Onychomycosis; melanonychia | CNN; ViT | Research | Custom |

### ISIC Challenge — The ImageNet of Dermatology AI

| Year | Task | Classes | Images | Key Innovation | Winning Approach |
|------|------|---------|--------|---------------|-----------------|
| **2016** | Binary (melanoma vs benign) | 2 | 900+ train | First large-scale dermoscopy challenge | ResNet ensemble |
| **2017** | Multi-task (seg + feat + class) | 3 | 2000+ train | Unified segmentation + classification | Multi-task U-Net + ResNet |
| **2018** | Lesion classification (3 tasks) | 7 | 10K+ train | HAM10000 released | Ensemble with lesion attributes |
| **2019** | Diagnosis + attribute prediction | 9 | 25K+ train | Unrestricted external data allowed | EfficientNet + external pretraining |
| **2020** | Binary classification | 2 | 33K+ train | Focus on boundary cases | Ensemble + TTA + metadata fusion |

### Dermatology AI Pipeline

```
Skin Lesion Image (dermoscopic or clinical photo)
  ↓
[1] Preprocessing
    → Hair removal: DullRazor algorithm (morphological closing)
    → Black frame removal: crop dark borders from dermoscopy
    → Color normalization: Macenko or LAB normalization
    → Resolution standardization: resize to 224×224 or 384×384
    → ⚠️ Hair removal is CRITICAL — hair occludes lesion features
    → ⚠️ Color normalization matters MORE than in radiology — dermoscopy lighting varies hugely
  ↓
[2] Data Augmentation (aggressive for dermoscopy)
    → Geometric: rotation (0-360°), flip, shear
    → Color: hue shift, saturation, brightness, contrast
    → Cutout / random erasing: simulate hair/occlusion
    → MixUp / CutMix: regularize for small datasets
    → ⚠️ Dermoscopy images have NO canonical orientation — use full 360° rotation
  ↓
[3] Model Architecture
    → Baseline: EfficientNet-B3 to B7 (best single-model)
    → Strong: ViT (Vision Transformer) with medical pretraining
    → Ensemble: multiple architectures + TTA (test-time augmentation)
    → Metadata fusion: concatenate clinical features (age, sex, body site) with image features
    → ⚠️ Metadata fusion consistently improves dermoscopy AI — always include when available
  ↓
[4] Loss Function
    → Class imbalance: focal loss or weighted cross-entropy
    → Melanoma is RARE (<5% of lesions) but CRITICAL (false negative = death)
    → Cost-sensitive: weight melanoma FN 10-100× higher than benign FP
    → ⚠️ Standard cross-entropy on imbalanced data → model predicts "benign" for everything
  ↓
[5] Evaluation (CLINICAL, not just ML)
    → Sensitivity for melanoma: MUST be >95% (missed melanoma = medical malpractice)
    → Specificity: as high as possible without sacrificing sensitivity
    → AUC-ROC: useful but INSUFFICIENT — operating point matters more
    → Decision curve analysis: net benefit at different thresholds
    → ⚠️ AUC of 0.95 is MEANINGLESS if the operating point misses melanomas
  ↓
[6] Fairness Assessment
    → Evaluate performance across skin tones (Fitzpatrick I-VI)
    → Evaluate across age groups, sex, body locations
    → ⚠️ Most ISIC datasets are >80% Fitzpatrick I-III — DARK SKIN is underrepresented
    → ⚠️ Model accuracy drops 10-30% on dark skin tones if not specifically trained
```

### Dermatology AI — Clinical Deployment Challenges

| Challenge | Description | Impact | Mitigation |
|-----------|------------|--------|-----------|
| **Dermoscopy vs smartphone** | Models trained on dermoscopy fail on phone photos | Non-deployable in primary care | Train on mixed data; domain adaptation |
| **Skin tone bias** | Underrepresentation of dark skin in training data | Missed melanoma in dark-skinned patients | Stratified sampling; fairness-aware training |
| **Rare lesion types** | Some lesions have <100 images in datasets | Cannot reliably classify | Few-shot learning; refer to specialist |
| **Borderline cases** | Even dermatologists disagree on 30% of lesions | AI cannot be better than label noise | Multi-rater consensus; calibrated confidence |
| **Regulatory gap** | No clear FDA pathway for consumer-facing dermoscopy AI | Market access barrier | SaMD classification; clinical validation |
| **Consumer misuse** | Patients self-diagnose from phone apps | Delayed professional evaluation | Clear disclaimers; triage-only positioning |

**Rule**: Dermatology AI sensitivity for melanoma MUST be >95%. A missed melanoma is a potentially fatal error. Specificity can be sacrificed for sensitivity — a false positive leads to a biopsy; a false negative leads to death.
**Rule**: ISIC datasets are predominantly light-skinned (Fitzpatrick I-III). Any dermatology AI MUST be evaluated on dark skin tones separately. Reporting only aggregate AUC hides performance gaps.
**Rule**: Dermoscopy-trained models do NOT generalize to smartphone photos without domain adaptation. If deploying in primary care (smartphone), train on smartphone data.

---

## Medical Image Quality Assessment

### Why Image Quality Matters for AI

| Quality Issue | Prevalence | Impact on AI | Detection Method |
|---------------|-----------|-------------|-----------------|
| **Motion blur** | 5-15% of CT/MRI | Reduced accuracy; false negatives | Sharpness metrics; Laplacian variance |
| **Noise** | 10-20% of low-dose CT | Reduced sensitivity for subtle findings | SNR estimation; noise power spectrum |
| **Artifact** | 5-10% of CT (metal, beam hardening) | False positives; segmentation failure | Artifact-specific detectors |
| **Under/overexposure** | 5-10% of X-ray | Feature loss; misclassification | Histogram analysis; intensity distribution |
| **Missing anatomy** | 3-5% of CXR (cropped, rotated) | Incomplete analysis; wrong measurements | Anatomical landmark detection |
| **Wrong protocol** | 2-5% of MRI (wrong sequence) | Model input mismatch | DICOM header check; protocol classification |
| **Poor dermoscopy** | 10-20% (gel bubbles, hair, glare) | Reduced classification accuracy | Quality classifier; artifact detection |

### Image Quality Assessment Pipeline

```
Input Medical Image
  ↓
[1] DICOM Header Validation
    → Check: modality, body part, protocol, pixel spacing
    → Flag: wrong modality, wrong body part, missing metadata
    → ⚠️ 2-5% of images in clinical PACS have INCORRECT DICOM headers
  ↓
[2] Automated Quality Scoring
    → No-reference quality: BRISQUE, NIQE (general); medical-specific models
    → Reference-based: SSIM, PSNR (only if reference available — rare in clinical)
    → Task-specific: train quality predictor for specific AI task
    → ⚠️ General-purpose IQA scores (BRISQUE) correlate POORLY with medical AI performance
    → ⚠️ Train TASK-SPECIFIC quality predictors instead
  ↓
[3] Artifact Detection
    → CT: metal artifact, beam hardening, ring artifact, motion
    → MRI: motion, ghosting, susceptibility, wrap-around
    → X-ray: motion, overexposure, underexposure, rotation
    → Ultrasound: speckle, shadowing, reverberation
    → ⚠️ Artifact detection models need SEPARATE training per modality
  ↓
[4] Accept/Reject/Flag Decision
    → Accept: quality above threshold → send to AI model
    → Reject: quality below minimum → return to technologist
    → Flag: borderline quality → run AI with confidence adjustment
    → ⚠️ Rejecting too many images → workflow disruption; accepting too many → unreliable AI
  ↓
[5] Quality-Aware Inference
    → Adjust AI confidence based on image quality
    → Low quality → wider confidence intervals; higher uncertainty
    → ⚠️ AI models are OVERCONFIDENT on low-quality images — they don't know what they don't see
```

### Quality-Aware Training Protocol

| Strategy | Description | When to Use | Tradeoff |
|----------|------------|-------------|---------|
| **Quality-weighted loss** | Weight training samples by image quality | Mixed quality dataset | May underfit clean data |
| **Quality as input feature** | Concatenate quality score to model | Variable quality at inference | Quality score must be available at test time |
| **Quality augmentation** | Simulate degradations during training | Deployment in variable conditions | May reduce peak performance on clean data |
| **Separate low/high quality models** | Train different models per quality tier | Clear quality bimodality | More models to maintain |
| **Curriculum learning** | Train on clean → gradually add degraded | Progressive robustness | Longer training schedule |

**Rule**: Image quality assessment must be the FIRST step in any medical AI deployment pipeline. Running AI on poor-quality images produces unreliable results that are WORSE than no prediction.
**Rule**: General-purpose IQA metrics (BRISQUE, PSNR) do NOT correlate well with medical AI performance. Train task-specific quality predictors.
**Rule**: AI models are OVERCONFIDENT on low-quality images. A model that predicts cancer with 95% confidence on a blurry, artifacted image is DANGEROUS. Always adjust confidence for image quality.

---

## Oncology AI — Beyond Imaging

### Oncology AI Task Landscape (Non-Imaging)

| Task | Data Source | AI Method | Output | Clinical Readiness | Key Challenge |
|------|-----------|-----------|--------|-------------------|---------------|
| **Treatment response prediction** | Imaging + genomics + clinical | Multimodal DL | Response probability | Emerging | Ground truth requires follow-up |
| **Immunotherapy response** | Tumor genomics + PD-L1 + TMB | Ensemble; graph neural network | Responder vs non-responder | Research | Low response rate (~20-30%); biomarkers imperfect |
| **Chemotherapy toxicity** | Genomics + clinical + labs | Classification; regression | Toxicity grade prediction | Research | Individual variation; drug interactions |
| **Radiotherapy planning** | CT + contours + dose constraints | DL segmentation + optimization | Auto-contouring; dose distribution | FDA-cleared (some) | Clinical validation; anatomical variation |
| **Tumor growth modeling** | Serial imaging | Neural ODE; physics-informed | Growth trajectory | Research | Limited longitudinal data |
| **Clinical trial matching** | EHR + genomic + trial criteria | NLP + rule-based + ML | Eligible trials ranked | Deployed (some) | Complex criteria; site availability |
| **Survival prediction** | Multi-omic + clinical + imaging | Cox neural network; DeepSurv | Survival curve | Research | Censoring; competing risks |
| **Liquid biopsy analysis** | ctDNA; CTC; cfDNA | Classification; anomaly detection | Cancer detection; MRD | Emerging | Ultra-low allele frequency; noise |

### Radiotherapy AI — Auto-Contouring & Planning

| Task | Input | Output | Method | Accuracy (Dice) | Status |
|------|-------|--------|--------|----------------|--------|
| **Organ-at-risk segmentation** | Planning CT | OAR contours | U-Net; nnU-Net | 0.85-0.95 (most organs) | FDA-cleared (some) |
| **Gross tumor volume** | CT + PET/MRI | GTV contour | nnU-Net; attention U-Net | 0.70-0.85 (site-dependent) | Emerging |
| **Clinical target volume** | GTV + anatomy knowledge | CTV contour | Atlas-based + DL | 0.60-0.80 (high variability) | Research |
| **Dose prediction** | CT + contours | 3D dose distribution | U-Net; 3D CNN | 2-5% dose error | Emerging |
| **Plan optimization** | Dose constraints + objectives | Beam angles; MLC positions | RL; optimization + DL | Clinical-quality plans | Research |

```
Radiotherapy AI Pipeline
  ↓
[1] Image Registration
    → Register planning CT with MRI/PET for target delineation
    → Rigid + deformable registration
    → ⚠️ Registration errors of 2-3mm can cause GEOGRAPHIC MISS of tumor
  ↓
[2] Auto-Contouring
    → OARs: high accuracy (Dice >0.90); clinician review required but fast
    → GTV: moderate accuracy (Dice 0.70-0.85); always requires clinician edit
    → CTV: LOW accuracy (Dice 0.60-0.80); most challenging; requires clinical judgment
    → ⚠️ CTV requires ANATOMICAL KNOWLEDGE of spread patterns — this is where AI struggles most
    → ⚠️ Auto-contouring saves 30-60 min per plan but MUST be reviewed by radiation oncologist
  ↓
[3] Dose Calculation & Optimization
    → AI dose prediction: estimate achievable dose before planning
    → Traditional: inverse planning with DVH constraints
    → AI-assisted: predict optimal plan; use as starting point
    → ⚠️ AI dose predictions are APPROXIMATIONS — final plan must be verified by dosimetrist
  ↓
[4] Quality Assurance
    → Verify: dose to OARs within tolerance
    → Verify: target coverage (D95, V95)
    → Verify: no geographic miss
    → ⚠️ AI-generated plans that look good on DVH may have COLD SPOTS in target
```

### Immunotherapy Response Prediction

| Biomarker | Type | Predictive Value | Limitation | AI Enhancement |
|-----------|------|-----------------|-----------|---------------|
| **PD-L1 expression** | IHC | Moderate (higher = more likely to respond) | Not binary; assay variability | Digital pathology quantification |
| **Tumor mutational burden (TMB)** | Genomic | Moderate (higher = more neoantigens) | Threshold debate; panel vs WES | ML-based TMB estimation from panels |
| **Microsatellite instability (MSI)** | Genomic | High (MSI-H → respond) | Only ~5% of solid tumors | CNN from H&E (predict MSI from pathology) |
| **Tumor-infiltrating lymphocytes** | Pathology | Moderate (more TILs → better response) | Spatial heterogeneity | DL quantification from WSI |
| **Radiomics signature** | Imaging | Emerging | Not validated; site-specific | Multi-feature radiomics + clinical |
| **Multi-omic integration** | Genomic + pathology + imaging | Highest potential | Data integration; small cohorts | Multimodal DL |

**Rule**: Radiotherapy auto-contouring AI MUST be reviewed by a radiation oncologist. AI contouring errors of 2-3mm can cause geographic miss (under-dosing tumor) or OAR overdose.
**Rule**: CTV (Clinical Target Volume) auto-contouring is the HARDEST radiotherapy AI task because it requires understanding of tumor SPREAD PATTERNS, not just anatomy. GTV and OAR are more tractable.
**Rule**: Immunotherapy response prediction is still RESEARCH. No AI model reliably predicts which patients will respond. PD-L1, TMB, and MSI are IMPERFECT biomarkers. Multi-modal integration shows the most promise.

---

## Radiology Workflow AI

### Radiology Workflow AI Tasks

| Task | Input | Output | Method | Impact | Status |
|------|-------|--------|--------|--------|--------|
| **Worklist prioritization** | Study metadata + AI findings | Priority ranking | Classification + rules | Reduce critical finding delay | Deployed (some PACS) |
| **Critical finding alert** | Image + AI analysis | Alert to radiologist | Detection + classification | Faster communication | Emerging |
| **Study quality check** | Image + DICOM headers | Quality pass/fail | Classification; anomaly detection | Reduce repeat scans | Research |
| **Protocol selection** | Order + clinical context | Recommended protocol | NLP + classification | Reduce wrong-protocol scans | Emerging |
| **Report generation assistance** | Image + AI findings | Draft report sections | LLM + vision-language | Reduce reporting time | Emerging |
| **Follow-up recommendation** | Report + guidelines | Follow-up suggestion | NLP + rule-based | Reduce missed follow-ups | Deployed (some) |
| **Peer review selection** | Report + AI confidence | Cases for peer review | Anomaly detection | Targeted quality improvement | Research |

### Worklist Prioritization — The Highest-Impact Workflow AI

```
Incoming Radiology Studies
  ↓
[1] Triage Classification
    → Critical (stat): pneumothorax, aortic dissection, intracranial hemorrhage
    → Urgent: new mass, fracture, PE, stroke
    → Routine: follow-up, screening, chronic changes
    → ⚠️ The goal is NOT to replace radiologist triage — it's to FLAG critical cases that arrive at 3am
  ↓
[2] AI Analysis (parallel to worklist)
    → Run pre-trained detection models on incoming studies
    → Output: probability of critical findings
    → ⚠️ AI analysis must be FAST (<30s) or it delays rather than accelerates
  ↓
[3] Priority Assignment
    → Combine: AI findings + order urgency + clinical context
    → Re-order worklist: critical cases float to top
    → ⚠️ AI must NOT deprioritize — only UPGRADE priority. Downgrading risks missing critical findings.
  ↓
[4] Notification
    → Critical finding: direct alert to radiologist (pager, in-app notification)
    → Urgent: flag in worklist
    → ⚠️ Critical finding alerts must be ACKNOWLEDGED — unacknowledged alerts are liability
  ↓
[5] Feedback Loop
    → Track: AI-flagged cases vs radiologist diagnosis
    → Measure: time-to-report for critical cases (before vs after AI)
    → ⚠️ If AI doesn't reduce time-to-report for critical cases, it's not providing value
```

### Critical Finding Communication — The Legal Imperative

| Finding | Time to Communication (ACR Guideline) | AI Role | Risk of Missed Communication |
|---------|--------------------------------------|---------|------------------------------|
| **Pneumothorax (tension)** | Immediate | Auto-detect + alert | Death if delayed |
| **Aortic dissection** | Immediate | Auto-detect + alert | Death if delayed |
| **Intracranial hemorrhage** | Immediate | Auto-detect + alert | Neurological deterioration |
| **Pulmonary embolism (massive)** | Immediate | Auto-detect + alert | Hemodynamic collapse |
| **New malignancy** | Same day | Flag in worklist | Treatment delay |
| **Acute fracture** | Same day | Flag in worklist | Displacement risk |

**Rule**: Worklist prioritization AI should ONLY UPGRADE priority, never downgrade. A false upgrade costs time; a false downgrade can cost a life.
**Rule**: Critical finding alerts must be ACKNOWLEDGED by the radiologist. An unacknowledged critical finding alert is a LIABILITY RISK for the institution.
**Rule**: The metric for worklist AI is TIME-TO-REPORT for critical cases, not AUROC. If AI doesn't reduce the time from scan to report for critical findings, it's not providing clinical value.
**Rule**: AI critical finding detection must have VERY HIGH SENSITIVITY (>98%) for life-threatening conditions. A missed tension pneumothorax is a potential death; a false alarm is a minor inconvenience.

## Hematology AI & Blood Smear Analysis

### Hematology AI Task Landscape

| Task | Input | AI Method | Output | Clinical Readiness | Key Challenge |
|------|-------|-----------|--------|-------------------|---------------|
| **Blood smear analysis** | Peripheral blood smear (microscopy) | Object detection; classification | Cell type + morphology | Emerging (commercial) | Staining variability; rare cell types |
| **CBC anomaly detection** | CBC results (numeric) | Anomaly detection; classification | Abnormal pattern flag | Deployed (some LIS) | Reference range variation by age/sex |
| **Leukemia subtyping** | Blood smear + flow cytometry | CNN; multimodal | AML/ALL subtype | Emerging | Rare subtypes; morphology overlap |
| **Anemia classification** | CBC + smear + clinical | Classification; rule-based | Anemia type (microcytic/macrocytic/normocytic) | Deployed (rule-based) | Multifactorial anemia |
| **Malaria detection** | Blood smear (thin/thick film) | Object detection (YOLO/RetinaNet) | Parasitemia count | Emerging (low-resource) | Species differentiation; low parasitemia |
| **Sickle cell detection** | Blood smear + HPLC | Classification; detection | Sickle cells; HbS quantification | Emerging | Overlap with other hemoglobinopathies |
| **Platelet estimation** | Blood smear | Object detection; regression | Platelet count estimate | Research | Clumping; platelet satellitism |
| **RBC morphology** | Blood smear | Classification | RBC shape classification (12+ categories) | Emerging | Subtle morphological differences |

### Blood Smear AI — The Digital Pathology Challenge

```
Peripheral Blood Smear (1000x oil immersion)
  ↓
[1] Preprocessing
    → White balance correction (staining variability)
    → Color normalization (Macenko; Reinhard)
    → Focus quality assessment (out-of-focus regions common)
    → ⚠️ Staining variability is the #1 source of error — same lab, different day can differ
  ↓
[2] Cell Detection & Segmentation
    → WBC: larger; darker nucleus; fewer (~5-10K/μL)
    → RBC: smaller; no nucleus; abundant (~4-5M/μL)
    → Platelets: smallest; granular; abundant (~150-400K/μL)
    → Methods: Mask R-CNN; YOLO; Cellpose; StarDist
    → ⚠️ Overlapping cells are COMMON — instance segmentation is required, not semantic
    → ⚠️ RBC counting is NOTORIOUSLY unreliable on smears — CBC is the gold standard
  ↓
[3] WBC Differential Count
    → 5-part differential: neutrophils, lymphocytes, monocytes, eosinophils, basophils
    → Abnormal cells: blasts, promyelocytes, atypical lymphocytes, plasma cells
    → Methods: CNN classification on segmented cells
    → ⚠️ Normal differential: AI achieves >95% accuracy
    → ⚠️ Abnormal cells (blasts): accuracy drops to 70-85% — THIS is where it matters most
    → ⚠️ Basophils are the HARDEST to classify (rare; morphological overlap with other granulocytes)
  ↓
[4] RBC Morphology Assessment
    → Normal vs abnormal shapes: spherocytes, sickle cells, target cells, schistocytes, etc.
    → 12+ morphological categories (some subtle; some obvious)
    → ⚠️ Schistocytes (fragmented RBCs) are CLINICALLY CRITICAL — indicate microangiopathic hemolysis (TMA/DIC)
    → ⚠️ RBC morphology is SUBJECTIVE — inter-observer agreement is only moderate (kappa 0.5-0.7)
  ↓
[5] Clinical Integration
    → AI differential as SCREENING — abnormal flags trigger manual review
    → AI morphology as SECOND OPINION — not replacement for hematologist
    → ⚠️ The clinical question is NOT "can AI count cells?" but "can AI detect the ABNORMAL cells that matter?"
```

### Leukemia Subtyping — The Clinical Frontier

| Leukemia Type | Key Morphological Features | AI Differentiation Difficulty | Clinical Significance |
|--------------|---------------------------|------------------------------|----------------------|
| **AML (acute myeloid)** | Blasts with Auer rods; myeloperoxidase+ | Moderate | Requires urgent treatment |
| **APL (acute promyelocytic)** | Hypergranular promyelocytes; Auer rods | High (subtle) | MEDICAL EMERGENCY — DIC risk |
| **ALL (acute lymphoblastic)** | Small blasts; L1/L2/L3 morphology | Moderate | Different treatment from AML |
| **CLL (chronic lymphocytic)** | Smudge cells; small mature lymphocytes | Low | Indolent; watch-and-wait often |
| **CML (chronic myeloid)** | Full spectrum of granulocytic maturation | Moderate | BCR-ABL targeted therapy |
| **HCL (hairy cell)** | Hair-like cytoplasmic projections | High (rare) | Specific treatment (cladribine) |

```
⚠️ LEUKEMIA AI REALITY CHECK:
- Morphology alone is INSUFFICIENT for leukemia diagnosis — flow cytometry and cytogenetics are required
- AI on blood smear can FLAG suspicion but CANNOT replace immunophenotyping
- APL (acute promyelocytic leukemia) is a MEDICAL EMERGENCY — early detection is life-saving
- The clinical value of AI is in FLAGGING cases that might be missed on manual review, not replacing hematologists
- Most AI studies use HIGH-QUALITY smears from academic centers — real-world smear quality is much worse
```

**Rule**: Blood smear AI must address STAINING VARIABILITY as the #1 source of error. Color normalization is mandatory preprocessing.
**Rule**: The clinical value of blood smear AI is NOT in counting normal cells — it's in detecting ABNORMAL cells (blasts, schistocytes, sickle cells) that might be missed on manual review.
**Rule**: Leukemia diagnosis requires IMMUNOPHENOTYPING (flow cytometry) and CYTOGENETICS, not just morphology. AI on blood smear can flag suspicion but cannot replace these tests.
**Rule**: APL (acute promyelocytic leukemia) is a medical emergency with DIC risk. AI that can flag APL suspicion from blood smear could be life-saving.

## Musculoskeletal AI & Orthopedic Imaging

### Musculoskeletal AI Task Landscape

| Task | Input | AI Method | Output | Clinical Readiness | Key Challenge |
|------|-------|-----------|--------|-------------------|---------------|
| **Fracture detection** | X-ray (extremity) | Object detection; classification | Fracture present/absent; location | Deployed (some EDs) | Subtle hairline fractures; overlapping structures |
| **Bone age assessment** | Hand X-ray (left) | Regression; classification | Bone age (years/months) | FDA-cleared (BoneXpert) | Population-specific standards; endocrine disorders |
| **Osteoarthritis grading** | Knee/hip X-ray | Classification; segmentation | KL grade (0-4); joint space narrowing | Emerging | Gradual progression; subjective grading |
| **Spine analysis** | X-ray/CT/MRI | Segmentation; classification | Cobb angle; disc degeneration; stenosis | Emerging | Complex 3D anatomy; multiple pathologies |
| **Bone lesion characterization** | X-ray/CT/MRI | Classification; segmentation | Benign vs malignant; Aggressive vs indolent | Research | Overlapping imaging features; biopsy required |
| **Shoulder pathology** | MRI; ultrasound | Classification; segmentation | Rotator cuff tear; labral tear | Emerging | Complex anatomy; multiple structures |
| **Knee MRI analysis** | Knee MRI | Segmentation; classification | Meniscal tear; ACL tear; cartilage damage | Emerging | Oblique orientations; partial tears |
| **Osteoporosis screening** | DXA; CT; dental X-ray | Regression; classification | BMD; fracture risk | Emerging | DXA is already simple; AI adds marginal value |

### Fracture Detection AI — The Highest-Impact MSK Application

```
Emergency Department X-ray (extremity)
  ↓
[1] Study Classification
    → Body part: hand, wrist, forearm, elbow, shoulder, hip, knee, ankle, foot
    → View: AP, lateral, oblique
    → ⚠️ Wrong body part classification → wrong AI model → wrong output
  ↓
[2] Fracture Detection
    → Object detection: bounding boxes around fractures
    → Classification: fracture vs no fracture
    → Methods: YOLO; Faster R-CNN; classification CNN
    → ⚠️ Subtle hairline fractures (especially scaphoid, pediatric) are the HARDEST and MOST MISSED
    → ⚠️ Periosteal reaction (healing fracture) can mimic other pathology
  ↓
[3] Fracture Characterization
    → Location: anatomical region
    → Pattern: transverse, oblique, spiral, comminuted, greenstick
    → Displacement: non-displaced, minimally displaced, significantly displaced
    → Joint involvement: intra-articular vs extra-articular
    → ⚠️ Displacement and joint involvement determine MANAGEMENT — this is clinically critical
  ↓
[4] Clinical Decision Support
    → Fracture detected → alert ED physician
    → No fracture detected → "consider follow-up if clinically indicated" (NOT "no fracture")
    → ⚠️ A "no fracture" AI output must NEVER be treated as definitive — clinical suspicion overrides AI
    → ⚠️ Scaphoid fractures are initially RADIOGRAPHICALLY OCCULT in 20% of cases — AI must acknowledge this
  ↓
[5] Special Populations
    → Pediatric: growth plates (physis) can mimic fractures; different fracture patterns
    → Elderly: insufficiency fractures; osteopenic bone; subtle findings
    → ⚠️ Pediatric fracture AI must distinguish SALTER-HARRIS fractures from normal growth plates
    → ⚠️ This is a DIFFERENT model than adult fracture detection — do not mix populations
```

### Bone Age Assessment — The Most Validated MSK AI

| Method | Accuracy (vs Expert) | Speed | FDA Status | Key Advantage | Key Limitation |
|--------|---------------------|-------|-----------|--------------|---------------|
| **Greulich-Pyle (manual)** | Reference standard (historical) | 3-5 min | N/A | Widely known | Outdated standards (1940s-50s US population) |
| **Tanner-Whitehouse (manual)** | More accurate than GP | 5-10 min | N/A | Bone-specific scoring | Time-consuming; complex |
| **BoneXpert (AI)** | Within 0.5 years of expert | <30 sec | FDA-cleared (EU CE-marked) | Fast; consistent; automated | Trained on European population; may not generalize |
| **Custom CNN** | Variable | <10 sec | Research | Can be trained on local population | Requires local data; validation burden |

```
⚠️ BONE AGE AI CONSIDERATIONS:
- Greulich-Pyle atlas is based on 1940s-50s WHITE AMERICAN children — NOT representative of modern populations
- Bone maturation varies by ethnicity, nutrition, and socioeconomic status
- AI trained on European data may OVERESTIMATE bone age in Asian or African populations
- Clinical use: endocrine disorders (precocious puberty, growth hormone deficiency), pediatric dosing, forensic age estimation
- Forensic age estimation (immigration) is CONTROVERSIAL — bone age is an ESTIMATE, not a precise measure
```

**Rule**: Fracture detection AI must NEVER output "no fracture" as definitive. Scaphoid fractures are radiographically occult in 20% of initial X-rays. Clinical suspicion always overrides AI.
**Rule**: Pediatric fracture AI must be a SEPARATE model from adult fracture AI. Growth plates mimic fractures, and fracture patterns (greenstick, Salter-Harris) are unique to children. For pediatric AI considerations, see clinical-statistical-framework.md (Pediatric & Neonatal AI section).
**Rule**: Bone age AI trained on European/US populations may not generalize to other ethnicities. The Greulich-Pyle atlas is based on 1940s-50s white American children — it is NOT representative.
**Rule**: Osteoarthritis grading (KL grade) is SUBJECTIVE with moderate inter-observer agreement (kappa 0.5-0.7). AI should provide continuous measures (joint space width) alongside categorical grades.
