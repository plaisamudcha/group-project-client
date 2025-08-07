import { useState, useEffect } from "react";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { Clock } from "lucide-react";

// Configure dayjs to use Thai locale
dayjs.locale("th");

const Time = () => {
  const [currentTime, setCurrentTime] = useState(dayjs());

  useEffect(() => {
    // Update time immediately
    setCurrentTime(dayjs());

    // Set up interval to update every second
    const interval = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 shadow-sm">
      <Clock className="h-4 w-4 text-blue-600" />
      <div className="text-center">
        <div className="text-sm font-bold text-blue-800 font-mono">
          {currentTime.format("HH:mm:ss")}
        </div>
        <div className="text-xs text-blue-600">
          {currentTime.format("DD/MM/YYYY")}
        </div>
      </div>
    </div>
  );
};

export default Time;
