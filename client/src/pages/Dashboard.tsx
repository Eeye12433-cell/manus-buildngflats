import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { AlertCircle, Home, Users, TrendingUp, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: overview, isLoading: overviewLoading } = trpc.reports.buildingOverview.useQuery();
  const { data: currentMonthRevenue } = trpc.reports.monthlyRevenue.useQuery({
    month: new Date(),
  });

  if (overviewLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  const statusData = [
    { name: "نشطة", value: overview?.activeApartments || 0, color: "#10b981" },
    { name: "شاغرة", value: overview?.vacantApartments || 0, color: "#f59e0b" },
  ];

  const collectionData = [
    { name: "تم التحصيل", value: overview?.collectionRate || 0, color: "#3b82f6" },
    { name: "معلق", value: 100 - (overview?.collectionRate || 0), color: "#ef4444" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">لوحة تحكم إدارة العمارة</h1>
          <p className="text-slate-600">مرحبا {user?.name}، إليك ملخص حالة العمارة</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الشقق</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.totalApartments}</div>
              <p className="text-xs text-muted-foreground">60 شقة في 15 طابق</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الشقق النشطة</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{overview?.activeApartments}</div>
              <p className="text-xs text-muted-foreground">شقة مأهولة بالسكان</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إيرادات الشهر</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {currentMonthRevenue?.total ? `${parseFloat(currentMonthRevenue.total.toString()).toFixed(2)} ج.م` : "0 ج.م"}
              </div>
              <p className="text-xs text-muted-foreground">{overview?.collectionCount} دفعة تم استلامها</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المستحقات</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overview?.outstandingCount}</div>
              <p className="text-xs text-muted-foreground">شقة لم تسدد بعد</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Apartment Status Chart */}
          <Card>
            <CardHeader>
              <CardTitle>حالة الشقق</CardTitle>
              <CardDescription>توزيع الشقق النشطة والشاغرة</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Collection Rate Chart */}
          <Card>
            <CardHeader>
              <CardTitle>معدل التحصيل</CardTitle>
              <CardDescription>نسبة الدفعات المستلمة هذا الشهر</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={collectionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${typeof value === 'number' ? value.toFixed(1) : value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {collectionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${typeof value === 'number' ? value.toFixed(1) : value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>الإجراءات السريعة</CardTitle>
            <CardDescription>الوصول السريع للعمليات الشائعة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                onClick={() => navigate("/apartments")}
                className="w-full"
              >
                إدارة الشقق
              </Button>
              <Button 
                onClick={() => navigate("/payments")}
                variant="outline"
                className="w-full"
              >
                تسجيل دفعة
              </Button>
              <Button 
                onClick={() => navigate("/fees")}
                variant="outline"
                className="w-full"
              >
                إدارة الرسوم
              </Button>
              <Button 
                onClick={() => navigate("/reports")}
                variant="outline"
                className="w-full"
              >
                التقارير المالية
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
