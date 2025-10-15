import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
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
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const Register: React.FC = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate(); // ← هنا بنجيب الدالة

  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "خطأ في كلمة المرور",
        description: "كلمة المرور وتأكيد كلمة المرور غير متطابقتين",
        variant: "destructive",
      });
      return false;
    }

    if (formData.password.length < 6) {
      toast({
        title: "كلمة مرور ضعيفة",
        description: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const success = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (success) {
        toast({
          title: "تم إنشاء الحساب بنجاح",
          description: "مرحباً بك في منصة مفقود",
        });

        navigate("/", { replace: true }); // ✅ هنا صح
      } else {
        toast({
          title: "خطأ في إنشاء الحساب",
          description: "حدث خطأ أثناء إنشاء الحساب، يرجى المحاولة مرة أخرى",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      let message = "تعذر الاتصال بالخادم، يرجى المحاولة مرة أخرى";

      console.log(err);

      if (err?.response?.status === 409) {
        message = "هذا البريد مسجل بالفعل، حاول تسجيل الدخول بدلاً من ذلك";
      }

      toast({
        title: "خطأ في إنشاء الحساب",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
            <CardTitle className="text-2xl font-arabic">
              إنشاء حساب جديد
            </CardTitle>
            <CardDescription className="font-arabic">
              املأ البيانات التالية لإنشاء حسابك
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-arabic">
                  الاسم الكامل
                </Label>
                <div className="relative">
                  <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="محمد أحمد"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="pr-10 font-arabic"
                  />
                </div>
              </div>

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
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="font-arabic">
                  تأكيد كلمة المرور
                </Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="pr-10 font-arabic"
                  />
                </div>
              </div>

              <div className="text-sm text-center">
                <span className="text-muted-foreground font-arabic">
                  للتجربة استخدم أي بريد إلكتروني صحيح
                </span>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full font-arabic"
                disabled={loading}
              >
                {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground font-arabic">
                  لديك حساب بالفعل؟{" "}
                </span>
                <Link
                  to="/auth/login"
                  className="text-primary hover:underline font-arabic"
                >
                  تسجيل الدخول
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};
