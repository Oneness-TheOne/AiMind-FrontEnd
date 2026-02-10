"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  Phone,
  Clock,
  Star,
  Navigation,
  Filter,
  List,
  Map as MapIcon,
  ChevronRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type KakaoLatLng = object;
type KakaoLatLngBounds = { extend: (latlng: KakaoLatLng) => void };
type KakaoZoomControl = object;
type KakaoMarker = { setMap: (map: KakaoMap | null) => void };
type KakaoMarkerClusterer = {
  addMarkers: (markers: KakaoMarker[]) => void;
  removeMarkers?: (markers: KakaoMarker[]) => void;
  clear: () => void;
  redraw: () => void;
};
type KakaoInfoWindow = {
  close: () => void;
  setContent: (content: HTMLElement) => void;
  open: (map: KakaoMap, marker: KakaoMarker) => void;
};
type KakaoMap = {
  panTo: (latlng: KakaoLatLng) => void;
  setBounds: (bounds: KakaoLatLngBounds) => void;
  addControl: (control: KakaoZoomControl, position: unknown) => void;
  relayout?: () => void;
};
type KakaoGeocoderResult = { x: string; y: string };
type KakaoGeocoderStatus = string;
type KakaoGeocoder = {
  addressSearch: (
    address: string,
    callback: (
      result: KakaoGeocoderResult[],
      status: KakaoGeocoderStatus,
    ) => void,
  ) => void;
};
type KakaoNamespace = {
  maps: {
    load: (callback: () => void) => void;
    Map: new (
      container: HTMLElement,
      options: { center: KakaoLatLng; level: number },
    ) => KakaoMap;
    LatLng: new (lat: number, lng: number) => KakaoLatLng;
    Marker: new (options: {
      position: KakaoLatLng;
      map?: KakaoMap | null;
      title?: string;
    }) => KakaoMarker;
    MarkerClusterer?: new (options: {
      map: KakaoMap;
      averageCenter?: boolean;
      minLevel?: number;
    }) => KakaoMarkerClusterer;
    ZoomControl: new () => KakaoZoomControl;
    ControlPosition: { RIGHT: unknown };
    InfoWindow: new (options: { zIndex: number }) => KakaoInfoWindow;
    LatLngBounds: new () => KakaoLatLngBounds;
    event: {
      addListener: (
        target: KakaoMarker,
        type: string,
        handler: () => void,
      ) => void;
    };
    services?: {
      Geocoder: new () => KakaoGeocoder;
      Status: { OK: string };
    };
  };
};

declare global {
  interface Window {
    kakao?: KakaoNamespace;
  }
}

interface Center {
  id: string;
  name: string;
  address: string;
  phone: string;
  homepageUrl?: string;
  raw?: unknown;
  expertIntro?: string;
  reservationUrl?: string;
  reservationText?: string;
  hours: string;
  rating: number;
  reviewCount: number;
  distance: string;
  specialties: string[];
  lat?: number;
  lng?: number;
  metaLines?: string[];
  intro?: string;
  programs?: string;
  applyMethod?: string;
  extras?: Array<{ label: string; value: string }>;
  isOpen: boolean;
}

type AnyRecord = Record<string, unknown>;

function toText(value: unknown): string | undefined {
  if (typeof value === "string") {
    const s = value.trim();
    return s ? s : undefined;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : undefined;
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (Array.isArray(value)) {
    const parts = value
      .map((v) => toText(v))
      .filter((v): v is string => Boolean(v));
    if (parts.length === 0) return undefined;
    return parts.join(", ");
  }
  return undefined;
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 1))}…`;
}

function buildExtras(
  row: AnyRecord,
): Array<{ label: string; value: string }> | undefined {
  const coordKeyRe =
    /위도|경도|lat|lng|lon|longitude|latitude|wgs84|refine_wgs84|logt/i;
  const longTextKeyRe =
    /시설\s*소개|주요[_\s]*프로그램|이용[_\s]*신청[_\s]*방법/i;
  const urlKeyRe = /홈페이지|home\s?page|website|url/i;
  const alreadyShownKeyRe =
    /시설명칭?|센터명칭?|기관명칭?|기관명|제공기관명|상호명|사업장명|name|roadAddress|address|도로명주소|지번주소|소재지도로명주소|소재지지번주소|소재지|^주소$|전화번호|전화|연락처|기관연락번호|tel|phone|운영시간|영업시간|이용시간|hours|평점|후기평점|별점|rating|리뷰|review|거리|distance|전문분야|상담분야|치료분야|specialties|전문가\s*소개|예약\s*링크|예약링크|예약\s*url|reservation|booking|place_id|place\s*id/i;

  const extras: Array<{ label: string; value: string }> = [];
  const seen = new Set<string>();
  const sources = collectRecordSources(row);

  for (const src of sources) {
    for (const [k, v] of Object.entries(src)) {
      if (!k || k === "__dataset") continue;
      if (coordKeyRe.test(k)) continue;
      if (longTextKeyRe.test(k)) continue;
      if (urlKeyRe.test(k)) continue;
      if (alreadyShownKeyRe.test(k)) continue;

      const text = formatKeyValueSummary(v);
      if (!text) continue;

      const value = text;
      const sig = `${k}\u0000${value}`;
      if (seen.has(sig)) continue;
      seen.add(sig);
      extras.push({ label: k, value });
    }
  }

  return extras.length > 0 ? extras : undefined;
}

function centerQualityScore(center: Center): number {
  let score = 0;
  if (center.lat != null && center.lng != null) score += 100;
  if (center.homepageUrl) score += 5;
  if (center.phone) score += 2;
  if (center.address) score += 2;
  if (center.intro) score += 2;
  if (center.programs) score += 2;
  if (center.applyMethod) score += 2;
  score += center.metaLines?.length ?? 0;
  score += Math.min(3, (center.extras?.length ?? 0) / 20);
  return score;
}

function dedupCenters(centers: Center[]): Center[] {
  const seen = new Map<string, Center>();
  for (const c of centers) {
    const key =
      `${(c.name ?? "").trim()}|${(c.address ?? "").trim()}`.toLowerCase();
    const prev = seen.get(key);
    if (!prev) {
      seen.set(key, c);
      continue;
    }

    if (centerQualityScore(c) > centerQualityScore(prev)) {
      seen.set(key, c);
    }
  }
  return Array.from(seen.values());
}

function pickString(row: AnyRecord, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

function pickNumber(row: AnyRecord, keys: string[]): number | undefined {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") {
      const n = Number.parseFloat(v);
      if (Number.isFinite(n)) return n;
    }
  }
  return undefined;
}

function pickText(row: AnyRecord, keys: string[]): string | undefined {
  for (const k of keys) {
    const text = toText(row[k]);
    if (text) return text;
  }
  return undefined;
}

function pickTextByRegex(row: AnyRecord, regex: RegExp): string | undefined {
  for (const k of Object.keys(row)) {
    if (!regex.test(k)) continue;
    const text = toText(row[k]);
    if (text) return text;
  }
  return undefined;
}

function pickStringByRegex(row: AnyRecord, regex: RegExp): string | undefined {
  for (const k of Object.keys(row)) {
    if (!regex.test(k)) continue;
    const v = row[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

function pickNumberByRegex(row: AnyRecord, regex: RegExp): number | undefined {
  for (const k of Object.keys(row)) {
    if (!regex.test(k)) continue;
    const n = pickNumber(row, [k]);
    if (n !== undefined) return n;
  }
  return undefined;
}

function asRecord(value: unknown): AnyRecord | undefined {
  if (!value || typeof value !== "object") return undefined;
  if (Array.isArray(value)) return undefined;
  return value as AnyRecord;
}

function stripCoordinatesDeep(value: unknown): unknown {
  const coordKeyRe =
    /위도|경도|lat|lng|lon|longitude|latitude|wgs84|refine_wgs84|logt/i;

  if (Array.isArray(value)) return value.map(stripCoordinatesDeep);
  const rec = asRecord(value);
  if (!rec) return value;

  const out: AnyRecord = {};
  for (const [k, v] of Object.entries(rec)) {
    if (coordKeyRe.test(k)) continue;
    out[k] = stripCoordinatesDeep(v);
  }
  return out;
}

function filterJsonDeep(
  value: unknown,
  queryLower: string,
  keysOnly: boolean,
): { filtered: unknown; matches: number } | null {
  if (!queryLower) return { filtered: value, matches: 0 };

  if (Array.isArray(value)) {
    const outArr: unknown[] = [];
    let matches = 0;
    for (const item of value) {
      const res = filterJsonDeep(item, queryLower, keysOnly);
      if (!res) continue;
      outArr.push(res.filtered);
      matches += res.matches;
    }
    if (outArr.length === 0) return null;
    return { filtered: outArr, matches };
  }

  const rec = asRecord(value);
  if (rec) {
    const out: AnyRecord = {};
    let matches = 0;
    for (const [k, v] of Object.entries(rec)) {
      const keyHit = k.toLowerCase().includes(queryLower);
      const valueText =
        keysOnly || v == null
          ? ""
          : typeof v === "string" ||
              typeof v === "number" ||
              typeof v === "boolean"
            ? String(v).toLowerCase()
            : "";
      const valueHit = !keysOnly && valueText.includes(queryLower);

      if (keyHit || valueHit) {
        out[k] = v;
        matches += 1;
        continue;
      }

      const child = filterJsonDeep(v, queryLower, keysOnly);
      if (child) {
        out[k] = child.filtered;
        matches += child.matches;
      }
    }
    if (Object.keys(out).length === 0) return null;
    return { filtered: out, matches };
  }

  if (keysOnly) return null;
  if (value == null) return null;
  const text =
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
      ? String(value).toLowerCase()
      : "";
  if (!text) return null;
  return text.includes(queryLower) ? { filtered: value, matches: 1 } : null;
}

function collectRecordSources(row: AnyRecord): AnyRecord[] {
  const sources: AnyRecord[] = [row];
  const nestedKeys = [
    // 통합 JSON에서 자주 쓰는 nested 구조들
    "기본정보",
    "기본 정보",
    "basicInfo",
    "baseInfo",
    "BASE_INFO",
    "후기_평점",
    "후기평점",
    "후기 평점",
    "예약_및_이용신청",
    "예약 및 이용신청",
    "예약정보",
    "공식홈페이지_및_상담연결",
    "공식홈페이지 및 상담연결",
    "공식홈페이지",
    "공식 홈페이지",
    "공식_홈페이지",
    "상담소_연결_페이지",
    "상담소 연결 페이지",
    "상담소연결페이지",
    "상담소_연결페이지",
    "상담소연결_페이지",
    "전문가소개",
    "전문가 소개",
  ] as const;

  for (const k of nestedKeys) {
    const rec = asRecord(row[k]);
    if (!rec) continue;
    sources.push(rec);

    // nested 안쪽의 공통 자원/지역 링크도 함께 수집
    const deepKeys = [
      "공통_자원",
      "공통 자원",
      "공통자원",
      "commonResources",
      "지역_상담기관_홈페이지",
      "지역 상담기관 홈페이지",
      "지역상담기관_홈페이지",
      "홈페이지",
      "홈페이지명",
    ] as const;
    for (const dk of deepKeys) {
      const deep = asRecord(rec[dk]);
      if (deep) sources.push(deep);
    }
  }
  return sources;
}

function pickStringFromSources(
  sources: AnyRecord[],
  keys: string[],
): string | undefined {
  for (const src of sources) {
    const v = pickString(src, keys);
    if (v) return v;
  }
  return undefined;
}

function pickNumberFromSources(
  sources: AnyRecord[],
  keys: string[],
): number | undefined {
  for (const src of sources) {
    const v = pickNumber(src, keys);
    if (v !== undefined) return v;
  }
  return undefined;
}

function pickTextFromSources(
  sources: AnyRecord[],
  keys: string[],
): string | undefined {
  for (const src of sources) {
    const v = pickText(src, keys);
    if (v) return v;
  }
  return undefined;
}

function pickTextByRegexFromSources(
  sources: AnyRecord[],
  regex: RegExp,
): string | undefined {
  for (const src of sources) {
    const v = pickTextByRegex(src, regex);
    if (v) return v;
  }
  return undefined;
}

function pickStringByRegexFromSources(
  sources: AnyRecord[],
  regex: RegExp,
): string | undefined {
  for (const src of sources) {
    const v = pickStringByRegex(src, regex);
    if (v) return v;
  }
  return undefined;
}

function pickNumberByRegexFromSources(
  sources: AnyRecord[],
  regex: RegExp,
): number | undefined {
  for (const src of sources) {
    const v = pickNumberByRegex(src, regex);
    if (v !== undefined) return v;
  }
  return undefined;
}

function formatKeyValueSummary(value: unknown): string | undefined {
  const s = toText(value);
  if (s) return s;

  const obj = asRecord(value);
  if (!obj) return undefined;

  const parts: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const t = toText(v);
    if (!t) continue;
    parts.push(`${k}: ${t}`);
  }

  return parts.length > 0 ? parts.join(" / ") : undefined;
}

function pickHoursFromSources(sources: AnyRecord[]): string | undefined {
  const keys = [
    "운영시간",
    "이용시간",
    "영업시간",
    "hours",
    "HOURS",
    "OPENING_HOURS",
  ];
  for (const src of sources) {
    for (const k of keys) {
      const t = formatKeyValueSummary(src[k]);
      if (t) return t;
    }
  }
  return undefined;
}

function uniq(values: string[]): string[] {
  return Array.from(new Set(values));
}

function splitList(value: string): string[] {
  return value
    .split(/[,/|·ㆍ•\n\r\t]+/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function inferCounselingSpecialties(text: string): string[] {
  const rules: Array<[RegExp, string]> = [
    [/미술/, "미술치료"],
    [/놀이/, "놀이치료"],
    [/언어/, "언어치료"],
    [/발달/, "발달검사"],
    [/가족/, "가족치료"],
    [/부모/, "부모상담"],
    [/ADHD|에이디에이치디/i, "ADHD"],
    [/감각/, "감각통합"],
    [/인지/, "인지치료"],
  ];

  const found: string[] = [];
  for (const [re, label] of rules) {
    if (re.test(text)) found.push(label);
  }
  return uniq(found);
}

function inferChildCenterSpecialties(text: string): string[] {
  const rules: Array<[RegExp, string]> = [
    [/방과|돌봄/, "방과후돌봄"],
    [/학습|공부/, "학습지원"],
    [/급식|식사|간식/, "급식지원"],
    [/정서|상담|심리/, "정서지원"],
    [/문화|체험/, "문화체험"],
    [/진로/, "진로체험"],
    [/발달/, "발달검사"],
    [/언어/, "언어재활"],
    [/놀이/, "놀이활동"],
  ];

  const found: string[] = [];
  for (const [re, label] of rules) {
    if (re.test(text)) found.push(label);
  }
  return uniq(found);
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function haversineKm(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const R = 6371;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const sa = Math.sin(dLat / 2);
  const sb = Math.sin(dLng / 2);
  const c = sa * sa + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * sb * sb;
  return 2 * R * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c));
}

function fnv1a32Update(hash: number, str: string): number {
  let h = hash >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rowsFromJson(json: unknown): unknown[] {
  if (Array.isArray(json)) return json;
  if (json && typeof json === "object") {
    const obj = json as AnyRecord;
    const candidates = [obj.data, obj.records, obj.items, obj.rows];
    for (const c of candidates) {
      if (Array.isArray(c)) return c as unknown[];
    }
  }
  return [];
}

function expandRowsForKind(
  json: unknown,
  kind: "counseling" | "child",
): unknown[] {
  const base = rowsFromJson(json);
  if (kind !== "counseling") return base;

  // 일부 통합 JSON은 상위 row에 "주변_..._상담소" 배열로 실제 상담소(위도/경도 포함)를 포함합니다.
  const nestedKeyRe = /주변.*상담소|near.*counsel/i;
  const nested: unknown[] = [];
  for (const row of base) {
    if (!row || typeof row !== "object") continue;
    for (const [k, v] of Object.entries(row as AnyRecord)) {
      if (!nestedKeyRe.test(k)) continue;
      if (Array.isArray(v)) nested.push(...v);
    }
  }

  // nested 상담소 배열이 있으면 "상담소 row"만 표시합니다(상위 기관 row는 지도 마커 대상이 아님).
  return nested.length > 0 ? nested : base;
}

function normalizeOpenApiRow(
  row: unknown,
  idx: number,
  kind: "counseling" | "child",
  datasetTag?: string,
): Center | null {
  if (!row || typeof row !== "object") return null;
  const r = row as AnyRecord;
  const sources = collectRecordSources(r);

  const roadAddress = pickStringFromSources(sources, [
    "사업장도로명주소",
    "소재지도로명주소",
    "도로명주소",
    // 일부 지자체 CSV는 도로/지번 구분 없이 '소재지'로만 제공
    "소재지",
    "rdnmadr",
    "roadAddress",
    "REFINE_ROADNM_ADDR",
    "ROADNM_ADDR",
  ]);
  const jibunAddress = pickStringFromSources(sources, [
    "사업장지번주소",
    "소재지지번주소",
    "지번주소",
    "lnmadr",
    "address",
    "REFINE_LOTNO_ADDR",
    "LOTNO_ADDR",
  ]);
  const address =
    roadAddress ||
    jibunAddress ||
    pickStringFromSources(sources, ["주소"]) ||
    "";

  const name =
    pickStringFromSources(sources, [
      "시설명",
      "시설명칭",
      "센터명칭",
      "기관명칭",
      "제공기관명",
      "기관명",
      "센터명",
      "상담소명",
      "사업장명",
      "상호명",
      "name",
      // 지자체 OpenAPI에서 자주 사용하는 키
      "FACLT_NM",
      "INST_NM",
      "BIZPLC_NM",
      "CMPNY_NM",
    ]) ||
    address ||
    `센터 ${idx + 1}`;

  const phone =
    pickStringFromSources(sources, [
      "전화번호",
      "전화",
      "기관연락번호",
      "연락처",
      "phone",
      "telno",
      "TELNO",
      "REFINE_TELNO",
      "WELFARE_FACLT_TELNO",
    ]) || "";

  const homepageRaw =
    pickStringFromSources(sources, [
      "홈페이지URL",
      "홈페이지_URL",
      "홈페이지 URL",
      "홈페이지 url",
      "홈페이지",
      "홈페이지주소",
      "홈페이지 주소",
      "homepage",
      "homepageUrl",
      "homePage",
      "home_page",
      "HOMEPAGE",
      "HOMEPAGE_URL",
      "WEB_SITE",
      "WEBSITE",
      "website",
      "url",
      "URL",
    ]) ??
    pickStringByRegexFromSources(sources, /홈페이지|home\s?page|website|url/i);

  const normalizeHomepageUrl = (
    raw: string | undefined,
  ): string | undefined => {
    if (!raw) return undefined;
    const s = raw.trim();
    if (!s) return undefined;

    // Filter placeholders (common in public datasets)
    const lower = s.toLowerCase();
    if (
      lower === "www." ||
      lower === "www" ||
      lower === "http://" ||
      lower === "https://"
    )
      return undefined;

    // Already absolute
    if (/^https?:\/\//i.test(s)) return s;
    // Protocol-relative
    if (s.startsWith("//")) return `https:${s}`;
    // Add scheme for common cases
    if (s.startsWith("www.")) return `https://${s}`;
    if (/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(s)) return `https://${s}`;
    return undefined;
  };

  const homepageUrl = normalizeHomepageUrl(homepageRaw);

  const expertRec =
    asRecord(r["전문가소개"]) ||
    asRecord(r["전문가 소개"]) ||
    asRecord(r["전문가_소개"]) ||
    asRecord(r["상담사소개"]) ||
    asRecord(r["상담사 소개"]);
  const expertIntro =
    pickStringFromSources(sources, [
      "전문가소개",
      "전문가 소개",
      "전문가_소개",
      "상담사소개",
      "상담사 소개",
    ]) ??
    pickStringByRegexFromSources(sources, /전문가\s*소개|상담사\s*소개/i) ??
    (expertRec ? formatKeyValueSummary(expertRec) : undefined);

  const reservationRaw =
    pickStringFromSources(sources, [
      "예약링크",
      "예약 링크",
      "예약URL",
      "예약 URL",
      "예약",
      "예약방법",
    ]) ??
    pickStringByRegexFromSources(sources, /예약\s*(?:링크|url|방법|문의)/i);
  const reservationUrl = normalizeHomepageUrl(reservationRaw);
  const reservationText = (() => {
    if (!reservationRaw) return undefined;
    const s = reservationRaw.trim();
    if (!s) return undefined;
    if (reservationUrl) return undefined;
    if (/문의\s*필요|미정|없음|없습니다|제공\s*안함|준비\s*중/i.test(s))
      return undefined;
    return s;
  })();

  const hours =
    pickStringFromSources(sources, [
      "운영시간",
      "이용시간",
      "영업시간",
      "hours",
      "HOURS",
      "OPENING_HOURS",
    ]) ??
    pickStringByRegexFromSources(
      sources,
      /운영\s*시간|영업\s*시간|이용\s*시간/i,
    ) ??
    pickHoursFromSources(sources) ??
    "운영시간 정보 없음";

  const rating =
    pickNumberFromSources(sources, [
      "평점",
      "후기평점",
      "별점",
      "rating",
      "RATE",
      "SCORE",
    ]) ?? 0;
  const reviewCount =
    pickNumberFromSources(sources, [
      "리뷰수",
      "후기수",
      "평가수",
      "reviewCount",
      "REVIEWS",
    ]) ?? 0;

  const distanceNumber =
    pickNumberFromSources(sources, [
      "거리",
      "distance",
      "DISTANCE",
      "distanceKm",
      "distance_km",
    ]) ?? pickNumberByRegexFromSources(sources, /거리|distance/i);
  const distance =
    distanceNumber !== undefined
      ? `${distanceNumber}km`
      : pickStringFromSources(sources, ["거리", "distance", "DISTANCE"]) ||
        "거리 정보 없음";

  const specialtiesRaw =
    pickTextFromSources(sources, [
      "전문분야",
      "상담분야",
      "치료분야",
      "프로그램",
      "서비스내용",
      "주요서비스",
      "specialties",
    ]) ??
    pickTextByRegexFromSources(sources, /(전문|분야|치료|프로그램|서비스)/i);

  const inferred =
    kind === "child"
      ? inferChildCenterSpecialties(
          [name, address, specialtiesRaw ?? ""].join(" "),
        )
      : inferCounselingSpecialties(
          [name, address, specialtiesRaw ?? ""].join(" "),
        );
  const specialties = (() => {
    const parsed = specialtiesRaw ? splitList(specialtiesRaw) : [];
    const base = parsed.length > 0 ? parsed : inferred;
    // 공공데이터 row에 분야/프로그램 정보가 없는 경우에도 카드에서 최소 1개는 보이게 합니다.
    const fallback = kind === "child" ? ["방과후돌봄"] : ["심리상담"];
    const withFallback = base.length > 0 ? base : fallback;
    return uniq(withFallback).slice(0, 24);
  })();

  const lat =
    pickNumberFromSources(sources, [
      "WGS84위도",
      "WGS84 위도",
      "위도",
      "lat",
      "latitude",
      "REFINE_WGS84_LAT",
    ]) ?? pickNumberByRegexFromSources(sources, /위도|lat|latitude/i);
  const lng =
    pickNumberFromSources(sources, [
      "WGS84경도",
      "WGS84 경도",
      "경도",
      "lng",
      "longitude",
      "lon",
      "REFINE_WGS84_LOGT",
      "REFINE_WGS84_LONG",
    ]) ?? pickNumberByRegexFromSources(sources, /경도|lng|lon|longitude|logt/i);

  const latOk = lat !== undefined && lat >= -90 && lat <= 90 ? lat : undefined;
  const lngOk =
    lng !== undefined && lng >= -180 && lng <= 180 ? lng : undefined;

  const datasetTagFromRow =
    typeof r["__dataset"] === "string" ? (r["__dataset"] as string).trim() : "";
  const dataset = (datasetTag && datasetTag.trim()) || datasetTagFromRow;
  const baseId = String(
    r["관리번호"] ??
      r["id"] ??
      r["번호"] ??
      r["연번"] ??
      r["순번"] ??
      `openapi-${idx}`,
  );
  // 공공데이터에서 '연번/번호'가 중복되는 경우가 있어(React key 충돌),
  // row index를 함께 포함해 항상 유니크한 id를 생성합니다.
  const idBase = dataset ? `${dataset}:${baseId}` : baseId;
  const id = `${idBase}:${idx}`;

  const sigun =
    pickStringFromSources(sources, [
      "SIGUN_NM",
      "시군명",
      "시군구명",
      "SIGUNGU_NM",
      "시도명",
      "SIDO_NM",
    ]) || pickStringByRegexFromSources(sources, /시군|시군구|시도|sigun/i);
  const capacity =
    pickNumberFromSources(sources, [
      "FACLT_PSN_CAPA",
      "정원수",
      "정원",
      "수용인원",
      "수용정원",
    ]) ?? pickNumberByRegexFromSources(sources, /정원|수용|capa/i);
  const current =
    pickNumberFromSources(sources, ["현원수", "현원"]) ??
    pickNumberByRegexFromSources(sources, /현원/i);
  const staff =
    pickNumberFromSources(sources, ["종사자수", "종사자"]) ??
    pickNumberByRegexFromSources(sources, /종사자/i);
  const operatorType =
    pickStringFromSources(sources, [
      "운영기관유형",
      "운영기관 유형",
      "운영기관유형명",
      "OPRTR_SE",
    ]) ?? pickStringByRegexFromSources(sources, /운영.*유형|운영\s*기관/i);
  const representative =
    pickStringFromSources(sources, ["대표자명", "대표자"]) ??
    pickStringByRegexFromSources(sources, /대표자/i);
  const provider =
    pickStringFromSources(sources, ["제공기관명", "제공기관"]) ??
    pickStringByRegexFromSources(sources, /제공기관/i);
  const dataStd =
    pickStringFromSources(sources, [
      "데이터기준일자",
      "데이터 기준일자",
      "기준일자",
      "데이터기준일",
      "DATA_STD_DE",
    ]) ?? pickStringByRegexFromSources(sources, /기준일|data\s*std/i);
  const postal =
    pickStringFromSources(sources, [
      "소재지우편번호",
      "우편번호",
      "POST_NO",
      "zip",
      "zipcode",
    ]) ?? pickStringByRegexFromSources(sources, /우편|zip/i);
  const area =
    pickNumberFromSources(sources, ["면적", "면적(m2)", "면적(㎡)", "AREA"]) ??
    pickNumberByRegexFromSources(sources, /면적|area/i);

  const metaLines: string[] = [];
  if (sigun) metaLines.push(`지역: ${sigun}`);
  if (capacity !== undefined) metaLines.push(`정원: ${capacity}명`);
  if (current !== undefined) metaLines.push(`현원: ${current}명`);
  if (staff !== undefined) metaLines.push(`종사자: ${staff}명`);
  if (operatorType) metaLines.push(`운영: ${operatorType}`);
  if (representative) metaLines.push(`대표: ${representative}`);
  if (area !== undefined) metaLines.push(`면적: ${area}㎡`);
  if (dataStd) metaLines.push(`기준일: ${dataStd}`);
  if (provider) metaLines.push(`제공: ${provider}`);
  if (postal) metaLines.push(`우편: ${postal}`);

  const intro =
    pickStringFromSources(sources, [
      "시설소개",
      "시설 소개",
      "기관소개",
      "센터소개",
      "소개",
    ]) ??
    pickStringByRegexFromSources(sources, /(시설|기관|센터)\s*소개|^소개$/i);
  const programs =
    pickStringFromSources(sources, [
      "주요_프로그램",
      "주요 프로그램",
      "주요프로그램",
      "프로그램",
      "프로그램내용",
    ]) ?? pickStringByRegexFromSources(sources, /주요.*프로그램|프로그램/i);
  const applyMethod =
    pickStringFromSources(sources, [
      "이용_신청_방법",
      "이용 신청 방법",
      "이용신청방법",
      "신청방법",
      "신청절차",
      "신청 절차",
      "이용방법",
    ]) ??
    pickStringByRegexFromSources(
      sources,
      /이용.*신청.*방법|신청.*(방법|절차)/i,
    );

  const extras = buildExtras(r);

  // 주소도 좌표도 없으면 스킵
  if (!address && (latOk === undefined || lngOk === undefined)) return null;

  return {
    id,
    name,
    address,
    phone,
    homepageUrl,
    raw: r,
    expertIntro:
      typeof expertIntro === "string" && expertIntro.trim()
        ? expertIntro.trim()
        : undefined,
    reservationUrl,
    reservationText,
    hours,
    rating,
    reviewCount,
    distance,
    specialties,
    lat: latOk,
    lng: lngOk,
    metaLines: metaLines.length > 0 ? metaLines.slice(0, 8) : undefined,
    intro: typeof intro === "string" && intro.trim() ? intro.trim() : undefined,
    programs:
      typeof programs === "string" && programs.trim()
        ? programs.trim()
        : undefined,
    applyMethod:
      typeof applyMethod === "string" && applyMethod.trim()
        ? applyMethod.trim()
        : undefined,
    extras,
    isOpen: true,
  };
}

const counselingCenters: Center[] = [
  {
    id: "1",
    name: "마음숲 아동심리상담센터",
    address: "서울시 강남구 테헤란로 123",
    phone: "02-1234-5678",
    hours: "09:00 - 18:00",
    rating: 4.8,
    reviewCount: 124,
    distance: "0.5km",
    specialties: ["놀이치료", "미술치료", "발달검사"],
    lat: 37.5065,
    lng: 127.0536,
    isOpen: true,
  },
  {
    id: "2",
    name: "행복한 아이 심리센터",
    address: "서울시 강남구 역삼로 456",
    phone: "02-2345-6789",
    hours: "10:00 - 19:00",
    rating: 4.6,
    reviewCount: 89,
    distance: "1.2km",
    specialties: ["언어치료", "미술치료", "부모상담"],
    lat: 37.5,
    lng: 127.04,
    isOpen: true,
  },
  {
    id: "3",
    name: "밝은미래 심리상담소",
    address: "서울시 서초구 서초대로 789",
    phone: "02-3456-7890",
    hours: "09:00 - 20:00",
    rating: 4.9,
    reviewCount: 203,
    distance: "1.8km",
    specialties: ["놀이치료", "가족치료", "ADHD"],
    lat: 37.495,
    lng: 127.03,
    isOpen: false,
  },
  {
    id: "4",
    name: "튼튼마음 아동발달센터",
    address: "서울시 강남구 논현로 321",
    phone: "02-4567-8901",
    hours: "09:30 - 18:30",
    rating: 4.7,
    reviewCount: 156,
    distance: "2.1km",
    specialties: ["발달검사", "감각통합", "미술치료"],
    lat: 37.51,
    lng: 127.06,
    isOpen: true,
  },
  {
    id: "5",
    name: "아이사랑 심리클리닉",
    address: "서울시 송파구 올림픽로 555",
    phone: "02-5678-9012",
    hours: "10:00 - 18:00",
    rating: 4.5,
    reviewCount: 67,
    distance: "3.5km",
    specialties: ["놀이치료", "인지치료", "부모교육"],
    lat: 37.515,
    lng: 127.07,
    isOpen: true,
  },
];

const childCenters: Center[] = [
  {
    id: "c1",
    name: "꿈나무 지역아동센터",
    address: "서울시 강남구 봉은사로 88",
    phone: "02-1111-2222",
    hours: "13:00 - 20:00",
    rating: 4.7,
    reviewCount: 52,
    distance: "0.8km",
    specialties: ["방과후돌봄", "학습지원", "급식지원"],
    lat: 37.5112,
    lng: 127.0582,
    isOpen: true,
  },
  {
    id: "c2",
    name: "새싹이 아동센터",
    address: "서울시 강남구 삼성로 215",
    phone: "02-2222-3333",
    hours: "12:30 - 19:30",
    rating: 4.5,
    reviewCount: 41,
    distance: "1.4km",
    specialties: ["방과후돌봄", "문화체험", "정서지원"],
    lat: 37.508,
    lng: 127.0485,
    isOpen: true,
  },
  {
    id: "c3",
    name: "햇살 아동발달센터",
    address: "서울시 서초구 반포대로 110",
    phone: "02-3333-4444",
    hours: "09:00 - 18:30",
    rating: 4.8,
    reviewCount: 68,
    distance: "2.0km",
    specialties: ["발달검사", "언어재활", "놀이활동"],
    lat: 37.5035,
    lng: 127.0155,
    isOpen: false,
  },
  {
    id: "c4",
    name: "푸른나무 지역아동센터",
    address: "서울시 송파구 백제고분로 210",
    phone: "02-4444-5555",
    hours: "13:00 - 20:30",
    rating: 4.6,
    reviewCount: 37,
    distance: "3.1km",
    specialties: ["학습지원", "진로체험", "급식지원"],
    lat: 37.507,
    lng: 127.098,
    isOpen: true,
  },
  {
    id: "c5",
    name: "나눔 아동센터",
    address: "서울시 강동구 천호대로 1045",
    phone: "02-5555-6666",
    hours: "12:00 - 19:00",
    rating: 4.4,
    reviewCount: 29,
    distance: "4.2km",
    specialties: ["방과후돌봄", "정서지원", "문화체험"],
    lat: 37.546,
    lng: 127.1362,
    isOpen: true,
  },
];

const counselingSpecialtyOptions = [
  "발달",
  "정서",
  "행동",
  "놀이치료",
  "미술치료",
  "언어치료",
  "발달검사",
  "가족치료",
  "부모상담",
  "ADHD",
  "감각통합",
  "인지치료",
];

const childCenterSpecialtyOptions = [
  "방과후돌봄",
  "학습지원",
  "급식지원",
  "정서지원",
  "문화체험",
  "진로체험",
  "발달검사",
  "언어재활",
  "놀이활동",
];

export default function CounselingPage() {
  const [activeTab, setActiveTab] = useState<"counseling" | "child">(
    "counseling",
  );
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("distance");
  const [minRating, setMinRating] = useState<"all" | "4.5" | "4.0" | "3.5">(
    "all",
  );
  const [mapLoaded, setMapLoaded] = useState(false);
  const [kakaoLoadError, setKakaoLoadError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [jsonFiles, setJsonFiles] = useState<string[] | null>(null);
  const [jsonFilesError, setJsonFilesError] = useState<string | null>(null);

  // OpenAPI(공공데이터) 기반 상담소 목록
  const [publicCenters, setPublicCenters] = useState<Center[]>([]);
  const [hasLoadedPublicCenters, setHasLoadedPublicCenters] = useState(false);
  const [isLoadingPublicCenters, setIsLoadingPublicCenters] = useState(false);
  const [publicCentersError, setPublicCentersError] = useState<string | null>(
    null,
  );

  // OpenAPI(공공데이터) 기반 아동센터 목록
  const [publicChildCenters, setPublicChildCenters] = useState<Center[]>([]);
  const [hasLoadedChildCenters, setHasLoadedChildCenters] = useState(false);
  const [isLoadingChildCenters, setIsLoadingChildCenters] = useState(false);
  const [childCentersError, setChildCentersError] = useState<string | null>(
    null,
  );

  const [geocodingProgress, setGeocodingProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<KakaoMap | null>(null);
  const markersRef = useRef<KakaoMarker[]>([]);
  const clustererRef = useRef<KakaoMarkerClusterer | null>(null);
  const infoWindowRef = useRef<KakaoInfoWindow | null>(null);
  const geocodedIdsRef = useRef<Set<string>>(new Set());
  const isGeocodingRef = useRef(false);

  // 브라우저 위치 권한이 허용되면 "거리순" 정렬/표시에 사용할 수 있도록 현재 위치를 가져옵니다.
  useEffect(() => {
    if (!("geolocation" in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        // 위치 권한이 없거나 실패하면 거리 정보는 표시하지 않습니다(placeholder로 유지).
        setUserLocation(null);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadJsonIndex() {
      try {
        setJsonFilesError(null);
        const res = await fetch("/api/kakao-map-key?list=1");
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.error || `HTTP ${res.status}`);
        }
        const filesRaw: unknown = data?.files;
        const files = Array.isArray(filesRaw)
          ? filesRaw
              .filter((f): f is string => typeof f === "string")
              .map((f) => f.trim())
              .filter(Boolean)
          : [];
        if (!cancelled) setJsonFiles(files);
      } catch (e) {
        if (cancelled) return;
        setJsonFilesError(e instanceof Error ? e.message : String(e));
        setJsonFiles([]);
      }
    }

    loadJsonIndex();
    return () => {
      cancelled = true;
    };
  }, []);

  const counselingData = publicCentersError
    ? counselingCenters
    : hasLoadedPublicCenters
      ? publicCenters
      : [];
  const childData = childCentersError
    ? childCenters
    : hasLoadedChildCenters
      ? publicChildCenters
      : [];

  // 탭 요구사항
  // - 주변 상담소: "아동심리 상담소"만 표시
  // - 주변 아동센터: 상담소를 제외한 지역아동센터 데이터만 표시
  const centers = useMemo(() => {
    return activeTab === "counseling" ? counselingData : childData;
  }, [activeTab, counselingData, childData]);

  const isLoadingActive =
    (jsonFiles === null && !jsonFilesError) ||
    (activeTab === "counseling"
      ? isLoadingPublicCenters
      : isLoadingChildCenters);
  const activeError = jsonFilesError
    ? `JSON 파일 목록을 불러오지 못했습니다 - ${jsonFilesError}`
    : activeTab === "counseling"
      ? publicCentersError
      : childCentersError;

  // 센터 좌표 + 사용자 현재 위치가 있으면 거리(km)를 계산해 distance 필드를 채웁니다.
  const centersWithDistance = useMemo(() => {
    if (!userLocation) {
      return centers.map((c) => ({
        ...c,
        distance: c.distance || "거리 정보 없음",
      }));
    }

    return centers.map((c) => {
      if (c.lat == null || c.lng == null) {
        return { ...c, distance: c.distance || "거리 정보 없음" };
      }
      const km = haversineKm(userLocation.lat, userLocation.lng, c.lat, c.lng);
      return {
        ...c,
        distance: Number.isFinite(km)
          ? `${km.toFixed(1)}km`
          : c.distance || "거리 정보 없음",
      };
    });
  }, [centers, userLocation]);
  const availableSpecialties =
    activeTab === "counseling"
      ? counselingSpecialtyOptions
      : childCenterSpecialtyOptions;
  const centerLabel = activeTab === "counseling" ? "상담소" : "아동센터";
  const specialtyLabel =
    activeTab === "counseling" ? "전문 분야(발달·정서·행동 등)" : "프로그램";

  const filteredCenters = useMemo(() => {
    const rawQ = searchQuery.trim();
    const q = rawQ.toLowerCase();
    const qTokens = rawQ
      .split(/[\s,|/·ㆍ•\n\r\t]+/g)
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const minRatingValue =
      minRating === "all" ? 0 : Number.parseFloat(minRating);

    const parseKm = (distance: string): number => {
      const n = Number.parseFloat(distance);
      return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
    };

    const buildSearchText = (center: Center): string => {
      const extrasText = (center.extras ?? [])
        .map((e) => `${e.label} ${e.value}`)
        .join(" ");
      return [
        center.name,
        center.address,
        center.phone,
        center.hours,
        (center.specialties ?? []).join(" "),
        (center.metaLines ?? []).join(" "),
        center.intro ?? "",
        center.programs ?? "",
        center.applyMethod ?? "",
        center.expertIntro ?? "",
        center.reservationUrl ?? "",
        center.reservationText ?? "",
        extrasText,
      ]
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
    };

    const specialtyMatchScore = (center: Center): number => {
      if (qTokens.length === 0) return 0;
      const specText = (center.specialties ?? []).join(" ").toLowerCase();
      let score = 0;
      for (const t of qTokens) {
        if (!t) continue;
        if (specText.includes(t)) score += 2;
      }
      return score;
    };

    const list = centersWithDistance
      .map((center) => {
        const searchText = buildSearchText(center);
        const matchesSearch = !q || searchText.includes(q);
        const matchesSpecialties =
          selectedSpecialties.length === 0 ||
          selectedSpecialties.some((s) => searchText.includes(s.toLowerCase()));
        const matchesRating =
          minRating === "all" ||
          (Number.isFinite(center.rating) && center.rating >= minRatingValue);

        return {
          center,
          matchesSearch,
          matchesSpecialties,
          matchesRating,
          distKm: parseKm(center.distance),
          specScore: specialtyMatchScore(center),
        };
      })
      .filter((x) => x.matchesSearch && x.matchesSpecialties && x.matchesRating)
      .sort((a, b) => {
        // 검색어가 전문 분야와 일치하면 우선순위로 노출
        if (qTokens.length > 0 && a.specScore !== b.specScore) {
          return b.specScore - a.specScore;
        }

        if (sortBy === "rating") {
          if (b.center.rating !== a.center.rating)
            return b.center.rating - a.center.rating;
          const aInf = !Number.isFinite(a.distKm);
          const bInf = !Number.isFinite(b.distKm);
          if (aInf !== bInf) return aInf ? 1 : -1;
          if (!aInf && !bInf && a.distKm !== b.distKm)
            return a.distKm - b.distKm;
          return a.center.name.localeCompare(b.center.name, "ko");
        }

        // 기본: 거리순(가까운 순) → 평점 높은 순(추천)
        const aInf = !Number.isFinite(a.distKm);
        const bInf = !Number.isFinite(b.distKm);
        if (aInf !== bInf) return aInf ? 1 : -1;
        if (!aInf && !bInf && a.distKm !== b.distKm) return a.distKm - b.distKm;
        if (b.center.rating !== a.center.rating)
          return b.center.rating - a.center.rating;
        return a.center.name.localeCompare(b.center.name, "ko");
      })
      .map((x) => x.center);

    return list;
  }, [
    centersWithDistance,
    searchQuery,
    selectedSpecialties,
    minRating,
    sortBy,
  ]);

  // 좌표가 없는 데이터는 지도에 표시되지 않으므로 목록에서도 제외합니다.
  const visibleCenters = useMemo(
    () => filteredCenters.filter((c) => c.lat != null && c.lng != null),
    [filteredCenters],
  );
  const isTruncatedCenters = false;
  const markerableVisibleCount = useMemo(
    () => visibleCenters.filter((c) => c.lat != null && c.lng != null).length,
    [visibleCenters],
  );
  const markerlessVisibleCount = Math.max(
    0,
    visibleCenters.length - markerableVisibleCount,
  );

  const visibleCentersKey = useMemo(() => {
    // useEffect deps에 배열을 직접(또는 spread) 넣으면 길이가 변할 수 있어
    // "항상 고정 길이" deps로 만들기 위한 키(해시)로 변환합니다.
    let h = 2166136261;
    for (const c of visibleCenters) {
      h = fnv1a32Update(h, c.id);
      // separator
      h ^= 0xff;
      h = Math.imul(h, 16777619);
    }
    return `${visibleCenters.length}:${h >>> 0}`;
  }, [visibleCenters]);

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty],
    );
  };

  const handleCenterSelect = (center: Center) => {
    setSelectedCenter(center);

    const kakao = window.kakao;
    if (!kakao?.maps) return;

    if (mapInstanceRef.current && center.lat != null && center.lng != null) {
      const moveLatLon = new kakao.maps.LatLng(center.lat, center.lng);
      mapInstanceRef.current.panTo(moveLatLon);
    }
  };

  // 공공데이터(OpenAPI) 로드(상담소) → 리스트/마커로 표시
  useEffect(() => {
    if (jsonFiles === null) return;
    const files = jsonFiles;
    if (hasLoadedPublicCenters || isLoadingPublicCenters) return;

    let cancelled = false;
    async function loadPublicCenters() {
      setIsLoadingPublicCenters(true);
      setPublicCentersError(null);

      try {
        // 로컬 `AiMind-FrontEnd/json` 폴더의 JSON 데이터를 API로 읽어옵니다.
        // - 한글 파일명 JSON을 Client에서 import하면 Turbopack 빌드가 깨질 수 있어(API route로 우회)
        // "주변 상담소"는 아동심리상담소 데이터만 노출합니다.
        const counselingFileRe = /아동[\s_]*심리[\s_]*상담/i;
        const excludeChildFileRe = /아동\s*센터|아동센터|지역아동센터/i;
        const datasets = files
          .filter((file) => !/\(\d+\)\.json$/i.test(file))
          .filter(
            (file) =>
              counselingFileRe.test(file) && !excludeChildFileRe.test(file),
          )
          .map((file) => ({
            file,
            tag: file.replace(/_enriched\.json$/i, ""),
          }));

        if (datasets.length === 0) {
          throw new Error("No counseling JSON files found in /json");
        }

        const results = await Promise.all(
          datasets.map(async (d) => {
            const res = await fetch(
              `/api/kakao-map-key?file=${encodeURIComponent(d.file)}`,
            );
            const json = await res.json().catch(() => null);
            if (!res.ok || json == null) {
              throw new Error(
                `[${d.file}] failed to load (HTTP ${res.status})`,
              );
            }
            const rows = expandRowsForKind(json, "counseling");
            return { tag: d.tag, rows };
          }),
        );

        const merged = results.flatMap(({ tag, rows }) =>
          rows
            .map((r, idx) => normalizeOpenApiRow(r, idx, "counseling", tag))
            .filter((c): c is Center => Boolean(c)),
        );

        const normalized = dedupCenters(merged);

        if (cancelled) return;

        geocodedIdsRef.current.clear();
        setPublicCenters(normalized);
        setHasLoadedPublicCenters(true);
      } catch (e) {
        if (cancelled) return;
        setPublicCentersError(
          e instanceof Error ? e.message : "Failed to load JSON centers",
        );
        setPublicCenters([]);
        // 에러 시에는 샘플 데이터로 대체하되, 재시도 루프(무한 fetch)를 막기 위해 loaded로 처리합니다.
        setHasLoadedPublicCenters(true);
      } finally {
        if (!cancelled) setIsLoadingPublicCenters(false);
      }
    }

    loadPublicCenters();
    return () => {
      cancelled = true;
    };
  }, [jsonFiles, hasLoadedPublicCenters]);

  // 공공데이터(OpenAPI) 로드(아동센터) → 리스트/마커로 표시
  useEffect(() => {
    if (activeTab !== "child") return;
    if (jsonFiles === null) return;
    const files = jsonFiles;
    if (hasLoadedChildCenters || isLoadingChildCenters) return;

    let cancelled = false;
    async function loadChildCenters() {
      setIsLoadingChildCenters(true);
      setChildCentersError(null);

      try {
        const childFileRe =
          /아동\s*센터|지역\s*아동\s*센터|아동센터|지역아동센터/i;
        const preferredNational = files.find((file) =>
          /지역아동센터_전국통합_enriched\.json$/i.test(file),
        );
        const datasets = preferredNational
          ? [
              {
                file: preferredNational,
                tag: preferredNational.replace(/_enriched\.json$/i, ""),
              },
            ]
          : files
              .filter((file) => !/\(\d+\)\.json$/i.test(file))
              .filter((file) => childFileRe.test(file))
              .map((file) => ({
                file,
                tag: file.replace(/_enriched\.json$/i, ""),
              }));

        if (datasets.length === 0) {
          throw new Error("No child-center JSON files found in /json");
        }

        const results = await Promise.all(
          datasets.map(async (d) => {
            const res = await fetch(
              `/api/kakao-map-key?file=${encodeURIComponent(d.file)}`,
            );
            const json = await res.json().catch(() => null);
            if (!res.ok || json == null) {
              throw new Error(
                `[${d.file}] failed to load (HTTP ${res.status})`,
              );
            }
            const rows = expandRowsForKind(json, "child").filter((r) => {
              if (!r || typeof r !== "object") return false;
              const rr = r as AnyRecord;
              const t = pickString(rr, [
                "기관유형",
                "시설유형",
                "구분",
                "type",
                "TYPE",
              ]);
              // 혼합 데이터셋에서 "심리상담소" 등 상담소 row는 child 탭의 주데이터에서 제외합니다.
              if (t && /심리|상담/i.test(t) && !/아동|지역아동/i.test(t))
                return false;
              return true;
            });
            return { tag: d.tag, rows };
          }),
        );

        const merged = results.flatMap(({ tag, rows }) =>
          rows
            .map((r, idx) => normalizeOpenApiRow(r, idx, "child", tag))
            .filter((c): c is Center => Boolean(c)),
        );

        const normalized = dedupCenters(merged);

        if (cancelled) return;

        geocodedIdsRef.current.clear();
        setPublicChildCenters(normalized);
        setHasLoadedChildCenters(true);
      } catch (e) {
        if (cancelled) return;
        setChildCentersError(
          e instanceof Error ? e.message : "Failed to load JSON child centers",
        );
        setPublicChildCenters([]);
        // 에러 시에는 샘플 데이터로 대체하되, 재시도 루프(무한 fetch)를 막기 위해 loaded로 처리합니다.
        setHasLoadedChildCenters(true);
      } finally {
        if (!cancelled) setIsLoadingChildCenters(false);
      }
    }

    loadChildCenters();
    return () => {
      cancelled = true;
    };
  }, [activeTab, jsonFiles, hasLoadedChildCenters]);

  // 좌표 없는 데이터는 주소로 지오코딩(카카오 services 필요)
  useEffect(() => {
    if (!mapLoaded) return;
    if (isGeocodingRef.current) return;

    const kakao = window.kakao;
    if (!kakao?.maps) return;

    const services = kakao.maps.services;
    if (!services?.Geocoder) return;

    const visibleIds = new Set(visibleCenters.map((c) => c.id));

    const source =
      activeTab === "counseling" ? ("public" as const) : ("child" as const);
    const activeCenters =
      activeTab === "counseling" ? publicCenters : publicChildCenters;

    const tasks: Array<{ source: "public" | "child"; center: Center }> =
      activeCenters
        .filter(
          (c) =>
            visibleIds.has(c.id) &&
            (c.lat == null || c.lng == null) &&
            Boolean(c.address) &&
            !geocodedIdsRef.current.has(c.id),
        )
        .map((center) => ({ source, center }));

    if (tasks.length === 0) return;

    let cancelled = false;
    isGeocodingRef.current = true;
    const geocoder = new services.Geocoder();

    const geocode = (address: string) =>
      new Promise<{ lat: number; lng: number } | null>((resolve) => {
        geocoder.addressSearch(
          address,
          (result: KakaoGeocoderResult[], status: KakaoGeocoderStatus) => {
            if (status === services.Status.OK && result && result[0]) {
              const lat = Number.parseFloat(result[0].y);
              const lng = Number.parseFloat(result[0].x);
              if (Number.isFinite(lat) && Number.isFinite(lng)) {
                resolve({ lat, lng });
                return;
              }
            }
            resolve(null);
          },
        );
      });

    (async () => {
      setGeocodingProgress({ current: 0, total: tasks.length });

      const updatesPublic = new Map<string, { lat: number; lng: number }>();
      const updatesChild = new Map<string, { lat: number; lng: number }>();
      let current = 0;
      const flushEvery = 10;

      const flush = () => {
        if (cancelled) return;

        if (updatesPublic.size > 0) {
          const batch = new Map(updatesPublic);
          updatesPublic.clear();
          setPublicCenters((prev) =>
            prev.map((c) => {
              const u = batch.get(c.id);
              return u ? { ...c, lat: u.lat, lng: u.lng } : c;
            }),
          );
        }

        if (updatesChild.size > 0) {
          const batch = new Map(updatesChild);
          updatesChild.clear();
          setPublicChildCenters((prev) =>
            prev.map((c) => {
              const u = batch.get(c.id);
              return u ? { ...c, lat: u.lat, lng: u.lng } : c;
            }),
          );
        }
      };

      for (const { source, center } of tasks) {
        if (cancelled) break;
        geocodedIdsRef.current.add(center.id);

        const coords = await geocode(center.address);
        current += 1;

        if (!cancelled) setGeocodingProgress({ current, total: tasks.length });
        if (coords) {
          if (source === "public") updatesPublic.set(center.id, coords);
          else updatesChild.set(center.id, coords);
        }

        if (current % flushEvery === 0) flush();
        // 너무 빠르게 호출하지 않도록 약간 텀을 둠
        await new Promise((r) => setTimeout(r, 60));
      }

      if (cancelled) return;

      flush();
    })().finally(() => {
      isGeocodingRef.current = false;
      if (!cancelled) setGeocodingProgress(null);
    });

    return () => {
      cancelled = true;
    };
  }, [activeTab, mapLoaded, visibleCentersKey]);

  useEffect(() => {
    async function loadKakaoMap() {
      try {
        setKakaoLoadError(null);
        const response = await fetch("/api/kakao-map-key");
        const data = await response.json().catch(() => null);

        const apiKey = data?.apiKey;
        if (!apiKey) {
          const msg = String(
            data?.error || data?.message || "Kakao API key not configured",
          );
          setKakaoLoadError(
            `카카오 지도 API 키를 불러오지 못했습니다. (${msg})`,
          );
          console.error("Kakao API key not configured:", msg);
          return;
        }

        // 이미 SDK가 로드되어 있으면 바로 사용
        if (window.kakao?.maps) {
          window.kakao.maps.load(() => setMapLoaded(true));
          return;
        }

        // 중복 script 삽입 방지
        const existing = document.querySelector(
          'script[data-kakao-maps-sdk="true"]',
        ) as HTMLScriptElement | null;

        if (existing) {
          // 이미 로드가 끝난 경우를 안전하게 처리(autoload=false 환경에서 load 호출 필요)
          if (window.kakao?.maps) {
            window.kakao.maps.load(() => setMapLoaded(true));
            return;
          }
          existing.addEventListener(
            "load",
            () => {
              if (window.kakao?.maps) {
                window.kakao.maps.load(() => setMapLoaded(true));
              }
            },
            { once: true },
          );
          return;
        }

        const script = document.createElement("script");
        script.setAttribute("data-kakao-maps-sdk", "true");
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false&libraries=services,clusterer`;
        script.async = true;

        script.onerror = () => {
          setKakaoLoadError(
            `카카오 지도 SDK 로드에 실패했습니다. Kakao Developers에서 Web 도메인 등록을 확인해주세요. (현재: ${window.location.origin})`,
          );
          console.error(
            "Failed to load Kakao Maps SDK. Check Kakao Developers Web domain:",
            window.location.origin,
          );
        };

        script.onload = () => {
          if (!window.kakao?.maps) {
            console.error(
              "Kakao SDK script loaded but window.kakao.maps is missing.",
            );
            return;
          }

          window.kakao.maps.load(() => {
            setMapLoaded(true);
          });
        };

        document.head.appendChild(script);
      } catch (error) {
        setKakaoLoadError(
          `카카오 지도를 불러오지 못했습니다. (${error instanceof Error ? error.message : String(error)})`,
        );
        console.error("Failed to load Kakao Map:", error);
      }
    }

    loadKakaoMap();
  }, []);

  useEffect(() => {
    const kakao = window.kakao;
    if (!mapLoaded || !mapRef.current || mapInstanceRef.current || !kakao?.maps)
      return;

    const options = {
      center: new kakao.maps.LatLng(37.5065, 127.0536),
      level: 5,
    };

    const map = new kakao.maps.Map(mapRef.current, options);
    mapInstanceRef.current = map;

    // Add zoom control
    const zoomControl = new kakao.maps.ZoomControl();
    map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

    // Info window (마커 클릭 시 간단 표시)
    infoWindowRef.current = new kakao.maps.InfoWindow({ zIndex: 1 });

    // Marker clusterer (많은 마커도 부드럽게 표시)
    clustererRef.current = kakao.maps.MarkerClusterer
      ? new kakao.maps.MarkerClusterer({
          map,
          averageCenter: true,
          minLevel: 8,
        })
      : null;
  }, [mapLoaded]);

  useEffect(() => {
    const kakao = window.kakao;
    const map = mapInstanceRef.current;
    if (!mapLoaded || !map || !kakao?.maps) return;

    try {
      map.relayout?.();
    } catch {
      // ignore
    }

    const clusterer = clustererRef.current;
    try {
      clusterer?.clear();
    } catch {
      // ignore
    }

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }

    const bounds = new kakao.maps.LatLngBounds();
    let hasAnyMarker = false;
    const nextMarkers: KakaoMarker[] = [];

    visibleCenters.forEach((center) => {
      if (center.lat == null || center.lng == null) return;

      const markerPosition = new kakao.maps.LatLng(center.lat, center.lng);
      const marker = new kakao.maps.Marker(
        clusterer
          ? {
              position: markerPosition,
              title: center.name,
            }
          : {
              position: markerPosition,
              map,
              title: center.name,
            },
      );

      nextMarkers.push(marker);
      bounds.extend(markerPosition);
      hasAnyMarker = true;

      kakao.maps.event.addListener(marker, "click", () => {
        setSelectedCenter(center);
        if (infoWindowRef.current) {
          const content = document.createElement("div");
          content.style.padding = "6px";
          content.style.fontSize = "12px";
          content.textContent = center.name;
          infoWindowRef.current.setContent(content);
          infoWindowRef.current.open(map, marker);
        }
      });
    });

    markersRef.current = nextMarkers;
    if (clusterer && nextMarkers.length > 0) {
      clusterer.addMarkers(nextMarkers);
      try {
        clusterer.redraw();
      } catch {
        // ignore
      }
    }

    if (hasAnyMarker) {
      map.setBounds(bounds);
    }
  }, [mapLoaded, visibleCenters]);

  // 지도/리스트 뷰 전환 시, 지도가 다시 보이면 relayout + bounds 재적용
  useEffect(() => {
    const kakao = window.kakao;
    const map = mapInstanceRef.current;
    if (!mapLoaded || !map || !kakao?.maps) return;
    if (viewMode !== "map") return;

    const t = window.setTimeout(() => {
      try {
        map.relayout?.();
      } catch {
        // ignore
      }

      const bounds = new kakao.maps.LatLngBounds();
      let hasAnyMarker = false;
      for (const center of visibleCenters) {
        if (center.lat == null || center.lng == null) continue;
        bounds.extend(new kakao.maps.LatLng(center.lat, center.lng));
        hasAnyMarker = true;
      }
      if (hasAnyMarker) map.setBounds(bounds);
      try {
        clustererRef.current?.redraw();
      } catch {
        // ignore
      }
    }, 0);

    return () => window.clearTimeout(t);
  }, [viewMode, mapLoaded, visibleCenters]);

  useEffect(() => {
    setSelectedCenter(null);
    setSelectedSpecialties([]);
    setMinRating("all");
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Search Header */}
        <section id="link-page" className="bg-card border-b scroll-mt-24">
          <div className="container mx-auto px-4 py-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">주변 상담소</h2>
              <p className="text-sm text-muted-foreground mt-1">
                지도에서 주변 아동 심리 상담소/지역아동센터 위치를 확인하고,
                거리·전문분야·후기평점 기준으로 빠르게 찾아보세요.
              </p>
            </div>
            <Tabs
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as "counseling" | "child")
              }
              className="mb-4"
            >
              <TabsList>
                <TabsTrigger value="counseling">주변 상담소</TabsTrigger>
                <TabsTrigger value="child">주변 아동센터</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`${centerLabel} 이름 또는 주소 검색`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="gap-2 bg-transparent">
                      <Filter className="h-4 w-4" />
                      필터
                      {selectedSpecialties.length > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {selectedSpecialties.length}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>필터 설정</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-6">
                      <div>
                        <h4 className="font-medium mb-3">{specialtyLabel}</h4>
                        <div className="space-y-3">
                          {availableSpecialties.map((specialty) => (
                            <div
                              key={specialty}
                              className="flex items-center gap-2"
                            >
                              <Checkbox
                                id={specialty}
                                checked={selectedSpecialties.includes(
                                  specialty,
                                )}
                                onCheckedChange={() =>
                                  toggleSpecialty(specialty)
                                }
                              />
                              <label
                                htmlFor={specialty}
                                className="text-sm cursor-pointer"
                              >
                                {specialty}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={() => setSelectedSpecialties([])}
                      >
                        필터 초기화
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>

                <Select
                  value={minRating}
                  onValueChange={(value) =>
                    setMinRating(value as typeof minRating)
                  }
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="후기 평점" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">후기 평점 전체</SelectItem>
                    <SelectItem value="4.5">4.5+</SelectItem>
                    <SelectItem value="4.0">4.0+</SelectItem>
                    <SelectItem value="3.5">3.5+</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distance">거리순</SelectItem>
                    <SelectItem value="rating">평점순</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === "map" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("map")}
                    className="rounded-none"
                  >
                    <MapIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                    className="rounded-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-4">
            <div>
              <h3
                id={viewMode === "map" ? "map-view" : undefined}
                className="text-base font-semibold scroll-mt-24"
              >
                {viewMode === "map" ? "지도 뷰" : "상담소 정보 카드"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {activeTab === "counseling"
                  ? "주변 아동 심리 상담소 위치"
                  : "주변 지역 아동센터 위치"}
              </p>
            </div>

            <div
              className={
                viewMode === "map"
                  ? "grid grid-cols-1 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {/* Map (DOM 유지: view 전환 시 언마운트 방지) */}
              <div
                className={[
                  "lg:col-span-2 relative h-[500px] lg:h-[600px] rounded-xl overflow-hidden border bg-muted",
                  viewMode === "map" ? "" : "hidden",
                ].join(" ")}
              >
                <div ref={mapRef} className="w-full h-full" />
                {!mapLoaded && !kakaoLoadError ? (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                    지도를 불러오는 중...
                  </div>
                ) : null}
                {kakaoLoadError ? (
                  <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-red-600 bg-background/80">
                    {kakaoLoadError}
                  </div>
                ) : null}
              </div>

              {viewMode === "map" ? (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  <div>
                    <h3
                      id="cards"
                      className="text-base font-semibold scroll-mt-24"
                    >
                      상담소 정보 카드
                    </h3>
                    {isLoadingActive ? (
                      <p className="text-sm text-muted-foreground mt-1">
                        JSON 데이터 불러오는 중...
                      </p>
                    ) : null}
                    {activeError && (
                      <p className="text-xs text-red-500 mt-2">
                        JSON 데이터를 불러오지 못했습니다. (샘플 데이터로
                        표시됩니다) - {activeError}
                      </p>
                    )}
                    {mapLoaded &&
                    markerableVisibleCount === 0 &&
                    !isLoadingActive &&
                    !activeError ? (
                      <p className="text-xs text-amber-600 mt-2">
                        표시할 좌표(위도/경도) 데이터가 없습니다. JSON
                        키/값(위도, 경도)을 확인해주세요.
                      </p>
                    ) : null}
                  </div>

                  {visibleCenters.map((center) => (
                    <CenterCard
                      key={center.id}
                      center={center}
                      isSelected={selectedCenter?.id === center.id}
                      onClick={() => handleCenterSelect(center)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3
                      id="cards"
                      className="text-base font-semibold scroll-mt-24"
                    >
                      상담소 정보 카드
                    </h3>
                    {isLoadingActive ? (
                      <p className="text-sm text-muted-foreground mt-1">
                        JSON 데이터 불러오는 중...
                      </p>
                    ) : null}
                    {activeError && (
                      <p className="text-xs text-red-500 mt-2">
                        JSON 데이터를 불러오지 못했습니다. (샘플 데이터로
                        표시됩니다) - {activeError}
                      </p>
                    )}
                    {mapLoaded &&
                    markerableVisibleCount === 0 &&
                    !isLoadingActive &&
                    !activeError ? (
                      <p className="text-xs text-amber-600 mt-2">
                        표시할 좌표(위도/경도) 데이터가 없습니다. JSON
                        키/값(위도, 경도)을 확인해주세요.
                      </p>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {visibleCenters.map((center) => (
                      <CenterCard
                        key={center.id}
                        center={center}
                        isSelected={selectedCenter?.id === center.id}
                        onClick={() => handleCenterSelect(center)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Center Detail */}
        {selectedCenter && (
          <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4 lg:hidden">
            <div className="container mx-auto">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{selectedCenter.name}</h3>
                    {selectedCenter.isOpen ? (
                      <Badge className="bg-green-100 text-green-700">
                        영업중
                      </Badge>
                    ) : (
                      <Badge variant="secondary">영업종료</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedCenter.address}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    {selectedCenter.reviewCount > 0 ? (
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {selectedCenter.rating}
                        <span className="text-muted-foreground">
                          ({selectedCenter.reviewCount})
                        </span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Star className="h-4 w-4" />
                        <span className="text-xs">평점 정보 없음</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Navigation className="h-4 w-4 text-muted-foreground" />
                      {selectedCenter.distance || "거리 정보 없음"}
                    </span>
                  </div>
                </div>
                <Button className="gap-2">
                  <Phone className="h-4 w-4" />
                  전화
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function CenterCard({
  center,
  isSelected,
  onClick,
}: {
  center: Center;
  isSelected: boolean;
  onClick: () => void;
}) {
  const homepageHref = center.homepageUrl;
  const phoneDigits = center.phone?.replace(/[^\d+]/g, "") ?? "";
  const telHref = /\d{5,}/.test(phoneDigits) ? `tel:${phoneDigits}` : undefined;
  const reservationHref =
    center.reservationUrl || (center.reservationText ? telHref : undefined);
  const fallbackHref =
    center.lat != null && center.lng != null
      ? `https://map.kakao.com/link/map/${encodeURIComponent(center.name)},${center.lat},${center.lng}`
      : center.address
        ? `https://map.kakao.com/link/search/${encodeURIComponent(center.address)}`
        : `https://map.kakao.com/link/search/${encodeURIComponent(center.name)}`;
  const linkHref = homepageHref || fallbackHref;
  const linkLabel = homepageHref ? "홈페이지로 이동" : "카카오맵에서 위치 보기";
  const visibleSpecialties = (center.specialties ?? []).slice(0, 6);
  const remainingSpecialties = Math.max(
    0,
    (center.specialties?.length ?? 0) - visibleSpecialties.length,
  );
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [rawQuery, setRawQuery] = useState("");
  const [rawKeysOnly, setRawKeysOnly] = useState(true);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const rawView = useMemo(() => {
    if (!detailsOpen || !center.raw) return { text: "", matches: 0 };
    const stripped = stripCoordinatesDeep(center.raw);
    const q = rawQuery.trim().toLowerCase();
    if (!q) return { text: JSON.stringify(stripped, null, 2), matches: 0 };
    const res = filterJsonDeep(stripped, q, rawKeysOnly);
    const emptyFallback = Array.isArray(stripped) ? [] : {};
    return {
      text: JSON.stringify(res?.filtered ?? emptyFallback, null, 2),
      matches: res?.matches ?? 0,
    };
  }, [detailsOpen, center.raw, rawQuery, rawKeysOnly]);

  const handleCopyRaw = async (e?: { stopPropagation?: () => void }) => {
    e?.stopPropagation?.();
    const text = rawView.text || "";
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage("복사됨");
    } catch {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        textarea.style.top = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopyMessage("복사됨");
      } catch {
        setCopyMessage("복사 실패");
      }
    } finally {
      window.setTimeout(() => setCopyMessage(null), 1500);
    }
  };
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{center.name}</h3>
              {center.isOpen ? (
                <Badge className="bg-green-100 text-green-700 text-xs">
                  영업중
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  영업종료
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{center.address}</span>
            </div>

            {center.phone ? (
              <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span>{center.phone}</span>
              </div>
            ) : null}

            {center.metaLines && center.metaLines.length > 0 ? (
              <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                {center.metaLines.map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </div>
            ) : null}

            {center.expertIntro ? (
              <div className="mt-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">전문가 소개</span>
                <span className="ml-2">
                  {truncate(center.expertIntro, 120)}
                </span>
              </div>
            ) : null}

            {center.reservationUrl || center.reservationText ? (
              <div className="mt-1 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">예약 링크</span>
                {reservationHref ? (
                  <a
                    href={reservationHref}
                    target={center.reservationUrl ? "_blank" : undefined}
                    rel={
                      center.reservationUrl ? "noopener noreferrer" : undefined
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="ml-2 text-primary hover:underline underline-offset-4"
                    aria-label="예약 링크"
                    title="예약 링크"
                  >
                    {center.reservationUrl
                      ? "예약 페이지"
                      : (center.reservationText ?? "전화 예약")}
                  </a>
                ) : (
                  <span className="ml-2">{center.reservationText}</span>
                )}
              </div>
            ) : null}

            <div className="flex items-center gap-4 mt-2 text-sm">
              {center.reviewCount > 0 ? (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{center.rating}</span>
                  <span className="text-muted-foreground">
                    ({center.reviewCount})
                  </span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Star className="h-4 w-4" />
                  <span className="text-xs">평점 정보 없음</span>
                </span>
              )}
              <span className="flex items-center gap-1 text-muted-foreground">
                <Navigation className="h-3 w-3" />
                {center.distance || "거리 정보 없음"}
              </span>
            </div>

            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{center.hours || "운영시간 정보 없음"}</span>
            </div>

            <div className="flex flex-wrap gap-1 mt-3">
              {visibleSpecialties.map((specialty) => (
                <Badge key={specialty} variant="outline" className="text-xs">
                  {specialty}
                </Badge>
              ))}
              {remainingSpecialties > 0 ? (
                <Badge variant="secondary" className="text-xs">
                  +{remainingSpecialties}
                </Badge>
              ) : null}
            </div>

            {center.intro ||
            center.programs ||
            center.applyMethod ||
            center.expertIntro ||
            center.reservationUrl ||
            center.reservationText ||
            center.raw ||
            (center.extras && center.extras.length > 0) ? (
              <details
                className="mt-3"
                onToggle={(e) => {
                  const open = (e.currentTarget as HTMLDetailsElement).open;
                  setDetailsOpen(open);
                  if (!open) setCopyMessage(null);
                }}
              >
                <summary className="text-sm text-primary cursor-pointer select-none">
                  시설 정보 더보기
                </summary>
                <div className="mt-2 space-y-3 text-sm text-muted-foreground">
                  {center.specialties && center.specialties.length > 0 ? (
                    <div>
                      <div className="text-xs font-medium text-foreground">
                        전문 분야
                      </div>
                      <div className="mt-1 whitespace-pre-line">
                        {center.specialties.join(", ")}
                      </div>
                    </div>
                  ) : null}
                  {center.intro ? (
                    <div>
                      <div className="text-xs font-medium text-foreground">
                        시설소개
                      </div>
                      <div className="mt-1 whitespace-pre-line">
                        {center.intro}
                      </div>
                    </div>
                  ) : null}
                  {center.programs ? (
                    <div>
                      <div className="text-xs font-medium text-foreground">
                        주요 프로그램
                      </div>
                      <div className="mt-1 whitespace-pre-line">
                        {center.programs}
                      </div>
                    </div>
                  ) : null}
                  {center.applyMethod ? (
                    <div>
                      <div className="text-xs font-medium text-foreground">
                        이용 신청 방법
                      </div>
                      <div className="mt-1 whitespace-pre-line">
                        {center.applyMethod}
                      </div>
                    </div>
                  ) : null}
                  {center.expertIntro ? (
                    <div>
                      <div className="text-xs font-medium text-foreground">
                        전문가 소개
                      </div>
                      <div className="mt-1 whitespace-pre-line">
                        {center.expertIntro}
                      </div>
                    </div>
                  ) : null}
                  {center.reservationUrl || center.reservationText ? (
                    <div>
                      <div className="text-xs font-medium text-foreground">
                        예약 링크
                      </div>
                      <div className="mt-1">
                        {reservationHref ? (
                          <a
                            href={reservationHref}
                            target={
                              center.reservationUrl ? "_blank" : undefined
                            }
                            rel={
                              center.reservationUrl
                                ? "noopener noreferrer"
                                : undefined
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="text-primary hover:underline underline-offset-4"
                          >
                            {center.reservationUrl
                              ? center.reservationUrl
                              : (center.reservationText ?? "전화 예약")}
                          </a>
                        ) : (
                          <span>{center.reservationText}</span>
                        )}
                      </div>
                    </div>
                  ) : null}
                  {center.extras && center.extras.length > 0 ? (
                    <div>
                      <div className="text-xs font-medium text-foreground">
                        추가 정보
                      </div>
                      <dl className="mt-1 space-y-1">
                        {center.extras.map((item, idx) => (
                          <div
                            key={`${item.label}-${idx}`}
                            className="grid grid-cols-[auto,1fr] gap-2"
                          >
                            <dt className="text-xs text-muted-foreground whitespace-nowrap">
                              {item.label}
                            </dt>
                            <dd className="text-xs text-muted-foreground break-words">
                              {item.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ) : null}
                  {center.raw ? (
                    <div>
                      <div className="text-xs font-medium text-foreground">
                        원본 데이터 (좌표 제외)
                      </div>
                      {detailsOpen ? (
                        <>
                          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                            <Input
                              value={rawQuery}
                              onChange={(e) => setRawQuery(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              placeholder={
                                rawKeysOnly
                                  ? "키 검색 (예: 기본정보, 운영시간)"
                                  : "키/값 검색 (예: 운영시간, 전화번호)"
                              }
                              className="h-8 text-xs"
                            />
                            <div
                              className="flex items-center gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Checkbox
                                id={`${center.id}-raw-keys-only`}
                                checked={rawKeysOnly}
                                onCheckedChange={(v) =>
                                  setRawKeysOnly(v === true)
                                }
                              />
                              <label
                                htmlFor={`${center.id}-raw-keys-only`}
                                className="text-xs text-muted-foreground select-none cursor-pointer"
                              >
                                키만
                              </label>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              className="h-8 px-3 text-xs bg-transparent"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRawQuery("");
                              }}
                            >
                              초기화
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="h-8 px-3 text-xs bg-transparent"
                              onClick={handleCopyRaw}
                            >
                              복사
                            </Button>
                            {copyMessage ? (
                              <span className="text-xs text-muted-foreground">
                                {copyMessage}
                              </span>
                            ) : null}
                          </div>
                          {rawQuery.trim() ? (
                            <div className="text-xs text-muted-foreground">
                              {rawView.matches > 0
                                ? `일치 ${rawView.matches}개`
                                : "일치 항목 없음"}
                            </div>
                          ) : null}
                          <pre className="mt-2 max-h-80 overflow-auto rounded-md border bg-muted/30 p-3 text-xs text-foreground whitespace-pre-wrap break-words">
                            {rawView.text}
                          </pre>
                        </>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </details>
            ) : null}
          </div>

          <a
            href={linkHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1 rounded hover:bg-muted transition-colors flex-shrink-0"
            aria-label={linkLabel}
            title={linkLabel}
          >
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
