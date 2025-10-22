import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Building2, Phone, Mail, MapPin, Upload, FileText, Eye } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState, useRef } from "react";
import { toast } from "sonner";

export default function EmployerDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  
  const employerId = parseInt(id || "0");
  
  const { data: employer, isLoading: employerLoading } = trpc.employers.getById.useQuery({ id: employerId });
  const { data: workers, isLoading: workersLoading } = trpc.workers.getByEmployerId.useQuery({ employerId });
  const updateEmployer = trpc.employers.update.useMutation({
    onSuccess: () => {
      toast.success("อัพโหลดเอกสารเรียบร้อยแล้ว");
      trpc.useUtils().employers.getById.invalidate({ id: employerId });
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

      // Update employer
      await updateEmployer.mutateAsync({
        id: employerId,
        data: {
          documentsUrl: JSON.stringify(documents),
        },
      });
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการอัพโหลด: " + (error as Error).message);
    } finally {
      setUploadingDoc(null);
    }
  };

  const getDocumentUrl = (type: string): string | null => {
    if (!employer?.documentsUrl) return null;
    try {
      const documents = JSON.parse(employer.documentsUrl);
      const doc = documents.find((d: {type: string, url: string}) => d.type === type);
      return doc?.url || null;
    } catch {
      return null;
    }
  };

  const documentTypes = [
    { key: 'idCard', label: 'บัตรประชาชน', ref: fileInputRefs.idCard },
    { key: 'houseRegistration', label: 'ทะเบียนบ้าน', ref: fileInputRefs.houseRegistration },
    { key: 'leaseContract', label: 'สัญญาเช่า', ref: fileInputRefs.leaseContract },
    { key: 'companyRegistration', label: 'เอกสารการจดทะเบียน', ref: fileInputRefs.companyRegistration },
    { key: 'powerOfAttorney', label: 'หนังสือมอบอำนาจ', ref: fileInputRefs.powerOfAttorney },
    { key: 'other', label: 'เอกสารอื่นๆ', ref: fileInputRefs.other },
  ];

  if (employerLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto max-w-7xl">
          <p className="text-center text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!employer) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto max-w-7xl">
          <p className="text-center text-destructive">ไม่พบข้อมูลนายจ้าง</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-6 py-6 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/")}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{employer.companyName}</h1>
                <p className="text-sm text-primary-foreground/80">
                  {getEmployerTypeLabel(employer.employerType)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Employer Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              ข้อมูลนายจ้าง
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">ประเภทนายจ้าง</p>
                <p className="font-medium">{getEmployerTypeLabel(employer.employerType)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">เลขประจำตัวผู้เสียภาษี</p>
                <p className="font-medium">{employer.taxId || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">เลขทะเบียนนิติบุคคล</p>
                <p className="font-medium">{employer.registrationNumber || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ประเภทธุรกิจ</p>
                <p className="font-medium">{employer.businessType || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              ข้อมูลผู้ติดต่อ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">ชื่อผู้ติดต่อ</p>
                <p className="font-medium">{employer.contactPerson || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ตำแหน่ง</p>
                <p className="font-medium">{employer.contactPosition || "-"}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">โทรศัพท์</p>
                  <p className="font-medium">{employer.phone || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">อีเมล</p>
                  <p className="font-medium">{employer.email || "-"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              ที่อยู่
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {employer.address || "-"}
              {employer.subdistrict && ` ต.${employer.subdistrict}`}
              {employer.district && ` อ.${employer.district}`}
              {employer.province && ` จ.${employer.province}`}
              {employer.postalCode && ` ${employer.postalCode}`}
            </p>
          </CardContent>
        </Card>

        {/* Documents Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              เอกสารประกอบ
            </CardTitle>
            <CardDescription>
              อัพโหลดเอกสารที่จำเป็นสำหรับนายจ้าง (รองรับไฟล์ JPG, PNG, PDF)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documentTypes.map(({ key, label, ref }) => {
                const docUrl = getDocumentUrl(key);
                const isUploading = uploadingDoc === key;

                return (
                  <div key={key} className="space-y-2">
                    <label className="text-sm font-medium">{label}</label>
                    <div className="flex gap-2">
                      <input
                        ref={ref}
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
                            handleFileUpload(key, file);
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => ref.current?.click()}
                        disabled={isUploading}
                        className="flex-1"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {isUploading ? "กำลังอัพโหลด..." : docUrl ? "เปลี่ยนไฟล์" : "อัพโหลด"}
                      </Button>
                      {docUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(docUrl, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {docUrl && (
                      <p className="text-xs text-muted-foreground">
                        ✓ อัพโหลดแล้ว
                      </p>
                    )}
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
              {workers?.length || 0} คน
            </CardDescription>
          </CardHeader>
          <CardContent>
            {workersLoading ? (
              <p className="text-center text-muted-foreground py-4">กำลังโหลด...</p>
            ) : !workers || workers.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">ไม่มีข้อมูลลูกจ้าง</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ชื่อ-นามสกุล</TableHead>
                      <TableHead>สัญชาติ</TableHead>
                      <TableHead>เลขที่พาสปอร์ต</TableHead>
                      <TableHead>ตำแหน่ง</TableHead>
                      <TableHead>สถานะ</TableHead>
                      <TableHead>วันที่เริ่มงาน</TableHead>
                      <TableHead className="text-center">ดูรายละเอียด</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workers.map((worker) => (
                      <TableRow key={worker.id}>
                        <TableCell className="font-medium">
                          {worker.title ? `${worker.title} ` : ""}{worker.fullName}
                        </TableCell>
                        <TableCell>{worker.nationality}</TableCell>
                        <TableCell>{worker.passportNo}</TableCell>
                        <TableCell>{worker.position || "-"}</TableCell>
                        <TableCell>{getStatusBadge(worker.employmentStatus)}</TableCell>
                        <TableCell>{formatDate(worker.workStartDate)}</TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setLocation(`/worker/${worker.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

