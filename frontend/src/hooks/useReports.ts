import { useState, useEffect } from "react";
import axios from "axios";
import {
  Report,
  ReportsApiResponse,
  ReportsPaginationMeta,
} from "@/types/report";
import { APP_CONFIG, apiUrl } from "@/config";

interface UseReportsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "createdAt";
  sortOrder?: "ASC" | "DESC";
}

interface UseReportsReturn {
  reports: Report[];
  loading: boolean;
  error: string | null;
  meta: ReportsPaginationMeta | null;
  refetch: () => Promise<void>;
}

export const useReports = (params?: UseReportsParams): UseReportsReturn => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<ReportsPaginationMeta | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get<ReportsApiResponse>(apiUrl("/reports"), {
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 12,
          search: params?.search ?? undefined,
          sortBy: params?.sortBy ?? "createdAt",
          sortOrder: params?.sortOrder ?? "DESC",
        },
        timeout: APP_CONFIG.API_TIMEOUT,
      });

      if (!response.data.status) {
        throw new Error(response.data.message || "Failed to fetch reports");
      }

      const payload = response.data.data;
      const reportsData = (
        payload && "reports" in payload
          ? (payload as unknown as { reports: Report[] }).reports
          : []
      ) as unknown;

      // Validate and filter reports
      const validReports = reportsData.filter(
        (item: unknown): item is Report =>
          item !== null &&
          typeof item === "object" &&
          "_id" in item &&
          "title" in item &&
          "item" in item &&
          typeof (item as { _id: unknown })._id === "string" &&
          typeof (item as { title: unknown }).title === "string" &&
          typeof (item as { item: unknown }).item === "object"
      );

      setReports(validReports);
      if (payload && typeof payload === "object") {
        const p = payload as Record<string, unknown>;
        const total =
          typeof p["total"] === "number"
            ? (p["total"] as number)
            : validReports.length;
        const page = typeof p["page"] === "number" ? (p["page"] as number) : 1;
        const totalPages =
          typeof p["totalPages"] === "number" ? (p["totalPages"] as number) : 1;
        const limit =
          typeof p["limit"] === "number"
            ? (p["limit"] as number)
            : params?.limit ?? 12;
        setMeta({ total, page, totalPages, limit });
      } else {
        setMeta({
          total: validReports.length,
          page: 1,
          totalPages: 1,
          limit: params?.limit ?? 12,
        });
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        // Treat 404 (no reports) as empty result instead of UI error
        setReports([]);
        setMeta({
          total: 0,
          page: params?.page ?? 1,
          totalPages: 0,
          limit: params?.limit ?? 12,
        });
        setError(null);
      } else {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
        console.error("Error fetching reports:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // re-fetch when params change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params?.page,
    params?.limit,
    params?.search,
    params?.sortBy,
    params?.sortOrder,
  ]);

  return {
    reports,
    loading,
    error,
    meta,

    refetch: fetchReports,
  };
};
