import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json({
        success: true,
        user: null,
        profile: null,
        stats: {
          tripsCount: 0,
          countriesCount: 0,
          kilometersCount: "0 km",
        },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        profile: {
          include: {
            paymentMethods: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({
        success: true,
        user: null,
        profile: null,
        stats: {
          tripsCount: 0,
          countriesCount: 0,
          kilometersCount: "0 km",
        },
      });
    }

    // Vincular retroactivamente reservas con el mismo correo
    await prisma.bookingOrder.updateMany({
      where: { travelerEmail: user.email, userId: null },
      data: { userId: user.id },
    });

    const bookings = await prisma.bookingOrder.findMany({
      where: {
        OR: [{ userId: user.id }, { travelerEmail: user.email }],
        status: { not: "CANCELLED" },
      },
    });

    const tripsCount = bookings.length;
    const countriesCount = tripsCount > 0 ? 1 : 0; // Aomori, Japón
    const kmTotal = tripsCount * 1430; // Trayecto Tokio - Aomori ida y vuelta + circuito regional
    const kilometersCount =
      kmTotal >= 1000
        ? `${(kmTotal / 1000).toFixed(1).replace(/\.0$/, "")}k km`
        : `${kmTotal} km`;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      profile: user.profile,
      stats: {
        tripsCount,
        countriesCount,
        kilometersCount,
      },
    });
  } catch (error) {
    console.error("Error en GET /api/auth/me:", error);
    return NextResponse.json(
      { success: false, error: "Error al verificar la sesión actual" },
      { status: 500 }
    );
  }
}
