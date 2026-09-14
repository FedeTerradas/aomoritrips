import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/passwords";
import { signAuthToken, AUTH_COOKIE_NAME } from "@/lib/auth/session";

const LoginSchema = z.object({
  email: z.string().email("Correo electrónico inválido").toLowerCase().trim(),
  password: z.string().min(1, "La contraseña no puede estar vacía"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Credenciales incompletas o inválidas",
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: {
          include: {
            paymentMethods: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Correo electrónico o contraseña incorrectos",
        },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Correo electrónico o contraseña incorrectos",
        },
        { status: 401 }
      );
    }

    const token = signAuthToken(user);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      profile: user.profile,
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error en POST /api/auth/login:", error);
    return NextResponse.json(
      { success: false, error: "Error interno al iniciar sesión" },
      { status: 500 }
    );
  }
}
