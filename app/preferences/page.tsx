/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";

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

export default function PreferencesPage() {
  const [timezones, setTimezones] = useState<string[]>([]);
  const [selectedTimezone, setSelectedTimezone] = useState("system");
  const [currentTime, setCurrentTime] = useState<string>("Loading...");
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingStatus, setFetchingStatus] = useState<string>("");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [language, setLanguage] = useState<string>("en-US");
  const [timeOffset, setTimeOffset] = useState<number>(0);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

  const availableLanguages = [
    { code: "en-US", name: "English" },
    // Add other languages here later
  ];

  useEffect(() => {
    const storedThemeValue = localStorage.getItem("theme") || "system";

    // Type guard to ensure storedThemeValue is a valid theme
    const isValidTheme = (
      t: string
    ): t is "system" | "light" | "dark" =>
      ["system", "light", "dark"].includes(t);

    // Use a functional update to set the theme safely.
    setTheme((prevTheme) => {
      if (isValidTheme(storedThemeValue)) {
        return storedThemeValue;
      } else {
        return "system"; // Default to "system" if the stored value is invalid
      }
    });
    //lanuage selector
    const storedLanguage = localStorage.getItem("language") || "en-US";
    setLanguage(storedLanguage);

    applyTheme(storedThemeValue); // Apply the theme on load

    //gets timezone from localstorage and sets default if none
    fetchTimezones();

    const storedTime = localStorage.getItem("storedTime");
    const storedTimezone = localStorage.getItem("timezone");

    if (storedTime && storedTimezone) {
      try {
        setSelectedTimezone(storedTimezone);
        startClockWithOffset(new Date(storedTime), storedTimezone);
      } catch (error) {
        console.error("Error parsing stored time:", error);
        fetchDeviceTime();
      }
    } else {
      fetchDeviceTime();
    }

    const checkViewportWidth = () => {
      if (window.innerWidth < 320) {
        document.documentElement.classList.remove("tailwind-enabled");
      } else {
        document.documentElement.classList.add("tailwind-enabled");
      }
    };

    checkViewportWidth();
    window.addEventListener("resize", checkViewportWidth);

    return () => {
      window.removeEventListener("resize", checkViewportWidth);
    };
  }, []);
 
  //theme engine to change themes
  const applyTheme = (selectedTheme: string) => {
    document.documentElement.classList.remove("light-theme", "dark-theme"); // Remove both classes first
    document.documentElement.classList.add(selectedTheme === "light" ? "light-theme" : "dark-theme");
    localStorage.setItem("theme", selectedTheme);
  };
  
  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  useEffect(() => {
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [timerId]);
//fixes the conversion offset
  const startClockWithOffset = (fetchedDate: Date, timezone?: string) => {
    const offset = fetchedDate.getTime() - Date.now();
    setTimeOffset(offset);

    if (timerId) clearInterval(timerId);

    const updateClock = () => {
      const now = new Date(Date.now() + offset);
      const formattedTime = now.toLocaleTimeString(language, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: timezone,
      });
      setCurrentTime(formattedTime);
    };

    updateClock();
    const newTimer = setInterval(updateClock, 1000);
    setTimerId(newTimer);

    localStorage.setItem("storedTime", fetchedDate.toISOString());
  };
//gets time from local device
  const fetchDeviceTime = () => {
    setLoading(true);
    setFetchingStatus("Fetching device time...");
    const now = new Date();
    const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    startClockWithOffset(now, deviceTimezone);
    setSelectedTimezone(deviceTimezone);
    localStorage.setItem("storedTime", now.toISOString());
    localStorage.setItem("timezone", deviceTimezone);
    setFetchingStatus("Device time fetched ✅");
    setLoading(false);
  };
//gets time zone from api
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
      setFetchingStatus("Timezones fetched successfully ✅");
    } catch (error: any) {
      console.error("Error fetching timezones:", error);
      setFetchingStatus(`Failed to fetch timezones: ${error.message} ❌`);
    }
  };
// gets time zone from ip adress and api
  const fetchNetworkTime = async () => {
    setLoading(true);
    setFetchingStatus("Fetching network time...");
    try {
      const ipData = await retry(async () => {
        const ipRes = await fetch("https://api64.ipify.org?format=json");
        if (!ipRes.ok) {
          throw new Error(`HTTP error fetching IP: ${ipRes.status}`);
        }
        const ipData = await ipRes.json();
        return ipData;
      });

      const ip = ipData.ip;

      const timeData = await retry(async () => {
        const timeRes = await fetch(
          `https://timeapi.io/api/timezone/ip?ipAddress=${ip}`
        );
        if (!timeRes.ok) {
          throw new Error(`HTTP error fetching timezone: ${timeRes.status}`);
        }
        return await timeRes.json();
      });

      const timezone = timeData.timeZone;

      if (!timezone) {
        throw new Error("Timezone not found in API response");
      }

      await fetchTimezoneTime(timezone);
      setFetchingStatus("Network time fetched ✅");

    } catch (error: any) {
      console.error("Error fetching network time:", error);
      setFetchingStatus(`Failed to fetch network time: ${error.message} ❌`);
      setFetchingStatus((prev) => prev + " Attempting to fetch device time as fallback...");
      fetchDeviceTime();
    } finally {
      setLoading(false);
    }
  };

//gets timezone from parsed data
  const fetchTimezoneTime = async (timezone: string) => {
    setLoading(true);
    setFetchingStatus("Fetching time for selected timezone...");
    try {
      const data = await retry(async () => {
        const res = await fetch(
          `https://timeapi.io/api/timezone/zone?timeZone=${encodeURIComponent(timezone)}`
        );
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return await res.json();
      });

      const fetchedDate = new Date(data.currentLocalTime || data.dateTime);
      startClockWithOffset(fetchedDate, timezone);
      setSelectedTimezone(timezone);

      localStorage.setItem("timezone", timezone);

      setFetchingStatus("Time fetched successfully ✅");
    } catch (error: any) {
      console.error("Error fetching timezone time:", error);
      setFetchingStatus(`Failed to fetch time: ${error.message} ❌`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto rounded-lg shadow-md">
      <main className="p-6">
        <h2 className="text-3xl font-bold mb-6 flex justify-center">
          ⚙️ Preferences
        </h2>
        <section className="mb-6">
          <h3 className="text-xl font-bold mb-3">Local Time Settings:</h3>
          <div className="flex gap-4 mb-3">
            <button
              onClick={fetchDeviceTime}
              className="w-full bg-gray-300 text-black py-2 rounded-lg dark:bg-gray-700"
              disabled={loading}
            >
              {loading ? "Fetching..." : "Fetch From Device"}
            </button>
            <button
              onClick={fetchNetworkTime}
              className="w-full bg-gray-300 text-black py-2 rounded-lg dark:bg-gray-700"
              disabled={loading}
            >
              {loading ? "Fetching..." : "Fetch From Network"}
            </button>
          </div>
          <select
            className="w-full p-2 bg-gray-300 text-black rounded-lg dark:bg-gray-700 dark:text-white"
            value={selectedTimezone}
            onChange={(e) => fetchTimezoneTime(e.target.value)}
            disabled={loading || timezones.length === 0}
          >
            <option value="system">🔌 Select Timezone</option>
            {timezones.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
          <p className="mt-3 text-lg font-bold">
            Local Time ({selectedTimezone}): {loading ? "Loading..." : currentTime}
          </p>
          {fetchingStatus && (
            <p className="mt-2 text-sm text-yellow-400">{fetchingStatus}</p>
          )}
        </section>
        <section className="mb-6">
          <h3 className="text-xl font-bold mb-3">App Theme</h3>
          <div className="flex gap-4">
            <button
              className={`w-1/3 py-2 rounded-lg ${
                theme === "light" ? "bg-gray-300 text-black" : "bg-gray-700"
              }`}
              onClick={() => {
                setTheme("light");
                applyTheme("light");
              }}
            >
              Light
            </button>
            <button
              className={`w-1/3 py-2 rounded-lg ${
                theme === "dark" ? "bg-gray-300 text-black" : "bg-gray-700"
              }`}
              onClick={() => {
                setTheme("dark");
                applyTheme("dark");
              }}
            >
              Dark
            </button>
            <button
              className={`w-1/3 py-2 rounded-lg ${
                theme === "system" ? "bg-gray-300 text-black" : "bg-gray-700"
              }`}
              onClick={() => {
                setTheme("system");
                applyTheme("system");
              }}
            >
              System
            </button>
          </div>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-bold mb-3">Language</h3>
          <select
            className="w-full p-2 bg-gray-300 text-black rounded-lg dark:bg-gray-700 dark:text-white"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {availableLanguages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </section>
      </main>
    </div>
  );
}