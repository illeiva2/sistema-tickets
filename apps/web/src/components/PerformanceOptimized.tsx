import React, { memo, useMemo, useCallback, Suspense, lazy } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@forzani/ui";

// Lazy loading de componentes pesados
const HeavyChart = lazy(() => import("./HeavyChart"));
const DataTable = lazy(() => import("./DataTable"));

// Componente memoizado para evitar re-renders innecesarios
const TicketCard = memo(
  ({ ticket, onUpdate }: { ticket: any; onUpdate: (id: string) => void }) => {
    const handleUpdate = useCallback(() => {
      onUpdate(ticket.id);
    }, [ticket.id, onUpdate]);

    return (
      <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
        <h3 className="font-semibold">{ticket.title}</h3>
        <p className="text-sm text-gray-600">{ticket.description}</p>
        <div className="flex justify-between items-center mt-2">
          <span
            className={`px-2 py-1 rounded text-xs ${
              ticket.priority === "HIGH"
                ? "bg-red-100 text-red-800"
                : ticket.priority === "MEDIUM"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
            }`}
          >
            {ticket.priority}
          </span>
          <button
            onClick={handleUpdate}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Update
          </button>
        </div>
      </div>
    );
  },
);

TicketCard.displayName = "TicketCard";

// Hook personalizado para datos optimizados
const useOptimizedTickets = (filters: any) => {
  return useQuery({
    queryKey: ["tickets", filters],
    queryFn: async () => {
      const response = await fetch(
        `/api/tickets?${new URLSearchParams(filters)}`,
      );
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

// Componente principal optimizado
const PerformanceOptimized: React.FC = () => {
  const [filters, setFilters] = React.useState({});

  // Query optimizada con cache
  const { data: ticketsData, isLoading, error } = useOptimizedTickets(filters);

  // Memoizar datos procesados
  const processedTickets = useMemo(() => {
    if (!ticketsData?.data) return [];

    return ticketsData.data.map((ticket: any) => ({
      ...ticket,
      // Procesar datos pesados solo una vez
      processedDate: new Date(ticket.createdAt).toLocaleDateString(),
      priorityColor:
        ticket.priority === "HIGH"
          ? "red"
          : ticket.priority === "MEDIUM"
            ? "yellow"
            : "green",
    }));
  }, [ticketsData]);

  // Callbacks memoizados
  const handleTicketUpdate = useCallback((ticketId: string) => {
    console.log("Updating ticket:", ticketId);
  }, []);

  const handleFilterChange = useCallback((newFilters: any) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Estadísticas memoizadas
  const stats = useMemo(() => {
    if (!processedTickets.length)
      return { total: 0, byStatus: {}, byPriority: {} };

    const byStatus = processedTickets.reduce((acc: any, ticket: any) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {});

    const byPriority = processedTickets.reduce((acc: any, ticket: any) => {
      acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
      return acc;
    }, {});

    return {
      total: processedTickets.length,
      byStatus,
      byPriority,
    };
  }, [processedTickets]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading tickets</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Tickets Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600">Total Tickets</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {stats.byStatus.OPEN || 0}
            </div>
            <div className="text-sm text-gray-600">Open Tickets</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">
              {stats.byPriority.HIGH || 0}
            </div>
            <div className="text-sm text-gray-600">High Priority</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap gap-4">
          <select
            onChange={(e) => handleFilterChange({ status: e.target.value })}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            onChange={(e) => handleFilterChange({ priority: e.target.value })}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All Priority</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Lista de tickets optimizada */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {processedTickets.map((ticket: any) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            onUpdate={handleTicketUpdate}
          />
        ))}
      </div>

      {/* Componentes lazy loading */}
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <HeavyChart data={stats} />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <DataTable data={processedTickets} />
      </Suspense>
    </div>
  );
};

export default PerformanceOptimized;
