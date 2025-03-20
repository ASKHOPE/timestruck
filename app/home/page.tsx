/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect, useState, useRef } from "react";

// Utility function for retrying a fetch operation
async function retry<T>(fn: () => Promise<T>, retries = 3, delay = 20): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0) {
      console.log(`Retrying after ${delay}ms... (Retries left: ${retries})`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retry(fn, retries - 1, delay);
    } else {
      throw error;
    }
  }
}

export default function HomePage() {
  const [timezones, setTimezones] = useState<string[]>([]);
  const [fromTimezone, setFromTimezone] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [convertedTime, setConvertedTime] = useState("");
  const [localTimezone, setLocalTimezone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeUntil, setTimeUntil] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchTimezones();

    const storedTimezone = localStorage.getItem("timezone");
    if (storedTimezone) {
      setLocalTimezone(storedTimezone);
      console.log("Local Timezone (from localStorage):", storedTimezone);
    } else {
      const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setLocalTimezone(deviceTimezone);
      console.log("Local Timezone (from device):", deviceTimezone);
    }

    return () => clearInterval(intervalRef.current as NodeJS.Timeout);
  }, []);

  const fetchTimezones = async () => {
    try {
      const data = await retry(async () => {
        const res = await fetch("https://timeapi.io/api/timezone/availabletimezones");
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return await res.json();
      });
      setTimezones(data);
    } catch (error: any) {
      console.error("Error fetching timezones:", error);
      setError(`Failed to fetch timezones: ${error.message}`);
    }
  };

  const formatTimeDifference = (diff: number): string => {
    const absDiff = Math.abs(diff);
    const seconds = Math.floor(absDiff / 1000) % 60;
    const minutes = Math.floor(absDiff / (1000 * 60)) % 60;
    const hours = Math.floor(absDiff / (1000 * 60 * 60)) % 24;
    const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
    const months = Math.floor(absDiff / (1000 * 60 * 60 * 24 * 30)); 
    const years = Math.floor(absDiff / (1000 * 60 * 60 * 24 * 365)); 

    let formattedDiff = "";
    if (years > 0) formattedDiff += `${years} Year${years > 1 ? "s" : ""} `;
    if (months > 0) formattedDiff += `${months} Month${months > 1 ? "s" : ""} `;
    if (days > 0) formattedDiff += `${days} Day${days > 1 ? "s" : ""} `;
    formattedDiff += `${hours} Hours ${minutes} Minutes ${seconds} Seconds`;

    return diff < 0 ? `-${formattedDiff}` : formattedDiff;
  };

  const convertTime = async () => {
    setLoading(true);
    setError("");

    try {
      const [datePart, timePart] = dateTime.split("T");
      const formattedDateTime = `${datePart} ${timePart.slice(0, 5)}:00`;

      const response = await fetch("https://timeapi.io/api/conversion/converttimezone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromTimeZone: fromTimezone,
          dateTime: formattedDateTime,
          toTimeZone: localTimezone,
          dstAmbiguity: "",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const newConvertedTime = data.conversionResult.dateTime;

      setConvertedTime(newConvertedTime);
      startCountdownOrShowDifference(newConvertedTime);
    } catch (error: any) {
      console.error("Error converting time:", error);
      setError(`Failed to convert time: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const startCountdownOrShowDifference = (targetTimeString: string) => {
    const targetTime = new Date(targetTimeString);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      const now = new Date();
      const timeDiff = targetTime.getTime() - now.getTime();
      setTimeUntil(formatTimeDifference(timeDiff));
    }, 1000);
  };

  const formatDateTime = (dateTimeString: string, timezone: string) => {
    const date = new Date(dateTimeString);
    const optionsDate: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: timezone,
    };
    const optionsTime12: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone,
    };
    const optionsTime24: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: timezone,
    };

    const formattedDate = date.toLocaleDateString('en-US', optionsDate);
    const formattedTime12 = date.toLocaleTimeString('en-US', optionsTime12);
    const formattedTime24 = date.toLocaleTimeString('en-US', optionsTime24);

    return {
      date: formattedDate,
      time12: formattedTime12,
      time24: formattedTime24,
      timezone: timezone,
    };
  };

  const formattedForeignTime = fromTimezone && dateTime ? formatDateTime(dateTime, fromTimezone) : null;
  const formattedLocalTime = convertedTime ? formatDateTime(convertedTime, localTimezone) : null;

  return (
    <div className=" p-4 max-w-md mx-auto rounded-lg shadow-md">
      <div>
        <h2 className="text-3xl font-bold mb-4">Foreign Time Zone</h2>
        {formattedForeignTime ? (
          <div className="bg-gray-700 p-4 mb-4 rounded">
            <p className="font-bold">{formattedForeignTime.timezone}</p>
            <p>{formattedForeignTime.date}</p>
            <p>{formattedForeignTime.time12} AM/PM / {formattedForeignTime.time24} 24H</p>
          </div>
        ) : (
          <p>How to use :<br></br>1.Select A Timezone <br></br>2. Select Date & Time <br></br>3. Hit The Covnert Button </p>
        )}

        <div>
          <label htmlFor="fromTimezone" className="block mb-2">Foreign Timezone:</label>
          <select
            id="fromTimezone"
            value={fromTimezone}
            onChange={(e) => setFromTimezone(e.target.value)}
            className="w-full p-2 bg-gray-600 text-white rounded"
          >
            <option value="">Select Timezone</option>
            {timezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label htmlFor="dateTime" className="block mb-2">Date and Time:</label>
          <input
            type="datetime-local"
            id="dateTime"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            className="w-full p-2 bg-gray-600 text-white rounded"
          />
        </div>

        <div className="text-center mt-4">
          <button onClick={convertTime} disabled={loading} className="bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded">
            {loading ? "Converting..." : "Convert"}
          </button>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-3xl font-bold mb-4">My Local Time Zone ({localTimezone})</h2>
        {formattedLocalTime ? (
          <div className="bg-gray-700 p-4 mb-4 rounded">
            <p className="font-bold">{formattedLocalTime.timezone}</p>
            <p>{formattedLocalTime.date}</p>
            <p>{formattedLocalTime.time12} AM/PM / {formattedLocalTime.time24} 24H</p>
            <p className="font-bold mt-2">Countdown:</p>
            <p>{timeUntil}</p>
          </div>
        ) : (
          <p>Converted time will appear here after conversion.</p>
        )}

   
      </div>

      {error && <p className="text-red-500 text-center mt-2">{error}</p>}
    </div>
  );
}