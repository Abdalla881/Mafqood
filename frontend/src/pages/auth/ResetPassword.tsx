import React, { useEffect, useState } from "react";
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
import { Mail, Lock, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const ResetPassword: React.FC = () => {
  const { resetPassword, resetEmail, setResetEmail, resetCodeVerified } =
    useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState(resetEmail || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (resetEmail && !email) setEmail(resetEmail);
  }, [resetEmail]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) return;

    if (password.length < 6) {
      toast({
        title: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirm) {
      toast({
        title: "كلمتا المرور غير متطابقتين",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const ok = await resetPassword(email.trim(), password);

      if (ok) {
        toast({
          title:
            "تم إعادة تعيين كلمة المرور بنجاح. يرجى تسجيل الدخول مرة أخرى.",
        });
        setResetEmail(null);
        navigate("/auth/login");
      } else {
        toast({
          title: "فشل في إعادة تعيين كلمة المرور",
          description: "تأكد من صحة الرابط أو الكود وأعد المحاولة",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "خطأ في الاتصال",
        description: err?.response?.data?.message || "حاول مرة أخرى لاحقاً",
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
              إعادة تعيين كلمة المرور
            </CardTitle>
            <CardDescription className="font-arabic">
              أدخل بريدك وكلمة المرور الجديدة
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
                    className="pr-10 font-arabic"
                    dir="ltr"
                    readOnly
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-arabic">
                  كلمة المرور الجديدة
                </Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10 font-arabic"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm" className="font-arabic">
                  تأكيد كلمة المرور
                </Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm"
                    type="password"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    className="pr-10 font-arabic"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full font-arabic"
                disabled={loading || !resetCodeVerified}
              >
                {loading ? "جاري التغيير..." : "تأكيد إعادة التعيين"}
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
