import React from "react";
import { Outlet, Link, useLocation, useParams } from "react-router-dom";
import { Button } from "@forzani/ui";
import { LogOut, Ticket, BarChart3, Plus, Home, Mail } from "lucide-react";
import { useAuth, useNotifications, useTickets } from "../hooks";

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
  const { id: ticketId } = useParams();
  const { getTicketById } = useTickets();
  const [ticketNumber, setTicketNumber] = React.useState<string | null>(null);

  // Si estamos en la página de detalle de un ticket, obtener el número
  React.useEffect(() => {
    if (ticketId && pathnames.length === 2 && pathnames[0] === "tickets") {
      const fetchTicketNumber = async () => {
        try {
          const ticket = await getTicketById(ticketId);
          if (ticket?.ticketNumber) {
            setTicketNumber(ticket.ticketNumber.toString().padStart(5, "0"));
          }
        } catch (error) {
          console.error("Error fetching ticket number:", error);
        }
      };
      fetchTicketNumber();
    }
  }, [ticketId, pathnames, getTicketById]);

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
        let displayName =
          {
            tickets: "Tickets",
            new: "Nuevo",
            login: "Iniciar Sesión",
          }[name] || name;

        // Si es el último elemento y estamos en la página de detalle de un ticket, mostrar el número
        if (
          isLast &&
          ticketNumber &&
          pathnames.length === 2 &&
          pathnames[0] === "tickets"
        ) {
          displayName = `${ticketNumber}`;
        }

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
  const { unreadCount } = useNotifications();

  // Solo cargar notificaciones si el usuario está autenticado
  React.useEffect(() => {
    if (user) {
      // El hook se ejecutará automáticamente
      console.log("Layout: User authenticated, notifications should load");
    }
  }, [user]);

  // Debug: log unreadCount changes
  React.useEffect(() => {
    console.log("Layout: unreadCount changed to:", unreadCount);
  }, [unreadCount]);

  const handleLogout = () => {
    logout();
  };

  // Dark mode toggle (simple)
  const [dark, setDark] = React.useState<boolean>(
    typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark"),
  );
  React.useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between bg-blue-200">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-bold text-primary tracking-tight">
              Empresa Tickets
            </h1>
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
              <NavLink to="/notifications" icon={<Mail size={16} />}>
                Notificaciones
                {unreadCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium dark:text-black text-gray-5000 text-foreground">
                {user?.name || "Usuario"}
              </p>
              <p className="text-xs dark:text-black text-black text-muted-foreground capitalize">
                {user?.role || "USER"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="px-2 py-1 text-sm"
              onClick={() => setDark(!dark)}
            >
              {dark ? "Light" : "Dark"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="px-2 py-1 text-sm"
              onClick={handleLogout}
            >
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
