import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Upload, X, CheckCircle, XCircle } from "lucide-react";

export default function EmployerForm() {
  const utils = trpc.useUtils();
  const createEmployer = trpc.employers.create.useMutation({
    onSuccess: () => {
      toast.success("บันทึกข้อมูลนายจ้างเรียบร้อยแล้ว", {
        icon: <CheckCircle className="text-green-500" />,
      });
      utils.employers.list.invalidate();
      resetForm();
    },
    onError: (error) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message, {
        icon: <XCircle className="text-red-500" />,
      });
    },
  });

  const [documents, setDocuments] = useState<{[key: string]: File | null}>({
    idCard: null,
    houseRegistration: null,
    leaseContract: null,
    companyRegistration: null,
    powerOfAttorney: null,
    other: null,
  });

  const fileInputRefs = {
    idCard: useRef<HTMLInputElement>(null),
    houseRegistration: useRef<HTMLInputElement>(null),
    leaseContract: useRef<HTMLInputElement>(null),
    companyRegistration: useRef<HTMLInputElement>(null),
    powerOfAttorney: useRef<HTMLInputElement>(null),
    other: useRef<HTMLInputElement>(null),
  };

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
    console.log('handleChange:', field, '=', value);
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
    setDocuments({
      idCard: null,
      houseRegistration: null,
      leaseContract: null,
      companyRegistration: null,
      powerOfAttorney: null,
      other: null,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('handleSubmit called');
    console.log('formData state:', formData);
    
    if (!formData.employerType || !formData.companyName || !formData.taxId) {
      console.log('Validation failed:', { 
        employerType: formData.employerType, 
        companyName: formData.companyName, 
        taxId: formData.taxId 
      });
      toast.error("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }

    try {
      // อัพโหลดเอกสารทั้งหมด (ถ้ามี)
      const uploadedDocs: Array<{type: string, url: string}> = [];
      
      // อัพโหลดไฟล์ในพื้นหลัง (ไม่บล็อกการบันทึกข้อมูล)
      const uploadPromises = Object.entries(documents).map(async ([key, file]) => {
        if (file) {
          try {
            console.log('Uploading file:', key, file.name);
            const formData = new FormData();
            formData.append('file', file);
            const response = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            });

            console.log('Upload response status:', response.status);
            if (response.ok) {
              const data = await response.json();
              console.log('Upload success:', data);
              return { type: key, url: data.url };
            } else {
              const errorText = await response.text();
              console.error('Upload failed:', errorText);
              return null;
            }
          } catch (error) {
            console.error('Upload error:', error);
            return null;
          }
        }
        return null;
      });
      
      // รอให้อัพโหลดเสร็จทั้งหมด (แต่ไม่บล็อกถ้ามี error)
      const results = await Promise.allSettled(uploadPromises);
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          uploadedDocs.push(result.value);
        }
      });

      // สร้างข้อมูลนายจ้าง (เอกสารเป็น optional)
      console.log('Creating employer with docs:', uploadedDocs);
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
        documentsUrl: uploadedDocs.length > 0 ? JSON.stringify(uploadedDocs) : undefined,
      });
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการอัพโหลดเอกสาร");
    }
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
                <SelectItem value="individual" className="bg-blue-50 hover:bg-blue-100 data-[state=checked]:bg-blue-200">บุคคลธรรมดา</SelectItem>
                <SelectItem value="company" className="bg-green-50 hover:bg-green-100 data-[state=checked]:bg-green-200">นิติบุคคล</SelectItem>
                <SelectItem value="partnership" className="bg-purple-50 hover:bg-purple-100 data-[state=checked]:bg-purple-200">ห้างหุ้นส่วน</SelectItem>
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

      {/* เอกสารประกอบ */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">เอกสารประกอบ</h3>
        <p className="text-sm text-muted-foreground">
          อัพโหลดเอกสารที่จำเป็น (รองรับไฟล์ JPG, PNG, PDF ขนาดไม่เกิน 10MB)
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'idCard', label: 'บัตรประชาชน' },
            { key: 'houseRegistration', label: 'ทะเบียนบ้าน' },
            { key: 'leaseContract', label: 'สัญญาเช่า' },
            { key: 'companyRegistration', label: 'เอกสารการจดทะเบียน' },
            { key: 'powerOfAttorney', label: 'หนังสือมอบอำนาจ' },
            { key: 'other', label: 'เอกสารอื่นๆ' },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-2">
              <Label>{label}</Label>
              <div className="flex gap-2 items-center">
                <input
                  ref={fileInputRefs[key as keyof typeof fileInputRefs]}
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 10 * 1024 * 1024) {
                        toast.error("ไฟล์มีขนาดใหญ่เกิน 10MB");
                        return;
                      }
                      setDocuments(prev => ({ ...prev, [key]: file }));
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRefs[key as keyof typeof fileInputRefs].current?.click()}
                  className="flex-1"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {documents[key] ? "เปลี่ยนไฟล์" : "อัพโหลด"}
                </Button>
                {documents[key] && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setDocuments(prev => ({ ...prev, [key]: null }))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {documents[key] && (
                <p className="text-xs text-muted-foreground">
                  ✓ {documents[key]!.name}
                </p>
              )}
            </div>
          ))}
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

