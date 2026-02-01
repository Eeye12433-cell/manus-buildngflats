import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

export default function Apartments() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFloor, setSelectedFloor] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    floorNumber: "",
    unitNumber: "",
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    status: "active",
  });

  const { data: apartments, isLoading, refetch } = trpc.apartments.list.useQuery();
  const createMutation = trpc.apartments.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة الشقة بنجاح");
      refetch();
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ");
    },
  });

  const updateMutation = trpc.apartments.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الشقة بنجاح");
      refetch();
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ");
    },
  });

  const deleteMutation = trpc.apartments.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الشقة بنجاح");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ");
    },
  });

  const resetForm = () => {
    setFormData({
      floorNumber: "",
      unitNumber: "",
      ownerName: "",
      ownerEmail: "",
      ownerPhone: "",
      status: "active",
    });
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.floorNumber || !formData.unitNumber || !formData.ownerName) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const data = {
      floorNumber: parseInt(formData.floorNumber),
      unitNumber: parseInt(formData.unitNumber),
      ownerName: formData.ownerName,
      ownerEmail: formData.ownerEmail || undefined,
      ownerPhone: formData.ownerPhone || undefined,
      status: formData.status as "active" | "vacant" | "inactive",
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredApartments = apartments?.filter((apt) => {
    const matchesSearch = apt.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.ownerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.ownerPhone?.includes(searchTerm);
    const matchesFloor = !selectedFloor || selectedFloor === "all" || apt.floorNumber.toString() === selectedFloor;
    return matchesSearch && matchesFloor;
  }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">إدارة الشقق</h1>
            <p className="text-slate-600">إدارة معلومات الشقق والملاك</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                إضافة شقة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "تعديل الشقة" : "إضافة شقة جديدة"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="floor">رقم الطابق</Label>
                    <Select value={formData.floorNumber} onValueChange={(value) => setFormData({ ...formData, floorNumber: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الطابق" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 15 }, (_, i) => i + 1).map((floor) => (
                          <SelectItem key={floor} value={floor.toString()}>
                            الطابق {floor}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="unit">رقم الوحدة</Label>
                    <Select value={formData.unitNumber} onValueChange={(value) => setFormData({ ...formData, unitNumber: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الوحدة" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 4 }, (_, i) => i + 1).map((unit) => (
                          <SelectItem key={unit} value={unit.toString()}>
                            الوحدة {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="ownerName">اسم المالك</Label>
                  <Input
                    id="ownerName"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    placeholder="أدخل اسم المالك"
                  />
                </div>

                <div>
                  <Label htmlFor="ownerEmail">البريد الإلكتروني</Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    value={formData.ownerEmail}
                    onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                    placeholder="البريد الإلكتروني (اختياري)"
                  />
                </div>

                <div>
                  <Label htmlFor="ownerPhone">رقم الهاتف</Label>
                  <Input
                    id="ownerPhone"
                    value={formData.ownerPhone}
                    onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                    placeholder="رقم الهاتف (اختياري)"
                  />
                </div>

                <div>
                  <Label htmlFor="status">الحالة</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">نشطة</SelectItem>
                      <SelectItem value="vacant">شاغرة</SelectItem>
                      <SelectItem value="inactive">غير نشطة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full">
                  {editingId ? "تحديث" : "إضافة"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="search">البحث</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="ابحث عن المالك أو البريد أو الهاتف"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="floor">الطابق</Label>
                <Select value={selectedFloor} onValueChange={setSelectedFloor}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الطوابق" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الطوابق</SelectItem>
                    {Array.from({ length: 15 }, (_, i) => i + 1).map((floor) => (
                      <SelectItem key={floor} value={floor.toString()}>
                        الطابق {floor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Apartments Table */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة الشقق</CardTitle>
            <CardDescription>عدد الشقق: {filteredApartments.length}</CardDescription>
          </CardHeader>
          <CardContent>
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
                    <th className="text-center py-3 px-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApartments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        لا توجد شقق
                      </td>
                    </tr>
                  ) : (
                    filteredApartments.map((apt) => (
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
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setFormData({
                                  floorNumber: apt.floorNumber.toString(),
                                  unitNumber: apt.unitNumber.toString(),
                                  ownerName: apt.ownerName,
                                  ownerEmail: apt.ownerEmail || "",
                                  ownerPhone: apt.ownerPhone || "",
                                  status: apt.status,
                                });
                                setEditingId(apt.id);
                                setIsDialogOpen(true);
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                if (confirm("هل أنت متأكد من حذف هذه الشقة؟")) {
                                  deleteMutation.mutate({ id: apt.id });
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
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
