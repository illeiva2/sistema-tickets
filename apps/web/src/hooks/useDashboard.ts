import { useState, useEffect } from "react";
import api from "../lib/api";

interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  urgentTickets: number;
  totalUsers: number;
  activeAgents: number;
  recentActivity: Array<{
    id: string;
    type:
      | "ticket_created"
      | "ticket_updated"
      | "ticket_resolved"
      | "comment_added";
    description: string;
    timestamp: string;
    ticketId?: string;
    userId?: string;
    userName?: string;
  }>;
}

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/api/dashboard/stats");
      setStats(response.data.data);
    } catch (error: any) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const refreshStats = () => {
    fetchDashboardStats();
  };

  return {
    stats,
    isLoading,
    refreshStats,
  };
};
