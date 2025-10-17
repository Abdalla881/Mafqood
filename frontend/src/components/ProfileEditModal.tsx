import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X, Upload, Camera } from "lucide-react";
import axios from "axios";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: {
    name: string;
    email: string;
    phone?: string;
    avatar?:
      | {
          public_id: string;
          url: string;
        }
      | string;
  };
  onProfileUpdated?: () => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onProfileUpdated,
}) => {
  const { updateProfile, token, user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: currentProfile.name || "",
    email: currentProfile.email || "",
    phone: currentProfile.phone || "",
    avatar:
      typeof currentProfile.avatar === "string"
        ? currentProfile.avatar
        : currentProfile.avatar?.url || "",
    countryCode: "+20",
  });

  // Debug logging to see when props change
  useEffect(() => {}, [user]);

  // Update form when current profile changes
  useEffect(() => {
    let inferredCountry = "+20";
    let inferredLocal = currentProfile.phone || "";

    if ((currentProfile.phone || "").startsWith("+")) {
      const match = (currentProfile.phone as string).match(/^\+(\d{1,3})(.*)$/);
      if (match) {
        inferredCountry = `+${match[1]}`;
        inferredLocal = match[2]?.replace(/\D/g, "") || "";
        if (inferredCountry === "+20" && inferredLocal.startsWith("0")) {
          inferredLocal = inferredLocal.replace(/^0/, "");
        }
      }
    }

    setFormData({
      name: currentProfile.name || "",
      email: currentProfile.email || "",
      phone: inferredLocal,
      avatar:
        typeof currentProfile.avatar === "string"
          ? currentProfile.avatar
          : currentProfile.avatar?.url || "",
      countryCode: inferredCountry,
    });
  }, [currentProfile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "خطأ في نوع الملف",
          description: "يرجى اختيار ملف صورة صالح",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "حجم الملف كبير جداً",
          description: "يرجى اختيار صورة بحجم أقل من 5 ميجابايت",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!token) return null;

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
          "https://mafqood.vercel.app"
        }/api/${import.meta.env.VITE_API_VERSION || "v1"}/users/me/avatar`,
        uploadFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = response.data;
      const { status, message } = result;

      const data = result.data;
      console.log("this is status", status);
      console.log("this is message", message);
      console.log("this is data", data);

      if (!status) {
        throw new Error(message || "فشل رفع الصورة");
      }

      let url: string | undefined;
      const payload = data.data ?? {};
      if (typeof payload === "object" && "avatar" in payload) {
        url = (payload as { avatar?: { url?: string } }).avatar?.url;
      } else if (typeof payload === "object" && "url" in payload) {
        url = (payload as { url?: string }).url;
      }
      if (url) return url;

      console.error("Unexpected response format:", response.data);
      return null;
    } catch (error) {
      console.error("Avatar upload error:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("Error response:", error.response.data);
      }
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData: {
        name?: string;
        email?: string;
        phone?: string;
        avatar?: string;
      } = {};

      // Get current avatar URL for comparison
      const currentAvatarUrl =
        typeof currentProfile.avatar === "string"
          ? currentProfile.avatar
          : currentProfile.avatar?.url || "";

      // Only include fields that have changed
      if ((formData.name || "").trim() !== (currentProfile.name || "").trim()) {
        updateData.name = (formData.name || "").trim();
      }

      if (
        (formData.email || "").trim() !== (currentProfile.email || "").trim()
      ) {
        updateData.email = (formData.email || "").trim();
      }

      if (
        (formData.phone || "").trim() !== (currentProfile.phone || "").trim()
      ) {
        let localDigits = (formData.phone || "").replace(/\D/g, "");
        const cc = formData.countryCode || "+20";

        if (cc === "+20" && localDigits.startsWith("0")) {
          localDigits = localDigits.replace(/^0/, "");
        }

        // Phone validation
        const isValid = (() => {
          if (cc === "+20") {
            return /^1\d{9}$/.test(localDigits);
          }
          return /^\d{6,14}$/.test(localDigits);
        })();

        if (!isValid) {
          toast({
            title: "رقم غير صالح",
            description: "يرجى إدخال رقم هاتف صحيح متوافق مع رمز الدولة",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        updateData.phone = `${cc}${localDigits}`;
      }

      // Handle file upload if a file is selected
      if (selectedFile) {
        setUploading(true);
        console.log("Starting avatar upload...");

        console.log("select file", selectedFile);

        const uploadedAvatarUrl = await uploadAvatar(selectedFile);

        if (uploadedAvatarUrl) {
          console.log("Avatar uploaded successfully:", uploadedAvatarUrl);
          updateData.avatar = uploadedAvatarUrl;

          // Update user data immediately for instant UI update
          updateProfile({ avatar: uploadedAvatarUrl });

          toast({
            title: "تم رفع الصورة بنجاح",
            description: "تم رفع الصورة الشخصية بنجاح",
          });
        } else {
          console.error("Avatar upload failed");
          toast({
            title: "خطأ في رفع الصورة",
            description: "فشل في رفع الصورة الشخصية. يرجى المحاولة مرة أخرى",
            variant: "destructive",
          });
          setUploading(false);
          setLoading(false);
          return;
        }
        setUploading(false);
      } else if (formData.avatar && formData.avatar !== currentAvatarUrl) {
        // Handle manual URL input
        updateData.avatar = formData.avatar;
      }

      // If no changes, just close the modal
      if (Object.keys(updateData).length === 0) {
        console.log("No changes detected, closing modal");
        toast({
          title: "لا توجد تغييرات",
          description: "لم يتم إجراء أي تغييرات على البيانات",
        });
        onClose();
        return;
      }

      console.log("Updating profile with data:", updateData);

      // Update user data immediately for instant UI feedback

      const success = await updateProfile(updateData);

      if (success) {
        console.log("Profile updated successfully");

        toast({
          title: "تم التحديث بنجاح",
          description: "تم تحديث بيانات الملف الشخصي بنجاح",
        });

        // Refresh user data from server to ensure consistency
        await refreshUser();

        // Call the parent callback
        onProfileUpdated?.();

        onClose();
      } else {
        console.error("Profile update failed");

        // Revert the immediate changes if update failed
        await refreshUser();

        toast({
          title: "خطأ في التحديث",
          description: "فشل في تحديث بيانات الملف الشخصي",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);

      // Revert changes on error
      await refreshUser();

      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث الملف الشخصي",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading && !uploading) {
      // Reset form data to current profile
      const currentAvatarUrl =
        typeof currentProfile.avatar === "string"
          ? currentProfile.avatar
          : currentProfile.avatar?.url || "";

      setFormData({
        name: currentProfile.name || "",
        email: currentProfile.email || "",
        phone: currentProfile.phone || "",
        avatar: currentAvatarUrl,
        countryCode: formData.countryCode || "+20",
      });

      // Reset file states
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      onClose();
    }
  };

  const currentAvatarUrl =
    typeof currentProfile.avatar === "string"
      ? currentProfile.avatar
      : currentProfile.avatar?.url || "";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-arabic">تعديل الملف الشخصي</DialogTitle>
          <DialogDescription className="font-arabic">
            قم بتحديث معلوماتك الشخصية
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-arabic">
              الاسم
            </Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="أدخل اسمك"
              className="font-arabic"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="font-arabic">
              رقم الهاتف
            </Label>
            <div className="flex gap-2">
              <select
                value={formData.countryCode}
                onChange={(e) =>
                  handleInputChange("countryCode", e.target.value)
                }
                className="border border-input rounded px-2 py-2 text-sm bg-background"
                disabled={loading || uploading}
              >
                <option value="+20">+20 (EG)</option>
                <option value="+966">+966 (SA)</option>
                <option value="+971">+971 (AE)</option>
                <option value="+974">+974 (QA)</option>
                <option value="+965">+965 (KW)</option>
                <option value="+1">+1 (US)</option>
              </select>
              <Input
                id="phone"
                value={formData.phone || ""}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="مثال: 10xxxxxxxx"
                className="font-arabic"
                inputMode="tel"
                disabled={loading || uploading}
              />
            </div>
            <div className="text-xs text-muted-foreground font-arabic">
              سيتم حفظ الرقم بصيغة E.164 مثل: +2010xxxxxxx
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="font-arabic">
              البريد الإلكتروني
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="أدخل بريدك الإلكتروني"
              className="font-arabic"
              required
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label className="font-arabic">الصورة الشخصية</Label>

            {/* File Upload Section */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={loading || uploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("avatar-upload")?.click()
                  }
                  disabled={loading || uploading}
                  className="font-arabic flex-1"
                >
                  <Camera className="w-4 h-4 ml-2" />
                  {uploading ? "جاري الرفع..." : "اختيار صورة"}
                </Button>
                {selectedFile && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      if (previewUrl) {
                        URL.revokeObjectURL(previewUrl);
                        setPreviewUrl(null);
                      }
                    }}
                    className="px-2"
                    disabled={loading || uploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Preview Section */}
              {(previewUrl || formData.avatar) && (
                <div className="flex items-center gap-4">
                  <img
                    src={previewUrl || formData.avatar}
                    alt="Preview"
                    className="w-16 h-16 rounded-full object-cover border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="text-sm text-muted-foreground font-arabic">
                    {selectedFile ? (
                      <>
                        <div>الصورة المختارة: {selectedFile.name}</div>
                        <div>
                          الحجم: {(selectedFile.size / 1024 / 1024).toFixed(2)}{" "}
                          ميجابايت
                        </div>
                      </>
                    ) : (
                      "الصورة الحالية"
                    )}
                  </div>
                </div>
              )}

              {/* Manual URL Input (Alternative) */}
              <div className="text-sm text-muted-foreground font-arabic">
                أو أدخل رابط الصورة يدوياً:
              </div>
              <div className="flex gap-2">
                <Input
                  value={formData.avatar || ""}
                  onChange={(e) => handleInputChange("avatar", e.target.value)}
                  placeholder="أدخل رابط الصورة الشخصية"
                  className="font-arabic"
                  disabled={loading || uploading || !!selectedFile}
                />
                {formData.avatar && !selectedFile && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleInputChange("avatar", "")}
                    className="px-2"
                    disabled={loading || uploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="font-arabic"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={loading || uploading}
              className="font-arabic"
            >
              {loading || uploading ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  {uploading ? "جاري رفع الصورة..." : "جاري التحديث..."}
                </>
              ) : (
                "حفظ التغييرات"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
