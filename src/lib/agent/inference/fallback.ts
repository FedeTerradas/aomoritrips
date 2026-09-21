import { InferenceProvider, InferenceMessage, InferenceResult } from "./types";

/**
 * Adaptador de Fallback Determinístico Local
 * Garantiza cero caídas en producción o entornos aislados sin conectividad ni claves API.
 */
export class DeterministicFallbackAdapter implements InferenceProvider {
  readonly id = "fallback-rules" as const;
  readonly displayName = "Motor Determinístico Aomori (Reglas Expertas)";

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async generate(messages: InferenceMessage[]): Promise<InferenceResult> {
    const startTime = Date.now();
    const lastUserMessage =
      [...messages].reverse().find((m) => m.role === "user")?.content || "";

    const text = this.synthesizeReply(lastUserMessage);

    return {
      text,
      provider: this.id,
      model: "aomori-rules-v2",
      latencyMs: Date.now() - startTime,
    };
  }

  private synthesizeReply(userQuery: string): string {
    const q = userQuery.toLowerCase();

    // 1. Pregunta sobre el Quiz Cultural o Diagnóstico de Viaje
    if (
      q.includes("quiz") ||
      q.includes("test") ||
      q.includes("personalidad") ||
      q.includes("diagnostico") ||
      q.includes("diagnóstico") ||
      q.includes("estilo")
    ) {
      return (
        "🌸 **Diagnóstico Cultural de Viaje: 'Mi Japón'** (Test Interactivo)\n\n" +
        "¡Excelente iniciativa! Diseñamos un diagnóstico interactivo de 7 preguntas para cruzar tus preferencias de anime, gastronomía tradicional, ritmo de viaje y clima con las rutas secretas de Tohoku.\n\n" +
        "Al completarlo, descubrís tu arquetipo de viajero oficial:\n" +
        "• **🌸 Sakura (Poeta Contemplativo)**: Amantes de la contemplación floral, templos zen y jardines feudales en Hirosaki.\n" +
        "• **🏮 Haruto (Espíritu Festivo)**: Viajeros con alta energía atraídos por el festival de fuego Nebuta Matsuri y los mercados nocturnos.\n" +
        "• **🍃 Explorador Matagi**: Amantes del trekking en bosques vírgenes UNESCO (Shirakami-Sanchi) y la mística del Monte Osorezan.\n" +
        "• **❄️ Buscador Onsen**: Quienes anhelan el silencio curativo de los baños termales milenarios bajo la nieve en Sukayu Onsen.\n\n" +
        "👉 Realizá tu test ahora en la sección [🌸 Mi Japón](/quiz) para obtener tu tarjeta personalizada con personaje anime y paquete sugerido."
      );
    }

    // 2. Consulta de paquetes / catálogo completo
    if (
      q.includes("paquete") ||
      q.includes("paquetes") ||
      q.includes("pack") ||
      q.includes("packs") ||
      q.includes("catalogo") ||
      q.includes("catálogo") ||
      q.includes("opciones")
    ) {
      return (
        "🗾 **Catálogo Oficial de Expediciones Exclusivas de AomoriTrips**:\n\n" +
        "Ofrecemos 6 expediciones curadas que cubren las 4 temporadas emblemáticas de Tohoku, todas con vuelos, pases JR Shinkansen, Ryokan tradicional y guía bilingüe incluidos:\n\n" +
        "1. 🌸 **Hirosaki Samurái: Cerezos Ocultos** (Primavera · 7 días · Desde $2.890 USD)\n" +
        "   _Castillo feudal, foso de pétalos rosados Hanaikada, ceremonia del té y residencias samurái del clan Tsugaru._\n\n" +
        "2. 🏮 **Nebuta Matsuri: Acceso a Cofradías** (Verano · 6 días · Desde $3.390 USD)\n" +
        "   _Asientos VIP en el desfile nocturno de carrozas monumentales de fuego, danza colectiva Haneto con yukata y talleres de artesanos._\n\n" +
        "3. 🍁 **Shirakami-Sanchi & Oirase: Bosque Primario UNESCO** (Otoño · 8 días · Desde $2.790 USD)\n" +
        "   _Follaje rojo y dorado (Koyo) en las 14 cascadas de Oirase, navegación en el Lago Towada y caminata con cazadores tradicionales Matagi._\n\n" +
        "4. 🍁 **Osorezan & Acantilados de Shimokita: Japón Místico** (Otoño · 7 días · Desde $3.450 USD)\n" +
        "   _El monte sagrado de los espíritus Osorezan, calas volcánicas en Hotokegaura y cata del afamado atún azul de Oma._\n\n" +
        "5. 🍁 **Ruta Volcánica Hakkoda** (Otoño · 5 días · Desde $1.850 USD)\n" +
        "   _Senderismo de media montaña por turberas humeantes, teleférico panorámico y onsen de aguas minerales calientes._\n\n" +
        "6. ❄️ **Hitō Secretos de Hakkoda: Termas en Nieve Profunda** (Invierno · 7 días · Desde $2.980 USD)\n" +
        "   _Sukayu Onsen y el milenario baño Senninburo, árboles congelados 'Monstruos de Nieve' y el nostálgico Tren con Estufa de Carbón._\n\n" +
        "💡 ¿Querés saber cuál encaja mejor con tu estilo? Te invito a realizar nuestro [🌸 Test Cultural 'Mi Japón'](/quiz)."
      );
    }

    // 3. Primavera / Sakura / Hirosaki
    if (
      q.includes("sakura") ||
      q.includes("cerezo") ||
      q.includes("primavera") ||
      q.includes("hirosaki")
    ) {
      return (
        "🌸 **Recomendación Estacional: Primavera en Hirosaki (Sakura)**\n\n" +
        "La floración en el Parque del Castillo de Hirosaki es catalogada como una de las más bellas de todo Japón, reuniendo más de 2.600 cerezos y el deslumbrante foso de pétalos rosados flotantes (*Hanaikada*).\n\n" +
        "**Paquete Recomendado:**\n" +
        "• **Hirosaki Samurái: Cerezos Ocultos y Casas de Té Clanes Tsugaru** (7 días · Desde $2.890 USD)\n" +
        "  _Incluye vuelo, JR East Tohoku Pass ilimitado, estancia en Ryokan con baños termales y ceremonia privada del té matcha._\n\n" +
        "📅 **Mejor fecha**: Finales de abril a primera semana de mayo (temperaturas templadas de 8°C a 17°C).\n" +
        "🎒 **Consejo de equipaje**: Capas livianas para el día y chaqueta media para las caminatas nocturnas iluminadas.\n\n" +
        "¿Querés cotizar este viaje para tu grupo o consultar el itinerario día a día?"
      );
    }

    // 4. Verano / Nebuta
    if (
      q.includes("nebuta") ||
      q.includes("verano") ||
      q.includes("festival") ||
      q.includes("agosto")
    ) {
      return (
        "🏮 **Recomendación Estacional: Verano y Festival Nebuta Matsuri**\n\n" +
        "El Nebuta Matsuri (2 al 7 de agosto) es la fiesta estival más impactante de Tohoku. Enormes carrozas tridimensionales de papel *washi* iluminadas por fuego recorren las avenidas acompañadas por los tambores *taiko* y miles de danzantes *Haneto*.\n\n" +
        "**Paquete Recomendado:**\n" +
        "• **Nebuta Matsuri: Acceso a Cofradías y Talleres de Maestros** (6 días · Desde $3.390 USD)\n" +
        "  _Incluye acceso exclusivo a las naves de ensamblado con maestros artesanos, asientos en primera fila reservados en las gradas oficiales y alquiler de yukata para danzar._\n\n" +
        "📅 **Fechas**: 2 al 7 de agosto (fechas estrictas del festival, clima cálido de 22°C a 29°C).\n\n" +
        "Podemos cotizarlo en vivo con descuentos grupales para la cantidad exacta de viajeros que desees."
      );
    }

    // 5. Otoño / Koyo / Shirakami / Osorezan
    if (
      q.includes("otoño") ||
      q.includes("koyo") ||
      q.includes("oirase") ||
      q.includes("towada") ||
      q.includes("shirakami") ||
      q.includes("osorezan")
    ) {
      return (
        "🍁 **Recomendación Estacional: Otoño Dorado en Oirase y Bosques UNESCO (Koyo)**\n\n" +
        "Entre octubre y noviembre, las hayas japonesas tiñen los cañones de tonos escarlata y ámbar. El trekking por la Garganta de Oirase junto a 14 cascadas y la navegación por el Lago Towada son experiencias sobrecogedoras.\n\n" +
        "**Expediciones Disponibles en Otoño:**\n" +
        "1. **Shirakami-Sanchi & Oirase: Expedición al Bosque Primario UNESCO** (8 días · Desde $2.790 USD)\n" +
        "2. **Osorezan & Acantilados de Shimokita: El Japón Místico** (7 días · Desde $3.450 USD)\n" +
        "3. **Ruta Volcánica Hakkoda** (5 días · Desde $1.850 USD)\n\n" +
        "Todas incluyen gastronomía local kaiseki de temporada con hongos silvestres, manzanas de Tsugaru y baños en aguas termales de montaña."
      );
    }

    // 6. Invierno / Nieve / Sukayu
    if (
      q.includes("nieve") ||
      q.includes("invierno") ||
      q.includes("hakkoda") ||
      q.includes("sukayu") ||
      q.includes("snow")
    ) {
      return (
        "❄️ **Recomendación Estacional: Invierno Profundo en Hakkoda y Sukayu Onsen**\n\n" +
        "Aomori ostenta las nevadas más generosas del planeta con nieve en polvo de calidad inigualable (*Japow*). En las cumbres de Hakkoda se forman los célebres 'Monstruos de Nieve' (*Juhyo*).\n\n" +
        "**Paquete Recomendado:**\n" +
        "• **Hitō Secretos de Hakkoda: Termas Milenarias en la Nieve Profunda** (7 días · Desde $2.980 USD)\n" +
        "  _Incluye estancia en Sukayu Onsen con su legendario baño de madera milenaria Senninburo, paseos en el Tren con Estufa de Carbón de Tsugaru y calamares asados al fuego._\n\n" +
        "🌡️ **Clima**: -6°C a 2°C con nevadas frecuentes. Indumentaria térmica e impermeable recomendada."
      );
    }

    // 7. Itinerario
    if (
      q.includes("itinerario") ||
      q.includes("días") ||
      q.includes("dias") ||
      q.includes("programa")
    ) {
      return (
        "🗺️ **Propuesta de Itinerario Esencial por Tohoku (7 Días / 6 Noches)**:\n\n" +
        "• **Día 1**: Llegada a Shin-Aomori a bordo del Hayabusa Shinkansen (tren bala a 320 km/h) y bienvenida en Ryokan con aguas termales onsen.\n" +
        "• **Día 2**: Castillo feudal de Hirosaki, residencias samurái intactas del clan Tsugaru y degustación de sidra artesanal de manzana.\n" +
        "• **Día 3**: Travesía por el Lago Towada y caminata fotográfica en la Garganta de Oirase entre cascadas cristalinas.\n" +
        "• **Día 4**: Ascenso en teleférico a los Montes Hakkoda y baño onsen tradicional en Sukayu.\n" +
        "• **Día 5**: Museo Warasse y taller de confección de faroles monumentales de papel Nebuta.\n" +
        "• **Día 6**: Mercado pesquero Furukawa para diseñar tu propio tazón *Nokkedon* de sashimi fresco.\n" +
        "• **Día 7**: Mañana de compras de artesanía tradicional Tsugaru Vidro y regreso en Shinkansen hacia Tokio.\n\n" +
        "¿Querés adaptar los días o calcular la cotización exacta para la cantidad de personas de tu viaje?"
      );
    }

    // 8. Costos cotidianos / Máquinas expendedoras / Bebidas en Japón
    if (
      q.includes("coca") ||
      q.includes("coca-cola") ||
      q.includes("gaseosa") ||
      q.includes("refresco") ||
      q.includes("bebida") ||
      q.includes("maquina expendedora") ||
      q.includes("máquina expendedora") ||
      q.includes("vending")
    ) {
      return (
        "🥫 **Costos Cotidianos en Japón (Máquinas Expendedoras & Konbini)**:\n\n" +
        "En Japón, una Coca-Cola, té verde frío o café en lata en las ubicuas máquinas expendedoras (*Jidōhanbaiki* 自動販売機) que verás en cada rincón de Aomori cuesta habitualmente entre **160 y 180 yenes** (aproximadamente **$1.10 – $1.20 USD**).\n\n" +
        "En las tiendas de conveniencia (*Konbini* como Lawson, 7-Eleven o FamilyMart) podés encontrar botellas de 500ml por unos **140 a 160 yenes**.\n\n" +
        "💡 *Como **Aomori Sensei**, mi misión principal es guiarte en expediciones por el norte de Japón: aguas termales milenarias, castillos feudales y el festival Nebuta. Si querés conocer nuestros paquetes o hacer el [Test Cultural 'Mi Japón'](/quiz), ¡aquí estoy para ayudarte!*"
      );
    }

    // 9. Consultas de fútbol o deportes ajenos a Japón (ej. clubes de Córdoba o Argentina)
    if (
      q.includes("club") ||
      q.includes("futbol") ||
      q.includes("fútbol") ||
      q.includes("cordoba") ||
      q.includes("córdoba") ||
      q.includes("argentina") ||
      q.includes("boca") ||
      q.includes("river") ||
      q.includes("talleres") ||
      q.includes("belgrano") ||
      q.includes("instituto")
    ) {
      return (
        "⚽ **Fuera de Dominio: El Sensei en Tohoku** ⛩️\n\n" +
        "¡Konnichiwa! Como **Aomori Sensei**, debo confesarte que en las montañas del norte de Japón somos mucho más apasionados por los torneos de **Sumo** en el Ryōgoku Kokugikan y los tambores gigantes Taiko del festival Nebuta que por la Liga Argentina.\n\n" +
        "En Córdoba sé que la pasión se divide entre **Talleres**, **Belgrano** e **Instituto**, ¡pero para un sabio de Aomori el verdadero clásico es entre los guerreros de Hirosaki y los navegantes del Estrecho de Tsugaru!\n\n" +
        "Si alguna vez querés cambiar la cancha por aguas termales en la nieve o bosques samurái, acá estoy para armar tu expedición. ¿Te gustaría conocer nuestras opciones de viaje o hacer el [Test Cultural 'Mi Japón'](/quiz)?"
      );
    }

    // 10. Preguntas abiertas de recomendación ("¿qué me recomendás?", "no sé qué elegir", etc.)
    if (
      q.includes("recomiend") ||
      q.includes("qué elegir") ||
      q.includes("que elegir") ||
      q.includes("no sé") ||
      q.includes("no se") ||
      q.includes("ayuda") ||
      q.includes("empezar") ||
      q.includes("por dónde") ||
      q.includes("por donde") ||
      q.includes("opciones") ||
      q.includes("qué hay") ||
      q.includes("que hay") ||
      q.includes("cuál es") ||
      q.includes("cual es")
    ) {
      return (
        "¡Con mucho gusto te oriento! 🌸 En AomoriTrips tenemos **6 expediciones exclusivas** que cubren las 4 estaciones del norte de Japón:\n\n" +
        "1. 🌸 **Hirosaki Samurái: Cerezos Ocultos** (Primavera · 7 días · Desde $2.890 USD)\n" +
        "   _Castillo feudal, foso de pétalos Hanaikada y ceremonia del té con el clan Tsugaru._\n\n" +
        "2. 🏮 **Nebuta Matsuri: Acceso a Cofradías** (Verano · 6 días · Desde $3.390 USD)\n" +
        "   _Desfile de carrozas monumentales de fuego, danza Haneto y talleres de artesanos._\n\n" +
        "3. 🍁 **Shirakami-Sanchi & Oirase: Bosque UNESCO** (Otoño · 8 días · Desde $2.790 USD)\n" +
        "   _14 cascadas de follaje dorado, navegación en el Lago Towada y caza con Matagi._\n\n" +
        "4. 🍁 **Osorezan & Acantilados de Shimokita** (Otoño · 7 días · Desde $3.450 USD)\n" +
        "   _Monte sagrado de los espíritus, catas volcánicas y atún azul de Oma._\n\n" +
        "5. 🍁 **Ruta Volcánica Hakkoda** (Otoño · 5 días · Desde $1.850 USD)\n" +
        "   _Senderismo por turberas humeantes y onsen de alta montaña._\n\n" +
        "6. ❄️ **Hitō Secretos de Hakkoda: Termas en Nieve Profunda** (Invierno · 7 días · Desde $2.980 USD)\n" +
        "   _Baño Senninburo milenario, 'Monstruos de Nieve' y Tren con Estufa de Carbón._\n\n" +
        "💡 Si no sabés cuál es el tuyo, hacé nuestro [🌸 Test Cultural 'Mi Japón'](/quiz): 7 preguntas y te decimos tu expedición ideal con personaje anime incluido.\n\n" +
        "También podés contarme tu temporada preferida o cuántas personas viajan para cotizar en el momento."
      );
    }

    // 11. Mensaje de bienvenida y guardián de dominio general
    return (
      "¡Konnichiwa! Soy tu **Sensei de viajes de AomoriTrips** (青森の先生) ⛩️.\n\n" +
      "Estoy aquí para guiarte por los secretos más profundos y auténticos del norte de Japón (Tohoku).\n\n" +
      "Disponemos de 6 expediciones exclusivas a lo largo de las cuatro estaciones:\n" +
      "• 🌸 **Primavera**: Cerezos en flor y samuráis en Hirosaki (desde $2.890 USD)\n" +
      "• 🏮 **Verano**: Festival colosal de fuego Nebuta Matsuri (desde $3.390 USD)\n" +
      "• 🍁 **Otoño**: Garganta de Oirase, Lago Towada y Monte Osorezan (desde $1.850 USD)\n" +
      "• ❄️ **Invierno**: Termas milenarias bajo la nieve en Sukayu Onsen (desde $2.980 USD)\n\n" +
      "Podés realizar nuestro [🌸 Test Cultural 'Mi Japón'](/quiz) para descubrir tu itinerario ideal en 7 preguntas, o pedirme una cotización personalizada con un solo mensaje."
    );
  }
}
