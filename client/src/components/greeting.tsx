import { useEffect, useState } from "react";
import { formatTime, formatDate } from "@/lib/time-utils";
import { useGreeting } from "@/hooks/use-greeting";

interface GreetingProps {
  userName: string;
}

export default function Greeting({ userName }: GreetingProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const greeting = useGreeting(userName);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gradient-to-r from-primary-red to-red-700 rounded-xl p-6 text-white mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">{greeting}</h1>
          <p className="text-red-100">Semangat bekerja hari ini</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-red-100">Hari ini</div>
          <div className="text-xl font-semibold">{formatDate(currentTime)}</div>
          <div className="text-lg">{formatTime(currentTime)}</div>
        </div>
      </div>
    </div>
  );
}
