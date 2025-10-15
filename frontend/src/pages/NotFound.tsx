import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero rtl">
      <div className="text-center px-4">
        <div className="text-8xl mb-8">🔍</div>
        <h1 className="text-4xl md:text-6xl font-bold text-foreground font-arabic mb-4">
          404
        </h1>
        <h2 className="text-xl md:text-2xl font-semibold text-foreground font-arabic mb-4">
          الصفحة غير موجودة
        </h2>
        <p className="text-lg text-muted-foreground font-arabic mb-8 max-w-md mx-auto">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى مكان آخر
        </p>
        <Link to="/">
          <Button variant="hero" size="lg" className="font-arabic">
            <Home className="w-5 h-5 ml-2" />
            العودة للرئيسية
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
