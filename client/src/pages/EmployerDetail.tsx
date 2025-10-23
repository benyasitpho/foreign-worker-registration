import { useParams, useLocation, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Building2, Phone, Mail, MapPin, Upload, FileText, Eye, Edit, Save, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState, useRef } from "react";
import { toast } from "sonner";

export default function EmployerDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  
  const employerId = parseInt(id || "0");
  
  const { data: employer, isLoading: employerLoading } = trpc.employers.getById.useQuery({ id: employerId });
  const { data: workers, isLoading: workersLoading } = trpc.workers.getByEmployerId.useQuery({ employerId });
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const updateEmployer = trpc.employers.update.useMutation({
    onSuccess: () => {
      toast.success("บันทึกข้อมูลเรียบร้อยแล้ว");
      trpc.useUtils().employers.getById.invalidate({ id: employerId });
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    },
  });

  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const fileInputRefs = {
    idCard: useRef<HTMLInputElement>(null),
    houseRegistration: useRef<HTMLInputElement>(null),
    leaseContract: useRef<HTMLInputElement>(null),
    companyRegistration: useRef<HTMLInputElement>(null),
    powerOfAttorney: useRef<HTMLInputElement>(null),
    other: useRef<HTMLInputElement>(null),
  };

  const getEmployerTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      individual: "บุคคลธรรมดา",
      company: "นิติบุคคล",
      partnership: "ห้างหุ้นส่วน",
    };
    return types[type] || type;
  };

  const getStatusBadge = (status: string | null) => {
    if (status === "resigned") {
      return <Badge variant="destructive">ออกแล้ว</Badge>;
    }
    return <Badge variant="default" className="bg-green-600">อยู่</Badge>;
  };

  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const handleEdit = () => {
    if (employer) {
      setFormData({
        employerType: employer.employerType || "",
        companyName: employer.companyName || "",
        registrationNumber: employer.registrationNumber || "",
        taxId: employer.taxId || "",
        address: employer.address || "",
        subdistrict: employer.subdistrict || "",
        district: employer.district || "",
        province: employer.province || "",
        postalCode: employer.postalCode || "",
        phone: employer.phone || "",
        fax: employer.fax || "",
        email: employer.email || "",
        businessType: employer.businessType || "",
        numberOfEmployees: employer.numberOfEmployees || 0,
        capitalAmount: employer.capitalAmount || 0,
        contactPerson: employer.contactPerson || "",
        contactPosition: employer.contactPosition || "",
      });
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
  };

  const handleSave = () => {
    updateEmployer.mutate({
      id: employerId,
      data: formData,
    });
  };

  const handleFileUpload = async (type: string, file: File) => {
    if (!employer) return;

    setUploadingDoc(type);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('อัพโหลดไฟล์ไม่สำเร็จ');
      }

      const data = await response.json();
      const fileUrl = data.url;

      // Parse existing documents
      let documents: Array<{type: string, url: string}> = [];
      if (employer.documentsUrl) {
        try {
          documents = JSON.parse(employer.documentsUrl);
        } catch (e) {
          documents = [];
        }
      }

      // Remove existing document of the same type
      documents = documents.filter(doc => doc.type !== type);
      
      // Add new document
      documents.push({ type, url: fileUrl });

      // Update employer with new documents
      updateEmployer.mutate({
        id: employerId,
        data: {
          documentsUrl: JSON.stringify(documents),
        },
      });
    } catch (error: any) {
      toast.error(error.message || "เกิดข้อผิดพลาดในการอัพโหลด");
    } finally {
      setUploadingDoc(null);
    }
  };

  const getDocumentUrl = (type: string) => {
    if (!employer?.documentsUrl) return null;
    try {
      const documents = JSON.parse(employer.documentsUrl);
      const doc = documents.find((d: any) => d.type === type);
      return doc?.url || null;
    } catch {
      return null;
    }
  };

  const documentTypes = [
    { key: "idCard", label: "บัตรประชาชน" },
    { key: "houseRegistration", label: "ทะเบียนบ้าน" },
    { key: "leaseContract", label: "สัญญาเช่า" },
    { key: "companyRegistration", label: "เอกสารการจดทะเบียน" },
    { key: "powerOfAttorney", label: "หนังสือมอบอำนาจ" },
    { key: "other", label: "เอกสารอื่นๆ" },
  ];

  if (employerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (!employer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>ไม่พบข้อมูล</CardTitle>
            <CardDescription>ไม่พบข้อมูลนายจ้างที่ต้องการ</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              กลับหน้าหลัก
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => setLocation("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            กลับหน้าหลัก
          </Button>
          {!isEditing ? (
            <Button onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              แก้ไขข้อมูล
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                ยกเลิก
              </Button>
              <Button onClick={handleSave} disabled={updateEmployer.isPending}>
                <Save className="h-4 w-4 mr-2" />
                บันทึก
              </Button>
            </div>
          )}
        </div>

        {/* Employer Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">{employer.companyName}</CardTitle>
                <CardDescription>
                  <Badge variant="outline">{getEmployerTypeLabel(employer.employerType)}</Badge>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isEditing ? (
              <>
                {/* View Mode */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-2">ข้อมูลทั่วไป</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">ประเภท:</span> {getEmployerTypeLabel(employer.employerType)}</p>
                        <p><span className="text-muted-foreground">เลขทะเบียน:</span> {employer.registrationNumber || "-"}</p>
                        <p><span className="text-muted-foreground">เลขประจำตัวผู้เสียภาษี:</span> {employer.taxId || "-"}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-2">ที่อยู่</h3>
                      <div className="space-y-2 text-sm">
                        <p>{employer.address}</p>
                        <p>ตำบล/แขวง: {employer.subdistrict || "-"}</p>
                        <p>อำเภอ/เขต: {employer.district || "-"}</p>
                        <p>จังหวัด: {employer.province || "-"}</p>
                        <p>รหัสไปรษณีย์: {employer.postalCode || "-"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-2">ติดต่อ</h3>
                      <div className="space-y-2 text-sm">
                        <p className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {employer.phone || "-"}
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          แฟกซ์: {employer.fax || "-"}
                        </p>
                        <p className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {employer.email || "-"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-2">ธุรกิจ</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">ประเภทธุรกิจ:</span> {employer.businessType || "-"}</p>
                        <p><span className="text-muted-foreground">จำนวนพนักงาน:</span> {employer.numberOfEmployees || 0} คน</p>
                        <p><span className="text-muted-foreground">ทุนจดทะเบียน:</span> {employer.capitalAmount || 0} บาท</p>
                        <p><span className="text-muted-foreground">ผู้ติดต่อ:</span> {employer.contactPerson || "-"}</p>
                        <p><span className="text-muted-foreground">ตำแหน่ง:</span> {employer.contactPosition || "-"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Edit Mode */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>ประเภทนายจ้าง *</Label>
                      <Select value={formData.employerType} onValueChange={(value) => setFormData({...formData, employerType: value})}>
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

                    <div>
                      <Label>ชื่อ-นามสกุล/ชื่อนิติบุคคล *</Label>
                      <Input
                        value={formData.companyName}
                        onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                        placeholder="ระบุชื่อ-นามสกุล/ชื่อนิติบุคคล"
                      />
                    </div>

                    <div>
                      <Label>เลขทะเบียนนิติบุคคล</Label>
                      <Input
                        value={formData.registrationNumber}
                        onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
                        placeholder="0-0000-00000-00-0"
                      />
                    </div>

                    <div>
                      <Label>เลขประจำตัวผู้เสียภาษี</Label>
                      <Input
                        value={formData.taxId}
                        onChange={(e) => setFormData({...formData, taxId: e.target.value})}
                        placeholder="0000000000000"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>ที่อยู่</Label>
                    <Textarea
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="บ้านเลขที่ ถนน ซอย"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>แขวง/ตำบล</Label>
                      <Input
                        value={formData.subdistrict}
                        onChange={(e) => setFormData({...formData, subdistrict: e.target.value})}
                        placeholder="ระบุแขวง/ตำบล"
                      />
                    </div>

                    <div>
                      <Label>เขต/อำเภอ</Label>
                      <Input
                        value={formData.district}
                        onChange={(e) => setFormData({...formData, district: e.target.value})}
                        placeholder="ระบุเขต/อำเภอ"
                      />
                    </div>

                    <div>
                      <Label>จังหวัด</Label>
                      <Input
                        value={formData.province}
                        onChange={(e) => setFormData({...formData, province: e.target.value})}
                        placeholder="ระบุจังหวัด"
                      />
                    </div>

                    <div>
                      <Label>รหัสไปรษณีย์</Label>
                      <Input
                        value={formData.postalCode}
                        onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                        placeholder="00000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>โทรศัพท์</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="0X-XXXX-XXXX"
                      />
                    </div>

                    <div>
                      <Label>โทรสาร</Label>
                      <Input
                        value={formData.fax}
                        onChange={(e) => setFormData({...formData, fax: e.target.value})}
                        placeholder="0X-XXXX-XXXX"
                      />
                    </div>

                    <div>
                      <Label>อีเมล</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="example@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>ประเภทธุรกิจ</Label>
                      <Input
                        value={formData.businessType}
                        onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                        placeholder="เช่น การผลิต, บริการ, ค้าขาย"
                      />
                    </div>

                    <div>
                      <Label>จำนวนพนักงาน</Label>
                      <Input
                        type="number"
                        value={formData.numberOfEmployees}
                        onChange={(e) => setFormData({...formData, numberOfEmployees: parseInt(e.target.value) || 0})}
                        placeholder="จำนวนพนักงานทั้งหมด"
                      />
                    </div>

                    <div>
                      <Label>ทุนจดทะเบียน (บาท)</Label>
                      <Input
                        type="number"
                        value={formData.capitalAmount}
                        onChange={(e) => setFormData({...formData, capitalAmount: parseInt(e.target.value) || 0})}
                        placeholder="ทุนจดทะเบียน"
                      />
                    </div>

                    <div>
                      <Label>ผู้ติดต่อ</Label>
                      <Input
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                        placeholder="ชื่อผู้ติดต่อ"
                      />
                    </div>

                    <div>
                      <Label>ตำแหน่งผู้ติดต่อ</Label>
                      <Input
                        value={formData.contactPosition}
                        onChange={(e) => setFormData({...formData, contactPosition: e.target.value})}
                        placeholder="ตำแหน่งผู้ติดต่อ"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Documents Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>เอกสารประกอบ</CardTitle>
            <CardDescription>อัพโหลดเอกสารที่เกี่ยวข้อง (รองรับไฟล์ JPG, PNG, PDF ขนาดไม่เกิน 10MB)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documentTypes.map((docType) => {
                const docUrl = getDocumentUrl(docType.key);
                return (
                  <div key={docType.key} className="border rounded-lg p-4">
                    <Label className="text-sm font-medium mb-2 block">{docType.label}</Label>
                    <div className="flex gap-2">
                      <input
                        ref={fileInputRefs[docType.key as keyof typeof fileInputRefs]}
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 10 * 1024 * 1024) {
                              toast.error("ไฟล์มีขนาดใหญ่เกิน 10MB");
                              return;
                            }
                            handleFileUpload(docType.key, file);
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => fileInputRefs[docType.key as keyof typeof fileInputRefs].current?.click()}
                        disabled={uploadingDoc === docType.key}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadingDoc === docType.key ? "กำลังอัพโหลด..." : "อัพโหลด"}
                      </Button>
                      {docUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(docUrl, "_blank")}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          ดู
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Workers List */}
        <Card>
          <CardHeader>
            <CardTitle>รายชื่อลูกจ้างต่างด้าว</CardTitle>
            <CardDescription>
              {workersLoading ? "กำลังโหลด..." : `ทั้งหมด ${workers?.length || 0} คน`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {workersLoading ? (
              <p className="text-center text-muted-foreground py-8">กำลังโหลดข้อมูล...</p>
            ) : workers && workers.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ลำดับ</TableHead>
                      <TableHead>ชื่อ-นามสกุล</TableHead>
                      <TableHead>สัญชาติ</TableHead>
                      <TableHead>เลขหนังสือเดินทาง</TableHead>
                      <TableHead>สถานะ</TableHead>
                      <TableHead>วันที่ออก</TableHead>
                      <TableHead className="text-right">จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workers.map((worker, index) => (
                      <TableRow key={worker.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{worker.fullName}</TableCell>
                        <TableCell>{worker.nationality}</TableCell>
                        <TableCell>{worker.passportNo}</TableCell>
                        <TableCell>{getStatusBadge(worker.employmentStatus)}</TableCell>
                        <TableCell>{formatDate(worker.resignationDate)}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/worker/${worker.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              ดูรายละเอียด
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">ยังไม่มีลูกจ้างในระบบ</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

