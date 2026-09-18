import { prisma } from "../prisma";
import {
  QuizAnswers,
  QuizResultData,
  TravelStyle,
  GroupProfile,
  DraftItinerary,
  DayPlan,
  Activity,
  MealSuggestion,
  BudgetBreakdown,
} from "./types";

export interface SearchPacksParams {
  season?: string;
  maxBudgetUsd?: number;
  query?: string;
}

export async function toolSearchPacks(params: SearchPacksParams) {
  let allPacks: Awaited<ReturnType<typeof prisma.travelPack.findMany>> = [];
  try {
    allPacks = await prisma.travelPack.findMany({
      orderBy: { rating: "desc" },
    });
  } catch (err) {
    console.warn(
      "[toolSearchPacks] No se pudo consultar la base de datos:",
      err
    );
    return [];
  }

  return allPacks
    .filter((pack) => {
      if (
        params.season &&
        params.season !== "all" &&
        pack.seasonTag.toLowerCase() !== params.season.toLowerCase()
      ) {
        return false;
      }
      if (params.maxBudgetUsd && pack.priceBaseUsd > params.maxBudgetUsd) {
        return false;
      }
      if (params.query) {
        const q = params.query.toLowerCase();
        const matchTitle = pack.title.toLowerCase().includes(q);
        const matchDesc = pack.description.toLowerCase().includes(q);
        const matchSeason = pack.seasonLabel.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchSeason) return false;
      }
      return true;
    })
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      japaneseTitle: p.japaneseTitle,
      priceBaseUsd: p.priceBaseUsd,
      seasonTag: p.seasonTag,
      seasonLabel: p.seasonLabel,
      durationDays: p.durationDays,
      rating: p.rating,
      highlights: JSON.parse(p.highlights) as string[],
    }));
}

export function toolGetSeasonalForecast(seasonTag: string) {
  const seasonData: Record<
    string,
    {
      season: string;
      tempRange: string;
      highlight: string;
      packingTips: string[];
      bestMonths: string;
    }
  > = {
    sakura: {
      season: "Primavera - Cerezos en Flor (Sakura)",
      tempRange: "8°C a 17°C",
      highlight:
        "Túnel de cerezos y foso rosado del Castillo de Hirosaki. Época ideal para paseos en bote y picnics Hanami.",
      packingTips: [
        "Chaqueta media para la tarde",
        "Calzado cómodo para caminar",
        "Cámara con lente angular",
      ],
      bestMonths: "Finales de Abril a primera semana de Mayo",
    },
    nebuta: {
      season: "Verano - Festival de Gigantes de Fuego Nebuta",
      tempRange: "22°C a 29°C (cálido y festivo)",
      highlight:
        "Desfile nocturno de carrozas monumentales de papel iluminadas por fuego y danza colectiva Haneto.",
      packingTips: [
        "Ropa liviana de algodón",
        "Yukata o traje tradicional Haneto",
        "Protector solar y abanico sensu",
      ],
      bestMonths: "2 al 7 de Agosto (fechas inamovibles)",
    },
    koyo: {
      season: "Otoño - Follaje Rojo y Dorado (Koyo)",
      tempRange: "7°C a 16°C",
      highlight:
        "Garganta de Oirase y senderismo entre 14 cascadas doradas. Navegación en catamarán por el cráter del Lago Towada.",
      packingTips: [
        "Capas de abrigo (polar / cortavientos)",
        "Calzado de trekking impermeable",
        "Termo para té caliente",
      ],
      bestMonths: "Mediados de Octubre a principios de Noviembre",
    },
    snow: {
      season: "Invierno - Nieve en Polvo y Onsen Nevado",
      tempRange: "-6°C a 2°C (nieve profunda de calidad mundial)",
      highlight:
        "Baños termales humeantes al aire libre rodeados de nieve (Sukayu Onsen) y el nostálgico Tren de la Estufa de Carbón.",
      packingTips: [
        "Parka térmica impermeable",
        "Botas con suela antideslizante para hielo",
        "Guantes térmicos y gorro de lana",
      ],
      bestMonths: "Diciembre a Marzo",
    },
  };

  const key = seasonTag.toLowerCase();
  return seasonData[key] || seasonData["sakura"];
}

export function toolCalculatePricing(
  basePriceUsd: number,
  travelersCount: number,
  seasonTag: string
) {
  let seasonFactor = 1.0;
  if (seasonTag === "nebuta") seasonFactor = 1.15; // Temporada pico máxima
  if (seasonTag === "sakura") seasonFactor = 1.1;
  if (seasonTag === "snow") seasonFactor = 1.05;

  let groupDiscount = 0;
  if (travelersCount >= 4)
    groupDiscount = 0.1; // 10% dto para grupos
  else if (travelersCount >= 2) groupDiscount = 0.05; // 5% dto parejas

  const pricePerPerson = Math.round(
    basePriceUsd * seasonFactor * (1 - groupDiscount)
  );
  const subtotal = pricePerPerson * travelersCount;
  const taxesAndTransfers = Math.round(subtotal * 0.08); // Tasas e impuestos de Japón
  const grandTotalUsd = subtotal + taxesAndTransfers;

  return {
    travelersCount,
    pricePerPersonUsd: pricePerPerson,
    seasonFactor,
    groupDiscountApplied: `${groupDiscount * 100}%`,
    subtotalUsd: subtotal,
    taxesAndTransfersUsd: taxesAndTransfers,
    grandTotalUsd,
    guaranteedNoHiddenFees: true,
  };
}

export function toolCreateItineraryDraft(
  packTitle: string,
  durationDays: number,
  specialInterests: string[] = []
) {
  const days = [];
  for (let i = 1; i <= durationDays; i++) {
    if (i === 1) {
      days.push({
        day: 1,
        title: "Arribo a Japón y Conexión Shinkansen Hayabusa a Shin-Aomori",
        activity:
          "Recepción por asistente bilingüe de AomoriTrips, entrega de JR Pass Tohoku y traslado en Shinkansen Gran Class.",
        accommodation: "Check-in en Ryokan tradicional seleccionado.",
      });
    } else if (i === durationDays) {
      days.push({
        day: i,
        title: "Ceremonia de Despedida y Retorno",
        activity:
          "Último baño onsen matutino, compras de souvenirs de manzana Tsugaru en el mercado A-Factory y Shinkansen de regreso.",
        accommodation: "Vuelo de retorno garantizado.",
      });
    } else {
      const interestNote =
        specialInterests.length > 0
          ? ` (Adaptado a tus intereses: ${specialInterests.join(", ")})`
          : "";
      days.push({
        day: i,
        title: `Exploración Profunda de Aomori - Día ${i}${interestNote}`,
        activity: `Excursión inmersiva vinculada a ${packTitle}, almuerzo tradicional Kaiseki y visita a talleres de artesanos locales.`,
        accommodation: "Noche en Ryokan con aguas termales naturales onsen.",
      });
    }
  }

  return {
    itineraryName: `Itinerario Exclusivo: ${packTitle}`,
    durationDays,
    days,
  };
}

// ─── Tool: generate_quiz_recommendation ─────────────────────────────────────

export function toolGenerateQuizRecommendation(
  answers: QuizAnswers
): QuizResultData {
  // Lógica de scoring basada en las respuestas del quiz
  const seasonScores: Record<string, number> = {
    sakura: 0,
    nebuta: 0,
    koyo: 0,
    snow: 0,
  };
  const styleScores: Record<TravelStyle, number> = {
    relaxed: 0,
    adventurous: 0,
    cultural: 0,
    gastronomic: 0,
  };

  // Q1: Anime favorito → estilo
  if (
    answers.q1.toLowerCase().includes("acción") ||
    answers.q1.toLowerCase().includes("shonen")
  )
    styleScores.adventurous += 2;
  if (
    answers.q1.toLowerCase().includes("slice") ||
    answers.q1.toLowerCase().includes("tranquil")
  )
    styleScores.relaxed += 2;
  if (
    answers.q1.toLowerCase().includes("historia") ||
    answers.q1.toLowerCase().includes("seinen")
  )
    styleScores.cultural += 2;
  if (
    answers.q1.toLowerCase().includes("food") ||
    answers.q1.toLowerCase().includes("cocina")
  )
    styleScores.gastronomic += 3;

  // Q2: Comida favorita → estilo gastronomic y temporada
  if (
    answers.q2.toLowerCase().includes("ramen") ||
    answers.q2.toLowerCase().includes("sopa")
  ) {
    styleScores.gastronomic += 2;
    seasonScores.snow += 1;
  }
  if (
    answers.q2.toLowerCase().includes("sushi") ||
    answers.q2.toLowerCase().includes("sashimi")
  ) {
    styleScores.cultural += 1;
    seasonScores.koyo += 1;
  }
  if (
    answers.q2.toLowerCase().includes("tempura") ||
    answers.q2.toLowerCase().includes("kaiseki")
  ) {
    styleScores.relaxed += 1;
    seasonScores.sakura += 1;
  }
  if (
    answers.q2.toLowerCase().includes("yakitori") ||
    answers.q2.toLowerCase().includes("festival")
  ) {
    styleScores.adventurous += 1;
    seasonScores.nebuta += 2;
  }

  // Q3: Clima preferido → temporada
  if (
    answers.q3.toLowerCase().includes("fríio") ||
    answers.q3.toLowerCase().includes("nieve") ||
    answers.q3.toLowerCase().includes("invierno")
  )
    seasonScores.snow += 3;
  if (
    answers.q3.toLowerCase().includes("primavera") ||
    answers.q3.toLowerCase().includes("templado") ||
    answers.q3.toLowerCase().includes("flor")
  )
    seasonScores.sakura += 3;
  if (
    answers.q3.toLowerCase().includes("calor") ||
    answers.q3.toLowerCase().includes("verano") ||
    answers.q3.toLowerCase().includes("festival")
  )
    seasonScores.nebuta += 3;
  if (
    answers.q3.toLowerCase().includes("otoño") ||
    answers.q3.toLowerCase().includes("fresco") ||
    answers.q3.toLowerCase().includes("colores")
  )
    seasonScores.koyo += 3;

  // Q4: Ritmo → estilo
  if (
    answers.q4.toLowerCase().includes("relajado") ||
    answers.q4.toLowerCase().includes("lento")
  )
    styleScores.relaxed += 2;
  if (
    answers.q4.toLowerCase().includes("intens") ||
    answers.q4.toLowerCase().includes("activ")
  )
    styleScores.adventurous += 2;
  if (
    answers.q4.toLowerCase().includes("museos") ||
    answers.q4.toLowerCase().includes("historia")
  )
    styleScores.cultural += 2;
  if (
    answers.q4.toLowerCase().includes("merca") ||
    answers.q4.toLowerCase().includes("local")
  )
    styleScores.gastronomic += 2;

  // Q5: Alojamiento → estilo
  if (
    answers.q5.toLowerCase().includes("ryokan") ||
    answers.q5.toLowerCase().includes("onsen")
  ) {
    styleScores.relaxed += 2;
    seasonScores.snow += 1;
  }
  if (
    answers.q5.toLowerCase().includes("hotel") ||
    answers.q5.toLowerCase().includes("lujo")
  )
    styleScores.cultural += 1;
  if (
    answers.q5.toLowerCase().includes("hostel") ||
    answers.q5.toLowerCase().includes("mochil")
  )
    styleScores.adventurous += 2;

  // Q6: Experiencia buscada → refuerza
  if (
    answers.q6.toLowerCase().includes("natur") ||
    answers.q6.toLowerCase().includes("trekk")
  ) {
    styleScores.adventurous += 2;
    seasonScores.koyo += 1;
  }
  if (
    answers.q6.toLowerCase().includes("templo") ||
    answers.q6.toLowerCase().includes("castillo")
  ) {
    styleScores.cultural += 2;
    seasonScores.sakura += 1;
  }
  if (
    answers.q6.toLowerCase().includes("festival") ||
    answers.q6.toLowerCase().includes("matsuri")
  ) {
    styleScores.adventurous += 1;
    seasonScores.nebuta += 2;
  }
  if (
    answers.q6.toLowerCase().includes("spa") ||
    answers.q6.toLowerCase().includes("relax")
  ) {
    styleScores.relaxed += 2;
    seasonScores.snow += 1;
  }

  // Q7: Temporada preferida → directa
  if (
    answers.q7.toLowerCase().includes("abril") ||
    answers.q7.toLowerCase().includes("mayo") ||
    answers.q7.toLowerCase().includes("primavera")
  )
    seasonScores.sakura += 4;
  if (
    answers.q7.toLowerCase().includes("agosto") ||
    answers.q7.toLowerCase().includes("verano")
  )
    seasonScores.nebuta += 4;
  if (
    answers.q7.toLowerCase().includes("octubre") ||
    answers.q7.toLowerCase().includes("noviembre") ||
    answers.q7.toLowerCase().includes("otoño")
  )
    seasonScores.koyo += 4;
  if (
    answers.q7.toLowerCase().includes("diciembre") ||
    answers.q7.toLowerCase().includes("invierno") ||
    answers.q7.toLowerCase().includes("enero")
  )
    seasonScores.snow += 4;

  // Determinar temporada y estilo ganadores
  const season = (Object.keys(seasonScores) as string[]).reduce((a, b) =>
    seasonScores[a] >= seasonScores[b] ? a : b
  );
  const travelStyle = (Object.keys(styleScores) as TravelStyle[]).reduce(
    (a, b) => (styleScores[a] >= styleScores[b] ? a : b)
  );

  // Mapear temporada → región principal
  const regionMap: Record<string, string> = {
    sakura: "Hirosaki",
    nebuta: "Aomori City",
    koyo: "Lago Towada",
    snow: "Hakkoda",
  };
  const region = regionMap[season] || "Hirosaki";

  // Personaje afín según temporada
  const characterRecommended: "sakura" | "haruto" =
    season === "sakura" || season === "koyo" ? "sakura" : "haruto";

  // Carta personalizada
  const styleLabel: Record<TravelStyle, string> = {
    relaxed: "viajero contemplativo",
    adventurous: "explorador aventurero",
    cultural: "amante de la historia y el arte",
    gastronomic: "gastrónomo curioso",
  };

  const seasonEmoji: Record<string, string> = {
    sakura: "🌸",
    nebuta: "🏮",
    koyo: "🍁",
    snow: "❄️",
  };

  const personalizedCard = `${seasonEmoji[season]} Tu Japón ideal es **${region}** en temporada **${season.toUpperCase()}**.

Como ${styleLabel[travelStyle]}, tu viaje perfecto a Aomori combina ${
    travelStyle === "relaxed"
      ? "noches relajantes en onsen, caminatas pausadas entre cerezos y desayunos kaiseki con vista a los jardines"
      : travelStyle === "adventurous"
        ? "trekking por los Montes Hakkoda, rafting en el río Oirase y festivales de fuego Nebuta al caer la noche"
        : travelStyle === "cultural"
          ? "visitas al Castillo de Hirosaki, museos de arte Nebuta y talleres de cerámica Tsugaru"
          : "degustación de Shio Ramen de Aomori, hotate (vieiras gigantes) frescas del puerto, manzanas Tsugaru y sake local"
  }.

Tu guía personal ${characterRecommended === "sakura" ? "Sakura 🌸" : "Haruto 🏮"} te espera para mostrarte los rincones secretos de ${region} que solo los locales conocen.`;

  return {
    region,
    season,
    travelStyle,
    personalizedCard,
    characterRecommended,
  };
}

// ─── Tool: generate_group_itinerary ──────────────────────────────────────────

export function toolGenerateGroupItinerary(
  profile: GroupProfile
): DraftItinerary {
  const {
    size,
    type,
    durationDays,
    budgetPerPersonUsd,
    season,
    dietaryRestrictions,
  } = profile;
  const hasDietaryRestriction = dietaryRestrictions.some((r) => r !== "none");

  // Actividades base por temporada
  const seasonActivities: Record<string, Activity[]> = {
    sakura: [
      {
        title: "Castillo de Hirosaki y Túnel de Cerezos",
        location: "Parque Hirosaki",
        durationHours: 4,
        estimatedCostUsd: 15,
        category: "cultural",
      },
      {
        title: "Hanami en el Foso del Castillo (Picnic bajo los cerezos)",
        location: "Hirosaki-jo",
        durationHours: 2,
        estimatedCostUsd: 10,
        category: "cultural",
      },
      {
        title: "Onsen matutino en Dake Onsen",
        location: "Dake Onsen, Hirosaki",
        durationHours: 2,
        estimatedCostUsd: 12,
        category: "onsen",
      },
      {
        title: "Taller de cerámica Tsugaru",
        location: "Hirosaki, centro",
        durationHours: 3,
        estimatedCostUsd: 25,
        category: "cultural",
      },
      {
        title: "Senderismo Monte Iwaki (1625m)",
        location: "Fuji de Tsugaru",
        durationHours: 6,
        estimatedCostUsd: 0,
        category: "nature",
      },
    ],
    nebuta: [
      {
        title: "Desfile Nebuta Matsuri (carrozas de fuego)",
        location: "Aomori City, centro",
        durationHours: 4,
        estimatedCostUsd: 20,
        category: "festival",
      },
      {
        title: "Museo Nebuta Warasse (Museo Interactivo)",
        location: "Puerto de Aomori",
        durationHours: 2,
        estimatedCostUsd: 14,
        category: "cultural",
      },
      {
        title: "Clase de danza Haneto (traje de festival incluido)",
        location: "Aomori City",
        durationHours: 3,
        estimatedCostUsd: 35,
        category: "festival",
      },
      {
        title: "Onsen Sukayu: Baño Mixto Histórico (1000 personas)",
        location: "Hakkoda",
        durationHours: 3,
        estimatedCostUsd: 20,
        category: "onsen",
      },
      {
        title: "Paseo en bote Lago Towada al atardecer",
        location: "Towada-ko",
        durationHours: 2,
        estimatedCostUsd: 18,
        category: "nature",
      },
    ],
    koyo: [
      {
        title: "Caminata por Oirase Gorge (14 cascadas)",
        location: "Garganta Oirase",
        durationHours: 5,
        estimatedCostUsd: 0,
        category: "nature",
      },
      {
        title: "Catamarán Lago Towada entre follaje rojo",
        location: "Towada-ko",
        durationHours: 2,
        estimatedCostUsd: 22,
        category: "nature",
      },
      {
        title: "Castillo de Hirosaki con follaje otoñal",
        location: "Hirosaki-jo",
        durationHours: 3,
        estimatedCostUsd: 10,
        category: "cultural",
      },
      {
        title: "Onsen Sukayu con vapor de azufre entre árboles dorados",
        location: "Hakkoda",
        durationHours: 3,
        estimatedCostUsd: 20,
        category: "onsen",
      },
      {
        title: "Mercado A-Factory: Manzanas Tsugaru y sake local",
        location: "Puerto Aomori",
        durationHours: 2,
        estimatedCostUsd: 30,
        category: "gastronomy",
      },
    ],
    snow: [
      {
        title:
          "Onsen Sukayu: Baño en la nieve profunda (−10°C afuera, 42°C adentro)",
        location: "Sukayu Onsen",
        durationHours: 3,
        estimatedCostUsd: 20,
        category: "onsen",
      },
      {
        title: "Tren de la Estufa de Carbón (Kotatsu-jū)",
        location: "Ruta Tsugaru",
        durationHours: 4,
        estimatedCostUsd: 35,
        category: "cultural",
      },
      {
        title: "Snowshoeing en Montes Hakkoda",
        location: "Hakkoda",
        durationHours: 5,
        estimatedCostUsd: 45,
        category: "nature",
      },
      {
        title: "Yukigassen (guerra de bolas de nieve) en Showa-machi",
        location: "Showa, Aomori",
        durationHours: 3,
        estimatedCostUsd: 15,
        category: "festival",
      },
      {
        title: "Castillo de Hirosaki nevado: iluminación nocturna",
        location: "Hirosaki-jo",
        durationHours: 2,
        estimatedCostUsd: 10,
        category: "cultural",
      },
    ],
  };

  // Sugerencias gastronómicas por temporada
  const seasonMeals: Record<string, MealSuggestion[]> = {
    sakura: [
      {
        mealType: "breakfast",
        restaurantName: "Desayuno Kaiseki en el Ryokan",
        cuisine: "Japonesa tradicional",
        estimatedCostUsd: 20,
        dietaryTags: ["vegetarian-option"],
      },
      {
        mealType: "lunch",
        restaurantName: "Shio Ramen Kaneko Hannosuke",
        cuisine: "Ramen de Aomori (sal)",
        estimatedCostUsd: 14,
        dietaryTags: [],
      },
      {
        mealType: "dinner",
        restaurantName: "Hotate-yaki: Vieiras a la plancha del puerto",
        cuisine: "Mariscos de temporada",
        estimatedCostUsd: 28,
        dietaryTags: ["gluten-free"],
      },
    ],
    nebuta: [
      {
        mealType: "breakfast",
        restaurantName: "Desayuno Ryokan con huevo onsen",
        cuisine: "Japonesa tradicional",
        estimatedCostUsd: 18,
        dietaryTags: ["vegetarian-option"],
      },
      {
        mealType: "lunch",
        restaurantName: "Yatai del Festival: Yakisoba y Takoyaki",
        cuisine: "Street food del festival",
        estimatedCostUsd: 12,
        dietaryTags: ["vegan-option"],
      },
      {
        mealType: "dinner",
        restaurantName: "Kura: Seafood kaiseki con nihonshu local",
        cuisine: "Alta cocina Aomori",
        estimatedCostUsd: 55,
        dietaryTags: ["gluten-free"],
      },
    ],
    koyo: [
      {
        mealType: "breakfast",
        restaurantName: "Manzana Tsugaru con yogur de ryokan",
        cuisine: "Local de temporada",
        estimatedCostUsd: 12,
        dietaryTags: ["vegetarian", "gluten-free"],
      },
      {
        mealType: "lunch",
        restaurantName: "Soba Sobakiri Miyata (trigo sarraceno local)",
        cuisine: "Soba artesanal",
        estimatedCostUsd: 16,
        dietaryTags: ["vegan"],
      },
      {
        mealType: "dinner",
        restaurantName: "Jappa-jiru: Estofado de atún del norte",
        cuisine: "Cocina de temporada Aomori",
        estimatedCostUsd: 32,
        dietaryTags: [],
      },
    ],
    snow: [
      {
        mealType: "breakfast",
        restaurantName: "Sembe-jiru: Sopa de galleta de arroz",
        cuisine: "Especialidad invernal Aomori",
        estimatedCostUsd: 10,
        dietaryTags: ["vegetarian"],
      },
      {
        mealType: "lunch",
        restaurantName: "Miso Curry Ramen en Hachinohe",
        cuisine: "Ramen de invierno",
        estimatedCostUsd: 13,
        dietaryTags: [],
      },
      {
        mealType: "dinner",
        restaurantName: "Nabe kaiseki con mariscos onsen",
        cuisine: "Alta cocina invernal",
        estimatedCostUsd: 48,
        dietaryTags: ["gluten-free"],
      },
    ],
  };

  const activities = seasonActivities[season] || seasonActivities.sakura;
  const meals = seasonMeals[season] || seasonMeals.sakura;

  // Si hay restricciones dietarias, anotar advertencia en las comidas
  const processedMeals = meals.map((m) => ({
    ...m,
    restaurantName: hasDietaryRestriction
      ? `${m.restaurantName} ✓`
      : m.restaurantName,
  }));

  // Construir días del itinerario
  const days: DayPlan[] = [];
  for (let i = 1; i <= durationDays; i++) {
    const isFirstDay = i === 1;
    const isLastDay = i === durationDays;
    const dayActivities: Activity[] =
      isFirstDay || isLastDay
        ? [activities[0]]
        : activities.slice(
            (i - 1) % activities.length,
            ((i - 1) % activities.length) + 2
          );

    days.push({
      dayNumber: i,
      activities: dayActivities,
      meals: processedMeals,
      accommodation: isLastDay
        ? "Vuelo / Shinkansen de regreso"
        : "Ryokan tradicional con aguas termales onsen",
    });
  }

  // Cálculo de presupuesto
  const flightEstimateUsd = 850;
  const accommodationUsd = 90 * durationDays;
  const jrPassUsd = durationDays <= 7 ? 280 : 420;
  const activitiesUsd = 60 * (durationDays - 1);
  const foodUsd = 40 * durationDays;
  const insuranceUsd = 45;

  const totalPerPersonUsd =
    flightEstimateUsd +
    accommodationUsd +
    jrPassUsd +
    activitiesUsd +
    foodUsd +
    insuranceUsd;

  const budgetBreakdown: BudgetBreakdown = {
    flightEstimateUsd,
    accommodationUsd,
    jrPassUsd,
    activitiesUsd,
    foodUsd,
    insuranceUsd,
    totalPerPersonUsd,
    totalGroupUsd: totalPerPersonUsd * size,
  };

  const groupLabel: Record<string, string> = {
    solo: "Viaje Solo",
    couple: "Escapada en Pareja",
    friends: `Aventura con Amigos (${size})`,
    family: `Viaje Familiar (${size})`,
  };

  return {
    title: `Itinerario Grupal: ${groupLabel[type]} · ${durationDays} días en Aomori (${season.toUpperCase()})`,
    groupProfile: profile,
    days,
    budgetBreakdown,
  };
}

// ─── Tool: answer_cultural_question ──────────────────────────────────────────

export function toolAnswerCulturalQuestion(topic: string): {
  answer: string;
  category: string;
  emoji: string;
} {
  const lower = topic.toLowerCase();

  if (
    lower.includes("onsen") ||
    lower.includes("baño") ||
    lower.includes("termal") ||
    lower.includes("etiqueta")
  ) {
    return {
      category: "Etiqueta de Onsen",
      emoji: "♨️",
      answer: `**Reglas del Onsen en Japón:**
• **Sin ropa**: Todos entran completamente desnudos al baño gemeinsam. Es la norma cultural.
• **Ducharse antes**: Siempre ducharse y enjabonarse en las duchas del vestuario ANTES de entrar al onsen.
• **Toalla pequeña**: La toalla no va al agua — se deja en el borde o en la cabeza.
• **Tatuajes**: Muchos onsen tradicionales (onsens públicos / *sento*) no permiten tatuajes. Consultar antes.
• **Cabello largo**: Atarse el cabello para que no toque el agua.
• **Silencio y calma**: El onsen es un espacio de meditación. Conversaciones en voz baja.
• **Temperatura progresiva**: Empezar por las piletas más tibias (38°C) antes de las calientes (42°C+).
En Aomori, el **Sukayu Onsen** es el más famoso: mezcla de 1000 personas en un baño de hinoki (ciprés) de estilo edo-period.`,
    };
  }

  if (
    lower.includes("ramen") ||
    lower.includes("comida") ||
    lower.includes("gastronomía") ||
    lower.includes("gastronomi") ||
    lower.includes("kaiseki") ||
    lower.includes("miso") ||
    lower.includes("soba") ||
    lower.includes("sushi") ||
    lower.includes("mariscos")
  ) {
    return {
      category: "Gastronomía de Aomori",
      emoji: "🍜",
      answer: `**Gastronomía Imperdible de Aomori:**
• **Shio Ramen (塩ラーメン)**: El ramen de sal es el estilo más puro y antiguo. En Aomori tiene caldo cristalino con mariscos del Mar de Japón.
• **Hotate (帆立)**: Vieiras gigantes del Estrecho de Tsugaru, servidas a la plancha con manteca y soja. Frescas del puerto.
• **Manzanas Tsugaru**: Aomori produce el 60% de las manzanas de Japón. La variedad *Fuji* nace aquí.
• **Sembe-jiru (せんべい汁)**: Sopa invernal con galletas de arroz que se ablandan en el caldo de pollo y verduras.
• **Jappa-jiru**: Estofado de cabeza de atún del norte con miso blanco. Plato de invierno secular.
• **Sake de Aomori (Taiheizan, Hanagaki)**: Elaborado con el agua pura de las montañas Hakkoda.
• **Kaiseki**: Menú ceremonial de temporada servido en los ryokan. 8-12 platos en miniatura.
El mercado **A-Factory** en el puerto de Aomori es el mejor lugar para probar todo lo anterior.`,
    };
  }

  if (
    lower.includes("vocabulario") ||
    lower.includes("japonés") ||
    lower.includes("japones") ||
    lower.includes("idioma") ||
    lower.includes("palabras") ||
    lower.includes("frases")
  ) {
    return {
      category: "Vocabulario Básico para Viajeros",
      emoji: "🗾",
      answer: `**Frases esenciales para tu viaje a Japón:**
• **Arigatou gozaimasu** (ありがとうございます): Muchas gracias (formal)
• **Sumimasen** (すみません): Disculpe / perdón / llamar al mozo
• **Ikura desu ka?** (いくらですか): ¿Cuánto cuesta?
• **Doko desu ka?** (どこですか): ¿Dónde está?
• **Eigo wa hanasemasu ka?** (英語は話せますか): ¿Habla inglés?
• **Oishii!** (おいしい): ¡Está delicioso!
• **Kanpai!** (乾杯): ¡Salud! (brindis)
• **Onegaishimasu** (おねがいします): Por favor
• **Chotto matte** (ちょっと待って): Espere un momento
• **Yoyaku ga arimasu** (予約があります): Tengo reserva
• **Toire wa doko desu ka?** (トイレはどこですか): ¿Dónde está el baño?
**Tip**: Las aplicaciones *Google Translate* (modo cámara) y *Waygo* son imprescindibles en zonas rurales como Aomori.`,
    };
  }

  if (
    lower.includes("nebuta") ||
    lower.includes("sakura") ||
    lower.includes("festival") ||
    lower.includes("matsuri") ||
    lower.includes("koyo") ||
    lower.includes("otoño") ||
    lower.includes("yukigassen")
  ) {
    return {
      category: "Festivales y Eventos de Aomori",
      emoji: "🏮",
      answer: `**Festivales imperdibles de Aomori:**
• **Nebuta Matsuri** 🏮 (2-7 Agosto): El festival más famoso del norte de Japón. Carrozas monumentales de papel iluminadas, danza colectiva *Haneto* con vestuario tradicional. Millones de visitantes.
• **Sakura de Hirosaki** 🌸 (Fines de Abril - 1ra semana de Mayo): El castillo de Hirosaki rodeado de 2600 cerezos. El foso rosa es único en el mundo. Reconocido como el mejor *hanami* de Japón.
• **Koyo (Follaje Otoñal)** 🍁 (Octubre-Noviembre): La Garganta de Oirase se tiñe de rojo y dorado. El Lago Towada refleja los colores como un espejo.
• **Yukigassen** ⛄ (Marzo): El campeonato mundial oficial de guerra de bolas de nieve, inventado en Showa-machi, Aomori.
• **Neputa Matsuri de Hirosaki** 🎐 (1-7 Agosto): Prima del Nebuta, con carrozas en forma de abanico (*ogi-neputa*) pintadas a mano con escenas de batallas samurái.`,
    };
  }

  // Respuesta general sobre cultura de Aomori
  return {
    category: "Cultura de Aomori",
    emoji: "⛩️",
    answer: `**Aomori: El Norte Auténtico de Japón**
La prefectura de Aomori (青森) es la más septentrional de la isla de Honshū. Es conocida por sus tradiciones que se mantienen intactas frente al ritmo moderno de Tokio.
**Datos clave:**
• **Clima**: 4 estaciones marcadas — invierno con la nieve más profunda del mundo habitado.
• **Población**: 1.2 millones. Ciudad principal: Aomori City.
• **Gastronomía**: Capital de las manzanas y los mariscos del Mar de Japón.
• **Onsen**: Más de 200 fuentes termales naturales. El Sukayu Onsen data del siglo XVII.
• **Festivales**: Sede del Nebuta Matsuri (2-7 Agosto) — Patrimonio Cultural Intangible de Japón.
• **Acceso**: Shinkansen Hayabusa desde Tokio → Shin-Aomori (2h50m). JR Pass cubre todo el recorrido.
¿Querés que profundice en algún aspecto específico de la cultura de Aomori? 🌸`,
  };
}
