import { prisma } from "../prisma";
import { validateAndSanitizeInput } from "./guardrails";
import {
  toolSearchPacks,
  toolGetSeasonalForecast,
  toolCalculatePricing,
  toolCreateItineraryDraft,
} from "./tools";
import { AgentDecisionStep, AgentExecutionResult } from "./types";

export interface RunAgentInput {
  sessionToken: string;
  userMessage: string;
  requestedSeason?: string;
  travelersCount?: number;
}

export async function executeTravelAgent(
  input: RunAgentInput
): Promise<AgentExecutionResult> {
  const decisionSteps: AgentDecisionStep[] = [];
  const toolsExecuted: string[] = [];

  // 1. Guardrail de Ciberseguridad
  const guardrail = validateAndSanitizeInput(input.userMessage);
  if (!guardrail.isSafe) {
    decisionSteps.push({
      observation: "Recepción de entrada sospechosa del usuario.",
      thought: `ALERTA DE SEGURIDAD: ${guardrail.flaggedReason}. Se rechaza la ejecución para proteger el sistema.`,
      action: "BLOCK_INPUT",
      actionOutput: { reason: guardrail.flaggedReason },
    });

    return {
      reply: `⚠️ Lo sentimos, tu consulta no pudo ser procesada por motivos de seguridad: ${guardrail.flaggedReason}. En AomoriTrips nos tomamos en serio la integridad de nuestros sistemas.`,
      sessionToken: input.sessionToken,
      decisionSteps,
      toolsExecuted: [],
    };
  }

  const cleanMessage = guardrail.sanitizedInput;

  // 2. Recuperar o Inicializar Sesión y Memoria Persistente en DB
  let session = await prisma.agentSession.findUnique({
    where: { sessionToken: input.sessionToken },
    include: {
      messages: { orderBy: { createdAt: "asc" }, take: 10 },
      preferences: true,
    },
  });

  if (!session) {
    session = await prisma.agentSession.create({
      data: {
        sessionToken: input.sessionToken,
        preferences: {
          create: {
            preferredSeason: input.requestedSeason || null,
            groupSize: input.travelersCount || 1,
          },
        },
      },
      include: {
        messages: true,
        preferences: true,
      },
    });
  }

  // Guardar mensaje de usuario en la memoria persistente
  await prisma.agentMessage.create({
    data: {
      sessionId: session.id,
      role: "user",
      content: cleanMessage,
    },
  });

  // 3. Ciclo de Decisión Agéntica (Decision Loop)
  const lower = cleanMessage.toLowerCase();

  // Paso 1: Observación
  decisionSteps.push({
    observation: `Usuario consulta: "${cleanMessage}". Historial previo: ${session.messages.length} mensajes. Preferencias previas: temporada=${session.preferences?.preferredSeason || "no definida"}.`,
    thought:
      "Analizando la intención: ¿busca recomendaciones de packs, información estacional/clima, cotización transparente o armado de itinerario?",
  });

  let suggestedPacks: unknown[] = [];
  let calculatedQuote: unknown = null;
  let itineraryDraft: unknown = null;
  let responseText = "";

  // Detección de intenciones y ejecución de herramientas (Tools)
  const asksForSeason =
    lower.includes("temporada") ||
    lower.includes("clima") ||
    lower.includes("cuando viajar") ||
    lower.includes("cuándo viajar") ||
    lower.includes("sakura") ||
    lower.includes("nebuta") ||
    lower.includes("nieve") ||
    lower.includes("otoño");

  const asksForPricing =
    lower.includes("precio") ||
    lower.includes("cuanto cuesta") ||
    lower.includes("cuánto cuesta") ||
    lower.includes("cotizar") ||
    lower.includes("personas") ||
    lower.includes("descuento") ||
    lower.includes("presupuesto");

  const asksForItinerary =
    lower.includes("itinerario") ||
    lower.includes("días") ||
    lower.includes("dias") ||
    lower.includes("programa") ||
    lower.includes("actividades");

  // Invocación Tool 1: Búsqueda de paquetes en DB
  toolsExecuted.push("search_packs");
  let detectedSeason = input.requestedSeason;
  if (lower.includes("cerezos") || lower.includes("sakura"))
    detectedSeason = "sakura";
  else if (
    lower.includes("nebuta") ||
    lower.includes("festival") ||
    lower.includes("verano")
  )
    detectedSeason = "nebuta";
  else if (
    lower.includes("otoño") ||
    lower.includes("koyo") ||
    lower.includes("hojas")
  )
    detectedSeason = "koyo";
  else if (
    lower.includes("nieve") ||
    lower.includes("invierno") ||
    lower.includes("ski") ||
    lower.includes("esqui")
  )
    detectedSeason = "snow";

  const packsFound = await toolSearchPacks({
    season: detectedSeason,
    query: cleanMessage.length > 5 ? cleanMessage : undefined,
  });
  suggestedPacks =
    packsFound.length > 0 ? packsFound : await toolSearchPacks({});

  decisionSteps.push({
    observation: `Se encontraron ${suggestedPacks.length} packs candidatos en la base de datos de AomoriTrips.`,
    thought: `Se ejecutó la herramienta search_packs con filtro de temporada='${detectedSeason || "todas"}'.`,
    action: "toolSearchPacks",
    actionInput: { season: detectedSeason },
    actionOutput: { count: suggestedPacks.length },
  });

  // Invocación Tool 2: Si pregunta por clima / época
  if (asksForSeason) {
    toolsExecuted.push("get_seasonal_forecast");
    const seasonKey = detectedSeason || "sakura";
    const forecast = toolGetSeasonalForecast(seasonKey);

    decisionSteps.push({
      observation: `Usuario mostró interés en aspectos climáticos o festivos para ${seasonKey}.`,
      thought: `Invocando get_seasonal_forecast para brindar información técnica y cultural de Tohoku.`,
      action: "toolGetSeasonalForecast",
      actionInput: { season: seasonKey },
      actionOutput: forecast,
    });
  }

  // Invocación Tool 3: Si pide cotización / personas
  const count = input.travelersCount || session.preferences?.groupSize || 2;
  if (asksForPricing) {
    toolsExecuted.push("calculate_pricing");
    const firstPack = suggestedPacks[0] as
      { priceBaseUsd: number; seasonTag: string } | undefined;
    const base = firstPack ? firstPack.priceBaseUsd : 2890;
    const sTag = firstPack ? firstPack.seasonTag : "sakura";

    calculatedQuote = toolCalculatePricing(base, count, sTag);

    decisionSteps.push({
      observation: `El usuario solicita costos para ${count} viajero(s).`,
      thought: `Calculando tarifa transparente con factores estacionales y descuentos grupales.`,
      action: "toolCalculatePricing",
      actionInput: {
        basePriceUsd: base,
        travelersCount: count,
        seasonTag: sTag,
      },
      actionOutput: calculatedQuote,
    });
  }

  // Invocación Tool 4: Si pide itinerario
  if (asksForItinerary) {
    toolsExecuted.push("create_itinerary_draft");
    const targetPack = suggestedPacks[0] as
      { title: string; durationDays: number } | undefined;
    const pTitle = targetPack
      ? targetPack.title
      : "Gran Aventura por Aomori y Tohoku";
    const pDays = targetPack ? targetPack.durationDays : 7;

    itineraryDraft = toolCreateItineraryDraft(pTitle, pDays, [
      "Onsen tradicional",
      "Castillos samurái",
      "Gastronomía Tsugaru",
    ]);

    decisionSteps.push({
      observation:
        "El usuario solicitó conocer la distribución de días del viaje.",
      thought:
        "Generando borrador de itinerario día por día con traslados en Shinkansen y hospedaje en Ryokan.",
      action: "toolCreateItineraryDraft",
      actionInput: { packTitle: pTitle, durationDays: pDays },
      actionOutput: itineraryDraft,
    });
  }

  // 4. Síntesis y Redacción de Respuesta
  if (asksForSeason) {
    const sKey = detectedSeason || "sakura";
    const f = toolGetSeasonalForecast(sKey);
    responseText = `🌸 **Recomendación Estacional para Aomori (${f.season})**:\n\n${f.highlight}\n\n- 🌡️ **Temperatura típica**: ${f.tempRange}\n- 📅 **Mejor momento**: ${f.bestMonths}\n- 🎒 **Consejo de equipaje**: ${f.packingTips.join(", ")}.\n\nPara esta época te recomendamos especialmente nuestro pack: **${(suggestedPacks[0] as { title: string })?.title || "Hirosaki Sakura Dream"}**.`;
  } else if (asksForPricing && calculatedQuote) {
    const q = calculatedQuote as {
      travelersCount: number;
      pricePerPersonUsd: number;
      subtotalUsd: number;
      taxesAndTransfersUsd: number;
      grandTotalUsd: number;
      groupDiscountApplied: string;
    };
    responseText = `💴 **Cotización Transparente AomoriTrips** (Sin cargos ocultos):\n\n- **Cantidad de viajeros**: ${q.travelersCount} persona(s)\n- **Precio por persona**: $${q.pricePerPersonUsd} USD (descuento aplicado: ${q.groupDiscountApplied})\n- **Subtotal experiencias y Ryokan**: $${q.subtotalUsd} USD\n- **Tasas e impuestos de prefectura**: $${q.taxesAndTransfersUsd} USD\n- **TOTAL FINAL GARANTIZADO**: **$${q.grandTotalUsd} USD**\n\nTodos los paquetes incluyen vuelo internacional, JR East Tohoku Pass ilimitado, Ryokan tradicional con aguas termales y guía bilingüe.`;
  } else if (asksForItinerary && itineraryDraft) {
    const it = itineraryDraft as {
      itineraryName: string;
      durationDays: number;
      days: { day: number; title: string; activity: string }[];
    };
    const dayLines = it.days
      .slice(0, 4)
      .map((d) => `• **Día ${d.day}**: ${d.title}\n  _${d.activity}_`)
      .join("\n\n");
    responseText = `🗺️ **Propuesta de Itinerario (${it.itineraryName} - ${it.durationDays} Días)**:\n\n${dayLines}\n\n*(Puedes ver el desglose completo en la vista del paquete o solicitar ajustes según tus intereses).*`;
  } else {
    // Respuesta general de asesoría y bienvenida
    const topPack = suggestedPacks[0] as
      { title: string; priceBaseUsd: number; seasonLabel: string } | undefined;
    responseText = `¡Konnichiwa! Soy tu asesor inteligente de **AomoriTrips** ⛩️.\n\nTe ayudo a descubrir el norte auténtico de Japón sin barreras idiomáticas ni complicaciones logísticas. En base a nuestra base de datos, te recomiendo explorar **${topPack?.title || "Hirosaki Sakura Dream"}** (${topPack?.seasonLabel || "Temporada especial"}), desde **$${topPack?.priceBaseUsd || 2890} USD** todo incluido.\n\n¿Te gustaría que personalicemos un itinerario, simulemos los costos para tu grupo o te brinde recomendaciones sobre la mejor época para viajar?`;
  }

  // 5. Actualizar la Memoria Persistente en DB (Preferencias y Mensaje del Asistente)
  await prisma.agentMessage.create({
    data: {
      sessionId: session.id,
      role: "assistant",
      content: responseText,
      toolCalls: JSON.stringify(toolsExecuted),
    },
  });

  if (detectedSeason || input.travelersCount) {
    await prisma.travelerPreference.upsert({
      where: { sessionId: session.id },
      update: {
        preferredSeason: detectedSeason || session.preferences?.preferredSeason,
        groupSize: input.travelersCount || session.preferences?.groupSize,
      },
      create: {
        sessionId: session.id,
        preferredSeason: detectedSeason,
        groupSize: input.travelersCount || 1,
      },
    });
  }

  return {
    reply: responseText,
    sessionToken: session.sessionToken,
    decisionSteps,
    toolsExecuted,
    suggestedPacks,
    calculatedQuote,
    itineraryDraft,
    inferredPreferences: {
      preferredSeason: detectedSeason || undefined,
      groupSize: count,
    },
  };
}
