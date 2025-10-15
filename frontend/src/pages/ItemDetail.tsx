import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Calendar,
  User,
  Phone,
  MessageCircle,
  ArrowRight,
  Gift,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ItemDetailType {
  id: string;
  title: string;
  description: string;
  category?: string;
  location?: string;
  date?: string;
  type?: "lost" | "found";
  contactPhone?: string;
  images?: string[];
  reporterName?: string;
  reporterEmail?: string;
  reward?: string;
  createdAt?: string;
}

const API_BASE_URL = `${
  (
    import.meta as unknown as { env?: Record<string, string> }
  )?.env?.VITE_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000"
}/api/${
  (import.meta as unknown as { env?: Record<string, string> })?.env
    ?.VITE_API_VERSION || "v1"
}`;

export const ItemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [item, setItem] = useState<ItemDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const isOwner =
    !!user && !!item?.reporterEmail && user.email === item.reporterEmail;

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) {
        setError("معرف البلاغ غير صالح");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/reports/${id}`);

        if (!response.ok) {
          throw new Error(
            response.status === 404 ? "البلاغ غير موجود" : "فشل تحميل البيانات"
          );
        }

        const data = await response.json();
        const report = data.data?.report;

        if (!report) {
          throw new Error("البيانات غير صحيحة");
        }

        // Extract images safely - handle both array of objects and strings
        const images =
          report.item?.images?.map((img: unknown) => {
            if (typeof img === "string") return img;
            if (
              img &&
              typeof img === "object" &&
              "url" in (img as Record<string, unknown>) &&
              typeof (img as { url?: unknown }).url === "string"
            ) {
              return (img as { url: string }).url;
            }
            return "";
          }) || [];

        setItem({
          id: report._id,
          title: report.title,
          description: report.item?.description || "لا يوجد وصف",
          category: report.item?.category?.name || "غير محدد",
          location: report.location,
          date: report.date,
          type: report.type,
          contactPhone: report.contactInfo,
          images: images,
          reporterName: report.reporter?.name,
          reporterEmail: report.reporter?.email,
          reward: report.reward,
          createdAt: report.createdAt,
        });
      } catch (error: unknown) {
        console.error("Error fetching item:", error);
        const message =
          typeof error === "object" && error && "message" in error
            ? String((error as { message?: unknown }).message)
            : "حدث خطأ أثناء تحميل البيانات";
        setError(message);
        toast({
          title: "خطأ",
          description: message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    setMounted(true);
    fetchItem();
  }, [id, toast]);

  const handleContact = () => {
    if (!user) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يجب تسجيل الدخول للتواصل مع صاحب البلاغ",
        variant: "destructive",
      });
      navigate("/auth/login", { state: { from: `/report/${id}` } });
      return;
    }

    // TODO: Implement actual messaging system
    toast({
      title: "قريباً",
      description: "سيتم إضافة نظام المراسلة قريباً",
    });
  };

  const handleMatch = () => {
    if (!user) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يجب تسجيل الدخول للإبلاغ عن مطابقة",
        variant: "destructive",
      });
      navigate("/auth/login", { state: { from: `/report/${id}` } });
      return;
    }

    // TODO: Implement match system
    navigate("/match-chat", { state: { reportId: id } });
  };

  const nextImage = () => {
    if (item?.images && item.images.length > 1) {
      setImageLoading(true);
      setCurrentImageIndex((prev) =>
        prev === item.images!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (item?.images && item.images.length > 1) {
      setImageLoading(true);
      setCurrentImageIndex((prev) =>
        prev === 0 ? item.images!.length - 1 : prev - 1
      );
    }
  };

  const formatPhoneNumber = (phone?: string) => {
    if (!phone) return "";
    // Format: 0100-123-4567
    return phone.replace(/(\d{4})(\d{3})(\d{4})/, "$1-$2-$3");
  };

  // Loading State
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground font-arabic">
                جاري التحميل...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !item) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground font-arabic mb-2">
                {error || "العنصر غير موجود"}
              </h1>
              <p className="text-muted-foreground font-arabic mb-6">
                عذراً، لم نتمكن من العثور على البلاغ المطلوب
              </p>
              <Button onClick={() => navigate("/")} variant="default">
                <ArrowRight className="w-4 h-4 ml-2" />
                العودة للرئيسية
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentImage =
    item.images?.[currentImageIndex] ||
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        .anim-fade-up { animation: fadeInUp 500ms ease-out both; }
        .anim-fade-up-delayed { animation: fadeInUp 600ms ease-out 120ms both; }
        .anim-scale-in { animation: scaleIn 400ms ease-out both; }
      `}</style>

      <div className="container mx-auto px-4 py-10 max-w-6xl">
        {/* Header */}
        <div
          className={`flex items-center justify-between mb-8 ${
            mounted ? "anim-fade-up" : ""
          }`}
        >
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="font-arabic hover:bg-muted"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            رجوع
          </Button>

          <div className="flex items-center gap-2">
            <Badge
              variant={item.type === "lost" ? "destructive" : "default"}
              className="font-arabic text-sm"
            >
              {item.type === "lost" ? "مفقود" : "موجود"}
            </Badge>
            {item.reward && (
              <Badge className="bg-amber-500 hover:bg-amber-600 font-arabic text-sm">
                <Gift className="w-3 h-3 ml-1" />
                مكافأة
              </Badge>
            )}
          </div>
        </div>

        <div
          className={`grid lg:grid-cols-2 gap-8 ${
            mounted ? "anim-fade-up-delayed" : ""
          }`}
        >
          {/* Image Gallery Section */}
          <div className="space-y-4">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted group shadow-xl anim-scale-in">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}

              <img
                src={currentImage}
                alt={`${item.title} - صورة ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
                onLoad={() => setImageLoading(false)}
                onError={(e) => {
                  setImageLoading(false);
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop";
                }}
              />

              {/* Image Navigation */}
              {item.images && item.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={prevImage}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={nextImage}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>

                  {/* Image Counter */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-arabic">
                    {currentImageIndex + 1} / {item.images.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {item.images && item.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {item.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setImageLoading(true);
                      setCurrentImageIndex(index);
                    }}
                    className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? "border-primary scale-105"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`صورة مصغرة ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground font-arabic mb-4 leading-tight">
                {item.title}
              </h1>
              <p className="text-muted-foreground font-arabic leading-relaxed text-lg">
                {item.description}
              </p>
            </div>

            <Separator />

            {/* Item Info */}
            <div className="space-y-4">
              {item.location && (
                <div className="flex items-start text-muted-foreground">
                  <MapPin className="w-5 h-5 ml-3 text-primary flex-shrink-0 mt-0.5" />
                  <span className="font-arabic">{item.location}</span>
                </div>
              )}

              {item.date && (
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="w-5 h-5 ml-3 text-primary flex-shrink-0" />
                  <span className="font-arabic">
                    {new Date(item.date).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}

              {item.reporterName && (
                <div className="flex items-center text-muted-foreground">
                  <User className="w-5 h-5 ml-3 text-primary flex-shrink-0" />
                  <span className="font-arabic">{item.reporterName}</span>
                </div>
              )}

              {item.contactPhone && user && (
                <div className="flex items-center text-muted-foreground">
                  <Phone className="w-5 h-5 ml-3 text-primary flex-shrink-0" />
                  <a
                    href={`tel:${item.contactPhone}`}
                    className="font-arabic hover:text-primary transition-colors"
                    dir="ltr"
                  >
                    {formatPhoneNumber(item.contactPhone)}
                  </a>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-3">
              {item.category && (
                <Badge variant="secondary" className="font-arabic">
                  {item.category}
                </Badge>
              )}
              {item.reward && (
                <Badge
                  variant="outline"
                  className="font-arabic text-amber-600 border-amber-600"
                >
                  <Gift className="w-3 h-3 ml-1" />
                  مكافأة: {item.reward}
                </Badge>
              )}
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-3">
              {isOwner ? (
                <Button
                  onClick={() => navigate("/profile")}
                  className="w-full font-arabic"
                  size="lg"
                >
                  تعديل البلاغ
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleContact}
                    className="w-full font-arabic"
                    size="lg"
                  >
                    <MessageCircle className="w-5 h-5 ml-2" />
                    تواصل مع صاحب البلاغ
                  </Button>

                  <Button
                    onClick={handleMatch}
                    variant="outline"
                    className="w-full font-arabic"
                    size="lg"
                  >
                    إبلاغ عن مطابقة
                  </Button>

                  {!user && (
                    <p className="text-sm text-muted-foreground text-center font-arabic bg-muted p-3 rounded-lg">
                      <AlertCircle className="w-4 h-4 inline ml-1" />
                      يجب تسجيل الدخول للتواصل
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info Card */}
        {!isOwner && (
          <Card className="mt-10 border-0 shadow-2xl anim-fade-up-delayed rounded-2xl">
            <CardHeader>
              <CardTitle className="font-arabic text-xl">
                معلومات إضافية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6 text-base">
                <div className="flex justify-between">
                  <span className="font-semibold text-muted-foreground font-arabic">
                    رقم البلاغ:
                  </span>
                  <span className="font-arabic text-foreground">
                    #{item.id.slice(-8)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-muted-foreground font-arabic">
                    حالة البلاغ:
                  </span>
                  <Badge
                    variant="outline"
                    className="font-arabic text-green-600 border-green-600"
                  >
                    نشط
                  </Badge>
                </div>
                {item.createdAt && (
                  <div className="flex justify-between md:col-span-2">
                    <span className="font-semibold text-muted-foreground font-arabic">
                      تاريخ الإنشاء:
                    </span>
                    <span className="font-arabic text-foreground">
                      {new Date(item.createdAt).toLocaleDateString("ar-EG", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
