"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  MessageCircle, 
  Heart, 
  Eye,
  TrendingUp,
  Clock,
  PenSquare,
  Bookmark,
  MoreHorizontal,
  ChevronRight,
  Users,
  Award
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

interface Post {
  id: string
  title: string
  content: string
  author: {
    name: string
    avatar?: string
    badge?: string
  }
  category: string
  createdAt: string
  views: number
  likes: number
  comments: number
  isLiked: boolean
  isBookmarked: boolean
  tags: string[]
}

interface Expert {
  id: string
  name: string
  title: string
  avatar?: string
  specialty: string
  answerCount: number
}

const categories = [
  { id: "all", label: "전체" },
  { id: "free", label: "자유게시판" },
  { id: "tips", label: "육아 꿀팁" },
  { id: "qna", label: "Q&A" },
  { id: "review", label: "상담 후기" },
  { id: "expert", label: "전문가 칼럼" },
]

const mockPosts: Post[] = [
  {
    id: "1",
    title: "5살 아이 그림에서 불안 징후가 보인다고 하는데, 어떻게 해야 할까요?",
    content: "아이가 최근에 그린 그림을 분석해보니 불안 징후가 나온다고 해서 걱정이 됩니다. 비슷한 경험 있으신 분 계신가요?",
    author: { name: "걱정맘", badge: "활발한 회원" },
    category: "qna",
    createdAt: "10분 전",
    views: 234,
    likes: 45,
    comments: 23,
    isLiked: false,
    isBookmarked: false,
    tags: ["불안", "5세", "그림분석"]
  },
  {
    id: "2",
    title: "[전문가 칼럼] 아이의 그림으로 읽는 마음 - 색상이 말하는 것들",
    content: "아이들이 사용하는 색상에는 특별한 의미가 담겨 있습니다. 오늘은 색상별로 아이의 심리 상태를 파악하는 방법을 알려드릴게요.",
    author: { name: "김미영 심리상담사", badge: "전문가" },
    category: "expert",
    createdAt: "2시간 전",
    views: 1523,
    likes: 312,
    comments: 45,
    isLiked: true,
    isBookmarked: true,
    tags: ["색상심리", "전문가칼럼", "그림분석"]
  },
  {
    id: "3",
    title: "상담센터 다녀왔어요! 마음숲 아동심리상담센터 솔직 후기",
    content: "지난주에 아이랑 같이 상담받고 왔는데요, 생각보다 너무 좋았어서 후기 남겨봅니다.",
    author: { name: "행복한엄마" },
    category: "review",
    createdAt: "5시간 전",
    views: 567,
    likes: 89,
    comments: 34,
    isLiked: false,
    isBookmarked: false,
    tags: ["상담후기", "마음숲", "추천"]
  },
  {
    id: "4",
    title: "아이가 검은색만 사용해서 그림을 그려요",
    content: "7살 남자아이인데 요즘 그림 그릴 때 검은색만 사용해요. 다른 색 쓰라고 해도 검은색만 고집하는데 괜찮은 걸까요?",
    author: { name: "초보맘22" },
    category: "qna",
    createdAt: "어제",
    views: 892,
    likes: 56,
    comments: 67,
    isLiked: false,
    isBookmarked: true,
    tags: ["색상", "7세", "남아"]
  },
  {
    id: "5",
    title: "놀이치료 vs 미술치료, 어떤 게 더 좋을까요?",
    content: "발달검사 받고 치료를 권유받았는데 놀이치료랑 미술치료 중에 뭐가 더 효과적일지 고민이에요.",
    author: { name: "궁금한아빠" },
    category: "qna",
    createdAt: "2일 전",
    views: 456,
    likes: 34,
    comments: 28,
    isLiked: false,
    isBookmarked: false,
    tags: ["놀이치료", "미술치료", "치료선택"]
  },
  {
    id: "6",
    title: "집에서 할 수 있는 정서 발달 놀이 5가지 공유해요!",
    content: "심리상담사님께 배운 집에서 쉽게 할 수 있는 정서 발달 놀이들 공유합니다. 우리 아이한테 효과 좋았어요!",
    author: { name: "놀이대장맘", badge: "인기 작성자" },
    category: "tips",
    createdAt: "3일 전",
    views: 2341,
    likes: 456,
    comments: 78,
    isLiked: true,
    isBookmarked: false,
    tags: ["정서발달", "집놀이", "꿀팁"]
  }
]

const mockExperts: Expert[] = [
  {
    id: "1",
    name: "김미영",
    title: "아동심리상담사",
    specialty: "발달심리",
    answerCount: 234
  },
  {
    id: "2",
    name: "이수진",
    title: "미술치료사",
    specialty: "미술치료",
    answerCount: 189
  },
  {
    id: "3",
    name: "박정훈",
    title: "놀이치료사",
    specialty: "놀이치료",
    answerCount: 156
  }
]

const popularTags = ["그림분석", "발달검사", "미술치료", "놀이치료", "정서발달", "5세", "7세", "불안", "ADHD", "부모상담"]

export default function CommunityPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [posts, setPosts] = useState(mockPosts)

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleLike = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        }
      }
      return post
    }))
  }

  const toggleBookmark = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return { ...post, isBookmarked: !post.isBookmarked }
      }
      return post
    }))
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-white border-b border-slate-100 py-10 md:py-14">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                맘스퀘어
              </h1>
              <p className="text-muted-foreground mt-2">
                부모님들의 이야기를 나누고, 전문가의 조언을 받아보세요
              </p>
              
              <div className="relative mt-6 max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="궁금한 내용을 검색해보세요"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-base rounded-lg border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {popularTags.slice(0, 6).map(tag => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-primary/10 hover:text-primary bg-slate-100 text-slate-600"
                    onClick={() => setSearchQuery(tag)}
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Category Tabs */}
              <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-slate-100">
                <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                  <div className="flex items-center justify-between">
                    <TabsList className="bg-slate-100 overflow-x-auto">
                      {categories.map(category => (
                        <TabsTrigger 
                          key={category.id} 
                          value={category.id}
                          className="whitespace-nowrap data-[state=active]:bg-white"
                        >
                          {category.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    
                    <Link href="/community/write">
                      <Button className="gap-2 hidden md:flex rounded-full">
                        <PenSquare className="h-4 w-4" />
                        글쓰기
                      </Button>
                    </Link>
                  </div>
                </Tabs>
              </div>

              {/* Sort Options */}
              <div className="flex items-center gap-4 text-sm">
                <button className="flex items-center gap-1 text-primary font-medium">
                  <TrendingUp className="h-4 w-4" />
                  인기순
                </button>
                <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                  <Clock className="h-4 w-4" />
                  최신순
                </button>
              </div>

              {/* Posts List */}
              <div className="space-y-4">
                {filteredPosts.map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    onLike={() => toggleLike(post.id)}
                    onBookmark={() => toggleBookmark(post.id)}
                  />
                ))}
              </div>

              {filteredPosts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">검색 결과가 없습니다</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Write Button (Mobile) */}
              <Link href="/community/write" className="block md:hidden">
                <Button className="w-full gap-2">
                  <PenSquare className="h-4 w-4" />
                  글쓰기
                </Button>
              </Link>

              {/* Active Experts */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    활동 중인 전문가
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockExperts.map(expert => (
                    <div key={expert.id} className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {expert.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground">{expert.name}</p>
                        <p className="text-xs text-muted-foreground">{expert.title}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        답변 {expert.answerCount}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Popular Tags */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    인기 태그
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map(tag => (
                      <Badge 
                        key={tag} 
                        variant="outline" 
                        className="cursor-pointer hover:bg-secondary"
                        onClick={() => setSearchQuery(tag)}
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Community Stats */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    커뮤니티 현황
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-foreground">12,345</p>
                      <p className="text-xs text-muted-foreground">회원 수</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">5,678</p>
                      <p className="text-xs text-muted-foreground">게시글</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">23,456</p>
                      <p className="text-xs text-muted-foreground">댓글</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">89</p>
                      <p className="text-xs text-muted-foreground">전문가</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function PostCard({ 
  post, 
  onLike, 
  onBookmark 
}: { 
  post: Post
  onLike: () => void
  onBookmark: () => void 
}) {
  const categoryLabels: Record<string, string> = {
    free: "자유게시판",
    tips: "육아 꿀팁",
    qna: "Q&A",
    review: "상담 후기",
    expert: "전문가 칼럼"
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 md:p-5">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 hidden md:flex">
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {post.author.name[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                {categoryLabels[post.category]}
              </Badge>
              {post.author.badge && (
                <Badge 
                  variant={post.author.badge === "전문가" ? "default" : "outline"} 
                  className="text-xs"
                >
                  {post.author.badge}
                </Badge>
              )}
            </div>
            
            <Link href={`/community/${post.id}`}>
              <h3 className="font-semibold text-foreground mt-2 hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h3>
            </Link>
            
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {post.content}
            </p>
            
            <div className="flex flex-wrap gap-1 mt-2">
              {post.tags.map(tag => (
                <span key={tag} className="text-xs text-primary">
                  #{tag}
                </span>
              ))}
            </div>
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Avatar className="h-5 w-5 md:hidden">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {post.author.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  {post.author.name}
                </span>
                <span>{post.createdAt}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  className={`flex items-center gap-1 text-sm transition-colors ${
                    post.isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                  }`}
                  onClick={onLike}
                >
                  <Heart className={`h-4 w-4 ${post.isLiked ? "fill-current" : ""}`} />
                  {post.likes}
                </button>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MessageCircle className="h-4 w-4" />
                  {post.comments}
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  {post.views}
                </span>
                <button 
                  className={`transition-colors ${
                    post.isBookmarked ? "text-primary" : "text-muted-foreground hover:text-primary"
                  }`}
                  onClick={onBookmark}
                >
                  <Bookmark className={`h-4 w-4 ${post.isBookmarked ? "fill-current" : ""}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
