import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Plus, Eye } from "lucide-react";
import { toast } from "sonner";

export default function Payments() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedApartmentId, setSelectedApartmentId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    apartmentId: "",
    month: new Date().toISOString().split("T")[0],
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "cash",
    transactionId: "",
    notes: "",
  });

  const { data: apartments } = trpc.apartments.list.useQuery();
  const { data: payments, refetch: refetchPayments } = trpc.payments.getByMonth.useQuery({
    month: new Date(),
  });
  const { data: apartmentPayments } = trpc.payments.getByApartment.useQuery(
    { apartmentId: selectedApartmentId || 0 },
    { enabled: selectedApartmentId !== null }
  );

  const createPaymentMutation = trpc.payments.create.useMutation({
    onSuccess: () => {
      toast.success("تم تسجيل الدفعة بنجاح");
      refetchPayments();
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ");
    },
  });

  const resetForm = () => {
    setFormData({
      apartmentId: "",
      month: new Date().toISOString().split("T")[0],
      amount: "",
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMethod: "cash",
      transactionId: "",
      notes: "",
    });
    setIsDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.apartmentId || !formData.amount) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    createPaymentMutation.mutate({
      apartmentId: parseInt(formData.apartmentId),
      month: new Date(formData.month),
      amount: formData.amount,
      paymentDate: new Date(formData.paymentDate),
      paymentMethod: formData.paymentMethod as "cash" | "bank_transfer" | "check" | "online",
      transactionId: formData.transactionId || undefined,
      notes: formData.notes || undefined,
    });
  };

  const selectedApartment = apartments?.find((apt) => apt.id === selectedApartmentId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">إدارة الدفعات</h1>
            <p className="text-slate-600">تسجيل ومتابعة دفعات الشقق</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                تسجيل دفعة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>تسجيل دفعة جديدة</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="apartment">الشقة</Label>
                  <Select value={formData.apartmentId} onValueChange={(value) => setFormData({ ...formData, apartmentId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الشقة" />
                    </SelectTrigger>
                    <SelectContent>
                      {apartments?.map((apt) => (
                        <SelectItem key={apt.id} value={apt.id.toString()}>
                          الطابق {apt.floorNumber} - الوحدة {apt.unitNumber} ({apt.ownerName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="month">الشهر</Label>
                  <Input
                    id="month"
                    type="date"
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="amount">المبلغ (ج.م)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="أدخل المبلغ"
                  />
                </div>

                <div>
                  <Label htmlFor="paymentDate">تاريخ الدفع</Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="paymentMethod">طريقة الدفع</Label>
                  <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">نقدي</SelectItem>
                      <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                      <SelectItem value="check">شيك</SelectItem>
                      <SelectItem value="online">دفع إلكتروني</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="transactionId">رقم المعاملة (اختياري)</Label>
                  <Input
                    id="transactionId"
                    value={formData.transactionId}
                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                    placeholder="رقم المعاملة أو الشيك"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="أي ملاحظات إضافية"
                  />
                </div>

                <Button type="submit" className="w-full">
                  تسجيل الدفعة
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Payments Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الدفعات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {payments?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">دفعة هذا الشهر</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المبلغ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {payments?.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0).toFixed(2) || "0"} ج.م
              </div>
              <p className="text-xs text-muted-foreground">هذا الشهر</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">متوسط الدفعة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {payments && payments.length > 0
                  ? (payments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0) / payments.length).toFixed(2)
                  : "0"} ج.م
              </div>
              <p className="text-xs text-muted-foreground">متوسط</p>
            </CardContent>
          </Card>
        </div>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>سجل الدفعات</CardTitle>
            <CardDescription>جميع الدفعات المسجلة هذا الشهر</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-3 px-4">الشقة</th>
                    <th className="text-right py-3 px-4">المالك</th>
                    <th className="text-right py-3 px-4">المبلغ</th>
                    <th className="text-right py-3 px-4">طريقة الدفع</th>
                    <th className="text-right py-3 px-4">تاريخ الدفع</th>
                    <th className="text-right py-3 px-4">رقم المعاملة</th>
                  </tr>
                </thead>
                <tbody>
                  {payments && payments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-muted-foreground">
                        لا توجد دفعات مسجلة
                      </td>
                    </tr>
                  ) : (
                    payments?.map((payment) => {
                      const apt = apartments?.find((a) => a.id === payment.apartmentId);
                      return (
                        <tr key={payment.id} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4">
                            الطابق {apt?.floorNumber} - الوحدة {apt?.unitNumber}
                          </td>
                          <td className="py-3 px-4">{apt?.ownerName}</td>
                          <td className="py-3 px-4 font-medium">{parseFloat(payment.amount.toString()).toFixed(2)} ج.م</td>
                          <td className="py-3 px-4 text-sm">
                            {payment.paymentMethod === "cash" ? "نقدي" :
                             payment.paymentMethod === "bank_transfer" ? "تحويل بنكي" :
                             payment.paymentMethod === "check" ? "شيك" :
                             "دفع إلكتروني"}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {new Date(payment.paymentDate).toLocaleDateString("ar-EG")}
                          </td>
                          <td className="py-3 px-4 text-sm">{payment.transactionId || "-"}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
