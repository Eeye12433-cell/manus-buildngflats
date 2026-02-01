import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Plus, Edit2 } from "lucide-react";
import { toast } from "sonner";

export default function Fees() {
  const { user } = useAuth();
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isMonthlyDialogOpen, setIsMonthlyDialogOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().split("T")[0]);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
  });
  const [monthlyFormData, setMonthlyFormData] = useState({
    feeCategoryId: "",
    amount: "",
  });

  const { data: categories, refetch: refetchCategories } = trpc.feeCategories.list.useQuery();
  const { data: monthlyFees, refetch: refetchMonthlyFees } = trpc.monthlyFees.getByMonth.useQuery({
    month: new Date(selectedMonth),
  });

  const createCategoryMutation = trpc.feeCategories.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة فئة الرسم بنجاح");
      refetchCategories();
      setCategoryFormData({ name: "", description: "" });
      setIsCategoryDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ");
    },
  });

  const createMonthlyFeeMutation = trpc.monthlyFees.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة الرسم الشهري بنجاح");
      refetchMonthlyFees();
      setMonthlyFormData({ feeCategoryId: "", amount: "" });
      setIsMonthlyDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ");
    },
  });

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.name) {
      toast.error("يرجى إدخال اسم فئة الرسم");
      return;
    }
    createCategoryMutation.mutate(categoryFormData);
  };

  const handleCreateMonthlyFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!monthlyFormData.feeCategoryId || !monthlyFormData.amount) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }
    createMonthlyFeeMutation.mutate({
      month: new Date(selectedMonth),
      feeCategoryId: parseInt(monthlyFormData.feeCategoryId),
      amount: monthlyFormData.amount,
    });
  };

  const totalMonthlyFees = monthlyFees?.reduce((sum, fee) => sum + parseFloat(fee.amount.toString()), 0) || 0;
  const totalExpectedRevenue = totalMonthlyFees * 60; // 60 apartments

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">إدارة الرسوم</h1>
          <p className="text-slate-600">تحديد وتحديث فئات الرسوم الشهرية</p>
        </div>

        {/* Fee Categories Section */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>فئات الرسوم</CardTitle>
              <CardDescription>الرسوم المختلفة المحصلة من الملاك</CardDescription>
            </div>
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة فئة جديدة
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>إضافة فئة رسم جديدة</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateCategory} className="space-y-4">
                  <div>
                    <Label htmlFor="categoryName">اسم الفئة</Label>
                    <Input
                      id="categoryName"
                      value={categoryFormData.name}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                      placeholder="مثال: الصيانة، الأسانسير، الكهرباء"
                    />
                  </div>
                  <div>
                    <Label htmlFor="categoryDescription">الوصف (اختياري)</Label>
                    <Input
                      id="categoryDescription"
                      value={categoryFormData.description}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                      placeholder="وصف تفصيلي للفئة"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    إضافة الفئة
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories && categories.length === 0 ? (
                <p className="col-span-full text-center text-muted-foreground py-8">
                  لا توجد فئات رسوم. يرجى إضافة فئة جديدة.
                </p>
              ) : (
                categories?.map((category) => (
                  <Card key={category.id} className="border">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.description || "بدون وصف"}</p>
                      <div className="mt-4 pt-4 border-t">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          نشطة
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Fees Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>الرسوم الشهرية</CardTitle>
              <CardDescription>تحديد مبالغ الرسوم لكل شهر</CardDescription>
            </div>
            <div className="flex gap-2">
              <Input
                type="date"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-40"
              />
              <Dialog open={isMonthlyDialogOpen} onOpenChange={setIsMonthlyDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    إضافة رسم
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إضافة رسم شهري</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateMonthlyFee} className="space-y-4">
                    <div>
                      <Label htmlFor="feeCategory">فئة الرسم</Label>
                      <Select 
                        value={monthlyFormData.feeCategoryId} 
                        onValueChange={(value) => setMonthlyFormData({ ...monthlyFormData, feeCategoryId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر فئة الرسم" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="amount">المبلغ (ج.م)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={monthlyFormData.amount}
                        onChange={(e) => setMonthlyFormData({ ...monthlyFormData, amount: e.target.value })}
                        placeholder="أدخل المبلغ"
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      إضافة الرسم
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyFees && monthlyFees.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  لا توجد رسوم محددة لهذا الشهر
                </p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-right py-3 px-4">فئة الرسم</th>
                          <th className="text-right py-3 px-4">المبلغ (ج.م)</th>
                          <th className="text-right py-3 px-4">الإجمالي للعمارة (60 شقة)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyFees?.map((fee) => {
                          const category = categories?.find((c) => c.id === fee.feeCategoryId);
                          const totalForBuilding = parseFloat(fee.amount.toString()) * 60;
                          return (
                            <tr key={fee.id} className="border-b hover:bg-slate-50">
                              <td className="py-3 px-4">{category?.name}</td>
                              <td className="py-3 px-4 font-medium">{parseFloat(fee.amount.toString()).toFixed(2)} ج.م</td>
                              <td className="py-3 px-4">{totalForBuilding.toFixed(2)} ج.م</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">إجمالي الرسوم الشهرية (للشقة الواحدة)</p>
                        <p className="text-2xl font-bold text-blue-600">{totalMonthlyFees.toFixed(2)} ج.م</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">الإيراد المتوقع (60 شقة)</p>
                        <p className="text-2xl font-bold text-blue-600">{totalExpectedRevenue.toFixed(2)} ج.م</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
