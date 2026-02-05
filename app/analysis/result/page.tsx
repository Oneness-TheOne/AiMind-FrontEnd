"use client"

import React from "react"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Download,
  Share2,
  ArrowRight,
  Eye,
  TrendingUp,
  Brain,
  Lightbulb,
  Palette,
  Heart,
  Users,
  BarChart3,
  Home,
  TreeDeciduous,
  User,
  FileText,
  LayoutGrid,
  Layers,
  Sparkles,
  Cloud,
  ThumbsUp,
  Check,
  AlertCircle,
  AlertTriangle,
} from "lucide-react"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

const detectedElements = [
  { name: "집", detected: true, note: "안정적인 형태, 굴뚝에서 연기 표현" },
  { name: "나무", detected: true, note: "풍성한 나뭇잎, 굵은 줄기" },
  { name: "사람", detected: true, note: "표정 표현, 팔다리 완성" },
  { name: "태양", detected: true, note: "밝은 색상, 크게 표현" },
  { name: "구름", detected: false, note: "미표현" },
  { name: "꽃/풀", detected: true, note: "지면에 풀 표현" },
]

const psychologyData = [
  { name: "자아 존중감", score: 85, max: 100 },
  { name: "정서 안정", score: 90, max: 100 },
  { name: "사회성", score: 78, max: 100 },
  { name: "창의성", score: 88, max: 100 },
  { name: "가족 관계", score: 82, max: 100 },
]

const radarData = [
  { subject: "자아 존중감", A: 85, fullMark: 100 },
  { subject: "정서 안정", A: 90, fullMark: 100 },
  { subject: "사회성", A: 78, fullMark: 100 },
  { subject: "창의성", A: 88, fullMark: 100 },
  { subject: "가족 관계", A: 82, fullMark: 100 },
]

const peerComparisonData = [
  { name: "세부묘사", child: 85, average: 70 },
  { name: "색상사용", child: 78, average: 72 },
  { name: "공간활용", child: 90, average: 68 },
  { name: "비율표현", child: 72, average: 65 },
  { name: "창의성", child: 88, average: 70 },
]

const colorAnalysis = [
  { color: "파랑", meaning: "안정감, 신뢰", percentage: 30, colorClass: "bg-blue-500" },
  { color: "초록", meaning: "성장, 희망", percentage: 25, colorClass: "bg-green-500" },
  { color: "노랑", meaning: "밝음, 활기", percentage: 20, colorClass: "bg-yellow-500" },
  { color: "빨강", meaning: "에너지, 열정", percentage: 15, colorClass: "bg-red-500" },
  { color: "갈색", meaning: "안정, 자연", percentage: 10, colorClass: "bg-amber-700" },
]

const recommendations = [
  {
    category: "가정 활동",
    items: [
      "함께 그림 그리기 시간을 주 2회 이상 가져보세요",
      "그림에 대해 열린 질문으로 대화해보세요",
      "아이의 그림을 집안에 전시해주세요",
    ],
  },
  {
    category: "미술 활동",
    items: [
      "다양한 재료(점토, 물감, 콜라주)를 경험하게 해주세요",
      "자유로운 주제로 표현하는 시간을 가져보세요",
      "색상 탐색 놀이를 통해 감정 표현을 도와주세요",
    ],
  },
  {
    category: "정서 발달",
    items: [
      "그림을 통해 하루의 감정을 표현하게 해보세요",
      "긍정적인 피드백을 자주 해주세요",
      "또래 친구들과 함께 그리는 활동을 추천드려요",
    ],
  },
]

export default function ResultPage() {
  const [activeTab, setActiveTab] = useState("basic")
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [activeInterpretTab, setActiveInterpretTab] = useState("tree")
  const [analysisResult, setAnalysisResult] = useState({
    childName: "아이",
    age: "-",
    drawingType: "집-나무-사람 (HTP)",
    overallScore: 0,
    summary: "해석 요약을 불러오는 중입니다.",
    developmentStage: "분석 완료",
    emotionalState: "분석 완료",
  })
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [boxImages, setBoxImages] = useState<Record<string, string | null>>({})
  const [interpretations, setInterpretations] = useState<Record<string, any>>({})

  const isLeafInterpretation = (value: any) =>
    value && typeof value === "object" && ("내용" in value || "논문_근거" in value)

  const renderInterpretationSection = (section: any) => {
    if (!section || typeof section !== "object") {
      return <div className="text-sm text-muted-foreground">내용이 없습니다.</div>
    }
    if (isLeafInterpretation(section)) {
      return (
        <div className="space-y-3">
          <p className="text-[15px] leading-relaxed text-foreground">{section.내용 || "내용이 없습니다."}</p>
          {section.논문_근거 && (
            <p className="text-xs text-muted-foreground">근거: {section.논문_근거}</p>
          )}
        </div>
      )
    }
    return (
      <div className="space-y-4">
        {Object.entries(section).map(([subKey, subVal]) => {
          const entry = subVal as any
          return (
          <div key={subKey} className="rounded-lg border bg-background p-4">
            <p className="text-sm font-semibold text-foreground mb-3">{subKey.replace(/_/g, " ")}</p>
            {isLeafInterpretation(entry) ? (
              <div className="space-y-2">
                <p className="text-[15px] leading-relaxed text-foreground">{entry.내용 || "내용이 없습니다."}</p>
                {entry.논문_근거 && (
                  <p className="text-xs text-muted-foreground">근거: {entry.논문_근거}</p>
                )}
              </div>
            ) : (
              <pre className="whitespace-pre-wrap text-xs text-muted-foreground">
                {JSON.stringify(entry, null, 2)}
              </pre>
            )}
          </div>
          )
        })}
      </div>
    )
  }

  useEffect(() => {
    const globalStore = globalThis as typeof globalThis & {
      __analysisResponse?: any
      __analysisImages?: string[]
      __analysisBoxImages?: Record<string, string | null>
    }
    const rawResponse = sessionStorage.getItem("analysisResponse")
    const rawImages = sessionStorage.getItem("analysisImages")
    const memoryResponse = globalStore.__analysisResponse
    const memoryImages = globalStore.__analysisImages
    const memoryBoxImages = globalStore.__analysisBoxImages

    if (memoryResponse || rawResponse) {
      const response = memoryResponse || JSON.parse(rawResponse || "{}")
      const child = response?.child || {}
      const results = response?.results || {}
      const rawSummary =
        results.tree?.interpretation?.전체_요약 ||
        results.house?.interpretation?.전체_요약 ||
        results.man?.interpretation?.전체_요약 ||
        results.woman?.interpretation?.전체_요약 ||
        "해석 요약이 없습니다."
      const summary =
        typeof rawSummary === "string"
          ? rawSummary
          : rawSummary?.내용 || JSON.stringify(rawSummary, null, 2)

      setAnalysisResult({
        childName: child.name || "아이",
        age: child.age || "-",
        drawingType: "집-나무-사람 (HTP)",
        overallScore: 0,
        summary,
        developmentStage: "분석 완료",
        emotionalState: "분석 완료",
      })
      setInterpretations(results)
      setBoxImages({
        tree: memoryBoxImages?.tree || results.tree?.box_image_base64 || null,
        house: memoryBoxImages?.house || results.house?.box_image_base64 || null,
        man: memoryBoxImages?.man || results.man?.box_image_base64 || null,
        woman: memoryBoxImages?.woman || results.woman?.box_image_base64 || null,
      })
    }
    if (memoryImages?.length) {
      setImagePreviews(memoryImages)
    } else if (rawImages) {
      setImagePreviews(JSON.parse(rawImages))
    }
  }, [])

  const analysisImages = useMemo(
    () => [
      {
        label: "나무",
        preview: boxImages.tree || imagePreviews[0],
        badgeClass: "bg-accent/20 text-accent-foreground",
      },
      {
        label: "집",
        preview: boxImages.house || imagePreviews[1],
        badgeClass: "bg-primary/20 text-primary",
      },
      {
        label: "남자사람",
        preview: boxImages.man || imagePreviews[2],
        badgeClass: "bg-chart-4/20 text-chart-4",
      },
      {
        label: "여자사람",
        preview: boxImages.woman || imagePreviews[3],
        badgeClass: "bg-chart-3/20 text-chart-3",
      },
    ],
    [boxImages, imagePreviews]
  )

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gradient-to-b from-secondary/30 to-background">
        <div className="container mx-auto px-4 py-8">
          {/* Result Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    분석 완료
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString("ko-KR")}
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {analysisResult.childName}의 그림 분석 결과
                </h1>
                <p className="text-muted-foreground mt-1">
                  {analysisResult.age}세 | {analysisResult.drawingType}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Share2 className="h-4 w-4" />
                  공유
                </Button>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Download className="h-4 w-4" />
                  PDF 저장
                </Button>
              </div>
            </div>

            {/* Summary Card */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center">
                      <span className="text-3xl font-bold text-primary-foreground">
                        {analysisResult.overallScore}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">종합 점수</p>
                      <p className="font-semibold text-foreground">상위 15%</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground leading-relaxed">
                      {analysisResult.summary}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="text-center px-4 py-2 rounded-lg bg-background">
                      <p className="text-xs text-muted-foreground">발달 단계</p>
                      <p className="font-semibold text-primary">{analysisResult.developmentStage}</p>
                    </div>
                    <div className="text-center px-4 py-2 rounded-lg bg-background">
                      <p className="text-xs text-muted-foreground">정서 상태</p>
                      <p className="font-semibold text-primary">{analysisResult.emotionalState}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="basic" className="gap-2">
                <Eye className="h-4 w-4 hidden sm:block" />
                기본 분석
              </TabsTrigger>
              <TabsTrigger value="development" className="gap-2">
                <TrendingUp className="h-4 w-4 hidden sm:block" />
                발달 비교
              </TabsTrigger>
              <TabsTrigger value="psychology" className="gap-2">
                <Brain className="h-4 w-4 hidden sm:block" />
                심리 해석
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="gap-2">
                <Lightbulb className="h-4 w-4 hidden sm:block" />
                추천 사항
              </TabsTrigger>
            </TabsList>

            {/* Basic Analysis Tab */}
            <TabsContent value="basic" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Drawing with Overlay */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-primary" />
                      시각적 분석
                    </CardTitle>
                    <CardDescription>
                      AI가 감지한 요소들이 하이라이트 되어 있습니다
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative aspect-square bg-muted rounded-xl overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center p-4">
                        {analysisImages[activeImageIndex]?.preview ? (
                          <img
                            src={analysisImages[activeImageIndex].preview || "/placeholder.svg"}
                            alt={`${analysisImages[activeImageIndex].label} 분석 결과`}
                            className="h-full w-full rounded-lg border object-cover"
                          />
                        ) : (
                          <div className="text-sm text-muted-foreground">이미지가 없습니다.</div>
                        )}
                      </div>
                      {/* Legend */}
                      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                        {analysisImages.map((item, index) => (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => setActiveImageIndex(index)}
                            className="focus-visible:outline-none"
                          >
                            <Badge
                              variant="secondary"
                              className={`${item.badgeClass} ${activeImageIndex === index ? "ring-2 ring-primary/60" : ""}`}
                            >
                              {item.label}
                            </Badge>
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detected Elements */}
                <Card>
                  <CardHeader>
                    <CardTitle>구성요소 분석</CardTitle>
                    <CardDescription>
                      그림에서 감지된 요소들과 특징입니다
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {detectedElements.map((element) => (
                        <div
                          key={element.name}
                          className={`flex items-center gap-3 p-3 rounded-lg ${
                            element.detected ? "bg-primary/5" : "bg-muted/50"
                          }`}
                        >
                          <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              element.detected
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {element.name === "집" && <Home className="h-4 w-4" />}
                            {element.name === "나무" && <TreeDeciduous className="h-4 w-4" />}
                            {element.name === "사람" && <User className="h-4 w-4" />}
                            {element.name === "태양" && <span className="text-sm">☀</span>}
                            {element.name === "구름" && <span className="text-sm">☁</span>}
                            {element.name === "꽃/풀" && <span className="text-sm">🌱</span>}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{element.name}</span>
                              <Badge
                                variant={element.detected ? "default" : "secondary"}
                                className={element.detected ? "bg-primary" : ""}
                              >
                                {element.detected ? "감지됨" : "미감지"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{element.note}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Development Comparison Tab */}
            <TabsContent value="development" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Peer Comparison Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      또래 비교
                    </CardTitle>
                    <CardDescription>
                      같은 연령대 아이들의 평균과 비교한 결과입니다
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={peerComparisonData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                          <XAxis type="number" domain={[0, 100]} />
                          <YAxis dataKey="name" type="category" width={80} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="child" name="민준이" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                          <Bar dataKey="average" name="또래 평균" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Development Stage */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      발달 단계 평가
                    </CardTitle>
                    <CardDescription>
                      연령별 기대 발달 수준 대비 평가입니다
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center p-6 bg-primary/5 rounded-xl">
                      <p className="text-sm text-muted-foreground mb-2">현재 발달 단계</p>
                      <p className="text-2xl font-bold text-primary mb-1">도식기 (7-9세)</p>
                      <p className="text-sm text-muted-foreground">
                        연령에 적합한 발달 수준을 보입니다
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">그림 복잡도</span>
                          <span className="font-medium">85/100</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">세부 표현력</span>
                          <span className="font-medium">78/100</span>
                        </div>
                        <Progress value={78} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">공간 인식</span>
                          <span className="font-medium">90/100</span>
                        </div>
                        <Progress value={90} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">비율 표현</span>
                          <span className="font-medium">72/100</span>
                        </div>
                        <Progress value={72} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Psychology Interpretation Tab */}
            <TabsContent value="psychology" className="space-y-6">
              {/* Summary Banner */}
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 border border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground mb-2">전체 요약</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      8세 여아의 나무 그림은 화면 왼쪽 편향된 나무 배치와 함께 다양한 부가 요소와 하늘 요소를 포함하고 있어, 
                      아동의 주관적 경험과 환경에 대한 인식을 복합적으로 보여줍니다.
                    </p>
                    <div className="mt-3 inline-flex items-center gap-2 text-xs text-primary bg-primary/10 px-3 py-1 rounded-full">
                      <FileText className="h-3 w-3" />
                      HTP 검사 해석체계 구축 및 타당성 제고.pdf
                    </div>
                  </div>
                </div>
              </div>

              {/* Interpretation Tabs */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <Tabs value={activeInterpretTab} onValueChange={setActiveInterpretTab}>
                    <TabsList className="grid w-full grid-cols-4 bg-slate-100 p-1 rounded-xl">
                      <TabsTrigger value="tree" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">나무</TabsTrigger>
                      <TabsTrigger value="house" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">집</TabsTrigger>
                      <TabsTrigger value="man" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">남자아이</TabsTrigger>
                      <TabsTrigger value="woman" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">여자아이</TabsTrigger>
                    </TabsList>
                    {["tree", "house", "man", "woman"].map((key) => {
                      const value = interpretations[key]
                      return (
                        <TabsContent key={key} value={key} className="mt-6 space-y-6">
                          {value?.interpretation ? (
                            Object.entries(value.interpretation).map(([sectionKey, sectionValue]) => {
                              const sectionIcons: Record<string, React.ReactNode> = {
                                "구성_분석": <LayoutGrid className="h-4 w-4" />,
                                "구성요소_분석": <Layers className="h-4 w-4" />,
                                "부가요소_분석": <Sparkles className="h-4 w-4" />,
                                "하늘요소_분석": <Cloud className="h-4 w-4" />,
                                "발달_평가": <TrendingUp className="h-4 w-4" />,
                                "종합_해석": <FileText className="h-4 w-4" />,
                              }
                              const sectionColors: Record<string, string> = {
                                "구성_분석": "bg-blue-50 border-blue-200 text-blue-700",
                                "구성요소_분석": "bg-purple-50 border-purple-200 text-purple-700",
                                "부가요소_분석": "bg-amber-50 border-amber-200 text-amber-700",
                                "하늘요소_분석": "bg-sky-50 border-sky-200 text-sky-700",
                                "발달_평가": "bg-green-50 border-green-200 text-green-700",
                                "종합_해석": "bg-teal-50 border-teal-200 text-teal-700",
                              }
                              return (
                                <div key={sectionKey} className="rounded-xl border bg-white overflow-hidden">
                                  <div className={`px-4 py-3 border-b flex items-center gap-2 ${sectionColors[sectionKey] || "bg-slate-50"}`}>
                                    {sectionIcons[sectionKey] || <FileText className="h-4 w-4" />}
                                    <span className="font-semibold text-sm">{sectionKey.replace(/_/g, " ")}</span>
                                  </div>
                                  <div className="p-4">
                                    {renderInterpretationSection(sectionValue)}
                                  </div>
                                </div>
                              )
                            })
                          ) : (
                            <div className="text-center py-12 text-muted-foreground">
                              <Brain className="h-12 w-12 mx-auto mb-3 opacity-30" />
                              <p>해석 결과가 없습니다.</p>
                            </div>
                          )}
                        </TabsContent>
                      )
                    })}
                  </Tabs>
                </CardContent>
              </Card>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Radar Chart */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Brain className="h-4 w-4 text-primary" />
                      </div>
                      심리 지표 분석
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                          <PolarGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <Radar
                            name="분석 결과"
                            dataKey="A"
                            stroke="hsl(var(--primary))"
                            fill="hsl(var(--primary))"
                            fillOpacity={0.25}
                            strokeWidth={2}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Color Analysis */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Palette className="h-4 w-4 text-primary" />
                      </div>
                      색상 심리 분석
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {colorAnalysis.map((color) => (
                        <div key={color.color} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                          <div className={`h-10 w-10 rounded-xl ${color.colorClass} shadow-sm`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-sm text-foreground">{color.color}</span>
                              <span className="text-xs font-semibold text-primary">{color.percentage}%</span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{color.meaning}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Emotional State Grid */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Heart className="h-4 w-4 text-primary" />
                    </div>
                    종합 심리 상태
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {psychologyData.map((item) => {
                      const getStatusColor = (score: number) => {
                        if (score >= 80) return { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", badge: "bg-green-100 text-green-700" }
                        if (score >= 60) return { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-100 text-amber-700" }
                        return { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", badge: "bg-red-100 text-red-700" }
                      }
                      const status = getStatusColor(item.score)
                      return (
                        <div key={item.name} className={`p-4 rounded-xl border ${status.bg} ${status.border}`}>
                          <div className="flex justify-between items-start mb-3">
                            <span className="font-semibold text-sm text-foreground">{item.name}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${status.badge}`}>
                              {item.score}점
                            </span>
                          </div>
                          <div className="h-2 bg-white/80 rounded-full overflow-hidden mb-2">
                            <div 
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{ width: `${item.score}%` }}
                            />
                          </div>
                          <p className={`text-xs font-medium ${status.text}`}>
                            {item.score >= 80 ? "양호한 수준" : item.score >= 60 ? "보통 수준" : "관심 필요"}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Positive & Attention Points */}
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-0 shadow-sm border-l-4 border-l-green-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base text-green-700">
                      <ThumbsUp className="h-4 w-4" />
                      긍정적인 측면
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                        <span className="text-sm text-muted-foreground">풍부한 상상력과 창의성, 다양한 환경 요소에 대한 관심</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                        <span className="text-sm text-muted-foreground">감성적인 영역의 발달</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                        <span className="text-sm text-muted-foreground">놀이와 즐거움에 대한 욕구 (그네 표현)</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm border-l-4 border-l-amber-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base text-amber-700">
                      <AlertCircle className="h-4 w-4" />
                      주의 사항
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                          <AlertTriangle className="h-3 w-3 text-amber-600" />
                        </div>
                        <span className="text-sm text-muted-foreground">부정적 평가에 대한 두려움으로 인해 자신감 부족이나 위축된 모습을 보일 수 있습니다</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                          <AlertTriangle className="h-3 w-3 text-amber-600" />
                        </div>
                        <span className="text-sm text-muted-foreground">내면의 안정감이나 자기 수용에 대한 노력이 필요합니다</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                {recommendations.map((rec) => (
                  <Card key={rec.category}>
                    <CardHeader>
                      <CardTitle className="text-lg">{rec.category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {rec.items.map((item, index) => (
                          <li key={index} className="flex gap-3">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-xs font-semibold text-primary">{index + 1}</span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">{item}</p>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* CTA */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        더 자세한 맞춤 솔루션이 필요하신가요?
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        전문가가 제안하는 맞춤형 활동과 솔루션을 확인해보세요.
                      </p>
                    </div>
                    <Link href="/solutions">
                      <Button className="gap-2">
                        맞춤 솔루션 보기
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}
