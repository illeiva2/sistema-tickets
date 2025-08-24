import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@forzani/ui";
import { Button } from "@forzani/ui";
import { Input } from "@forzani/ui";
import { useNotifications } from "../hooks/useNotifications";
import { Mail, Send, TestTube, CheckCircle, AlertCircle } from "lucide-react";

export default function NotificationsPage() {
  const { testEmailConnection, sendTestEmail, isLoading } = useNotifications();
  const [testEmail, setTestEmail] = useState({
    to: "",
    subject: "Prueba de Sistema de Tickets",
    message: "Este es un email de prueba del sistema de tickets.",
  });

  const handleTestConnection = async () => {
    await testEmailConnection();
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail.to) {
      alert("Por favor ingresa un email de destino");
      return;
    }
    await sendTestEmail(testEmail.to, testEmail.subject, testEmail.message);
  };

  return (
    <div className="container mx-auto px-3 py-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Configuración de Notificaciones
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Configura y prueba el sistema de notificaciones por email
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Configuración de Email */}
        <Card>
          <CardHeader className="px-3 pt-2 pb-3">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Configuración de Email
            </CardTitle>
            <CardDescription>
              Configura el servidor SMTP para enviar notificaciones automáticas
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Servidor SMTP
                </label>
                <Input
                  value="smtp.gmail.com"
                  disabled
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Puerto
                </label>
                <Input
                  value="587"
                  disabled
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Remitente
                </label>
                <Input
                  value="noreply@sistema-tickets.com"
                  disabled
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>
              <div className="pt-2">
                <Button
                  onClick={handleTestConnection}
                  disabled={isLoading}
                  className="w-full"
                  variant="outline"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  {isLoading ? "Probando..." : "Probar Conexión"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email de Prueba */}
        <Card>
          <CardHeader className="px-3 pt-2 pb-3">
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-green-600" />
              Enviar Email de Prueba
            </CardTitle>
            <CardDescription>
              Envía un email de prueba para verificar la configuración
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-4">
            <form onSubmit={handleSendTestEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Destino
                </label>
                <Input
                  type="email"
                  value={testEmail.to}
                  onChange={(e) =>
                    setTestEmail({ ...testEmail, to: e.target.value })
                  }
                  placeholder="tu-email@ejemplo.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Asunto
                </label>
                <Input
                  value={testEmail.subject}
                  onChange={(e) =>
                    setTestEmail({ ...testEmail, subject: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mensaje
                </label>
                <textarea
                  value={testEmail.message}
                  onChange={(e) =>
                    setTestEmail({ ...testEmail, message: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                  rows={3}
                  required
                />
              </div>
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading || !testEmail.to}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isLoading ? "Enviando..." : "Enviar Email de Prueba"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Información de Notificaciones */}
      <Card className="mt-6">
        <CardHeader className="px-3 pt-2 pb-3">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            Notificaciones Automáticas
          </CardTitle>
          <CardDescription>
            El sistema enviará automáticamente emails en los siguientes casos:
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 pb-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Ticket Asignado
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Cuando se asigna un ticket a un agente
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Estado Cambiado
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Cuando cambia el estado de un ticket
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Nuevo Comentario
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Cuando se agrega un comentario a un ticket
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notas Importantes */}
      <Card className="mt-6 border-amber-200 dark:border-amber-800">
        <CardHeader className="px-3 pt-2 pb-3">
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <AlertCircle className="h-5 w-5" />
            Notas Importantes
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-4">
          <div className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
            <p>
              • Para usar Gmail, necesitas generar una &quot;Contraseña de
              aplicación&quot; en tu cuenta de Google
            </p>
            <p>
              • Las notificaciones se envían de forma asíncrona para no afectar
              el rendimiento
            </p>
            <p>
              • Verifica que las variables de entorno EMAIL_* estén configuradas
              en el backend
            </p>
            <p>
              • Los emails se envían desde la dirección configurada en
              EMAIL_FROM
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
