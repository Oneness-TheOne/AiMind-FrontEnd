import Link from "next/link"

export function Footer() {
  return (
    <footer className="no-print bg-slate-50 border-t border-slate-100">
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary overflow-hidden shrink-0">
                <img src="/aimind.png" alt="아이마음" className="h-5 w-5 object-contain" />
              </div>
              <span className="text-lg font-bold text-foreground">아이마음</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI 기반 아동 그림 심리 분석으로<br />
              우리 아이의 마음을 이해합니다.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">서비스</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/analysis" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                그림 분석
              </Link>
              <Link href="/solutions" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                맞춤 솔루션
              </Link>
              <Link href="/counseling" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                주변 상담소
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">커뮤니티</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/community" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                맘스퀘어
              </Link>
              <Link href="/community/expert" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                전문가 칼럼
              </Link>
              <Link href="/community/qna" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Q&A
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">고객지원</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                서비스 소개
              </Link>
              <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                자주 묻는 질문
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                문의하기
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            2026 아이마음. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              개인정보처리방침
            </Link>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              이용약관
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
