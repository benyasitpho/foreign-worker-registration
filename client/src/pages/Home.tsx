import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import EmployerForm from "@/components/forms/EmployerForm";
import WorkerForm from "@/components/forms/WorkerForm";
import DataListImproved from "@/components/DataListImproved";
import StatisticsDashboard from "@/components/StatisticsDashboard";

export default function Home() {
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
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">พนักงานอาวุโส: เบญญสิทธิ์ ภูมิพันธ์</span>
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

          {/* Forms and Data Tabs */}
          <Tabs defaultValue="employer-form" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-auto">
              <TabsTrigger value="employer-form" className="py-3">
                ลงทะเบียนนายจ้าง
              </TabsTrigger>
              <TabsTrigger value="worker-form" className="py-3">
                ลงทะเบียนลูกจ้าง
              </TabsTrigger>
              <TabsTrigger value="data-list" className="py-3">
                รายการข้อมูล
              </TabsTrigger>
              <TabsTrigger value="statistics" className="py-3">
                สถิติ
              </TabsTrigger>
            </TabsList>

            <TabsContent value="employer-form" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>แบบฟอร์มลงทะเบียนนายจ้าง</CardTitle>
                  <CardDescription>
                    กรอกข้อมูลนายจ้างเพื่อเตรียมการยื่นคำขอกับภาครัฐ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EmployerForm />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="worker-form" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>แบบฟอร์มลงทะเบียนลูกจ้างต่างด้าว</CardTitle>
                  <CardDescription>
                    กรอกข้อมูลลูกจ้างต่างด้าวเพื่อเตรียมการยื่นคำขอกับภาครัฐ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WorkerForm />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data-list" className="mt-6">
              <DataListImproved />
            </TabsContent>

            <TabsContent value="statistics" className="mt-6">
              <StatisticsDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t bg-card py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2024 บริษัทนำคนต่างด้าวเข้ามาทำงานในประเทศไทยนิยม 2022 | ระบบจัดเก็บข้อมูลเพื่อเตรียมยื่นเอกสารกับภาครัฐ
        </div>
      </footer>
    </div>
  );
}

