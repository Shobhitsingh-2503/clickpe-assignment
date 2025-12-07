import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Toaster } from "@/components/ui/sonner";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ProtectedRoute>
        <DashboardLayout>{children}</DashboardLayout>
      </ProtectedRoute>
      <Toaster />
    </>
  );
}
