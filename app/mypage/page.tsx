"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User,
  Settings,
  FileText,
  Heart,
  Bookmark,
  ChevronRight,
  Calendar,
  TrendingUp,
  Award,
  ImageIcon,
  MessageCircle,
  Download,
  Share2,
  BarChart3,
  Palette,
  BookOpen,
  Plus,
  ExternalLink
} from "lucide-react"
import Link from "next/link"
import { DiaryOCR } from "@/components/mypage/diary-ocr"
import { Pagination } from "@/components/ui/pagination-simple"

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

const developmentData = [
  { key: "emotional", current: 78, previous: 72, label: "정서 발달", color: "bg-teal-500" },
  { key: "social", current: 82, previous: 78, label: "사회성 발달", color: "bg-blue-500" },
  { key: "cognitive", current: 75, previous: 70, label: "인지 발달", color: "bg-purple-500" },
  { key: "creative", current: 85, previous: 80, label: "창의성", color: "bg-amber-500" }
]

const ITEMS_PER_PAGE = 3

export default function MyPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isVisible, setIsVisible] = useState(false)
  const [historyPage, setHistoryPage] = useState(1)
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    profile_image_url: "base",
  })
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"

  const resolveProfileImageUrl = (value?: string | null) => {
    if (!value || value === "base") return null
    const trimmed = value.trim()
    if (
      trimmed.startsWith("data:") ||
      trimmed.startsWith("blob:") ||
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://")
    ) {
      return trimmed
    }
    if (/^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(trimmed)) {
      return `https://${trimmed}`
    }
    if (trimmed.startsWith("/")) {
      const base =
        apiBaseUrl || (typeof window !== "undefined" ? window.location.origin : "")
      return base ? new URL(trimmed, base).toString() : trimmed
    }
    return trimmed
  }

  const profileImageSrc = resolveProfileImageUrl(profile.profile_image_url)

  const totalHistoryPages = Math.ceil(mockAnalysisHistory.length / ITEMS_PER_PAGE)
  const paginatedHistory = mockAnalysisHistory.slice(
    (historyPage - 1) * ITEMS_PER_PAGE,
    historyPage * ITEMS_PER_PAGE
  )

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    const token =
      localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
    if (!token) {
      return
    }
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/auth/me`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) {
          return
        }
        const data = await response.json()
        setProfile({
          name: data.name ?? "",
          email: data.email ?? "",
          profile_image_url: data.profile_image_url ?? "base",
        })
      } catch {
        // ignore profile fetch errors for now
      }
    }
    fetchProfile()
  }, [apiBaseUrl])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Profile Section - Full Width Banner */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600">
          <div className="container mx-auto px-4 lg:px-8 py-8">
            <div 
              className={`flex flex-col md:flex-row items-center gap-6 transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <Avatar className="h-24 w-24 border-4 border-white/30">
                {profileImageSrc && (
                  <AvatarImage src={profileImageSrc} alt={profile.name || "프로필"} />
                )}
                <AvatarFallback className="text-2xl bg-white text-teal-600 font-bold">
                  {(profile.name || " ").trim().charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left text-white">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <h1 className="text-2xl font-bold">{profile.name || "회원"}</h1>
                  <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">프리미엄</Badge>
                </div>
                <p className="text-teal-100 mt-1">{profile.email || "이메일 정보 없음"}</p>
                <div className="flex items-center justify-center md:justify-start gap-4 mt-3 text-sm text-teal-100">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span className="flex items-center gap-1.5">
                      {profileImageSrc && (
                        <img
                          src={profileImageSrc}
                          alt={profile.name || "프로필"}
                          className="h-4 w-4 rounded-full object-cover border border-white/30"
                        />
                      )}
                      2023.06.15 가입
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    분석 {mockAnalysisHistory.length}회
                  </span>
                </div>
              </div>
              
              <Link href="/mypage/settings">
                <Button variant="outline" size="sm" className="gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white">
                  <Settings className="h-4 w-4" />
                  설정
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="container mx-auto px-4 lg:px-8 -mt-6">
          <div 
            className={`grid grid-cols-3 gap-4 transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 p-6 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-50 mb-3">
                <FileText className="h-5 w-5 text-teal-600" />
              </div>
              <p className="text-3xl font-bold text-slate-800">{mockAnalysisHistory.length}</p>
              <p className="text-sm text-slate-500 mt-1">총 분석</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 p-6 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 mb-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-slate-800">80<span className="text-lg">점</span></p>
              <p className="text-sm text-slate-500 mt-1">평균 점수</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 p-6 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 mb-3">
                <Award className="h-5 w-5 text-amber-600" />
              </div>
              <p className="text-3xl font-bold text-slate-800">2<span className="text-lg">명</span></p>
              <p className="text-sm text-slate-500 mt-1">등록 아이</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList 
              className={`w-full justify-start overflow-x-auto bg-slate-100 rounded-full p-1 mb-8 transition-all duration-700 delay-200 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <TabsTrigger value="overview" className="gap-2 rounded-full px-5 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <BarChart3 className="h-4 w-4" />
                개요
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2 rounded-full px-5 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <FileText className="h-4 w-4" />
                분석 기록
              </TabsTrigger>
              <TabsTrigger value="diary" className="gap-2 rounded-full px-5 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <BookOpen className="h-4 w-4" />
                그림일기 OCR
              </TabsTrigger>
              <TabsTrigger value="children" className="gap-2 rounded-full px-5 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <User className="h-4 w-4" />
                아이 관리
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2 rounded-full px-5 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <MessageCircle className="h-4 w-4" />
                활동
              </TabsTrigger>
              <TabsTrigger value="bookmarks" className="gap-2 rounded-full px-5 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Bookmark className="h-4 w-4" />
                저장됨
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              {/* Development Progress */}
              <section
                className={`transition-all duration-700 delay-300 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-slate-800">발달 영역별 분석</h2>
                  <span className="text-sm text-slate-400">최근 분석 결과 기반</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {developmentData.map((data, index) => (
                    <div 
                      key={data.key}
                      className={`bg-slate-50 rounded-2xl p-5 transition-all duration-500 hover:bg-slate-100 ${
                        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                      }`}
                      style={{ transitionDelay: `${400 + index * 100}ms` }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-slate-600">{data.label}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          data.current > data.previous ? "bg-green-100 text-green-600" : "bg-slate-200 text-slate-500"
                        }`}>
                          {data.current > data.previous ? "+" : ""}{data.current - data.previous}
                        </span>
                      </div>
                      <p className="text-3xl font-bold text-slate-800">{data.current}</p>
                      <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${data.color} rounded-full transition-all duration-1000`}
                          style={{ width: `${data.current}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Recent Analysis */}
              <section
                className={`transition-all duration-700 delay-500 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-slate-800">최근 분석 기록</h2>
                  <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700" onClick={() => setActiveTab("history")}>
                    전체보기
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {mockAnalysisHistory.slice(0, 3).map((analysis, index) => (
                    <AnalysisCard 
                      key={analysis.id} 
                      analysis={analysis}
                      delay={600 + index * 100}
                      isVisible={isVisible}
                    />
                  ))}
                </div>
              </section>
            </TabsContent>

            {/* Analysis History Tab */}
            <TabsContent value="history">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">분석 기록</h2>
                  <p className="text-sm text-slate-500 mt-1">지금까지 진행한 모든 그림 분석 기록 ({mockAnalysisHistory.length}건)</p>
                </div>
                <Link href="/analysis">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    새 분석
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {paginatedHistory.map((analysis, index) => (
                  <AnalysisCard 
                    key={analysis.id} 
                    analysis={analysis} 
                    showActions
                    delay={index * 100}
                    isVisible={true}
                  />
                ))}
              </div>
              {totalHistoryPages > 1 && (
                <Pagination
                  currentPage={historyPage}
                  totalPages={totalHistoryPages}
                  onPageChange={setHistoryPage}
                />
              )}
            </TabsContent>

            {/* Diary OCR Tab */}
            <TabsContent value="diary">
              <DiaryOCR />
            </TabsContent>

            {/* Children Management Tab */}
            <TabsContent value="children">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">아이 관리</h2>
                  <p className="text-sm text-slate-500 mt-1">등록된 아이 정보</p>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  아이 추가
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <ChildCard 
                  name="김지우" 
                  age="5세" 
                  gender="여아" 
                  birthDate="2019.03.15"
                  analysisCount={3}
                  color="bg-pink-500"
                />
                <ChildCard 
                  name="김민서" 
                  age="7세" 
                  gender="남아" 
                  birthDate="2017.08.22"
                  analysisCount={1}
                  color="bg-blue-500"
                />
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-800">활동 내역</h2>
                <p className="text-sm text-slate-500 mt-1">커뮤니티 활동 기록</p>
              </div>
              <div className="space-y-3">
                {mockActivities.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <div className={`p-2.5 rounded-xl ${
                      activity.type === "post" ? "bg-blue-100" :
                      activity.type === "comment" ? "bg-green-100" : "bg-red-100"
                    }`}>
                      {activity.type === "post" ? (
                        <FileText className="h-5 w-5 text-blue-600" />
                      ) : activity.type === "comment" ? (
                        <MessageCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Heart className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">{activity.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                        <span className="text-teal-600">{activity.category}</span>
                        <span>·</span>
                        <span>{activity.date}</span>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Bookmarks Tab */}
            <TabsContent value="bookmarks">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-800">저장된 게시글</h2>
                <p className="text-sm text-slate-500 mt-1">북마크한 게시글 목록</p>
              </div>
              <div className="space-y-3">
                {mockBookmarks.map((bookmark) => (
                  <div 
                    key={bookmark.id} 
                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <div className="p-2.5 bg-teal-100 rounded-xl">
                      <Bookmark className="h-5 w-5 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">{bookmark.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                        <span>{bookmark.author}</span>
                        <span>·</span>
                        <span className="text-teal-600">{bookmark.category}</span>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function AnalysisCard({ 
  analysis, 
  showActions = false,
  delay = 0,
  isVisible = true
}: { 
  analysis: AnalysisHistory
  showActions?: boolean
  delay?: number
  isVisible?: boolean
}) {
  return (
    <div 
      className={`flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all duration-500 cursor-pointer ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center">
        <Palette className="h-7 w-7 text-teal-600" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-slate-800">{analysis.drawingType}</h4>
          <Badge variant={analysis.status === "완료" ? "default" : "secondary"} className="text-xs">
            {analysis.status}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
          <span>{analysis.childName} ({analysis.childAge})</span>
          <span>·</span>
          <span>{analysis.date}</span>
        </div>
      </div>

      {analysis.status === "완료" && (
        <div className="text-right">
          <p className="text-2xl font-bold text-teal-600">{analysis.overallScore}</p>
          <p className="text-xs text-slate-400">점수</p>
        </div>
      )}
      
      {showActions && analysis.status === "완료" && (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

function ChildCard({ 
  name, 
  age, 
  gender, 
  birthDate, 
  analysisCount,
  color
}: { 
  name: string
  age: string
  gender: string
  birthDate: string
  analysisCount: number
  color: string
}) {
  return (
    <div className="bg-slate-50 rounded-2xl p-5 hover:bg-slate-100 transition-colors cursor-pointer">
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-full ${color} flex items-center justify-center`}>
          <span className="text-xl font-bold text-white">{name.charAt(0)}</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-800">{name}</h3>
          <p className="text-sm text-slate-500">{age} · {gender}</p>
        </div>
        <ChevronRight className="h-5 w-5 text-slate-400" />
      </div>
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-200">
        <div className="flex-1">
          <p className="text-xs text-slate-400">생년월일</p>
          <p className="text-sm font-medium text-slate-700">{birthDate}</p>
        </div>
        <div className="flex-1">
          <p className="text-xs text-slate-400">분석 횟수</p>
          <p className="text-sm font-medium text-slate-700">{analysisCount}회</p>
        </div>
      </div>
    </div>
  )
}
