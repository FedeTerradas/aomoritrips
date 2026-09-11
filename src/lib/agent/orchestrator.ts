import { prisma } from "../prisma";
import { validateAndSanitizeInput } from "./guardrails";
import {
  toolSearchPacks,
  toolGetSeasonalForecast,
  toolCalculatePricing,
  toolCreateItineraryDraft,
  toolGenerateQuizRecommendation,
  toolGenerateGroupItinerary,
  toolAnswerCulturalQuestion,
} from "./tools";
import {
  AgentDecisionStep,
  AgentExecutionResult,
  QuizAnswers,
  GroupProfile,
} from "./types";

export interface RunAgentInput {
  sessionToken: string;
  userMessage: string;
  requestedSeason?: string;
  travelersCount?: number;
  quizAnswers?: QuizAnswers; // Para llamadas directas desde /api/quiz
  groupProfile?: GroupProfile; // Para llamadas directas desde /api/itinerary
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
      "Analizando la intención: ¿busca recomendaciones de packs, información estacional/clima, cotización transparente, quiz de perfil o armado de itinerario grupal?",
  });

  let suggestedPacks: unknown[] = [];
  let calculatedQuote: unknown = null;
  let itineraryDraft: unknown = null;
  let responseText = "";

  // — Llamada directa: Quiz de perfil —
  if (input.quizAnswers) {
    toolsExecuted.push("generate_quiz_recommendation");
    const quizResult = toolGenerateQuizRecommendation(input.quizAnswers);

    decisionSteps.push({
      observation:
        "Se recibieron las 7 respuestas del quiz de perfil cultural del usuario.",
      thought:
        "Calculando scoring de temporada y estilo de viaje basado en las respuestas para generar recomendación personalizada.",
      action: "toolGenerateQuizRecommendation",
      actionInput: { answers: input.quizAnswers },
      actionOutput: quizResult,
    });

    const replyText = quizResult.personalizedCard;

    await prisma.agentMessage.create({
      data: {
        sessionId: session.id,
        role: "assistant",
        content: replyText,
        toolCalls: JSON.stringify(toolsExecuted),
      },
    });

    return {
      reply: replyText,
      sessionToken: session.sessionToken,
      decisionSteps,
      toolsExecuted,
      quizResult,
    };
  }

  // — Llamada directa: Itinerario grupal —
  if (input.groupProfile) {
    toolsExecuted.push("generate_group_itinerary");
    const draftItinerary = toolGenerateGroupItinerary(input.groupProfile);

    decisionSteps.push({
      observation: `Se recibió perfil de grupo: ${input.groupProfile.size} personas, ${input.groupProfile.durationDays} días, temporada ${input.groupProfile.season}.`,
      thought:
        "Generando itinerario día a día con actividades, gastronomía y alojamiento adaptados al perfil del grupo.",
      action: "toolGenerateGroupItinerary",
      actionInput: { groupProfile: input.groupProfile },
      actionOutput: {
        days: draftItinerary.days.length,
        title: draftItinerary.title,
      },
    });

    const dayLines = draftItinerary.days
      .slice(0, 3)
      .map(
        (d) =>
          `• **Día ${d.dayNumber}**: ${d.activities[0]?.title || "Exploración libre"} | 🍱 ${d.meals[1]?.restaurantName || "Almuerzo local"}`
      )
      .join("\n");

    const bd = draftItinerary.budgetBreakdown;
    const replyText = `🗺️ **${draftItinerary.title}**\n\n${dayLines}\n\n💴 **Presupuesto estimado por persona**: $${bd.totalPerPersonUsd.toLocaleString()} USD | **Total grupo**: $${bd.totalGroupUsd.toLocaleString()} USD\n\n¿Querés guardar este itinerario como tu pack personalizado y reservarlo? 🌸`;

    await prisma.agentMessage.create({
      data: {
        sessionId: session.id,
        role: "assistant",
        content: replyText,
        toolCalls: JSON.stringify(toolsExecuted),
      },
    });

    return {
      reply: replyText,
      sessionToken: session.sessionToken,
      decisionSteps,
      toolsExecuted,
      draftItinerary,
    };
  }

  // Detección de cantidad de viajeros en mensaje (ej: "2 personas", "con mi pareja")
  let detectedTravelersCount: number | undefined = input.travelersCount;
  if (!detectedTravelersCount) {
    const directPaxMatch = lower.match(
      /(\d+)\s*(?:personas?|adultos?|viajeros?|pax)/
    );
    if (directPaxMatch) {
      detectedTravelersCount = parseInt(directPaxMatch[1], 10);
    } else if (
      lower.includes("pareja") ||
      lower.includes("mi novia") ||
      lower.includes("mi novio") ||
      lower.includes("mi esposa") ||
      lower.includes("mi esposo") ||
      lower.includes("de a dos")
    ) {
      detectedTravelersCount = 2;
    } else if (
      lower.includes("solo") ||
      lower.includes("sola") ||
      lower.includes("viajo solo") ||
      lower.includes("viajo sola")
    ) {
      detectedTravelersCount = 1;
    }
  }

  // Detección de destino / palabra clave
  let detectedDestinationQuery: string | undefined = undefined;
  let detectedSeason = input.requestedSeason;

  if (
    lower.includes("hirosaki") ||
    lower.includes("samurai") ||
    lower.includes("samurái") ||
    lower.includes("cerezos") ||
    lower.includes("sakura")
  ) {
    detectedDestinationQuery = lower.includes("hirosaki")
      ? "hirosaki"
      : undefined;
    if (!detectedSeason) detectedSeason = "sakura";
  } else if (
    lower.includes("nebuta") ||
    lower.includes("festival") ||
    lower.includes("cofradía") ||
    lower.includes("cofradia")
  ) {
    detectedDestinationQuery = "nebuta";
    if (!detectedSeason) detectedSeason = "nebuta";
  } else if (
    lower.includes("hakkoda") ||
    lower.includes("sukayu") ||
    lower.includes("hito") ||
    lower.includes("hitō") ||
    lower.includes("nieve")
  ) {
    detectedDestinationQuery = lower.includes("hakkoda")
      ? "hakkoda"
      : undefined;
    if (!detectedSeason) detectedSeason = "snow";
  } else if (lower.includes("osorezan") || lower.includes("shimokita")) {
    detectedDestinationQuery = "osorezan";
    if (!detectedSeason) detectedSeason = "koyo";
  } else if (
    lower.includes("shirakami") ||
    lower.includes("oirase") ||
    lower.includes("towada") ||
    lower.includes("matagi")
  ) {
    detectedDestinationQuery = "shirakami";
    if (!detectedSeason) detectedSeason = "koyo";
  }

  // Detección estacional complementaria por meses o clima
  if (!detectedSeason) {
    if (
      lower.includes("abril") ||
      lower.includes("mayo") ||
      lower.includes("primavera")
    ) {
      detectedSeason = "sakura";
    } else if (
      lower.includes("agosto") ||
      lower.includes("verano") ||
      lower.includes("julio")
    ) {
      detectedSeason = "nebuta";
    } else if (
      lower.includes("octubre") ||
      lower.includes("noviembre") ||
      lower.includes("otoño") ||
      lower.includes("koyo")
    ) {
      detectedSeason = "koyo";
    } else if (
      lower.includes("diciembre") ||
      lower.includes("enero") ||
      lower.includes("febrero") ||
      lower.includes("marzo") ||
      lower.includes("invierno") ||
      lower.includes("ski")
    ) {
      detectedSeason = "snow";
    }
  }

  // Detección de intenciones y ejecución de herramientas (Tools)
  const asksForSeason =
    lower.includes("temporada") ||
    lower.includes("clima") ||
    lower.includes("cuando viajar") ||
    lower.includes("cuándo viajar") ||
    lower.includes("sakura") ||
    lower.includes("nebuta") ||
    lower.includes("nieve") ||
    lower.includes("otoño") ||
    lower.includes("cerezos") ||
    lower.includes("mes") ||
    lower.includes("época") ||
    lower.includes("epoca") ||
    lower.includes("fechas") ||
    lower.includes("primavera") ||
    lower.includes("verano") ||
    lower.includes("invierno");

  const asksForPricing =
    lower.includes("precio") ||
    lower.includes("cuanto cuesta") ||
    lower.includes("cuánto cuesta") ||
    lower.includes("cuanto sale") ||
    lower.includes("cuánto sale") ||
    lower.includes("cotizar") ||
    lower.includes("personas") ||
    lower.includes("descuento") ||
    lower.includes("presupuesto") ||
    lower.includes("tarifa") ||
    lower.includes("costaría") ||
    lower.includes("costaria") ||
    Boolean(detectedTravelersCount && detectedTravelersCount > 1);

  const asksForItinerary =
    lower.includes("itinerario") ||
    lower.includes("días") ||
    lower.includes("dias") ||
    lower.includes("programa") ||
    lower.includes("actividades");

  const asksForCulture =
    lower.includes("onsen") ||
    lower.includes("etiqueta") ||
    lower.includes("comida") ||
    lower.includes("gastronomía") ||
    lower.includes("vocabulario") ||
    lower.includes("japonés") ||
    lower.includes("cultura") ||
    lower.includes("costumbre");

  // Invocación Tool 1: Búsqueda de paquetes en DB
  toolsExecuted.push("search_packs");

  const packsFound = await toolSearchPacks({
    season: detectedDestinationQuery ? undefined : detectedSeason,
    query: detectedDestinationQuery,
  });
  suggestedPacks =
    packsFound.length > 0
      ? packsFound
      : detectedSeason
        ? await toolSearchPacks({ season: detectedSeason })
        : await toolSearchPacks({});
  if (suggestedPacks.length === 0) {
    suggestedPacks = await toolSearchPacks({});
  }

  decisionSteps.push({
    observation: `Se encontraron ${suggestedPacks.length} packs candidatos en la base de datos de AomoriTrips (destino='${detectedDestinationQuery || "general"}', temporada='${detectedSeason || "todas"}').`,
    thought: `Se ejecutó la herramienta search_packs con filtro de destino y temporada.`,
    action: "toolSearchPacks",
    actionInput: { season: detectedSeason, query: detectedDestinationQuery },
    actionOutput: { count: suggestedPacks.length },
  });

  // Invocación Tool 2: Si pregunta por clima / época
  if (asksForSeason) {
    toolsExecuted.push("get_seasonal_forecast");
    const seasonKey =
      detectedSeason ||
      (suggestedPacks[0] as { seasonTag?: string })?.seasonTag ||
      "sakura";
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
  const count = detectedTravelersCount || session.preferences?.groupSize || 2;
  if (asksForPricing) {
    toolsExecuted.push("calculate_pricing");
    const firstPack = suggestedPacks[0] as
      { priceBaseUsd: number; seasonTag: string } | undefined;
    const base = firstPack ? firstPack.priceBaseUsd : 2890;
    const sTag = firstPack ? firstPack.seasonTag : detectedSeason || "sakura";

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

  let culturalResponse = null;
  if (asksForCulture) {
    toolsExecuted.push("answer_cultural_question");
    culturalResponse = toolAnswerCulturalQuestion(cleanMessage);

    decisionSteps.push({
      observation:
        "El usuario solicitó información cultural sobre costumbres, gastronomía o festivales.",
      thought:
        "Recurriendo a conocimientos de la cultura del norte de Japón y modales locales.",
      action: "toolAnswerCulturalQuestion",
      actionInput: { topic: cleanMessage },
      actionOutput: culturalResponse,
    });
  }

  // 4. Síntesis y Redacción de Respuesta (Multi-objetivo: Temporada + Cotización + Itinerario)
  const chosenPack = suggestedPacks[0] as
    | {
        title: string;
        priceBaseUsd: number;
        seasonLabel: string;
        seasonTag: string;
      }
    | undefined;

  const responseSections: string[] = [];

  if (asksForSeason) {
    const sKey = detectedSeason || chosenPack?.seasonTag || "sakura";
    const f = toolGetSeasonalForecast(sKey);
    responseSections.push(
      `🌸 **Recomendación Estacional para Aomori (${f.season})**:\n\n${f.highlight}\n\n- 🌡️ **Temperatura típica**: ${f.tempRange}\n- 📅 **Mejor momento**: ${f.bestMonths}\n- 🎒 **Consejo de equipaje**: ${f.packingTips.join(", ")}.\n\nPara esta época te recomendamos especialmente nuestra expedición: **${chosenPack?.title || "Hirosaki Samurái: Cerezos Ocultos y Casas de Té Clanes Tsugaru"}**.`
    );
  }

  if (asksForPricing && calculatedQuote) {
    const q = calculatedQuote as {
      travelersCount: number;
      pricePerPersonUsd: number;
      subtotalUsd: number;
      taxesAndTransfersUsd: number;
      grandTotalUsd: number;
      groupDiscountApplied: string;
    };
    responseSections.push(
      `💴 **Cotización Transparente AomoriTrips** (Sin cargos ocultos para ${q.travelersCount} persona${q.travelersCount > 1 ? "s" : ""}):\n\n- **Expedición seleccionada**: ${chosenPack?.title || "Hirosaki Samurái: Cerezos Ocultos"}\n- **Cantidad de viajeros**: ${q.travelersCount} persona(s)\n- **Precio por persona**: $${q.pricePerPersonUsd} USD (descuento aplicado: ${q.groupDiscountApplied})\n- **Subtotal experiencias y Ryokan**: $${q.subtotalUsd} USD\n- **Tasas e impuestos de prefectura**: $${q.taxesAndTransfersUsd} USD\n- **TOTAL FINAL GARANTIZADO**: **$${q.grandTotalUsd} USD**\n\nTodos los paquetes incluyen vuelo internacional, JR East Tohoku Pass ilimitado, Ryokan tradicional con aguas termales y guía bilingüe.`
    );
  }

  if (asksForItinerary && itineraryDraft) {
    const it = itineraryDraft as {
      itineraryName: string;
      durationDays: number;
      days: { day: number; title: string; activity: string }[];
    };
    const dayLines = it.days
      .slice(0, 4)
      .map((d) => `• **Día ${d.day}**: ${d.title}\n  _${d.activity}_`)
      .join("\n\n");
    responseSections.push(
      `🗺️ **Propuesta de Itinerario (${it.itineraryName} - ${it.durationDays} Días)**:\n\n${dayLines}\n\n*(Puedes ver el desglose completo en la vista del paquete o solicitar ajustes según tus intereses).*`
    );
  }

  if (asksForCulture && culturalResponse) {
    responseSections.push(
      `${culturalResponse.emoji} **Cultura de Aomori - ${culturalResponse.category}**:\n\n${culturalResponse.answer}\n\nDescubre más detalles en nuestra [Guía Cultural](/cultura).`
    );
  }

  if (responseSections.length > 0) {
    responseText = responseSections.join("\n\n---\n\n");
  } else {
    responseText = `¡Konnichiwa! Soy tu **Sensei de viajes de AomoriTrips** (青森の先生) ⛩️.\n\nTe guiaré con sabiduría local para descubrir el norte auténtico de Japón sin barreras idiomáticas ni complicaciones logísticas. En base a nuestros registros, te recomiendo explorar **${chosenPack?.title || "Hirosaki Samurái: Cerezos Ocultos y Casas de Té Clanes Tsugaru"}** (${chosenPack?.seasonLabel || "Temporada especial"}), desde **$${chosenPack?.priceBaseUsd || 2890} USD** todo incluido.\n\n¿Te gustaría que diseñemos un itinerario a tu medida, calculemos tarifas para tu grupo o te brinde recomendaciones sobre la mejor época para viajar?`;
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

  if (detectedSeason || detectedTravelersCount) {
    await prisma.travelerPreference.upsert({
      where: { sessionId: session.id },
      update: {
        preferredSeason: detectedSeason || session.preferences?.preferredSeason,
        groupSize: count,
      },
      create: {
        sessionId: session.id,
        preferredSeason: detectedSeason,
        groupSize: count,
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
