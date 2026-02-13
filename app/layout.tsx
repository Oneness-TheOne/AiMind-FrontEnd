import React from "react"
import type { Metadata } from 'next'
import { Noto_Sans_KR } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ChatbotModal } from '@/components/chatbot/chatbot-modal'
import './globals.css'

const notoSansKr = Noto_Sans_KR({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-noto-sans-kr"
});

export const metadata: Metadata = {
  title: '아이마음 - 아동 그림 심리 분석 서비스',
  description: 'AI 기반 아동 그림 심리 분석으로 우리 아이의 마음을 이해하세요. 발달 단계 평가, 또래 비교, 맞춤 솔루션을 제공합니다.',
  generator: 'v0.app',
  icons: {
    icon: '/aimind.ico',
    apple: '/aimind.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className={`${notoSansKr.variable} font-sans antialiased`}>
        {children}
        <ChatbotModal />
        <Analytics />
      </body>
    </html>
  )
}
