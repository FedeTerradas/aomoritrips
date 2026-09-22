import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth/session";
import {
  AddPaymentMethodSchema,
  tokenizePaymentCard,
} from "@/lib/security/tokenization";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = AddPaymentMethodSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Datos de tarjeta inválidos. Verifique el número ingresado.",
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const { sessionToken, cardNumber, billingCycle, expiryDate, cvv } =
      parsed.data;

    // 1. Ejecución de la Bóveda de Tokenización PCI-DSS v4.0
    // El PAN y el CVV se destruyen en memoria y solo se devuelve el vaultToken y last4 (PCI-DSS Req 3.2 y 3.3)
    const tokenized = tokenizePaymentCard(
      cardNumber,
      billingCycle,
      expiryDate,
      cvv
    );

    // 2. Localizar o asegurar perfil vinculado al usuario autenticado o sesión
    const authSession = await getAuthSession();
    let profile = null;

    if (authSession?.userId) {
      profile = await prisma.travelerProfile.findFirst({
        where: { userId: authSession.userId },
      });
      if (!profile) {
        const user = await prisma.user.findUnique({
          where: { id: authSession.userId },
        });
        profile = await prisma.travelerProfile.create({
          data: {
            sessionToken:
              sessionToken ||
              "usr_" + Math.random().toString(36).substring(2, 10),
            userId: authSession.userId,
            fullName: user?.name || "Viajero",
            avatarKanji: user?.name ? user.name.charAt(0).toUpperCase() : "旅",
            statusLevel: "🌸 Viajero Sakura · Nv. 1",
          },
        });
      }
    } else if (sessionToken) {
      profile = await prisma.travelerProfile.findUnique({
        where: { sessionToken },
      });

      if (!profile) {
        profile = await prisma.travelerProfile.create({
          data: {
            sessionToken,
            fullName: "Viajero Invitado",
            passportNumberMasked: "",
          },
        });
      }
    }

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          error: "No se pudo identificar el perfil de usuario",
        },
        { status: 400 }
      );
    }

    // 3. Desactivar defaults anteriores
    await prisma.paymentMethodToken.updateMany({
      where: { profileId: profile.id },
      data: { isDefault: false },
    });

    // 4. Persistir token de bóveda seguro (SIN PAN ni CVV)
    const newPaymentMethod = await prisma.paymentMethodToken.create({
      data: {
        profileId: profile.id,
        vaultToken: tokenized.vaultToken,
        cardBrand: tokenized.cardBrand,
        last4: tokenized.last4,
        billingCycle: tokenized.billingCycle,
        isDefault: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Tarjeta vinculada y tokenizada con éxito bajo PCI-DSS v4.0.",
      data: {
        id: newPaymentMethod.id,
        cardBrand: newPaymentMethod.cardBrand,
        last4: newPaymentMethod.last4,
        billingCycle: newPaymentMethod.billingCycle,
        vaultToken: newPaymentMethod.vaultToken,
        isDefault: newPaymentMethod.isDefault,
        ...(tokenized.expiryDate ? { expiryDate: tokenized.expiryDate } : {}),
      },
    });
  } catch (error: unknown) {
    console.error("Error en servicio de tokenización de pagos:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Falla en el servicio de tokenización segura.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const authSession = await getAuthSession();
    if (authSession?.userId) {
      const profile = await prisma.travelerProfile.findFirst({
        where: { userId: authSession.userId },
      });
      if (profile) {
        await prisma.paymentMethodToken.deleteMany({
          where: { profileId: profile.id },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Métodos de pago desvinculados correctamente.",
    });
  } catch (error) {
    console.error("Error al desvincular tarjetas:", error);
    return NextResponse.json(
      { success: false, error: "Error al desvincular tarjeta" },
      { status: 500 }
    );
  }
}
