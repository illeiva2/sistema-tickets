import { useState, useEffect } from "react";

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

      // Por ahora simulamos los datos, pero aquí se harían las llamadas reales a la API
      // const response = await api.get('/api/dashboard/stats');
      // setStats(response.data.data);

      // Simulación de datos reales
      const mockStats: DashboardStats = {
        totalTickets: 156,
        openTickets: 12,
        inProgressTickets: 8,
        resolvedTickets: 24,
        closedTickets: 112,
        urgentTickets: 3,
        totalUsers: 23,
        activeAgents: 18,
        recentActivity: [
          {
            id: "1",
            type: "ticket_created",
            description: "Nuevo ticket creado",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
            ticketId: "ticket-123",
            userId: "user-1",
            userName: "admin@empresa.com",
          },
          {
            id: "2",
            type: "ticket_resolved",
            description: "Ticket resuelto",
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 horas atrás
            ticketId: "ticket-456",
            userId: "user-2",
            userName: "agent1@empresa.com",
          },
          {
            id: "3",
            type: "ticket_updated",
            description: "Ticket asignado",
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 horas atrás
            ticketId: "ticket-789",
            userId: "user-3",
            userName: "agent2@empresa.com",
          },
        ],
      };

      setStats(mockStats);
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
