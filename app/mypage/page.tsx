"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  User,
  Settings,
  FileText,
  Heart,
  Bookmark,
  Bell,
  ChevronRight,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  ImageIcon,
  MessageCircle,
  Download,
  Share2,
  BarChart3,
  Palette,
  BookOpen
} from "lucide-react"
import Link from "next/link"
import { DiaryOCR } from "@/components/diary-ocr"

interface AnalysisHistory {
  id: string
  date: string
  childName: string
  childAge: string
  drawingType: string
  thumbnail: string
  overallScore: number
  status: "완료" | "분석중"
}

interface ActivityItem {
  id: string
  type: "post" | "comment" | "like"
  title: string
  date: string
  category: string
}

const mockAnalysisHistory: AnalysisHistory[] = [
  {
    id: "1",
    date: "2024.01.15",
    childName: "김지우",
    childAge: "5세",
    drawingType: "가족 그림",
    thumbnail: "/placeholder.svg",
    overallScore: 78,
    status: "완료"
  },
  {
    id: "2",
    date: "2024.01.10",
    childName: "김지우",
    childAge: "5세",
    drawingType: "집 그림",
    thumbnail: "/placeholder.svg",
    overallScore: 82,
    status: "완료"
  },
  {
    id: "3",
    date: "2024.01.05",
    childName: "김민서",
    childAge: "7세",
    drawingType: "나무 그림",
    thumbnail: "/placeholder.svg",
    overallScore: 75,
    status: "완료"
  },
  {
    id: "4",
    date: "2024.01.02",
    childName: "김지우",
    childAge: "5세",
    drawingType: "자유 그림",
    thumbnail: "/placeholder.svg",
    overallScore: 0,
    status: "분석중"
  }
]

const mockActivities: ActivityItem[] = [
  {
    id: "1",
    type: "post",
    title: "5살 아이 그림에서 불안 징후가 보인다고 하는데...",
    date: "2024.01.15",
    category: "Q&A"
  },
  {
    id: "2",
    type: "comment",
    title: "저도 비슷한 경험이 있어요. 전문가 상담을 권해드려요.",
    date: "2024.01.14",
    category: "Q&A"
  },
  {
    id: "3",
    type: "like",
    title: "[전문가 칼럼] 아이의 그림으로 읽는 마음",
    date: "2024.01.13",
    category: "전문가 칼럼"
  }
]

const mockBookmarks = [
  {
    id: "1",
    title: "[전문가 칼럼] 아이의 그림으로 읽는 마음 - 색상이 말하는 것들",
    author: "김미영 심리상담사",
    date: "2024.01.12",
    category: "전문가 칼럼"
  },
  {
    id: "2",
    title: "집에서 할 수 있는 정서 발달 놀이 5가지 공유해요!",
    author: "놀이대장맘",
    date: "2024.01.10",
    category: "육아 꿀팁"
  }
]

const developmentData = {
  emotional: { current: 78, previous: 72, label: "정서 발달" },
  social: { current: 82, previous: 78, label: "사회성 발달" },
  cognitive: { current: 75, previous: 70, label: "인지 발달" },
  creative: { current: 85, previous: 80, label: "창의성" }
}

export default function MyPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 md:p-8 mb-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  김
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h1 className="text-2xl font-bold text-foreground">김미래</h1>
                  <Badge>프리미엄</Badge>
                </div>
                <p className="text-muted-foreground mt-1">miracle.mom@email.com</p>
                <div className="flex items-center justify-center md:justify-start gap-4 mt-3 text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    가입일: 2023.06.15
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    분석 {mockAnalysisHistory.length}회
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Link href="/mypage/settings">
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <Settings className="h-4 w-4" />
                    설정
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start overflow-x-auto bg-muted/50 mb-6">
              <TabsTrigger value="overview" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                개요
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <FileText className="h-4 w-4" />
                분석 기록
              </TabsTrigger>
              <TabsTrigger value="diary" className="gap-2">
                <BookOpen className="h-4 w-4" />
                그림일기 OCR
              </TabsTrigger>
              <TabsTrigger value="children" className="gap-2">
                <User className="h-4 w-4" />
                아이 관리
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                활동 내역
              </TabsTrigger>
              <TabsTrigger value="bookmarks" className="gap-2">
                <Bookmark className="h-4 w-4" />
                저장됨
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Quick Stats */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">총 분석 횟수</p>
                        <p className="text-2xl font-bold text-foreground">{mockAnalysisHistory.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 rounded-xl">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">평균 발달 점수</p>
                        <p className="text-2xl font-bold text-foreground">80점</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-amber-100 rounded-xl">
                        <Award className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">등록된 아이</p>
                        <p className="text-2xl font-bold text-foreground">2명</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Development Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    발달 영역별 추이
                  </CardTitle>
                  <CardDescription>최근 분석 결과 기반</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {Object.entries(developmentData).map(([key, data]) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{data.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{data.current}점</span>
                          <Badge variant={data.current > data.previous ? "default" : "secondary"} className="text-xs">
                            {data.current > data.previous ? "+" : ""}{data.current - data.previous}
                          </Badge>
                        </div>
                      </div>
                      <Progress value={data.current} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Analysis */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>최근 분석 기록</CardTitle>
                  <Button variant="ghost" className="text-sm" onClick={() => setActiveTab("history")}>
                    전체보기
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAnalysisHistory.slice(0, 3).map(analysis => (
                      <AnalysisHistoryItem key={analysis.id} analysis={analysis} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analysis History Tab */}
            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>분석 기록</CardTitle>
                  <CardDescription>지금까지 진행한 모든 그림 분석 기록입니다</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAnalysisHistory.map(analysis => (
                      <AnalysisHistoryItem key={analysis.id} analysis={analysis} showActions />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Diary OCR Tab */}
            <TabsContent value="diary" className="space-y-6">
              <DiaryOCR />
            </TabsContent>

            {/* Children Management Tab */}
            <TabsContent value="children" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">아이 관리</h2>
                  <p className="text-muted-foreground text-sm">등록된 아이 정보를 관리합니다</p>
                </div>
                <Button className="gap-2">
                  <User className="h-4 w-4" />
                  아이 추가
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ChildCard 
                  name="김지우" 
                  age="5세" 
                  gender="여아" 
                  birthDate="2019.03.15"
                  analysisCount={3}
                />
                <ChildCard 
                  name="김민서" 
                  age="7세" 
                  gender="남아" 
                  birthDate="2017.08.22"
                  analysisCount={1}
                />
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>활동 내역</CardTitle>
                  <CardDescription>커뮤니티 활동 기록입니다</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockActivities.map(activity => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className={`p-2 rounded-full ${
                          activity.type === "post" ? "bg-blue-100" :
                          activity.type === "comment" ? "bg-green-100" : "bg-red-100"
                        }`}>
                          {activity.type === "post" ? (
                            <FileText className="h-4 w-4 text-blue-600" />
                          ) : activity.type === "comment" ? (
                            <MessageCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Heart className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground line-clamp-1">{activity.title}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs">{activity.category}</Badge>
                            <span>{activity.date}</span>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Bookmarks Tab */}
            <TabsContent value="bookmarks" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>저장된 게시글</CardTitle>
                  <CardDescription>북마크한 게시글 목록입니다</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockBookmarks.map(bookmark => (
                      <div key={bookmark.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Bookmark className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground line-clamp-1">{bookmark.title}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>{bookmark.author}</span>
                            <span>·</span>
                            <Badge variant="outline" className="text-xs">{bookmark.category}</Badge>
                            <span>·</span>
                            <span>{bookmark.date}</span>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
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

function AnalysisHistoryItem({ 
  analysis, 
  showActions = false 
}: { 
  analysis: AnalysisHistory
  showActions?: boolean 
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border hover:shadow-sm transition-shadow">
      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
        <Palette className="h-8 w-8 text-muted-foreground" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-foreground">{analysis.drawingType}</h4>
          <Badge variant={analysis.status === "완료" ? "default" : "secondary"}>
            {analysis.status}
          </Badge>
        </div>
        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
          <span>{analysis.childName} ({analysis.childAge})</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {analysis.date}
          </span>
        </div>
        {analysis.status === "완료" && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-muted-foreground">종합 점수:</span>
            <span className="font-semibold text-primary">{analysis.overallScore}점</span>
          </div>
        )}
      </div>
      
      {showActions && analysis.status === "완료" && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1 bg-transparent">
            <Download className="h-3 w-3" />
            PDF
          </Button>
          <Button variant="outline" size="sm" className="gap-1 bg-transparent">
            <Share2 className="h-3 w-3" />
            공유
          </Button>
          <Link href="/analysis/result">
            <Button size="sm" className="gap-1">
              상세보기
              <ChevronRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      )}
      
      {!showActions && (
        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
      )}
    </div>
  )
}

function ChildCard({ 
  name, 
  age, 
  gender, 
  birthDate, 
  analysisCount 
}: { 
  name: string
  age: string
  gender: string
  birthDate: string
  analysisCount: number
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground">{name}</h3>
              <p className="text-sm text-muted-foreground">{age} · {gender}</p>
              <p className="text-xs text-muted-foreground mt-1">생년월일: {birthDate}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <span className="text-sm text-muted-foreground">분석 횟수</span>
          <span className="font-semibold">{analysisCount}회</span>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Link href="/analysis" className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">새 분석</Button>
          </Link>
          <Link href="/analysis/result" className="flex-1">
            <Button className="w-full">기록 보기</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
