import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Home, Clock, Calendar, Bell, CalendarDays, User, LogOut } from "lucide-react";

const menuItems = [
  { path: "/", label: "Dashboard", icon: Home },
  { path: "/attendance", label: "Absensi", icon: Clock },
  { path: "/leave", label: "Izin/Cuti", icon: Calendar },
  { path: "/notifications", label: "Notifikasi", icon: Bell },
  { path: "/calendar", label: "Kalender", icon: CalendarDays },
  { path: "/profile", label: "Profile", icon: User },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();

  const { data: employee } = useQuery({
    queryKey: ["/api/employee", 1],
  });

  const { data: unreadCount } = useQuery({
    queryKey: ["/api/notifications", 1, "unread-count"],
  });

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
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-center px-6 py-8 bg-primary-red">
            <div className="flex items-center space-x-3">
              <img 
                src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNMjAgNEwzMiAxNEgyOEwyMCA4TDEyIDE0SDhMMjAgNFoiIGZpbGw9IndoaXRlIi8+CiAgPHBhdGggZD0iTTggMTZIMTJMMjAgMjJMMjggMTZIMzJMMjAgMzZMOCAxNloiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuOCIvPgogIDxyZWN0IHg9IjQiIHk9IjE0IiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiByeD0iMiIgZmlsbD0id2hpdGUiLz4KICA8cmVjdCB4PSIzMiIgeT0iMTQiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIHJ4PSIyIiBmaWxsPSJ3aGl0ZSIvPgogIDxyZWN0IHg9IjQiIHk9IjIyIiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiByeD0iMiIgZmlsbD0id2hpdGUiLz4KICA8cmVjdCB4PSIzMiIgeT0iMjIiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIHJ4PSIyIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K" 
                alt="PT Intek Solusi Indonesia Logo" 
                className="w-10 h-10"
              />
              <div className="text-white">
                <div className="text-lg font-bold">SIIhadirin</div>
                <div className="text-xs opacity-90">Attendance System</div>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const isActive = location === item.path;
              const Icon = item.icon;
              
              return (
                <Link key={item.path} href={item.path}>
                  <div className={cn(
                    "flex items-center px-4 py-3 rounded-lg font-medium transition-colors",
                    isActive 
                      ? "text-primary-red bg-secondary-red" 
                      : "text-gray-600 hover:bg-gray-50"
                  )}>
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                    {item.path === "/notifications" && unreadCount && unreadCount.count > 0 && (
                      <Badge className="ml-auto bg-primary-red text-white">
                        {unreadCount.count}
                      </Badge>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-red rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {employee ? getInitials(employee.name) : "AS"}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {employee?.name || "Ahmad Sutrisno"}
                </p>
                <p className="text-xs text-gray-500">
                  {employee?.position || "IT Developer"}
                </p>
              </div>
            </div>
            <button className="w-full mt-3 flex items-center justify-center px-4 py-2 text-sm text-gray-600 hover:text-primary-red transition-colors">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
