"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { VideoHero } from "@/components/shared/video-hero";
import { DiaryOCR } from "@/components/mypage/diary-ocr";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, Sparkles, Clock, Shield, Info } from "lucide-react";

export type ChildOption = {
  id: number;
  name: string;
  age: number;
  gender: string;
};
const DIRECT_INPUT_VALUE = "__direct__";

const features = [
  {
    icon: Sparkles,
    title: "AI 손글씨 인식",
    description: "최신 AI 기술로 아이의 손글씨를 정확하게 인식합니다",
  },
  {
    icon: BookOpen,
    title: "그림일기 보관",
    description: "추출한 텍스트와 이미지를 함께 저장하고 관리할 수 있습니다",
  },
  {
    icon: Clock,
    title: "빠른 변환",
    description: "몇 초 만에 손글씨를 디지털 텍스트로 변환합니다",
  },
  {
    icon: Shield,
    title: "안전한 보관",
    description: "아이의 소중한 그림일기를 안전하게 보관합니다",
  },
];

export default function DiaryOCRPage() {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
  const [children, setChildren] = useState<ChildOption[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [childrenLoading, setChildrenLoading] = useState(false);
  const [childInfo, setChildInfo] = useState({ name: "", age: "", gender: "" });

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("auth_token") ||
          sessionStorage.getItem("auth_token")
        : null;
    if (!token) return;
    setChildrenLoading(true);
    fetch(`${apiBaseUrl}/children`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((list: ChildOption[]) => {
        if (Array.isArray(list)) setChildren(list);
      })
      .catch(() => setChildren([]))
      .finally(() => setChildrenLoading(false));
  }, [apiBaseUrl]);

  const handleSelectChild = (childId: string) => {
    const isDirect = childId === DIRECT_INPUT_VALUE || !childId;
    setSelectedChildId(isDirect ? "" : childId);
    if (isDirect) {
      setChildInfo({ name: "", age: "", gender: "" });
      return;
    }
    const child = children.find((c) => c.id === parseInt(childId, 10));
    if (child) {
      setChildInfo({
        name: child.name,
        age: child.age.toString(),
        gender: child.gender,
      });
    }
  };

  const selectedChild =
    selectedChildId && selectedChildId !== DIRECT_INPUT_VALUE
      ? (children.find((c) => c.id === parseInt(selectedChildId, 10)) ?? null)
      : null;
  const effectiveChildName = selectedChild
    ? selectedChild.name
    : childInfo.name;
  const hasChildInfo = !!(
    selectedChild ||
    (childInfo.name.trim() && childInfo.age && childInfo.gender)
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      {/* Video Hero */}
      <div className="-mt-14">
        <VideoHero
          subtitle="AI 손글씨 인식"
          title="그림일기 OCR"
          description="아이가 정성껏 쓴 그림일기의 손글씨를 AI가 텍스트로 변환해드립니다. 소중한 추억을 디지털로 보관하세요."
          height="small"
        />
      </div>

      <main className="flex-1">
        {/* Features Section */}
        <div className="bg-white border-b border-slate-100">
          <div className="container mx-auto px-4 lg:px-8 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  className="border-slate-100 bg-slate-50/50"
                >
                  <CardContent className="p-4 text-center">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium text-sm text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* 아이 정보 입력 (그림 분석 페이지와 동일) */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  아이 정보 입력
                </CardTitle>
                <CardDescription>
                  등록한 아이를 선택하거나 직접 입력해주세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>아이를 선택하세요</Label>
                  <Select
                    value={selectedChildId || DIRECT_INPUT_VALUE}
                    onValueChange={handleSelectChild}
                    disabled={childrenLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          childrenLoading
                            ? "불러오는 중..."
                            : "아이를 선택하세요 (또는 직접 입력)"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={DIRECT_INPUT_VALUE}>
                        직접 입력
                      </SelectItem>
                      {children.map((child) => (
                        <SelectItem key={child.id} value={String(child.id)}>
                          {child.name} ({child.age}세,{" "}
                          {child.gender === "male" ? "남아" : "여아"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="diary-child-name">아이 이름</Label>
                    <Input
                      id="diary-child-name"
                      placeholder="예: 홍길동"
                      value={childInfo.name}
                      onChange={(e) => {
                        setSelectedChildId("");
                        setChildInfo((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }));
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="diary-child-age">나이</Label>
                    <Select
                      value={childInfo.age}
                      onValueChange={(value) => {
                        setSelectedChildId("");
                        setChildInfo((prev) => ({ ...prev, age: value }));
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="나이 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 7 }, (_, i) => i + 7).map(
                          (age) => (
                            <SelectItem key={age} value={age.toString()}>
                              {age}세
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="diary-child-gender">성별</Label>
                    <Select
                      value={childInfo.gender}
                      onValueChange={(value) => {
                        setSelectedChildId("");
                        setChildInfo((prev) => ({ ...prev, gender: value }));
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="성별 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">남아</SelectItem>
                        <SelectItem value="female">여아</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <DiaryOCR
              selectedChild={selectedChild}
              childInfo={childInfo}
              hasChildInfo={hasChildInfo}
              effectiveChildName={effectiveChildName}
            />
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-white border-t border-slate-100">
          <div className="container mx-auto px-4 lg:px-8 py-10">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-lg font-semibold text-foreground text-center mb-6">
                더 정확한 인식을 위한 팁
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex gap-3 p-4 rounded-xl bg-slate-50">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">
                      밝은 곳에서 촬영하세요
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      자연광 아래에서 촬영하면 더 정확합니다
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 p-4 rounded-xl bg-slate-50">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">
                      그림자를 피해주세요
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      손이나 폰 그림자가 글씨를 가리지 않도록 해주세요
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 p-4 rounded-xl bg-slate-50">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">
                      수평을 맞춰주세요
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      일기장과 카메라가 수평이 되도록 촬영해주세요
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 p-4 rounded-xl bg-slate-50">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">4</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">
                      선명하게 찍어주세요
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      흔들리지 않게 찍으면 인식률이 높아집니다
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
