import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Calendar, 
  Download, 
  RefreshCw,
  Wifi,
  WifiOff,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { AttendanceChart, MiniChart } from '@/components/charts/attendance-chart';
import { useAttendanceRealtime } from '@/hooks/use-realtime';
import { useRole } from '@/contexts/RoleContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorDisplay } from '@/components/ui/error-display';
import Header from '@/components/header';
import { format } from 'date-fns';

// Mock data for charts
const generateMockData = (days: number = 30) => {
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    data.push({
      date: format(date, 'MMM dd'),
      present: Math.floor(Math.random() * 50) + 30,
      absent: Math.floor(Math.random() * 10) + 2,
      late: Math.floor(Math.random() * 8) + 1,
      total: 45
    });
  }
  return data;
};

export default function AdminDashboard() {
  const { isAdmin, hasPermission } = useRole();
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area' | 'pie'>('line');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  
  const { isConnected, attendanceUpdates } = useAttendanceRealtime();

  // Check admin permissions
  if (!isAdmin && !hasPermission('analytics', 'read')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-lg font-semibold text-primary-red-dark mb-2">
            Admin Access Required
          </h3>
          <p className="text-text-light">
            You need admin privileges to access this dashboard.
          </p>
        </div>
      </div>
    );
  }

  // Mock queries for admin data
  const { data: attendanceStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/attendance-stats'],
    queryFn: () => ({
      totalEmployees: 45,
      presentToday: 38,
      absentToday: 5,
      lateToday: 2,
      attendanceRate: 84.4,
      monthlyAverage: 87.2
    })
  });

  const { data: leaveStats, isLoading: leaveLoading } = useQuery({
    queryKey: ['/api/admin/leave-stats'],
    queryFn: () => ({
      pendingRequests: 8,
      approvedThisMonth: 12,
      rejectedThisMonth: 3,
      totalLeaveDays: 45
    })
  });

  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['/api/admin/attendance-chart', timeRange],
    queryFn: () => generateMockData(timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90)
  });

  if (statsLoading || leaveLoading || chartLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner size="lg" variant="primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header 
        title="Admin Dashboard" 
        subtitle="Comprehensive attendance analytics and management"
      >
        <div className="flex items-center space-x-2">
          <Badge 
            variant={isConnected ? "default" : "secondary"}
            className="flex items-center gap-1"
          >
            {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isConnected ? 'Live' : 'Offline'}
          </Badge>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </Header>

      {/* Real-time Status */}
      {attendanceUpdates.length > 0 && (
        <Card className="border-secondary-red-medium">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-primary-red-dark flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {attendanceUpdates.slice(-3).map((update, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-text-dark">
                    {update.employeeName} - {update.action}
                  </span>
                  <span className="text-text-light">
                    {new Date(update.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-secondary-red-medium">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-red-dark">Total Employees</p>
                <p className="text-2xl font-bold text-text-dark">
                  {attendanceStats?.totalEmployees || 0}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-primary-red/20 to-primary-red/30 rounded-lg">
                <Users className="text-primary-red w-6 h-6" />
              </div>
            </div>
            <MiniChart data={chartData?.slice(-7) || []} type="line" className="mt-4" />
          </CardContent>
        </Card>

        <Card className="border-secondary-red-medium">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-red-dark">Present Today</p>
                <p className="text-2xl font-bold text-success-green">
                  {attendanceStats?.presentToday || 0}
                </p>
                <p className="text-xs text-text-light">
                  {attendanceStats?.attendanceRate || 0}% attendance rate
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-success-green/20 to-success-green/30 rounded-lg">
                <TrendingUp className="text-success-green w-6 h-6" />
              </div>
            </div>
            <MiniChart data={chartData?.slice(-7) || []} type="bar" className="mt-4" />
          </CardContent>
        </Card>

        <Card className="border-secondary-red-medium">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-red-dark">Absent Today</p>
                <p className="text-2xl font-bold text-primary-red">
                  {attendanceStats?.absentToday || 0}
                </p>
                <p className="text-xs text-text-light">
                  {attendanceStats?.lateToday || 0} late arrivals
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-accent-orange/20 to-accent-orange/30 rounded-lg">
                <Clock className="text-accent-orange w-6 h-6" />
              </div>
            </div>
            <MiniChart data={chartData?.slice(-7) || []} type="line" className="mt-4" />
          </CardContent>
        </Card>

        <Card className="border-secondary-red-medium">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-red-dark">Leave Requests</p>
                <p className="text-2xl font-bold text-info-blue">
                  {leaveStats?.pendingRequests || 0}
                </p>
                <p className="text-xs text-text-light">
                  Pending approval
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-info-blue/20 to-info-blue/30 rounded-lg">
                <Calendar className="text-info-blue w-6 h-6" />
              </div>
            </div>
            <MiniChart data={chartData?.slice(-7) || []} type="bar" className="mt-4" />
          </CardContent>
        </Card>
      </div>

      {/* Chart Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="area">Area Chart</SelectItem>
              <SelectItem value="pie">Pie Chart</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Main Chart */}
      <AttendanceChart 
        data={chartData || []}
        type={chartType}
        title={`Attendance Overview - Last ${timeRange === '7d' ? '7 Days' : timeRange === '30d' ? '30 Days' : '90 Days'}`}
      />

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-secondary-red-medium">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-primary-red-dark flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Department Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { dept: 'IT', attendance: 95, employees: 12 },
                { dept: 'HR', attendance: 88, employees: 8 },
                { dept: 'Finance', attendance: 92, employees: 10 },
                { dept: 'Marketing', attendance: 85, employees: 15 }
              ].map((dept) => (
                <div key={dept.dept} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-text-dark">{dept.dept}</p>
                    <p className="text-sm text-text-light">{dept.employees} employees</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-success-green">{dept.attendance}%</p>
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-success-green rounded-full"
                        style={{ width: `${dept.attendance}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-secondary-red-medium">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-primary-red-dark flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Leave Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: 'Annual Leave', count: 12, color: 'bg-success-green' },
                { type: 'Sick Leave', count: 8, color: 'bg-accent-orange' },
                { type: 'Personal Leave', count: 5, color: 'bg-info-blue' },
                { type: 'Emergency Leave', count: 3, color: 'bg-primary-red' }
              ].map((leave) => (
                <div key={leave.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${leave.color}`} />
                    <span className="text-text-dark">{leave.type}</span>
                  </div>
                  <span className="font-semibold text-text-dark">{leave.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 