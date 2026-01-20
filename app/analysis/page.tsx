"use client"

import React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { VideoHero } from "@/components/video-hero"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, ImageIcon, Pencil, Info, ArrowRight, X } from "lucide-react"
import { DrawingCanvas } from "@/components/drawing-canvas"

export default function AnalysisPage() {
  const router = useRouter()
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [inputMode, setInputMode] = useState<"upload" | "draw">("upload")
  const [childInfo, setChildInfo] = useState({
    name: "",
    age: "",
    gender: "",
    drawingType: "",
  })
  const [isDragging, setIsDragging] = useState(false)

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
      const reader = new FileReader()
      reader.onload = () => {
        setUploadedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setUploadedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleAnalyze = () => {
    // Store data and navigate to analyzing page
    router.push("/analysis/analyzing")
  }

  const drawingTypes = [
    { value: "house-tree-person", label: "집-나무-사람 (HTP)" },
    { value: "family", label: "가족화" },
    { value: "kinetic-family", label: "동적 가족화 (KFD)" },
    { value: "free", label: "자유화" },
    { value: "person", label: "인물화" },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      {/* Video Hero */}
      <div className="-mt-14">
        <VideoHero
          subtitle="AI 기반 심리 분석"
          title="그림으로 읽는 아이의 마음"
          description="아이의 그림을 업로드하고 정보를 입력하면 AI가 심리 분석을 진행합니다."
          height="small"
        />
      </div>

      <main className="flex-1 bg-slate-50">
        <div className="container mx-auto px-4 py-12">

          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col gap-8">
              {/* Upload/Draw Section */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    그림 입력
                  </CardTitle>
                  <CardDescription>
                    그림을 업로드하거나 직접 그려주세요
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as "upload" | "draw")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="upload" className="gap-2">
                        <Upload className="h-4 w-4" />
                        업로드
                      </TabsTrigger>
                      <TabsTrigger value="draw" className="gap-2">
                        <Pencil className="h-4 w-4" />
                        직접 그리기
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="upload" className="mt-0">
                      {!uploadedImage ? (
                        <div
                          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                            isDragging
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
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
                                이미지를 여기에 드래그하세요
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
                              id="file-upload"
                            />
                            <label htmlFor="file-upload">
                              <Button variant="outline" className="bg-transparent cursor-pointer" asChild>
                                <span>파일 선택</span>
                              </Button>
                            </label>
                            <p className="text-xs text-muted-foreground">
                              지원 형식: JPG, PNG, HEIC (최대 10MB)
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="relative max-w-2xl mx-auto">
                          <img
                            src={uploadedImage || "/placeholder.svg"}
                            alt="업로드된 그림"
                            className="w-full rounded-xl border"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => setUploadedImage(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="draw" className="mt-0">
                      <DrawingCanvas
                        onSave={(imageData) => {
                          setUploadedImage(imageData)
                          setInputMode("upload")
                        }}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Info Section */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    아이 정보 입력
                  </CardTitle>
                  <CardDescription>
                    정확한 분석을 위해 아이의 정보를 입력해주세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">아이 이름 (별명)</Label>
                      <Input
                        id="name"
                        placeholder="예: 민준이"
                        value={childInfo.name}
                        onChange={(e) => setChildInfo({ ...childInfo, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="drawingType">그림 유형</Label>
                      <Select
                        value={childInfo.drawingType}
                        onValueChange={(value) => setChildInfo({ ...childInfo, drawingType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="그림 유형 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {drawingTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="age">나이</Label>
                      <Select
                        value={childInfo.age}
                        onValueChange={(value) => setChildInfo({ ...childInfo, age: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="나이 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 13 }, (_, i) => i + 3).map((age) => (
                            <SelectItem key={age} value={age.toString()}>
                              {age}세
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">성별</Label>
                      <Select
                        value={childInfo.gender}
                        onValueChange={(value) => setChildInfo({ ...childInfo, gender: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="성별 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">남아</SelectItem>
                          <SelectItem value="female">여아</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      className="w-full gap-2"
                      size="lg"
                      onClick={handleAnalyze}
                      disabled={!uploadedImage || !childInfo.age || !childInfo.drawingType}
                    >
                      분석 시작하기
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Guide Section */}
            <Card className="mt-8 border-border/50 bg-primary/5">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4">그림 분석 가이드</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-semibold text-primary">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">선명한 이미지</p>
                      <p className="text-xs text-muted-foreground">
                        그림이 잘 보이도록 밝은 곳에서 촬영해주세요
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-semibold text-primary">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">전체 그림 포함</p>
                      <p className="text-xs text-muted-foreground">
                        그림 전체가 프레임 안에 들어오도록 해주세요
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-semibold text-primary">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">정확한 정보</p>
                      <p className="text-xs text-muted-foreground">
                        아이의 나이와 그림 유형을 정확히 선택해주세요
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
