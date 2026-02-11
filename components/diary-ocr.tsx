"use client"

import React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  ImageIcon
} from "lucide-react"

interface DiaryEntry {
  id: string
  imageUrl: string
  extractedText: string
  date: string
  childName: string
}

interface DiaryOcrResult {
  original: string
  date: string
  weather: string
  title: string
  corrected: string
}

export function DiaryOCR() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState<string>("")
  const [ocrResult, setOcrResult] = useState<DiaryOcrResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const ocrBaseUrl =
    process.env.NEXT_PUBLIC_AIMODELS_BASE_URL ?? "http://localhost:8080"
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
      setUploadedFile(file)
      setExtractedText("")
      setOcrResult(null)
      setErrorMessage("")
    }
    reader.readAsDataURL(file)
  }

  const handleExtractText = async () => {
    if (!uploadedFile) return

    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append("file", uploadedFile)

      const response = await fetch(`${ocrBaseUrl}/diary-ocr`, {
        method: "POST",
        body: formData
      })

      const data = await response.json()
      if (!response.ok) {
        const detail = typeof data?.detail === "string" ? data.detail : null
        throw new Error(detail ?? "텍스트 추출에 실패했습니다.")
      }
      const raw = Array.isArray(data) ? data[0] : data
      const normalized: DiaryOcrResult = {
        original: raw?.["원본"] ?? "",
        date: raw?.["날짜"] ?? "",
        weather: raw?.["날씨"] ?? "",
        title: raw?.["제목"] ?? "",
        corrected: raw?.["교정된_내용"] ?? "",
      }
      setOcrResult(normalized)
      setExtractedText(normalized.corrected || normalized.original)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "텍스트 추출 중 오류가 발생했습니다."
      setErrorMessage(message)
      setExtractedText(message)
      setOcrResult(null)
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
      extractedText: extractedText,
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
    setUploadedFile(null)
    setExtractedText("")
    setOcrResult(null)
    setErrorMessage("")
  }

  const jsonPreview = ocrResult
    ? JSON.stringify(
        [
          {
            원본: ocrResult.original,
            날짜: ocrResult.date,
            날씨: ocrResult.weather,
            제목: ocrResult.title,
            교정된_내용: ocrResult.corrected,
          },
        ],
        null,
        2
      )
    : ""

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            그림일기 텍스트 추출
          </CardTitle>
          <CardDescription>
            아이의 그림일기 사진을 업로드하면 AI가 손글씨를 텍스트로 변환해드립니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!uploadedImage ? (
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-slate-200 hover:border-primary/50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">
                    그림일기 이미지를 드래그하세요
                  </p>
                  <p className="text-sm text-muted-foreground">
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
                  <Button variant="outline" className="cursor-pointer bg-transparent" asChild>
                    <span>파일 선택</span>
                  </Button>
                </label>
                <p className="text-xs text-muted-foreground">
                  지원 형식: JPG, PNG, HEIC (최대 10MB)
                </p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {/* Image Preview */}
              <div className="space-y-3">
                <div className="relative">
                  <img
                    src={uploadedImage || "/placeholder.svg"}
                    alt="그림일기"
                    className="w-full rounded-xl border border-slate-200"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleReset}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  className="w-full gap-2"
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
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">추출된 텍스트</span>
                  {extractedText && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyText}
                        className="gap-1"
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-3 w-3" />
                            복사됨
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            복사
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
                {ocrResult && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                    <div className="grid grid-cols-2 gap-2">
                      <div>날짜: {ocrResult.date || "-"}</div>
                      <div>날씨: {ocrResult.weather || "-"}</div>
                      <div>제목: {ocrResult.title || "-"}</div>
                    </div>
                  </div>
                )}
                {jsonPreview && (
                  <Textarea
                    readOnly
                    value={jsonPreview}
                    className="min-h-[200px] resize-none border-slate-200 bg-white font-mono text-xs"
                  />
                )}
                <Textarea
                  placeholder="이미지를 업로드하고 '텍스트 추출하기' 버튼을 클릭하세요"
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)}
                  className="min-h-[160px] resize-none border-slate-200"
                />
                {ocrResult?.original && (
                  <Textarea
                    readOnly
                    value={ocrResult.original}
                    className="min-h-[120px] resize-none border-slate-200 bg-slate-50"
                  />
                )}
                {errorMessage && (
                  <p className="text-xs text-rose-500">{errorMessage}</p>
                )}
                {extractedText && (
                  <div className="flex gap-2">
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
        </CardContent>
      </Card>

      {/* Saved Entries */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              저장된 그림일기
            </span>
            <Badge variant="secondary">{savedEntries.length}개</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {savedEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>저장된 그림일기가 없습니다</p>
              <p className="text-sm">그림일기를 업로드하고 텍스트를 추출해보세요</p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-20 h-20 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden">
                    <img
                      src={entry.imageUrl || "/placeholder.svg"}
                      alt="그림일기"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">
                        {entry.childName}
                      </span>
                      <span className="text-xs text-muted-foreground">{entry.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-line">
                      {entry.extractedText}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(entry.extractedText)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
