import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";
import Dashboard from "./Dashboard";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">نظام إدارة العمارة</h1>
          <p className="text-lg text-slate-600 mb-2">
            منصة متكاملة لإدارة اتحاد ملاك العمارة
          </p>
          <p className="text-slate-500">
            تتبع الرسوم والدفعات والتقارير المالية بسهولة
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">📊</div>
              <div className="text-right">
                <h3 className="font-semibold text-slate-900">لوحة تحكم متقدمة</h3>
                <p className="text-sm text-slate-600">عرض شامل لحالة العمارة والإيرادات</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">🏢</div>
              <div className="text-right">
                <h3 className="font-semibold text-slate-900">إدارة الشقق</h3>
                <p className="text-sm text-slate-600">متابعة معلومات الملاك والشقق</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">💰</div>
              <div className="text-right">
                <h3 className="font-semibold text-slate-900">تتبع الدفعات</h3>
                <p className="text-sm text-slate-600">تسجيل ومتابعة جميع الدفعات</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">📈</div>
              <div className="text-right">
                <h3 className="font-semibold text-slate-900">تقارير مالية</h3>
                <p className="text-sm text-slate-600">تحليل شامل للإيرادات والتحصيل</p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => window.location.href = getLoginUrl()}
            size="lg"
            className="w-full"
          >
            تسجيل الدخول
          </Button>
        </div>
      </div>
    </div>
  );
}
