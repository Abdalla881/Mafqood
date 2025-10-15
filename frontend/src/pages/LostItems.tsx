import React, { useState, useMemo, useCallback } from "react";
import { ItemCard } from "@/components/ItemCard";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Grid,
  List,
  RefreshCw,
  X,
  SlidersHorizontal,
  MapPin,
  Tag,
  Layers,
} from "lucide-react";
import { useReports } from "@/hooks/useReports";
import { useCategories } from "@/hooks/useCategories";
import { convertReportToItemCard } from "@/components/ItemCard";

type ViewMode = "grid" | "list";
type ReportType = "all" | "lost" | "found";

export const LostItems: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedType, setSelectedType] = useState<ReportType>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

  const {
    reports,
    loading: reportsLoading,
    error: reportsError,
    meta,
    refetch: refetchReports,
  } = useReports({
    page,
    limit: 12,
    search: searchTerm || undefined,
    sortBy: "createdAt",
    sortOrder,
  });

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useCategories();

  // Get unique locations from reports
  const locations = useMemo(() => {
    if (!Array.isArray(reports)) return [];

    const uniqueLocations = new Set<string>();
    reports.forEach((report) => {
      if (report.location) {
        uniqueLocations.add(report.location);
      }
    });

    return Array.from(uniqueLocations)
      .sort()
      .map((location) => ({
        value: location,
        label: location,
      }));
  }, [reports]);

  // Filter reports based on all criteria
  const filteredItems = useMemo(() => {
    if (!Array.isArray(reports)) return [];
    // Server handles search + sort; we still apply client filters for category/location/type if present
    return reports.filter((report) => {
      if (!report._id || !report.title) return false;

      const matchesCategory =
        selectedCategory === "all" ||
        report.item?.category?.name === selectedCategory;
      const matchesLocation =
        selectedLocation === "all" || report.location === selectedLocation;
      const matchesType =
        selectedType === "all" || report.type === selectedType;
      return matchesCategory && matchesLocation && matchesType;
    });
  }, [reports, selectedCategory, selectedLocation, selectedType]);

  // Reset page when search changes
  React.useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCategory, selectedLocation, selectedType, sortOrder]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedLocation("all");
    setSelectedType("all");
  }, []);

  // Handle retry for both reports and categories
  const handleRetry = useCallback(() => {
    refetchReports();
    refetchCategories();
  }, [refetchReports, refetchCategories]);

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      searchTerm !== "" ||
      selectedCategory !== "all" ||
      selectedLocation !== "all" ||
      selectedType !== "all"
    );
  }, [searchTerm, selectedCategory, selectedLocation, selectedType]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredItems.length;
    const lost = filteredItems.filter((r) => r.type === "lost").length;
    const found = filteredItems.filter((r) => r.type === "found").length;
    const withReward = filteredItems.filter((r) => r.reward).length;

    return { total, lost, found, withReward };
  }, [filteredItems]);

  const isLoading = reportsLoading || categoriesLoading;
  const hasError = reportsError || categoriesError;

  // Error State
  if (hasError && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 font-arabic mb-3">
              المفقودات والموجودات
            </h1>
            <p className="text-lg text-slate-600 font-arabic">
              تصفح وابحث عن الأشياء المفقودة والموجودة في جميع أنحاء مصر
            </p>
          </div>
          <ErrorState
            error={
              reportsError || categoriesError || "حدث خطأ في تحميل البيانات"
            }
            onRetry={handleRetry}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 font-arabic mb-3">
            المفقودات والموجودات
          </h1>
          <p className="text-base md:text-lg text-slate-600 font-arabic">
            تصفح وابحث عن الأشياء المفقودة والموجودة في جميع أنحاء مصر
          </p>
        </div>

        {/* Quick Stats */}
        {!isLoading && reports.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary font-arabic">
                  {stats.total}
                </div>
                <div className="text-sm text-muted-foreground font-arabic">
                  إجمالي النتائج
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-500 font-arabic">
                  {stats.lost}
                </div>
                <div className="text-sm text-muted-foreground font-arabic">
                  مفقود
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-500 font-arabic">
                  {stats.found}
                </div>
                <div className="text-sm text-muted-foreground font-arabic">
                  موجود
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-amber-500 font-arabic">
                  {stats.withReward}
                </div>
                <div className="text-sm text-muted-foreground font-arabic">
                  بمكافأة
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters Section */}
        <Card className="mb-6 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-4 md:p-6">
            {/* Mobile Filter Toggle */}
            <div className="flex items-center justify-between mb-4 md:hidden">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="font-arabic"
              >
                <SlidersHorizontal className="w-4 h-4 ml-2" />
                {showFilters ? "إخفاء الفلاتر" : "إظهار الفلاتر"}
              </Button>

              {hasActiveFilters && (
                <Badge variant="secondary" className="font-arabic">
                  فلاتر نشطة
                </Badge>
              )}
            </div>

            {/* Filters Content */}
            <div className={`${showFilters ? "block" : "hidden md:block"}`}>
              <div className="flex flex-col gap-4">
                {/* First Row - Search, Type, Sort */}
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      placeholder="ابحث عن المفقودات..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-11 h-11 border-slate-200 focus:border-primary focus:ring-primary font-arabic bg-white"
                    />
                    {searchTerm && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSearchTerm("")}
                        className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Type Filter */}
                  <Select
                    value={selectedType}
                    onValueChange={(value) =>
                      setSelectedType(value as ReportType)
                    }
                  >
                    <SelectTrigger className="w-full md:w-48 h-11 font-arabic border-slate-200 bg-white">
                      <Layers className="w-4 h-4 ml-2 text-slate-400" />
                      <SelectValue placeholder="نوع البلاغ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="font-arabic">
                        جميع الأنواع
                      </SelectItem>
                      <SelectItem value="lost" className="font-arabic">
                        مفقود فقط
                      </SelectItem>
                      <SelectItem value="found" className="font-arabic">
                        موجود فقط
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Sort Order */}
                  <Select
                    value={sortOrder}
                    onValueChange={(value) =>
                      setSortOrder(value as "ASC" | "DESC")
                    }
                  >
                    <SelectTrigger className="w-full md:w-48 h-11 font-arabic border-slate-200 bg-white">
                      <SlidersHorizontal className="w-4 h-4 ml-2 text-slate-400" />
                      <SelectValue placeholder="ترتيب التاريخ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DESC" className="font-arabic">
                        الأحدث أولاً
                      </SelectItem>
                      <SelectItem value="ASC" className="font-arabic">
                        الأقدم أولاً
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Second Row - Category, Location, Actions */}
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Category Filter */}
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                    disabled={categoriesLoading}
                  >
                    <SelectTrigger className="w-full md:w-52 h-11 font-arabic border-slate-200 bg-white">
                      <Tag className="w-4 h-4 ml-2 text-slate-400" />
                      <SelectValue
                        placeholder={
                          categoriesLoading ? "جاري التحميل..." : "الفئة"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="font-arabic">
                        جميع الفئات
                      </SelectItem>
                      {Array.isArray(categories) &&
                        categories.map((category) => (
                          <SelectItem
                            key={category._id}
                            value={category.name}
                            className="font-arabic"
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  {/* Location Filter */}
                  <Select
                    value={selectedLocation}
                    onValueChange={setSelectedLocation}
                    disabled={locations.length === 0}
                  >
                    <SelectTrigger className="w-full md:w-52 h-11 font-arabic border-slate-200 bg-white">
                      <MapPin className="w-4 h-4 ml-2 text-slate-400" />
                      <SelectValue placeholder="المنطقة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="font-arabic">
                        جميع المناطق
                      </SelectItem>
                      {locations.map((location) => (
                        <SelectItem
                          key={location.value}
                          value={location.value}
                          className="font-arabic"
                        >
                          {location.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {/* Clear Filters */}
                    {hasActiveFilters && (
                      <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="font-arabic h-11 flex-1 md:flex-none border-slate-200 hover:border-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                      >
                        <X className="w-4 h-4 ml-2" />
                        مسح
                      </Button>
                    )}

                    {/* Refresh Button */}
                    <Button
                      variant="outline"
                      onClick={handleRetry}
                      disabled={isLoading}
                      className="font-arabic h-11 flex-1 md:flex-none border-slate-200 hover:border-green-500 hover:bg-green-50 hover:text-green-700 transition-colors"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ml-2 ${
                          isLoading ? "animate-spin" : ""
                        }`}
                      />
                      <span className="hidden md:inline">تحديث</span>
                    </Button>

                    {/* View Mode Toggle - Desktop only */}
                    <div className="hidden md:flex border border-slate-200 rounded-lg bg-slate-50 p-1">
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="icon"
                        onClick={() => setViewMode("grid")}
                        className="rounded-r-md rounded-l-none h-9 w-9"
                        title="عرض شبكي"
                      >
                        <Grid className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="icon"
                        onClick={() => setViewMode("list")}
                        className="rounded-l-md rounded-r-none h-9 w-9"
                        title="عرض قائمة"
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
                    {searchTerm && (
                      <Badge variant="secondary" className="font-arabic">
                        البحث: {searchTerm}
                        <button
                          onClick={() => setSearchTerm("")}
                          className="mr-2 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {selectedCategory !== "all" && (
                      <Badge variant="secondary" className="font-arabic">
                        {selectedCategory}
                        <button
                          onClick={() => setSelectedCategory("all")}
                          className="mr-2 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {selectedLocation !== "all" && (
                      <Badge variant="secondary" className="font-arabic">
                        {selectedLocation}
                        <button
                          onClick={() => setSelectedLocation("all")}
                          className="mr-2 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {selectedType !== "all" && (
                      <Badge variant="secondary" className="font-arabic">
                        {selectedType === "lost" ? "مفقود" : "موجود"}
                        <button
                          onClick={() => setSelectedType("all")}
                          className="mr-2 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {isLoading ? (
          <LoadingSkeleton count={6} />
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 md:py-20">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 md:w-12 md:h-12 text-slate-400" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 font-arabic mb-3">
              لا توجد نتائج
            </h3>
            <p className="text-slate-600 font-arabic mb-6 max-w-md mx-auto text-sm md:text-base">
              {hasActiveFilters
                ? "لم نتمكن من العثور على أي عناصر تطابق معايير البحث الخاصة بك"
                : "لا توجد بلاغات متاحة حالياً"}
            </p>
            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                variant="outline"
                className="font-arabic border-2 hover:border-primary hover:bg-primary/10 hover:text-primary"
              >
                <Filter className="w-4 h-4 ml-2" />
                مسح جميع الفلاتر
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
              <p className="text-slate-600 font-arabic text-sm md:text-base">
                صفحة{" "}
                <span className="font-semibold text-slate-900">
                  {meta?.page ?? 1}
                </span>{" "}
                من
                <span className="font-semibold text-slate-900">
                  {" "}
                  {meta?.totalPages ?? 1}
                </span>
                — إجمالي{" "}
                <span className="font-semibold text-slate-900">
                  {meta?.total ?? filteredItems.length}
                </span>{" "}
                بلاغ
              </p>

              {/* Sort order toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 font-arabic">
                  الترتيب:
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSortOrder((p) => (p === "DESC" ? "ASC" : "DESC"))
                  }
                  className="font-arabic"
                >
                  {sortOrder === "DESC" ? "الأحدث أولاً" : "الأقدم أولاً"}
                </Button>
              </div>
            </div>

            {/* Items Grid/List */}
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
                  : "space-y-4"
              }
            >
              {filteredItems.map((report) => (
                <ItemCard
                  key={report._id}
                  {...convertReportToItemCard(report)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-center mt-8 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={meta.page <= 1}
                  className="font-arabic"
                >
                  السابق
                </Button>
                <span className="text-sm text-slate-600 font-arabic">
                  {meta.page} / {meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() =>
                    setPage((p) => Math.min(meta.totalPages, p + 1))
                  }
                  disabled={meta.page >= meta.totalPages}
                  className="font-arabic"
                >
                  التالي
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
