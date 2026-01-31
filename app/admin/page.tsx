"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Mail,
  Users,
  MessageSquare,
  LogOut,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  RefreshCw,
} from "lucide-react";

interface Mensaje {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  asunto: string;
  mensaje: string;
  fecha: string;
  leido: boolean;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMensaje, setSelectedMensaje] = useState<Mensaje | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchMensajes = async () => {
    try {
      const response = await fetch("/api/admin/mensajes");
      
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }

      const data = await response.json();
      if (data.success) {
        setMensajes(data.mensajes);
      }
    } catch (error) {
      console.error("Error fetching mensajes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMensajes();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const handleVerMensaje = async (mensaje: Mensaje) => {
    setSelectedMensaje(mensaje);
    setIsDialogOpen(true);

    if (!mensaje.leido) {
      await fetch("/api/admin/mensajes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: mensaje.id, action: "marcar_leido" }),
      });
      fetchMensajes();
    }
  };

  const handleEliminar = async (id: number) => {
    if (confirm("Esta seguro de eliminar este mensaje?")) {
      await fetch(`/api/admin/mensajes?id=${id}`, { method: "DELETE" });
      setIsDialogOpen(false);
      fetchMensajes();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const mensajesNoLeidos = mensajes.filter((m) => !m.leido).length;
  const totalMensajes = mensajes.length;
  const emailsUnicos = new Set(mensajes.map((m) => m.email)).size;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-slate-700 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Panel de Administracion</h1>
              <p className="text-sm text-slate-400">RivGam Digital Studio</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white bg-transparent"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesion
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Mensajes</p>
                  <p className="text-3xl font-bold text-white">{totalMensajes}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Sin Leer</p>
                  <p className="text-3xl font-bold text-white">{mensajesNoLeidos}</p>
                </div>
                <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Usuarios Unicos</p>
                  <p className="text-3xl font-bold text-white">{emailsUnicos}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Messages Table */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white">Mensajes Recibidos</CardTitle>
              <CardDescription className="text-slate-400">
                Todos los mensajes del formulario de contacto
              </CardDescription>
            </div>
            <Button
              onClick={fetchMensajes}
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
          </CardHeader>
          <CardContent>
            {mensajes.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No hay mensajes todavia</p>
                <p className="text-sm text-slate-500">Los mensajes del formulario de contacto apareceran aqui</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-slate-700/50">
                      <TableHead className="text-slate-300">Estado</TableHead>
                      <TableHead className="text-slate-300">Nombre</TableHead>
                      <TableHead className="text-slate-300">Email</TableHead>
                      <TableHead className="text-slate-300">Asunto</TableHead>
                      <TableHead className="text-slate-300">Fecha</TableHead>
                      <TableHead className="text-slate-300 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mensajes.map((mensaje) => (
                      <TableRow
                        key={mensaje.id}
                        className={`border-slate-700 hover:bg-slate-700/50 cursor-pointer ${
                          !mensaje.leido ? "bg-blue-500/5" : ""
                        }`}
                        onClick={() => handleVerMensaje(mensaje)}
                      >
                        <TableCell>
                          {mensaje.leido ? (
                            <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Leido
                            </Badge>
                          ) : (
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                              <Clock className="w-3 h-3 mr-1" />
                              Nuevo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-white font-medium">{mensaje.nombre}</TableCell>
                        <TableCell className="text-slate-400">{mensaje.email}</TableCell>
                        <TableCell className="text-slate-300 max-w-[200px] truncate">
                          {mensaje.asunto}
                        </TableCell>
                        <TableCell className="text-slate-400 text-sm">
                          {formatDate(mensaje.fecha)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-slate-400 hover:text-white hover:bg-slate-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVerMensaje(mensaje);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEliminar(mensaje.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Message Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedMensaje?.asunto}</DialogTitle>
            <DialogDescription className="text-slate-400">
              Mensaje de {selectedMensaje?.nombre}
            </DialogDescription>
          </DialogHeader>
          {selectedMensaje && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-700/50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-400">Nombre</p>
                  <p className="text-white">{selectedMensaje.nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Email</p>
                  <p className="text-white">{selectedMensaje.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Telefono</p>
                  <p className="text-white">{selectedMensaje.telefono || "No proporcionado"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Fecha</p>
                  <p className="text-white">{formatDate(selectedMensaje.fecha)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-2">Mensaje</p>
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <p className="text-white whitespace-pre-wrap">{selectedMensaje.mensaje}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                >
                  Cerrar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleEliminar(selectedMensaje.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
