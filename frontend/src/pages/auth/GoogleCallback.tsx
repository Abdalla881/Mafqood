import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import axios from "axios";

// Helper to get API URL
const getApiUrl = (endpoint: string): string => {
  const config = {
    API_BASE_URL:
      (import.meta as any)?.env?.VITE_API_BASE_URL?.replace(/\/$/, "") ||
      "https://mafqood-api.vercel.app",
    API_VERSION: (import.meta as any)?.env?.VITE_API_VERSION || "v1",
  };
  return `${config.API_BASE_URL}/api/${config.API_VERSION}${endpoint}`;
};

// Helper to read token from cookies
const getTokenFromCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

export const GoogleCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleGoogleCallback } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setLoading(true);

        // Get error from URL params (if any)
        const errorParam = searchParams.get("error");

        if (errorParam) {
          const errorMsg = decodeURIComponent(errorParam);
          setError(errorMsg);
          setLoading(false);
          setTimeout(() => navigate("/auth/login"), 3000);
          return;
        }

        // Get token from URL params (backend redirects with token)
        const token = searchParams.get("token");

        if (!token) {
          setError("No authentication token found. Please try again.");
          setLoading(false);
          setTimeout(() => navigate("/auth/login"), 3000);
          return;
        }

        try {
          // Fetch user profile using the token
          const response = await axios.get(getApiUrl("/users/me/profile"), {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const result = response.data;

          // Handle nested response structure: { status, message, data: { message, data: user } }
          let user = null;
          if (result?.data?.data) {
            user = result.data.data; // Backend returns { message, data: user }
          } else if (result?.data) {
            user = result.data; // Fallback
          } else if (result) {
            user = result; // Last resort
          }

          if (!user) {
            throw new Error("Invalid user data received from server");
          }

          const success = await handleGoogleCallback({ user, token });

          if (success) {
            navigate("/");
          } else {
            throw new Error("Failed to complete authentication");
          }
        } catch (profileError: any) {
          console.error("Profile fetch error:", profileError);

          // Better error message
          let errorMessage = "Failed to get user information";
          if (profileError.response?.status === 401) {
            errorMessage = "Authentication token is invalid or expired";
          } else if (profileError.response?.status === 404) {
            errorMessage = "User profile not found";
          } else if (profileError.response?.data?.message) {
            errorMessage = profileError.response.data.message;
          } else if (profileError.message) {
            errorMessage = profileError.message;
          }

          setError(errorMessage);
          setLoading(false);
          setTimeout(() => navigate("/auth/login"), 3000);
        }
      } catch (err) {
        console.error("Callback error:", err);
        const errorMsg =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMsg);
        setLoading(false);
        setTimeout(() => navigate("/auth/login"), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, handleGoogleCallback]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center font-arabic">
            {error ? "خطأ في المصادقة" : "جاري تسجيل الدخول..."}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {error ? (
            <div className="space-y-4">
              <p className="text-destructive font-arabic">{error}</p>
              <p className="text-sm text-muted-foreground font-arabic">
                سيتم إعادة التوجيه إلى صفحة تسجيل الدخول...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground font-arabic">
                جاري معالجة تسجيل الدخول...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
