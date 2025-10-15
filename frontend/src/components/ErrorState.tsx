import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground font-arabic mb-2">
            حدث خطأ في تحميل البيانات
          </h3>
          <p className="text-muted-foreground font-arabic text-sm">{error}</p>
        </div>

        <Button onClick={onRetry} variant="outline" className="font-arabic">
          <RefreshCw className="w-4 h-4 ml-2" />
          إعادة المحاولة
        </Button>
      </div>
    </div>
  );
};
