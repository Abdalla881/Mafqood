import React from "react";
import { Github, Linkedin, Twitter, Globe } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t bg-white/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-600 font-arabic text-center md:text-right">
            © {new Date().getFullYear()} مفقود. جميع الحقوق محفوظة.
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://www.linkedin.com/in/abdalla-osama-430056234/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border hover:bg-slate-50 transition"
              aria-label="LinkedIn"
              title="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href="https://github.com/Abdalla881"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border hover:bg-slate-50 transition"
              aria-label="GitHub"
              title="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
