"use client";

import { useEffect, useState } from "react";
import { checkHealth } from "@/lib/api";

interface HealthStatus {
  status: "checking" | "healthy" | "unhealthy";
  message?: string;
}

export default function HealthCheck() {
  const [health, setHealth] = useState<HealthStatus>({ status: "checking" });

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const data = await checkHealth();
        if (data.status === "healthy") {
          setHealth({ status: "healthy", message: "Backend connected" });
        } else {
          setHealth({ status: "unhealthy", message: "Backend error" });
        }
      } catch (error) {
        setHealth({
          status: "unhealthy",
          message: "Backend unreachable",
        });
      }
    };

    // Check immediately
    checkBackend();

    // Check every 30 seconds
    const interval = setInterval(checkBackend, 30000);

    return () => clearInterval(interval);
  }, []);

  const statusStyles = {
    checking: {
      bg: "bg-gray-100",
      text: "text-gray-700",
      indicator: "bg-gray-400",
    },
    healthy: {
      bg: "bg-green-100",
      text: "text-green-700",
      indicator: "bg-green-500",
    },
    unhealthy: {
      bg: "bg-red-100",
      text: "text-red-700",
      indicator: "bg-red-500",
    },
  };

  const style = statusStyles[health.status];

  return (
    <div
      className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium ${style.bg} ${style.text}`}
      title={health.message}
    >
      <span
        className={`inline-flex h-2 w-2 rounded-full ${style.indicator} ${
          health.status === "checking" ? "animate-pulse" : ""
        }`}
      />
      <span>
        {health.status === "checking"
          ? "Checking backend..."
          : health.status === "healthy"
            ? "Backend connected"
            : "Backend offline"}
      </span>
    </div>
  );
}