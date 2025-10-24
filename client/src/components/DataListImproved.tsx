import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Eye, Search, Download, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function DataListImproved() {
  const utils = trpc.useUtils();
  const [, setLocation] = useLocation();
  
  // Search and filter states
  const [employerSearch, setEmployerSearch] = useState("");
  const [workerSearch, setWorkerSearch] = useState("");
  const [employerTypeFilter, setEmployerTypeFilter] = useState("all");
  const [nationalityFilter, setNationalityFilter] = useState("all");
  
  // Pagination states
  const [employerPage, setEmployerPage] = useState(1);
  const [workerPage, setWorkerPage] = useState(1);
  const itemsPerPage = 20;
  
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

  // Filter and search logic
  const filteredEmployers = useMemo(() => {
    if (!employers) return [];
    return employers.filter(emp => {
      const matchesSearch = 
        emp.companyName.toLowerCase().includes(employerSearch.toLowerCase()) ||
        emp.taxId.includes(employerSearch) ||
        (emp.phone && emp.phone.includes(employerSearch));
      const matchesType = employerTypeFilter === "all" || emp.employerType === employerTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [employers, employerSearch, employerTypeFilter]);

  const filteredWorkers = useMemo(() => {
    if (!workers) return [];
    return workers.filter(worker => {
      const matchesSearch = 
        worker.fullName.toLowerCase().includes(workerSearch.toLowerCase()) ||
        worker.passportNo.toLowerCase().includes(workerSearch.toLowerCase()) ||
        (worker.alienId && worker.alienId.includes(workerSearch)) ||
        (worker.phone && worker.phone.includes(workerSearch));
      const matchesNationality = nationalityFilter === "all" || worker.nationality === nationalityFilter;
      return matchesSearch && matchesNationality;
    });
  }, [workers, workerSearch, nationalityFilter]);

  // Pagination logic
  const paginatedEmployers = useMemo(() => {
    const start = (employerPage - 1) * itemsPerPage;
    return filteredEmployers.slice(start, start + itemsPerPage);
  }, [filteredEmployers, employerPage]);

  const paginatedWorkers = useMemo(() => {
    const start = (workerPage - 1) * itemsPerPage;
    return filteredWorkers.slice(start, start + itemsPerPage);
  }, [filteredWorkers, workerPage]);

  const employerTotalPages = Math.ceil(filteredEmployers.length / itemsPerPage);
  const workerTotalPages = Math.ceil(filteredWorkers.length / itemsPerPage);

  // Get unique nationalities for filter
  const nationalities = useMemo(() => {
    if (!workers) return [];
    return Array.from(new Set(workers.map(w => w.nationality))).sort();
  }, [workers]);

  const deleteEmployer = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
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

  // Export to CSV
  const exportToCSV = (data: any[], filename: string, headers: string[], fields: string[]) => {
    const csvContent = [
      headers.join(","),
      ...data.map(row => 
        fields.map(field => {
          const value = row[field] || "";
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(",")
      )
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success("ส่งออกข้อมูลเรียบร้อยแล้ว");
  };

  const exportEmployers = () => {
    exportToCSV(
      filteredEmployers,
      "employers",
      ["ลำดับ", "ประเภท", "ชื่อนายจ้าง", "เลขประจำตัวผู้เสียภาษี", "โทรศัพท์", "อีเมล", "วันที่บันทึก"],
      ["id", "employerType", "companyName", "taxId", "phone", "email", "createdAt"]
    );
  };

  const exportWorkers = () => {
    exportToCSV(
      filteredWorkers,
      "workers",
      ["ลำดับ", "ชื่อ-นามสกุล", "สัญชาติ", "หมายเลขประจำตัวคนต่างด้าว", "เลขที่หนังสือเดินทาง", "โทรศัพท์", "นายจ้าง", "วันที่บันทึก"],
      ["id", "fullName", "nationality", "alienId", "passportNo", "phone", "employerName", "createdAt"]
    );
  };

  return (
    <Tabs defaultValue="employers" className="w-full">
      <TabsList className="grid w-full grid-cols-2 h-12">
        <TabsTrigger value="employers" className="text-base">
          รายการนายจ้าง ({employersLoading ? "..." : filteredEmployers.length})
        </TabsTrigger>
        <TabsTrigger value="workers" className="text-base">
          รายการลูกจ้าง ({workersLoading ? "..." : filteredWorkers.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="employers" className="mt-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>รายการนายจ้างทั้งหมด</CardTitle>
                <CardDescription>
                  ข้อมูลนายจ้างที่บันทึกไว้ในระบบ (คลิกชื่อเพื่อดูรายละเอียด)
                </CardDescription>
              </div>
              <Button onClick={exportEmployers} variant="outline" size="sm">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                ส่งออก CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search and Filter */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาชื่อนายจ้าง, เลขประจำตัวผู้เสียภาษี, โทรศัพท์..."
                  value={employerSearch}
                  onChange={(e) => {
                    setEmployerSearch(e.target.value);
                    setEmployerPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <Select value={employerTypeFilter} onValueChange={(value) => {
                setEmployerTypeFilter(value);
                setEmployerPage(1);
              }}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="ประเภทนายจ้าง" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกประเภท</SelectItem>
                  <SelectItem value="individual">บุคคลธรรมดา</SelectItem>
                  <SelectItem value="company">นิติบุคคล</SelectItem>
                  <SelectItem value="partnership">ห้างหุ้นส่วน</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {employersLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">กำลังโหลดข้อมูล...</p>
              </div>
            ) : filteredEmployers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">ไม่พบข้อมูลนายจ้าง</p>
                <p className="text-sm mt-2">
                  {employerSearch || employerTypeFilter !== "all" 
                    ? "ลองเปลี่ยนคำค้นหาหรือตัวกรอง" 
                    : "กรุณาเพิ่มข้อมูลนายจ้างในแท็บ \"ลงทะเบียนนายจ้าง\""}
                </p>
              </div>
            ) : (
              <>
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
                      {paginatedEmployers.map((employer, index) => (
                        <TableRow 
                          key={employer.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setLocation(`/employer/${employer.id}`)}
                        >
                          <TableCell>{(employerPage - 1) * itemsPerPage + index + 1}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getEmployerTypeLabel(employer.employerType)}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium text-primary">
                            {employer.companyName}
                          </TableCell>
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLocation(`/employer/${employer.id}`);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => deleteEmployer(employer.id, e)}
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

                {/* Pagination */}
                {employerTotalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      แสดง {(employerPage - 1) * itemsPerPage + 1} - {Math.min(employerPage * itemsPerPage, filteredEmployers.length)} จาก {filteredEmployers.length} รายการ
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEmployerPage(p => Math.max(1, p - 1))}
                        disabled={employerPage === 1}
                      >
                        ก่อนหน้า
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, employerTotalPages) }, (_, i) => {
                          let pageNum;
                          if (employerTotalPages <= 5) {
                            pageNum = i + 1;
                          } else if (employerPage <= 3) {
                            pageNum = i + 1;
                          } else if (employerPage >= employerTotalPages - 2) {
                            pageNum = employerTotalPages - 4 + i;
                          } else {
                            pageNum = employerPage - 2 + i;
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={employerPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setEmployerPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEmployerPage(p => Math.min(employerTotalPages, p + 1))}
                        disabled={employerPage === employerTotalPages}
                      >
                        ถัดไป
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="workers" className="mt-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>รายการลูกจ้างต่างด้าวทั้งหมด</CardTitle>
                <CardDescription>
                  ข้อมูลลูกจ้างต่างด้าวที่บันทึกไว้ในระบบ
                </CardDescription>
              </div>
              <Button onClick={exportWorkers} variant="outline" size="sm">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                ส่งออก CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search and Filter */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาชื่อลูกจ้าง, หมายเลขประจำตัวคนต่างด้าว, หนังสือเดินทาง, โทรศัพท์..."
                  value={workerSearch}
                  onChange={(e) => {
                    setWorkerSearch(e.target.value);
                    setWorkerPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <Select value={nationalityFilter} onValueChange={(value) => {
                setNationalityFilter(value);
                setWorkerPage(1);
              }}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="สัญชาติ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกสัญชาติ</SelectItem>
                  {nationalities.map(nat => (
                    <SelectItem key={nat} value={nat}>{nat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {workersLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">กำลังโหลดข้อมูล...</p>
              </div>
            ) : filteredWorkers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">ไม่พบข้อมูลลูกจ้าง</p>
                <p className="text-sm mt-2">
                  {workerSearch || nationalityFilter !== "all" 
                    ? "ลองเปลี่ยนคำค้นหาหรือตัวกรอง" 
                    : "กรุณาเพิ่มข้อมูลลูกจ้างในแท็บ \"ลงทะเบียนลูกจ้าง\""}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ลำดับ</TableHead>
                        <TableHead>ชื่อ-นามสกุล</TableHead>
                        <TableHead>สัญชาติ</TableHead>
                        <TableHead>หมายเลขประจำตัวคนต่างด้าว</TableHead>
                        <TableHead>เลขที่หนังสือเดินทาง</TableHead>
                        <TableHead>โทรศัพท์</TableHead>
                        <TableHead>นายจ้าง</TableHead>
                        <TableHead>วันที่บันทึก</TableHead>
                        <TableHead className="text-right">จัดการ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedWorkers.map((worker, index) => (
                        <TableRow key={worker.id}>
                          <TableCell>{(workerPage - 1) * itemsPerPage + index + 1}</TableCell>
                          <TableCell className="font-medium">
                            {worker.fullName}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{worker.nationality}</Badge>
                          </TableCell>
                          <TableCell>{worker.alienId || "-"}</TableCell>
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
                                onClick={() => setLocation(`/worker/${worker.id}`)}
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

                {/* Pagination */}
                {workerTotalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      แสดง {(workerPage - 1) * itemsPerPage + 1} - {Math.min(workerPage * itemsPerPage, filteredWorkers.length)} จาก {filteredWorkers.length} รายการ
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setWorkerPage(p => Math.max(1, p - 1))}
                        disabled={workerPage === 1}
                      >
                        ก่อนหน้า
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, workerTotalPages) }, (_, i) => {
                          let pageNum;
                          if (workerTotalPages <= 5) {
                            pageNum = i + 1;
                          } else if (workerPage <= 3) {
                            pageNum = i + 1;
                          } else if (workerPage >= workerTotalPages - 2) {
                            pageNum = workerTotalPages - 4 + i;
                          } else {
                            pageNum = workerPage - 2 + i;
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={workerPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setWorkerPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setWorkerPage(p => Math.min(workerTotalPages, p + 1))}
                        disabled={workerPage === workerTotalPages}
                      >
                        ถัดไป
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

