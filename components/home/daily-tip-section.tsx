"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Check,
  Lock,
  Calendar,
  Smartphone,
  ArrowRight,
  Shield,
  Zap,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Shield,
    color: "bg-blue-500",
    title: "프라이버시 보장",
    items: [
      { text: "분석 기록이 남지 않아요", highlight: false },
      { text: "가명으로 분석", highlight: true, suffix: "할 수 있어요" },
    ],
  },
  {
    icon: Zap,
    color: "bg-amber-500",
    title: "간편한 그림 분석",
    items: [
      { text: "사진 한 장으로", highlight: true, suffix: " 바로 분석!" },
      { text: "분석 결과, 솔루션까지 한번에!", highlight: false },
    ],
  },
];

export function DailyTipSection() {
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

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white overflow-hidden"
    >
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div
          className={`text-center mb-12 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-slate-500 text-sm mb-2">
            센터에 직접 연락하기 어렵다면,
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 text-balance">
            앱으로 간편하게 그림 분석
          </h2>
          <Link href="/analysis">
            <Button
              size="lg"
              className="rounded-full px-8 gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
            >
              그림 분석하기
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto">
          <div
            className={`bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-12"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <div className="grid md:grid-cols-2 gap-0">
              {/* Left - Phone Visual */}
              <div className="bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 p-8 md:p-12 flex items-center justify-center min-h-[360px] relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/5 rounded-full" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full" />

                <div className="relative flex items-end gap-3">
                  {/* Phone 1 (background) */}
                  <div className="w-36 md:w-40 -mr-6 opacity-60">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-1.5 shadow-2xl border border-white/20">
                      <div className="bg-white rounded-xl overflow-hidden">
                        <div className="p-3 space-y-2">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-5 h-5 rounded-full bg-teal-100" />
                            <div className="h-2 w-14 bg-slate-100 rounded" />
                          </div>
                          <div className="h-14 bg-slate-50 rounded-lg" />
                          <div className="h-14 bg-slate-50 rounded-lg" />
                          <div className="h-8 bg-slate-50 rounded-lg" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Phone 2 (foreground) */}
                  <div className="w-44 md:w-52 relative z-10">
                    <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-1.5 shadow-2xl border border-white/30">
                      <div className="bg-gradient-to-b from-white to-teal-50 rounded-2xl p-5 min-h-[260px] flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mb-4 shadow-lg shadow-teal-500/30">
                          <Smartphone className="w-8 h-8 text-white" />
                        </div>
                        <span className="text-slate-800 font-bold text-base mb-1">
                          마음그림
                        </span>
                        <span className="text-slate-400 text-xs">
                          AI 그림 심리 분석
                        </span>
                        <div className="mt-4 w-full space-y-2">
                          <div className="h-2 bg-teal-100 rounded-full w-full" />
                          <div className="h-2 bg-teal-100 rounded-full w-3/4" />
                          <div className="h-2 bg-teal-100 rounded-full w-1/2" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right - Features */}
              <div className="p-6 md:p-10 flex flex-col justify-center">
                <div className="space-y-4">
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <div
                        key={index}
                        className={`rounded-xl border border-slate-100 overflow-hidden transition-all duration-700 hover:border-primary/20 hover:shadow-md ${
                          isVisible
                            ? "opacity-100 translate-x-0"
                            : "opacity-0 translate-x-8"
                        }`}
                        style={{ transitionDelay: `${400 + index * 150}ms` }}
                      >
                        {/* Feature Header */}
                        <div className="flex items-center gap-3 px-5 py-3 bg-slate-50">
                          <div
                            className={`w-8 h-8 rounded-lg ${feature.color} flex items-center justify-center`}
                          >
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-bold text-slate-800 text-sm">
                            {feature.title}
                          </span>
                        </div>
                        {/* Feature Content */}
                        <div className="px-5 py-4 bg-white">
                          <div className="space-y-2.5">
                            {feature.items.map((item, itemIndex) => (
                              <div
                                key={itemIndex}
                                className="flex items-start gap-2.5"
                              >
                                <div className="w-5 h-5 rounded-full bg-teal-50 flex items-center justify-center shrink-0 mt-0.5">
                                  <Check
                                    className="w-3 h-3 text-primary"
                                    strokeWidth={3}
                                  />
                                </div>
                                <span className="text-sm text-slate-600 leading-relaxed">
                                  {item.highlight ? (
                                    <>
                                      <span className="text-primary font-semibold">
                                        {item.text}
                                      </span>
                                      {item.suffix}
                                    </>
                                  ) : (
                                    item.text
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
