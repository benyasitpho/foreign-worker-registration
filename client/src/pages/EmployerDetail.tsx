import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Building2, Phone, Mail, MapPin } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function EmployerDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  
  const employerId = parseInt(id || "0");
  
  const { data: employer, isLoading: employerLoading } = trpc.employers.getById.useQuery({ id: employerId });
  const { data: workers, isLoading: workersLoading } = trpc.workers.getByEmployerId.useQuery({ employerId });

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

  if (employerLoading) {
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

  if (!employer) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">ไม่พบข้อมูลนายจ้าง</p>
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
              <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                กลับ
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">รายละเอียดนายจ้าง</h1>
                <p className="text-sm text-muted-foreground">ข้อมูลนายจ้างและลูกจ้างที่สังกัด</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* ข้อมูลนายจ้าง */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{employer.companyName}</CardTitle>
                <CardDescription className="mt-2">
                  <Badge variant="outline" className="mr-2">
                    {getEmployerTypeLabel(employer.employerType)}
                  </Badge>
                  เลขประจำตัวผู้เสียภาษี: {employer.taxId}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {employer.contactPerson && (
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ผู้ติดต่อ</p>
                    <p className="text-base">{employer.contactPerson}</p>
                    {employer.contactPosition && (
                      <p className="text-sm text-muted-foreground">{employer.contactPosition}</p>
                    )}
                  </div>
                </div>
              )}

              {employer.businessType && (
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ประเภทธุรกิจ</p>
                    <p className="text-base">{employer.businessType}</p>
                  </div>
                </div>
              )}

              {employer.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">โทรศัพท์</p>
                    <p className="text-base">{employer.phone}</p>
                  </div>
                </div>
              )}

              {employer.email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">อีเมล</p>
                    <p className="text-base">{employer.email}</p>
                  </div>
                </div>
              )}

              {employer.address && (
                <div className="flex items-start gap-3 md:col-span-2">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ที่อยู่</p>
                    <p className="text-base">{employer.address}</p>
                    {(employer.subdistrict || employer.district || employer.province) && (
                      <p className="text-sm text-muted-foreground">
                        {[employer.subdistrict, employer.district, employer.province, employer.postalCode]
                          .filter(Boolean)
                          .join(" ")}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* รายการลูกจ้าง */}
        <Card>
          <CardHeader>
            <CardTitle>รายการลูกจ้างทั้งหมด</CardTitle>
            <CardDescription>
              ลูกจ้างต่างด้าวที่สังกัดนายจ้างนี้ ({workersLoading ? "..." : workers?.length || 0} คน)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {workersLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">กำลังโหลดข้อมูล...</p>
              </div>
            ) : !workers || workers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">ยังไม่มีลูกจ้างในระบบ</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ลำดับ</TableHead>
                      <TableHead>ชื่อ-นามสกุล</TableHead>
                      <TableHead>สัญชาติ</TableHead>
                      <TableHead>เลขที่หนังสือเดินทาง</TableHead>
                      <TableHead>ตำแหน่ง</TableHead>
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
                        <TableCell>
                          <Badge variant="secondary">{worker.nationality}</Badge>
                        </TableCell>
                        <TableCell>{worker.passportNo}</TableCell>
                        <TableCell>{worker.position || "-"}</TableCell>
                        <TableCell>{getStatusBadge(worker.employmentStatus)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(worker.resignationDate)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setLocation(`/worker/${worker.id}`)}
                          >
                            ดูรายละเอียด
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

