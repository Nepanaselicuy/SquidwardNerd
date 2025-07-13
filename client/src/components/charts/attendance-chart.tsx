import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Users, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttendanceData {
  date: string;
  present: number;
  absent: number;
  late: number;
  total: number;
}

interface AttendanceChartProps {
  data: AttendanceData[];
  type?: 'line' | 'bar' | 'area' | 'pie';
  title?: string;
  className?: string;
}

const COLORS = {
  present: '#16A34A', // success-green
  absent: '#DC2626',  // primary-red
  late: '#EAB308',    // accent-orange
  total: '#1D4ED8'    // info-blue
};

export function AttendanceChart({ 
  data, 
  type = 'line', 
  title = 'Attendance Overview',
  className 
}: AttendanceChartProps) {
  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="present" fill={COLORS.present} name="Present" />
            <Bar dataKey="absent" fill={COLORS.absent} name="Absent" />
            <Bar dataKey="late" fill={COLORS.late} name="Late" />
          </BarChart>
        );
      
      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="present" 
              stackId="1" 
              stroke={COLORS.present} 
              fill={COLORS.present} 
              name="Present" 
            />
            <Area 
              type="monotone" 
              dataKey="absent" 
              stackId="1" 
              stroke={COLORS.absent} 
              fill={COLORS.absent} 
              name="Absent" 
            />
            <Area 
              type="monotone" 
              dataKey="late" 
              stackId="1" 
              stroke={COLORS.late} 
              fill={COLORS.late} 
              name="Late" 
            />
          </AreaChart>
        );
      
      case 'pie':
        const pieData = data.length > 0 ? [
          { name: 'Present', value: data[data.length - 1]?.present || 0, color: COLORS.present },
          { name: 'Absent', value: data[data.length - 1]?.absent || 0, color: COLORS.absent },
          { name: 'Late', value: data[data.length - 1]?.late || 0, color: COLORS.late }
        ] : [];
        
        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '8px'
              }}
            />
          </PieChart>
        );
      
      default: // line
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="present" 
              stroke={COLORS.present} 
              strokeWidth={2}
              name="Present" 
            />
            <Line 
              type="monotone" 
              dataKey="absent" 
              stroke={COLORS.absent} 
              strokeWidth={2}
              name="Absent" 
            />
            <Line 
              type="monotone" 
              dataKey="late" 
              stroke={COLORS.late} 
              strokeWidth={2}
              name="Late" 
            />
          </LineChart>
        );
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'bar':
        return <Users className="w-4 h-4" />;
      case 'area':
        return <TrendingUp className="w-4 h-4" />;
      case 'pie':
        return <Calendar className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <Card className={cn("border-secondary-red-medium dark:border-secondary-red-medium", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-primary-red-dark dark:text-primary-red-dark flex items-center gap-2">
            {getIcon()}
            {title}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {type.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Mini chart component for dashboard cards
interface MiniChartProps {
  data: AttendanceData[];
  type?: 'line' | 'bar';
  className?: string;
}

export function MiniChart({ data, type = 'line', className }: MiniChartProps) {
  return (
    <div className={cn("w-full h-20", className)}>
      <ResponsiveContainer width="100%" height="100%">
        {type === 'bar' ? (
          <BarChart data={data}>
            <Bar dataKey="present" fill={COLORS.present} />
            <Bar dataKey="absent" fill={COLORS.absent} />
            <Bar dataKey="late" fill={COLORS.late} />
          </BarChart>
        ) : (
          <LineChart data={data}>
            <Line 
              type="monotone" 
              dataKey="present" 
              stroke={COLORS.present} 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="absent" 
              stroke={COLORS.absent} 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
} 