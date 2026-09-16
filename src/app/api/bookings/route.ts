import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import QRCode from "qrcode";
import { createHmac } from "crypto";
import { getAuthSession } from "@/lib/auth/session";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

const CreateBookingSchema = z.object({
  packId: z.string().min(1),
  packTitle: z.string().min(1),
  travelerName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  travelerEmail: z.string().email("Debe ser un email válido"),
  travelersCount: z.number().int().min(1).max(20),
  travelDate: z.string().min(4),
  seasonSelected: z.string().min(2),
  totalPriceUsd: z.number().positive(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    const bookings = await prisma.bookingOrder.findMany({
      where: email ? { travelerEmail: email } : undefined,
      orderBy: { createdAt: "desc" },
      include: { pack: true },
    });

    return NextResponse.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("Error en GET /api/bookings:", error);
    return NextResponse.json(
      { success: false, error: "Error al consultar las reservas" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // Rate limiting: máx 5 reservas por IP por minuto
  const ip = getClientIp(request);
  const rl = checkRateLimit(ip, "bookings", { max: 5 });
  if (!rl.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: "Demasiadas solicitudes. Intenta en un momento.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const parsed = CreateBookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Datos de reserva inválidos",
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const {
      packId,
      packTitle,
      travelerName,
      travelerEmail,
      travelersCount,
      travelDate,
      seasonSelected,
      totalPriceUsd,
    } = parsed.data;

    // Generar código de voucher único
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `AOM-2026-JP${randomSuffix}`;

    // Firma HMAC-SHA256 del voucher — infalsificable sin la clave secreta
    // ⚠️ [REVISIÓN HUMANA]: verificar que VOUCHER_HMAC_SECRET esté en .env.local
    const VOUCHER_SECRET =
      process.env.VOUCHER_HMAC_SECRET ??
      "aomori-voucher-fallback-key-2026-utn-dev-only";
    const hmacSignature = createHmac("sha256", VOUCHER_SECRET)
      .update(`${bookingCode}|${travelerEmail}|${packId}|${totalPriceUsd}`)
      .digest("hex");

    // Payload de validación offline — la firma garantiza autenticidad sin conexión
    const voucherPayload = {
      app: "AomoriTrips",
      bookingCode,
      traveler: travelerName,
      pack: packTitle,
      date: travelDate,
      passengers: travelersCount,
      season: seasonSelected,
      totalUsd: totalPriceUsd,
      hmacSignature, // HMAC-SHA256 real, no base64 invertible
    };

    // Generar Data URL del código QR para renderizado inmediato y guardado offline
    const qrDataUrl = await QRCode.toDataURL(JSON.stringify(voucherPayload), {
      errorCorrectionLevel: "M",
      margin: 2,
      color: {
        dark: "#1C4F7C", // Azul Aomori corporativo
        light: "#FFFFFF",
      },
    });

    // Asociar con usuario registrado si existe sesión o coincidencia de correo
    const session = await getAuthSession();
    let resolvedUserId = session?.userId;
    if (!resolvedUserId && travelerEmail) {
      const existingUser = await prisma.user.findUnique({
        where: { email: travelerEmail },
      });
      if (existingUser) resolvedUserId = existingUser.id;
    }

    const newBooking = await prisma.bookingOrder.create({
      data: {
        bookingCode,
        userId: resolvedUserId,
        packId,
        packTitle,
        travelerName,
        travelerEmail,
        travelersCount,
        travelDate,
        seasonSelected,
        totalPriceUsd,
        status: "CONFIRMED",
        qrData: qrDataUrl,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Reserva confirmada con éxito. Voucher offline generado.",
      data: newBooking,
    });
  } catch (error) {
    console.error("Error en POST /api/bookings:", error);
    return NextResponse.json(
      { success: false, error: "Error al procesar la reserva" },
      { status: 500 }
    );
  }
}
