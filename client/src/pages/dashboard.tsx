import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, LogOut, Calendar, Plane, CheckCircle, Info, AlertCircle } from "lucide-react";
import Greeting from "@/components/greeting";
import { formatRelativeTime, formatTimeOnly } from "@/lib/time-utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: employee, isLoading: employeeLoading } = useQuery({
    queryKey: ["/api/employee", 1],
  });

  const { data: todayAttendance } = useQuery({
    queryKey: ["/api/attendance", 1, "today"],
  });

  const { data: monthlyStats } = useQuery({
    queryKey: ["/api/attendance", 1, "stats"],
  });

  const { data: attendanceHistory } = useQuery({
    queryKey: ["/api/attendance", 1, "history"],
    enabled: false, // Only load recent for activity
  });

  const { data: upcomingEvents } = useQuery({
    queryKey: ["/api/events/upcoming"],
  });

  if (employeeLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Greeting userName={employee?.name?.split(" ")[0] || "Ahmad"} />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover-lift border-red-100 hover:border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-lg shadow-md">
                <Clock className="text-success-green w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-red-600">Check In</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {todayAttendance?.checkIn 
                    ? formatTimeOnly(new Date(todayAttendance.checkIn))
                    : "-"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift border-red-100 hover:border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-red-100 to-red-200 rounded-lg shadow-md">
                <LogOut className="text-primary-red w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-red-600">Check Out</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {todayAttendance?.checkOut 
                    ? formatTimeOnly(new Date(todayAttendance.checkOut))
                    : "-"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift border-red-100 hover:border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-red-100 to-red-200 rounded-lg shadow-md">
                <Calendar className="text-primary-red w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-red-600">Hadir Bulan Ini</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {monthlyStats ? `${monthlyStats.present}/${monthlyStats.total}` : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift border-red-100 hover:border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-red-100 to-red-200 rounded-lg shadow-md">
                <Plane className="text-primary-red w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-red-600">Sisa Cuti</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {employee?.annualLeaveBalance || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="border-red-100 hover:border-red-200 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
              <div className="w-2 h-6 bg-gradient-to-b from-primary-red to-red-600 rounded-full mr-3"></div>
              Aktivitas Terbaru
            </h3>
            <div className="space-y-4">
              {todayAttendance?.checkIn && (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-success-green rounded-full"></div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-900">Check In berhasil</p>
                    <p className="text-xs text-gray-500">
                      Hari ini, {formatTimeOnly(new Date(todayAttendance.checkIn))}
                    </p>
                  </div>
                </div>
              )}
              
              {todayAttendance?.checkOut && (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary-red rounded-full"></div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-900">Check Out berhasil</p>
                    <p className="text-xs text-gray-500">
                      Hari ini, {formatTimeOnly(new Date(todayAttendance.checkOut))}
                    </p>
                  </div>
                </div>
              )}

              {!todayAttendance?.checkIn && !todayAttendance?.checkOut && (
                <div className="flex items-center text-gray-500">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <p className="text-sm">Belum ada aktivitas hari ini</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="border-red-100 hover:border-red-200 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
              <div className="w-2 h-6 bg-gradient-to-b from-primary-red to-red-600 rounded-full mr-3"></div>
              Event Mendatang
            </h3>
            <div className="space-y-4">
              {upcomingEvents?.map((event) => (
                <div key={event.id} className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-red rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {new Date(event.date).getDate()}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{event.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(event.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}, {event.time}
                    </p>
                  </div>
                </div>
              ))}
              
              {(!upcomingEvents || upcomingEvents.length === 0) && (
                <div className="flex items-center text-gray-500">
                  <Info className="w-4 h-4 mr-2" />
                  <p className="text-sm">Tidak ada event mendatang</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
