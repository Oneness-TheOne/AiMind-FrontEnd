import Link from "next/link"
import { notFound } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Award, Bookmark, Eye, Heart, MessageCircle, ChevronRight } from "lucide-react"

interface Post {
  id: string
  title: string
  content: string
  author: {
    name: string
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

const mockExperts = [
  { id: "1", name: "김미영", title: "아동심리상담사", answerCount: 234, color: "bg-teal-500" },
  { id: "2", name: "이수진", title: "미술치료사", answerCount: 189, color: "bg-cyan-500" },
  { id: "3", name: "박정훈", title: "놀이치료사", answerCount: 156, color: "bg-emerald-500" }
]

const categoryLabels: Record<string, string> = {
  free: "자유게시판",
  tips: "육아 꿀팁",
  qna: "Q&A",
  review: "상담 후기",
  expert: "전문가 칼럼"
}

export default async function CommunityPostPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const post = mockPosts.find(item => item.id === id)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            <div className="lg:col-span-3">
              <div className="mb-6">
                <nav className="text-xs text-slate-400">
                  <span>홈</span>
                  <span className="mx-2">/</span>
                  <span>맘스퀘어</span>
                  <span className="mx-2">/</span>
                  <span>{categoryLabels[post.category]}</span>
                </nav>
                <div className="flex items-center justify-between mt-2">
                  <h2 className="text-lg font-semibold text-slate-800">게시글 상세</h2>
                  <span className="text-xs text-slate-400">{post.createdAt}</span>
                </div>
                <div className="h-px bg-slate-100 mt-4" />
              </div>

              <Link
                href="/community"
                className="inline-flex items-center text-sm text-slate-500 hover:text-primary mb-4"
              >
                ← 목록으로
              </Link>

              <article className="py-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-primary font-medium">
                    {categoryLabels[post.category]}
                  </span>
                  {post.author.badge && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      post.author.badge === "전문가" 
                        ? "bg-primary/10 text-primary" 
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {post.author.badge}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl font-semibold text-slate-900 leading-snug mb-4">
                  {post.title}
                </h1>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className={`text-white text-xs ${
                        post.author.badge === "전문가" ? "bg-primary" : "bg-slate-400"
                      }`}>
                        {post.author.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span>{post.author.name}</span>
                  </div>
                  <span>·</span>
                  <span>{post.createdAt}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {post.views}
                  </span>
                </div>

                <div className="min-h-[360px] py-8">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line text-base">
                    {post.content}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pb-6 border-b border-slate-100">
                  <span className={`flex items-center gap-1 ${post.isLiked ? "text-red-500" : ""}`}>
                    <Heart className={`h-3.5 w-3.5 ${post.isLiked ? "fill-current" : ""}`} />
                    {post.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {post.comments}
                  </span>
                  <span className={`flex items-center gap-1 ${post.isBookmarked ? "text-primary" : ""}`}>
                    <Bookmark className={`h-3.5 w-3.5 ${post.isBookmarked ? "fill-current" : ""}`} />
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 pt-6">
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs text-slate-600 bg-slate-100 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </article>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  활동 중인 전문가
                </h3>
                <div className="space-y-3">
                  {mockExperts.map(expert => (
                    <div 
                      key={expert.id} 
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={`${expert.color} text-white text-sm`}>
                          {expert.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-800">{expert.name}</p>
                        <p className="text-xs text-slate-500">{expert.title}</p>
                      </div>
                      <span className="text-xs text-slate-400">
                        답변 {expert.answerCount}
                      </span>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-3 text-sm text-primary hover:underline flex items-center justify-center gap-1">
                  전문가 더보기 <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
