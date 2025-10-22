import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { data: allUsers, isLoading: allUsersLoading } = trpc.users.list.useQuery();
  const { data: pendingUsers, isLoading: pendingLoading } = trpc.users.pending.useQuery();
  
  const utils = trpc.useUtils();
  
  const approveUser = trpc.users.approve.useMutation({
    onSuccess: () => {
      toast.success("อนุมัติผู้ใช้เรียบร้อยแล้ว");
      utils.users.list.invalidate();
      utils.users.pending.invalidate();
    },
    onError: (error) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    },
  });

  const rejectUser = trpc.users.reject.useMutation({
    onSuccess: () => {
      toast.success("ปฏิเสธผู้ใช้เรียบร้อยแล้ว");
      utils.users.list.invalidate();
      utils.users.pending.invalidate();
    },
    onError: (error) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    },
  });

  const handleApprove = (userId: number) => {
    if (confirm("คุณต้องการอนุมัติผู้ใช้นี้หรือไม่?")) {
      approveUser.mutate({ userId });
    }
  };

  const handleReject = (userId: number) => {
    if (confirm("คุณต้องการปฏิเสธผู้ใช้นี้หรือไม่?")) {
      rejectUser.mutate({ userId });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="default" className="bg-green-600">อนุมัติแล้ว</Badge>;
      case "rejected":
        return <Badge variant="destructive">ปฏิเสธ</Badge>;
      case "pending":
        return <Badge variant="secondary">รออนุมัติ</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    return role === "admin" 
      ? <Badge variant="default">Admin</Badge>
      : <Badge variant="outline">User</Badge>;
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

  if (allUsersLoading || pendingLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto max-w-7xl">
          <p className="text-center text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-6 py-6 max-w-7xl">
          <div className="flex items-center gap-4">
            <Users className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">จัดการผู้ใช้งาน</h1>
              <p className="text-sm text-primary-foreground/80">
                Admin Dashboard
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-7xl space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ผู้ใช้ทั้งหมด</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allUsers?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รออนุมัติ</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {pendingUsers?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">อนุมัติแล้ว</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {allUsers?.filter(u => u.approvalStatus === "approved").length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Users */}
        {pendingUsers && pendingUsers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                ผู้ใช้ที่รออนุมัติ
              </CardTitle>
              <CardDescription>
                มีผู้ใช้ {pendingUsers.length} คนรออนุมัติ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ชื่อ</TableHead>
                      <TableHead>อีเมล</TableHead>
                      <TableHead>วิธีเข้าสู่ระบบ</TableHead>
                      <TableHead>วันที่สมัคร</TableHead>
                      <TableHead className="text-center">การจัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name || "-"}</TableCell>
                        <TableCell>{user.email || "-"}</TableCell>
                        <TableCell>{user.loginMethod || "-"}</TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex gap-2 justify-center">
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprove(user.id)}
                              disabled={approveUser.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              อนุมัติ
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(user.id)}
                              disabled={rejectUser.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              ปฏิเสธ
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Users */}
        <Card>
          <CardHeader>
            <CardTitle>ผู้ใช้ทั้งหมด</CardTitle>
            <CardDescription>
              รายการผู้ใช้ทั้งหมดในระบบ
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!allUsers || allUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">ไม่มีข้อมูลผู้ใช้</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ชื่อ</TableHead>
                      <TableHead>อีเมล</TableHead>
                      <TableHead>บทบาท</TableHead>
                      <TableHead>สถานะ</TableHead>
                      <TableHead>วันที่สมัคร</TableHead>
                      <TableHead>วันที่อนุมัติ</TableHead>
                      <TableHead className="text-center">การจัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name || "-"}</TableCell>
                        <TableCell>{user.email || "-"}</TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{getStatusBadge(user.approvalStatus)}</TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>{formatDate(user.approvedAt)}</TableCell>
                        <TableCell className="text-center">
                          {user.approvalStatus === "pending" && (
                            <div className="flex gap-2 justify-center">
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleApprove(user.id)}
                                disabled={approveUser.isPending}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(user.id)}
                                disabled={rejectUser.isPending}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          {user.approvalStatus === "rejected" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(user.id)}
                              disabled={approveUser.isPending}
                            >
                              อนุมัติใหม่
                            </Button>
                          )}
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

