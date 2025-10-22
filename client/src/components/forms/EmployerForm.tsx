import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function EmployerForm() {
  const utils = trpc.useUtils();
  const createEmployer = trpc.employers.create.useMutation({
    onSuccess: () => {
      toast.success("บันทึกข้อมูลนายจ้างเรียบร้อยแล้ว");
      utils.employers.list.invalidate();
      resetForm();
    },
    onError: (error) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    },
  });

  const [formData, setFormData] = useState({
    employerType: "",
    companyName: "",
    taxId: "",
    registrationNumber: "",
    contactPerson: "",
    contactPosition: "",
    phone: "",
    email: "",
    fax: "",
    address: "",
    subdistrict: "",
    district: "",
    province: "",
    postalCode: "",
    businessType: "",
    numberOfEmployees: "",
    capitalAmount: "",
    notes: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      employerType: "",
      companyName: "",
      taxId: "",
      registrationNumber: "",
      contactPerson: "",
      contactPosition: "",
      phone: "",
      email: "",
      fax: "",
      address: "",
      subdistrict: "",
      district: "",
      province: "",
      postalCode: "",
      businessType: "",
      numberOfEmployees: "",
      capitalAmount: "",
      notes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employerType || !formData.companyName || !formData.taxId) {
      toast.error("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }

    createEmployer.mutate({
      employerType: formData.employerType as "individual" | "company" | "partnership",
      companyName: formData.companyName,
      taxId: formData.taxId,
      registrationNumber: formData.registrationNumber || undefined,
      contactPerson: formData.contactPerson || undefined,
      contactPosition: formData.contactPosition || undefined,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      fax: formData.fax || undefined,
      address: formData.address || undefined,
      subdistrict: formData.subdistrict || undefined,
      district: formData.district || undefined,
      province: formData.province || undefined,
      postalCode: formData.postalCode || undefined,
      businessType: formData.businessType || undefined,
      numberOfEmployees: formData.numberOfEmployees ? parseInt(formData.numberOfEmployees) : undefined,
      capitalAmount: formData.capitalAmount ? parseInt(formData.capitalAmount) : undefined,
      notes: formData.notes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ข้อมูลทั่วไป */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">ข้อมูลทั่วไป</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="employerType">ประเภทนายจ้าง <span className="text-destructive">*</span></Label>
            <Select value={formData.employerType} onValueChange={(value) => handleChange("employerType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกประเภทนายจ้าง" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">บุคคลธรรมดา</SelectItem>
                <SelectItem value="company">นิติบุคคล</SelectItem>
                <SelectItem value="partnership">ห้างหุ้นส่วน</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">ชื่อนายจ้าง/บริษัท <span className="text-destructive">*</span></Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
              placeholder="ระบุชื่อนายจ้าง/บริษัท"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxId">เลขประจำตัวผู้เสียภาษี <span className="text-destructive">*</span></Label>
            <Input
              id="taxId"
              value={formData.taxId}
              onChange={(e) => handleChange("taxId", e.target.value)}
              placeholder="0-0000-00000-00-0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="registrationNumber">เลขทะเบียนนิติบุคคล</Label>
            <Input
              id="registrationNumber"
              value={formData.registrationNumber}
              onChange={(e) => handleChange("registrationNumber", e.target.value)}
              placeholder="0000000000000"
            />
          </div>
        </div>
      </div>

      {/* ที่อยู่ */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">ที่อยู่</h3>
        
        <div className="space-y-2">
          <Label htmlFor="address">ที่อยู่</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            placeholder="บ้านเลขที่ ถนน ซอย"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="subdistrict">แขวง/ตำบล</Label>
            <Input
              id="subdistrict"
              value={formData.subdistrict}
              onChange={(e) => handleChange("subdistrict", e.target.value)}
              placeholder="ระบุแขวง/ตำบล"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="district">เขต/อำเภอ</Label>
            <Input
              id="district"
              value={formData.district}
              onChange={(e) => handleChange("district", e.target.value)}
              placeholder="ระบุเขต/อำเภอ"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="province">จังหวัด</Label>
            <Input
              id="province"
              value={formData.province}
              onChange={(e) => handleChange("province", e.target.value)}
              placeholder="ระบุจังหวัด"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode">รหัสไปรษณีย์</Label>
            <Input
              id="postalCode"
              value={formData.postalCode}
              onChange={(e) => handleChange("postalCode", e.target.value)}
              placeholder="00000"
              maxLength={5}
            />
          </div>
        </div>
      </div>

      {/* ข้อมูลติดต่อ */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">ข้อมูลติดต่อ</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contactPerson">ชื่อผู้ติดต่อ</Label>
            <Input
              id="contactPerson"
              value={formData.contactPerson}
              onChange={(e) => handleChange("contactPerson", e.target.value)}
              placeholder="ชื่อ-นามสกุล"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPosition">ตำแหน่ง</Label>
            <Input
              id="contactPosition"
              value={formData.contactPosition}
              onChange={(e) => handleChange("contactPosition", e.target.value)}
              placeholder="ตำแหน่งงาน"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">โทรศัพท์</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="0X-XXXX-XXXX"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fax">โทรสาร</Label>
            <Input
              id="fax"
              value={formData.fax}
              onChange={(e) => handleChange("fax", e.target.value)}
              placeholder="0X-XXXX-XXXX"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="email">อีเมล</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="example@email.com"
            />
          </div>
        </div>
      </div>

      {/* ข้อมูลธุรกิจ */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">ข้อมูลธุรกิจ</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="businessType">ประเภทธุรกิจ</Label>
            <Input
              id="businessType"
              value={formData.businessType}
              onChange={(e) => handleChange("businessType", e.target.value)}
              placeholder="เช่น การผลิต, บริการ, ค้าขาย"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="numberOfEmployees">จำนวนพนักงาน</Label>
            <Input
              id="numberOfEmployees"
              type="number"
              value={formData.numberOfEmployees}
              onChange={(e) => handleChange("numberOfEmployees", e.target.value)}
              placeholder="จำนวนพนักงานทั้งหมด"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capitalAmount">ทุนจดทะเบียน (บาท)</Label>
            <Input
              id="capitalAmount"
              type="number"
              value={formData.capitalAmount}
              onChange={(e) => handleChange("capitalAmount", e.target.value)}
              placeholder="จำนวนเงินทุน"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">หมายเหตุ</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="ข้อมูลเพิ่มเติม (ถ้ามี)"
            rows={3}
          />
        </div>
      </div>

      {/* ปุ่มบันทึก */}
      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button type="button" variant="outline" onClick={resetForm}>
          ยกเลิก
        </Button>
        <Button type="submit" disabled={createEmployer.isPending}>
          {createEmployer.isPending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
        </Button>
      </div>
    </form>
  );
}

