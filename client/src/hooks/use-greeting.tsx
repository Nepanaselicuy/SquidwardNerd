import { useState, useEffect } from "react";
import { getGreeting } from "@/lib/time-utils";

export function useGreeting(userName: string = "") {
  const [greeting, setGreeting] = useState(() => getGreeting());

  useEffect(() => {
    const updateGreeting = () => {
      setGreeting(getGreeting());
    };

    // Update greeting every minute
    const interval = setInterval(updateGreeting, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return userName ? `${greeting}, ${userName}!` : greeting;
}
