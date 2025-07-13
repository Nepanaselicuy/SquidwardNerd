import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Home, Clock, Calendar, Bell, CalendarDays, User, LogOut, Building2, BarChart3, Settings, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { ThemeToggle } from "@/components/theme-toggle";

const getMenuItems = (isAdmin: boolean, isManager: boolean, isHR: boolean) => {
  const baseItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/attendance", label: "Absensi", icon: Clock },
    { path: "/leave", label: "Izin/Cuti", icon: Calendar },
    { path: "/calendar", label: "Kalender", icon: CalendarDays },
    { path: "/notifications", label: "Notifikasi", icon: Bell },
    { path: "/profile", label: "Profile", icon: User },
  ];

  const adminItems = [
    { path: "/admin", label: "Admin Panel", icon: Shield, adminOnly: true },
    { path: "/analytics", label: "Analytics", icon: BarChart3, adminOnly: true },
    { path: "/settings", label: "Settings", icon: Settings, adminOnly: true },
  ];

  const managerItems = [
    { path: "/reports", label: "Reports", icon: BarChart3, managerOnly: true },
  ];

  const hrItems = [
    { path: "/employees", label: "Employees", icon: User, hrOnly: true },
  ];

  return [
    ...baseItems,
    ...(isAdmin ? adminItems : []),
    ...(isManager ? managerItems : []),
    ...(isHR ? hrItems : []),
    { path: "/about", label: "Tentang", icon: Building2 },
  ];
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { isAdmin, isManager, isHR } = useRole();

  const { data: unreadCount } = useQuery({
    queryKey: ["/api/notifications", 1, "unread-count"],
  });

  const menuItems = getMenuItems(isAdmin, isManager, isHR);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase();
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div 
        className={cn(
          "fixed inset-0 z-40 transition-all duration-300 ease-in-out lg:hidden",
          isOpen 
            ? "bg-black bg-opacity-50 backdrop-blur-sm visible" 
            : "bg-transparent invisible"
        )}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl transform transition-all duration-300 ease-in-out",
        "border-r border-gray-200",
        isOpen 
          ? "translate-x-0 opacity-100" 
          : "-translate-x-full opacity-0",
        "lg:translate-x-0 lg:opacity-100"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-center px-6 py-8 bg-gradient-red relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
            <div className="flex items-center space-x-3 relative z-10">
              <img 
                src="https://intek.co.id/wp-content/uploads/Logo-Intek-RED-logogram-300x203.png" 
                alt="PT Intek Solusi Indonesia Logo" 
                className="w-12 h-8 object-contain drop-shadow-lg"
              />
              <div className="text-white">
                <div className="text-lg font-bold drop-shadow-md">SIIhadirin</div>
                <div className="text-xs opacity-90">Attendance System</div>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item, index) => {
              const isActive = location === item.path;
              const Icon = item.icon;
              
              return (
                <Link key={item.path} href={item.path}>
                  <div 
                    className={cn(
                      "flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 group relative overflow-hidden",
                      "transform hover:scale-[1.02] hover:shadow-md",
                      isActive 
                        ? "text-primary-red bg-gradient-red-light border-l-4 border-primary-red shadow-sm" 
                        : "text-text-dark hover:bg-gradient-red-subtle hover:text-primary-red-dark"
                    )}
                    style={{ 
                      animationDelay: `${index * 50}ms`,
                      animation: isOpen ? 'slideInLeft 0.3s ease-out forwards' : undefined
                    }}
                  >
                    <Icon className={cn(
                      "w-5 h-5 mr-3 transition-transform duration-200",
                      isActive ? "text-primary-red scale-110" : "group-hover:scale-110"
                    )} />
                    <span className="relative z-10">{item.label}</span>
                    {item.path === "/notifications" && unreadCount && (unreadCount as any).count > 0 && (
                      <Badge className="ml-auto bg-primary-red text-white animate-pulse shadow-lg">
                        {(unreadCount as any).count}
                      </Badge>
                    )}
                    {!isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-b from-transparent to-gray-50/50 dark:to-gray-800/50">
            <div className="flex items-center px-4 py-3 bg-gradient-red-subtle dark:bg-secondary-red rounded-lg shadow-sm border border-secondary-red-medium dark:border-secondary-red-medium hover:shadow-md transition-all duration-200">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-red rounded-full flex items-center justify-center shadow-lg ring-2 ring-secondary-red dark:ring-secondary-red">
                  <span className="text-white text-sm font-semibold">
                    {user ? getInitials(user.name) : "AS"}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-text-dark dark:text-text-dark">
                  {user?.name || "Ahmad Sutrisno"}
                </p>
                <p className="text-xs text-text-light dark:text-text-light">
                  {user?.position || "IT Developer"}
                </p>
              </div>
            </div>
            
            {/* Theme Toggle & Logout */}
            <div className="mt-3 flex items-center space-x-2">
              <ThemeToggle />
              <button 
                onClick={logout}
                className="flex-1 flex items-center justify-center px-4 py-2 text-sm text-text-light dark:text-text-light hover:text-primary-red hover:bg-secondary-red dark:hover:bg-secondary-red rounded-lg transition-all duration-200 group"
              >
                <LogOut className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
