import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  TicketsEmptyState,
  TicketCardSkeleton,
} from "@forzani/ui";
import { Button } from "@forzani/ui";
import { Plus, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTickets } from "../hooks";

const TicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    tickets,
    isLoading,
    total,
    page,
    pageSize,
    filters,
    fetchTickets,
    setPage,
    setFilters,
  } = useTickets();

  // Cargar tickets al montar y refetch con debounce cuando cambian filtros
  React.useEffect(() => {
    fetchTickets({ filters, page, pageSize });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const handle = setTimeout(() => {
      fetchTickets({ filters, page: 1, pageSize });
      setPage(1);
    }, 250);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q, filters.status, filters.priority]);

  // No early return on loading to preserve input focus

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tickets</h1>
          <p className="text-muted-foreground">
            Gestión y seguimiento de tickets del sistema
          </p>
        </div>
        <Button onClick={() => navigate("/tickets/new")}>
          <Plus size={16} className="mr-2" />
          Nuevo Ticket
        </Button>
      </div>

      {/* Filtros básicos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter size={20} />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Buscar tickets..."
                value={filters.q || ""}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <select
              value={filters.status || ""}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Todos los estados</option>
              <option value="OPEN">Abierto</option>
              <option value="IN_PROGRESS">En progreso</option>
              <option value="RESOLVED">Resuelto</option>
              <option value="CLOSED">Cerrado</option>
            </select>
            <select
              value={filters.priority || ""}
              onChange={(e) =>
                setFilters({ ...filters, priority: e.target.value })
              }
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Todas las prioridades</option>
              <option value="LOW">Baja</option>
              <option value="MEDIUM">Media</option>
              <option value="HIGH">Alta</option>
              <option value="URGENT">Urgente</option>
            </select>
            <Button
              onClick={() => fetchTickets({ filters })}
              className="px-4 py-2"
            >
              Aplicar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de tickets */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Tickets</CardTitle>
            <span className="text-sm text-muted-foreground">
              {total} tickets encontrados
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <TicketCardSkeleton key={i} />
              ))}
            </div>
          ) : !tickets || tickets.length === 0 ? (
            <TicketsEmptyState
              action={
                <Button onClick={() => navigate("/tickets/new")}>
                  <Plus size={16} className="mr-2" />
                  Crear Primer Ticket
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-lg">
                          {ticket.title}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            ticket.priority === "URGENT"
                              ? "bg-red-100 text-red-800"
                              : ticket.priority === "HIGH"
                                ? "bg-orange-100 text-orange-800"
                                : ticket.priority === "MEDIUM"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                          }`}
                        >
                          {ticket.priority}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            ticket.status === "OPEN"
                              ? "bg-blue-100 text-blue-800"
                              : ticket.status === "IN_PROGRESS"
                                ? "bg-purple-100 text-purple-800"
                                : ticket.status === "RESOLVED"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-muted-foreground mb-3">
                        {ticket.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>
                          Solicitante: {ticket.requester?.name || "N/A"}
                        </span>
                        {ticket.assignee && (
                          <span>Asignado a: {ticket.assignee.name}</span>
                        )}
                        <span>
                          Creado:{" "}
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                      >
                        Ver Detalle
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginación */}
          {total > pageSize && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Mostrando {(page - 1) * pageSize + 1} a{" "}
                {Math.min(page * pageSize, total)} de {total} tickets
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <span className="px-3 py-1 text-sm">
                  Página {page} de {Math.ceil(total / pageSize)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage(Math.min(Math.ceil(total / pageSize), page + 1))
                  }
                  disabled={page >= Math.ceil(total / pageSize)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketsPage;
