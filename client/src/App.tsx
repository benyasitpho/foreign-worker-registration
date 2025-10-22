import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import EmployerDetail from "./pages/EmployerDetail";
import WorkerDetail from "./pages/WorkerDetail";
import AdminDashboard from "./pages/AdminDashboard";
import PendingApproval from "./pages/PendingApproval";
import { trpc } from "./lib/trpc";
import { useEffect } from "react";
import { useLocation } from "wouter";

// Protected Route Component
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { data: user, isLoading } = trpc.auth.me.useQuery();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to OAuth login
      window.location.href = "/api/auth/login";
    } else if (!isLoading && user && user.approvalStatus !== "approved") {
      // Redirect to pending approval page
      setLocation("/pending");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">กำลังตรวจสอบสิทธิ์...</p>
      </div>
    );
  }

  if (!user || user.approvalStatus !== "approved") {
    return null;
  }

  return <Component />;
}

// Admin Route Component
function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { data: user, isLoading } = trpc.auth.me.useQuery();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = "/api/auth/login";
    } else if (!isLoading && user && user.role !== "admin") {
      alert("คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">กำลังตรวจสอบสิทธิ์...</p>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path={"/pending"} component={PendingApproval} />
      <Route path={"/"} component={() => <ProtectedRoute component={Home} />} />
      <Route path={"/employer/:id"} component={() => <ProtectedRoute component={EmployerDetail} />} />
      <Route path={"/worker/:id"} component={() => <ProtectedRoute component={WorkerDetail} />} />
      <Route path={"/admin"} component={() => <AdminRoute component={AdminDashboard} />} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

