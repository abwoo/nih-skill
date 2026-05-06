'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useToast,
} from '@/components/ui/use-toast'  // 添加 Toast 支持
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Brain,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Filter,
  Grid3X3,
  Home,
  Lightbulb,
  List,
  Loader2,
  Plus,
  Search,
  Share2,
  Star,
  Tag,
  Target,
  TrendingUp,
  Trash2,
  XCircle
} from 'lucide-react'

interface PaperData {
  id: string
  title: string
  authors: string
  year: number | string
  journal: string
  doi: string
  citationCount?: number
  abstract?: string
  analysis?: PaperAnalysis
  // Enhanced fields from new API
  enhancedScore?: number
  relevanceScore?: number
  freshnessScore?: number
  impactScore?: number
  verified?: boolean
  matchedKeywords?: string[]
  domainRelevance?: string[]
}

interface PaperAnalysis {
  overallScore: {
    quality: number
    importance: number
    actionability: number
    weightedAverage: number
  }
  limitations: {
    overallRiskRating: '🟢 Low' | '🟡 Medium' | '🔴 High'
  }
  innovation: {
    noveltyLevel: 'Incremental' | 'Significant' | 'Breakthrough'
  }
  aiInsights: {
    keyTakeaway: string
    whyItMatters: string
    whatIsMissing: string
    nextSteps: string[]
  }
  methodology: {
    studyDesign: string
    reproducibilityScore: number
  }
}

export function ReferenceManager() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [papers, setPapers] = useState<PaperData[]>([])
  const [selectedPaper, setSelectedPaper] = useState<PaperData | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [analyzeDepth, setAnalyzeDepth] = useState<'quick' | 'standard' | 'deep'>('standard')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [userNotes, setUserNotes] = useState<Map<string, string>>(new Map())
  const [isAddingToReference, setIsAddingToReference] = useState<string | null>(null)
  const [searchMetadata, setSearchMetadata] = useState<any>(null) // Store search metadata
  const [verificationStatus, setVerificationStatus] = useState<any>(null) // Store verification status

  // Toast notification hook
  const { toast } = useToast()

  const handleSearchAndAnalyze = useCallback(async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "请输入搜索关键词",
        description: "在搜索框中输入您想要查找的研究主题",
        variant: "destructive",
      })
      return
    }

    setIsSearching(true)
    setVerificationStatus(null)
    setSearchMetadata(null)

    try {
      toast({
        title: "🔍 正在增强搜索...",
        description: `正在优化查询并从多源数据库检索 "${searchQuery}"`,
        duration: 3000,
      })

      // Use ENHANCED search API (v2.0 with verification)
      const response = await fetch('/api/literature/enhanced-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          options: {
            maxPapers: 10,
            analyzeDepth,
            sources: ['pubmed', 'semantic_scholar'],
            domain: undefined, // Auto-detect from query
            verifyResults: true  // Enable data verification
          }
        })
      })

      const result = await response.json()

      if (result.success) {
        // Store metadata and verification status
        setSearchMetadata(result.metadata)
        setVerificationStatus(result.verificationStatus)

        // Map enhanced results to PaperData format
        const papersWithAnalysis = result.papers.map((paper: any, index: number) => ({
          ...paper,
          id: `paper-${index}`,
          analysis: result.analyses?.[index], // May or may not have LLM analysis
          enhancedScore: paper.enhancedScore,
          relevanceScore: paper.relevanceScore,
          freshnessScore: paper.freshnessScore,
          impactScore: paper.impactScore,
          verified: paper.verified,
          matchedKeywords: paper.matchedKeywords || [],
          domainRelevance: paper.domainRelevance || []
        }))
        setPapers(papersWithAnalysis)

        if (papersWithAnalysis.length > 0) {
          setSelectedPaper(papersWithAnalysis[0])
        }

        // Show verification status in toast
        const verificationEmoji = result.verificationStatus?.overall === 'VERIFIED' ? '✅' :
                                result.verificationStatus?.overall === 'PARTIAL' ? '⚠️' : '❌'

        toast({
          title: `${verificationEmoji} 增强搜索完成！`,
          description: `找到 ${papersWithAnalysis.length} 篇论文 | 数据验证: ${result.verificationStatus?.overall} (${result.verificationStatus?.papersVerified}/${result.verificationStatus?.papersTotal}) | 耗时 ${result.executionTime}ms`,
          duration: 5000,
        })
      } else {
        throw new Error(result.error || 'Enhanced search failed')
      }
    } catch (error) {
      console.error('Enhanced search failed:', error)
      toast({
        title: "搜索失败",
        description: error instanceof Error ? error.message : "无法连接到数据库，请检查网络连接",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }, [searchQuery, analyzeDepth, toast])

  const toggleFavorite = useCallback((paperId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(paperId)) {
        newFavorites.delete(paperId)
        toast({
          title: "已取消收藏",
          description: "论文已从收藏夹移除",
        })
      } else {
        newFavorites.add(paperId)
        toast({
          title: "已添加到收藏夹！",
          description: "论文已保存到您的个人图书馆",
        })
      }
      return newFavorites
    })
  }, [toast])

  const addToReferenceFile = async (paper: PaperData, fileName: string) => {
    if (isAddingToReference === paper.id) return

    setIsAddingToReference(paper.id)

    try {
      toast({
        title: "正在添加...",
        description: `正在将论文添加到 ${fileName}`,
      })

      const response = await fetch(`/api/references/${fileName}/user-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          papers: [{ doi: paper.doi }],
          options: {
            autoAnalyze: false,
            addToPersonalLibrary: true
          }
        })
      })

      const result = await response.json()

      if (result.success && result.addedPapers > 0) {
        toast({
          title: "✅ 成功添加！",
          description: `${result.addedPapers} 篇论文已添加到 ${fileName}`,
        })

        // 自动收藏该论文
        if (!favorites.has(paper.id)) {
          setFavorites(prev => new Set(prev).add(paper.id))
        }
      } else if (result.success && result.skippedPapers > 0) {
        toast({
          title: "论文已存在",
          description: `该论文已经在 ${fileName} 中（跳过 ${result.skippedPapers} 篇重复）`,
          variant: "default",
        })
      } else {
        throw new Error(result.error || 'Failed to add paper')
      }
    } catch (error) {
      console.error('Failed to add to reference:', error)
      toast({
        title: "❌ 添加失败",
        description: error instanceof Error ? error.message : "无法添加论文，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsAddingToReference(null)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRiskBadgeColor = (risk: string) => {
    if (risk.includes('Low')) return 'bg-green-100 text-green-800'
    if (risk.includes('Medium')) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getNoveltyBadgeVariant = (novelty: string) => {
    if (novelty === 'Breakthrough') return 'default'
    if (novelty === 'Significant') return 'secondary'
    return 'outline'
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="h-[3.5rem] border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50 flex items-center justify-between px-4">
        {/* Left: Back to Home + Title */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1 p-2 h-8 w-8 text-muted-foreground hover:text-primary">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Home className="w-5 h-5 text-muted-foreground" />
          </Link>

          <div className="flex items-center gap-2 ml-2">
            <Library className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-teal grid place-items-center overflow-hidden text-white p-1.5" />
            <div>
              <h1 className="text-[13px] font-bold tracking-tight leading-none">Reference Manager</h1>
              <p className="text-[9px] text-muted-foreground leading-tight">Search • Analyze • Organize</p>
            </div>
          </div>
        </div>

        {/* Right: Stats */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              {papers.length} papers
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              {favorites.size} favorites
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-6 space-y-6">
        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search for papers... (e.g., 'deep learning ECG arrhythmia detection 2024')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchAndAnalyze()}
                  className="pl-10"
                />
              </div>

              <Select value={analyzeDepth} onValueChange={(v: any) => setAnalyzeDepth(v)}>
                <SelectTrigger className="w-[180px]">
                  <Brain className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Analysis Depth" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quick">Quick Analysis</SelectItem>
                  <SelectItem value="standard">Standard Analysis</SelectItem>
                  <SelectItem value="deep">Deep Analysis</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={handleSearchAndAnalyze}
                disabled={isSearching || !searchQuery.trim()}
                className="min-w-[160px]"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search & Analyze
                  </>
                )}
              </Button>
            </div>

            {/* Quick Tips */}
            {!papers.length && !isSearching && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                <strong>💡 提示：</strong>
                输入研究主题（如"transformer medical imaging 2024"），系统将实时从PubMed/Semantic Scholar搜索论文，并用AI进行深度分析。
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left: Paper List */}
          <div className={`${selectedPaper ? 'col-span-7 lg:col-span-7' : 'col-span-12'}`}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Search Results ({papers.length} papers)
                    {favorites.size > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {favorites.size} favorited
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {papers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Library className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">No papers yet</p>
                    <p className="text-sm mt-1">
                      Start by searching for a topic you're interested in
                    </p>
                    <div className="mt-4 space-y-2">
                      <p className="text-xs"><strong>Try these examples:</strong></p>
                      {[
                        'deep learning ECG arrhythmia detection',
                        'transformer medical image segmentation',
                        'LLM clinical NLP 2024 2025',
                        'federated learning healthcare privacy'
                      ].map(example => (
                        <button
                          key={example}
                          onClick={() => setSearchQuery(example)}
                          className="block w-full text-left px-3 py-2 text-sm bg-secondary/50 hover:bg-secondary rounded-md transition-colors"
                        >
                          🔍 {example}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : viewMode === 'list' ? (
                  <div className="space-y-3">
                    {papers.map((paper) => (
                      <div
                        key={paper.id}
                        onClick={() => setSelectedPaper(paper)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                          selectedPaper?.id === paper.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium line-clamp-2">{paper.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                              {paper.authors} ({paper.year})
                            </p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {/* Verification Status */}
                              {paper.verified !== undefined && (
                                <Badge variant={paper.verified ? "default" : "destructive"} className="text-xs">
                                  {paper.verified ? '✅ Verified' : '⚠️ Unverified'}
                                </Badge>
                              )}

                              {/* Enhanced Score */}
                              {paper.enhancedScore && (
                                <span className={`text-sm font-bold ${getScoreColor(paper.enhancedScore)}`}>
                                  🔥 {paper.enhancedScore.toFixed(2)}
                                </span>
                              )}

                              {paper.analysis && (
                                <>
                                  <Badge variant={getNoveltyBadgeVariant(paper.analysis.innovation.noveltyLevel)}>
                                    {paper.analysis.innovation.noveltyLevel}
                                  </Badge>
                                  <Badge className={getRiskBadgeColor(paper.analysis.limitations.overallRiskRating)}>
                                    {paper.analysis.limitations.overallRiskRating}
                                  </Badge>
                                  <span className={`text-sm font-medium ${getScoreColor(paper.analysis.overallScore.weightedAverage)}`}>
                                    ⭐ {paper.analysis.overallScore.weightedAverage.toFixed(1)}
                                  </span>
                                </>
                              )}
                              {paper.citationCount && (
                                <span className="text-sm text-muted-foreground">
                                  <TrendingUp className="w-3 h-3 inline mr-1" />
                                  {paper.citationCount} citations
                                </span>
                              )}

                              {/* Domain Tags */}
                              {paper.domainRelevance && paper.domainRelevance.length > 0 && (
                                <div className="flex gap-1">
                                  {paper.domainRelevance.slice(0, 2).map(domain => (
                                    <Badge key={domain} variant="outline" className="text-xs">
                                      {domain}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleFavorite(paper.id)
                              }}
                              title={favorites.has(paper.id) ? 'Remove from favorites' : 'Add to favorites'}
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  favorites.has(paper.id) ? 'fill-yellow-400 text-yellow-400' : ''
                                }`}
                              />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {papers.map((paper) => (
                      <div
                        key={paper.id}
                        onClick={() => setSelectedPaper(paper)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                          selectedPaper?.id === paper.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                        }`}
                      >
                        <h3 className="font-medium line-clamp-3 text-sm">{paper.title}</h3>
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-1">
                          {paper.authors.split(',')[0]} et al. ({paper.year})
                        </p>
                        {paper.analysis && (
                          <div className="mt-2 flex items-center justify-between">
                            <span className={`text-sm font-medium ${getScoreColor(paper.analysis.overallScore.weightedAverage)}`}>
                              {paper.analysis.overallScore.weightedAverage.toFixed(1)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleFavorite(paper.id)
                              }}
                            >
                              <Star
                                className={`w-3 h-3 ${
                                  favorites.has(paper.id) ? 'fill-yellow-400 text-yellow-400' : ''
                                }`}
                              />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Detail Panel */}
          {selectedPaper && (
            <div className="col-span-5 lg:col-span-5">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2 pr-8">
                      {selectedPaper.title}
                    </CardTitle>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(selectedPaper.id)}
                        title={favorites.has(selectedPaper.id) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            favorites.has(selectedPaper.id) ? 'fill-yellow-400 text-yellow-400' : ''
                          }`}
                        />
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`https://doi.org/${selectedPaper.doi}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="overview">
                          <FileText className="w-4 h-4 mr-1" />
                          Overview
                        </TabsTrigger>
                        <TabsTrigger value="analysis">
                          <Brain className="w-4 h-4 mr-1" />
                          Analysis
                        </TabsTrigger>
                        <TabsTrigger value="insights">
                          <Lightbulb className="w-4 h-4 mr-1" />
                          Insights
                        </TabsTrigger>
                        <TabsTrigger value="critique">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Critique
                        </TabsTrigger>
                        <TabsTrigger value="actions">
                          <Target className="w-4 h-4 mr-1" />
                          Actions
                        </TabsTrigger>
                      </TabsList>

                      {/* Overview Tab */}
                      <TabsContent value="overview" className="mt-4 space-y-4">
                        {/* Verification & Enhanced Score Banner */}
                        {(selectedPaper.verified !== undefined || selectedPaper.enhancedScore) && (
                          <div className={`p-3 rounded-lg border ${selectedPaper.verified ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800'}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {selectedPaper.verified !== undefined && (
                                  <span className="text-lg">{selectedPaper.verified ? '✅' : '⚠️'}</span>
                                )}
                                <span className="font-medium text-sm">
                                  {selectedPaper.verified ? 'Data Verified' : 'Verification Pending'}
                                </span>
                              </div>
                              {selectedPaper.enhancedScore && (
                                <div className="text-right">
                                  <div className="text-xs text-muted-foreground">Enhanced Score</div>
                                  <div className={`text-lg font-bold ${getScoreColor(selectedPaper.enhancedScore)}`}>
                                    🔥 {selectedPaper.enhancedScore.toFixed(2)}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Verification Details */}
                            {selectedPaper.verificationDetails && (
                              <div className="mt-2 grid grid-cols-5 gap-2 text-xs">
                                {Object.entries(selectedPaper.verificationDetails).map(([key, value]) => (
                                  <div key={key} className={`text-center p-1 rounded ${value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {value ? '✓' : '✗'} {key.replace(/([A-Z])/g, ' $1').trim()}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Score Breakdown */}
                            {(selectedPaper.relevanceScore || selectedPaper.freshnessScore || selectedPaper.impactScore) && (
                              <div className="mt-2 flex gap-4 text-xs">
                                {selectedPaper.relevanceScore !== undefined && (
                                  <span>🎯 Relevance: {(selectedPaper.relevanceScore * 100).toFixed(0)}%</span>
                                )}
                                {selectedPaper.freshnessScore !== undefined && (
                                  <span>📅 Freshness: {(selectedPaper.freshnessScore * 100).toFixed(0)}%</span>
                                )}
                                {selectedPaper.impactScore !== undefined && (
                                  <span>💥 Impact: {(selectedPaper.impactScore * 100).toFixed(0)}%</span>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        <div>
                          <h4 className="font-medium mb-2">Authors</h4>
                          <p className="text-sm text-muted-foreground">{selectedPaper.authors}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Year</h4>
                            <p className="text-sm">{selectedPaper.year}</p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Journal</h4>
                            <p className="text-sm">{selectedPaper.journal || 'N/A'}</p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Citations</h4>
                            <p className="text-sm">{selectedPaper.citationCount || 'N/A'}</p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">DOI</h4>
                            <a
                              href={`https://doi.org/${selectedPaper.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline break-all"
                            >
                              {selectedPaper.doi || 'N/A'}
                            </a>
                          </div>
                        </div>
                        {selectedPaper.abstract && (
                          <div>
                            <h4 className="font-medium mb-2">Abstract</h4>
                            <p className="text-sm text-muted-foreground line-clamp-6">
                              {selectedPaper.abstract}
                            </p>
                          </div>
                        )}
                      </TabsContent>

                      {/* Analysis Tab */}
                      <TabsContent value="analysis" className="mt-4 space-y-4">
                        {selectedPaper.analysis ? (
                          <>
                            <div>
                              <h4 className="font-medium mb-3">Overall Scores</h4>
                              <div className="space-y-2">
                                {[
                                  { label: 'Quality', value: selectedPaper.analysis.overallScore.quality },
                                  { label: 'Importance', value: selectedPaper.analysis.overallScore.importance },
                                  { label: 'Actionability', value: selectedPaper.analysis.overallScore.actionability },
                                ].map((item) => (
                                  <div key={item.label} className="flex items-center gap-3">
                                    <span className="text-sm w-24">{item.label}</span>
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                      <div
                                        className={`h-2 rounded-full ${
                                          item.value >= 8 ? 'bg-green-500' :
                                          item.value >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
                                        style={{ width: `${item.value * 10}%` }}
                                      />
                                    </div>
                                    <span className={`text-sm font-medium w-8 ${getScoreColor(item.value)}`}>
                                      {item.value}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-3 pt-3 border-t">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">Weighted Average</span>
                                  <span className={`text-2xl font-bold ${getScoreColor(selectedPaper.analysis.overallScore.weightedAverage)}`}>
                                    {selectedPaper.analysis.overallScore.weightedAverage.toFixed(1)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Methodology</h4>
                              <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                                <p><strong>Design:</strong> {selectedPaper.analysis.methodology.studyDesign}</p>
                                <p><strong>Reproducibility:</strong> {selectedPaper.analysis.methodology.reproducibilityScore}/10</p>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Innovation</h4>
                              <Badge variant={getNoveltyBadgeVariant(selectedPaper.analysis.innovation.noveltyLevel)} className="mr-2">
                                {selectedPaper.analysis.innovation.noveltyLevel}
                              </Badge>
                            </div>
                          </>
                        ) : (
                          <p className="text-muted-foreground text-center py-8">
                            No analysis available. Try re-searching with analysis enabled.
                          </p>
                        )}
                      </TabsContent>

                      {/* Insights Tab */}
                      <TabsContent value="insights" className="mt-4 space-y-4">
                        {selectedPaper.analysis?.aiInsights ? (
                          <>
                            <div>
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4" />
                                Key Takeaway
                              </h4>
                              <p className="text-sm bg-blue-50 rounded-lg p-3">
                                {selectedPaper.analysis.aiInsights.keyTakeaway}
                              </p>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Why It Matters</h4>
                              <p className="text-sm text-muted-foreground">
                                {selectedPaper.analysis.aiInsights.whyItMatters}
                              </p>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">What's Missing</h4>
                              <p className="text-sm text-orange-600 bg-orange-50 rounded-lg p-3">
                                {selectedPaper.analysis.aiInsights.whatIsMissing}
                              </p>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Recommended Next Steps</h4>
                              <ul className="space-y-1">
                                {selectedPaper.analysis.aiInsights.nextSteps.map((step, i) => (
                                  <li key={i} className="text-sm flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    {step}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </>
                        ) : (
                          <p className="text-muted-foreground text-center py-8">
                            No insights available.
                          </p>
                        )}
                      </TabsContent>

                      {/* Critique Tab */}
                      <TabsContent value="critique" className="mt-4 space-y-4">
                        {selectedPaper.analysis?.limitations ? (
                          <>
                            <div>
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                Overall Risk Assessment
                              </h4>
                              <Badge className={getRiskBadgeColor(selectedPaper.analysis.limitations.overallRiskRating)} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                                {selectedPaper.analysis.limitations.overallRiskRating}
                              </Badge>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Methodological Limitations</h4>
                              <ul className="space-y-2">
                                {selectedPaper.analysis.limitations.methodologicalLimitations.map((lim, i) => (
                                  <li key={i} className="text-sm flex items-start gap-2 bg-red-50 rounded p-2">
                                    <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                    {lim}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </>
                        ) : (
                          <p className="text-muted-foreground text-center py-8">
                            No critique available.
                          </p>
                        )}
                      </TabsContent>

                      {/* Actions Tab */}
                      <TabsContent value="actions" className="mt-4 space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-medium mb-3">Quick Actions</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" className="justify-start">
                              <Download className="w-4 h-4 mr-2" />
                              Download PDF
                            </Button>
                            <Button variant="outline" className="justify-start">
                              <Share2 className="w-4 h-4 mr-2" />
                              Share Paper
                            </Button>
                            <Button variant="outline" className="justify-start">
                              <Tag className="w-4 h-4 mr-2" />
                              Add Tags
                            </Button>
                            <Button variant="outline" className="justify-start">
                              <FileText className="w-4 h-4 mr-2" />
                              Add Notes
                            </Button>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3">Add to Reference File</h4>
                          <Select onValueChange={(value) => addToReferenceFile(selectedPaper, value)} disabled={isAddingToReference === selectedPaper.id}>
                            <SelectTrigger disabled={isAddingToReference === selectedPaper.id}>
                              {isAddingToReference === selectedPaper.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Adding...
                                </>
                              ) : (
                                <>
                                  <Plus className="w-4 h-4 mr-2" />
                                  Select reference file...
                                </>
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ecg-methodology.md">ECG Methodology</SelectItem>
                              <SelectItem value="eeg-bci-methodology.md">EEG/BCI Methodology</SelectItem>
                              <SelectItem value="medical-imaging-methodology.md">Medical Imaging</SelectItem>
                              <SelectItem value="deep-learning-bme.md">Deep Learning BME</SelectItem>
                              <SelectItem value="clinical-nlp-llm-methodology.md">Clinical NLP/LLM</SelectItem>
                              <SelectItem value="genomics-bioinformatics-methodology.md">Genomics/Bioinformatics</SelectItem>
                              <SelectItem value="clinical-statistical-framework.md">Clinical Statistics</SelectItem>
                              <SelectItem value="drug-discovery-pharmacology-methodology.md">Drug Discovery</SelectItem>
                              <SelectItem value="precision-oncology-immunotherapy-methodology.md">Precision Oncology</SelectItem>
                              <SelectItem value="crispr-design-methodology.md">CRISPR Design</SelectItem>
                              <SelectItem value="experimental-design-methodology.md">Experimental Design</SelectItem>
                              <SelectItem value="causal-genomics-methodology.md">Causal Genomics</SelectItem>
                              <SelectItem value="flow-cytometry-methodology.md">Flow Cytometry</SelectItem>
                              <SelectItem value="liquid-biopsy-methodology.md">Liquid Biopsy</SelectItem>
                              <SelectItem value="network-pharmacology-systems-biology.md">Network Pharmacology</SelectItem>
                              <SelectItem value="immunoinformatics-methodology.md">Immunoinformatics</SelectItem>
                              <SelectItem value="hi-c-3d-genome-methodology.md">Hi-C 3D Genome</SelectItem>
                              <SelectItem value="epitranscriptomics-methodology.md">Epitranscriptomics</SelectItem>
                              <SelectItem value="signal-processing-foundations.md">Signal Processing</SelectItem>
                              <SelectItem value="reproducibility-infrastructure.md">Reproducibility</SelectItem>
                              <SelectItem value="research-ethics-fairness.md">Research Ethics</SelectItem>
                              <SelectItem value="clinical-trial-design-methodology.md">Clinical Trial Design</SelectItem>
                              <SelectItem value="clinical-documentation-decision-support.md">Clinical Documentation</SelectItem>
                              <SelectItem value="physionet-datasets.md">PhysioNet Datasets</SelectItem>
                              <SelectItem value="database-api-guide.md">Database API Guide</SelectItem>
                            </SelectContent>
                          </Select>

                          {isAddingToReference === selectedPaper.id && (
                            <p className="text-xs text-muted-foreground mt-2">
                              正在处理中，请稍候...
                            </p>
                          )}
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Personal Notes</h4>
                          <textarea
                            className="w-full border rounded-lg p-3 text-sm"
                            rows={4}
                            placeholder="Add your personal notes about this paper..."
                            value={userNotes.get(selectedPaper.id) || ''}
                            onChange={(e) => {
                              setUserNotes(prev => new Map(prev).set(selectedPaper.id, e.target.value))
                            }}
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
