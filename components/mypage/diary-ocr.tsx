"use client"

import React from "react"
import { useState, useCallback, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  X,
  Loader2,
  Copy,
  Check,
  BookOpen,
  Sparkles,
  Download,
  RefreshCw,
  ImageIcon,
  Calendar
} from "lucide-react"

interface DiaryEntry {
  id: string
  imageUrl: string
  extractedText: string
  date: string
  childName: string
}

export function DiaryOCR() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [extractedText, setExtractedText] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const [savedEntries, setSavedEntries] = useState<DiaryEntry[]>([
    {
      id: "1",
      imageUrl: "/placeholder.svg",
      extractedText: "2024년 1월 15일 월요일\n오늘은 할머니 댁에 갔다.\n할머니가 맛있는 떡볶이를 해주셨다.\n너무 맛있었다!",
      date: "2024.01.15",
      childName: "김지우"
    },
    {
      id: "2",
      imageUrl: "/placeholder.svg",
      extractedText: "2024년 1월 10일 수요일\n유치원에서 친구랑 놀았다.\n미끄럼틀을 많이 탔다.\n재미있었다.",
      date: "2024.01.10",
      childName: "김지우"
    }
  ])

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      processFile(file)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const processFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string)
      setExtractedText("")
    }
    reader.readAsDataURL(file)
  }

  const handleExtractText = async () => {
    if (!uploadedImage) return

    setIsProcessing(true)
    try {
      const response = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: uploadedImage })
      })

      const data = await response.json()
      
      if (data.error) {
        setExtractedText("텍스트 추출에 실패했습니다. 다시 시도해주세요.")
      } else {
        setExtractedText(data.text)
      }
    } catch (error) {
      setExtractedText("텍스트 추출 중 오류가 발생했습니다.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCopyText = async () => {
    await navigator.clipboard.writeText(extractedText)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleSaveEntry = () => {
    if (!uploadedImage || !extractedText) return

    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      imageUrl: uploadedImage,
      extractedText,
      date: new Date().toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).replace(/\. /g, ".").replace(".", ""),
      childName: "김지우"
    }

    setSavedEntries([newEntry, ...savedEntries])
    setUploadedImage(null)
    setExtractedText("")
  }

  const handleReset = () => {
    setUploadedImage(null)
    setExtractedText("")
  }

  return (
    <div ref={sectionRef} className="space-y-8">
      {/* Header */}
      <div 
        className={`transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <h2 className="text-lg font-bold text-slate-800">그림일기 텍스트 추출</h2>
        <p className="text-sm text-slate-500 mt-1">
          아이의 그림일기 사진을 업로드하면 AI가 손글씨를 텍스트로 변환해드립니다
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`transition-all duration-700 delay-100 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {!uploadedImage ? (
          <div
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${
              isDragging
                ? "border-teal-500 bg-teal-50"
                : "border-slate-200 hover:border-teal-300 bg-slate-50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-teal-100 flex items-center justify-center">
                <Upload className="h-7 w-7 text-teal-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 mb-1">
                  그림일기 이미지를 드래그하세요
                </p>
                <p className="text-sm text-slate-500">
                  또는 클릭하여 파일을 선택하세요
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="diary-upload"
              />
              <label htmlFor="diary-upload">
                <Button className="cursor-pointer" asChild>
                  <span>파일 선택</span>
                </Button>
              </label>
              <p className="text-xs text-slate-400">
                지원 형식: JPG, PNG, HEIC (최대 10MB)
              </p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Image Preview */}
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={uploadedImage || "/placeholder.svg"}
                  alt="그림일기"
                  className="w-full rounded-2xl border border-slate-200"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-3 right-3 h-8 w-8 rounded-full"
                  onClick={handleReset}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Button
                className="w-full gap-2 h-11"
                onClick={handleExtractText}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    텍스트 추출 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    텍스트 추출하기
                  </>
                )}
              </Button>
            </div>

            {/* Extracted Text */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-800">추출된 텍스트</span>
                {extractedText && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyText}
                    className="gap-1.5 text-teal-600 hover:text-teal-700"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-4 w-4" />
                        복사됨
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        복사
                      </>
                    )}
                  </Button>
                )}
              </div>
              <Textarea
                placeholder="이미지를 업로드하고 '텍스트 추출하기' 버튼을 클릭하세요"
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                className="min-h-[200px] resize-none bg-slate-50 border-slate-200 rounded-xl"
              />
              {extractedText && (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 bg-transparent"
                    onClick={handleExtractText}
                    disabled={isProcessing}
                  >
                    <RefreshCw className="h-4 w-4" />
                    다시 추출
                  </Button>
                  <Button
                    className="flex-1 gap-2"
                    onClick={handleSaveEntry}
                  >
                    <Download className="h-4 w-4" />
                    저장하기
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Saved Entries */}
      <div
        className={`transition-all duration-700 delay-200 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-800">저장된 그림일기</h2>
          <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100">{savedEntries.length}개</Badge>
        </div>

        {savedEntries.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p className="font-medium text-slate-600">저장된 그림일기가 없습니다</p>
            <p className="text-sm text-slate-400 mt-1">그림일기를 업로드하고 텍스트를 추출해보세요</p>
          </div>
        ) : (
          <div className="space-y-3">
            {savedEntries.map((entry, index) => (
              <div
                key={entry.id}
                className={`flex gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all duration-500 cursor-pointer ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: `${300 + index * 100}ms` }}
              >
                <div className="w-20 h-20 rounded-xl bg-slate-200 flex-shrink-0 overflow-hidden">
                  <img
                    src={entry.imageUrl || "/placeholder.svg"}
                    alt="그림일기"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-slate-800">{entry.childName}</span>
                    <span className="text-sm text-slate-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {entry.date}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2 whitespace-pre-line">
                    {entry.extractedText}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigator.clipboard.writeText(entry.extractedText)}
                  className="self-center h-9 w-9 text-slate-400 hover:text-teal-600"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
