"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Award, Star, Users, Clock } from "lucide-react";

const stats = [
  {
    label: "브랜드 대상",
    value: "1위",
    icon: Award,
    color: "from-amber-400 to-amber-500",
    bgColor: "bg-amber-50",
  },
  {
    label: "분석 만족도",
    value: "4.9/5",
    icon: Star,
    color: "from-primary to-teal-500",
    bgColor: "bg-teal-50",
  },
  {
    label: "누적 분석 수",
    value: "10만+",
    icon: Users,
    color: "from-blue-400 to-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    label: "온라인 운영",
    value: "24시간",
    icon: Clock,
    color: "from-violet-400 to-violet-500",
    bgColor: "bg-violet-50",
  },
];

const benefits = [
  "아이의 숨겨진 감정을 이해하게 됩니다.",
  "발달 상태를 객관적으로 파악하게 됩니다.",
  "아이와의 소통 방법을 알게 됩니다.",
];

export function HowItWorksSection() {
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
      className="py-20 md:py-28 bg-white overflow-hidden"
    >
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div
          className={`text-center max-w-2xl mx-auto mb-14 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex items-center gap-2 bg-teal-50 text-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
            <Award className="h-3.5 w-3.5" />
            검증된 서비스
          </div>
          <p className="text-slate-500 mb-2 text-sm">
            수많은 부모님들이 선택한 이유,
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-balance">
            그만큼 효과가 있었기 때문입니다
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="max-w-4xl mx-auto mb-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className={`relative group rounded-2xl p-6 text-center transition-all duration-700 ${stat.bgColor} hover:shadow-lg hover:-translate-y-1 ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${200 + index * 100}ms` }}
                >
                  <div
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} mb-3`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Arrow Connector */}
        <div
          className={`flex justify-center mb-10 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: "600ms" }}
        >
          <div className="flex flex-col items-center gap-1">
            <div className="w-px h-8 bg-gradient-to-b from-transparent to-primary/30" />
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <ChevronDown className="h-4 w-4 text-primary" />
            </div>
          </div>
        </div>

        {/* Benefits List */}
        <div className="max-w-xl mx-auto space-y-3">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className={`flex items-center gap-4 bg-slate-50 rounded-2xl py-4 px-6 transition-all duration-700 hover:bg-teal-50 hover:shadow-sm ${
                isVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-8"
              }`}
              style={{ transitionDelay: `${700 + index * 100}ms` }}
            >
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Check className="h-4 w-4 text-white" strokeWidth={3} />
              </div>
              <span className="text-slate-700 font-medium text-sm md:text-base">
                {benefit}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
