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
    title: "",
    fullName: "",
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
    employerId: "",
    employerName: "",
    position: "",
    salary: "",
    workStartDate: "",
    workLocation: "",
    jobDescription: "",
    
    // การศึกษาและสุขภาพ
    educationLevel: "",
    educationDetails: "",
    bloodType: "",
    allergies: "",
    medicalConditions: "",
    
    // หมายเหตุ
    notes: "",
    
    // สถานะการทำงาน
    employmentStatus: "active",
    resignationDate: "",
  });
  
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [documents, setDocuments] = useState<File[]>([]);

  const resetForm = () => {
    setFormData({
      title: "",
      fullName: "",
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
      employerId: "",
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
      notes: "",
      employmentStatus: "active",
      resignationDate: "",
    });
    setProfilePhoto(null);
    setDocuments([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.nationality || !formData.passportNo) {
      toast.error("กรุณากรอกข้อมูลที่จำเป็น");
      return;
    }

    try {
      let profilePhotoUrl: string | undefined;
      let documentsUrls: string[] = [];

      // อัพโหลดรูปโปรไฟล์
      if (profilePhoto) {
        const formData = new FormData();
        formData.append('file', profilePhoto);
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (response.ok) {
          const data = await response.json();
          profilePhotoUrl = data.url;
        }
      }

      // อัพโหลดเอกสาร
      if (documents.length > 0) {
        for (const doc of documents) {
          const formData = new FormData();
          formData.append('file', doc);
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          if (response.ok) {
            const data = await response.json();
            documentsUrls.push(data.url);
          }
        }
      }

      createWorker.mutate({
      title: formData.title || undefined,
      fullName: formData.fullName,
      nationality: formData.nationality,
      passportNo: formData.passportNo,
      dateOfBirth: formData.dateOfBirth || undefined,
      gender: (formData.gender as "male" | "female") || undefined,
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
      employerId: formData.employerId ? Number(formData.employerId) : undefined,
      employerName: formData.employerName || undefined,
      position: formData.position || undefined,
      salary: formData.salary ? Number(formData.salary) : undefined,
      workStartDate: formData.workStartDate || undefined,
      workLocation: formData.workLocation || undefined,
      jobDescription: formData.jobDescription || undefined,
      educationLevel: formData.educationLevel || undefined,
      educationDetails: formData.educationDetails || undefined,
      bloodType: formData.bloodType || undefined,
      allergies: formData.allergies || undefined,
      medicalConditions: formData.medicalConditions || undefined,
      notes: formData.notes || undefined,
      employmentStatus: formData.employmentStatus || undefined,
      resignationDate: formData.resignationDate || undefined,
      profilePhotoUrl: profilePhotoUrl,
      documentsUrl: documentsUrls.length > 0 ? JSON.stringify(documentsUrls) : undefined,
    });
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการอัพโหลดไฟล์");
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ข้อมูลส่วนตัว */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">ข้อมูลส่วนตัว</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">คำนำหน้า</Label>
            <Select value={formData.title} onValueChange={(value) => setFormData({...formData, title: value})}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกคำนำหน้า" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MR">MR</SelectItem>
                <SelectItem value="MRS">MRS</SelectItem>
                <SelectItem value="MISS">MISS</SelectItem>
                <SelectItem value="MS">MS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="fullName">ชื่อ-นามสกุล (อังกฤษ) <span className="text-destructive">*</span></Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              placeholder="เช่น JOHN DOE"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nationality">สัญชาติ <span className="text-destructive">*</span></Label>
            <Select value={formData.nationality} onValueChange={(value) => setFormData({...formData, nationality: value})} required>
              <SelectTrigger>
                <SelectValue placeholder="เลือกสัญชาติ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Myanmar">พม่า (Myanmar)</SelectItem>
                <SelectItem value="Cambodia">กัมพูชา (Cambodia)</SelectItem>
                <SelectItem value="Laos">ลาว (Laos)</SelectItem>
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
              onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">เพศ</Label>
            <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
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
        <h3 className="text-lg font-semibold text-foreground">เอกสารประจำตัว</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="passportNo">เลขที่หนังสือเดินทาง <span className="text-destructive">*</span></Label>
            <Input
              id="passportNo"
              value={formData.passportNo}
              onChange={(e) => setFormData({...formData, passportNo: e.target.value})}
              placeholder="เช่น AB1234567"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="passportIssueDate">วันที่ออก</Label>
            <Input
              id="passportIssueDate"
              type="date"
              value={formData.passportIssueDate}
              onChange={(e) => setFormData({...formData, passportIssueDate: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="passportExpiryDate">วันหมดอายุ</Label>
            <Input
              id="passportExpiryDate"
              type="date"
              value={formData.passportExpiryDate}
              onChange={(e) => setFormData({...formData, passportExpiryDate: e.target.value})}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="visaType">ประเภทวีซ่า</Label>
            <Input
              id="visaType"
              value={formData.visaType}
              onChange={(e) => setFormData({...formData, visaType: e.target.value})}
              placeholder="เช่น NON-B"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="visaNo">เลขที่วีซ่า</Label>
            <Input
              id="visaNo"
              value={formData.visaNo}
              onChange={(e) => setFormData({...formData, visaNo: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="visaExpiryDate">วันหมดอายุวีซ่า</Label>
            <Input
              id="visaExpiryDate"
              type="date"
              value={formData.visaExpiryDate}
              onChange={(e) => setFormData({...formData, visaExpiryDate: e.target.value})}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="workPermitNo">เลขที่ใบอนุญาตทำงาน</Label>
            <Input
              id="workPermitNo"
              value={formData.workPermitNo}
              onChange={(e) => setFormData({...formData, workPermitNo: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workPermitExpiryDate">วันหมดอายุใบอนุญาตทำงาน</Label>
            <Input
              id="workPermitExpiryDate"
              type="date"
              value={formData.workPermitExpiryDate}
              onChange={(e) => setFormData({...formData, workPermitExpiryDate: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* ที่อยู่ในประเทศไทย */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">ที่อยู่ในประเทศไทย</h3>
        
        <div className="space-y-2">
          <Label htmlFor="addressTh">ที่อยู่</Label>
          <Textarea
            id="addressTh"
            value={formData.addressTh}
            onChange={(e) => setFormData({...formData, addressTh: e.target.value})}
            placeholder="บ้านเลขที่ ถนน ซอย"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="subdistrictTh">ตำบล/แขวง</Label>
            <Input
              id="subdistrictTh"
              value={formData.subdistrictTh}
              onChange={(e) => setFormData({...formData, subdistrictTh: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="districtTh">อำเภอ/เขต</Label>
            <Input
              id="districtTh"
              value={formData.districtTh}
              onChange={(e) => setFormData({...formData, districtTh: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="provinceTh">จังหวัด</Label>
            <Input
              id="provinceTh"
              value={formData.provinceTh}
              onChange={(e) => setFormData({...formData, provinceTh: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCodeTh">รหัสไปรษณีย์</Label>
            <Input
              id="postalCodeTh"
              value={formData.postalCodeTh}
              onChange={(e) => setFormData({...formData, postalCodeTh: e.target.value})}
              placeholder="00000"
            />
          </div>
        </div>
      </div>

      {/* ข้อมูลติดต่อ */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">ข้อมูลติดต่อ</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">โทรศัพท์</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="0X-XXXX-XXXX"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">อีเมล</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="example@email.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="emergencyContact">ผู้ติดต่อฉุกเฉิน</Label>
            <Input
              id="emergencyContact"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
              placeholder="ชื่อ-นามสกุล"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyPhone">โทรศัพท์ฉุกเฉิน</Label>
            <Input
              id="emergencyPhone"
              value={formData.emergencyPhone}
              onChange={(e) => setFormData({...formData, emergencyPhone: e.target.value})}
              placeholder="0X-XXXX-XXXX"
            />
          </div>
        </div>
      </div>

      {/* ข้อมูลการทำงาน */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">ข้อมูลการทำงาน</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="employerName">ชื่อนายจ้าง</Label>
            <Input
              id="employerName"
              value={formData.employerName}
              onChange={(e) => setFormData({...formData, employerName: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">ตำแหน่งงาน</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => setFormData({...formData, position: e.target.value})}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="salary">เงินเดือน (บาท)</Label>
            <Input
              id="salary"
              type="number"
              value={formData.salary}
              onChange={(e) => setFormData({...formData, salary: e.target.value})}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workStartDate">วันเริ่มงาน</Label>
            <Input
              id="workStartDate"
              type="date"
              value={formData.workStartDate}
              onChange={(e) => setFormData({...formData, workStartDate: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="workLocation">สถานที่ทำงาน</Label>
          <Textarea
            id="workLocation"
            value={formData.workLocation}
            onChange={(e) => setFormData({...formData, workLocation: e.target.value})}
            placeholder="ที่อยู่สถานประกอบการ"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="jobDescription">ลักษณะงาน</Label>
          <Textarea
            id="jobDescription"
            value={formData.jobDescription}
            onChange={(e) => setFormData({...formData, jobDescription: e.target.value})}
            placeholder="รายละเอียดงานที่ทำ"
            rows={3}
          />
        </div>
      </div>

      {/* การศึกษาและสุขภาพ */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">การศึกษาและสุขภาพ</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="educationLevel">ระดับการศึกษา</Label>
            <Select value={formData.educationLevel} onValueChange={(value) => setFormData({...formData, educationLevel: value})}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกระดับการศึกษา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ประถม">ประถมศึกษา</SelectItem>
                <SelectItem value="มัธยม">มัธยมศึกษา</SelectItem>
                <SelectItem value="ปวช">ปวช.</SelectItem>
                <SelectItem value="ปวส">ปวส.</SelectItem>
                <SelectItem value="ปริญญาตรี">ปริญญาตรี</SelectItem>
                <SelectItem value="สูงกว่าปริญญาตรี">สูงกว่าปริญญาตรี</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bloodType">กรุ๊ปเลือด</Label>
            <Select value={formData.bloodType} onValueChange={(value) => setFormData({...formData, bloodType: value})}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกกรุ๊ปเลือด" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="AB">AB</SelectItem>
                <SelectItem value="O">O</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="educationDetails">รายละเอียดการศึกษา</Label>
          <Textarea
            id="educationDetails"
            value={formData.educationDetails}
            onChange={(e) => setFormData({...formData, educationDetails: e.target.value})}
            placeholder="สถาบัน สาขา ปีที่จบ"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="allergies">อาการแพ้</Label>
          <Textarea
            id="allergies"
            value={formData.allergies}
            onChange={(e) => setFormData({...formData, allergies: e.target.value})}
            placeholder="ระบุอาการแพ้ (ถ้ามี)"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="medicalConditions">โรคประจำตัว</Label>
          <Textarea
            id="medicalConditions"
            value={formData.medicalConditions}
            onChange={(e) => setFormData({...formData, medicalConditions: e.target.value})}
            placeholder="ระบุโรคประจำตัว (ถ้ามี)"
            rows={2}
          />
        </div>
      </div>

      {/* สถานะการทำงาน */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">สถานะการทำงาน</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="employmentStatus">สถานะ</Label>
            <Select value={formData.employmentStatus} onValueChange={(value) => setFormData({...formData, employmentStatus: value})}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกสถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">อยู่</SelectItem>
                <SelectItem value="resigned">ออกแล้ว</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.employmentStatus === "resigned" && (
            <div className="space-y-2">
              <Label htmlFor="resignationDate">วันที่ออก</Label>
              <Input
                id="resignationDate"
                type="date"
                value={formData.resignationDate}
                onChange={(e) => setFormData({...formData, resignationDate: e.target.value})}
              />
            </div>
          )}
        </div>
      </div>

      {/* รูปโปรไฟล์และเอกสาร */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">รูปและเอกสาร</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="profilePhoto">รูปถ่ายหน้าตรง (โปรไฟล์)</Label>
            <Input
              id="profilePhoto"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > 5 * 1024 * 1024) {
                    toast.error("ไฟล์รูปต้องไม่เกิน 5MB");
                    return;
                  }
                  setProfilePhoto(file);
                }
              }}
            />
            {profilePhoto && (
              <p className="text-sm text-muted-foreground">
                เลือกไฟล์: {profilePhoto.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="documents">เอกสาร PDF</Label>
            <Input
              id="documents"
              type="file"
              accept=".pdf"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                const validFiles = files.filter(file => {
                  if (file.size > 10 * 1024 * 1024) {
                    toast.error(`ไฟล์ ${file.name} ต้องไม่เกิน 10MB`);
                    return false;
                  }
                  return true;
                });
                setDocuments(validFiles);
              }}
            />
            {documents.length > 0 && (
              <div className="text-sm text-muted-foreground">
                <p>เลือกไฟล์: {documents.length} ไฟล์</p>
                <ul className="list-disc list-inside">
                  {documents.map((doc, idx) => (
                    <li key={idx}>{doc.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* หมายเหตุ */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">หมายเหตุ</h3>
        
        <div className="space-y-2">
          <Label htmlFor="notes">หมายเหตุเพิ่มเติม</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="ข้อมูลเพิ่มเติม (ถ้ามี)"
            rows={3}
          />
        </div>
      </div>

      {/* ปุ่มบันทึก */}
      <div className="flex gap-4 justify-end pt-4 border-t">
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

