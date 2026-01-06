import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import axios, { AxiosError, AxiosInstance } from "axios";
import { toast } from "@/hooks/use-toast";

// ==================== Types & Interfaces ====================

interface User {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ProfileUpdateData {
  name?: string;
  email?: string;
  avatar?: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => void;
  handleGoogleCallback: (data: {
    user: any;
    token: string;
  }) => Promise<boolean>;
  register: (
    data: RegisterData
  ) => Promise<{ success: boolean; message?: string }>;
  updateProfile: (data: ProfileUpdateData) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;
  sendResetCode: (email: string) => Promise<boolean>;
  verifyResetCode: (email: string, code: string) => Promise<boolean>;
  resetPassword: (email: string, newPassword: string) => Promise<boolean>;
  resetEmail: string | null;
  setResetEmail: (email: string | null) => void;
  resetCodeVerified: boolean;
  setResetCodeVerified: (verified: boolean) => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface ApiResponse<T = unknown> {
  status: boolean;
  message?: string;
  data?: T;
}

// ==================== Configuration ====================

const config = {
  API_BASE_URL:
    (
      import.meta as unknown as { env?: Record<string, string> }
    )?.env?.VITE_API_BASE_URL?.replace(/\/$/, "") ||
    "https://mafqood-api.vercel.app",
  API_TIMEOUT: Number((import.meta as any)?.env?.VITE_API_TIMEOUT) || 10000,
  API_VERSION: (import.meta as any)?.env?.VITE_API_VERSION || "v1",
  STORAGE_KEYS: {
    TOKEN: "token",
    USER: "mafqood_user",
  },
  DEFAULT_AVATAR:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
} as const;

const API_ENDPOINTS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/signup",
  PROFILE: "/users/me/profile",
  SEND_RESET_CODE: "/auth/forget-password",
  VERIFY_RESET_CODE: "/auth/verify-reset-code",
  RESET_PASSWORD: "/auth/reset-password",
  GOOGLE_AUTH: "/auth/google",
  GOOGLE_CALLBACK: "/auth/google/callback",
} as const;

// ==================== Utilities ====================

const getApiUrl = (endpoint: string): string => {
  return `${config.API_BASE_URL}/api/${config.API_VERSION}${endpoint}`;
};

const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const statusCode = error.response?.status;
    const serverMessage = error.response?.data?.message;

    switch (statusCode) {
      case 400:
        return "البيانات المدخلة غير صحيحة";
      case 401:
        return "انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى";
      case 403:
        return "غير مسموح بتنفيذ هذا الإجراء";
      case 404:
        return "العنصر المطلوب غير موجود";
      case 409:
        return "هذا البريد مسجل بالفعل، حاول تسجيل الدخول بدلاً من ذلك";
      case 500:
        return "مشكلة في الخادم، حاول لاحقاً";
      default:
        return serverMessage || "حدث خطأ غير متوقع";
    }
  }
  return "حدث خطأ غير متوقع";
};

// ==================== Storage Utilities ====================

const storage = {
  get: (key: string): unknown | null => {
    if (typeof window === "undefined") return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set: (key: string, value: unknown): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage:`, error);
    }
  },

  remove: (key: string): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage:`, error);
    }
  },

  clear: (): void => {
    if (typeof window === "undefined") return;
    try {
      Object.values(config.STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error(`Error clearing localStorage:`, error);
    }
  },
};

// ==================== API Client ====================

const createApiClient = (onUnauthorized?: () => void): AxiosInstance => {
  const client = axios.create({
    baseURL: config.API_BASE_URL,
    timeout: config.API_TIMEOUT,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor - Add auth token
  client.interceptors.request.use((requestConfig) => {
    const token = storage.get(config.STORAGE_KEYS.TOKEN) as string | null;
    if (token && requestConfig.headers) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }
    return requestConfig;
  });

  // Response interceptor - Handle 401 errors
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        storage.clear();
        onUnauthorized?.();
      }
      return Promise.reject(error);
    }
  );

  return client;
};

// ==================== Helper Functions ====================

const normalizeUser = (userData: any, fallbackEmail?: string): User => {
  return {
    id: userData?.id || userData?._id || Date.now(),
    name: userData?.name || "مستخدم",
    email: userData?.email || fallbackEmail || "",
    phone: userData?.phone,
    role: userData?.role,
    avatar:
      typeof userData?.avatar === "string"
        ? userData.avatar
        : userData?.avatar?.url || config.DEFAULT_AVATAR,
    createdAt: userData?.createdAt,
    updatedAt: userData?.updatedAt || new Date().toISOString(),
  };
};

const extractUserFromResponse = (data: any): any => {
  return data?.user || data?.data?.user || data;
};

// ==================== Context ====================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

// ==================== Provider ====================

interface AuthProviderProps {
  children: React.ReactNode;
  onUnauthorized?: () => void;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  onUnauthorized,
}) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  });

  const [resetEmail, setResetEmail] = useState<string | null>(null);
  const [resetCodeVerified, setResetCodeVerified] = useState<boolean>(false);

  const mounted = useRef(true);
  const apiClient = useMemo(
    () => createApiClient(onUnauthorized),
    [onUnauthorized]
  );

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const updateState = useCallback((updates: Partial<AuthState>) => {
    if (mounted.current) {
      setState((prev) => ({ ...prev, ...updates }));
    }
  }, []);

  // Initialize auth state from localStorage
  useEffect(() => {
    try {
      const savedToken = storage.get(config.STORAGE_KEYS.TOKEN) as
        | string
        | null;
      const savedUser = storage.get(config.STORAGE_KEYS.USER) as User | null;

      if (savedToken && savedUser) {
        updateState({
          token: savedToken,
          user: savedUser,
          isAuthenticated: true,
          loading: false,
        });
      } else {
        updateState({ loading: false });
      }
    } catch (error) {
      console.error("Error initializing auth state:", error);
      updateState({ loading: false, error: "فشل في تحميل بيانات المستخدم" });
    }
  }, [updateState]);

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        updateState({ loading: true, error: null });

        const response = await apiClient.post<
          ApiResponse<{ user: any; token?: string }>
        >(getApiUrl(API_ENDPOINTS.LOGIN), { email, password });

        const result = response.data as ApiResponse<any>;
        const { status, message, data } = result; // مش result.data
        if (!status || !data?.token) {
          throw new Error(message || "فشل تسجيل الدخول");
        }

        const normalizedUser = normalizeUser(data.user, email);

        storage.set(config.STORAGE_KEYS.TOKEN, data.token);
        storage.set(config.STORAGE_KEYS.USER, normalizedUser);

        updateState({
          token: data.token,
          user: normalizedUser,
          isAuthenticated: true,
          loading: false,
        });

        return true;
      } catch (error) {
        const errorMessage = handleApiError(error);
        updateState({ loading: false, error: errorMessage });
        return false;
      }
    },
    [apiClient, updateState]
  );

  const loginWithGoogle = useCallback(() => {
    // Redirect to backend Google auth endpoint
    // The backend will redirect to Google, then back to /api/v1/auth/google/callback
    // which returns JSON. The user will need to be redirected to frontend callback page
    window.location.href = getApiUrl(API_ENDPOINTS.GOOGLE_AUTH);
  }, []);

  const handleGoogleCallback = useCallback(
    async (data: { user: any; token: string }): Promise<boolean> => {
      try {
        updateState({ loading: true, error: null });

        if (!data?.token || !data?.user) {
          throw new Error("فشل تسجيل الدخول عبر Google");
        }

        const normalizedUser = normalizeUser(data.user, data.user.email);

        storage.set(config.STORAGE_KEYS.TOKEN, data.token);
        storage.set(config.STORAGE_KEYS.USER, normalizedUser);

        updateState({
          token: data.token,
          user: normalizedUser,
          isAuthenticated: true,
          loading: false,
        });

        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في منصة مفقود",
        });

        return true;
      } catch (error) {
        const errorMessage = handleApiError(error);
        updateState({ loading: false, error: errorMessage });
        toast({
          title: "خطأ في تسجيل الدخول",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      }
    },
    [updateState]
  );

  const register = useCallback(
    async (
      data: RegisterData
    ): Promise<{ success: boolean; message?: string }> => {
      try {
        updateState({ loading: true, error: null });

        const response = await apiClient.post<
          ApiResponse<{ user: any; token?: string }>
        >(getApiUrl(API_ENDPOINTS.REGISTER), data);

        const result = response.data as ApiResponse<any>;
        const { status, message, data: payload } = result;
        console.log(result, status, payload);

        if (!status) {
          throw new Error(message || "فشل إنشاء الحساب");
        }

        const token = payload?.token ?? null;

        // payload نفسه هو الـ user
        const user = normalizeUser(
          payload?.user ?? payload,
          payload?.email ?? data.email
        );

        if (token) {
          storage.set(config.STORAGE_KEYS.TOKEN, token);
        }
        storage.set(config.STORAGE_KEYS.USER, user);

        updateState({
          token,
          user,
          isAuthenticated: !!token,
          loading: false,
        });

        toast({
          title: "تم إنشاء الحساب بنجاح",
          description: token
            ? "تم تسجيل دخولك تلقائيًا"
            : "يرجى تسجيل الدخول باستخدام حسابك الجديد",
        });

        return { success: true };
      } catch (error) {
        const errorMessage = handleApiError(error);
        updateState({ loading: false, error: errorMessage });

        toast({
          title: "خطأ في إنشاء الحساب",
          description: errorMessage,
          variant: "destructive",
        });

        return { success: false, message: errorMessage };
      }
    },
    [apiClient, updateState]
  );

  const refreshUser = useCallback(async (): Promise<void> => {
    if (!state.token) return;

    try {
      const response = await apiClient.get(getApiUrl(API_ENDPOINTS.PROFILE));

      const result = response.data as ApiResponse<any>;

      const { status, message } = result; // مش result.data
      const { data } = result.data;

      if (status) {
        const userData = extractUserFromResponse(data);
        if (userData) {
          const updatedUser = normalizeUser(userData, state.user?.email);

          // Create a completely new object to force React re-render
          const newUser = JSON.parse(
            JSON.stringify({
              ...state.user,
              ...updatedUser,
              updatedAt: new Date().toISOString(),
            })
          );

          storage.set(config.STORAGE_KEYS.USER, newUser);
          updateState({ user: newUser });
        }
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  }, [apiClient, state.token, state.user, updateState]);

  const updateProfile = useCallback(
    async (profileData: ProfileUpdateData): Promise<boolean> => {
      if (!state.token || !state.user) {
        updateState({ error: "يجب تسجيل الدخول أولاً" });
        return false;
      }

      try {
        updateState({ loading: true, error: null });

        // Optimistic update - immediately update UI
        const optimisticUser = JSON.parse(
          JSON.stringify({
            ...state.user,
            ...profileData,
            updatedAt: new Date().toISOString(),
          })
        );

        storage.set(config.STORAGE_KEYS.USER, optimisticUser);
        updateState({ user: optimisticUser });

        // Send to server
        const response = await apiClient.put<ApiResponse<any>>(
          getApiUrl(API_ENDPOINTS.PROFILE),
          profileData
        );
        const result = response.data as ApiResponse<any>;
        const { status, message } = result; // مش result.data
        const { data } = result.data;
        if (!status) {
          throw new Error(response.data.message || "فشل تحديث الملف الشخصي");
        }

        // Refresh from server to get the final state
        await refreshUser();

        updateState({ loading: false });
        return true;
      } catch (error) {
        const errorMessage = handleApiError(error);

        // Revert optimistic update
        await refreshUser();

        updateState({ loading: false, error: errorMessage });
        return false;
      }
    },
    [apiClient, state.token, state.user, updateState, refreshUser]
  );

  const logout = useCallback(() => {
    storage.clear();
    updateState({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  }, [updateState]);

  const sendResetCode = useCallback(
    async (email: string): Promise<boolean> => {
      try {
        const response = await apiClient.post<ApiResponse<unknown>>(
          getApiUrl(API_ENDPOINTS.SEND_RESET_CODE),
          { email }
        );

        const result = response.data as ApiResponse<any>;
        const { status, message, data } = result; // مش result.data
        if (!status) {
          throw new Error(response.data.message || "فشل إرسال رمز الاستعادة");
        }
        return true;
      } catch (error) {
        const errorMessage = handleApiError(error);
        updateState({ error: errorMessage });
        return false;
      }
    },
    [apiClient, updateState]
  );

  const verifyResetCode = useCallback(
    async (email: string, resetCode: string): Promise<boolean> => {
      try {
        const response = await apiClient.post<ApiResponse<unknown>>(
          getApiUrl(API_ENDPOINTS.VERIFY_RESET_CODE),
          { email, resetCode }
        );

        const result = response.data as ApiResponse<any>;
        const { status, message, data } = result; // مش result.data
        if (!status) {
          throw new Error(response.data.message || "رمز الاستعادة غير صحيح");
        }
        return true;
      } catch (error) {
        const errorMessage = handleApiError(error);
        updateState({ error: errorMessage });
        return false;
      }
    },
    [apiClient, updateState]
  );

  const resetPassword = useCallback(
    async (email: string, newPassword: string): Promise<boolean> => {
      try {
        const response = await apiClient.put<ApiResponse<unknown>>(
          getApiUrl(API_ENDPOINTS.RESET_PASSWORD),
          { email, newPassword }
        );

        const result = response.data as ApiResponse<any>;
        const { status, message, data } = result; // مش result.data
        if (!status) {
          throw new Error(
            response.data.message || "فشل إعادة تعيين كلمة المرور"
          );
        }
        return true;
      } catch (error) {
        const errorMessage = handleApiError(error);
        updateState({ error: errorMessage });
        return false;
      }
    },
    [apiClient, updateState]
  );

  const contextValue: AuthContextType = useMemo(
    () => ({
      ...state,
      login,
      loginWithGoogle,
      handleGoogleCallback,
      register,
      updateProfile,
      logout,
      clearError,
      refreshUser,
      sendResetCode,
      verifyResetCode,
      resetPassword,
      resetEmail,
      setResetEmail,
      resetCodeVerified,
      setResetCodeVerified,
    }),
    [
      state,
      login,
      loginWithGoogle,
      handleGoogleCallback,
      register,
      updateProfile,
      logout,
      clearError,
      refreshUser,
      sendResetCode,
      verifyResetCode,
      resetPassword,
      resetEmail,
      resetCodeVerified,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
