import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Info, Clock, Bell, Eye } from "lucide-react";
import { formatRelativeTime } from "@/lib/time-utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function Notifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["/api/notifications", 1],
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => apiRequest("PATCH", `/api/notifications/${id}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const [selectedCategory, setSelectedCategory] = useState<string>("semua");
  const [sortOrder, setSortOrder] = useState<"terbaru" | "terlama">("terbaru");

  // Map button to notification type
  const categoryMap: Record<string, string | null> = {
    semua: null,
    absensi: "attendance",
    cuti: "leave",
    pengumuman: "announcement",
  };

  // Filter and sort notifications
  const filteredNotifications = (notifications || [])
    .filter((notif) => {
      if (!categoryMap[selectedCategory]) return true;
      return notif.type === categoryMap[selectedCategory];
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "terbaru" ? dateB - dateA : dateA - dateB;
    });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "leave":
        return <CheckCircle className="text-success-green w-5 h-5" />;
      case "announcement":
        return <Info className="text-blue-600 w-5 h-5" />;
      case "reminder":
        return <Clock className="text-accent-orange w-5 h-5" />;
      case "attendance":
        return <Bell className="text-primary-red w-5 h-5" />;
      default:
        return <Info className="text-gray-500 w-5 h-5" />;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case "leave":
        return "bg-green-100";
      case "announcement":
        return "bg-blue-100";
      case "reminder":
        return "bg-orange-100";
      case "attendance":
        return "bg-red-100";
      default:
        return "bg-gray-100";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 bg-gradient-to-r from-red-50 to-white p-6 rounded-xl border border-red-100">
        <h1 className="text-2xl font-bold text-red-800 flex items-center">
          <div className="w-3 h-8 bg-gradient-to-b from-primary-red to-red-600 rounded-full mr-4"></div>
          Notifikasi
        </h1>
        <p className="text-red-600 ml-7">Informasi terbaru untuk Anda</p>
      </div>

      {/* Notification Categories */}
      <div className="flex flex-wrap gap-2 mb-6 items-center">
        <Button
          className={selectedCategory === "semua" ? "bg-primary-red hover:bg-red-700 text-white" : ""}
          variant={selectedCategory === "semua" ? undefined : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("semua")}
        >
          Semua
        </Button>
        <Button
          className={selectedCategory === "absensi" ? "bg-primary-red hover:bg-red-700 text-white" : ""}
          variant={selectedCategory === "absensi" ? undefined : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("absensi")}
        >
          Absensi
        </Button>
        <Button
          className={selectedCategory === "cuti" ? "bg-primary-red hover:bg-red-700 text-white" : ""}
          variant={selectedCategory === "cuti" ? undefined : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("cuti")}
        >
          Cuti
        </Button>
        <Button
          className={selectedCategory === "pengumuman" ? "bg-primary-red hover:bg-red-700 text-white" : ""}
          variant={selectedCategory === "pengumuman" ? undefined : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("pengumuman")}
        >
          Pengumuman
        </Button>
        <div className="ml-auto flex gap-2">
          <Button
            variant={sortOrder === "terbaru" ? undefined : "outline"}
            size="sm"
            className={sortOrder === "terbaru" ? "bg-primary-red hover:bg-red-700 text-white" : ""}
            onClick={() => setSortOrder("terbaru")}
          >
            Terbaru
          </Button>
          <Button
            variant={sortOrder === "terlama" ? undefined : "outline"}
            size="sm"
            className={sortOrder === "terlama" ? "bg-primary-red hover:bg-red-700 text-white" : ""}
            onClick={() => setSortOrder("terlama")}
          >
            Terlama
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <Card 
            key={notification.id} 
            className={cn(
              "transition-colors",
              !notification.isRead && "border-primary-red border-l-4"
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    getNotificationBgColor(notification.type)
                  )}>
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 flex items-center">
                      {notification.title}
                      {!notification.isRead && (
                        <Badge className="ml-2 bg-primary-red text-white text-xs">
                          Baru
                        </Badge>
                      )}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {formatRelativeTime(new Date(notification.createdAt))}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                  <div className="mt-3 flex space-x-2">
                    {!notification.isRead && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsReadMutation.mutate(notification.id)}
                        disabled={markAsReadMutation.isPending}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Tandai Dibaca
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {(filteredNotifications.length === 0) && (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Tidak ada notifikasi
              </h3>
              <p className="text-gray-500">
                Notifikasi baru akan muncul di sini
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
