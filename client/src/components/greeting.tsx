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
    <div className="bg-gradient-to-r from-primary-red via-red-600 to-red-800 rounded-xl p-6 text-white mb-8 shadow-xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] animate-shimmer"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2 drop-shadow-lg">{greeting}</h1>
            <p className="text-red-100 text-lg">Semangat bekerja hari ini 🔥</p>
          </div>
          <div className="text-right bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="text-sm text-red-100">Hari ini</div>
            <div className="text-xl font-semibold drop-shadow-md">{formatDate(currentTime)}</div>
            <div className="text-lg text-red-200">{formatTime(currentTime)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
