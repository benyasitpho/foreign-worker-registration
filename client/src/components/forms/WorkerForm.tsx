import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function WorkerForm() {
  const utils = trpc.useUtils();
  const createWorker = trpc.workers.create.useMutation({
    onSuccess: () => {
      toast.success("บันทึกข้อมูลลูกจ้างเรียบร้อยแล้ว");
      utils.workers.list.invalidate();
      resetForm();
    },
    onError: (error) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    },
  });

  const [formData, setFormData] = useState({
    // ข้อมูลส่วนตัว
    titleTh: "",
    firstNameTh: "",
    lastNameTh: "",
    titleEn: "",
    firstNameEn: "",
    lastNameEn: "",
    nationality: "",
    dateOfBirth: "",
    gender: "",
    
    // เอกสารประจำตัว
    passportNo: "",
    passportIssueDate: "",
    passportExpiryDate: "",
    visaType: "",
    visaNo: "",
    visaExpiryDate: "",
    workPermitNo: "",
    workPermitExpiryDate: "",
    
    // ที่อยู่ในประเทศไทย
    addressTh: "",
    subdistrictTh: "",
    districtTh: "",
    provinceTh: "",
    postalCodeTh: "",
    
    // ข้อมูลติดต่อ
    phone: "",
    email: "",
    emergencyContact: "",
    emergencyPhone: "",
    
    // ข้อมูลการทำงาน
    employerName: "",
    position: "",
    salary: "",
    workStartDate: "",
    workLocation: "",
    jobDescription: "",
    
    // ข้อมูลการศึกษา
    educationLevel: "",
    educationDetails: "",
    
    // ข้อมูลสุขภาพ
    bloodType: "",
    allergies: "",
    medicalConditions: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      titleTh: "",
      firstNameTh: "",
      lastNameTh: "",
      titleEn: "",
      firstNameEn: "",
      lastNameEn: "",
      nationality: "",
      dateOfBirth: "",
      gender: "",
      passportNo: "",
      passportIssueDate: "",
      passportExpiryDate: "",
      visaType: "",
      visaNo: "",
      visaExpiryDate: "",
      workPermitNo: "",
      workPermitExpiryDate: "",
      addressTh: "",
      subdistrictTh: "",
      districtTh: "",
      provinceTh: "",
      postalCodeTh: "",
      phone: "",
      email: "",
      emergencyContact: "",
      emergencyPhone: "",
      employerName: "",
      position: "",
      salary: "",
      workStartDate: "",
      workLocation: "",
      jobDescription: "",
      educationLevel: "",
      educationDetails: "",
      bloodType: "",
      allergies: "",
      medicalConditions: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!formData.firstNameTh || !formData.lastNameTh || !formData.nationality || !formData.passportNo) {
      toast.error("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }

    createWorker.mutate({
      titleTh: formData.titleTh || undefined,
      firstNameTh: formData.firstNameTh,
      lastNameTh: formData.lastNameTh,
      titleEn: formData.titleEn || undefined,
      firstNameEn: formData.firstNameEn || undefined,
      lastNameEn: formData.lastNameEn || undefined,
      nationality: formData.nationality,
      dateOfBirth: formData.dateOfBirth || undefined,
      gender: formData.gender ? (formData.gender as "male" | "female") : undefined,
      passportNo: formData.passportNo,
      passportIssueDate: formData.passportIssueDate || undefined,
      passportExpiryDate: formData.passportExpiryDate || undefined,
      visaType: formData.visaType || undefined,
      visaNo: formData.visaNo || undefined,
      visaExpiryDate: formData.visaExpiryDate || undefined,
      workPermitNo: formData.workPermitNo || undefined,
      workPermitExpiryDate: formData.workPermitExpiryDate || undefined,
      addressTh: formData.addressTh || undefined,
      subdistrictTh: formData.subdistrictTh || undefined,
      districtTh: formData.districtTh || undefined,
      provinceTh: formData.provinceTh || undefined,
      postalCodeTh: formData.postalCodeTh || undefined,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      emergencyContact: formData.emergencyContact || undefined,
      emergencyPhone: formData.emergencyPhone || undefined,
      employerName: formData.employerName || undefined,
      position: formData.position || undefined,
      salary: formData.salary ? parseInt(formData.salary) : undefined,
      workStartDate: formData.workStartDate || undefined,
      workLocation: formData.workLocation || undefined,
      jobDescription: formData.jobDescription || undefined,
      educationLevel: formData.educationLevel || undefined,
      educationDetails: formData.educationDetails || undefined,
      bloodType: formData.bloodType || undefined,
      allergies: formData.allergies || undefined,
      medicalConditions: formData.medicalConditions || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ข้อมูลส่วนตัว */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">ข้อมูลส่วนตัว</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="titleTh">คำนำหน้า (ไทย)</Label>
            <Select value={formData.titleTh} onValueChange={(value) => handleChange("titleTh", value)}>
              <SelectTrigger>
                <SelectValue placeholder="เลือก" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="นาย">นาย</SelectItem>
                <SelectItem value="นาง">นาง</SelectItem>
                <SelectItem value="นางสาว">นางสาว</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-3">
            <Label htmlFor="firstNameTh">ชื่อ (ไทย) <span className="text-destructive">*</span></Label>
            <Input
              id="firstNameTh"
              value={formData.firstNameTh}
              onChange={(e) => handleChange("firstNameTh", e.target.value)}
              placeholder="ชื่อภาษาไทย"
            />
          </div>

          <div className="space-y-2 md:col-span-4">
            <Label htmlFor="lastNameTh">นามสกุล (ไทย) <span className="text-destructive">*</span></Label>
            <Input
              id="lastNameTh"
              value={formData.lastNameTh}
              onChange={(e) => handleChange("lastNameTh", e.target.value)}
              placeholder="นามสกุลภาษาไทย"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="titleEn">Title (English)</Label>
            <Select value={formData.titleEn} onValueChange={(value) => handleChange("titleEn", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mr.">Mr.</SelectItem>
                <SelectItem value="Mrs.">Mrs.</SelectItem>
                <SelectItem value="Miss">Miss</SelectItem>
                <SelectItem value="Ms.">Ms.</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-3">
            <Label htmlFor="firstNameEn">First Name (English)</Label>
            <Input
              id="firstNameEn"
              value={formData.firstNameEn}
              onChange={(e) => handleChange("firstNameEn", e.target.value)}
              placeholder="First name in English"
            />
          </div>

          <div className="space-y-2 md:col-span-4">
            <Label htmlFor="lastNameEn">Last Name (English)</Label>
            <Input
              id="lastNameEn"
              value={formData.lastNameEn}
              onChange={(e) => handleChange("lastNameEn", e.target.value)}
              placeholder="Last name in English"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nationality">สัญชาติ <span className="text-destructive">*</span></Label>
            <Select value={formData.nationality} onValueChange={(value) => handleChange("nationality", value)}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกสัญชาติ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Myanmar">พม่า (Myanmar)</SelectItem>
                <SelectItem value="Laos">ลาว (Laos)</SelectItem>
                <SelectItem value="Cambodia">กัมพูชา (Cambodia)</SelectItem>
                <SelectItem value="Vietnam">เวียดนาม (Vietnam)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">วันเกิด</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleChange("dateOfBirth", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">เพศ</Label>
            <Select value={formData.gender} onValueChange={(value) => handleChange("gender", value)}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกเพศ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">ชาย</SelectItem>
                <SelectItem value="female">หญิง</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* เอกสารประจำตัว */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">เอกสารประจำตัว</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="passportNo">เลขที่หนังสือเดินทาง <span className="text-destructive">*</span></Label>
            <Input
              id="passportNo"
              value={formData.passportNo}
              onChange={(e) => handleChange("passportNo", e.target.value)}
              placeholder="Passport Number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="passportIssueDate">วันที่ออก</Label>
            <Input
              id="passportIssueDate"
              type="date"
              value={formData.passportIssueDate}
              onChange={(e) => handleChange("passportIssueDate", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="passportExpiryDate">วันหมดอายุ</Label>
            <Input
              id="passportExpiryDate"
              type="date"
              value={formData.passportExpiryDate}
              onChange={(e) => handleChange("passportExpiryDate", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="visaType">ประเภทวีซ่า</Label>
            <Select value={formData.visaType} onValueChange={(value) => handleChange("visaType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกประเภท" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Non-B">Non-B (ทำงาน)</SelectItem>
                <SelectItem value="Non-O">Non-O (อื่นๆ)</SelectItem>
                <SelectItem value="Tourist">Tourist (ท่องเที่ยว)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="visaNo">เลขที่วีซ่า</Label>
            <Input
              id="visaNo"
              value={formData.visaNo}
              onChange={(e) => handleChange("visaNo", e.target.value)}
              placeholder="Visa Number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="visaExpiryDate">วันหมดอายุวีซ่า</Label>
            <Input
              id="visaExpiryDate"
              type="date"
              value={formData.visaExpiryDate}
              onChange={(e) => handleChange("visaExpiryDate", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="workPermitNo">เลขที่ใบอนุญาตทำงาน</Label>
            <Input
              id="workPermitNo"
              value={formData.workPermitNo}
              onChange={(e) => handleChange("workPermitNo", e.target.value)}
              placeholder="Work Permit Number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workPermitExpiryDate">วันหมดอายุใบอนุญาต</Label>
            <Input
              id="workPermitExpiryDate"
              type="date"
              value={formData.workPermitExpiryDate}
              onChange={(e) => handleChange("workPermitExpiryDate", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ที่อยู่ในประเทศไทย */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">ที่อยู่ในประเทศไทย</h3>
        
        <div className="space-y-2">
          <Label htmlFor="addressTh">ที่อยู่</Label>
          <Textarea
            id="addressTh"
            value={formData.addressTh}
            onChange={(e) => handleChange("addressTh", e.target.value)}
            placeholder="บ้านเลขที่ ถนน ซอย"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="subdistrictTh">แขวง/ตำบล</Label>
            <Input
              id="subdistrictTh"
              value={formData.subdistrictTh}
              onChange={(e) => handleChange("subdistrictTh", e.target.value)}
              placeholder="ระบุแขวง/ตำบล"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="districtTh">เขต/อำเภอ</Label>
            <Input
              id="districtTh"
              value={formData.districtTh}
              onChange={(e) => handleChange("districtTh", e.target.value)}
              placeholder="ระบุเขต/อำเภอ"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="provinceTh">จังหวัด</Label>
            <Input
              id="provinceTh"
              value={formData.provinceTh}
              onChange={(e) => handleChange("provinceTh", e.target.value)}
              placeholder="ระบุจังหวัด"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCodeTh">รหัสไปรษณีย์</Label>
            <Input
              id="postalCodeTh"
              value={formData.postalCodeTh}
              onChange={(e) => handleChange("postalCodeTh", e.target.value)}
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
            <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="0XX-XXX-XXXX"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">อีเมล</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="example@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyContact">ผู้ติดต่อฉุกเฉิน</Label>
            <Input
              id="emergencyContact"
              value={formData.emergencyContact}
              onChange={(e) => handleChange("emergencyContact", e.target.value)}
              placeholder="ชื่อผู้ติดต่อฉุกเฉิน"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyPhone">เบอร์ติดต่อฉุกเฉิน</Label>
            <Input
              id="emergencyPhone"
              value={formData.emergencyPhone}
              onChange={(e) => handleChange("emergencyPhone", e.target.value)}
              placeholder="0XX-XXX-XXXX"
            />
          </div>
        </div>
      </div>

      {/* ข้อมูลการทำงาน */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">ข้อมูลการทำงาน</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="employerName">ชื่อนายจ้าง</Label>
            <Input
              id="employerName"
              value={formData.employerName}
              onChange={(e) => handleChange("employerName", e.target.value)}
              placeholder="ชื่อบริษัท/นายจ้าง"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">ตำแหน่งงาน</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => handleChange("position", e.target.value)}
              placeholder="ตำแหน่ง"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="salary">เงินเดือน (บาท)</Label>
            <Input
              id="salary"
              type="number"
              value={formData.salary}
              onChange={(e) => handleChange("salary", e.target.value)}
              placeholder="จำนวนเงินเดือน"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workStartDate">วันที่เริ่มงาน</Label>
            <Input
              id="workStartDate"
              type="date"
              value={formData.workStartDate}
              onChange={(e) => handleChange("workStartDate", e.target.value)}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="workLocation">สถานที่ทำงาน</Label>
            <Input
              id="workLocation"
              value={formData.workLocation}
              onChange={(e) => handleChange("workLocation", e.target.value)}
              placeholder="ที่อยู่สถานที่ทำงาน"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="jobDescription">ลักษณะงาน</Label>
            <Textarea
              id="jobDescription"
              value={formData.jobDescription}
              onChange={(e) => handleChange("jobDescription", e.target.value)}
              placeholder="อธิบายลักษณะงานที่ทำ"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* ข้อมูลการศึกษา */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">ข้อมูลการศึกษา</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="educationLevel">ระดับการศึกษา</Label>
            <Select value={formData.educationLevel} onValueChange={(value) => handleChange("educationLevel", value)}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกระดับ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">ประถมศึกษา</SelectItem>
                <SelectItem value="secondary">มัธยมศึกษา</SelectItem>
                <SelectItem value="vocational">ปวช./ปวส.</SelectItem>
                <SelectItem value="bachelor">ปริญญาตรี</SelectItem>
                <SelectItem value="master">ปริญญาโท</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="educationDetails">รายละเอียดการศึกษา</Label>
            <Input
              id="educationDetails"
              value={formData.educationDetails}
              onChange={(e) => handleChange("educationDetails", e.target.value)}
              placeholder="สาขา/สถาบัน"
            />
          </div>
        </div>
      </div>

      {/* ข้อมูลสุขภาพ */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">ข้อมูลสุขภาพ</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bloodType">กรุ๊ปเลือด</Label>
            <Select value={formData.bloodType} onValueChange={(value) => handleChange("bloodType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="เลือก" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="AB">AB</SelectItem>
                <SelectItem value="O">O</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="allergies">อาการแพ้</Label>
            <Input
              id="allergies"
              value={formData.allergies}
              onChange={(e) => handleChange("allergies", e.target.value)}
              placeholder="ระบุอาการแพ้ (ถ้ามี)"
            />
          </div>

          <div className="space-y-2 md:col-span-3">
            <Label htmlFor="medicalConditions">โรคประจำตัว</Label>
            <Textarea
              id="medicalConditions"
              value={formData.medicalConditions}
              onChange={(e) => handleChange("medicalConditions", e.target.value)}
              placeholder="ระบุโรคประจำตัว (ถ้ามี)"
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* ปุ่มบันทึก */}
      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button type="button" variant="outline" onClick={resetForm}>
          ยกเลิก
        </Button>
        <Button type="submit" disabled={createWorker.isPending}>
          {createWorker.isPending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
        </Button>
      </div>
    </form>
  );
}

