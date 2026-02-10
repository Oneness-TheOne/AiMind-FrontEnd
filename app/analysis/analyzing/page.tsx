"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Brain, Users, FileText, Lightbulb } from "lucide-react"

const aimodelsBaseUrl = process.env.NEXT_PUBLIC_AIMODELS_BASE_URL ?? "http://localhost:8080"
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"

const analysisSteps = [
  { id: 1, label: "구성요소 분석 중...", icon: Sparkles, tip: "아이들은 그림을 통해 언어로 표현하기 어려운 감정을 나타내요." },
  { id: 2, label: "발달 단계 평가 중...", icon: Brain, tip: "그림의 크기와 위치는 아이의 자신감과 관련이 있을 수 있어요." },
  { id: 3, label: "또래 비교 중...", icon: Users, tip: "색상 선택은 아이의 현재 감정 상태를 반영할 수 있어요." },
  { id: 4, label: "종합 분석 중...", icon: FileText, tip: "그림에서 사람의 크기는 그 사람에 대한 감정적 중요도를 나타내기도 해요." },
]

const tips = [
  "아이들은 그림을 통해 언어로 표현하기 어려운 감정을 나타내요.",
  "그림의 크기와 위치는 아이의 자신감과 관련이 있을 수 있어요.",
  "색상 선택은 아이의 현재 감정 상태를 반영할 수 있어요.",
  "그림에서 사람의 크기는 그 사람에 대한 감정적 중요도를 나타내기도 해요.",
  "집 그림에서 문과 창문은 외부 세계와의 소통 의지를 나타낼 수 있어요.",
  "나무 그림은 아이의 자아상과 성장 욕구를 반영할 수 있어요.",
  "그림을 그리는 순서도 중요한 분석 요소가 될 수 있어요.",
  "같은 주제의 그림도 시간이 지나면서 변화하는 것이 자연스러워요.",
]

export default function AnalyzingPage() {
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [currentTip, setCurrentTip] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const dataUrlToFile = (dataUrl: string, filename: string) => {
    const [header, data] = dataUrl.split(",")
    const mimeMatch = header?.match(/data:(.*?);base64/)
    const mime = mimeMatch ? mimeMatch[1] : "image/png"
    const binary = atob(data)
    const array = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) {
      array[i] = binary.charCodeAt(i)
    }
    return new File([array], filename, { type: mime })
  }

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length)
    }, 3000)

    return () => clearInterval(tipInterval)
  }, [])

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          return prev
        }
        return prev + 1
      })
    }, 60)

    return () => clearInterval(progressInterval)
  }, [router])

  useEffect(() => {
    const globalStore = globalThis as typeof globalThis & {
      __analysisPayload?: any
      __analysisFiles?: (File | null)[]
    }
    const payload = globalStore.__analysisPayload
    const files = globalStore.__analysisFiles || []
    if (!payload) {
      router.push("/analysis")
      return
    }
    const images: string[] = payload.images || []
    const slots: { label: string; objectKey: string }[] = payload.slots || []
    const childInfo = payload.childInfo || {}

    if (images.length !== 4 || slots.length !== 4 || images.some((img) => !img)) {
      setError("분석에 필요한 이미지가 부족합니다.")
      return
    }

    const formData = new FormData()
    images.forEach((dataUrl, index) => {
      const slot = slots[index]
      const sourceFile = files[index]
      const file = sourceFile || dataUrlToFile(dataUrl, `${slot.label}.png`)
      formData.append(slot.objectKey, file)
    })
    formData.append("child_name", childInfo.name || "")
    formData.append("child_age", childInfo.age || "")
    formData.append("child_gender", childInfo.gender || "")

    fetch(`${aimodelsBaseUrl}/analyze`, {
      method: "POST",
      body: formData,
    })
      .then(async (response) => {
        if (!response.ok) {
          const detail = await response.text()
          throw new Error(detail || "분석 요청 실패")
        }
        return response.json()
      })
      .then(async (data) => {
        const globalStore = globalThis as typeof globalThis & {
          __analysisResponse?: any
          __analysisImages?: string[]
          __analysisBoxImages?: Record<string, string | null>
        }

        globalStore.__analysisResponse = data
        globalStore.__analysisImages = images
        globalStore.__analysisBoxImages = {
          tree: data?.results?.tree?.box_image_base64 || null,
          house: data?.results?.house?.box_image_base64 || null,
          man: data?.results?.man?.box_image_base64 || null,
          woman: data?.results?.woman?.box_image_base64 || null,
        }

        const storageData = JSON.parse(JSON.stringify(data))
        if (storageData?.results) {
          Object.keys(storageData.results).forEach((key: string) => {
            if (storageData.results[key]) {
              storageData.results[key].box_image_base64 = null
            }
          })
        }
        sessionStorage.setItem("analysisResponse", JSON.stringify(storageData))
        setProgress(100)

        // MongoDB + S3 저장: 로그인 유저면 BackEnd /drawing-analyses 호출
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
            : null
        if (token) {
          try {
            const meRes = await fetch(`${apiBaseUrl}/auth/me`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
            })
            if (meRes.ok) {
              const meData = await meRes.json()
              const userId = meData.id
              if (userId != null) {
                const results = data?.results || {}
                // image_json에는 features(ratio, center_x, center_y 등)가 포함되어 DB 저장 후 T-Score 재계산에 사용됨
                const rawImg = (o: unknown) => (o && typeof o === "object" ? o : {})
                const elementAnalysis = {
                  tree: JSON.parse(JSON.stringify(rawImg(results.tree?.image_json))),
                  house: JSON.parse(JSON.stringify(rawImg(results.house?.image_json))),
                  man: JSON.parse(JSON.stringify(rawImg(results.man?.image_json))),
                  woman: JSON.parse(JSON.stringify(rawImg(results.woman?.image_json))),
                }
                const boxImagesBase64: Record<string, string | null> = {
                  tree: results.tree?.box_image_base64 ?? null,
                  house: results.house?.box_image_base64 ?? null,
                  man: results.man?.box_image_base64 ?? null,
                  woman: results.woman?.box_image_base64 ?? null,
                }
                const psychologicalInterpretation: Record<string, { interpretation?: unknown; analysis?: unknown }> = {}
                ;(["tree", "house", "man", "woman"] as const).forEach((k) => {
                  psychologicalInterpretation[k] = {
                    interpretation: results[k]?.interpretation,
                    analysis: results[k]?.analysis,
                  }
                })
                const saveRes = await fetch(`${apiBaseUrl}/drawing-analyses`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    user_id: userId,
                    child_info: data?.child || {},
                    element_analysis: elementAnalysis,
                    box_images_base64: boxImagesBase64,
                    psychological_interpretation: psychologicalInterpretation,
                    comparison: data?.comparison || {},
                  }),
                })
                if (!saveRes.ok) {
                  const errText = await saveRes.text()
                  console.error("[분석 저장 실패]", saveRes.status, errText)
                }
              }
            }
          } catch (e) {
            console.error("[분석 저장 중 예외]", e)
            // 저장 실패해도 결과 화면은 그대로 이동
          }
        }

        setTimeout(() => {
          router.push("/analysis/result")
        }, 500)
      })
      .catch((err: Error) => {
        setError(err.message || "분석 요청 중 오류가 발생했습니다.")
      })
  }, [router])

  useEffect(() => {
    if (progress < 25) setCurrentStep(0)
    else if (progress < 50) setCurrentStep(1)
    else if (progress < 75) setCurrentStep(2)
    else setCurrentStep(3)
  }, [progress])

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="border-border/50 shadow-xl">
          <CardContent className="p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary mb-4">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-8 w-8 text-primary-foreground"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
                  <path d="M9 9h.01" />
                  <path d="M15 9h.01" />
                  <path d="M8 13c1.5 2 3 3 4 3s2.5-1 4-3" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                그림을 분석하고 있어요
              </h1>
              <p className="text-muted-foreground">
                AI가 아이의 그림을 세심하게 분석 중입니다
              </p>
            </div>

            {/* Progress */}
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">분석 진행률</span>
                <span className="font-semibold text-primary">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            {error && (
              <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Steps */}
            <div className="space-y-3 mb-8">
              {analysisSteps.map((step, index) => {
                const Icon = step.icon
                const isActive = index === currentStep
                const isComplete = index < currentStep

                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                      isActive
                        ? "bg-primary/10 border border-primary/20"
                        : isComplete
                          ? "bg-muted/50"
                          : "opacity-50"
                    }`}
                  >
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : isComplete
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isComplete ? (
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        isActive ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </span>
                    {isActive && (
                      <div className="ml-auto">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Tip */}
            <div className="bg-accent/10 rounded-xl p-4 border border-accent/20">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                  <Lightbulb className="h-4 w-4 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-xs font-medium text-accent-foreground mb-1">
                    알고 계셨나요?
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed transition-opacity">
                    {tips[currentTip]}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
