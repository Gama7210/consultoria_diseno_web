import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getMensajes, marcarLeido, eliminarMensaje } from '@/lib/store';

async function isAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  return !!session?.value;
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json(
      { success: false, message: 'No autorizado' },
      { status: 401 }
    );
  }

  const mensajes = getMensajes();
  return NextResponse.json({ success: true, mensajes });
}

export async function PATCH(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json(
      { success: false, message: 'No autorizado' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { id, action } = body;

    if (action === 'marcar_leido') {
      marcarLeido(id);
      return NextResponse.json({ success: true, message: 'Mensaje marcado como leido' });
    }

    return NextResponse.json(
      { success: false, message: 'Accion no valida' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Error en el servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json(
      { success: false, message: 'No autorizado' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));

    if (eliminarMensaje(id)) {
      return NextResponse.json({ success: true, message: 'Mensaje eliminado' });
    }

    return NextResponse.json(
      { success: false, message: 'Mensaje no encontrado' },
      { status: 404 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
