"use client"

import { useSearchParams } from "next/navigation"

import { useState, useEffect, useRef } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  ChevronRight
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

declare global {
  interface Window {
    kakao: any
  }
}

interface Center {
  id: string
  name: string
  address: string
  phone: string
  hours: string
  rating: number
  reviewCount: number
  distance: string
  specialties: string[]
  lat: number
  lng: number
  isOpen: boolean
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
    isOpen: true
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
    lat: 37.5000,
    lng: 127.0400,
    isOpen: true
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
    lat: 37.4950,
    lng: 127.0300,
    isOpen: false
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
    lat: 37.5100,
    lng: 127.0600,
    isOpen: true
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
    lat: 37.5150,
    lng: 127.0700,
    isOpen: true
  }
]

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
    isOpen: true
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
    lat: 37.5080,
    lng: 127.0485,
    isOpen: true
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
    isOpen: false
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
    lat: 37.5070,
    lng: 127.0980,
    isOpen: true
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
    lat: 37.5460,
    lng: 127.1362,
    isOpen: true
  }
]

const counselingSpecialtyOptions = [
  "놀이치료",
  "미술치료",
  "언어치료",
  "발달검사",
  "가족치료",
  "부모상담",
  "ADHD",
  "감각통합",
  "인지치료"
]

const childCenterSpecialtyOptions = [
  "방과후돌봄",
  "학습지원",
  "급식지원",
  "정서지원",
  "문화체험",
  "진로체험",
  "발달검사",
  "언어재활",
  "놀이활동"
]

export default function CounselingPage() {
  const [activeTab, setActiveTab] = useState<"counseling" | "child">("counseling")
  const [viewMode, setViewMode] = useState<"map" | "list">("map")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null)
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("distance")
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  const centers = activeTab === "counseling" ? counselingCenters : childCenters
  const availableSpecialties =
    activeTab === "counseling"
      ? counselingSpecialtyOptions
      : childCenterSpecialtyOptions
  const centerLabel = activeTab === "counseling" ? "상담소" : "아동센터"
  const specialtyLabel = activeTab === "counseling" ? "전문 분야" : "프로그램"

  useEffect(() => {
    async function loadKakaoMap() {
      try {
        const response = await fetch("/api/kakao-map-key")
        const data = await response.json()
        
        if (data.apiKey) {
          const script = document.createElement("script")
          script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${data.apiKey}&autoload=false`
          script.async = true
          document.head.appendChild(script)

          script.onload = () => {
            window.kakao.maps.load(() => {
              setMapLoaded(true)
            })
          }
        }
      } catch (error) {
        console.error("Failed to load Kakao Map:", error)
      }
    }
    
    loadKakaoMap()
  }, [])

  useEffect(() => {
    if (mapLoaded && mapRef.current && !mapInstanceRef.current) {
      const options = {
        center: new window.kakao.maps.LatLng(37.5065, 127.0536),
        level: 5
      }
      
      const map = new window.kakao.maps.Map(mapRef.current, options)
      mapInstanceRef.current = map

      // Add zoom control
      const zoomControl = new window.kakao.maps.ZoomControl()
      map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT)
    }
  }, [mapLoaded])

  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) {
      return
    }

    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    centers.forEach(center => {
      const markerPosition = new window.kakao.maps.LatLng(center.lat, center.lng)
      const marker = new window.kakao.maps.Marker({
        position: markerPosition
      })
      marker.setMap(mapInstanceRef.current)
      markersRef.current.push(marker)

      window.kakao.maps.event.addListener(marker, "click", () => {
        setSelectedCenter(center)
      })
    })

    if (centers.length > 0) {
      mapInstanceRef.current.setCenter(
        new window.kakao.maps.LatLng(centers[0].lat, centers[0].lng)
      )
    }
  }, [mapLoaded, centers])

  useEffect(() => {
    setSelectedCenter(null)
    setSelectedSpecialties([])
  }, [activeTab])

  const filteredCenters = centers
    .filter(center => {
      const matchesSearch = center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        center.address.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesSpecialties = selectedSpecialties.length === 0 ||
        selectedSpecialties.some(s => center.specialties.includes(s))
      return matchesSearch && matchesSpecialties
    })
    .sort((a, b) => {
      if (sortBy === "distance") {
        return parseFloat(a.distance) - parseFloat(b.distance)
      } else if (sortBy === "rating") {
        return b.rating - a.rating
      }
      return 0
    })

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties(prev =>
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Search Header */}
        <div className="bg-card border-b">
          <div className="container mx-auto px-4 py-4">
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as "counseling" | "child")}
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
                  placeholder="센터 이름 또는 주소 검색"
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
                          {availableSpecialties.map(specialty => (
                            <div key={specialty} className="flex items-center gap-2">
                              <Checkbox
                                id={specialty}
                                checked={selectedSpecialties.includes(specialty)}
                                onCheckedChange={() => toggleSpecialty(specialty)}
                              />
                              <label htmlFor={specialty} className="text-sm cursor-pointer">
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
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          {viewMode === "map" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map */}
              <div className="lg:col-span-2 h-[500px] lg:h-[600px] rounded-xl overflow-hidden border bg-muted">
                <div ref={mapRef} className="w-full h-full" />
              </div>

              {/* Sidebar */}
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                <p className="text-sm text-muted-foreground">
                  {filteredCenters.length}개의 {centerLabel}
                </p>
                
                {filteredCenters.map(center => (
                  <CenterCard
                    key={center.id}
                    center={center}
                    isSelected={selectedCenter?.id === center.id}
                    onClick={() => setSelectedCenter(center)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {filteredCenters.length}개의 {centerLabel}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCenters.map(center => (
                  <CenterCard
                    key={center.id}
                    center={center}
                    isSelected={selectedCenter?.id === center.id}
                    onClick={() => setSelectedCenter(center)}
                  />
                ))}
              </div>
            </div>
          )}
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
                      <Badge className="bg-green-100 text-green-700">영업중</Badge>
                    ) : (
                      <Badge variant="secondary">영업종료</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{selectedCenter.address}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {selectedCenter.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Navigation className="h-4 w-4 text-muted-foreground" />
                      {selectedCenter.distance}
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
  )
}

function CenterCard({ 
  center, 
  isSelected, 
  onClick 
}: { 
  center: Center
  isSelected: boolean
  onClick: () => void 
}) {
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
                <Badge className="bg-green-100 text-green-700 text-xs">영업중</Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">영업종료</Badge>
              )}
            </div>
            
            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{center.address}</span>
            </div>
            
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{center.rating}</span>
                <span className="text-muted-foreground">({center.reviewCount})</span>
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Navigation className="h-3 w-3" />
                {center.distance}
              </span>
            </div>

            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{center.hours}</span>
            </div>
            
            <div className="flex flex-wrap gap-1 mt-3">
              {center.specialties.map(specialty => (
                <Badge key={specialty} variant="outline" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>
          
          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  )
}
