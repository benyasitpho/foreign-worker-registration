import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function PendingApproval() {
  const { data: user } = trpc.auth.me.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/api/auth/logout";
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl">รออนุมัติจากผู้ดูแลระบบ</CardTitle>
          <CardDescription className="text-base mt-2">
            บัญชีของคุณกำลังรอการอนุมัติจากผู้ดูแลระบบ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="text-sm font-medium">ข้อมูลบัญชีของคุณ:</p>
            <div className="text-sm space-y-1">
              <p><span className="text-muted-foreground">ชื่อ:</span> {user?.name || "-"}</p>
              <p><span className="text-muted-foreground">อีเมล:</span> {user?.email || "-"}</p>
              <p><span className="text-muted-foreground">สถานะ:</span> <span className="text-yellow-600 font-medium">รออนุมัติ</span></p>
            </div>
          </div>

          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              <strong>หมายเหตุ:</strong> กรุณารอผู้ดูแลระบบตรวจสอบและอนุมัติบัญชีของคุณ 
              คุณจะได้รับการแจ้งเตือนเมื่อบัญชีได้รับการอนุมัติแล้ว
            </p>
          </div>

          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4 mr-2" />
            ออกจากระบบ
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

