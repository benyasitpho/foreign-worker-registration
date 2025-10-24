import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Users, Building2, Globe, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import { useMemo } from "react";

export default function StatisticsDashboard() {
  const { data: employers, isLoading: employersLoading } = trpc.employers.list.useQuery();
  const { data: workers, isLoading: workersLoading } = trpc.workers.list.useQuery();

  const stats = useMemo(() => {
    if (!employers || !workers) return null;

    // Count by employer type
    const employerTypes = employers.reduce((acc, emp) => {
      acc[emp.employerType] = (acc[emp.employerType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Count by nationality
    const nationalities = workers.reduce((acc, worker) => {
      acc[worker.nationality] = (acc[worker.nationality] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Count workers by employer
    const workersByEmployer = workers.reduce((acc, worker) => {
      if (worker.employerId) {
        acc[worker.employerId] = (acc[worker.employerId] || 0) + 1;
      }
      return acc;
    }, {} as Record<number, number>);

    // Find employers with most workers
    const topEmployers = Object.entries(workersByEmployer)
      .map(([id, count]) => ({
        employer: employers.find(e => e.id === parseInt(id)),
        count
      }))
      .filter(item => item.employer)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentEmployers = employers.filter(e => 
      new Date(e.createdAt) >= thirtyDaysAgo
    ).length;
    
    const recentWorkers = workers.filter(w => 
      new Date(w.createdAt) >= thirtyDaysAgo
    ).length;

    // Workers without employer
    const workersWithoutEmployer = workers.filter(w => !w.employerId).length;

    return {
      totalEmployers: employers.length,
      totalWorkers: workers.length,
      employerTypes,
      nationalities,
      topEmployers,
      recentEmployers,
      recentWorkers,
      workersWithoutEmployer
    };
  }, [employers, workers]);

  const getEmployerTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      individual: "บุคคลธรรมดา",
      company: "นิติบุคคล",
      partnership: "ห้างหุ้นส่วน",
    };
    return types[type] || type;
  };

  if (employersLoading || workersLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">กำลังโหลดสถิติ...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">ไม่มีข้อมูลสถิติ</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">นายจ้างทั้งหมด</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployers}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.recentEmployers} ในเดือนนี้
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ลูกจ้างทั้งหมด</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWorkers}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.recentWorkers} ในเดือนนี้
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">สัญชาติ</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(stats.nationalities).length}</div>
            <p className="text-xs text-muted-foreground">
              ประเทศที่แตกต่างกัน
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ลูกจ้างไม่มีนายจ้าง</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.workersWithoutEmployer}</div>
            <p className="text-xs text-muted-foreground">
              ต้องระบุนายจ้าง
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Employer Types */}
        <Card>
          <CardHeader>
            <CardTitle>ประเภทนายจ้าง</CardTitle>
            <CardDescription>จำนวนนายจ้างแยกตามประเภท</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.employerTypes).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-sm">{getEmployerTypeLabel(type)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{count}</span>
                    <span className="text-xs text-muted-foreground">
                      ({Math.round((count / stats.totalEmployers) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Nationalities */}
        <Card>
          <CardHeader>
            <CardTitle>สัญชาติลูกจ้าง</CardTitle>
            <CardDescription>จำนวนลูกจ้างแยกตามสัญชาติ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.nationalities)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([nationality, count]) => (
                  <div key={nationality} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-sm">{nationality}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{count}</span>
                      <span className="text-xs text-muted-foreground">
                        ({Math.round((count / stats.totalWorkers) * 100)}%)
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Employers */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>นายจ้างที่มีลูกจ้างมากที่สุด</CardTitle>
            <CardDescription>5 อันดับแรก</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topEmployers.map((item, index) => (
                <div key={item.employer!.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.employer!.companyName}</p>
                      <p className="text-xs text-muted-foreground">
                        {getEmployerTypeLabel(item.employer!.employerType)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{item.count} คน</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round((item.count / stats.totalWorkers) * 100)}% ของทั้งหมด
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

