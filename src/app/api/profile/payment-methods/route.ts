import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

    const { sessionToken, cardNumber, billingCycle } = parsed.data;

    // 1. Ejecución de la Bóveda de Tokenización PCI-DSS v4.0
    // El PAN se destruye en memoria y solo se devuelve el vaultToken y last4
    const tokenized = tokenizePaymentCard(cardNumber, billingCycle);

    // 2. Localizar o asegurar perfil
    let profile = await prisma.travelerProfile.findUnique({
      where: { sessionToken },
    });

    if (!profile) {
      profile = await prisma.travelerProfile.create({
        data: {
          sessionToken,
          fullName: "Hana Yamamoto",
          passportNumberMasked: "ES · A4829311",
        },
      });
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
