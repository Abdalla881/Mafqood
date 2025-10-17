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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  LogOut,
  Edit,
  Eye,
  Trash2,
  KeyRound,
  Check,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ProfileEditModal } from "@/components/ProfileEditModal";

interface UserReport {
  id: string;
  title: string;
  body: string;
  status: "active" | "resolved" | "expired";
  type: "lost" | "found";
  date: string;
}

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const {
    user,
    logout,
    token,
    sendResetCode,
    verifyResetCode,
    resetPassword,
    refreshUser,
  } = useAuth();

  const { toast } = useToast();
  const toastRef = React.useRef(toast);
  React.useEffect(() => {
    toastRef.current = toast;
  }, [toast]);
  const refreshUserRef = React.useRef(refreshUser);
  React.useEffect(() => {
    refreshUserRef.current = refreshUser;
  }, [refreshUser]);
  const [userReports, setUserReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [pwStep, setPwStep] = useState<"send" | "verify" | "reset">("send");
  const [pwEmail, setPwEmail] = useState<string>("");
  const [pwCode, setPwCode] = useState<string>("");
  const [pwNew, setPwNew] = useState<string>("");
  const [pwConfirm, setPwConfirm] = useState<string>("");
  const [pwLoading, setPwLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isEditReportOpen, setIsEditReportOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<UserReport | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    type: "lost" as "lost" | "found",
    location: "",
    date: "",
    contactInfo: "",
    reward: "",
    item: {
      name: "",
      description: "",
      category: "",
      brand: "",
      color: "",
      uniqueMarks: "",
    },
  });
  const [editLoading, setEditLoading] = useState(false);

  // Debug logging to track user changes
  useEffect(() => {}, [user]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) {
        setProfileLoading(false);
        return;
      }

      try {
        // Just refresh the user data in context
        await refreshUserRef.current();
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toastRef.current({
          title: "خطأ في تحميل البيانات",
          description: "فشل في تحميل بيانات الملف الشخصي",
          variant: "destructive",
        });
      } finally {
        setProfileLoading(false);
      }
    };

    const fetchUserReports = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${
            import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
            "https://mafqood-api.vercel.app"
          }/api/${import.meta.env.VITE_API_VERSION || "v1"}/reports/me`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }
        );

        // Expected shape: { status, message, data: { count, data: Report[] } }
        const raw = response.data as {
          status?: boolean;
          message?: string;
          data?: { count?: number; data?: unknown[] } | unknown[];
        };

        let list: unknown[] = [];
        if (raw && Array.isArray(raw.data)) {
          list = raw.data as unknown[];
        } else if (
          raw &&
          raw.data &&
          Array.isArray((raw.data as { data?: unknown[] }).data)
        ) {
          list = (raw.data as { data?: unknown[] }).data ?? [];
        }

        const mapped: UserReport[] = list.map((rUnknown) => {
          const r = rUnknown as {
            _id?: string;
            title?: string;
            type?: string;
            date?: string;
            createdAt?: string;
            contactInfo?: string;
            reward?: string;
            item?: { description?: string };
          };
          return {
            id: String(r._id ?? ""),
            title: r.title ?? "—",
            body: r.item?.description || r.reward || r.contactInfo || "—",
            status: "active",
            type: r.type === "found" ? "found" : "lost",
            date: r.date || r.createdAt || new Date().toISOString(),
          };
        });

        setUserReports(mapped);
      } catch (error) {
        console.error("Error fetching user reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
    fetchUserReports();
  }, [token]);

  // Function to refresh profile data
  const refreshProfileData = async () => {
    if (!token) return;

    try {
      // Just refresh user data in context
      await refreshUser();
    } catch (error) {
      console.error("Error refreshing profile:", error);
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "تم تسجيل الخروج",
      description: "تم تسجيل خروجك بنجاح من منصة مفقود",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="font-arabic">
            نشط
          </Badge>
        );
      case "resolved":
        return (
          <Badge variant="default" className="bg-success font-arabic">
            تم الحل
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="secondary" className="font-arabic">
            منتهي الصلاحية
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="font-arabic">
            غير معروف
          </Badge>
        );
    }
  };

  const getTypeBadge = (type: string) => {
    return type === "lost" ? (
      <Badge variant="destructive" className="font-arabic">
        مفقود
      </Badge>
    ) : (
      <Badge variant="default" className="font-arabic">
        موجود
      </Badge>
    );
  };

  // Use user directly from context
  const displayName = user?.name;
  const displayEmail = user?.email;
  const displayPhone = user?.phone;
  const displayAvatarUrl =
    typeof user?.avatar === "string"
      ? user.avatar
      : user?.avatar && typeof user.avatar === "object"
      ? (user.avatar as { url?: string }).url
      : undefined;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <Card className="mb-8 shadow-card">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center">
                {displayAvatarUrl ? (
                  <img
                    src={displayAvatarUrl}
                    alt={displayName}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>

              <div className="flex-1 text-center md:text-right">
                {profileLoading ? (
                  <div className="animate-pulse">
                    <div className="bg-muted h-8 w-48 rounded mb-2 mx-auto md:mx-0"></div>
                    <div className="bg-muted h-4 w-64 rounded mb-1 mx-auto md:mx-0"></div>
                    <div className="bg-muted h-4 w-32 rounded mx-auto md:mx-0"></div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-foreground font-arabic mb-2">
                      {displayName}
                    </h1>
                    <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground mb-1">
                      <Mail className="w-4 h-4" />
                      <span className="font-arabic">{displayEmail}</span>
                    </div>
                    {user?.role && (
                      <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                        <Badge variant="outline" className="font-arabic">
                          {user.role === "admin" ? "مدير" : user.role}
                        </Badge>
                      </div>
                    )}
                    {user?.createdAt && (
                      <div className="text-xs text-muted-foreground font-arabic">
                        عضو منذ:{" "}
                        {new Date(user.createdAt).toLocaleDateString("ar-EG")}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="font-arabic"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <Edit className="w-4 h-4 ml-2" />
                  تعديل الملف
                </Button>
                <Button
                  variant="outline"
                  className="font-arabic"
                  onClick={() => {
                    setPwEmail(displayEmail || "");
                    setPwStep("send");
                    setPwCode("");
                    setPwNew("");
                    setPwConfirm("");
                    setIsChangePasswordOpen(true);
                  }}
                >
                  <KeyRound className="w-4 h-4 ml-2" />
                  تغيير كلمة المرور
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  className="font-arabic"
                >
                  <LogOut className="w-4 h-4 ml-2" />
                  تسجيل الخروج
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-card">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary font-arabic mb-2">
                {userReports.length}
              </div>
              <div className="text-muted-foreground font-arabic">
                إجمالي البلاغات
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-success font-arabic mb-2">
                {userReports.filter((r) => r.status === "resolved").length}
              </div>
              <div className="text-muted-foreground font-arabic">تم حلها</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary font-arabic mb-2">
                {userReports.filter((r) => r.status === "active").length}
              </div>
              <div className="text-muted-foreground font-arabic">نشطة</div>
            </CardContent>
          </Card>
        </div>

        {/* User Reports */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-arabic">بلاغاتي</CardTitle>
            <CardDescription className="font-arabic">
              جميع البلاغات التي أضفتها على منصة مفقود
            </CardDescription>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-muted h-20 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : userReports.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-foreground font-arabic mb-2">
                  لا توجد بلاغات بعد
                </h3>
                <p className="text-muted-foreground font-arabic">
                  لم تقم بإضافة أي بلاغات حتى الآن
                </p>
                <Link to="/add-report">
                  <Button className="font-arabic">إضافة أول بلاغ</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {userReports.map((report) => (
                  <div
                    key={report.id}
                    className="border border-border rounded-lg p-4 hover:shadow-card transition-all"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getTypeBadge(report.type)}
                          {getStatusBadge(report.status)}
                        </div>
                        <h3 className="text-lg font-semibold text-foreground font-arabic mb-1">
                          {report.title}
                        </h3>
                        <p className="text-muted-foreground font-arabic text-sm mb-2">
                          {report.body}
                        </p>
                        <p className="text-xs text-muted-foreground font-arabic">
                          تاريخ الإضافة:{" "}
                          {new Date(report.date).toLocaleDateString("ar-EG")}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="font-arabic"
                          onClick={() => navigate(`/report/${report.id}`)}
                        >
                          <Eye className="w-4 h-4 ml-1" />
                          عرض
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="font-arabic"
                          onClick={() => {
                            setEditingReport(report);
                            setEditForm({
                              title: report.title,
                              type: report.type,
                              location: "",
                              date: report.date.split("T")[0] || report.date,
                              contactInfo: "",
                              reward: "",
                              item: {
                                name: "",
                                description: report.body,
                                category: "",
                                brand: "",
                                color: "",
                                uniqueMarks: "",
                              },
                            });
                            setIsEditReportOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4 ml-1" />
                          تعديل
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => setDeleteId(report.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Profile Edit Modal */}
      {user && (
        <ProfileEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          currentProfile={user} // 👈 مباشرة من context
          onProfileUpdated={refreshProfileData} // هي نداء refreshUser أصلاً
        />
      )}

      {/* Change Password Modal */}
      <Dialog
        open={isChangePasswordOpen}
        onOpenChange={(open) => {
          if (!pwLoading) setIsChangePasswordOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="font-arabic">تغيير كلمة المرور</DialogTitle>
            <DialogDescription className="font-arabic">
              {pwStep === "send" && "سنرسل رمز تحقق إلى بريدك المسجل"}
              {pwStep === "verify" && "أدخل رمز التحقق المرسل إلى بريدك"}
              {pwStep === "reset" && "أدخل كلمة مرور جديدة"}
            </DialogDescription>
          </DialogHeader>

          {pwStep === "send" && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="pw-email" className="font-arabic">
                  البريد الإلكتروني
                </Label>
                <Input
                  id="pw-email"
                  type="email"
                  value={pwEmail}
                  disabled
                  className="font-arabic"
                />
              </div>
            </div>
          )}

          {pwStep === "verify" && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="pw-code" className="font-arabic">
                  رمز التحقق
                </Label>
                <Input
                  id="pw-code"
                  value={pwCode}
                  onChange={(e) => setPwCode(e.target.value)}
                  placeholder="أدخل الرمز"
                  className="font-arabic"
                />
              </div>
            </div>
          )}

          {pwStep === "reset" && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="pw-new" className="font-arabic">
                  كلمة المرور الجديدة
                </Label>
                <Input
                  id="pw-new"
                  type="password"
                  value={pwNew}
                  onChange={(e) => setPwNew(e.target.value)}
                  className="font-arabic"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pw-confirm" className="font-arabic">
                  تأكيد كلمة المرور
                </Label>
                <Input
                  id="pw-confirm"
                  type="password"
                  value={pwConfirm}
                  onChange={(e) => setPwConfirm(e.target.value)}
                  className="font-arabic"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            {pwStep === "send" && (
              <Button
                className="font-arabic"
                disabled={pwLoading}
                onClick={async () => {
                  try {
                    setPwLoading(true);
                    const ok = await sendResetCode(pwEmail);
                    if (ok) {
                      toast({
                        title: "تم الإرسال",
                        description: "تم إرسال رمز التحقق إلى بريدك",
                      });
                      setPwStep("verify");
                    } else {
                      toast({
                        title: "تعذر الإرسال",
                        description: "تحقق من بريدك وحاول مرة أخرى",
                        variant: "destructive",
                      });
                    }
                  } finally {
                    setPwLoading(false);
                  }
                }}
              >
                إرسال الرمز
              </Button>
            )}
            {pwStep === "verify" && (
              <Button
                className="font-arabic"
                disabled={pwLoading || !pwCode}
                onClick={async () => {
                  try {
                    setPwLoading(true);
                    const ok = await verifyResetCode(pwEmail, pwCode);
                    if (ok) {
                      toast({ title: "تم التحقق", description: "رمز صحيح" });
                      setPwStep("reset");
                    } else {
                      toast({
                        title: "رمز غير صالح",
                        description: "الرمز غير صحيح أو منتهي",
                        variant: "destructive",
                      });
                    }
                  } finally {
                    setPwLoading(false);
                  }
                }}
              >
                تحقق من الرمز
              </Button>
            )}
            {pwStep === "reset" && (
              <Button
                className="font-arabic"
                disabled={pwLoading || !pwNew || pwNew !== pwConfirm}
                onClick={async () => {
                  if (pwNew !== pwConfirm) {
                    toast({
                      title: "عدم تطابق",
                      description: "كلمتا المرور غير متطابقتين",
                      variant: "destructive",
                    });
                    return;
                  }
                  try {
                    setPwLoading(true);
                    const ok = await resetPassword(pwEmail, pwNew);
                    if (ok) {
                      toast({
                        title: "تم تغيير كلمة المرور",
                        description: "تم التغيير بنجاح",
                      });
                      setIsChangePasswordOpen(false);
                      setPwStep("send");
                    } else {
                      toast({
                        title: "تعذر التغيير",
                        description: "حاول مرة أخرى",
                        variant: "destructive",
                      });
                    }
                  } finally {
                    setPwLoading(false);
                  }
                }}
              >
                <Check className="w-4 h-4 ml-2" /> حفظ كلمة المرور
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="font-arabic">تأكيد الحذف</DialogTitle>
            <DialogDescription className="font-arabic">
              هل أنت متأكد من حذف هذا البلاغ؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="font-arabic"
              onClick={() => setDeleteId(null)}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              className="font-arabic"
              onClick={() =>
                deleteId &&
                (async () => {
                  try {
                    await axios.delete(
                      `${
                        import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
                        "https://mafqood-api.vercel.app"
                      }/api/${
                        import.meta.env.VITE_API_VERSION || "v1"
                      }/reports/me/${deleteId}`,
                      {
                        headers: token
                          ? { Authorization: `Bearer ${token}` }
                          : undefined,
                      }
                    );
                    toast({
                      title: "تم الحذف",
                      description: "تم حذف البلاغ بنجاح",
                    });
                    setDeleteId(null);
                    // Refresh list
                    const response = await axios.get(
                      `${
                        import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
                        "https://mafqood-api.vercel.app"
                      }/api/${
                        import.meta.env.VITE_API_VERSION || "v1"
                      }/reports/me`,
                      {
                        headers: token
                          ? { Authorization: `Bearer ${token}` }
                          : undefined,
                      }
                    );
                    const raw = response.data as {
                      data?: { data?: unknown[] } | unknown[];
                    };
                    const list: unknown[] = Array.isArray(raw.data)
                      ? (raw.data as unknown[])
                      : Array.isArray(
                          (raw.data as { data?: unknown[] } | undefined)?.data
                        )
                      ? ((raw.data as { data?: unknown[] }).data as unknown[])
                      : [];
                    const mapped: UserReport[] = list.map((rUnknown) => {
                      const r = rUnknown as {
                        _id?: string;
                        title?: string;
                        type?: string;
                        date?: string;
                        createdAt?: string;
                        contactInfo?: string;
                        reward?: string;
                        item?: { description?: string };
                      };
                      return {
                        id: String(r._id ?? ""),
                        title: r.title ?? "—",
                        body:
                          r.item?.description ||
                          r.reward ||
                          r.contactInfo ||
                          "—",
                        status: "active",
                        type: r.type === "found" ? "found" : "lost",
                        date: r.date || r.createdAt || new Date().toISOString(),
                      };
                    });
                    setUserReports(mapped);
                  } catch (err) {
                    console.error("Delete report error:", err);
                    toast({
                      title: "فشل حذف البلاغ",
                      description: "يرجى المحاولة لاحقاً",
                      variant: "destructive",
                    });
                  }
                })()
              }
            >
              حذف البلاغ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Report Dialog */}
      <Dialog
        open={isEditReportOpen}
        onOpenChange={(open) => {
          if (!open) setIsEditReportOpen(false);
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-arabic">تعديل البلاغ</DialogTitle>
            <DialogDescription className="font-arabic">
              قم بتعديل معلومات البلاغ وحفظ التغييرات
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Report Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold font-arabic">
                معلومات البلاغ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-arabic">العنوان</Label>
                  <Input
                    className="font-arabic"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, title: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-arabic">النوع</Label>
                  <select
                    className="w-full border rounded h-10 px-3"
                    value={editForm.type}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        type: e.target.value as "lost" | "found",
                      }))
                    }
                  >
                    <option value="lost">مفقود</option>
                    <option value="found">موجود</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="font-arabic">الموقع</Label>
                  <Input
                    className="font-arabic"
                    value={editForm.location}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, location: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-arabic">التاريخ</Label>
                  <Input
                    type="date"
                    className="font-arabic"
                    value={editForm.date}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, date: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-arabic">معلومات التواصل</Label>
                  <Input
                    className="font-arabic"
                    value={editForm.contactInfo}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        contactInfo: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-arabic">المكافأة</Label>
                <Input
                  className="font-arabic"
                  value={editForm.reward}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, reward: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Item Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold font-arabic">
                معلومات العنصر
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-arabic">اسم العنصر</Label>
                  <Input
                    className="font-arabic"
                    value={editForm.item.name}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        item: { ...p.item, name: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-arabic">الفئة</Label>
                  <Input
                    className="font-arabic"
                    value={editForm.item.category}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        item: { ...p.item, category: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-arabic">الوصف</Label>
                <Input
                  className="font-arabic"
                  value={editForm.item.description}
                  onChange={(e) =>
                    setEditForm((p) => ({
                      ...p,
                      item: { ...p.item, description: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="font-arabic">العلامة التجارية</Label>
                  <Input
                    className="font-arabic"
                    value={editForm.item.brand}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        item: { ...p.item, brand: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-arabic">اللون</Label>
                  <Input
                    className="font-arabic"
                    value={editForm.item.color}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        item: { ...p.item, color: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-arabic">العلامات المميزة</Label>
                  <Input
                    className="font-arabic"
                    value={editForm.item.uniqueMarks}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        item: { ...p.item, uniqueMarks: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="font-arabic"
              onClick={() => setIsEditReportOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              className="font-arabic"
              disabled={editLoading}
              onClick={async () => {
                if (!editingReport) return;
                try {
                  setEditLoading(true);
                  const updateData = {
                    title: editForm.title,
                    type: editForm.type,
                    location: editForm.location,
                    date: editForm.date,
                    contactInfo: editForm.contactInfo,
                    reward: editForm.reward,
                    item: {
                      name: editForm.item.name,
                      description: editForm.item.description,
                      category: editForm.item.category,
                      brand: editForm.item.brand,
                      color: editForm.item.color,
                      uniqueMarks: editForm.item.uniqueMarks,
                    },
                  };
                  await axios.put(
                    `${
                      import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
                      "https://mafqood-api.vercel.app"
                    }/api/${
                      import.meta.env.VITE_API_VERSION || "v1"
                    }/reports/me/${editingReport.id}`,
                    updateData,
                    {
                      headers: token
                        ? { Authorization: `Bearer ${token}` }
                        : undefined,
                    }
                  );
                  toast({
                    title: "تم التحديث",
                    description: "تم تحديث البلاغ بنجاح",
                  });
                  setIsEditReportOpen(false);
                  setEditingReport(null);
                  // Refresh list
                  const response = await axios.get(
                    `${
                      import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
                      "https://mafqood-api.vercel.app"
                    }/api/${
                      import.meta.env.VITE_API_VERSION || "v1"
                    }/reports/me`,
                    {
                      headers: token
                        ? { Authorization: `Bearer ${token}` }
                        : undefined,
                    }
                  );
                  const raw = response.data as {
                    data?: { data?: unknown[] } | unknown[];
                  };
                  const list: unknown[] = Array.isArray(raw.data)
                    ? (raw.data as unknown[])
                    : Array.isArray(
                        (raw.data as { data?: unknown[] } | undefined)?.data
                      )
                    ? ((raw.data as { data?: unknown[] }).data as unknown[])
                    : [];
                  const mapped: UserReport[] = list.map((rUnknown) => {
                    const r = rUnknown as {
                      _id?: string;
                      title?: string;
                      type?: string;
                      date?: string;
                      createdAt?: string;
                      contactInfo?: string;
                      reward?: string;
                      item?: { description?: string };
                    };
                    return {
                      id: String(r._id ?? ""),
                      title: r.title ?? "—",
                      body:
                        r.item?.description || r.reward || r.contactInfo || "—",
                      status: "active",
                      type: r.type === "found" ? "found" : "lost",
                      date: r.date || r.createdAt || new Date().toISOString(),
                    };
                  });
                  setUserReports(mapped);
                } catch (error) {
                  console.error("Error updating report:", error);
                  toast({
                    title: "خطأ في التحديث",
                    description: "فشل في تحديث البلاغ، حاول مرة أخرى",
                    variant: "destructive",
                  });
                } finally {
                  setEditLoading(false);
                }
              }}
            >
              حفظ التعديلات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
