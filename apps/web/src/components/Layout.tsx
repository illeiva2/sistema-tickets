import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "@forzani/ui";
import { LogOut, Ticket, BarChart3, Plus, Home } from "lucide-react";
import { useAuth } from "../hooks";

// Componente de navegación con estado activo
const NavLink = ({
  to,
  children,
  icon,
}: {
  to: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
};

// Breadcrumbs básicos
const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
      <Link
        to="/"
        className="hover:text-foreground flex items-center space-x-1"
      >
        <Home size={14} />
        <span>Inicio</span>
      </Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;

        // Mapear nombres más amigables
        const displayName =
          {
            tickets: "Tickets",
            new: "Nuevo",
            login: "Iniciar Sesión",
          }[name] || name;

        return (
          <React.Fragment key={name}>
            <span className="text-muted-foreground">/</span>
            {isLast ? (
              <span className="text-foreground font-medium capitalize">
                {displayName}
              </span>
            ) : (
              <Link to={routeTo} className="hover:text-foreground capitalize">
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

const Layout: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-bold text-primary">Empresa Tickets</h1>
            <nav className="flex items-center space-x-1">
              <NavLink to="/" icon={<BarChart3 size={16} />}>
                Dashboard
              </NavLink>
              <NavLink to="/tickets" icon={<Ticket size={16} />}>
                Tickets
              </NavLink>
              <NavLink to="/tickets/new" icon={<Plus size={16} />}>
                Nuevo Ticket
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {user?.name || "Usuario"}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {user?.role || "USER"}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut size={16} className="mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Breadcrumbs />
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
