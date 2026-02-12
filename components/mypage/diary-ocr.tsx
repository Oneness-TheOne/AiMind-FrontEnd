"use client"

import React from "react"
import { useState, useCallback, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Upload,
  X,
  Loader2,
  Copy,
  Check,
  BookOpen,
  Sparkles,
  Save,
  RefreshCw,
  Calendar,
  Pencil,
  ImageIcon,
  Cloud,
  CloudRain,
  CloudSnow,
  Wind,
  Sun
} from "lucide-react"
import { Pagination } from "@/components/ui/pagination-simple"

interface DiaryEntry {
  id: string
  imageUrl: string
  extractedText: string
  date: string
  title: string
  originalText: string
  createdAt: string
  weather?: string
  childName?: string
}

export interface DiaryOCRSelectedChild {
  id: number
  name: string
  age: number
  gender: string
}

export interface DiaryOCRChildInfo {
  name: string
  age: string
  gender: string
}

interface DiaryOcrResult {
  original: string
  date: string
  weather: string
  title: string
  corrected: string
  /** 추출에 사용한 그림(그림_저장경로에 해당) - 카드 사진란에 표시 */
  imageDataUrl?: string
}

const ENTRIES_PER_PAGE = 3

const WEATHER_OPTIONS = [
  { value: "맑음", label: "맑음", icon: Sun, color: "text-amber-500", bg: "bg-amber-50" },
  { value: "흐림", label: "흐림", icon: Cloud, color: "text-slate-500", bg: "bg-slate-100" },
  { value: "비", label: "비", icon: CloudRain, color: "text-blue-500", bg: "bg-blue-50" },
  { value: "눈", label: "눈", icon: CloudSnow, color: "text-sky-400", bg: "bg-sky-50" },
  { value: "바람", label: "바람", icon: Wind, color: "text-teal-500", bg: "bg-teal-50" },
] as const

export function DiaryOCR({
  selectedChild = null,
  childInfo = { name: "", age: "", gender: "" },
  hasChildInfo = false,
  effectiveChildName = "",
}: {
  selectedChild?: DiaryOCRSelectedChild | null
  childInfo?: DiaryOCRChildInfo
  hasChildInfo?: boolean
  effectiveChildName?: string
}) {
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
  const [userId, setUserId] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"
  const sectionRef = useRef<HTMLDivElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const [savedEntries, setSavedEntries] = useState<DiaryEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

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
      } catch {
        // ignore profile fetch errors for now
      }
    }
    fetchProfile()
  }, [apiBaseUrl, userId])

  useEffect(() => {
    const token =
      localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
    if (!token || !userId) return

    const loadEntries = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/diary-ocr`, {
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
          originalText: d?.original_text ?? "",
          createdAt: d?.created_at ?? "",
          weather: d?.weather ?? "",
          childName: d?.child_name ?? "",
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
    setErrorMessage("")
    try {
      const formData = new FormData()
      formData.append("file", uploadedFile)

      const response = await fetch(`${apiBaseUrl}/diary-ocr/extract`, {
        method: "POST",
        body: formData
      })

      const data = await response.json()
      if (!response.ok) {
        const detail = typeof data?.detail === "string" ? data.detail : null
        throw new Error(detail ?? "텍스트 추출에 실패했습니다.")
      }
      const raw = Array.isArray(data) ? data[0] : data
      const payload = raw ?? data
      const imageFromApi =
        payload?.["image_data_url"] ??
        (payload as Record<string, unknown>)?.["imageDataUrl"] ??
        data?.["image_data_url"] ??
        (data as Record<string, unknown>)?.["imageDataUrl"]
      const normalized: DiaryOcrResult = {
        original: payload?.["원본"] ?? "",
        date: payload?.["날짜"] ?? "",
        weather: payload?.["날씨"] ?? "",
        title: payload?.["제목"] ?? "",
        corrected: payload?.["교정된_내용"] ?? payload?.["내용"] ?? "",
        imageDataUrl: typeof imageFromApi === "string" ? imageFromApi : undefined,
      }
      setOcrResult(normalized)
      setExtractedText(normalized.corrected || normalized.original)
      setErrorMessage("")
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 300)
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

  const dataUrlToFile = (dataUrl: string, filename: string): File => {
    const [header, base64] = dataUrl.split(",")
    const mimeMatch = header?.match(/data:(.*?);base64/)
    const mime = mimeMatch ? mimeMatch[1] : "image/jpeg"
    const binary = atob(base64 || "")
    const array = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) array[i] = binary.charCodeAt(i)
    return new File([array], filename, { type: mime })
  }

  const handleSaveEntry = async () => {
    if (!ocrResult) {
      alert("텍스트를 추출한 뒤 저장해 주세요.")
      return
    }
    if (!hasChildInfo) {
      alert("아이를 선택하거나 이름·나이·성별을 입력해주세요.")
      return
    }
    const token =
      localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
    if (!token) {
      alert("로그인이 필요합니다.")
      return
    }
    const fileToSend =
      ocrResult.imageDataUrl
        ? dataUrlToFile(ocrResult.imageDataUrl, "diary-cropped.jpg")
        : uploadedFile
    if (!fileToSend) {
      alert("저장할 이미지가 없습니다. 텍스트 추출을 먼저 해 주세요.")
      return
    }
    setIsSaving(true)
    setErrorMessage("")
    try {
      const formData = new FormData()
      formData.append("file", fileToSend)
      formData.append("date", ocrResult.date || "")
      formData.append("title", ocrResult.title || "")
      formData.append("original_text", ocrResult.original || "")
      formData.append("corrected_text", extractedText || ocrResult.corrected || "")
      formData.append("weather", ocrResult.weather || "맑음")
      if (selectedChild) {
        formData.append("child_id", String(selectedChild.id))
        formData.append("child_name", effectiveChildName || selectedChild.name)
      } else {
        formData.append("child_name", childInfo.name.trim())
      }

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
        originalText: data?.original_text ?? "",
        createdAt: data?.created_at ?? "",
        weather: data?.weather ?? ocrResult?.weather ?? "맑음",
        childName: effectiveChildName || data?.child_name || selectedChild?.name || "",
      }

      setSavedEntries((prev) => [entry, ...prev])
      setOcrResult({
        original: entry.originalText,
        date: entry.date,
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

  const handleWeatherChange = (value: string | undefined) => {
    if (ocrResult) {
      setOcrResult({ ...ocrResult, weather: value ?? "" })
    }
  }

  const getWeatherIcon = (weather: string) => {
    const found = WEATHER_OPTIONS.find((w) => w.value === weather)
    if (!found) return { icon: Sun, color: "text-amber-500", bg: "bg-amber-50" }
    return { icon: found.icon, color: found.color, bg: found.bg }
  }

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      const days = ["일", "월", "화", "수", "목", "금", "토"]
      return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${days[d.getDay()]}요일`
    } catch {
      return dateStr
    }
  }

  return (
    <div ref={sectionRef} className="space-y-8">
      {/* Header */}
      <div 
        className={`transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div>
            <h2 className="text-lg font-bold text-slate-800">그림일기 텍스트 추출</h2>
            <p className="text-sm text-slate-500 mt-1">
              아이의 그림일기 사진을 업로드하면 AI가 손글씨를 텍스트로 변환해드립니다
            </p>
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
          <div className="space-y-6">
            {/* Uploaded image + extract button (diary-style layout) */}
            <div className="relative bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4 items-start">
                <div className="relative w-full md:w-64 shrink-0">
                  <img
                    src={uploadedImage || "/placeholder.svg"}
                    alt="그림일기"
                    className="w-full rounded-xl border border-slate-100 object-contain max-h-[300px]"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 rounded-full"
                    onClick={handleReset}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex-1 flex flex-col justify-center items-center md:items-start gap-3 py-4">
                  <div className="h-12 w-12 rounded-full bg-teal-50 flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-teal-500" />
                  </div>
                  <p className="text-sm text-slate-600 text-center md:text-left">
                    이미지가 준비되었습니다.<br />
                    아래 버튼을 눌러 텍스트를 추출하세요.
                  </p>
                  <Button
                    className="gap-2 h-11 px-6"
                    onClick={handleExtractText}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        AI가 읽는 중...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        텍스트 추출하기
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Loading Animation */}
            {isProcessing && (
              <div className="flex flex-col items-center gap-4 py-10 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-4 border-teal-100 border-t-teal-500 animate-spin" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-700">AI가 그림일기를 읽고 있어요</p>
                  <p className="text-sm text-slate-400 mt-1">잠시만 기다려주세요...</p>
                </div>
              </div>
            )}

            {/* Extracted Result - Diary Style Card */}
            {ocrResult && !isProcessing && (
              <div
                ref={resultRef}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
              >
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  {/* 사진란 - 추출된 이미지를 맨 위에 */}
                  <div className="bg-slate-50 border-b border-slate-200 px-4 py-4">
                    <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1">
                      <ImageIcon className="h-3.5 w-3.5" />
                      사진
                    </p>
                    <div className="flex justify-center">
                      <img
                        src={ocrResult.imageDataUrl || uploadedImage || "/placeholder.svg"}
                        alt="그림일기 사진"
                        className="w-full max-w-xl max-h-[320px] rounded-xl border-2 border-slate-200 object-contain bg-white shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Diary Header */}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 px-5 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-amber-600" />
                        <span className="font-bold text-amber-800 text-sm">그림일기</span>
                      </div>
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">
                        AI 추출 완료
                      </Badge>
                    </div>
                  </div>

                  <div className="p-5 space-y-5">
                    {/* Date + Weather Row */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          날짜
                        </label>
                        <Input
                          type="date"
                          value={ocrResult.date}
                          onChange={(e) => setOcrResult({ ...ocrResult, date: e.target.value })}
                          className="h-10 bg-slate-50 border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                          <Sun className="h-3 w-3" />
                          날씨
                        </label>
                        <div className="flex gap-1.5">
                          {WEATHER_OPTIONS.map((w) => {
                            const isActive = ocrResult.weather === w.value
                            return (
                              <button
                                key={w.value}
                                type="button"
                                onClick={() => handleWeatherChange(w.value)}
                                className={`flex-1 flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg border text-xs transition-all ${
                                  isActive
                                    ? `${w.bg} border-current ${w.color} font-semibold shadow-sm`
                                    : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"
                                }`}
                              >
                                <w.icon className={`h-4 w-4 ${isActive ? w.color : ""}`} />
                                <span>{w.label}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                        <Pencil className="h-3 w-3" />
                        제목
                      </label>
                      <Input
                        value={ocrResult.title}
                        onChange={(e) => setOcrResult({ ...ocrResult, title: e.target.value })}
                        className="h-11 bg-slate-50 border-slate-200 rounded-lg text-base font-semibold"
                        placeholder="제목을 입력하세요"
                      />
                    </div>

                    {/* Content */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        내용
                      </label>
                      <Textarea
                        value={extractedText}
                        onChange={(e) => {
                          setExtractedText(e.target.value)
                          setOcrResult((prev) => prev ? { ...prev, corrected: e.target.value } : null)
                        }}
                        className="min-h-[150px] resize-none bg-slate-50 border-slate-200 rounded-lg text-sm leading-relaxed"
                        placeholder="내용을 입력하세요"
                        style={{
                          backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, #e2e8f0 27px, #e2e8f0 28px)",
                          lineHeight: "28px",
                          paddingTop: "4px",
                        }}
                      />
                    </div>

                    {errorMessage && (
                      <p className="text-xs text-rose-500">{errorMessage}</p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="outline"
                        className="gap-2 flex-1"
                        onClick={handleExtractText}
                        disabled={isProcessing}
                      >
                        <RefreshCw className="h-4 w-4" />
                        다시 추출
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-teal-600 hover:text-teal-700"
                        onClick={handleCopyText}
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
                      <Button
                        className="gap-2 flex-1"
                        onClick={async () => {
                          await handleSaveEntry()
                          setIsSaved(true)
                          setTimeout(() => setIsSaved(false), 2000)
                        }}
                        disabled={!hasChildInfo || isSaving || isProcessing}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            저장 중...
                          </>
                        ) : isSaved ? (
                          <>
                            <Check className="h-5 w-5" />
                            저장되었습니다!
                          </>
                        ) : (
                          <>
                            <Save className="h-5 w-5" />
                            그림일기 저장하기
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
            {paginatedEntries.map((entry, index) => {
              const { icon: WeatherIcon, color: weatherColor, bg: weatherBg } = getWeatherIcon(entry.weather ?? "맑음")
              return (
                <div
                  key={entry.id}
                  className={`bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-500 cursor-pointer ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                  style={{ transitionDelay: `${300 + index * 100}ms` }}
                  onClick={() => {
                    setSelectedEntry(entry)
                    setIsDetailOpen(true)
                  }}
                >
                  <div className="flex gap-4 p-4">
                    <div className="w-20 h-20 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200">
                      <img
                        src={entry.imageUrl || "/placeholder.svg"}
                        alt="그림일기"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-sm text-slate-800 truncate">
                          {entry.title || "그림일기"}
                        </h3>
                        <div
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${weatherBg} ${weatherColor}`}
                        >
                          <WeatherIcon className="h-3 w-3" />
                          {entry.weather || "맑음"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {entry.date ? formatDate(entry.date) : "-"}
                        </span>
                        {entry.childName && (
                          <>
                            <span className="text-xs text-slate-300">|</span>
                            <span className="text-xs text-slate-500">{entry.childName}</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
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
                      className="self-center h-9 w-9 text-slate-400 hover:text-teal-600 shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
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
        <DialogContent className="min-w-[900px] w-[95vw] max-w-[1600px] max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">그림일기 상세보기</DialogTitle>
          {/* 모바일: 세로 배치 / 태블릿·데스크탑: 왼쪽 사진, 오른쪽 글 */}
          <div className="grid grid-cols-1 md:grid-cols-[1.15fr_0.85fr] gap-6">
            {/* 왼쪽(데스크탑·태블릿) 또는 위(모바일): 사진 */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 order-1 md:order-1 flex flex-col min-h-0">
              <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1 shrink-0">
                <ImageIcon className="h-3.5 w-3.5" />
                사진
              </p>
              <div className="flex-1 flex justify-center items-center min-h-[280px] md:min-h-[60vh] bg-white rounded-lg border border-slate-200 overflow-hidden">
                <img
                  src={selectedEntry?.imageUrl || "/placeholder.svg"}
                  alt="그림일기"
                  className="w-full max-w-full max-h-[55vh] md:max-h-[75vh] object-contain"
                />
              </div>
            </div>

            {/* 오른쪽(데스크탑·태블릿) 또는 아래(모바일): 글 */}
            <div className="space-y-5 order-2 md:order-2 md:overflow-y-auto">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100 px-5 py-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-amber-600" />
                  <span className="font-bold text-amber-800">그림일기</span>
                  {selectedEntry?.childName && (
                    <span className="text-sm text-amber-700">· {selectedEntry.childName}</span>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    날짜
                  </label>
                  <p className="text-sm font-medium text-slate-800 py-2">
                    {selectedEntry?.date ? formatDate(selectedEntry.date) : "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                    <Sun className="h-3 w-3" />
                    날씨
                  </label>
                  <p className="py-2">
                    {selectedEntry?.weather ? (
                      (() => {
                        const { icon: WIcon, color, bg } = getWeatherIcon(selectedEntry.weather)
                        return (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm ${bg} ${color}`}>
                            <WIcon className="h-4 w-4" />
                            {selectedEntry.weather}
                          </span>
                        )
                      })()
                    ) : (
                      <span className="text-sm text-slate-500">-</span>
                    )}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                  <Pencil className="h-3 w-3" />
                  제목
                </label>
                <p className="text-base font-semibold text-slate-800 py-1">
                  {selectedEntry?.title || "-"}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  내용
                </label>
                <div
                  className="min-h-[120px] rounded-lg border border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed"
                >
                  {selectedEntry?.extractedText || "-"}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
