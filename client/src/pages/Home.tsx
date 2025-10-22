import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import EmployerForm from "@/components/forms/EmployerForm";
import WorkerForm from "@/components/forms/WorkerForm";
import DataList from "@/components/DataList";
import { trpc } from "@/lib/trpc";
import { LogOut, UserCircle, Shield } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { data: user } = trpc.auth.me.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/api/auth/logout";
    },
  });

  const handleLogout = () => {
    if (confirm("คุณต้องการออกจากระบบหรือไม่?")) {
      logoutMutation.mutate();
    }
  };

  // Use APP_LOGO (as image src) and APP_TITLE if needed

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="w-full border-b bg-card shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img
              src={APP_LOGO}
              alt="Logo"
              className="h-10 w-10 rounded-lg border-2 border-primary/20 bg-background object-cover"
            />
            <div>
              <h1 className="text-lg font-bold text-foreground">{APP_TITLE}</h1>
              <p className="text-xs text-muted-foreground">บริษัทนำคนต่างด้าวเข้ามาทำงานในประเทศไทยนิยม 2022</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <UserCircle className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{user.name || user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.role === "admin" ? "ผู้ดูแลระบบ" : "ผู้ใช้งาน"}
                    </p>
                  </div>
                </div>
                {user.role === "admin" && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm">
                      <Shield className="h-4 w-4 mr-2" />
                      จัดการผู้ใช้
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  ออกจากระบบ
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Welcome Section */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="text-2xl">ระบบลงทะเบียนลูกจ้างต่างด้าว</CardTitle>
              <CardDescription className="text-base">
                ระบบจัดเก็บข้อมูลนายจ้างและลูกจ้างต่างด้าวเพื่อเตรียมความพร้อมในการยื่นเอกสารกับภาครัฐ
                <br />
                กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้องตามเอกสารที่มี
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Registration Forms */}
          <Tabs defaultValue="employer" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-12">
              <TabsTrigger value="employer" className="text-base">
                ลงทะเบียนนายจ้าง
              </TabsTrigger>
              <TabsTrigger value="worker" className="text-base">
                ลงทะเบียนลูกจ้าง
              </TabsTrigger>
              <TabsTrigger value="list" className="text-base">
                รายการข้อมูล
              </TabsTrigger>
            </TabsList>

            <TabsContent value="employer" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>แบบฟอร์มลงทะเบียนนายจ้าง</CardTitle>
                  <CardDescription>
                    กรอกข้อมูลนายจ้างที่ต้องการจ้างลูกจ้างต่างด้าว
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EmployerForm />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="worker" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>แบบฟอร์มลงทะเบียนลูกจ้างต่างด้าว</CardTitle>
                  <CardDescription>
                    กรอกข้อมูลลูกจ้างต่างด้าวที่ต้องการขอใบอนุญาตทำงาน
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WorkerForm />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="list" className="mt-6">
              <DataList />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t bg-card mt-auto">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-muted-foreground">
            © 2024 บริษัทนำคนต่างด้าวเข้ามาทำงานในประเทศไทยนิยม 2022 | 
            ระบบจัดเก็บข้อมูลเพื่อเตรียมยื่นเอกสารกับภาครัฐ
          </p>
        </div>
      </footer>
    </div>
  );
}

