import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Eye, ImageIcon, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import { ItemCardData } from "@/types/report";
import { formatArabicDate } from "@/utils/reportUtils";

type ItemCardProps = ItemCardData;

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop";

/**
 * Converts API report response to ItemCard props format
 * @param report - Report object from API
 * @returns ItemCardData object
 */
export const convertReportToItemCard = (report: any): ItemCardData => {
  // Extract image URL safely - handle both array of objects and array of strings
  const imageUrl =
    report.item?.images?.[0]?.url || report.item?.images?.[0] || DEFAULT_IMAGE;

  return {
    id: report._id,
    title: report.title,
    description: report.item?.description || "لا يوجد وصف",
    category: report.item?.category?.name || "غير محدد",
    location: report.location || "غير محدد",
    date: report.date || report.createdAt,
    image: imageUrl,
    type: report.type as "lost" | "found",
    reward: report.reward,
  };
};

/**
 * ItemCard Component - Displays a card for lost/found items
 */
export const ItemCard: React.FC<ItemCardProps> = ({
  id,
  title,
  description,
  category,
  location,
  date,
  image,
  type,
  reward,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const badgeConfig = {
    lost: {
      text: "مفقود",
      className: "bg-red-500 hover:bg-red-600 text-white",
    },
    found: {
      text: "موجود",
      className: "bg-green-500 hover:bg-green-600 text-white",
    },
  };

  const currentBadge = badgeConfig[type] || badgeConfig.lost;

  return (
    <Card className="h-full bg-card shadow-card hover:shadow-hover transition-all duration-300 transform hover:-translate-y-1 group border-0 overflow-hidden">
      {/* Image Section */}
      <div className="relative overflow-hidden h-48 bg-muted">
        {imageLoading && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {image && !imageError ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <div className="text-center text-muted-foreground">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-arabic">لا توجد صورة</p>
            </div>
          </div>
        )}

        {/* Type Badge */}
        <Badge
          className={`absolute top-3 right-3 font-arabic text-xs font-medium shadow-lg ${currentBadge.className}`}
        >
          {currentBadge.text}
        </Badge>

        {/* Reward Badge */}
        {reward && (
          <Badge className="absolute top-3 left-3 bg-amber-500 hover:bg-amber-600 text-white font-arabic text-xs font-medium shadow-lg">
            <Gift className="w-3 h-3 ml-1" />
            مكافأة
          </Badge>
        )}
      </div>

      {/* Content Section */}
      <CardContent className="p-4 flex-1">
        <h3 className="text-lg font-semibold text-card-foreground font-arabic mb-2 line-clamp-2 leading-tight min-h-[3.5rem]">
          {title}
        </h3>

        <p className="text-muted-foreground text-sm font-arabic mb-4 line-clamp-2 leading-relaxed min-h-[2.5rem]">
          {description}
        </p>

        <div className="space-y-3">
          {/* Location */}
          {location && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 ml-2 text-primary flex-shrink-0" />
              <span className="font-arabic truncate">{location}</span>
            </div>
          )}

          {/* Date */}
          {date && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 ml-2 text-primary flex-shrink-0" />
              <span className="font-arabic">{formatArabicDate(date)}</span>
            </div>
          )}

          {/* Category Badge */}
          {category && (
            <div className="flex justify-start">
              <Badge
                variant="secondary"
                className="font-arabic text-xs px-2 py-1"
              >
                {category}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>

      {/* Footer Section */}
      <CardFooter className="p-4 pt-0">
        <Link to={`/report/${id}`} className="w-full">
          <Button
            variant="outline"
            className="w-full font-arabic group/btn transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:border-primary"
          >
            <Eye className="w-4 h-4 ml-2 group-hover/btn:scale-110 transition-transform" />
            عرض التفاصيل
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
