import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

import Sidebar from "@/components/sidebar";
import Dashboard from "@/pages/dashboard";
import Attendance from "@/pages/attendance";
import Leave from "@/pages/leave";
import Notifications from "@/pages/notifications";
import Calendar from "@/pages/calendar";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/attendance" component={Attendance} />
      <Route path="/leave" component={Leave} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          
          {/* Mobile Menu Button */}
          <div className="lg:hidden fixed top-4 left-4 z-50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="bg-white/90 backdrop-blur-sm shadow-lg border-gray-200 hover:bg-white hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>

          {/* Main Content */}
          <div className="lg:pl-64 transition-all duration-300 ease-in-out">
            <main className="p-6 animate-fade-in-scale">
              <Router />
            </main>
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
