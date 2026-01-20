"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
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

// Mock analysis result data
const analysisResult = {
  childName: "민준이",
  age: 7,
  drawingType: "집-나무-사람 (HTP)",
  overallScore: 85,
  summary: "민준이는 전반적으로 안정적인 정서 상태를 보이며, 또래 평균 대비 우수한 발달 수준을 나타냅니다.",
  developmentStage: "정상 발달",
  emotionalState: "안정",
}

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
                      {/* Placeholder for drawing with overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center p-8">
                          <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto mb-4">
                            {/* House */}
                            <rect x="30" y="80" width="60" height="50" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
                            <polygon points="30,80 60,50 90,80" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
                            <rect x="50" y="100" width="15" height="30" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" />
                            <rect x="35" y="90" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" />
                            {/* Tree */}
                            <rect x="120" y="100" width="10" height="30" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent" />
                            <circle cx="125" cy="80" r="25" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent" />
                            {/* Person */}
                            <circle cx="170" cy="70" r="12" fill="none" stroke="currentColor" strokeWidth="2" className="text-chart-4" />
                            <line x1="170" y1="82" x2="170" y2="110" stroke="currentColor" strokeWidth="2" className="text-chart-4" />
                            <line x1="170" y1="90" x2="155" y2="100" stroke="currentColor" strokeWidth="2" className="text-chart-4" />
                            <line x1="170" y1="90" x2="185" y2="100" stroke="currentColor" strokeWidth="2" className="text-chart-4" />
                            <line x1="170" y1="110" x2="160" y2="130" stroke="currentColor" strokeWidth="2" className="text-chart-4" />
                            <line x1="170" y1="110" x2="180" y2="130" stroke="currentColor" strokeWidth="2" className="text-chart-4" />
                            {/* Sun */}
                            <circle cx="40" cy="30" r="15" fill="none" stroke="currentColor" strokeWidth="2" className="text-chart-3" />
                            {/* Ground */}
                            <line x1="10" y1="130" x2="190" y2="130" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" strokeDasharray="4" />
                          </svg>
                          <p className="text-sm text-muted-foreground">분석된 그림 이미지</p>
                        </div>
                      </div>
                      {/* Legend */}
                      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-primary/20 text-primary">집</Badge>
                        <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">나무</Badge>
                        <Badge variant="secondary" className="bg-chart-4/20 text-chart-4">사람</Badge>
                        <Badge variant="secondary" className="bg-chart-3/20 text-chart-3">태양</Badge>
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
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Radar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      심리 지표
                    </CardTitle>
                    <CardDescription>
                      그림에서 분석된 심리적 특성입니다
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" className="text-xs" />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} />
                          <Radar
                            name="민준이"
                            dataKey="A"
                            stroke="hsl(var(--primary))"
                            fill="hsl(var(--primary))"
                            fillOpacity={0.3}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Color Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5 text-primary" />
                      색상 심리 분석
                    </CardTitle>
                    <CardDescription>
                      사용된 색상과 그 심리적 의미입니다
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {colorAnalysis.map((color) => (
                        <div key={color.color} className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg ${color.colorClass}`} />
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="font-medium text-foreground">{color.color}</span>
                              <span className="text-sm text-muted-foreground">{color.percentage}%</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{color.meaning}</p>
                          </div>
                          <div className="w-24">
                            <Progress value={color.percentage} className="h-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Emotional State */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-primary" />
                      감정 상태 해석
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      {psychologyData.map((item) => (
                        <div key={item.name} className="p-4 bg-muted/30 rounded-xl">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-medium text-foreground">{item.name}</span>
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                              {item.score}점
                            </Badge>
                          </div>
                          <Progress value={item.score} className="h-2 mb-2" />
                          <p className="text-xs text-muted-foreground">
                            {item.score >= 80 ? "양호" : item.score >= 60 ? "보통" : "관심 필요"}
                          </p>
                        </div>
                      ))}
                    </div>
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
