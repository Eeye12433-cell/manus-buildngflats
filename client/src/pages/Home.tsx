import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const ctx = gsap.context(() => {
        // Hero animation
        gsap.from(".hero-content > *", {
          y: 50,
          opacity: 0,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
        });

        // Cards animation
        gsap.from(".info-card", {
          scale: 0.8,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: ".building-info",
            start: "top 80%",
          },
        });

        // Features animation
        gsap.from(".feature-item", {
          x: -50,
          opacity: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".features-grid",
            start: "top 80%",
          },
        });
      }, heroRef);

      return () => ctx.revert();
    }
  }, [loading, isAuthenticated]);

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

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" dir="rtl" ref={heroRef}>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-900 text-white p-4">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="container max-w-5xl z-10 hero-content text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">🏢 نظام إدارة اتحاد ملاك العمارة</h1>
          <p className="text-xl md:text-2xl mb-12 opacity-90">منصة متكاملة لتحصيل الرسوم وإدارة العمارات بكفاءة</p>
          
          <div className="building-info grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[
              { num: "60", label: "شقة" },
              { num: "15", label: "طابق" },
              { num: "5", label: "فئات رسوم" },
              { num: "المهندسين", label: "القاهرة" },
            ].map((item, i) => (
              <div key={i} className="info-card bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
                <div className="text-3xl font-bold">{item.num}</div>
                <div className="text-sm opacity-80">{item.label}</div>
              </div>
            ))}
          </div>

          <Button 
            onClick={() => window.location.href = getLoginUrl()}
            size="lg" 
            className="bg-white text-blue-900 hover:bg-blue-50 text-xl px-12 py-8 rounded-full shadow-2xl transition-transform hover:scale-105"
          >
            تسجيل الدخول للنظام
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50" ref={featuresRef}>
        <div className="container max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-16">✨ الميزات الرئيسية</h2>
          <div className="features-grid grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "📊 لوحة تحكم متقدمة", desc: "عرض شامل لحالة العمارة والإيرادات والمستحقات في لمحة واحدة مع رسوم بيانية توضيحية" },
              { title: "🏘️ إدارة الشقق", desc: "قاعدة بيانات كاملة لمعلومات الملاك والشقق مع إمكانية البحث والتصفية المتقدمة" },
              { title: "💰 تتبع الدفعات", desc: "نظام متكامل لتسجيل ومتابعة جميع الدفعات الشهرية لكل شقة مع أرشفة كاملة" },
              { title: "📈 تقارير مالية", desc: "تحليل شامل للإيرادات والتحصيل مع إمكانية تصدير التقارير لاتخاذ قرارات أفضل" },
              { title: "⚙️ إعدادات مرنة", desc: "تحكم كامل في فئات الرسوم والمبالغ الشهرية لكل فئة حسب احتياجات العمارة" },
              { title: "🔔 نظام إشعارات", desc: "تنبيهات فورية للمتأخرات وحالات الدفع الجديدة لضمان سلاسة العمل" },
            ].map((feature, i) => (
              <div key={i} className="feature-item bg-white p-8 rounded-2xl shadow-lg border-r-4 border-blue-600 hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-bold text-blue-900 mb-4">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container text-center">
          <p className="text-2xl font-bold mb-4">نظام إدارة اتحاد ملاك العمارة</p>
          <p className="opacity-60">تطبيق ويب متكامل لإدارة العمارات والتحصيل المالي</p>
          <div className="mt-8 pt-8 border-t border-white/10 opacity-40">
            © 2026 - جميع الحقوق محفوظة
          </div>
        </div>
      </footer>
    </div>
  );
}
