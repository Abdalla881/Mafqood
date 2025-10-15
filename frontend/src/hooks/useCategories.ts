import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { APP_CONFIG, apiUrl } from "@/config";

interface Category {
  _id: string;
  name: string;
}

interface CategoriesApiResponse {
  message: string;
  length: number;
  data: Category[];
}

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useCategories = (): UseCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isCategoryArray = (v: unknown): v is Category[] => {
    return (
      Array.isArray(v) &&
      v.every(
        (c) =>
          typeof c === "object" &&
          c !== null &&
          "_id" in (c as Record<string, unknown>) &&
          "name" in (c as Record<string, unknown>)
      )
    );
  };

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get<CategoriesApiResponse>(
        apiUrl("/categories"),
        { timeout: APP_CONFIG.API_TIMEOUT }
      );

      const raw: unknown = response.data;
      let list: Category[] | null = null;

      if (typeof raw === "object" && raw !== null) {
        const obj = raw as Record<string, unknown>;
        const data = obj["data"];
        if (isCategoryArray(data)) {
          list = data;
        } else if (
          typeof data === "object" &&
          data !== null &&
          isCategoryArray((data as Record<string, unknown>)["categories"])
        ) {
          list = (data as Record<string, unknown>)["categories"] as Category[];
        } else if (
          typeof data === "object" &&
          data !== null &&
          isCategoryArray((data as Record<string, unknown>)["data"])
        ) {
          // Shape: { status, message, data: { data: Category[] } }
          list = (data as Record<string, unknown>)["data"] as Category[];
        } else if (
          typeof data === "object" &&
          data !== null &&
          typeof (data as Record<string, unknown>)["data"] === "object" &&
          (data as Record<string, unknown>)["data"] !== null &&
          isCategoryArray(
            (
              (data as Record<string, unknown>)["data"] as Record<
                string,
                unknown
              >
            )["categories"]
          )
        ) {
          // Shape: { status, message, data: { data: { categories: Category[] } } }
          list = (
            (data as Record<string, unknown>)["data"] as Record<string, unknown>
          )["categories"] as Category[];
        } else if (isCategoryArray(obj["categories"])) {
          list = obj["categories"] as Category[];
        }
      }

      if (!list) {
        throw new Error("Unexpected categories response shape");
      }

      setCategories(list);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
};
