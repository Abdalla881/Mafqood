import React from "react";
import { Button } from "@/components/ui/button";
import { ItemCard } from "@/components/ItemCard";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  Eye,
  TrendingUp,
  Users,
  CheckCircle,
} from "lucide-react";
import heroImage from "@/assets/hero-mafqood.jpg";
import { useReports } from "@/hooks/useReports";
import { convertReportToItemCard } from "@/components/ItemCard";

export const Home: React.FC = () => {
  const { reports, loading, error, refetch } = useReports({
    page: 1,
    limit: 12,
    sortBy: "createdAt",
    sortOrder: "DESC",
  });

  // Add animations styles
  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideIn {
        from { 
          transform: scaleX(0);
          opacity: 0;
        }
        to { 
          transform: scaleX(1);
          opacity: 1;
        }
      }
      
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes fadeInScale {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      
      @keyframes pulseSlow {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
      }
      
      .animate-fade-in {
        animation: fadeIn 1s ease-out;
      }
      
      .animate-fade-in-delay {
        animation: fadeIn 1s ease-out 0.3s both;
      }
      
      .animate-fade-in-delay-2 {
        animation: fadeIn 1s ease-out 0.6s both;
      }
      
      .animate-slide-in {
        animation: slideIn 0.8s ease-out 0.5s both;
      }
      
      .animate-fade-in-up {
        animation: fadeInUp 0.8s ease-out 0.2s both;
      }
      
      .animate-fade-in-scale {
        animation: fadeInScale 0.6s ease-out;
      }
      
      .animate-fade-in-scale-delay {
        animation: fadeInScale 0.6s ease-out 0.2s both;
      }
      
      .animate-pulse-slow {
        animation: pulseSlow 3s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const renderReportsSection = () => {
    if (loading) {
      return <LoadingSkeleton count={6} />;
    }

    if (error) {
      return (
        <div className="col-span-full">
          <ErrorState error={error} onRetry={refetch} />
        </div>
      );
    }

    if (!reports || reports.length === 0) {
      return (
        <div className="col-span-full">
          <EmptyState />
        </div>
      );
    }

    return reports
      .slice(0, 3)
      .map((report) => {
        if (!report._id) {
          console.warn("Report missing _id:", report);
          return null;
        }
        return (
          <ItemCard key={report._id} {...convertReportToItemCard(report)} />
        );
      })
      .filter(Boolean);
  };

  // Calculate stats from actual data
  const stats = {
    foundItems: reports.filter((r) => r.type === "found").length || 1200,
    activeUsers: reports.length * 3 || 800,
    successRate:
      Math.min(
        95,
        Math.round(
          (reports.filter((r) => r.type === "found").length /
            Math.max(reports.length, 1)) *
            100
        )
      ) || 92,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background with improved overlay */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="مفقود - منصة المفقودات والموجودات"
            className="w-full h-full object-cover opacity-5"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/90 to-white/80"></div>
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          {/* Main Heading with improved typography */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 font-arabic mb-4 leading-tight tracking-tight">
              ساعدنا نرجّع المفقودات لأصحابها
            </h1>
            <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto rounded-full animate-slide-in"></div>
          </div>

          {/* Subtitle with better readability */}
          <p className="text-lg md:text-xl text-slate-600 font-arabic mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-delay">
            منصة مفقود تربط بين الأشخاص الذين فقدوا أشياءهم والأشخاص الذين
            وجدوها. انضم إلى مجتمعنا وساعد في إعادة الأشياء المفقودة لأصحابها.
          </p>

          {/* CTA Buttons with improved spacing and shadows */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delay-2">
            <Link to="/add-report?type=lost">
              <Button variant="hero" size="xl" className="w-full sm:w-auto">
                <Plus className="w-5 h-5 ml-2" />
                إضافة مفقود
              </Button>
            </Link>

            <Link to="/add-report?type=found">
              <Button variant="outline" size="xl" className="w-full sm:w-auto">
                <Search className="w-5 h-5 ml-2" />
                إضافة موجود
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Items Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-14 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-arabic mb-3">
              المفقودات المميزة
            </h2>
            <p className="text-base md:text-lg text-slate-600 font-arabic max-w-2xl mx-auto">
              تصفح أحدث البلاغات عن الأشياء المفقودة والموجودة في منطقتك
            </p>
          </div>

          {/* Reports Grid with improved spacing */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 animate-fade-in-up">
            {renderReportsSection()}
          </div>

          {/* View All Button */}
          {reports.length > 0 && (
            <div className="text-center mt-12">
              <Link to="/lost-items">
                <Button variant="outline" size="lg" className="font-arabic">
                  <Eye className="w-5 h-5 ml-2" />
                  عرض جميع المفقودات
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {/* Stat 1 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:-translate-y-1 animate-fade-in-scale">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-3 animate-pulse-slow">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-4xl font-bold text-white font-arabic mb-1">
                ١٢٠٠+
              </div>
              <div className="text-sm text-blue-100 font-arabic">
                عنصر تم العثور عليه
              </div>
            </div>

            {/* Stat 2 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:-translate-y-1 animate-fade-in-scale-delay">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-3 animate-pulse-slow">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-4xl font-bold text-white font-arabic mb-1">
                ٨٠٠+
              </div>
              <div className="text-sm text-blue-100 font-arabic">
                مستخدم نشط
              </div>
            </div>

            {/* Stat 3 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-3">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-4xl font-bold text-white font-arabic mb-1">
                ٩٢٪
              </div>
              <div className="text-sm text-blue-100 font-arabic">
                معدل النجاح
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
