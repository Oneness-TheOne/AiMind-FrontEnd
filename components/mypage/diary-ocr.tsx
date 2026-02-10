"use client"

import React from "react"
import { useState, useCallback, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
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
import { Pagination } from "@/components/ui/pagination-simple"

interface DiaryEntry {
  id: string
  imageUrl: string
  extractedText: string
  date: string
  title: string
  region: string
  originalText: string
  createdAt: string
}

interface DiaryOcrResult {
  original: string
  date: string
  region: string
  weather: string
  title: string
  corrected: string
}

const ENTRIES_PER_PAGE = 3

export function DiaryOCR() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState<string>("")
  const [ocrResult, setOcrResult] = useState<DiaryOcrResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [region, setRegion] = useState("")
  const [userId, setUserId] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"
  const ocrBaseUrl =
    process.env.NEXT_PUBLIC_AIMODELS_BASE_URL ?? "http://localhost:8080"
  const sectionRef = useRef<HTMLDivElement>(null)
  const [savedEntries, setSavedEntries] = useState<DiaryEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

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
        if (typeof data.id === "number" && !userId) {
          setUserId(data.id)
        }
        if (data.region && !region) {
          setRegion(data.region)
        }
      } catch {
        // ignore profile fetch errors for now
      }
    }
    fetchProfile()
  }, [apiBaseUrl, region, userId])

  useEffect(() => {
    const token =
      localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
    if (!token || !userId) return

    const loadEntries = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/diary-ocr?user_id=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const data = await res.json()
        if (!Array.isArray(data)) return
        const normalized: DiaryEntry[] = data.map((d: any) => ({
          id: d?.id ?? "",
          imageUrl: d?.image_url ?? "",
          extractedText: d?.corrected_text ?? d?.original_text ?? "",
          date: d?.date ?? "",
          title: d?.title ?? "",
          region: d?.region ?? "",
          originalText: d?.original_text ?? "",
          createdAt: d?.created_at ?? "",
        }))
        setSavedEntries(normalized)
      } catch {
        // ignore
      }
    }
    loadEntries()
  }, [apiBaseUrl, userId])

  const totalPages = Math.ceil(savedEntries.length / ENTRIES_PER_PAGE)
  const paginatedEntries = savedEntries.slice(
    (currentPage - 1) * ENTRIES_PER_PAGE,
    currentPage * ENTRIES_PER_PAGE
  )

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
      formData.append("area", region || "도봉구")

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
        region: raw?.["지역"] ?? "",
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

  const handleSaveEntry = async () => {
    if (!uploadedFile) return
    const token =
      localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
    if (!token) {
      alert("로그인이 필요합니다.")
      return
    }
    if (!region) {
      alert("위치를 선택해주세요.")
      return
    }

    setIsSaving(true)
    setErrorMessage("")
    try {
      const formData = new FormData()
      formData.append("file", uploadedFile)
      formData.append("area", region)

      const res = await fetch(`${apiBaseUrl}/diary-ocr`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        const message =
          typeof data?.detail?.message === "string"
            ? data.detail.message
            : typeof data?.detail === "string"
              ? data.detail
              : "저장에 실패했습니다."
        throw new Error(message)
      }

      const entry: DiaryEntry = {
        id: data?.id ?? "",
        imageUrl: data?.image_url ?? "",
        extractedText: data?.corrected_text ?? data?.original_text ?? "",
        date: data?.date ?? "",
        title: data?.title ?? "",
        region: data?.region ?? region,
        originalText: data?.original_text ?? "",
        createdAt: data?.created_at ?? "",
      }

      setSavedEntries((prev) => [entry, ...prev])
      setOcrResult({
        original: entry.originalText,
        date: entry.date,
        region: entry.region,
        weather: "",
        title: entry.title,
        corrected: entry.extractedText,
      })
      setExtractedText(entry.extractedText || entry.originalText)
      setUploadedImage(null)
      setUploadedFile(null)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "저장 중 오류가 발생했습니다."
      setErrorMessage(message)
    } finally {
      setIsSaving(false)
    }
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
            지역: ocrResult.region,
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

      {/* Location */}
      <div
        className={`transition-all duration-700 delay-75 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="space-y-2 max-w-sm">
          <label htmlFor="region" className="text-sm font-medium text-slate-700">
            위치
          </label>
          <select
            id="region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
          >
            <option value="" disabled>
              위치를 선택하세요
            </option>
            {[
              "서울특별시",
              "부산광역시",
              "대구광역시",
              "인천광역시",
              "광주광역시",
              "대전광역시",
              "울산광역시",
              "경기도",
              "강원도",
              "충청북도",
              "충청남도",
              "전라북도",
              "전라남도",
              "경상북도",
              "경상남도",
              "제주특별자치도",
            ].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
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
              {ocrResult && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                  <div className="grid grid-cols-2 gap-2">
                    <div>날짜: {ocrResult.date || "-"}</div>
                    <div>지역: {ocrResult.region || "-"}</div>
                    <div>날씨: {ocrResult.weather || "-"}</div>
                    <div>제목: {ocrResult.title || "-"}</div>
                  </div>
                </div>
              )}
              {jsonPreview && (
                <Textarea
                  readOnly
                  value={jsonPreview}
                  className="min-h-[200px] resize-none bg-white border-slate-200 rounded-xl font-mono text-xs"
                />
              )}
              <Textarea
                placeholder="이미지를 업로드하고 '텍스트 추출하기' 버튼을 클릭하세요"
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                className="min-h-[200px] resize-none bg-slate-50 border-slate-200 rounded-xl"
              />
              {ocrResult?.original && (
                <Textarea
                  readOnly
                  value={ocrResult.original}
                  className="min-h-[120px] resize-none bg-white border-slate-200 rounded-xl"
                />
              )}
              {errorMessage && (
                <p className="text-xs text-rose-500">{errorMessage}</p>
              )}
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
                    disabled={isSaving || isProcessing}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        저장 중...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        저장하기
                      </>
                    )}
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
            {paginatedEntries.map((entry, index) => (
              <div
                key={entry.id}
                className={`flex gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all duration-500 cursor-pointer ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: `${300 + index * 100}ms` }}
                onClick={() => {
                  setSelectedEntry(entry)
                  setIsDetailOpen(true)
                }}
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
                    <span className="font-semibold text-slate-800">
                      {entry.title || "그림일기"}
                    </span>
                    <span className="text-sm text-slate-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {entry.date || "-"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2 whitespace-pre-line">
                    {entry.extractedText}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigator.clipboard.writeText(entry.extractedText)
                  }}
                  className="self-center h-9 w-9 text-slate-400 hover:text-teal-600"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        )}
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedEntry?.title || "그림일기"}</DialogTitle>
            <DialogDescription className="flex flex-wrap gap-x-3 gap-y-1">
              <span>날짜: {selectedEntry?.date || "-"}</span>
              <span>지역: {selectedEntry?.region || "-"}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
              <img
                src={selectedEntry?.imageUrl || "/placeholder.svg"}
                alt="그림일기"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-3">
              <div className="text-sm font-medium text-slate-700">교정된 내용</div>
              <Textarea
                readOnly
                value={selectedEntry?.extractedText || ""}
                className="min-h-[220px] resize-none bg-white border-slate-200 rounded-xl"
              />
              {selectedEntry?.originalText ? (
                <>
                  <div className="text-sm font-medium text-slate-700">원본 텍스트</div>
                  <Textarea
                    readOnly
                    value={selectedEntry.originalText}
                    className="min-h-[140px] resize-none bg-slate-50 border-slate-200 rounded-xl"
                  />
                </>
              ) : null}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
