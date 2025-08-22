import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@forzani/ui";

const TicketDetailPage: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ticket #{id}</h1>
        <p className="text-muted-foreground">
          Detalles del ticket
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalles del Ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Detalles del ticket en desarrollo...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketDetailPage;
