import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, LogOut, Calendar, Plane, CheckCircle, Info, AlertCircle } from "lucide-react";
import Greeting from "@/components/greeting";
import Header from "@/components/header";
import { formatRelativeTime, formatTimeOnly } from "@/lib/time-utils";
import { LoadingSpinner, LoadingSkeleton } from "@/components/ui/loading-spinner";
import { ErrorDisplay } from "@/components/ui/error-display";

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
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner size="lg" variant="primary" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 flex items-center justify-center">
              <LoadingSkeleton lines={3} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header 
        title="SIIhadirin" 
        subtitle="Attendance Management System"
      >
        <Greeting userName={(employee as any)?.name?.split(" ")[0] || "Ahmad"} />
      </Header>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover-lift border-secondary-red-medium hover:border-primary-red">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-success-green/20 to-success-green/30 rounded-lg shadow-md">
                <Clock className="text-success-green w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-primary-red-dark">Check In</h3>
                <p className="text-lg font-semibold text-text-dark">
                  {todayAttendance?.checkIn 
                    ? formatTimeOnly(new Date(todayAttendance.checkIn))
                    : "-"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift border-secondary-red-medium hover:border-primary-red">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-primary-red/20 to-primary-red/30 rounded-lg shadow-md">
                <LogOut className="text-primary-red w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-primary-red-dark">Check Out</h3>
                <p className="text-lg font-semibold text-text-dark">
                  {todayAttendance?.checkOut 
                    ? formatTimeOnly(new Date(todayAttendance.checkOut))
                    : "-"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift border-secondary-red-medium hover:border-primary-red">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-info-blue/20 to-info-blue/30 rounded-lg shadow-md">
                <Calendar className="text-info-blue w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-primary-red-dark">Hadir Bulan Ini</h3>
                <p className="text-lg font-semibold text-text-dark">
                  {monthlyStats ? `${monthlyStats.present}/${monthlyStats.total}` : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift border-secondary-red-medium hover:border-primary-red">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-accent-orange/20 to-accent-orange/30 rounded-lg shadow-md">
                <Plane className="text-accent-orange w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-primary-red-dark">Sisa Cuti</h3>
                <p className="text-lg font-semibold text-text-dark">
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
        <Card className="border-secondary-red-medium hover:border-primary-red hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-primary-red-dark mb-4 flex items-center">
              <div className="w-2 h-6 bg-gradient-red rounded-full mr-3"></div>
              Aktivitas Terbaru
            </h3>
            <div className="space-y-4">
              {todayAttendance?.checkIn && (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-success-green rounded-full"></div>
                  <div className="ml-3">
                    <p className="text-sm text-text-dark">Check In berhasil</p>
                    <p className="text-xs text-text-light">
                      Hari ini, {formatTimeOnly(new Date(todayAttendance.checkIn))}
                    </p>
                  </div>
                </div>
              )}
              
              {todayAttendance?.checkOut && (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary-red rounded-full"></div>
                  <div className="ml-3">
                    <p className="text-sm text-text-dark">Check Out berhasil</p>
                    <p className="text-xs text-text-light">
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
        <Card className="border-secondary-red-medium hover:border-primary-red hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-primary-red-dark mb-4 flex items-center">
              <div className="w-2 h-6 bg-gradient-red rounded-full mr-3"></div>
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
                    <p className="text-sm font-medium text-text-dark">{event.title}</p>
                    <p className="text-xs text-text-light">
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
