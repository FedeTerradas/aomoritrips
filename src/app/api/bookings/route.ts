import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import QRCode from "qrcode";

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

    // Payload de validación offline
    const voucherPayload = {
      app: "AomoriTrips",
      bookingCode,
      traveler: travelerName,
      pack: packTitle,
      date: travelDate,
      passengers: travelersCount,
      season: seasonSelected,
      totalUsd: totalPriceUsd,
      securityDigest: Buffer.from(`${bookingCode}-${travelerEmail}`).toString(
        "base64"
      ),
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

    const newBooking = await prisma.bookingOrder.create({
      data: {
        bookingCode,
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
