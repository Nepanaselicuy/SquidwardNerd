import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, LogIn, LogOut, HourglassIcon } from "lucide-react";
import { formatTime, formatDate, formatTimeOnly } from "@/lib/time-utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/header";

export default function Attendance() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update time every second
  useState(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  });

  const { data: todayAttendance, isLoading } = useQuery({
    queryKey: ["/api/attendance", 1, "today"],
  });

  const { data: attendanceHistory } = useQuery({
    queryKey: ["/api/attendance", 1, "history"],
  });

  const checkInMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/attendance/checkin", { employeeId: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      toast({
        title: "Check In Berhasil",
        description: "Anda telah berhasil check in hari ini.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Check In Gagal",
        description: error.message || "Terjadi kesalahan saat check in.",
        variant: "destructive",
      });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/attendance/checkout", { employeeId: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      toast({
        title: "Check Out Berhasil",
        description: "Anda telah berhasil check out hari ini.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Check Out Gagal",
        description: error.message || "Terjadi kesalahan saat check out.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-100 text-success-green">Hadir</Badge>;
      case "absent":
        return <Badge className="bg-red-100 text-red-600">Tidak Hadir</Badge>;
      case "late":
        return <Badge className="bg-yellow-100 text-yellow-600">Terlambat</Badge>;
      case "leave":
        return <Badge className="bg-blue-100 text-blue-600">Cuti</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header 
        title="Absensi" 
        subtitle="Kelola kehadiran harian Anda"
      />

      {/* Check In/Out Section */}
      <Card className="mb-6 border-secondary-red-medium shadow-lg bg-gradient-red-subtle">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="mb-4">
              <div className="text-3xl font-bold text-primary-red-dark drop-shadow-sm">
                {formatTime(currentTime)}
              </div>
              <div className="text-primary-red">{formatDate(currentTime)}</div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={() => checkInMutation.mutate()}
                disabled={checkInMutation.isPending || !!todayAttendance?.checkIn}
                className="bg-success-green hover:bg-success-green/80 shadow-md hover:shadow-lg"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Check In
              </Button>
              <Button 
                onClick={() => checkOutMutation.mutate()}
                disabled={checkOutMutation.isPending || !todayAttendance?.checkIn || !!todayAttendance?.checkOut}
                className="bg-gradient-red hover:bg-primary-red-dark shadow-md hover:shadow-lg"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Check Out
              </Button>
            </div>

            <div className="mt-4 text-sm text-text-light">
              Status: <span className="text-success-green font-medium">
                {todayAttendance?.status === "present" ? "Hadir" : "Belum Absen"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="hover-lift border-secondary-red-medium hover:border-primary-red">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-primary-red-dark">Jam Masuk</h3>
                <p className="text-2xl font-bold text-text-dark">
                  {todayAttendance?.checkIn 
                    ? formatTimeOnly(new Date(todayAttendance.checkIn))
                    : "-"
                  }
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-success-green/20 to-success-green/30 rounded-lg shadow-md">
                <Clock className="text-success-green w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift border-secondary-red-medium hover:border-primary-red">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-primary-red-dark">Jam Keluar</h3>
                <p className="text-2xl font-bold text-text-dark">
                  {todayAttendance?.checkOut 
                    ? formatTimeOnly(new Date(todayAttendance.checkOut))
                    : "-"
                  }
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-primary-red/20 to-primary-red/30 rounded-lg shadow-md">
                <LogOut className="text-primary-red w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift border-secondary-red-medium hover:border-primary-red">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-primary-red-dark">Total Jam</h3>
                <p className="text-2xl font-bold text-text-dark">
                  {todayAttendance?.totalHours || "-"}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-info-blue/20 to-info-blue/30 rounded-lg shadow-md">
                <HourglassIcon className="text-info-blue w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance History */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Absensi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jam Masuk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jam Keluar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Jam
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceHistory?.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Date(record.date).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.checkIn 
                        ? formatTimeOnly(new Date(record.checkIn))
                        : "-"
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.checkOut 
                        ? formatTimeOnly(new Date(record.checkOut))
                        : "-"
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.totalHours || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(record.status)}
                    </td>
                  </tr>
                ))}
                
                {(!attendanceHistory || attendanceHistory.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Belum ada riwayat absensi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
