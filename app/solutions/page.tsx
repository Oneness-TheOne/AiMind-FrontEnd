"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { VideoHero } from "@/components/shared/video-hero"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Palette,
  Lightbulb,
  Heart,
  BookOpen,
  Play,
  Clock,
  Users,
  Star,
  ChevronRight,
  Sparkles,
} from "lucide-react"

const therapyMethods = [
  {
    id: "art-therapy",
    title: "미술 치료",
    description: "다양한 미술 활동을 통해 감정을 표현하고 내면을 탐색합니다",
    icon: Palette,
    color: "bg-primary",
    activities: [
      {
        name: "자유화 그리기",
        duration: "20분",
        description: "어떤 주제도 없이 자유롭게 그림을 그리며 무의식적 감정을 표현합니다.",
        steps: ["종이와 다양한 그리기 도구를 준비합니다", "아이에게 자유롭게 그리도록 합니다", "완성 후 그림에 대해 대화합니다"],
      },
      {
        name: "감정 색칠하기",
        duration: "15분",
        description: "다양한 색상을 사용하여 현재 느끼는 감정을 표현합니다.",
        steps: ["오늘의 기분을 물어봅니다", "그 감정을 색으로 표현하게 합니다", "색을 선택한 이유를 들어봅니다"],
      },
      {
        name: "콜라주 만들기",
        duration: "30분",
        description: "잡지나 종이를 오려 붙여 자신만의 작품을 만듭니다.",
        steps: ["잡지, 가위, 풀을 준비합니다", "마음에 드는 이미지를 선택하게 합니다", "선택한 이유에 대해 이야기합니다"],
      },
    ],
  },
  {
    id: "play-therapy",
    title: "놀이 치료",
    description: "놀이를 통해 자연스럽게 감정을 표현하고 사회성을 기릅니다",
    icon: Play,
    color: "bg-accent",
    activities: [
      {
        name: "역할 놀이",
        duration: "25분",
        description: "다양한 역할을 연기하며 감정과 상황을 이해합니다.",
        steps: ["인형이나 장난감을 준비합니다", "아이가 원하는 역할을 선택하게 합니다", "자연스러운 놀이를 이어갑니다"],
      },
      {
        name: "모래 놀이",
        duration: "20분",
        description: "모래와 소품을 이용해 자신만의 세계를 만들어봅니다.",
        steps: ["모래판과 다양한 소품을 준비합니다", "자유롭게 꾸미도록 합니다", "만든 것에 대해 이야기합니다"],
      },
    ],
  },
  {
    id: "reading-therapy",
    title: "독서 치료",
    description: "책을 읽으며 감정을 이해하고 공감 능력을 키웁니다",
    icon: BookOpen,
    color: "bg-chart-2",
    activities: [
      {
        name: "감정 그림책 읽기",
        duration: "15분",
        description: "감정을 다룬 그림책을 함께 읽고 이야기합니다.",
        steps: ["감정 관련 그림책을 선택합니다", "함께 읽으며 등장인물의 감정을 물어봅니다", "비슷한 경험을 나눕니다"],
      },
      {
        name: "이야기 만들기",
        duration: "20분",
        description: "아이가 직접 이야기를 만들어 감정을 표현합니다.",
        steps: ["시작 문장을 제시합니다", "아이가 이야기를 이어가게 합니다", "등장인물의 감정에 대해 이야기합니다"],
      },
    ],
  },
]

const colorRecommendations = [
  {
    emotion: "불안함",
    colors: ["파랑", "초록"],
    colorClasses: ["bg-blue-500", "bg-green-500"],
    description: "차분하고 안정적인 느낌의 색상으로 마음을 진정시킵니다",
    activities: ["파란 하늘 그리기", "숲 풍경 색칠하기", "바다 물결 표현하기"],
  },
  {
    emotion: "우울함",
    colors: ["노랑", "주황"],
    colorClasses: ["bg-yellow-500", "bg-orange-500"],
    description: "밝고 따뜻한 색상으로 기분을 환기시킵니다",
    activities: ["해바라기 그리기", "무지개 색칠하기", "밝은 꽃밭 표현하기"],
  },
  {
    emotion: "분노",
    colors: ["파랑", "보라"],
    colorClasses: ["bg-blue-500", "bg-violet-500"],
    description: "시원하고 차분한 색상으로 감정을 가라앉힙니다",
    activities: ["밤하늘 그리기", "깊은 바다 표현하기", "보라색 꽃 그리기"],
  },
  {
    emotion: "외로움",
    colors: ["분홍", "노랑"],
    colorClasses: ["bg-pink-500", "bg-yellow-500"],
    description: "따뜻하고 포근한 색상으로 마음을 감싸줍니다",
    activities: ["가족 그림 그리기", "친구와 노는 모습 표현하기", "따뜻한 집 그리기"],
  },
]

const homeActivities = [
  {
    title: "그림 일기 쓰기",
    frequency: "매일",
    duration: "10-15분",
    ageRange: "5-12세",
    description: "하루의 감정과 경험을 그림으로 표현하는 습관을 들입니다.",
    materials: ["그림 일기장", "색연필 또는 크레파스"],
    benefits: ["감정 인식 능력 향상", "표현력 발달", "자기 이해 증진"],
  },
  {
    title: "가족 미술 시간",
    frequency: "주 1-2회",
    duration: "30분",
    ageRange: "전 연령",
    description: "온 가족이 함께 그림을 그리며 소통하는 시간을 갖습니다.",
    materials: ["큰 종이", "다양한 미술 도구"],
    benefits: ["가족 유대감 강화", "소통 능력 향상", "창의력 발달"],
  },
  {
    title: "감정 카드 게임",
    frequency: "주 2-3회",
    duration: "15분",
    ageRange: "4-10세",
    description: "감정 카드를 활용해 다양한 감정을 인식하고 표현합니다.",
    materials: ["감정 카드 (직접 만들기 가능)"],
    benefits: ["감정 어휘력 향상", "공감 능력 발달", "감정 조절 능력 향상"],
  },
  {
    title: "자연물 아트",
    frequency: "주 1회",
    duration: "40분",
    ageRange: "4-12세",
    description: "나뭇잎, 돌, 꽃 등 자연물을 이용해 작품을 만듭니다.",
    materials: ["자연물 (나뭇잎, 돌, 꽃 등)", "종이, 풀"],
    benefits: ["자연 친화력 향상", "창의력 발달", "집중력 향상"],
  },
]

export default function SolutionsPage() {
  const [selectedTherapy, setSelectedTherapy] = useState("art-therapy")

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      {/* Video Hero */}
      <div className="-mt-14">
        <VideoHero
          subtitle="전문가 추천"
          title="맞춤 솔루션"
          description="전문가가 제안하는 다양한 치료법과 활동을 통해 아이의 건강한 정서 발달을 도와주세요."
          height="small"
        />
      </div>

      <main className="flex-1 bg-slate-50">

        {/* Main Content */}
        <section className="pb-20">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="therapy" className="space-y-8">
              <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
                <TabsTrigger value="therapy" className="gap-2">
                  <Heart className="h-4 w-4 hidden sm:block" />
                  치료법 제안
                </TabsTrigger>
                <TabsTrigger value="colors" className="gap-2">
                  <Palette className="h-4 w-4 hidden sm:block" />
                  색상 추천
                </TabsTrigger>
                <TabsTrigger value="activities" className="gap-2">
                  <Lightbulb className="h-4 w-4 hidden sm:block" />
                  활동 가이드
                </TabsTrigger>
              </TabsList>

              {/* Therapy Methods Tab */}
              <TabsContent value="therapy" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3 mb-8">
                  {therapyMethods.map((method) => {
                    const Icon = method.icon
                    return (
                      <Card
                        key={method.id}
                        className={`cursor-pointer transition-all ${
                          selectedTherapy === method.id
                            ? "border-primary ring-2 ring-primary/20"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedTherapy(method.id)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className={`h-12 w-12 rounded-xl ${method.color} flex items-center justify-center`}>
                              <Icon className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">{method.title}</h3>
                              <p className="text-sm text-muted-foreground">{method.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {/* Selected Therapy Activities */}
                {therapyMethods.map((method) => (
                  method.id === selectedTherapy && (
                    <Card key={method.id}>
                      <CardHeader>
                        <CardTitle>{method.title} 활동</CardTitle>
                        <CardDescription>
                          가정에서 쉽게 할 수 있는 {method.title} 활동입니다
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                          {method.activities.map((activity, index) => (
                            <AccordionItem key={index} value={`activity-${index}`}>
                              <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-3 text-left">
                                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-sm font-semibold text-primary">{index + 1}</span>
                                  </div>
                                  <div>
                                    <p className="font-medium">{activity.name}</p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {activity.duration}
                                    </p>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="pl-11 space-y-4">
                                  <p className="text-muted-foreground">{activity.description}</p>
                                  <div>
                                    <p className="text-sm font-medium text-foreground mb-2">진행 방법</p>
                                    <ol className="space-y-2">
                                      {activity.steps.map((step, stepIndex) => (
                                        <li key={stepIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                                          <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                          {step}
                                        </li>
                                      ))}
                                    </ol>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardContent>
                    </Card>
                  )
                ))}
              </TabsContent>

              {/* Color Recommendations Tab */}
              <TabsContent value="colors" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {colorRecommendations.map((rec) => (
                    <Card key={rec.emotion}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{rec.emotion}을 느낄 때</CardTitle>
                          <div className="flex gap-1">
                            {rec.colorClasses.map((colorClass, index) => (
                              <div key={index} className={`h-6 w-6 rounded-full ${colorClass}`} />
                            ))}
                          </div>
                        </div>
                        <CardDescription>{rec.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-foreground">추천 색상: {rec.colors.join(", ")}</p>
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-foreground">추천 활동</p>
                            <ul className="space-y-1">
                              {rec.activities.map((activity, index) => (
                                <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                  {activity}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Lightbulb className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">색상 활용 팁</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          아이가 특정 색상을 거부하거나 선호한다면 그것도 중요한 신호입니다. 
                          색상 선택을 강요하지 말고, 아이가 자연스럽게 선택하도록 해주세요. 
                          시간이 지나면서 선호하는 색상이 변화하는 것도 자연스러운 현상입니다.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Home Activities Tab */}
              <TabsContent value="activities" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {homeActivities.map((activity) => (
                    <Card key={activity.title}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{activity.title}</CardTitle>
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            {activity.ageRange}
                          </Badge>
                        </div>
                        <CardDescription>{activity.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex gap-4 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {activity.duration}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Star className="h-4 w-4" />
                            {activity.frequency}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-foreground mb-2">준비물</p>
                          <div className="flex flex-wrap gap-2">
                            {activity.materials.map((material, index) => (
                              <Badge key={index} variant="outline" className="bg-transparent">
                                {material}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-foreground mb-2">기대 효과</p>
                          <ul className="space-y-1">
                            {activity.benefits.map((benefit, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="bg-accent/10 border-accent/20">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                        <Users className="h-6 w-6 text-accent-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">전문가 상담이 필요하신가요?</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                          가정에서의 활동만으로 부족하다고 느껴지신다면, 전문 상담소의 도움을 받아보세요.
                          주변의 아동 심리 상담소를 찾아보실 수 있습니다.
                        </p>
                        <Button variant="outline" className="gap-2 bg-transparent" asChild>
                          <a href="/counseling">
                            주변 상담소 찾기
                            <ChevronRight className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
