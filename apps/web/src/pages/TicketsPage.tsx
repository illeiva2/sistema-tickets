import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@forzani/ui";

const TicketsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tickets</h1>
        <p className="text-muted-foreground">
          Gestión y seguimiento de tickets del sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Lista de tickets en desarrollo...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketsPage;
