import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Button } from "@/components/ui/button";
import { Mail, KeyRound, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const VerifyResetCode: React.FC = () => {
  const { verifyResetCode, resetEmail, setResetEmail, setResetCodeVerified } =
    useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState(resetEmail || "");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (resetEmail && !email) setEmail(resetEmail);
  }, [resetEmail]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !code.trim()) return;

    setLoading(true);

    try {
      const ok = await verifyResetCode(email.trim(), code.trim());

      if (ok) {
        setResetEmail(email.trim());
        setResetCodeVerified(true);
        toast({ title: "تم التحقق من كود إعادة التعيين بنجاح" });
        navigate("/auth/reset-password", { replace: true });
      } else {
        toast({
          title: "فشل التحقق",
          description: "الكود غير صحيح أو انتهت صلاحيته",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "خطأ في الاتصال",
        description:
          error?.response?.data?.message ||
          "تعذر الاتصال بالخادم، يرجى المحاولة مرة أخرى",
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
              تأكيد رمز إعادة التعيين
            </CardTitle>
            <CardDescription className="font-arabic">
              أدخل بريدك والرمز الذي وصلك عبر البريد الإلكتروني
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-arabic">
                  البريد الإلكتروني
                </Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    readOnly
                    className="pr-10 font-arabic"
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="code" className="font-arabic">
                  رمز التحقق
                </Label>
                <div className="relative">
                  <KeyRound className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="code"
                    type="text"
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    className="pr-10 font-arabic"
                    dir="ltr"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full font-arabic"
                disabled={loading}
              >
                {loading ? "جاري التأكيد..." : "تأكيد الرمز"}
              </Button>
              <div className="text-center text-sm">
                <Link
                  to="/auth/login"
                  className="text-primary hover:underline font-arabic"
                >
                  العودة لتسجيل الدخول
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};
