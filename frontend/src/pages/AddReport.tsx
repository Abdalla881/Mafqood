import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Upload, Save } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { useCategories } from "@/hooks/useCategories";

export const AddReport: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token } = useAuth();
  const { categories } = useCategories();
  const initialType = searchParams.get("type") === "found" ? "found" : "lost";

  const [formData, setFormData] = useState({
    title: "",
    itemName: "",
    description: "",
    categoryId: "",
    location: "",
    date: new Date().toISOString().split("T")[0],
    contactInfo: "",
    reward: "",
    type: initialType,
    brand: "",
    color: "",
    uniqueMarks: "",
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const locations = [
    "القاهرة",
    "الإسكندرية",
    "الجيزة",
    "الشرقية",
    "المنوفية",
    "الدقهلية",
    "كفر الشيخ",
    "الغربية",
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const total = selectedImages.length + files.length;
    if (total > 5) {
      toast({
        title: "بحد أقصى 5 صور",
        description: "لا يمكنك رفع أكثر من 5 صور",
        variant: "destructive",
      });
      return;
    }
    setSelectedImages((prev) => [...prev, ...files]);
    const readers = files.map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers).then((previews) =>
      setImagePreviews((prev) => [...prev, ...previews])
    );
  };

  const removeImageAt = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData();
      form.append("title", formData.title);
      form.append("type", formData.type);
      form.append("location", formData.location);
      form.append("date", new Date(formData.date).toISOString());
      form.append("contactInfo", formData.contactInfo);
      if (formData.reward) form.append("reward", formData.reward);

      form.append("item[name]", formData.itemName || formData.title);
      form.append("item[description]", formData.description);
      form.append("item[category]", formData.categoryId);
      if (formData.brand) form.append("item[brand]", formData.brand);
      if (formData.color) form.append("item[color]", formData.color);
      if (formData.uniqueMarks)
        form.append("item[uniqueMarks]", formData.uniqueMarks);

      selectedImages.forEach((file) => form.append("images", file));

      const response = await axios.post(
        `${
          import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
          "https://mafqood-api.vercel.app"
        }/api/${import.meta.env.VITE_API_VERSION || "v1"}/reports/me`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (response.data) {
        toast({
          title: "تم إضافة البلاغ بنجاح",
          description: "سيتم مراجعته من قبل الفريق.",
        });

        // Reset form
        setFormData({
          title: "",
          itemName: "",
          description: "",
          categoryId: "",
          location: "",
          date: new Date().toISOString().split("T")[0],
          contactInfo: "",
          reward: "",
          type: "lost",
          brand: "",
          color: "",
          uniqueMarks: "",
        });
        setSelectedImages([]);
        setImagePreviews([]);

        // Navigate back to home
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "خطأ في إضافة البلاغ",
        description: "حدث خطأ أثناء إضافة البلاغ، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle className="text-2xl font-arabic">
                  إضافة بلاغ جديد
                </CardTitle>
                <CardDescription className="font-arabic">
                  املأ التفاصيل أدناه لإضافة بلاغ عن شيء{" "}
                  {formData.type === "lost" ? "مفقود" : "موجود"}
                </CardDescription>
              </div>
              <Badge
                variant={formData.type === "lost" ? "destructive" : "default"}
                className="font-arabic"
              >
                {formData.type === "lost" ? "مفقود" : "موجود"}
              </Badge>
            </div>

            {/* Type Toggle */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.type === "lost" ? "default" : "outline"}
                onClick={() => handleSelectChange("type", "lost")}
                className="font-arabic"
              >
                مفقود
              </Button>
              <Button
                type="button"
                variant={formData.type === "found" ? "default" : "outline"}
                onClick={() => handleSelectChange("type", "found")}
                className="font-arabic"
              >
                موجود
              </Button>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="font-arabic">
                  العنوان *
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="مثل: محفظة جلدية سوداء، تليفون آيفون أزرق..."
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="font-arabic"
                />
              </div>

              {/* Item Name */}
              <div className="space-y-2">
                <Label htmlFor="itemName" className="font-arabic">
                  اسم العنصر
                </Label>
                <Input
                  id="itemName"
                  name="itemName"
                  placeholder="مثل: محفظة جلدية، هاتف آيفون..."
                  value={formData.itemName}
                  onChange={handleInputChange}
                  className="font-arabic"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="font-arabic">
                  الوصف التفصيلي *
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="اكتب وصفاً مفصلاً للشيء المفقود أو الموجود..."
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="font-arabic"
                />
              </div>

              {/* Category and Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-arabic">الفئة *</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) =>
                      handleSelectChange("categoryId", value)
                    }
                  >
                    <SelectTrigger className="font-arabic">
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category._id}
                          value={category._id}
                          className="font-arabic"
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-arabic">المحافظة *</Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) =>
                      handleSelectChange("location", value)
                    }
                  >
                    <SelectTrigger className="font-arabic">
                      <SelectValue placeholder="اختر المحافظة" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem
                          key={location}
                          value={location}
                          className="font-arabic"
                        >
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Optional: Brand/Color/Unique Marks */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand" className="font-arabic">
                    الماركة (اختياري)
                  </Label>
                  <Input
                    id="brand"
                    name="brand"
                    placeholder="مثل: Apple, Samsung"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="font-arabic"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color" className="font-arabic">
                    اللون (اختياري)
                  </Label>
                  <Input
                    id="color"
                    name="color"
                    placeholder="مثل: أسود، أزرق"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="font-arabic"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uniqueMarks" className="font-arabic">
                    علامات مميزة (اختياري)
                  </Label>
                  <Input
                    id="uniqueMarks"
                    name="uniqueMarks"
                    placeholder="مثل: خدش في الخلف"
                    value={formData.uniqueMarks}
                    onChange={handleInputChange}
                    className="font-arabic"
                  />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date" className="font-arabic">
                  تاريخ {formData.type === "lost" ? "الفقدان" : "العثور عليه"} *
                </Label>
                <div className="relative">
                  <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="pr-10"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                <Label htmlFor="contactInfo" className="font-arabic">
                  معلومات التواصل *
                </Label>
                <Input
                  id="contactInfo"
                  name="contactInfo"
                  placeholder="رقم الهاتف أو البريد الإلكتروني"
                  value={formData.contactInfo}
                  onChange={handleInputChange}
                  required
                  className="font-arabic"
                />
              </div>

              {/* Reward (optional for lost items) */}
              {formData.type === "lost" && (
                <div className="space-y-2">
                  <Label htmlFor="reward" className="font-arabic">
                    المكافأة (اختياري)
                  </Label>
                  <Input
                    id="reward"
                    name="reward"
                    placeholder="مثل: 500 جنيه مكافأة"
                    value={formData.reward}
                    onChange={handleInputChange}
                    className="font-arabic"
                  />
                </div>
              )}

              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="image" className="font-arabic">
                  إضافة صورة
                </Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center space-y-4">
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {imagePreviews.map((src, idx) => (
                        <div key={idx} className="relative">
                          <img
                            src={src}
                            alt={`Preview ${idx + 1}`}
                            className="mx-auto h-28 w-full object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => removeImageAt(idx)}
                            className="mt-2 w-full font-arabic"
                          >
                            إزالة
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="space-y-3">
                    <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                    <div>
                      <label htmlFor="images" className="cursor-pointer">
                        <Button
                          type="button"
                          variant="outline"
                          className="font-arabic"
                          asChild
                        >
                          <span>اختر صور (حتى 5)</span>
                        </Button>
                      </label>
                      <input
                        id="images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImagesChange}
                        className="hidden"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground font-arabic">
                      يمكنك إضافة حتى 5 صور للعنصر
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={
                    loading ||
                    !formData.title ||
                    !formData.description ||
                    !formData.categoryId ||
                    !formData.location ||
                    !formData.contactInfo
                  }
                  className="flex-1 font-arabic"
                >
                  {loading ? (
                    <>جاري الحفظ...</>
                  ) : (
                    <>
                      <Save className="w-4 h-4 ml-2" />
                      إضافة البلاغ
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="font-arabic"
                >
                  إلغاء
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
};
