// Almacenamiento global de mensajes (persistente entre requests)
export interface Mensaje {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  asunto: string;
  mensaje: string;
  fecha: string;
  leido: boolean;
}

// Usar globalThis para persistir datos entre hot reloads en desarrollo
const globalForStore = globalThis as unknown as {
  mensajes: Mensaje[];
  messageId: number;
};

export const mensajesStore: Mensaje[] = globalForStore.mensajes || [];
export let messageId = globalForStore.messageId || 1;

if (!globalForStore.mensajes) {
  globalForStore.mensajes = mensajesStore;
}
if (!globalForStore.messageId) {
  globalForStore.messageId = messageId;
}

export function addMensaje(mensaje: Omit<Mensaje, 'id' | 'fecha' | 'leido'>): Mensaje {
  const nuevoMensaje: Mensaje = {
    ...mensaje,
    id: messageId++,
    fecha: new Date().toISOString(),
    leido: false,
  };
  mensajesStore.push(nuevoMensaje);
  globalForStore.messageId = messageId;
  return nuevoMensaje;
}

export function getMensajes(): Mensaje[] {
  return mensajesStore.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
}

export function marcarLeido(id: number): boolean {
  const mensaje = mensajesStore.find(m => m.id === id);
  if (mensaje) {
    mensaje.leido = true;
    return true;
  }
  return false;
}

export function eliminarMensaje(id: number): boolean {
  const index = mensajesStore.findIndex(m => m.id === id);
  if (index !== -1) {
    mensajesStore.splice(index, 1);
    return true;
  }
  return false;
}
