# Biomed Research Accelerator — README & 使用指南

## 一、Skill 概述

**Biomed Research Accelerator** 是一个面向生物医学工程（BME）领域的高级研究加速器。它不是一个简单的文献检索工具，而是一个具备**独立推理能力**的研究顾问——能够从生理学第一性原理出发，对论文进行致命缺陷检测、创新层级评估、实验复现拆解、前沿趋势预测，并生成可直接执行的研究方案。

### 核心定位

| 传统工具           | 本 Skill                          |
| ------------------ | --------------------------------- |
| 被动摘要论文       | 主动拆解论文，暴露致命缺陷        |
| 仅报告 AUC 数字    | 追问 AUC 是否改变临床结局         |
| "这篇论文提出了 X" | "这篇论文的 FB-5 对比公平性是 🔴" |
| 数据库匹配         | 从生理学可行性推理，不依赖撞库    |
| 评估已发表工作     | 预测下一前沿 + 设计新实验         |

### 核心能力一览

1. **文献快速拆解** — 单篇论文结构化分解 + 11项致命阻断器检测
2. **多论文对比分析** — 跨论文方法/数据/创新对比 + 差距识别
3. **实验复现蓝图** — 逐步复现方案 + 参数估计 + 陷阱预警
4. **范式分析** — 同领域方法全景 + SOTA 演进路线 + 选型指南
5. **证据验证** — 科学声明的证据强度评估 + 矛盾证据检索
6. **数据集与实验指导** — 数据集推荐 + 实验路线图 + 预处理管线 + 架构推荐
7. **全文深度学习与撞库整合** — 多源获取论文全文，10维度深度提取，自动整合到参考文件
8. **BME工程视角评估** — 传感器-算法联合评估、仪器工程维度、医疗器械监管路径、生物相容性分析
9. **计算生物力学仿真验证** — 网格收敛(GCI)、时间步收敛、求解器收敛、质量/能量守恒、代码验证(MMS)
10. **生物信号处理管线** — ECG/PPG/EEG/EDA/EMG/RSP标准化处理、HRV分析、运动伪影处理、跨信号延迟校正
11. **数字病理与全切片成像** — WSI处理管线、染色标准化、核分割、空间图构建、病理AI验证
12. **FDA医疗器械监管数据** — 510k/PMA/UDI/不良事件/召回查询、SaMD/PCCP框架、EU MDR+AI Act
13. **多目标优化与BME器件设计** — Pareto前沿、NSGA-II/III、植入物/电极/传感器/假体多目标权衡
14. **贝叶斯建模与不确定性量化** — 临床试验设计、设备安全裕度、传感器校准、患者特异性建模
15. **临床AI可解释性** — SHAP特征重要性、SaMD监管审计、公平性审计、多模态BME系统解释
16. **生存分析与BME临床结局** — Kaplan-Meier、Cox PH、竞争风险、设备生存率、事件驱动样本量
17. **临床试验匹配** — ClinicalTrials.gov设备试验检索、入排标准解析、匹配评分、缺失数据清单
18. **蛋白质结构与药物设计** — AlphaFold2/ESMFold/DiffDock/Boltz、pLDDT/ipTM阈值、自洽性验证
19. **代谢建模** — FBA/FVA/基因敲除/通量采样、代谢工程、组织工程营养消耗预测
20. **癌症依赖性图谱** — DepMap CRISPR Chronos、药物敏感性、合成致死、诊断设备靶标验证
21. **离散事件仿真与医疗系统** — SimPy资源建模、临床流程优化、设备部署容量规划
22. **药物基因组学与精准医疗设备** — ClinPGx/CPIC/PharmGKB、伴随诊断设计、PGx芯片
23. **空间转录组与组织工程** — 组织结构分析、配体-受体预测、干细胞微环境、构建体设计
24. **质谱与BME生物标志物发现** — mzML/MGF处理、光谱匹配、化合物鉴定、代谢组学QC
25. **糖工程与生物制药** — N/O糖基化分析、Fc糖基化ADCC优化、生物类似物表征
26. **BME研究基金申请** — NIH R01/SBIR、NSF ENG/BME、DARPA BTO/MTO、FDA监管科学
27. **BME假设生成** — 数据驱动/文献-数据协同/机制组合、系统假设探索

---

## 二、知识库结构

Skill 依赖 `references/` 目录下的 12 个结构化参考文件。每次响应前，会自动加载相关文件（最多 4 个）。

### 参考文件一览

| 文件                                     | 覆盖领域                                                                                                                                                                                                  | 触发关键词示例                                                                                                             |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `ecg-methodology.md`                     | ECG 里程碑论文、方法匹配矩阵、可穿戴 ECG、AI-ECG 跨疾病筛查                                                                                                                                               | ECG, arrhythmia, AF, QRS, cardiac                                                                                          |
| `eeg-bci-methodology.md`                 | EEG/BCI 里程碑论文、CSP 管线、睡眠分期、SSVEP、实时 BCI、颅内 EEG                                                                                                                                         | EEG, BCI, sleep, motor imagery, SSVEP                                                                                      |
| `deep-learning-bme.md`                   | DL 架构选型、训练协议、GNN、扩散模型、SSL、蒸馏、联邦学习、不确定性量化、XAI、多模态 VLM、合成数据、医学 AI 基准、罕见病 AI、对抗鲁棒性、持续学习、域适应                                                 | CNN, Transformer, GNN, diffusion, federated, XAI, VLM, adversarial, continual learning                                     |
| `clinical-statistical-framework.md`      | TRIPOD/STARD、监管科学(FDA/EU AI Act)、因果推断、生存分析、竞争风险、缺失数据、CDSS、RL 治疗优化、急诊/重症 AI、儿科/新生儿 AI、慢性病 AI、神经病学 AI、心血管 AI、传染病 AI、呼吸 AI、妇产科 AI、麻醉 AI | FDA, causal, survival, Cox, sepsis, NICU, diabetes, Alzheimer's, echocardiography, AMR, COPD, preeclampsia, anesthesiology |
| `signal-processing-foundations.md`       | ECG/EEG/PPG 管线、HRV 分析、听诊/肺音、语音生物标志物、可穿戴部署、康复 AI、高级 PPG、BCG/SCG                                                                                                             | preprocessing, PPG, wearable, rehabilitation, ballistocardiography, SCG                                                    |
| `medical-imaging-methodology.md`         | 放射学 AI、病理 WSI、分割(nnU-Net/SAM)、基础模型、内镜/眼科 AI、手术 AI、皮肤科 AI、肿瘤 AI、放射科工作流 AI、血液科 AI、肌骨 AI                                                                          | radiology, pathology, segmentation, CT, MRI, surgical AI, dermatology, hematology, fracture                                |
| `clinical-nlp-llm-methodology.md`        | 临床 NER、LLM 微调、RAG、Prompt 工程、LLM 安全、医学知识图谱、精神健康 AI                                                                                                                                 | NLP, LLM, RAG, NER, knowledge graph, UMLS, mental health                                                                   |
| `genomics-bioinformatics-methodology.md` | AlphaFold、单细胞、GWAS、RNA-seq、AI 药物发现、空间转录组、长读长测序、多组学、CRISPR AI、表观组学、蛋白质组学、代谢组学                                                                                  | genomics, single-cell, GWAS, drug discovery, spatial, CRISPR, proteomics                                                   |
| `physionet-datasets.md`                  | 数据集参考表、MIMIC-IV 子模块、实验路线图、认证指南                                                                                                                                                       | PhysioNet, dataset, MIMIC, ECG benchmark                                                                                   |
| `database-api-guide.md`                  | 全部数据库 URL、API 端点、路由指南（影像/基因组/药物/AI 模型/真实世界数据）                                                                                                                               | literature search, API, TCIA, GDC, Hugging Face                                                                            |
| `research-ethics-fairness.md`            | 偏见评估、公平性指标、知情同意、隐私保护、AI 问责、TRUST 框架、低资源/全球健康 AI                                                                                                                         | ethics, fairness, bias, consent, privacy, global health                                                                    |
| `reproducibility-infrastructure.md`      | 可复现性栈、Docker 模板、模型卡、数据表、MLOps、模型漂移检测、AI 部署实施科学                                                                                                                             | reproducibility, Docker, MLOps, deployment, implementation science                                                         |

### 文件加载规则

1. **始终首先加载** `research-synthesis-matching.md` — 它是"大脑"，包含路由算法
2. 根据路由算法输出加载领域特定参考文件
3. 单次响应最多加载 4 个参考文件
4. 跨领域查询：加载 `clinical-statistical-framework.md` 作为桥接 + 两个领域文件
5. 影像查询：`medical-imaging-methodology.md` + `database-api-guide.md`
6. NLP/LLM 查询：`clinical-nlp-llm-methodology.md` + `clinical-statistical-framework.md`
7. 基因组查询：`genomics-bioinformatics-methodology.md` + `database-api-guide.md`
8. 监管/临床部署：`clinical-statistical-framework.md` + `research-ethics-fairness.md`
9. 可复现性/基础设施：`reproducibility-infrastructure.md` + `deep-learning-bme.md`

---

## 三、六大核心模块使用指南

### Module 1：文献快速拆解

**何时使用**：拿到一篇论文，想快速了解其核心内容、致命缺陷和可复现性

**输入**：单篇论文（标题、摘要或全文）

**输出结构**：

```
## Paper Decomposition
**Problem**: [一句话问题陈述]
**Gap**: [此工作之前缺少什么]
**Method**: [2-3句核心技术贡献]
**Dataset**: [数据集名称、规模、访问方式]
**Experiment**: [实验设置和评估协议]
**Results**: [关键定量结果，含精确数字]
**Limitations**: [作者自述 + 审稿人识别]
**Reproducibility**: [需要什么、缺少什么、难度 ★-★★★★★]

### ⚡ Fatal Blockers (11项强制检测)
| # | 检查项 | 评级 | 详情 |
FB-1 数据可用性 / FB-2 代码可用性 / FB-3 利益冲突 / FB-4 标注质量
FB-5 对比公平性 / FB-6 外部验证 / FB-7 复现路径 / FB-8 标签噪声
FB-9 人口学偏差 / FB-10 因果声明 / FB-11 样本量 vs 复杂度

**Reproducibility Verdict**: YES / PARTIAL / NO
```

**使用示例**：

> "帮我拆解这篇论文：Attention-Based Deep Learning for ECG Arrhythmia Detection, Nature Medicine 2024"

---

### Module 2：多论文对比分析

**何时使用**：需要比较两篇或多篇论文的方法、数据、创新性差异

**输入**：两篇或以上论文

**输出结构**：

```
## Comparative Analysis
### Method Differences [方法对比表]
### Dataset Differences [数据集差异]
### Benchmark Differences [基准差异]
### Innovation Comparison [创新对比：什么是真正新颖 vs 增量]
### Actionable Research Gaps [可操作的研究差距，含可行性评估]
### Literature Discovery [差距→数据库→查询建议]
```

**使用示例**：

> "比较 CheXnet (Rajpurkar 2017) 和 AlphaFold2 (Jumper 2021) 的创新层级差异"

---

### Module 3：实验复现蓝图

**何时使用**：想要复现某篇论文的实验，需要逐步拆解方案

**输入**：含实验内容的论文

**输出结构**：

```
## Experiment Reproduction Blueprint
### Experiment Flow [数据→预处理→特征→模型→后处理→评估]
### Data Acquisition Plan [数据集|来源|访问方式|工具]
### Step-by-Step Reproduction [步骤|操作|详情|代码提示|陷阱]
### Parameter Estimation [参数|论文值|缺失时最佳猜测|置信度]
### Pseudocode-Level Framework [语言无关的伪代码]
### Reproduction Difficulty [★★★★☆ + 瓶颈 + 关键风险]
### Official Code Check [GitHub/补充材料/Papers With Code]
```

**使用示例**：

> "帮我复现这篇论文的实验：Self-supervised ECG Representation Learning for Arrhythmia Detection"

---

### Module 4：范式分析

**何时使用**：想了解某领域的常见方法范式、SOTA 演进路线、如何选择方法

**输入**：领域关键词或"similar/alternative/paradigm"类问题

**输出结构**：

```
## Similar Experiment Paradigm Analysis
### Common Paradigms [范式|代表论文|典型性能|优缺点]
### SOTA Roadmap [SOTA 方法演进]
### Paradigm Selection Guide [目标→推荐范式→关键参考]
### Relevant Datasets [数据集推荐及任务适配性]
```

**使用示例**：

> "ECG 心律失常检测有哪些主流范式？各有什么优缺点？"

---

### Module 5：证据验证

**何时使用**：需要验证某个科学声明的证据强度

**输入**：一个科学声明

**输出结构**：

```
## Evidence Verification Report
**Claim**: [被评估的声明]
### Supporting Evidence [来源|类型|强度|关键发现]
### Contradictory Evidence [来源|类型|强度|关键发现]
### Evidence Strength Rating [Strong/Moderate/Weak/Insufficient]
### Evidence Level [I-VI]
### Cross-Reference Sources [推荐数据库]
### Verdict [明确评估 + 置信度]
### ⚠️ Uncertainty Flags [无法确认的方面]
```

**使用示例**：

> "AI 读胸片的准确率已经超越放射科医生，这个说法有充分证据吗？"

---

### Module 6：数据集与实验指导

**何时使用**：需要数据集推荐、实验路线图、预处理管线、架构推荐

**输入**：关于数据集、实验或生物信号处理的问题

**输出结构**：

```
## Research Guidance
### Dataset Recommendation [匹配用户任务的数据集]
### Experiment Roadmap [ECG心律失常/睡眠分期/运动想象BCI/ICU预测]
### Preprocessing Pipeline [信号类型的标准管线]
### Architecture Recommendation [基于数据量和任务的架构选择]
### Evaluation Protocol [合适的指标和统计检验]
```

**使用示例**：

> "我想做 ECG 睡眠分期，推荐什么数据集和实验方案？"

---

## 四、自动推理协议（8步强制执行）

每次响应前，Skill 会自动执行以下 8 步协议（不会在输出中显示步骤本身，而是将结果嵌入结构化输出）：

| 步骤     | 名称               | 作用                                                                                                                                |
| -------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Step 1   | **文献意图识别**   | 将用户任务分类为 6 种模式：QUICK_READ / EVIDENCE_VERIFY / EXPERIMENT_REPRODUCE / METHOD_COMPARE / RESEARCH_IDEATION / DATASET_MATCH |
| Step 2   | **参考匹配**       | 提取信号/方法/任务/评估关键词 → 选择领域参考文件（最多 4 个）                                                                       |
| Step 2.5 | **论文类型分类**   | 识别论文类型（原创研究/综述/AI发现/数据集/竞赛/基础模型/数字孪生）→ 选择对应评估协议                                                |
| Step 3   | **致命阻断器检测** | 11 项 FB 检测（FB-1 到 FB-11），任何 🔴 必须优先输出                                                                                |
| Step 4   | **深层探针**       | 对每个关键声明生成对抗性问题：WHY/WHAT/WHO/HOW/WHERE                                                                                |
| Step 5   | **对抗性科学检查** | 评估矛盾证据/统计漏洞/复现风险/隐藏假设/数据泄漏/生态偏差                                                                           |
| Step 6   | **复现性提取**     | 提取数据/预处理/协议/模型/超参/评估/缺失项                                                                                          |
| Step 7   | **创新与前沿评估** | 运行创新层级协议 + 前沿检测协议（详见下文）                                                                                         |
| Step 8   | **推理链整合**     | 8 条强制链连接（性能→临床、创新→前沿、失败→补救等）                                                                                 |

---

## 五、创新评估框架

### 创新层级（L1-L5）

| 层级 | 名称       | 含义                                                  | 示例                                                           |
| ---- | ---------- | ----------------------------------------------------- | -------------------------------------------------------------- |
| L1   | 增量改进   | 已有方法的小幅优化                                    | 换个 loss 函数提升 0.5% AUC                                    |
| L2   | 应用级创新 | 新组合/新应用/新基准                                  | L2b鲁棒性 / L2c基准 / L2d监管 / L2e安全 / L2f AI驱动实验自动化 |
| L3   | 方法级创新 | 新方法/新架构                                         | Transformer (2017)                                             |
| L4   | 范式级创新 | 改变研究方式                                          | BERT 预训练范式                                                |
| L5   | 颠覆级创新 | L5a: 首次超越人类 / L5b: 解决历史难题 / L5c: 全球颠覆 | AlphaFold2 (L5b), CheXnet (L5a)                                |

### 关键评估规则

- **临床验证 ≠ L3+ 创新**：创新归原创概念论文，不归临床验证论文
- **术语膨胀检测**：声称 "digital twin" / "foundation model" / "zero-shot" 但实质不符 → 降级
- **LLM 捷径检测**：GPT 读 ECG 图像诊断 → 可能是读纸上的文字而非波形 → 创新降为 L2
- **融合收益评估**：多模态 ΔAUC < 0.02 → 标记为 Marginal，需论证额外复杂度是否值得
- **信息论可行性**：ECG 预测 10 年风险 → 不可行（ECG 反映当前，不反映未来）
- **子领域差异化**：创新层级 = 声称子领域中的最低分，非最高分

### 前沿阶段时间演变

| 阶段                 | 含义                           | 典型时长 |
| -------------------- | ------------------------------ | -------- |
| Emerging             | 刚出现，少量论文               | 0-1 年   |
| Frontier             | 活跃研究，快速进展             | 1-3 年   |
| Established-Standard | 成为主流方法                   | 3-5 年   |
| Established-Classic  | 经典方法，新论文引用但不再改进 | 5+ 年    |
| Declining            | 被更好方法取代                 | -        |

---

## 六、路由逻辑

根据用户输入自动选择模块：

| 用户输入特征                             | 路由到                                                                                         |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 单篇论文                                 | Module 1（拆解）                                                                               |
| 2+ 篇论文 / 对比                         | Module 2（对比）                                                                               |
| "复现/复刻/实现"                         | Module 3（复现）                                                                               |
| "类似/替代/范式"                         | Module 4（范式分析）                                                                           |
| "验证/真假/证据/声明"                    | Module 5（证据检查）                                                                           |
| "PhysioNet/数据集/ECG/EEG/BCI"           | Module 6（数据集指导）                                                                         |
| "选题/gap/idea/研究方向"                 | Module 1 + Module 2 → 研究构思                                                                 |
| "药物/化合物/靶点"                       | Module 5 + database-api-guide.md                                                               |
| "临床试验/证据"                          | Module 5 + database-api-guide.md                                                               |
| "基因/蛋白质/基因组"                     | database-api-guide.md（TIER 3）                                                                |
| "传感器/可穿戴/植入/POC"                 | signal-processing-foundations.md + clinical-statistical-framework.md                           |
| "医疗器械/510k/SaMD/PCCP"                | clinical-statistical-framework.md（监管）+ reproducibility-infrastructure.md                   |
| "生物材料/组织工程/生物相容性"           | clinical-statistical-framework.md（监管）+ genomics-bioinformatics-methodology.md              |
| "FEA/CFD/仿真/网格/生物力学建模"         | deep-learning-bme.md（物理信息）+ signal-processing-foundations.md                             |
| "HRV/ECG/PPG/EDA/EMG/生物信号"           | signal-processing-foundations.md + ecg-methodology.md                                          |
| "病理/WSI/全切片/染色/数字病理"          | medical-imaging-methodology.md + deep-learning-bme.md                                          |
| "实验室自动化/液体处理/高通量"           | reproducibility-infrastructure.md + experimental-design-methodology.md                         |
| "临床报告/CARE/CSR/ICH/SAE"              | clinical-documentation-decision-support.md                                                     |
| "专利/USPTO/IP/先验技术/自由实施"        | database-api-guide.md（TIER 19）+ clinical-statistical-framework.md（监管）                    |
| "生物相容性/ISO 10993/细胞毒性/植入安全" | clinical-statistical-framework.md（监管）+ drug-discovery-pharmacology-methodology.md（ADMET） |
| "撞库/学习论文"                          | Step 0 全文深度学习 → 10维度提取 → 参考文件整合                                                |
| "多目标优化/Pareto/权衡/器件设计"        | deep-learning-bme.md + clinical-statistical-framework.md                                       |
| "贝叶斯/不确定性量化/MCMC/后验"          | clinical-statistical-framework.md + deep-learning-bme.md                                       |
| "SHAP/可解释/XAI/特征重要性"             | deep-learning-bme.md + clinical-statistical-framework.md（监管）                               |
| "生存分析/Kaplan-Meier/Cox/设备生存"     | clinical-statistical-framework.md + database-api-guide.md                                      |
| "临床试验匹配/入排标准/试验检索"         | database-api-guide.md + clinical-statistical-framework.md                                      |
| "蛋白质结构/AlphaFold/药物设计/对接"     | genomics-bioinformatics-methodology.md + database-api-guide.md                                 |
| "代谢建模/FBA/代谢工程/通量"             | genomics-bioinformatics-methodology.md + deep-learning-bme.md                                  |
| "DepMap/癌症依赖/靶标/合成致死"          | genomics-bioinformatics-methodology.md + database-api-guide.md                                 |
| "SimPy/离散事件/临床流程/容量规划"       | reproducibility-infrastructure.md + clinical-statistical-framework.md                          |
| "药物基因组/PGx/CYP2D6/伴随诊断"         | genomics-bioinformatics-methodology.md + clinical-statistical-framework.md                     |
| "空间转录组/组织工程/配体-受体"          | genomics-bioinformatics-methodology.md + medical-imaging-methodology.md                        |
| "质谱/代谢组学/生物标志物/mzML"          | genomics-bioinformatics-methodology.md + database-api-guide.md                                 |
| "糖基化/糖工程/Fc/ADCC/生物类似物"       | genomics-bioinformatics-methodology.md + clinical-statistical-framework.md                     |
| "基金/NIH/NSF/DARPA/SBIR/申请"           | research-ethics-fairness.md + clinical-statistical-framework.md                                |
| "假设生成/研究假设/假设探索"             | deep-learning-bme.md + research-synthesis-matching.md                                          |
| 模糊输入                                 | 询问澄清问题 + 提供模式选项                                                                    |

---

## 七、防幻觉机制

### 防幻觉规则

1. **不编造结论**：未看全文 → 标注 "⚠️ 仅基于摘要/元数据"
2. **不捏造细节**：未声明的超参数/样本量/结果 → 标记 `[NOT STATED — ESTIMATE]`
3. **显式不确定性**：未确认声明 → 前缀 `⚠️ UNCERTAIN:` 或标记 `[INFERENCE]` vs `[FACT]`
4. **事实 vs 推理分离**：始终区分 `[FACT]` 和 `[INFERENCE]`
5. **缺失信息透明**：醒目标记缺失的复现信息
6. **不伪造引用**：不确定时直接说明
7. **数据库 URL 准确**：仅使用 database-api-guide.md 中的 URL
8. **API 准确**：仅推荐 database-api-guide.md 中记录的端点
9. **全文优先**：全文可用时，所有提取事实标记 `[FACT — full text]`，不降级为不确定
10. **BME特有防幻觉**：不伪造仿真收敛数据(GCI)、传感器指标(LOD/漂移)、生物相容性声明(需ISO 10993)、监管状态(510k≠批准)、不混淆台架性能与临床性能、不伪造生物信号处理指标、不将AlphaFold预测等同于实验结构、不将FBA预测等同于生物现实、不将细胞系依赖性等同于肿瘤依赖性、不将AI试验匹配等同于确认入组、不伪造药物基因组学等位基因频率、不将MS1鉴定等同于确认化合物

---

## 八、Darwin 进化协议

Skill 内置持续进化机制，借鉴 autoresearch + darwin-skill 的自主实验循环。

### 设计哲学

1. **单一可编辑资产** — 每次只改一个文件（SKILL.md 或 references/\*.md）
2. **双重评估** — 结构评分（静态分析）+ 效果验证（跑测试看输出）
3. **棘轮机制** — 只保留改进，自动回滚退步
4. **独立评分** — 评分用子agent，避免「自己改自己评」的偏差
5. **人在回路** — 每个优化维度完成后暂停，用户确认再继续

### 10 维评估体系（总分 100）

| 维度             | 权重 | 说明                                   |
| ---------------- | ---- | -------------------------------------- |
| Frontmatter 质量 | 5    | name/description/触发词规范、≤1024字符 |
| 工作流清晰度     | 10   | 步骤明确、有输入/输出                  |
| 边界条件覆盖     | 10   | Fatal Blocker 完整性、异常处理         |
| 创新评估精度     | 10   | L1-L5 分类边界清晰、子类型完整         |
| 前沿检测精度     | 10   | 7 信号可操作、时间演变完整             |
| 指令具体性       | 10   | 不模糊、有参数/格式/示例               |
| 真实性           | 10   | 输出准确反映学术共识、无幻觉           |
| 前沿性           | 10   | 识别最新趋势、前沿阶段判断准确         |
| 准确性           | 10   | 创新层级精确、致命问题无遗漏           |
| 全面性           | 15   | 覆盖关键维度、跨领域能力、实测表现     |

### 优化循环

```
Phase 0: 初始化 → 确认优化范围 + 创建git分支 + 读取历史基线
Phase 0.5: 测试确认 → 展示 test-prompts.json 供用户确认（复用/重写/追加）
Phase 1: 基线评估 → 结构评分(维度1-9) + 效果评分(子agent独立测试维度10) → 展示评分卡 → 暂停等用户确认
Phase 2: 优化循环 → 诊断最低维度 → 提出改进 → 执行+git commit → 子agent重评 → 棘轮决策 → 人类检查点
Phase 2.5: 探索性重写（可选）→ 连续2维度涨不动时 → 征得用户同意后重写瓶颈维度
Phase 3: 汇总报告 → 总览 + 分数变化表 + 主要改进 + 下轮建议
```

### 棘轮机制

- 改进后总分必须**严格高于**改进前才保留
- 退步必须回滚（git revert 或文件备份恢复）
- 每轮只改一个维度
- 真实性优先：宁可保守评分，不可虚高创新层级
- 评估独立性：效果维度必须用子agent或至少干跑验证
- BME领域对齐：所有新增内容必须符合BME核心定位

### 优化策略库

| 优先级 | 类别     | 策略                                      |
| ------ | -------- | ----------------------------------------- |
| P0     | 效果问题 | 输出偏离意图/带skill比不带差/格式不符预期 |
| P1     | 结构问题 | 缺触发词/缺Phase结构/缺用户确认检查点     |
| P2     | 具体问题 | 步骤模糊/缺输入输出规格/缺异常处理        |
| P3     | 可读问题 | 段落过长/重复描述/缺速查                  |

### 使用方式

| 模式       | 触发词                        | 执行范围                   |
| ---------- | ----------------------------- | -------------------------- |
| 全量优化   | "优化skill"/"达尔文"/"darwin" | Phase 0-3 完整流程         |
| 单个优化   | "优化XX维度"                  | 只对指定维度执行 Phase 1-2 |
| 仅评估不改 | "评估skill质量"/"skill评分"   | 只执行 Phase 0.5-1         |
| 查看历史   | "看看优化历史"                | 读取并展示 results.tsv     |

### 测试框架

`test-prompts.json` 包含 40 个基础测试 prompt，覆盖 20 个核心场景，可通过组合模板扩展至 1000+ 测试变体：

| 测试类别     | 覆盖场景                                    |
| ------------ | ------------------------------------------- |
| 创新评估     | AlphaFold2 层级、CheXnet vs AlphaFold2 对比 |
| LLM 捷径检测 | GPT-4o 读 ECG 图像                          |
| 融合收益     | ECG+胸片 ΔAUC=0.01                          |
| 术语膨胀     | "digital twin" 声称检测                     |
| 验证充分性   | MIMIC-IV 内部验证声称超越医生               |
| AI 驱动发现  | LLM 设计 CRISPR 实验                        |
| 偏见部署失败 | 种族偏见导致误诊差异                        |
| 前沿演变     | 2020 vs 2025 ECG-DL                         |
| 联邦学习     | 5 家医院 non-iid COVID-CT                   |
| 资源不对称   | Google Health 闭源模型                      |
| ...          | 共 20 类场景                                |

---

## 九、使用示例

### 示例 1：论文拆解

**输入**：

> "帮我分析这篇论文：Attention-Based Deep Learning for ECG Arrhythmia Detection"

**Skill 会做什么**：

1. 识别意图 → QUICK_READ
2. 加载 ecg-methodology.md + research-synthesis-matching.md
3. 运行 11 项 Fatal Blocker 检测
4. 运行创新层级评估
5. 输出结构化拆解 + 复现性判定

### 示例 2：创新性质疑

**输入**：

> "GPT-4o 读 ECG 图像诊断心律失常，准确率 83%，这算创新吗？有什么潜在问题？"

**Skill 会做什么**：

1. 触发 LLM Visual Shortcut Detection
2. 标记 ECG 纸上可能含有诊断文字
3. 区分 LLM 读文字 vs 读波形
4. 创新层级判定为 L2（应用级），非 L3+
5. 列出潜在问题清单

### 示例 3：实验复现

**输入**：

> "帮我复现这篇论文的实验：Self-supervised ECG Representation Learning"

**Skill 会做什么**：

1. 识别意图 → EXPERIMENT_REPRODUCE
2. 加载 ecg-methodology.md + deep-learning-bme.md + physionet-datasets.md
3. 输出逐步复现蓝图（数据获取→预处理→模型→训练→评估）
4. 标记缺失参数并提供最佳猜测
5. 评估复现难度和关键风险

### 示例 4：选题指导

**输入**：

> "我想做 ECG 相关的研究，有什么好的选题方向？"

**Skill 会做什么**：

1. 识别意图 → RESEARCH_IDEATION
2. 加载 ecg-methodology.md + research-synthesis-matching.md
3. 运行 Module 1 + Module 2 组合
4. 输出可操作的研究差距（含可行性评估）
5. 推荐数据集和方法

### 示例 5：证据验证

**输入**：

> "AI 读胸片的准确率已经超越放射科医生，这个说法有充分证据吗？"

**Skill 会做什么**：

1. 识别意图 → EVIDENCE_VERIFY
2. 加载 medical-imaging-methodology.md + clinical-statistical-framework.md
3. 检索支持证据和矛盾证据
4. 评估证据强度和等级
5. 输出明确判定 + 不确定性标记

---

## 十、临床验证层级

| 层级 | 名称       | 含义                     |
| ---- | ---------- | ------------------------ |
| V0   | 无验证     | 仅算法输出               |
| V1   | 内部验证   | 同机构回溯验证           |
| V2   | 外部验证   | 不同机构/人群验证        |
| V3   | 前瞻性静默 | 前瞻运行但不干预临床决策 |
| V4   | 前瞻性干预 | 前瞻运行并影响临床决策   |
| V5   | RCT        | 随机对照试验             |

**关键规则**：

- V0-V1 → 标记"验证有限"
- 声称"超越医生" → 需 V3+ 验证
- AUC > 0.9 → 必须运行 T1-T6 临床转化链

---

## 十一、性能基线参考值

### 诊断准确率基线

| 任务         | 随机 | 人类   | 最佳 AI                       |
| ------------ | ---- | ------ | ----------------------------- |
| 罕见病表型   | <1%  | 20-35% | 33-39%                        |
| ECG 诊断     | -    | 75-85% | 85-95%                        |
| 胸片         | -    | 70-80% | 85-92%                        |
| 脓毒症 AUROC | -    | -      | 70-85% (注意站点特异性过拟合) |

### 药物发现命中率

| 方法           | 命中率    |
| -------------- | --------- |
| HTS            | 0.01-0.1% |
| AI 虚拟筛选    | 5-15%     |
| 生成式从头设计 | 5-20%     |

### 最小临床重要差异 (MCID)

| 指标         | MCID       |
| ------------ | ---------- |
| IPF FVC      | 100-200 mL |
| COPD FEV1    | 100 mL     |
| HF LVEF      | 5%         |
| 糖尿病 HbA1c | 0.5%       |
| 卒中 mRS     | 1 分       |
| 疼痛 NRS     | 2 分       |

**低于 MCID 的改善 = 统计显著但临床无意义**

---

## 十二、文件清单

```
d:\nih-skill\
├── SKILL.md                          # Skill 核心定义文件
├── test-prompts.json                 # 测试 prompt 框架（40 基础 + 1000+ 组合）
├── results.tsv                       # Darwin 进化评估记录
├── README.md                         # 本文件
└── references/
    ├── ecg-methodology.md            # ECG 方法论
    ├── eeg-bci-methodology.md        # EEG/BCI 方法论
    ├── deep-learning-bme.md          # 深度学习 BME
    ├── clinical-statistical-framework.md  # 临床统计框架
    ├── signal-processing-foundations.md   # 信号处理基础
    ├── medical-imaging-methodology.md     # 医学影像方法论
    ├── clinical-nlp-llm-methodology.md    # 临床 NLP/LLM 方法论
    ├── genomics-bioinformatics-methodology.md  # 基因组/生物信息
    ├── physionet-datasets.md         # PhysioNet 数据集指南
    ├── database-api-guide.md         # 数据库与 API 指南
    ├── research-ethics-fairness.md   # 研究伦理与公平性
    ├── research-synthesis-matching.md # 研究综合匹配（路由大脑）
    └── reproducibility-infrastructure.md  # 可复现性基础设施
```

---

## 十三、局限性与最佳实践

### 局限性

1. **全文获取受付费墙限制**：虽然通过 PMC/arXiv/Unpaywall 等多源策略尽可能获取论文全文（详见 SKILL.md Step 0），但部分付费墙论文仅能获取标题+摘要，此时分析基于有限信息并标注不确定性
2. **不替代同行评审**：Skill 的分析是辅助工具，不替代正式同行评审
3. **知识截止**：参考文件需要定期更新（建议 6 个月刷新前沿预测，12 个月刷新参考值）
4. **领域覆盖不均**：BME核心领域（医学影像、生物信号、医疗器械监管、计算生物力学）覆盖较深，部分交叉领域（如牙科AI、兽医AI、法医AI）覆盖有限
5. **语言偏向**：主要覆盖英文文献
6. **撞库学习依赖全文**：撞库学习（将论文知识整合到参考文件）的效果直接取决于全文获取是否成功，仅摘要时整合深度受限

### 最佳实践

1. **提供论文DOI或URL**：提供DOI/URL可触发全文深度学习（Step 0），获取完整实验/数据/方法/思路，远优于仅标题+摘要。撞库学习时DOI/URL是必须的，否则无法获取全文进行深度整合
2. **明确意图**：使用触发词（"学习"/"撞库"/"复现"/"对比"/"验证"）帮助路由，"撞库学习"会自动将论文知识整合到参考文件
3. **交叉验证**：对关键声明，建议同时使用 Module 5 证据验证
4. **关注 🔴 标记**：Fatal Blocker 中的红色标记意味着论文存在根本性问题
5. **定期进化**：使用 Darwin 协议定期评估和改进 Skill 质量
