import React, { useState, useCallback } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

interface LocationState {
  from?: { pathname: string };
}

interface LoginForm {
  email: string;
  password: string;
}

const DEMO_CREDENTIALS = {
  email: "eve.holt@reqres.in",
  password: "cityslicka",
} as const;

export const Login: React.FC = () => {
  const { login, loginWithGoogle, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginForm>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    const from = (location.state as LocationState)?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const showToast = useCallback(
    (type: "success" | "error" | "connection", message?: string) => {
      const toastConfigs = {
        success: {
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في منصة مفقود",
        },
        error: {
          title: "خطأ في تسجيل الدخول",
          description:
            message || "يرجى التحقق من البريد الإلكتروني وكلمة المرور",
          variant: "destructive" as const,
        },
        connection: {
          title: "خطأ في الاتصال",
          description: "تعذر الاتصال بالخادم، يرجى المحاولة مرة أخرى",
          variant: "destructive" as const,
        },
      };

      toast(toastConfigs[type]);
    },
    [toast]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.email.trim() || !formData.password.trim()) {
        showToast("error", "يرجى ملء جميع الحقول");
        return;
      }

      setLoading(true);

      try {
        const success = await login(formData.email.trim(), formData.password);

        console.log(success);

        if (success) {
          showToast("success");
          const from = (location.state as LocationState)?.from?.pathname || "/";
          navigate(from, { replace: true });
        } else {
          showToast("error");
        }
      } catch (error) {
        console.error("Login error:", error);
        showToast("connection");
      } finally {
        setLoading(false);
      }
    },
    [formData, login, location.state, navigate, showToast]
  );

  const isFormValid = formData.email.trim() && formData.password.trim();

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-hover">
          <CardHeader className="text-center">
            <Link to="/" className="flex items-center justify-center mb-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center ml-2">
                <ArrowLeft className="w-6 h-6 text-white transform rotate-180" />
              </div>
              <span className="text-2xl font-bold text-primary font-arabic">
                مفقود
              </span>
            </Link>
            <CardTitle className="text-2xl font-arabic">تسجيل الدخول</CardTitle>
            <CardDescription className="font-arabic">
              أدخل بياناتك للوصول إلى حسابك
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit} noValidate>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-arabic">
                  البريد الإلكتروني
                </Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="pr-10 font-arabic"
                    dir="ltr"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-arabic">
                  كلمة المرور
                </Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="pr-10 pl-10 font-arabic"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute left-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={
                      showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
                    }
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              <div className="text-sm text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-muted-foreground font-arabic mb-1">
                  للتجربة استخدم:
                </div>
                <div className="space-y-1">
                  <div>
                    <span className="text-muted-foreground font-arabic">
                      البريد:{" "}
                    </span>
                    <code className="text-primary text-xs bg-background px-1 rounded">
                      {DEMO_CREDENTIALS.email}
                    </code>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-arabic">
                      كلمة المرور:{" "}
                    </span>
                    <code className="text-primary text-xs bg-background px-1 rounded">
                      {DEMO_CREDENTIALS.password}
                    </code>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full font-arabic"
                disabled={loading || !isFormValid}
              >
                {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </Button>

              <div className="flex items-center gap-4 w-full">
                <Separator className="flex-1" />
                <span className="text-sm text-muted-foreground font-arabic">
                  أو
                </span>
                <Separator className="flex-1" />
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full font-arabic"
                onClick={loginWithGoogle}
                disabled={loading}
              >
                <svg
                  className="w-5 h-5 ml-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                تسجيل الدخول باستخدام Google
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground font-arabic">
                  ليس لديك حساب؟{" "}
                </span>
                <Link
                  to="/auth/register"
                  className="text-primary hover:underline font-arabic focus:outline-none focus:ring-2 focus:ring-primary/20 rounded"
                >
                  إنشاء حساب جديد
                </Link>
              </div>

              <div className="text-center">
                <Link
                  to="/auth/forgot-password"
                  className="text-sm text-muted-foreground hover:text-primary font-arabic focus:outline-none focus:ring-2 focus:ring-primary/20 rounded"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};
