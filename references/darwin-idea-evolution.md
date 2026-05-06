# Darwin Idea Evolution Engine · 创意演化引擎

> **Version**: 1.0.0  
> **Category**: Research Ideation & Innovation Methodology  
> **Primary Domain**: Cross-domain Research, Creative Thinking, Paradigm Engineering  
> **Applicable Modules**: Darwin (Idea Evolution), Decompose (Analysis), Compare (Paradigm Mapping)

---

## 🧬 Overview

Darwin是BME Research Accelerator的核心创新引擎，通过**6种演化算子**将初始研究想法（Seed Idea）演化为多个具有不同创新等级的研究方向。该引擎基于**跨领域知识迁移**、**约束优化**和**范式融合**理论。

### Core Philosophy

```
Seed Idea → [Operator Selection] → [Knowledge Injection] → [Mutation/Recombination] → Evolved Ideas (L1-L5c)
```

---

## 🔬 The 6 Evolution Operators (演化算子)

### 1️⃣ **Transplant** (移植算子)
- **Icon**: GitBranch
- **Description**: 把 A 领域的方法迁移到 B 领域
- **Innovation Potential**: L3-L4
- **Mechanism**: 
  - 识别源领域的核心机制（attention mechanism, loss function, architecture pattern）
  - 分析目标领域的结构相似性（sequence data, spatial data, graph data）
  - 设计适配层（domain adapter, task-specific head）
- **Examples**:
  - AlphaFold's Evoformer Attention → ECG morphology analysis
  - NLP Transformer → Protein sequence embedding
  - Computer Vision CNN → Histopathology slide analysis
- **Key References**: `deep-learning-bme.md`, `medical-imaging-methodology.md`
- **Success Rate**: ~35% (requires deep domain understanding)

### 2️⃣ **Constrain** (约束算子)
- **Icon**: Target
- **Description**: 在更严苛的约束下重做（小数据、低算力、实时性）
- **Innovation Potential**: L2-L3
- **Mechanism**:
  - Identify resource constraints (data size < 1000 samples, FLOPs < 1G, latency < 100ms)
  - Apply constraint-specific techniques (distillation, pruning, quantization, few-shot learning)
  - Design minimal viable model architecture
- **Examples**:
  - 12-lead ECG → Single-lead wearable arrhythmia detection
  - GPU-heavy 3D CNN → Mobile-friendly lightweight model
  - Large-scale training → Few-shot clinical adaptation
- **Key References**: `signal-processing-foundations.md`, `experimental-design-methodology.md`
- **Success Rate**: ~55% (practical constraints drive innovation)

### 3️⃣ **Fuse** (融合算子)
- **Icon**: Shuffle
- **Description**: 融合两个独立 paradigm 的优势
- **Innovation Potential**: L3-L5a
- **Mechanism**:
  - Identify complementary paradigms (e.g., SSL + Physics-informed)
  - Design fusion architecture (parallel, sequential, gated)
  - Optimize trade-off between paradigms
- **Examples**:
  - Self-supervised pretraining + Mechanistic ODE prior for cardiac modeling
  - Graph neural network + Traditional feature engineering
  - Deep learning + Knowledge graph reasoning
- **Key References**: `deep-learning-bme.md`, `research-synthesis-matching.md`
- **Success Rate**: ~25% (high risk, high reward)

### 4️⃣ **Invert** (反转算子)
- **Icon**: Zap
- **Description**: 反转优化目标 / 因果方向
- **Innovation Potential**: L4-L5a
- **Mechanism**:
  - Flip optimization objective (max accuracy → min calibration error)
  - Reverse causal direction (symptom → disease vs disease → symptom)
  - Invert assumption (i.i.d. data → temporally correlated)
- **Examples**:
  - Classification → Anomaly detection (invert normal/abnormal definition)
  - Supervised → Self-supervised (remove label dependency)
  - Discriminative → Generative (predict condition from outcome)
- **Key References**: `clinical-statistical-framework.md`, `causal-genomics-methodology.md`
- **Success Rate**: ~20% (paradigm-shifting potential)

### 5️⃣ **Minimal** (最小可行验证算子)
- **Icon**: Beaker
- **Description**: 最小可行验证：1 周可完成的对照实验
- **Innovation Potential**: L2-L2f
- **Mechanism**:
  - Define minimal success criterion (beat baseline by X% on 1 dataset)
  - Design 1-week experiment pipeline (data collection → training → evaluation)
  - Identify kill-risk early (what would invalidate the approach?)
- **Examples**:
  - Full RCT simulation → Retrospective cohort validation (1 week)
  - Large multi-center study → Single-site pilot (minimal viable)
  - Complex multi-modal fusion → Unimodal baseline first
- **Key References**: `experimental-design-methodology.md`, `reproducibility-infrastructure.md`
- **Success Rate**: ~70% (rapid iteration, fail-fast philosophy)

### 6️⃣ **Extreme** (极端推演算子)
- **Icon**: Lightbulb
- **Description**: 推到极端：scaling / regime shift / boundary testing
- **Innovation Potential**: L4-L5b
- **Mechanism**:
  - Extrapolate to extreme scale (10x data, 100x parameters)
  - Test regime boundaries (what breaks at N=1? N=∞?)
  - Identify phase transitions in performance
- **Examples**:
  - Current: 10K patients → Extreme: 1M population screening
  - Current: Single modality → Extreme: Multi-omics + imaging + clinical notes
  - Current: Batch inference → Extreme: Real-time streaming (edge deployment)
- **Key References**: `genomics-bioinformatics-methodology.md`, `database-api-guide.md`
- **Success Rate**: ~15% (uncovers hidden assumptions)

---

## 📊 Operator Selection Matrix

| Scenario | Recommended Operators | Expected Outcome |
|----------|----------------------|------------------|
| New to field | Transplant + Constrain | Practical adaptation |
| Resource-limited | Constrain + Minimal | Feasible solution |
| Stagnant field | Fuse + Invert | Paradigm shift |
| Exploratory research | Extreme + Transplant | High-risk/high-reward |
| Rapid prototyping | Minimal + Constrain | Quick validation |

---

## 🔄 Darwin Protocol Workflow

### Phase 1: Seed Analysis (Step 0)
```
Input: User's seed idea (text description)
↓
Extract: Core domain, key assumptions, current approach
↓
Identify: Implicit constraints, potential blind spots
↓
Output: Structured seed profile
```

### Phase 2: Operator Selection (Step 1)
```
Input: Seed profile + User-selected operators (1-6)
↓
Match: Operator-domain compatibility score
↓
Retrieve: Relevant reference knowledge (from SKILL library)
↓
Output: Operator execution plan with knowledge injection points
```

### Phase 3: Knowledge Retrieval (Step 2)
```
For each selected operator:
  ↓
Search: Cross-domain papers using load_reference tool
  ↓
Extract: Transferable methods, successful adaptations, failure modes
  ↓
Build: Domain mapping dictionary (source → target terminology)
  ↓
Output: Knowledge base for mutation stage
```

### Phase 4: Mutation & Recombination (Step 3)
```
Apply operator-specific transformation rules:
  ↓
Transplant: Replace core component with domain-adapted alternative
  ↓
Constrain: Add resource budget constraints, simplify architecture
  ↓
Fuse: Combine two method pipelines at optimal junction point
  ↓
Invert: Flip optimization objective or causal direction
  ↓
Minimal: Strip to essential components, define 1-week validation
  ↓
Extreme: Extrapolate assumptions to breaking point
  ↓
Output: 3-5 evolved idea variants
```

### Phase 5: Innovation Assessment (Step 4)
```
For each variant:
  ↓
Assess novelty using INNOVATION_LEVELS framework (L1-L5c)
  ↓
Check fatal blockers using FB-1 to FB-11 detection
  ↓
Evaluate clinical validation potential (V0-V5)
  ↓
Score feasibility (data availability, compute requirements, expertise needed)
  ↓
Output: Ranked idea cards with multi-dimensional scores
```

### Phase 6: Integration & Roadmap (Step 5)
```
Select top 3 variants
  ↓
Generate: Research roadmap for each (milestones, risks, resources)
  ↓
Create: "Send to Decompose" action items for deep analysis
  ↓
Output: Final evolved ideas portfolio ready for execution
```

---

## 💡 Best Practices

### ✅ Do's
1. **Start with clear seed idea**: Vague inputs → vague outputs
2. **Combine 2-3 operators**: Single operator often insufficient for L4+ innovation
3. **Use domain references**: Always invoke `load_reference` before evolution
4. **Validate early**: Use Minimal operator to test core hypothesis quickly
5. **Document assumptions**: Each variant should list explicit/implicit assumptions

### ❌ Don'ts
1. **Don't ignore constraints**: Unrealistic ideas waste time (check FB-7 Reproduction Path)
2. **Don't skip domain mapping**: Direct transplantation fails without adaptation layer
3. **Don't pursue all variants**: Focus on top 2-3 after initial screening
4. **Don't neglect baseline**: Always compare against simplest possible approach
5. **Don't forget clinical relevance**: For BME, V3+ validation should be end goal

---

## 🔗 Integration with Other Modules

### Darwin → Decompose
- **Trigger**: User clicks "Send to Decompose" on evolved idea
- **Transfer**: Evolved idea becomes input query for decompose module
- **Enrichment**: Decompose applies full Step 0-8 protocol to validate idea feasibility

### Darwin → Compare
- **Use case**: Compare evolved variants against existing approaches
- **Benefit**: Quantify improvement delta over SOTA methods

### Darwin → Reproduce
- **Use case**: Generate reproduction blueprint for most feasible variant
- **Benefit**: Rapidly prototype evolved idea with concrete implementation steps

---

## 📈 Success Metrics

| Metric | Target | Measurement |
|--------|---------|-------------|
| Novelty Score | ≥ L3 per variant | INNOVATION_LEVELS framework |
| Feasibility | ≥ Medium (2/3) | Expert review + resource check |
| Clinical Relevance | ≥ V2 potential | Validation level assessment |
| Execution Time | < 30 seconds | API response time |
| User Satisfaction | ≥ 4.0/5.0 | Feedback rating |

---

## 🚀 Future Enhancements (v2.0)

- [ ] **Multi-seed evolution**: Combine multiple seed ideas
- [ ] **Literature-grounded evolution**: Auto-search papers for inspiration
- [ ] **Collaborative evolution**: Team-based operator selection
- [ ] **Historical success database**: Learn from past evolutions
- [ ] **Real-time novelty check**: Cross-check against arXiv/patents during evolution

---

*Last Updated: 2026-01-15*  
*Protocol Version: DARWIN-v1.0*  
*Integration: SKILL ENGINE v2.0*
