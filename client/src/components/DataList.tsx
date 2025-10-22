import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Trash2, Eye } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function DataList() {
  const utils = trpc.useUtils();
  
  // Fetch employers and workers
  const { data: employers, isLoading: employersLoading } = trpc.employers.list.useQuery();
  const { data: workers, isLoading: workersLoading } = trpc.workers.list.useQuery();

  // Delete mutations
  const deleteEmployerMutation = trpc.employers.delete.useMutation({
    onSuccess: () => {
      toast.success("ลบข้อมูลนายจ้างเรียบร้อยแล้ว");
      utils.employers.list.invalidate();
    },
    onError: (error) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    },
  });

  const deleteWorkerMutation = trpc.workers.delete.useMutation({
    onSuccess: () => {
      toast.success("ลบข้อมูลลูกจ้างเรียบร้อยแล้ว");
      utils.workers.list.invalidate();
    },
    onError: (error) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    },
  });

  const deleteEmployer = (id: number) => {
    if (confirm("คุณต้องการลบข้อมูลนายจ้างนี้หรือไม่?")) {
      deleteEmployerMutation.mutate({ id });
    }
  };

  const deleteWorker = (id: number) => {
    if (confirm("คุณต้องการลบข้อมูลลูกจ้างนี้หรือไม่?")) {
      deleteWorkerMutation.mutate({ id });
    }
  };

  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  const getEmployerTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      individual: "บุคคลธรรมดา",
      company: "นิติบุคคล",
      partnership: "ห้างหุ้นส่วน",
    };
    return types[type] || type;
  };

  return (
    <Tabs defaultValue="employers" className="w-full">
      <TabsList className="grid w-full grid-cols-2 h-12">
        <TabsTrigger value="employers" className="text-base">
          รายการนายจ้าง ({employersLoading ? "..." : employers?.length || 0})
        </TabsTrigger>
        <TabsTrigger value="workers" className="text-base">
          รายการลูกจ้าง ({workersLoading ? "..." : workers?.length || 0})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="employers" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>รายการนายจ้างทั้งหมด</CardTitle>
            <CardDescription>
              ข้อมูลนายจ้างที่บันทึกไว้ในระบบ
            </CardDescription>
          </CardHeader>
          <CardContent>
            {employersLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">กำลังโหลดข้อมูล...</p>
              </div>
            ) : !employers || employers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">ยังไม่มีข้อมูลนายจ้าง</p>
                <p className="text-sm mt-2">กรุณาเพิ่มข้อมูลนายจ้างในแท็บ "ลงทะเบียนนายจ้าง"</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ลำดับ</TableHead>
                      <TableHead>ประเภท</TableHead>
                      <TableHead>ชื่อนายจ้าง/บริษัท</TableHead>
                      <TableHead>เลขประจำตัวผู้เสียภาษี</TableHead>
                      <TableHead>โทรศัพท์</TableHead>
                      <TableHead>อีเมล</TableHead>
                      <TableHead>วันที่บันทึก</TableHead>
                      <TableHead className="text-right">จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employers.map((employer, index) => (
                      <TableRow key={employer.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getEmployerTypeLabel(employer.employerType)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{employer.companyName}</TableCell>
                        <TableCell>{employer.taxId}</TableCell>
                        <TableCell>{employer.phone || "-"}</TableCell>
                        <TableCell>{employer.email || "-"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(employer.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toast.info("ฟีเจอร์ดูรายละเอียดจะพร้อมใช้งานเร็วๆ นี้")}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteEmployer(employer.id)}
                              className="text-destructive hover:text-destructive"
                              disabled={deleteEmployerMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="workers" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>รายการลูกจ้างต่างด้าวทั้งหมด</CardTitle>
            <CardDescription>
              ข้อมูลลูกจ้างต่างด้าวที่บันทึกไว้ในระบบ
            </CardDescription>
          </CardHeader>
          <CardContent>
            {workersLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">กำลังโหลดข้อมูล...</p>
              </div>
            ) : !workers || workers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">ยังไม่มีข้อมูลลูกจ้าง</p>
                <p className="text-sm mt-2">กรุณาเพิ่มข้อมูลลูกจ้างในแท็บ "ลงทะเบียนลูกจ้าง"</p>
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
                      <TableHead>โทรศัพท์</TableHead>
                      <TableHead>นายจ้าง</TableHead>
                      <TableHead>วันที่บันทึก</TableHead>
                      <TableHead className="text-right">จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workers.map((worker, index) => (
                      <TableRow key={worker.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">
                          {worker.fullName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{worker.nationality}</Badge>
                        </TableCell>
                        <TableCell>{worker.passportNo}</TableCell>
                        <TableCell>{worker.phone || "-"}</TableCell>
                        <TableCell>{worker.employerName || "-"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(worker.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toast.info("ฟีเจอร์ดูรายละเอียดจะพร้อมใช้งานเร็วๆ นี้")}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteWorker(worker.id)}
                              className="text-destructive hover:text-destructive"
                              disabled={deleteWorkerMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

