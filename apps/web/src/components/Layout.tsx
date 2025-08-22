import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { Button } from "@forzani/ui";
import { LogOut, Ticket, BarChart3, Plus } from "lucide-react";

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Forzani Tickets</h1>
            <nav className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center space-x-2 text-sm hover:text-primary"
              >
                <BarChart3 size={16} />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/tickets"
                className="flex items-center space-x-2 text-sm hover:text-primary"
              >
                <Ticket size={16} />
                <span>Tickets</span>
              </Link>
              <Link
                to="/tickets/new"
                className="flex items-center space-x-2 text-sm hover:text-primary"
              >
                <Plus size={16} />
                <span>Nuevo Ticket</span>
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {user.name} ({user.role})
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut size={16} className="mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
