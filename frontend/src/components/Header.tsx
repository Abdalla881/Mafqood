import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Bell, User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { name: "الرئيسية", path: "/", public: true },
    { name: "المفقودات", path: "/lost-items", public: true },
    { name: "الإشعارات", path: "/notifications", public: false },
    { name: "إضافة بلاغ", path: "/add-report", public: false },
  ];

  return (
    <header className="bg-white border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 space-x-reverse">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Search className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-primary font-arabic">
              مفقود
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
            {navItems.map(
              (item) =>
                (item.public || isAuthenticated) && (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`font-arabic font-medium transition-colors ${
                      isActive(item.path)
                        ? "text-primary border-b-2 border-primary pb-1"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {item.name}
                  </Link>
                )
            )}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4 space-x-reverse">
                {/* Notifications - Desktop */}
                <Link to="/notifications" className="hidden md:block">
                  <Button variant="ghost" size="icon">
                    <Bell className="w-5 h-5" />
                  </Button>
                </Link>

                {/* Profile Dropdown */}
                <div className="relative group">
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 space-x-reverse"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden md:block font-arabic">
                      {user?.name || "المستخدم"}
                    </span>
                  </Button>

                  {/* Dropdown Menu */}
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-foreground hover:bg-muted font-arabic"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        الملف الشخصي
                      </Link>
                      <Link
                        to="/match-chat"
                        className="block px-4 py-2 text-sm text-foreground hover:bg-muted font-arabic"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        المحادثات
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-right px-4 py-2 text-sm text-destructive hover:bg-muted font-arabic"
                      >
                        <LogOut className="w-4 h-4 ml-2 inline" />
                        تسجيل الخروج
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 space-x-reverse">
                <Link to="/auth/login">
                  <Button variant="ghost" className="font-arabic">
                    تسجيل الدخول
                  </Button>
                </Link>
                <Link to="/auth/register">
                  <Button variant="default" className="font-arabic">
                    إنشاء حساب
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-white">
            <nav className="py-4 space-y-2">
              {navItems.map(
                (item) =>
                  (item.public || isAuthenticated) && (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`block px-4 py-2 font-arabic font-medium transition-colors ${
                        isActive(item.path)
                          ? "text-primary bg-primary-light"
                          : "text-muted-foreground hover:text-primary hover:bg-muted"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )
              )}

              {!isAuthenticated && (
                <div className="border-t border-border pt-4 mt-4 px-4 space-y-2">
                  <Link
                    to="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start font-arabic"
                    >
                      تسجيل الدخول
                    </Button>
                  </Link>
                  <Link
                    to="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button variant="default" className="w-full font-arabic">
                      إنشاء حساب
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
