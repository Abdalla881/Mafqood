import { Report, ItemCardData } from "@/types/report";

/**
 * Converts a Report object to ItemCardData format
 * @param report - The report object from the API
 * @returns ItemCardData object for the ItemCard component
 */
export const convertReportToItemCard = (report: Report): ItemCardData => {
  // Generate a numeric ID from the MongoDB _id
  const numericId =
    parseInt(report._id.slice(-6), 16) || Math.random() * 1000000;

  // Truncate title if too long
  const title =
    report.title && report.title.length > 30
      ? `${report.title.slice(0, 30)}...`
      : report.title || "بدون عنوان";

  // Truncate description if too long
  const description =
    report.item?.description && report.item.description.length > 100
      ? `${report.item.description.slice(0, 100)}...`
      : report.item?.description || "لا يوجد وصف";

  // Get the first image URL if available
  const image =
    report.item?.images && report.item.images.length > 0
      ? report.item.images[0].url
      : undefined;

  return {
    id: numericId,
    title,
    description,
    category: report.item?.category?.name || "غير محدد",
    location: report.location || "غير محدد",
    date: report.createdAt || new Date().toISOString(),
    type: report.type,
    image,
  };
};

/**
 * Formats a date string for Arabic locale display
 * @param dateString - ISO date string
 * @returns Formatted date string for Arabic locale
 */
export const formatArabicDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "تاريخ غير صحيح";
  }
};

/**
 * Truncates text to a specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};
