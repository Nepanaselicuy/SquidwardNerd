import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: events, isLoading } = useQuery({
    queryKey: ["/api/events"],
  });

  const { data: upcomingEvents } = useQuery({
    queryKey: ["/api/events/upcoming"],
  });

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add previous month's days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate.getDate(),
        isCurrentMonth: false,
        fullDate: prevDate,
      });
    }

    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      days.push({
        date: i,
        isCurrentMonth: true,
        fullDate: currentDate,
      });
    }

    // Add next month's days to complete the grid
    const remainingCells = 42 - days.length; // 6 rows × 7 days
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        date: i,
        isCurrentMonth: false,
        fullDate: nextDate,
      });
    }

    return days;
  };

  const hasEvent = (date: Date) => {
    if (!events) return false;
    const dateString = date.toISOString().split('T')[0];
    return events.some((event: any) => event.date === dateString);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-primary-red";
      case "training":
        return "bg-accent-orange";
      case "holiday":
        return "bg-success-green";
      case "gathering":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const monthName = currentDate.toLocaleDateString('id-ID', { 
    month: 'long', 
    year: 'numeric' 
  });

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 bg-gradient-to-r from-red-50 to-white p-6 rounded-xl border border-red-100">
        <h1 className="text-2xl font-bold text-red-800 flex items-center">
          <div className="w-3 h-8 bg-gradient-to-b from-primary-red to-red-600 rounded-full mr-4"></div>
          Kalender
        </h1>
        <p className="text-red-600 ml-7">Kalender perusahaan dan event penting</p>
      </div>

      {/* Calendar Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 capitalize">
              {monthName}
            </h2>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={goToToday}
                className="bg-primary-red hover:bg-red-700"
              >
                Hari Ini
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextMonth}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Week Days Header */}
            {weekDays.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {days.map((day, index) => (
              <div
                key={index}
                className={cn(
                  "aspect-square p-2 text-center text-sm relative hover:bg-gray-50 rounded cursor-pointer",
                  !day.isCurrentMonth && "text-gray-400",
                  isToday(day.fullDate) && "bg-primary-red text-white font-semibold"
                )}
              >
                <span>{day.date}</span>
                {hasEvent(day.fullDate) && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-red rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>Event Mendatang</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingEvents?.map((event: any) => (
              <div key={event.id} className="flex items-start">
                <div className={cn(
                  "flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center",
                  getEventTypeColor(event.type)
                )}>
                  <span className="text-white text-sm font-semibold">
                    {new Date(event.date).getDate()}
                  </span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">
                      {event.title}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {event.time}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {event.description}
                  </p>
                  {event.location && (
                    <div className="flex items-center mt-2">
                      <MapPin className="w-3 h-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">
                        {event.location}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {(!upcomingEvents || upcomingEvents.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <p>Tidak ada event mendatang</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
