"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  Upload,
  Brain,
  BarChart3,
  Lightbulb,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Upload,
    color: "bg-blue-500",
    title: "그림 업로드 또는 직접 그리기",
    time: "1분 이내 소요",
    description:
      "아이의 그림을 촬영하여 업로드하거나, 앱에서 직접 그릴 수 있습니다. 집 그림, 나무 그림, 가족 그림 등 다양한 유형의 그림을 분석할 수 있습니다.",
    highlight: "다양한 유형의 그림을 분석",
  },
  {
    step: "02",
    icon: Brain,
    color: "bg-teal-500",
    title: "AI 심층 분석 진행",
    time: "약 30초 소요",
    description:
      "전문 아동심리 데이터를 학습한 AI가 그림의 색상, 구도, 표현 방식 등을 종합적으로 분석합니다. 발달심리학 기반의 정확한 분석 결과를 제공합니다.",
    highlight: "발달심리학 기반의 정확한 분석",
  },
  {
    step: "03",
    icon: BarChart3,
    color: "bg-amber-500",
    title: "맞춤형 분석 결과 확인",
    time: "",
    description:
      "감정 상태, 대인관계, 자아인식 등 다양한 영역의 분석 결과를 확인하세요. 또래 아이들과의 발달 비교 데이터도 함께 제공됩니다.",
    highlight: "또래 아이들과의 발달 비교",
  },
  {
    step: "04",
    icon: Lightbulb,
    color: "bg-violet-500",
    title: "맞춤 솔루션 및 활동 추천",
    time: "",
    description:
      "분석 결과에 따른 추천 도서, 놀이 활동, 대화법 등을 안내해 드립니다. 필요시 주변 전문 상담센터 연결도 가능합니다.",
    highlight: "주변 전문 상담센터 연결",
  },
];

export function CTASection() {
  const [openIndex, setOpenIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.15 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const toggleStep = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  const renderDescription = (description: string, highlight: string) => {
    if (!highlight) return description;
    const parts = description.split(highlight);
    return (
      <>
        {parts[0]}
        <span className="text-primary font-semibold">{highlight}</span>
        {parts[1]}
      </>
    );
  };

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-24 bg-slate-50 overflow-hidden"
    >
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div
          className={`text-center mb-12 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
            <Brain className="h-3.5 w-3.5" />
            분석 프로세스
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 text-balance">
            마음그림 맞춤 분석 프로세스
          </h2>
          <p className="text-slate-500 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
            아이의 마음을 더 쉽게 이해할 수 있도록,
            <br className="hidden md:block" />
            마음그림 전문 분석 서비스가 책임집니다
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-3xl mx-auto">
          <div className="space-y-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isOpen = openIndex === index;

              return (
                <div
                  key={index}
                  className={`bg-white rounded-2xl border transition-all duration-500 ${
                    isOpen
                      ? "border-primary/20 shadow-lg shadow-primary/5"
                      : "border-slate-100 shadow-sm"
                  } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                  style={{ transitionDelay: `${200 + index * 100}ms` }}
                >
                  {/* Step Header */}
                  <button
                    onClick={() => toggleStep(index)}
                    className="w-full px-5 md:px-6 py-4 md:py-5 flex items-center gap-4 text-left group"
                  >
                    {/* Step Number + Icon */}
                    <div
                      className={`w-10 h-10 rounded-xl ${step.color} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105`}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-primary text-xs font-bold">
                          STEP {step.step}
                        </span>
                        {step.time && (
                          <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                            {step.time}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-800 text-sm md:text-base truncate">
                        {step.title}
                      </h3>
                    </div>

                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                        isOpen ? "bg-primary/10 rotate-180" : "bg-slate-50"
                      }`}
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-colors ${isOpen ? "text-primary" : "text-slate-400"}`}
                      />
                    </div>
                  </button>

                  {/* Step Content */}
                  <div
                    className={`overflow-hidden transition-all duration-500 ${
                      isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-5 md:px-6 pb-5 pl-[4.5rem]">
                      <p className="text-sm text-slate-500 leading-relaxed">
                        {renderDescription(step.description, step.highlight)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom connector */}
          <div
            className={`flex justify-center mt-8 transition-all duration-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "700ms" }}
          >
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <div className="h-px w-12 bg-slate-200" />
              <span>간단한 4단계로 완료</span>
              <div className="h-px w-12 bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
