import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Credenciales de admin (en produccion usar variables de entorno y hash)
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      // Crear token simple (en produccion usar JWT)
      const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
      
      const cookieStore = await cookies();
      cookieStore.set('admin_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 horas
        path: '/',
      });

      return NextResponse.json({ success: true, message: 'Login exitoso' });
    }

    return NextResponse.json(
      { success: false, message: 'Usuario o contrasena incorrectos' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { success: false, message: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
