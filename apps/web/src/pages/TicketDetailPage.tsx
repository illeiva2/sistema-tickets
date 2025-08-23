import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  EmptyState,
} from "@forzani/ui";
import { Button, Badge, Input } from "@forzani/ui";
import {
  ArrowLeft,
  Edit,
  MessageSquare,
  Paperclip,
  User,
  Calendar,
  Clock,
} from "lucide-react";
import { useTickets } from "../hooks";
import api from "../lib/api";

const TicketDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTicketById, addComment } = useTickets();
  const [isLoading, setIsLoading] = useState(true);
  const [ticket, setTicket] = useState<any | null>(null);
  const [commentText, setCommentText] = useState("");
  const [adding, setAdding] = useState(false);
  const [agents, setAgents] = useState<
    Array<{ id: string; name: string; email: string }>
  >([]);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!id) return;
      setIsLoading(true);
      const t = await getTicketById(id);
      if (!cancelled) {
        setTicket(t);
        setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
    // fijar dependencias para evitar recargas innecesarias
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Cargar agentes para asignación
  React.useEffect(() => {
    const loadAgents = async () => {
      try {
        const res = await api.get("/api/users/agents");
        setAgents(res.data?.data || []);
      } catch {
        // noop
      }
    };
    loadAgents();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/tickets")}
          >
            <ArrowLeft size={16} className="mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Ticket #{id}</h1>
            <p className="text-muted-foreground">Detalles del ticket</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cargando...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-muted rounded animate-pulse w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Información</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/tickets")}
        >
          <ArrowLeft size={16} className="mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Ticket #{id}</h1>
          <p className="text-muted-foreground">Detalles del ticket</p>
        </div>
        <div className="ml-auto flex space-x-2">
          <Button variant="outline" size="sm">
            <Edit size={16} className="mr-2" />
            Editar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contenido principal */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{ticket?.title || `Ticket ${id}`}</span>
                <Badge variant="secondary">{ticket?.status || "OPEN"}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {ticket?.description || "Sin descripción"}
                </p>

                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <User size={14} />
                    <span>
                      Reportado por: {ticket?.requester?.email || "-"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar size={14} />
                    <span>
                      {ticket?.createdAt
                        ? new Date(ticket.createdAt).toLocaleString()
                        : ""}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comentarios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare size={20} />
                <span>Comentarios</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ticket?.comments && ticket.comments.length > 0 ? (
                <div className="space-y-4">
                  {ticket.comments.map((c: any) => (
                    <div key={c.id} className="border rounded-md p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm text-muted-foreground">
                          {c.author?.name || c.author?.email || "Usuario"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(c.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-sm">{c.message}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<MessageSquare size={48} />}
                  title="Sin comentarios"
                  description="Este ticket aún no tiene comentarios. Sé el primero en agregar información o actualizaciones."
                  action={null}
                />
              )}

              {/* Formulario para nuevo comentario */}
              <div className="mt-4 flex items-center space-x-2">
                <Input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Escribe un comentario..."
                  className="flex-1"
                />
                <Button
                  disabled={adding || !commentText.trim()}
                  onClick={async () => {
                    if (!id || !commentText.trim()) return;
                    try {
                      setAdding(true);
                      const newC = await addComment(id, commentText.trim());
                      setTicket((prev: any) => {
                        if (!prev) return prev;
                        const comments = prev.comments
                          ? [...prev.comments, newC]
                          : [newC];
                        return { ...prev, comments };
                      });
                      setCommentText("");
                    } finally {
                      setAdding(false);
                    }
                  }}
                >
                  {adding ? (
                    "Enviando..."
                  ) : (
                    <>
                      <MessageSquare size={16} className="mr-2" />
                      Comentar
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Estado
                </label>
                <div className="flex items-center space-x-2">
                  <select
                    className="px-2 py-1 border rounded-md text-sm"
                    value={ticket?.status || "OPEN"}
                    onChange={async (e) => {
                      if (!ticket) return;
                      setSaving(true);
                      try {
                        const resp = await api.patch(
                          `/api/tickets/${ticket.id}`,
                          { status: e.target.value },
                        );
                        setTicket((prev: any) => ({
                          ...(prev || {}),
                          ...(resp.data?.data || {}),
                        }));
                      } finally {
                        setSaving(false);
                      }
                    }}
                  >
                    <option value="OPEN">Abierto</option>
                    <option value="IN_PROGRESS">En progreso</option>
                    <option value="RESOLVED">Resuelto</option>
                    <option value="CLOSED">Cerrado</option>
                  </select>
                  {saving && (
                    <span className="text-xs text-muted-foreground">
                      Guardando...
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Prioridad
                </label>
                <div className="flex items-center space-x-2">
                  <select
                    className="px-2 py-1 border rounded-md text-sm"
                    value={ticket?.priority || "MEDIUM"}
                    onChange={async (e) => {
                      if (!ticket) return;
                      setSaving(true);
                      try {
                        const resp = await api.patch(
                          `/api/tickets/${ticket.id}`,
                          { priority: e.target.value },
                        );
                        setTicket((prev: any) => ({
                          ...(prev || {}),
                          ...(resp.data?.data || {}),
                        }));
                      } finally {
                        setSaving(false);
                      }
                    }}
                  >
                    <option value="LOW">Baja</option>
                    <option value="MEDIUM">Media</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Asignado a
                </label>
                <div className="flex items-center space-x-2">
                  <User size={14} />
                  <select
                    className="px-2 py-1 border rounded-md text-sm"
                    value={ticket?.assignee?.id || ""}
                    onChange={async (e) => {
                      if (!ticket) return;
                      setSaving(true);
                      try {
                        const resp = await api.patch(
                          `/api/tickets/${ticket.id}`,
                          {
                            assigneeId: e.target.value || null,
                          },
                        );
                        setTicket((prev: any) => ({
                          ...(prev || {}),
                          ...(resp.data?.data || {}),
                        }));
                      } finally {
                        setSaving(false);
                      }
                    }}
                  >
                    <option value="">Sin asignar</option>
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Creado
                </label>
                <div className="flex items-center space-x-2">
                  <Clock size={14} />
                  <span className="text-sm">
                    {ticket?.createdAt
                      ? new Date(ticket.createdAt).toLocaleString()
                      : ""}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Paperclip size={20} />
                <span>Archivos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={<Paperclip size={32} />}
                title="Sin archivos"
                description="No se han adjuntado archivos a este ticket."
                action={
                  <Button variant="outline" size="sm">
                    <Paperclip size={16} className="mr-2" />
                    Adjuntar Archivo
                  </Button>
                }
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;
