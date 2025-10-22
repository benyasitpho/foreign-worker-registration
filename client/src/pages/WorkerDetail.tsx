import { useState, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, FileText, User, Save, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function WorkerDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  
  const workerId = parseInt(id || "0");
  
  const { data: worker, isLoading, refetch } = trpc.workers.getById.useQuery({ id: workerId });
  const updateWorker = trpc.workers.update.useMutation({
    onSuccess: () => {
      toast.success("อัพเดตข้อมูลเรียบร้อยแล้ว");
      refetch();
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState<{[key: string]: boolean}>({});
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const passportInputRef = useRef<HTMLInputElement>(null);
  const workPermitInputRef = useRef<HTMLInputElement>(null);
  const otherInputRef = useRef<HTMLInputElement>(null);

  const handleEdit = () => {
    setFormData({
      title: worker?.title || "",
      fullName: worker?.fullName || "",
      nationality: worker?.nationality || "",
      dateOfBirth: worker?.dateOfBirth ? new Date(worker.dateOfBirth).toISOString().split('T')[0] : "",
      gender: worker?.gender || "",
      passportNo: worker?.passportNo || "",
      passportIssueDate: worker?.passportIssueDate ? new Date(worker.passportIssueDate).toISOString().split('T')[0] : "",
      passportExpiryDate: worker?.passportExpiryDate ? new Date(worker.passportExpiryDate).toISOString().split('T')[0] : "",
      visaType: worker?.visaType || "",
      visaNo: worker?.visaNo || "",
      visaExpiryDate: worker?.visaExpiryDate ? new Date(worker.visaExpiryDate).toISOString().split('T')[0] : "",
      workPermitNo: worker?.workPermitNo || "",
      workPermitExpiryDate: worker?.workPermitExpiryDate ? new Date(worker.workPermitExpiryDate).toISOString().split('T')[0] : "",
      phone: worker?.phone || "",
      email: worker?.email || "",
      addressTh: worker?.addressTh || "",
      subdistrictTh: worker?.subdistrictTh || "",
      districtTh: worker?.districtTh || "",
      provinceTh: worker?.provinceTh || "",
      postalCodeTh: worker?.postalCodeTh || "",
      employerName: worker?.employerName || "",
      position: worker?.position || "",
      salary: worker?.salary || "",
      workStartDate: worker?.workStartDate ? new Date(worker.workStartDate).toISOString().split('T')[0] : "",
      employmentStatus: worker?.employmentStatus || "active",
      resignationDate: worker?.resignationDate ? new Date(worker.resignationDate).toISOString().split('T')[0] : "",
      notes: worker?.notes || "",
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!formData.fullName || !formData.nationality || !formData.passportNo) {
      toast.error("กรุณากรอกข้อมูลที่จำเป็น");
      return;
    }

    updateWorker.mutate({
      id: workerId,
      data: {
        title: formData.title || undefined,
        fullName: formData.fullName,
        nationality: formData.nationality,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender || undefined,
        passportNo: formData.passportNo,
        passportIssueDate: formData.passportIssueDate || undefined,
        passportExpiryDate: formData.passportExpiryDate || undefined,
        visaType: formData.visaType || undefined,
        visaNo: formData.visaNo || undefined,
        visaExpiryDate: formData.visaExpiryDate || undefined,
        workPermitNo: formData.workPermitNo || undefined,
        workPermitExpiryDate: formData.workPermitExpiryDate || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        addressTh: formData.addressTh || undefined,
        subdistrictTh: formData.subdistrictTh || undefined,
        districtTh: formData.districtTh || undefined,
        provinceTh: formData.provinceTh || undefined,
        postalCodeTh: formData.postalCodeTh || undefined,
        employerName: formData.employerName || undefined,
        position: formData.position || undefined,
        salary: formData.salary ? Number(formData.salary) : undefined,
        workStartDate: formData.workStartDate || undefined,
        employmentStatus: formData.employmentStatus || undefined,
        resignationDate: formData.resignationDate || undefined,
        notes: formData.notes || undefined,
      },
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("ไฟล์ต้องไม่เกิน 5MB");
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        updateWorker.mutate({
          id: workerId,
          data: {
            profilePhotoUrl: data.url,
          },
        });
      } else {
        toast.error("อัพโหลดไฟล์ล้มเหลว");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการอัพโหลด");
      console.error(error);
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("ไฟล์ต้องไม่เกิน 10MB");
      return;
    }

    setUploadingDocs({ ...uploadingDocs, [docType]: true });
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        
        // Get existing documents
        const existingDocs = worker?.documentsUrl ? JSON.parse(worker.documentsUrl) : [];
        const newDocs = [...existingDocs, { type: docType, url: data.url, name: file.name }];
        
        updateWorker.mutate({
          id: workerId,
          data: {
            documentsUrl: JSON.stringify(newDocs),
          },
        });
      } else {
        toast.error("อัพโหลดไฟล์ล้มเหลว");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการอัพโหลด");
      console.error(error);
    } finally {
      setUploadingDocs({ ...uploadingDocs, [docType]: false });
    }
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

  const getDocumentsByType = (type: string) => {
    if (!worker?.documentsUrl) return [];
    try {
      const docs = JSON.parse(worker.documentsUrl);
      return docs.filter((doc: any) => doc.type === type);
    } catch {
      return [];
    }
  };

  const getTitleLabel = (title: string | null) => {
    const titles: Record<string, string> = {
      "MR": "MR",
      "MRS": "MRS",
      "MISS": "MISS",
    };
    return titles[title || ""] || "-";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">ไม่พบข้อมูลลูกจ้าง</p>
            <Button onClick={() => setLocation("/")} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              กลับหน้าหลัก
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                กลับ
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  รายละเอียดลูกจ้าง
                </h1>
                <p className="text-sm text-muted-foreground">
                  ข้อมูลและเอกสารของลูกจ้างต่างด้าว
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="mr-2 h-4 w-4" />
                    ยกเลิก
                  </Button>
                  <Button onClick={handleSave} disabled={updateWorker.isPending}>
                    <Save className="mr-2 h-4 w-4" />
                    {updateWorker.isPending ? "กำลังบันทึก..." : "บันทึก"}
                  </Button>
                </>
              ) : (
                <Button onClick={handleEdit}>แก้ไขข้อมูล</Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Profile Photo Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">รูปโปรไฟล์</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative">
              {worker.profilePhotoUrl ? (
                <img
                  src={worker.profilePhotoUrl}
                  alt="Profile"
                  className="w-48 h-48 object-cover border-4 border-border rounded-lg"
                  style={{ aspectRatio: '1/1' }}
                />
              ) : (
                <div className="w-48 h-48 bg-muted border-4 border-border rounded-lg flex items-center justify-center">
                  <User className="w-24 h-24 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="mt-4 w-full max-w-md">
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <Button
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="w-full"
                variant="outline"
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploadingPhoto ? "กำลังอัพโหลด..." : "อัพโหลดรูปถ่ายหน้าตรง (JPG หรือ PDF)"}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                ขนาด 2x2 นิ้ว, ไฟล์ไม่เกิน 5MB
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Worker Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>ข้อมูลส่วนตัว</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">คำนำหน้าชื่อ *</Label>
                    <Select value={formData.title} onValueChange={(value) => setFormData({...formData, title: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกคำนำหน้า" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MR">MR</SelectItem>
                        <SelectItem value="MRS">MRS</SelectItem>
                        <SelectItem value="MISS">MISS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="fullName">ชื่อ-นามสกุล (อังกฤษ) *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      placeholder="ระบุชื่อ-นามสกุล"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="space-y-2">
                  <Label htmlFor="nationality">สัญชาติ *</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                    placeholder="ระบุสัญชาติ"
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
                  <Label htmlFor="passportNo">เลขที่หนังสือเดินทาง *</Label>
                  <Input
                    id="passportNo"
                    value={formData.passportNo}
                    onChange={(e) => setFormData({...formData, passportNo: e.target.value})}
                    placeholder="ระบุเลขที่พาสปอร์ต"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passportIssueDate">วันที่ออกพาสปอร์ต</Label>
                  <Input
                    id="passportIssueDate"
                    type="date"
                    value={formData.passportIssueDate}
                    onChange={(e) => setFormData({...formData, passportIssueDate: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passportExpiryDate">วันหมดอายุพาสปอร์ต</Label>
                  <Input
                    id="passportExpiryDate"
                    type="date"
                    value={formData.passportExpiryDate}
                    onChange={(e) => setFormData({...formData, passportExpiryDate: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">โทรศัพท์</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="ระบุเบอร์โทรศัพท์"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">อีเมล</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="ระบุอีเมล"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employerName">นายจ้าง</Label>
                  <Input
                    id="employerName"
                    value={formData.employerName}
                    onChange={(e) => setFormData({...formData, employerName: e.target.value})}
                    placeholder="ระบุชื่อนายจ้าง"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">ตำแหน่ง</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    placeholder="ระบุตำแหน่งงาน"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employmentStatus">สถานะการทำงาน</Label>
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

                  <div className="col-span-full space-y-2">
                    <Label htmlFor="notes">หมายเหตุ</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="ข้อมูลเพิ่มเติม"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">คำนำหน้าชื่อ</Label>
                  <p className="font-medium">{getTitleLabel(worker.title)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">ชื่อ-นามสกุล</Label>
                  <p className="font-medium">{worker.fullName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">สัญชาติ</Label>
                  <p className="font-medium">{worker.nationality}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">เพศ</Label>
                  <p className="font-medium">{worker.gender === "male" ? "ชาย" : worker.gender === "female" ? "หญิง" : "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">วันเกิด</Label>
                  <p className="font-medium">{formatDate(worker.dateOfBirth)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">เลขที่หนังสือเดินทาง</Label>
                  <p className="font-medium">{worker.passportNo}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">โทรศัพท์</Label>
                  <p className="font-medium">{worker.phone || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">อีเมล</Label>
                  <p className="font-medium">{worker.email || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">สถานะการทำงาน</Label>
                  <div>{getStatusBadge(worker.employmentStatus)}</div>
                </div>
                {worker.employmentStatus === "resigned" && worker.resignationDate && (
                  <div>
                    <Label className="text-muted-foreground">วันที่ออก</Label>
                    <p className="font-medium">{formatDate(worker.resignationDate)}</p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">นายจ้าง</Label>
                  <p className="font-medium">{worker.employerName || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">ตำแหน่ง</Label>
                  <p className="font-medium">{worker.position || "-"}</p>
                </div>
                {worker.notes && (
                  <div className="col-span-full">
                    <Label className="text-muted-foreground">หมายเหตุ</Label>
                    <p className="font-medium">{worker.notes}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents Section */}
        <Card>
          <CardHeader>
            <CardTitle>เอกสารประกอบ</CardTitle>
            <CardDescription>อัพโหลดเอกสารสำคัญของลูกจ้าง (JPG หรือ PDF)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Passport */}
            <div className="border-b pb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <Label className="text-base font-semibold">1. พาสปอร์ต</Label>
                </div>
              </div>
              <input
                ref={passportInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleDocumentUpload(e, "passport")}
                className="hidden"
              />
              <Button
                onClick={() => passportInputRef.current?.click()}
                disabled={uploadingDocs["passport"]}
                variant="outline"
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploadingDocs["passport"] ? "กำลังอัพโหลด..." : "เพิ่มไฟล์พาสปอร์ต"}
              </Button>
              {getDocumentsByType("passport").length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium">ไฟล์ที่อัพโหลด:</p>
                  {getDocumentsByType("passport").map((doc: any, idx: number) => (
                    <a
                      key={idx}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <FileText className="h-4 w-4" />
                      {doc.name}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Work Permit */}
            <div className="border-b pb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <Label className="text-base font-semibold">2. ใบอนุญาตทำงาน</Label>
                </div>
              </div>
              <input
                ref={workPermitInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleDocumentUpload(e, "work_permit")}
                className="hidden"
              />
              <Button
                onClick={() => workPermitInputRef.current?.click()}
                disabled={uploadingDocs["work_permit"]}
                variant="outline"
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploadingDocs["work_permit"] ? "กำลังอัพโหลด..." : "เพิ่มไฟล์ใบอนุญาตทำงาน"}
              </Button>
              {getDocumentsByType("work_permit").length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium">ไฟล์ที่อัพโหลด:</p>
                  {getDocumentsByType("work_permit").map((doc: any, idx: number) => (
                    <a
                      key={idx}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <FileText className="h-4 w-4" />
                      {doc.name}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Other Documents */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <Label className="text-base font-semibold">3. เอกสารอื่นๆ</Label>
                </div>
              </div>
              <input
                ref={otherInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleDocumentUpload(e, "other")}
                className="hidden"
              />
              <Button
                onClick={() => otherInputRef.current?.click()}
                disabled={uploadingDocs["other"]}
                variant="outline"
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploadingDocs["other"] ? "กำลังอัพโหลด..." : "เพิ่มไฟล์เอกสารอื่นๆ"}
              </Button>
              {getDocumentsByType("other").length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium">ไฟล์ที่อัพโหลด:</p>
                  {getDocumentsByType("other").map((doc: any, idx: number) => (
                    <a
                      key={idx}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <FileText className="h-4 w-4" />
                      {doc.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

