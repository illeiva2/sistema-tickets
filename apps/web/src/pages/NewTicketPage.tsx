import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@forzani/ui";

const NewTicketPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nuevo Ticket</h1>
        <p className="text-muted-foreground">
          Crear un nuevo ticket de soporte
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Crear Ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Formulario de nuevo ticket en desarrollo...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewTicketPage;
