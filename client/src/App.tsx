import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { RoleProvider, useRole } from "@/contexts/RoleContext";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Sidebar from "@/components/sidebar";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import Attendance from "@/pages/attendance";
import Leave from "@/pages/leave";
import Notifications from "@/pages/notifications";
import Calendar from "@/pages/calendar";
import Profile from "@/pages/profile";
import About from "@/pages/about";
import NotFound from "@/pages/not-found";

interface RouterProps {
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

function Router({ sidebarOpen, setSidebarOpen }: RouterProps) {
  const { isAuthenticated, isLoading } = useAuth();

  console.log("Router - isAuthenticated:", isAuthenticated, "isLoading:", isLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-red-subtle dark:bg-secondary-red">
        <div className="text-center space-y-4">
          <LoadingSpinner size="xl" variant="primary" />
          <p className="text-text-light dark:text-text-light">Loading SIIhadirin...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login page
  if (!isAuthenticated) {
    console.log("Showing login page - user not authenticated");
    return <Login />;
  }

  // If authenticated, show protected routes with sidebar
  console.log("Showing protected routes - user authenticated");
  return (
    <>
      {sidebarOpen !== undefined && setSidebarOpen && (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/attendance" component={Attendance} />
        <Route path="/leave" component={Leave} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/calendar" component={Calendar} />
        <Route path="/profile" component={Profile} />
        <Route path="/about" component={About} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Router sidebarOpen={undefined} setSidebarOpen={undefined} />;
  }

  return (
    <div className="min-h-screen bg-gradient-red-subtle dark:bg-secondary-red transition-colors duration-300">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarOpen(true)}
          className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-900 hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 transition-all duration-300 ease-in-out">
        <main className="p-6 animate-fade-in-scale">
          <ErrorBoundary>
            <Router sidebarOpen={sidebarOpen} setSidebarOpen={(open: boolean) => setSidebarOpen(open)} />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RoleProvider>
            <AuthProvider>
              <TooltipProvider>
                <AppContent />
                <Toaster />
              </TooltipProvider>
            </AuthProvider>
          </RoleProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
