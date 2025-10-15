import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search, Plus } from "lucide-react";

export const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground font-arabic mb-2">
            لا توجد تقارير متاحة حالياً
          </h3>
          <p className="text-muted-foreground font-arabic text-sm">
            كن أول من يضيف تقرير عن شيء مفقود أو موجود
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/add-report?type=lost">
            <Button variant="default" className="font-arabic">
              <Plus className="w-4 h-4 ml-2" />
              إضافة مفقود
            </Button>
          </Link>

          <Link to="/add-report?type=found">
            <Button variant="outline" className="font-arabic">
              <Plus className="w-4 h-4 ml-2" />
              إضافة موجود
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
