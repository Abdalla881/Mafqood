import React, { useState } from "react";
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
import { Mail, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const ForgotPassword: React.FC = () => {
  const { sendResetCode, setResetEmail } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const ok = await sendResetCode(email.trim());
      if (ok) {
        setResetEmail(email.trim());
        toast({ title: "Password reset code sent to your email" });
        navigate("/auth/verify-reset-code");
      } else {
        toast({ title: "Failed to send reset code", variant: "destructive" });
      }
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
              نسيت كلمة المرور
            </CardTitle>
            <CardDescription className="font-arبic">
              أدخل بريدك الإلكتروني لإرسال رمز إعادة التعيين
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
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                {loading ? "جاري الإرسال..." : "إرسال الرمز"}
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
