import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, FileText, User } from "lucide-react";
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
    },
    onError: (error) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    },
  });

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState<{[key: string]: boolean}>({});

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("ไฟล์รูปต้องไม่เกิน 5MB");
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
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("ไฟล์เอกสารต้องไม่เกิน 10MB");
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
              <Label htmlFor="profilePhoto" className="block text-center mb-2">
                อัพโหลดรูปถ่ายหน้าตรง (ขนาด 2x2 นิ้ว)
              </Label>
              <Input
                id="profilePhoto"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
                className="cursor-pointer"
              />
              {uploadingPhoto && (
                <p className="text-sm text-muted-foreground text-center mt-2">
                  กำลังอัพโหลด...
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Worker Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>ข้อมูลส่วนตัว</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </CardContent>
        </Card>

        {/* Documents Section */}
        <Card>
          <CardHeader>
            <CardTitle>เอกสารประกอบ</CardTitle>
            <CardDescription>อัพโหลดเอกสารสำคัญของลูกจ้าง</CardDescription>
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
              <Input
                type="file"
                accept=".pdf"
                onChange={(e) => handleDocumentUpload(e, "passport")}
                disabled={uploadingDocs["passport"]}
                className="cursor-pointer"
              />
              {uploadingDocs["passport"] && (
                <p className="text-sm text-muted-foreground mt-2">กำลังอัพโหลด...</p>
              )}
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
              <Input
                type="file"
                accept=".pdf"
                onChange={(e) => handleDocumentUpload(e, "work_permit")}
                disabled={uploadingDocs["work_permit"]}
                className="cursor-pointer"
              />
              {uploadingDocs["work_permit"] && (
                <p className="text-sm text-muted-foreground mt-2">กำลังอัพโหลด...</p>
              )}
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
              <Input
                type="file"
                accept=".pdf"
                onChange={(e) => handleDocumentUpload(e, "other")}
                disabled={uploadingDocs["other"]}
                className="cursor-pointer"
              />
              {uploadingDocs["other"] && (
                <p className="text-sm text-muted-foreground mt-2">กำลังอัพโหลด...</p>
              )}
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

