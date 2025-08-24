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
import { useTickets, useAuth } from "../hooks";
import api, { API_URL } from "../lib/api";

const TicketDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTicketById, addComment } = useTickets();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [ticket, setTicket] = useState<any | null>(null);

  // Determinar si el usuario es admin
  const isAdmin = user?.role === "ADMIN";
  const [commentText, setCommentText] = useState("");
  const [adding, setAdding] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [agents, setAgents] = useState<
    Array<{ id: string; name: string; email: string }>
  >([]);
  const [saving, setSaving] = useState(false);

  // Función para formatear el ID del ticket (mostrar solo los últimos 8 caracteres)
  const formatTicketId = (ticketId: string) => {
    return ticketId.slice(-8).toUpperCase();
  };

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        console.log("Loading ticket with ID:", id);
        const t = await getTicketById(id);
        console.log("Ticket loaded:", t);
        if (!cancelled) {
          setTicket(t);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error loading ticket:", error);
        if (!cancelled) {
          setIsLoading(false);
        }
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
            <h1 className="text-3xl font-bold">
              Ticket #{id ? formatTicketId(id) : ""}
            </h1>
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
          className="px-2 py-1 text-sm"
          variant="outline"
          size="sm"
          onClick={() => navigate("/tickets")}
        >
          <ArrowLeft size={16} className="mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold px-2">
            Ticket #{id ? formatTicketId(id) : ""}
          </h1>
          <h2 className="text-muted-foreground px-2 pt-1">
            Detalles del ticket
          </h2>
        </div>
        {isAdmin && (
          <div className="ml-auto flex space-x-2">
            <Button
              variant="outline"
              className="px-2 py-1 text-sm"
              size="sm"
              onClick={() => {
                // TODO: Implementar modal de edición
                alert("Funcionalidad de edición en desarrollo");
              }}
            >
              <Edit size={16} className="mr-2" />
              Editar
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contenido principal */}
        <div className="lg:col-span-2 space-y-4 px-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center px-2 pt-2 justify-between">
                <span className="pr-4 pl-2">
                  {ticket?.title || `Ticket ${id}`}
                </span>
                <Badge variant="secondary" className="px-2 py-1 text-sm">
                  {ticket?.status || "OPEN"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pt-4">
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed px-2 pb-2">
                  {ticket?.description || "Sin descripción"}
                </p>

                <div className="flex items-center pb-2 space-x-4 text-sm text-muted-foreground">
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
              <CardTitle className="flex items-center space-x-2 px-2 pt-2">
                <MessageSquare size={20} />
                <span>Comentarios</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pt-4">
              {ticket?.comments && ticket.comments.length > 0 ? (
                <div className="space-y-4">
                  {ticket.comments.map((c: any) => (
                    <div key={c.id} className="border rounded-md p-2">
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
                  icon={<MessageSquare size={32} className="pr-2" />}
                  title="Sin comentarios"
                  description="Este ticket aún no tiene comentarios. Sé el primero en agregar información o actualizaciones."
                  action={null}
                />
              )}

              {/* Formulario para nuevo comentario */}
              <div className="mt-4 flex items-center space-x-2 px-2 pb-3">
                <Input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Escribe un comentario..."
                  className="flex-1 px-3 pb-2"
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
              <CardTitle className="px-3 pt-2">Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-3 pt-4 pb-2">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Estado
                </label>
                <div className="flex items-center space-x-2">
                  {user?.role === "USER" ? (
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          ticket?.status === "CLOSED" ? "default" : "secondary"
                        }
                      >
                        {ticket?.status === "OPEN" && "Abierto"}
                        {ticket?.status === "IN_PROGRESS" && "En progreso"}
                        {ticket?.status === "RESOLVED" && "Resuelto"}
                        {ticket?.status === "CLOSED" && "Cerrado"}
                      </Badge>
                      {ticket?.status !== "CLOSED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // TODO: Implementar modal para cerrar ticket con comentario
                            alert(
                              "Funcionalidad en desarrollo: Cerrar ticket con comentario obligatorio",
                            );
                          }}
                        >
                          Cerrar Ticket
                        </Button>
                      )}
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Prioridad
                </label>
                <div className="flex items-center space-x-2">
                  {user?.role === "USER" ? (
                    <Badge variant="secondary">
                      {ticket?.priority === "LOW" && "Baja"}
                      {ticket?.priority === "MEDIUM" && "Media"}
                      {ticket?.priority === "HIGH" && "Alta"}
                      {ticket?.priority === "URGENT" && "Urgente"}
                    </Badge>
                  ) : (
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
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Asignado a
                </label>
                <div className="flex items-center space-x-2">
                  <User size={14} />
                  {user?.role === "ADMIN" ? (
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
                  ) : (
                    <span className="text-sm px-2 py-1 bg-muted rounded-md">
                      {ticket?.assignee?.name || "Sin asignar"}
                    </span>
                  )}
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
              <CardTitle className="flex items-center space-x-2 px-3 pt-2">
                <Paperclip size={20} />
                <span>Archivos</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pt-4 pb-2">
              {/* Uploader */}
              <div className="flex items-center space-x-2 mb-3">
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setSelectedFile(file);
                  }}
                />
                {selectedFile && (
                  <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                    {selectedFile.name}
                  </span>
                )}
                <Button
                  className="px-2 py-1 text-sm"
                  variant="outline"
                  size="sm"
                  disabled={!selectedFile || uploading || !ticket}
                  onClick={async () => {
                    if (!selectedFile || !ticket) return;
                    const form = new FormData();
                    form.append("file", selectedFile);
                    try {
                      setUploading(true);
                      const resp = await api.post(
                        `/api/attachments/${ticket.id}`,
                        form,
                        {
                          headers: { "Content-Type": "multipart/form-data" },
                        },
                      );
                      const created = resp.data?.data;
                      if (created) {
                        setTicket((prev: any) => {
                          if (!prev) return prev;
                          const attachments = prev.attachments
                            ? [created, ...prev.attachments]
                            : [created];
                          return { ...prev, attachments };
                        });
                        setSelectedFile(null);
                      }
                    } finally {
                      setUploading(false);
                    }
                  }}
                >
                  {uploading ? "Subiendo..." : "Subir"}
                </Button>
              </div>

              {ticket?.attachments && ticket.attachments.length > 0 ? (
                <div className="space-y-2">
                  {ticket.attachments.map((a: any) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between border rounded p-2"
                    >
                      <a
                        href={`${API_URL}${a.storageUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm underline"
                      >
                        {a.fileName} ({Math.round((a.sizeBytes || 0) / 1024)}{" "}
                        KB)
                      </a>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          await api.delete(`/api/attachments/${a.id}`);
                          setTicket((prev: any) => {
                            if (!prev) return prev;
                            const attachments = (prev.attachments || []).filter(
                              (x: any) => x.id !== a.id,
                            );
                            return { ...prev, attachments };
                          });
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <Card className="px-2">
                  <EmptyState
                    icon={<Paperclip size={32} />}
                    title="Sin archivos"
                    description="No se han adjuntado archivos a este ticket."
                    action={null}
                  />
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;
