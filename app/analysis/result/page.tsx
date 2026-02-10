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

const OBJECT_KEYS = ["tree", "house", "man", "woman"] as const
const OBJECT_LABELS: Record<string, string> = {
  tree: "나무",
  house: "집",
  man: "남자사람",
  woman: "여자사람",
}

/** HTP 해석에 꼭 필요한 핵심 요소만 (나머지 필터링) */
const ESSENTIAL_ELEMENTS: Record<string, Set<string>> = {
  tree: new Set(["나무전체", "수관", "기둥", "가지", "뿌리"]),
  house: new Set(["집전체", "지붕", "집벽", "문", "창문", "굴뚝"]),
  man: new Set(["사람전체", "머리", "얼굴", "눈", "코", "입", "상체", "팔", "다리"]),
  woman: new Set(["사람전체", "머리", "얼굴", "눈", "코", "입", "상체", "팔", "다리"]),
}

/** image_json(RAG 포맷)에서 구성요소 목록 추출 - 핵심 요소만 */
function getComponentElementsFromImageJson(
  imageJson: Record<string, unknown> | undefined,
  objectKey: string
): { name: string; detected: boolean; note: string }[] {
  if (!imageJson) return []

  const features = imageJson.features as Record<string, { has?: number; ratio?: number; center_x?: number; center_y?: number; confidence?: number }> | undefined
  const detectedKr = (imageJson.detected_classes_kr as string[]) || []
  const summary = (imageJson.summary as string) || ""

  if (features) {
    const essential = ESSENTIAL_ELEMENTS[objectKey]
    const detectedSet = new Set(detectedKr)
    return Object.entries(features)
      .filter(([name]) => !essential || essential.has(name))
      .map(([name, val]) => {
        const has = val?.has === 1
        const ratio = val?.ratio ?? 0
        const cx = val?.center_x ?? -1
        const pos =
          cx >= 0
            ? cx < 0.4
              ? "왼쪽"
              : cx > 0.6
                ? "오른쪽"
                : "가운데"
            : ""
        const note =
          has && ratio > 0
            ? `면적 약 ${(ratio * 100).toFixed(1)}%${pos ? `, ${pos} 위치` : ""}`
            : has
              ? "감지됨"
              : "미감지"
        return {
          name,
          detected: has || detectedSet.has(name),
          note: note.trim() || (has ? "감지됨" : "미감지"),
        }
      })
  }

  const bbox = (imageJson.annotations as { bbox?: { label: string }[] })?.bbox
  if (Array.isArray(bbox)) {
    const essential = ESSENTIAL_ELEMENTS[objectKey]
    return bbox
      .map((b) => b?.label)
      .filter((l): l is string => !!l)
      .filter((l, i, arr) => arr.indexOf(l) === i)
      .filter((label) => !essential || essential.has(label))
      .map((label) => ({
        name: label,
        detected: true,
        note: "감지됨",
      }))
  }

  if (summary) {
    return [{ name: OBJECT_LABELS[objectKey] || objectKey, detected: true, note: summary }]
  }
  return []
}

const defaultPsychologyData = [
  { name: "자아 존중감", score: 85, max: 100 },
  { name: "정서 안정", score: 90, max: 100 },
  { name: "사회성", score: 78, max: 100 },
  { name: "창의성", score: 88, max: 100 },
  { name: "가족 관계", score: 82, max: 100 },
]

type RadarDataItem = { subject: string; A: number; B?: number; fullMark: number }

const defaultRadarData: RadarDataItem[] = [
  { subject: "자아 존중감", A: 85, fullMark: 100 },
  { subject: "정서 안정", A: 90, fullMark: 100 },
  { subject: "사회성", A: 78, fullMark: 100 },
  { subject: "창의성", A: 88, fullMark: 100 },
  { subject: "가족 관계", A: 82, fullMark: 100 },
]

const defaultPeerComparisonData = [
  { name: "에너지", child: 50, average: 50 },
  { name: "위치 안정성", child: 50, average: 50 },
  { name: "표현력", child: 50, average: 50 },
]

const PEER_AVERAGE = 50

/** T-Score에 따른 키워드 */
function getScoreKeyword(score: number, type: "에너지" | "위치안정성" | "표현력"): string {
  if (score < 35) {
    if (type === "에너지") return "다소 위축됨"
    if (type === "위치안정성") return "위치 불안정"
    return "표현이 절제됨"
  }
  if (score > 65) {
    if (type === "에너지") return "에너지 넘침"
    if (type === "위치안정성") return "위치 안정적"
    return "풍부한 표현"
  }
  if (type === "에너지") return "적절한 에너지"
  if (type === "위치안정성") return "적절한 안정성"
  return "적절한 표현력"
}

const defaultDevelopmentScores = [
  { name: "그림 복잡도", value: 85 },
  { name: "세부 표현력", value: 78 },
  { name: "공간 인식", value: 90 },
  { name: "비율 표현", value: 72 },
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
  const [peerComparisonData, setPeerComparisonData] = useState(defaultPeerComparisonData)
  const [developmentScores, setDevelopmentScores] = useState(defaultDevelopmentScores)
  const [psychologyData, setPsychologyData] = useState(defaultPsychologyData)
  const [radarData, setRadarData] = useState<RadarDataItem[]>(defaultRadarData)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [boxImages, setBoxImages] = useState<Record<string, string | null>>({})
  const [interpretations, setInterpretations] = useState<Record<string, any>>({})
  const [drawingScores, setDrawingScores] = useState<{
    aggregated: { 에너지_점수: number; 위치_안정성_점수: number; 표현력_점수: number; 종합_평가: string } | null
    peer_average: number
    peer_norms?: { 에너지_또래평균: number; 위치_X_또래평균: number; 위치_Y_또래평균: number; 표현력_또래평균: number }
    age?: number
    sex?: string
  } | null>(null)

  const formatInterpretationKey = (value: string) => value.replace(/_/g, " ")

  const isLeafInterpretation = (value: any) =>
    value && typeof value === "object" && ("내용" in value || "논문_근거" in value)

  const renderLeafCard = (title: string, leaf: any) => {
    const content = typeof leaf?.내용 === "string" && leaf.내용.trim() ? leaf.내용 : "내용이 없습니다."
    return (
      <div key={title} className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[15px] font-semibold text-foreground">{formatInterpretationKey(title)}</span>
        </div>
        <p className="text-[15px] leading-relaxed text-muted-foreground">{content}</p>
        {leaf?.논문_근거 && (
          <div className="mt-3 inline-flex items-center gap-2 text-xs text-primary bg-primary/10 px-3 py-1 rounded-full">
            <FileText className="h-3 w-3" />
            {leaf.논문_근거}
          </div>
        )}
      </div>
    )
  }

  const renderInterpretationSection = (section: any) => {
    if (!section || typeof section !== "object") {
      return <div className="text-sm text-muted-foreground">내용이 없습니다.</div>
    }
    if (isLeafInterpretation(section)) {
      return renderLeafCard("내용", section)
    }
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(section).map(([subKey, subVal]) => {
          const entry = subVal as any
          if (isLeafInterpretation(entry)) {
            return renderLeafCard(subKey, entry)
          }
          return (
            <div key={subKey} className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="text-[15px] font-semibold text-foreground mb-2">{formatInterpretationKey(subKey)}</p>
              <pre className="whitespace-pre-wrap text-[13px] text-muted-foreground">
                {JSON.stringify(entry, null, 2)}
              </pre>
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
      const comparison = response?.comparison || {}
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

      const developmentStage = comparison?.development?.stage || "분석 완료"
      const overallScore = typeof comparison?.overall_score === "number" ? comparison.overall_score : 0
      const psychologyScores = comparison?.psychology?.scores || {}
      const emotionalState =
        Object.values(psychologyScores).length > 0 ? "분석 완료" : "분석 완료"

      setAnalysisResult({
        childName: child.name || "아이",
        age: child.age || "-",
        drawingType: "집-나무-사람 (HTP)",
        overallScore,
        summary,
        developmentStage,
        emotionalState,
      })
      setInterpretations(results)
      setBoxImages({
        tree: memoryBoxImages?.tree || results.tree?.box_image_base64 || null,
        house: memoryBoxImages?.house || results.house?.box_image_base64 || null,
        man: memoryBoxImages?.man || results.man?.box_image_base64 || null,
        woman: memoryBoxImages?.woman || results.woman?.box_image_base64 || null,
      })

      // T-Score 기반 drawing_scores (drawing_norm_dist_stats) 우선 사용
      const ds = comparison?.drawing_scores
      if (ds?.aggregated) {
        setDrawingScores({
          aggregated: ds.aggregated,
          peer_average: ds.peer_average ?? PEER_AVERAGE,
          peer_norms: ds.peer_norms,
          age: ds.age,
          sex: ds.sex,
        })
        setPeerComparisonData([
          { name: "에너지", child: ds.aggregated.에너지_점수, average: ds.peer_average ?? PEER_AVERAGE },
          { name: "위치 안정성", child: ds.aggregated.위치_안정성_점수, average: ds.peer_average ?? PEER_AVERAGE },
          { name: "표현력", child: ds.aggregated.표현력_점수, average: ds.peer_average ?? PEER_AVERAGE },
        ])
        setDevelopmentScores([
          { name: "에너지(크기)", value: Math.round(ds.aggregated.에너지_점수) },
          { name: "위치 안정성", value: Math.round(ds.aggregated.위치_안정성_점수) },
          { name: "표현력(섬세함)", value: Math.round(ds.aggregated.표현력_점수) },
        ])
        setRadarData([
          { subject: "에너지", A: ds.aggregated.에너지_점수, B: ds.peer_average ?? PEER_AVERAGE, fullMark: 100 },
          { subject: "위치 안정성", A: ds.aggregated.위치_안정성_점수, B: ds.peer_average ?? PEER_AVERAGE, fullMark: 100 },
          { subject: "표현력", A: ds.aggregated.표현력_점수, B: ds.peer_average ?? PEER_AVERAGE, fullMark: 100 },
        ])
        setPsychologyData([
          { name: "에너지", score: Math.round(ds.aggregated.에너지_점수), max: 100 },
          { name: "안정성", score: Math.round(ds.aggregated.위치_안정성_점수), max: 100 },
          { name: "섬세함", score: Math.round(ds.aggregated.표현력_점수), max: 100 },
        ])
      } else if (comparison?.peer) {
        const peerData = [
          "세부묘사",
          "공간활용",
          "비율표현",
          "창의성",
        ].map((label) => ({
          name: label,
          child: comparison.peer?.[label] ?? 0,
          average: 50,
        }))
        setPeerComparisonData(peerData)
      }

      if (!ds?.aggregated && comparison?.development?.scores) {
        const devData = [
          "그림 복잡도",
          "세부 표현력",
          "공간 인식",
          "비율 표현",
        ].map((label) => ({
          name: label,
          value: comparison.development?.scores?.[label] ?? 0,
        }))
        setDevelopmentScores(devData)
      }

      if (!ds?.aggregated && comparison?.psychology?.scores) {
        const order = ["자아 존중감", "정서 안정", "사회성", "창의성", "가족 관계"]
        const psychData = order.map((label) => ({
          name: label,
          score: comparison.psychology?.scores?.[label] ?? 0,
          max: 100,
        }))
        setPsychologyData(psychData)
        setRadarData(
          order.map((label) => ({
            subject: label,
            A: comparison.psychology?.scores?.[label] ?? 0,
            fullMark: 100,
          }))
        )
      }
    }
    if (memoryImages?.length) {
      setImagePreviews(memoryImages)
    } else if (rawImages) {
      setImagePreviews(JSON.parse(rawImages))
    }
  }, [])

  // drawing_scores가 없고 results가 있으면 /analyze/score 호출
  const aimodelsBaseUrl = process.env.NEXT_PUBLIC_AIMODELS_BASE_URL ?? "http://localhost:8080"
  useEffect(() => {
    if (drawingScores) return
    const raw = sessionStorage.getItem("analysisResponse")
    const mem = (globalThis as any).__analysisResponse
    const response = mem || (raw ? JSON.parse(raw) : null)
    if (!response?.results) return
    const child = response?.child || {}
    const age = parseInt(String(child.age || 0), 10)
    const gender = child.gender || ""
    if (!age || age < 7 || age > 13 || !["남", "여"].includes(gender)) return

    fetch(`${aimodelsBaseUrl}/analyze/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ results: response.results, age, gender }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((ds) => {
        if (ds?.aggregated) {
          setDrawingScores({
            aggregated: ds.aggregated,
            peer_average: ds.peer_average ?? PEER_AVERAGE,
            peer_norms: ds.peer_norms,
            age: ds.age,
            sex: ds.sex,
          })
          setPeerComparisonData([
            { name: "에너지", child: ds.aggregated.에너지_점수, average: ds.peer_average ?? PEER_AVERAGE },
            { name: "위치 안정성", child: ds.aggregated.위치_안정성_점수, average: ds.peer_average ?? PEER_AVERAGE },
            { name: "표현력", child: ds.aggregated.표현력_점수, average: ds.peer_average ?? PEER_AVERAGE },
          ])
          setDevelopmentScores([
            { name: "에너지(크기)", value: Math.round(ds.aggregated.에너지_점수) },
            { name: "위치 안정성", value: Math.round(ds.aggregated.위치_안정성_점수) },
            { name: "표현력(섬세함)", value: Math.round(ds.aggregated.표현력_점수) },
          ])
          setRadarData([
            { subject: "에너지", A: ds.aggregated.에너지_점수, B: ds.peer_average ?? PEER_AVERAGE, fullMark: 100 },
            { subject: "위치 안정성", A: ds.aggregated.위치_안정성_점수, B: ds.peer_average ?? PEER_AVERAGE, fullMark: 100 },
            { subject: "표현력", A: ds.aggregated.표현력_점수, B: ds.peer_average ?? PEER_AVERAGE, fullMark: 100 },
          ])
          setPsychologyData([
            { name: "에너지", score: Math.round(ds.aggregated.에너지_점수), max: 100 },
            { name: "안정성", score: Math.round(ds.aggregated.위치_안정성_점수), max: 100 },
            { name: "섬세함", score: Math.round(ds.aggregated.표현력_점수), max: 100 },
          ])
        }
      })
      .catch(() => {})
  }, [drawingScores])

  const objectKey = OBJECT_KEYS[activeImageIndex] ?? "tree"

  const componentElements = useMemo(() => {
    const imgData = interpretations[objectKey]?.image_json
    return getComponentElementsFromImageJson(
      imgData as Record<string, unknown> | undefined,
      objectKey
    )
  }, [interpretations, objectKey])

  const analysisImages = useMemo(
    () => [
      {
        label: "나무",
        preview: boxImages.tree ?? null,
        badgeClass: "bg-accent/20 text-accent-foreground",
      },
      {
        label: "집",
        preview: boxImages.house ?? null,
        badgeClass: "bg-primary/20 text-primary",
      },
      {
        label: "남자사람",
        preview: boxImages.man ?? null,
        badgeClass: "bg-chart-4/20 text-chart-4",
      },
      {
        label: "여자사람",
        preview: boxImages.woman ?? null,
        badgeClass: "bg-chart-3/20 text-chart-3",
      },
    ],
    [boxImages]
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
                      <p className="font-semibold text-foreground">
                        {analysisResult.overallScore > 0
                          ? `상위 ${Math.max(1, Math.round(100 - analysisResult.overallScore))}%`
                          : "분석 중"}
                      </p>
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

                {/* Detected Elements - 선택한 이미지(tree/집/남자/여자)에 따라 동적 표시 */}
                <Card>
                  <CardHeader>
                    <CardTitle>구성요소 분석</CardTitle>
                    <CardDescription>
                      {analysisImages[activeImageIndex]?.label || "그림"}에서 감지된 요소들과 특징입니다
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {componentElements.length > 0 ? (
                        componentElements.map((element) => (
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
                              {element.name.includes("집") && <Home className="h-4 w-4" />}
                              {element.name.includes("나무") && <TreeDeciduous className="h-4 w-4" />}
                              {element.name.includes("사람") && <User className="h-4 w-4" />}
                              {element.name.includes("태양") && <span className="text-sm">☀</span>}
                              {element.name.includes("구름") && <span className="text-sm">☁</span>}
                              {element.name.includes("꽃") && <span className="text-sm">🌱</span>}
                              {element.name.includes("머리") || element.name.includes("얼굴") ? (
                                <User className="h-4 w-4" />
                              ) : (
                                <Layers className="h-4 w-4" />
                              )}
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
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          시각적 분석에서 나무·집·남자·여자 중 하나를 선택하면 해당 그림의 구성요소가 표시됩니다.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Development Comparison Tab */}
            <TabsContent value="development" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Radar Chart - T-Score 발달 비교 (drawing_scores 있을 때) */}
                {drawingScores?.aggregated && radarData.length >= 3 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        발달 비교 (T-Score)
                      </CardTitle>
                      <CardDescription>
                        또래 평균 50점 ({drawingScores.age ?? analysisResult.age}세 {drawingScores.sex === "남" ? "남아" : drawingScores.sex === "여" ? "여아" : ""} 기준) 대비 에너지·위치안정성·표현력
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                            <PolarGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 12 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                            <Radar
                              name={analysisResult.childName}
                              dataKey="A"
                              stroke="hsl(var(--primary))"
                              fill="hsl(var(--primary))"
                              fillOpacity={0.3}
                              strokeWidth={2}
                            />
                            <Radar
                              name={drawingScores?.age && drawingScores?.sex ? `또래 평균 (50점, ${drawingScores.age}세 ${drawingScores.sex === "남" ? "남아" : "여아"})` : "또래 평균 (50점)"}
                              dataKey="B"
                              stroke="hsl(var(--muted-foreground))"
                              fill="hsl(var(--muted))"
                              fillOpacity={0.15}
                              strokeWidth={1}
                              strokeDasharray="4 4"
                            />
                            <Legend />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Peer Comparison Bar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      또래 비교
                    </CardTitle>
                    <CardDescription>
                      또래 평균 50점{drawingScores?.age && drawingScores?.sex ? ` (${drawingScores.age}세 ${drawingScores.sex === "남" ? "남아" : "여아"} 기준)` : ""}과 비교한 결과입니다
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={peerComparisonData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                          <XAxis type="number" domain={[0, 100]} />
                          <YAxis dataKey="name" type="category" width={100} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="child" name={analysisResult.childName} fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                          <Bar
                            dataKey="average"
                            name={drawingScores?.age && drawingScores?.sex ? `또래 평균 (50점, ${drawingScores.age}세 ${drawingScores.sex === "남" ? "남아" : "여아"})` : "또래 평균 (50점)"}
                            fill="hsl(var(--muted))"
                            radius={[0, 4, 4, 0]}
                          />
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
                      {drawingScores?.age && drawingScores?.sex
                        ? `${drawingScores.age}세 ${drawingScores.sex === "남" ? "남아" : "여아"} 또래 기준 T-Score 평가`
                        : "연령별 기대 발달 수준 대비 평가입니다"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center p-6 bg-primary/5 rounded-xl">
                      <p className="text-sm text-muted-foreground mb-2">현재 발달 단계</p>
                      <p className="text-2xl font-bold text-primary mb-1">{analysisResult.developmentStage}</p>
                      <p className="text-sm text-muted-foreground">
                        {drawingScores?.age && drawingScores?.sex
                          ? `또래 평균 50점 (${drawingScores.age}세 ${drawingScores.sex === "남" ? "남아" : "여아"} 기준)`
                          : "동일 연령 기준 백분위로 평가했습니다"}
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      {developmentScores.map((item) => (
                        <div key={item.name}>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">{item.name}</span>
                            <span className="font-medium">{item.value}/100</span>
                          </div>
                          <Progress value={item.value} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Psychology Interpretation Tab */}
            <TabsContent value="psychology" className="space-y-6">
              {(() => {
                const activeInterpretation = interpretations[activeInterpretTab]?.interpretation || null
                const summary = activeInterpretation?.["전체_요약"]
                const summaryContent =
                  typeof summary?.내용 === "string" && summary.내용.trim()
                    ? summary.내용
                    : "해석 요약이 아직 준비되지 않았습니다."
                return (
                  <>
                    {/* Summary Banner */}
                    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 border border-primary/20">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                          <Brain className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-foreground mb-2">전체 요약</h3>
                          <p className="text-[15px] text-muted-foreground leading-relaxed">
                            {summaryContent}
                          </p>
                          {summary?.논문_근거 && (
                            <div className="mt-3 inline-flex items-center gap-2 text-xs text-primary bg-primary/10 px-3 py-1 rounded-full">
                              <FileText className="h-3 w-3" />
                              {summary.논문_근거}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )
              })()}

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
                      const interpretation = value?.interpretation || {}
                      const sectionOrder = [
                        "전체_요약",
                        "구성_분석",
                        "구성요소_분석",
                        "집_구성요소_분석",
                        "부가요소_분석",
                        "주변요소_분석",
                        "자연요소_분석",
                        "하늘_요소_분석",
                        "얼굴_분석",
                        "신체_분석",
                        "의류_분석",
                        "발달_평가",
                        "종합_해석",
                      ]
                      const orderedEntries = [
                        ...sectionOrder.filter((sectionKey) => sectionKey in interpretation).map((sectionKey) => [
                          sectionKey,
                          interpretation[sectionKey],
                        ] as const),
                        ...Object.entries(interpretation).filter(
                          ([sectionKey]) => !sectionOrder.includes(sectionKey)
                        ),
                      ].filter(([sectionKey]) => sectionKey !== "전체_요약")
                      return (
                        <TabsContent key={key} value={key} className="mt-6 space-y-6">
                          {value?.interpretation ? (
                            orderedEntries.map(([sectionKey, sectionValue]) => {
                              const sectionIcons: Record<string, React.ReactNode> = {
                                "전체_요약": <FileText className="h-4 w-4" />,
                                "구성_분석": <LayoutGrid className="h-4 w-4" />,
                                "구성요소_분석": <Layers className="h-4 w-4" />,
                                "부가요소_분석": <Sparkles className="h-4 w-4" />,
                                "하늘요소_분석": <Cloud className="h-4 w-4" />,
                                "하늘_요소_분석": <Cloud className="h-4 w-4" />,
                                "얼굴_분석": <User className="h-4 w-4" />,
                                "신체_분석": <Layers className="h-4 w-4" />,
                                "의류_분석": <LayoutGrid className="h-4 w-4" />,
                                "집_구성요소_분석": <Home className="h-4 w-4" />,
                                "주변요소_분석": <Cloud className="h-4 w-4" />,
                                "자연요소_분석": <TreeDeciduous className="h-4 w-4" />,
                                "발달_평가": <TrendingUp className="h-4 w-4" />,
                                "종합_해석": <FileText className="h-4 w-4" />,
                              }
                              const sectionColors: Record<string, string> = {
                                "전체_요약": "bg-slate-50 border-slate-200 text-slate-700",
                                "구성_분석": "bg-blue-50 border-blue-200 text-blue-700",
                                "구성요소_분석": "bg-purple-50 border-purple-200 text-purple-700",
                                "집_구성요소_분석": "bg-purple-50 border-purple-200 text-purple-700",
                                "부가요소_분석": "bg-amber-50 border-amber-200 text-amber-700",
                                "하늘요소_분석": "bg-sky-50 border-sky-200 text-sky-700",
                                "하늘_요소_분석": "bg-sky-50 border-sky-200 text-sky-700",
                                "주변요소_분석": "bg-emerald-50 border-emerald-200 text-emerald-700",
                                "자연요소_분석": "bg-lime-50 border-lime-200 text-lime-700",
                                "얼굴_분석": "bg-indigo-50 border-indigo-200 text-indigo-700",
                                "신체_분석": "bg-teal-50 border-teal-200 text-teal-700",
                                "의류_분석": "bg-rose-50 border-rose-200 text-rose-700",
                                "발달_평가": "bg-green-50 border-green-200 text-green-700",
                                "종합_해석": "bg-teal-50 border-teal-200 text-teal-700",
                              }
                              return (
                                <div key={sectionKey} className="rounded-xl border bg-white overflow-hidden">
                                  <div className={`px-4 py-3 border-b flex items-center gap-2 ${sectionColors[sectionKey] || "bg-slate-50"}`}>
                                    {sectionIcons[sectionKey] || <FileText className="h-4 w-4" />}
                                    <span className="font-semibold text-sm">{formatInterpretationKey(sectionKey)}</span>
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

              {/* T-Score 기반 심리 해석 (에너지/안정성/섬세함 + 키워드) */}
              {drawingScores?.aggregated && (
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-primary" />
                      </div>
                      T-Score 심리 해석
                    </CardTitle>
                    <CardDescription>
                      그림 크기·위치·객체 개수 기반 또래 대비 점수
                      {drawingScores.age && drawingScores.sex && (
                        <span className="text-primary font-medium">
                          {" "}({drawingScores.age}세 {drawingScores.sex === "남" ? "남아" : "여아"} 또래 기준)
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="h-[240px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={psychologyData} layout="vertical" margin={{ left: 0, right: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" domain={[0, 100]} />
                            <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(v: number) => [`${v}점`, "T-Score"]} />
                            <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-3">
                        {psychologyData.map((item) => {
                          const keyword =
                            item.name === "에너지"
                              ? getScoreKeyword(item.score, "에너지")
                              : item.name === "안정성"
                                ? getScoreKeyword(item.score, "위치안정성")
                                : getScoreKeyword(item.score, "표현력")
                          const status =
                            item.score < 35
                              ? "text-amber-600 bg-amber-50 border-amber-200"
                              : item.score > 65
                                ? "text-emerald-600 bg-emerald-50 border-emerald-200"
                                : "text-slate-600 bg-slate-50 border-slate-200"
                          return (
                            <div
                              key={item.name}
                              className={`flex items-center justify-between gap-4 rounded-lg border p-3 ${status}`}
                            >
                              <span className="font-medium">{item.name}</span>
                              <span className="text-sm font-semibold">{keyword}</span>
                            </div>
                          )
                        })}
                        {drawingScores.aggregated.종합_평가 && (
                          <p className="text-sm text-muted-foreground mt-2 pt-2 border-t">
                            {drawingScores.aggregated.종합_평가}
                          </p>
                        )}
                        {drawingScores.peer_norms && (
                          <div className="mt-2 pt-2 border-t text-xs text-muted-foreground space-y-1">
                            <p className="font-medium">또래 평균 ({drawingScores.age}세 {drawingScores.sex === "남" ? "남아" : "여아"} 기준)</p>
                            <p>에너지(그림 크기): {drawingScores.peer_norms.에너지_또래평균}% · 표현력(객체 수): {drawingScores.peer_norms.표현력_또래평균}개</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Radar Chart - 심리 지표 (drawing_scores 있을 때 에너지/안정성/표현력) */}
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
                          <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 11 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                          <Radar
                            name="분석 결과"
                            dataKey="A"
                            stroke="hsl(var(--primary))"
                            fill="hsl(var(--primary))"
                            fillOpacity={0.25}
                            strokeWidth={2}
                          />
                          {radarData[0] != null && "B" in radarData[0] && (
                            <Radar
                              name={drawingScores?.age && drawingScores?.sex ? `또래 평균 (50점, ${drawingScores.age}세 ${drawingScores.sex === "남" ? "남아" : "여아"})` : "또래 평균 (50점)"}
                              dataKey="B"
                              stroke="hsl(var(--muted-foreground))"
                              fill="hsl(var(--muted))"
                              fillOpacity={0.1}
                              strokeWidth={1}
                              strokeDasharray="4 4"
                            />
                          )}
                        </RadarChart>
                      </ResponsiveContainer>
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
