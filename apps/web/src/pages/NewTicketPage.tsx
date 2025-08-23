import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@forzani/ui";
import { Button, Input } from "@forzani/ui";
import { Ticket, Send, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTickets } from "../hooks";

const NewTicketPage: React.FC = () => {
  const navigate = useNavigate();
  const { createTicket } = useTickets();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createTicket(formData);
      navigate("/tickets");
    } catch (error) {
      // El error ya se maneja en el hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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
          <h1 className="text-3xl font-bold">Nuevo Ticket</h1>
          <p className="text-muted-foreground">
            Crear un nuevo ticket de soporte
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Ticket size={20} />
            <span>Crear Ticket</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título *</label>
              <Input
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Resumen del problema o solicitud"
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción *</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe detalladamente el problema o solicitud..."
                required
                rows={5}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Prioridad</label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange("priority", e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="LOW">Baja</option>
                <option value="MEDIUM">Media</option>
                <option value="HIGH">Alta</option>
                <option value="URGENT">Urgente</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/tickets")}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting || !formData.title || !formData.description
                }
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
                    Crear Ticket
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewTicketPage;
