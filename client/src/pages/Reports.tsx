import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, AlertTriangle } from "lucide-react";

export default function Reports() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().split("T")[0]);

  const { data: revenue } = trpc.reports.monthlyRevenue.useQuery({
    month: new Date(selectedMonth),
  });
  const { data: collection } = trpc.reports.collectionRate.useQuery({
    month: new Date(selectedMonth),
  });
  const { data: outstanding } = trpc.reports.outstandingPayments.useQuery({
    month: new Date(selectedMonth),
  });
  const { data: apartments } = trpc.apartments.list.useQuery();

  // Prepare data for charts
  const collectionData = [
    { name: "تم التحصيل", value: collection?.collected || 0, color: "#10b981" },
    { name: "معلق", value: (collection?.total || 0) - (collection?.collected || 0), color: "#ef4444" },
  ];

  const outstandingByStatus = [
    { name: "نشطة", value: outstanding?.filter((apt) => apt.status === "active").length || 0, color: "#3b82f6" },
    { name: "شاغرة", value: outstanding?.filter((apt) => apt.status === "vacant").length || 0, color: "#f59e0b" },
    { name: "غير نشطة", value: outstanding?.filter((apt) => apt.status === "inactive").length || 0, color: "#6b7280" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">التقارير المالية</h1>
          <p className="text-slate-600">تحليل شامل للإيرادات والتحصيل</p>
        </div>

        {/* Month Selector */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor="month">اختر الشهر</Label>
                <Input
                  id="month"
                  type="date"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">المبلغ المحصل</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {(collection?.collected || 0).toFixed(2)} ج.م
              </div>
              <p className="text-xs text-muted-foreground">من المتوقع</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">المبلغ المتوقع</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {(collection?.total || 0).toFixed(2)} ج.م
              </div>
              <p className="text-xs text-muted-foreground">الإجمالي المتوقع</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">معدل التحصيل</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {(collection?.rate || 0).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">نسبة التحصيل</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">المستحقات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {outstanding?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">شقة لم تسدد</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Collection Rate Chart */}
          <Card>
            <CardHeader>
              <CardTitle>معدل التحصيل</CardTitle>
              <CardDescription>نسبة الدفعات المستلمة مقابل المتوقع</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={collectionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value.toFixed(0)} ج.م`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {collectionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${typeof value === 'number' ? value.toFixed(2) : value} ج.م`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Outstanding by Status Chart */}
          <Card>
            <CardHeader>
              <CardTitle>المستحقات حسب الحالة</CardTitle>
              <CardDescription>توزيع الشقق غير المسددة</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={outstandingByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {outstandingByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Outstanding Payments List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              الشقق ذات المستحقات
            </CardTitle>
            <CardDescription>الشقق التي لم تسدد رسومها</CardDescription>
          </CardHeader>
          <CardContent>
            {outstanding && outstanding.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                ممتاز! جميع الشقق سددت رسومها
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4">الطابق</th>
                      <th className="text-right py-3 px-4">الوحدة</th>
                      <th className="text-right py-3 px-4">اسم المالك</th>
                      <th className="text-right py-3 px-4">البريد الإلكتروني</th>
                      <th className="text-right py-3 px-4">الهاتف</th>
                      <th className="text-right py-3 px-4">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outstanding?.map((apt) => (
                      <tr key={apt.id} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-4">{apt.floorNumber}</td>
                        <td className="py-3 px-4">{apt.unitNumber}</td>
                        <td className="py-3 px-4 font-medium">{apt.ownerName}</td>
                        <td className="py-3 px-4 text-sm">{apt.ownerEmail || "-"}</td>
                        <td className="py-3 px-4 text-sm">{apt.ownerPhone || "-"}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            apt.status === "active" ? "bg-green-100 text-green-800" :
                            apt.status === "vacant" ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {apt.status === "active" ? "نشطة" : apt.status === "vacant" ? "شاغرة" : "غير نشطة"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
