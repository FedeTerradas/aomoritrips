import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/passwords";
import { signAuthToken, AUTH_COOKIE_NAME } from "@/lib/auth/session";

const RegisterSchema = z.object({
  email: z.string().email("Correo electrónico inválido").toLowerCase().trim(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").trim(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Datos de registro inválidos",
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const { email, password, name } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Ya existe una cuenta con este correo electrónico",
        },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);
    const sessionToken = "usr_" + Math.random().toString(36).substring(2, 12);

    // Primer carácter o kanji representativo
    const avatarKanji = name.charAt(0).toUpperCase();

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: email.includes("admin") ? "ADMIN" : "USER",
        profile: {
          create: {
            sessionToken,
            fullName: name,
            avatarKanji,
            statusLevel: "🌱 Nuevo Viajero · Nv. 1",
            passportNumberMasked: "",
            passportExpiry: "",
            nationality: "",
            preferredCurrency: "USD",
            preferredLanguage: "ES",
          },
        },
      },
      include: {
        profile: true,
      },
    });

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
    console.error("Error en POST /api/auth/register:", error);
    return NextResponse.json(
      { success: false, error: "Error interno al procesar el registro" },
      { status: 500 }
    );
  }
}
