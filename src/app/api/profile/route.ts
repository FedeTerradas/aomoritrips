import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UpdateProfileSchema } from "@/lib/security/tokenization";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionToken =
      searchParams.get("sessionToken") || "sess_default_traveler";

    let profile = await prisma.travelerProfile.findUnique({
      where: { sessionToken },
      include: {
        paymentMethods: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!profile) {
      // Inicializar perfil seguro con método de pago pre-tokenizado
      profile = await prisma.travelerProfile.create({
        data: {
          sessionToken,
          fullName: "Hana Yamamoto",
          passportNumberMasked: "ES · A4829311",
          passportExpiry: "Jun 2030",
          nationality: "España",
          preferredCurrency: "USD",
          preferredLanguage: "ES",
          paymentMethods: {
            create: {
              vaultToken: `tok_vault_visa_4821_${Date.now()}`,
              cardBrand: "Visa",
              last4: "4821",
              billingCycle: "Mensual",
              isDefault: true,
            },
          },
        },
        include: {
          paymentMethods: true,
        },
      });
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error("Error al consultar perfil:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno al recuperar el perfil de viajero.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const parsed = UpdateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Datos de perfil inválidos o maliciosos.",
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const {
      sessionToken,
      fullName,
      passportNumber,
      passportExpiry,
      nationality,
      preferredCurrency,
      preferredLanguage,
    } = parsed.data;

    const updated = await prisma.travelerProfile.upsert({
      where: { sessionToken },
      update: {
        ...(fullName ? { fullName } : {}),
        ...(passportNumber ? { passportNumberMasked: passportNumber } : {}),
        ...(passportExpiry ? { passportExpiry } : {}),
        ...(nationality ? { nationality } : {}),
        ...(preferredCurrency ? { preferredCurrency } : {}),
        ...(preferredLanguage ? { preferredLanguage } : {}),
      },
      create: {
        sessionToken,
        fullName: fullName || "Hana Yamamoto",
        passportNumberMasked: passportNumber || "ES · A4829311",
        passportExpiry: passportExpiry || "Jun 2030",
        nationality: nationality || "España",
        preferredCurrency: preferredCurrency || "USD",
        preferredLanguage: preferredLanguage || "ES",
      },
      include: {
        paymentMethods: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar perfil de viajero." },
      { status: 500 }
    );
  }
}
