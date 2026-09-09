import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log(
    "🌸 Seeding AomoriTrips: Rutas Secretas del Japón Inexplorado..."
  );

  // Limpiar catálogo previo
  await prisma.bookingOrder.deleteMany();
  await prisma.travelPack.deleteMany();

  const packs = [
    {
      slug: "osorezan-shimokita-secret",
      title:
        "Osorezan & Acantilados de Shimokita: El Japón Místico Inexplorado",
      japaneseTitle: "恐山・下北半島の秘境 (Osorezan - Shimokita no Hikyō)",
      description:
        "Una expedición a una de las regiones más inaccesibles y sagradas de todo Japón, prácticamente imposible de recorrer sin guía local privado. Explora el cráter volcánico de Osorezan (Monte del Destino), navega frente a las colosales esculturas naturales de roca en Hotokegaura y convive con los caballos salvajes de Kandachime en el cabo más boreal de Honshu.",
      heroImage:
        "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1200&auto=format&fit=crop",
      priceBaseUsd: 3450,
      seasonTag: "koyo",
      seasonLabel: "🍁 Expedición Mística (Mayo - Octubre)",
      durationDays: 8,
      rating: 4.99,
      reviewsCount: 88,
      highlights: JSON.stringify([
        "Minivan privada 4x4 con guía local bilingüe por rutas sin transporte público",
        "Paseo en barco exclusivo entre las formaciones budistas de Hotokegaura",
        "Noche de retiro shukubo (templo budista) y termas de azufre en Osorezan",
        "Encuentro con los caballos salvajes Kandachime en el remoto Cabo Shiriya",
        "Cena de atún azul salvaje de Oma (considerado el mejor del planeta)",
      ]),
      itinerarySummary: JSON.stringify([
        {
          day: 1,
          title: "Llegada en Shinkansen a Hachinohe y encuentro con el Sensei",
        },
        {
          day: 2,
          title: "Ruta costera privada hacia la aislada Península de Shimokita",
        },
        {
          day: 3,
          title:
            "Acantilados sagrados de Hotokegaura: navegación entre rocas monolíticas",
        },
        {
          day: 4,
          title: "El volcán sagrado Osorezan: templo Bodaiji y lagos de azufre",
        },
        {
          day: 5,
          title: "Cabo Shiriya: estepa nórdica y caballos gigantes Kandachime",
        },
        {
          day: 6,
          title:
            "Puerto pesquero de Oma: subasta y degustación de atún supremo",
        },
        {
          day: 7,
          title:
            "Aguas termales ocultas (Hitō) en Shimofuro Onsen frente al Estrecho de Tsugaru",
        },
        {
          day: 8,
          title: "Regreso escoltado a Shin-Aomori y conexión Shinkansen",
        },
      ]),
      isFeatured: true,
    },
    {
      slug: "mount-iwaki-snow-hitou",
      title: "Hitō Secretos de Hakkoda: Termas Milenarias en la Nieve Profunda",
      japaneseTitle: "八甲田・雪の秘湯探訪 (Hakkōda - Yuki no Hitō)",
      description:
        "Acceso exclusivo a los 'Hitō' (秘湯: baños termales secretos no señalizados) en las cumbres nevadas de los montes Hakkoda, inaccesibles para el turismo masivo. Viaja en el nostálgico Tren de la Estufa de Carbón de Tsugaru asando calamares en vagones de madera históricos y sumérgete en el legendario baño mixto de cedro 'Senninburo' en Sukayu bajo 4 metros de nieve virgen.",
      heroImage:
        "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1200&auto=format&fit=crop",
      priceBaseUsd: 2980,
      seasonTag: "snow",
      seasonLabel: "❄️ Termas Secretas en Nieve (Dic - Marzo)",
      durationDays: 7,
      rating: 4.97,
      reviewsCount: 162,
      highlights: JSON.stringify([
        "Acceso escoltado a 3 Hitō (termas ocultas de montaña sin acceso rodado estándar)",
        "Viaje privado en el mítico Tsugaru Stove Train con estufa de hierro y carbón",
        "2 noches en Sukayu Onsen: el legendario baño de madera de 300 años",
        "Snowshoeing guiado entre los 'monstruos de nieve' (Juhyo) de Hakkoda",
        "Degustación de sake de nieve en bodegas de aldeas rurales no turísticas",
      ]),
      itinerarySummary: JSON.stringify([
        {
          day: 1,
          title:
            "Recepción por el Sensei y traslado en minivan adaptada para nieve ártica",
        },
        {
          day: 2,
          title:
            "Vagón histórico Tsugaru Stove Train a través de la llanura blanca",
        },
        {
          day: 3,
          title:
            "Ascenso a los Montes Hakkoda y exploración de los Monstruos de Hielo",
        },
        {
          day: 4,
          title:
            "Sukayu Onsen: ceremonia de baño tradicional en aguas sulfurosas de altura",
        },
        {
          day: 5,
          title:
            "Aldea de Dake Onsen: posada centenaria con aguas lechosas al pie de Iwaki",
        },
        {
          day: 6,
          title:
            "Taller con maestros constructores de aperos de nieve tradicionales",
        },
        {
          day: 7,
          title:
            "Traslado seguro al Shinkansen con reserva de asientos preferenciales",
        },
      ]),
      isFeatured: true,
    },
    {
      slug: "shirakami-sanchi-ancient-forest",
      title: "Shirakami-Sanchi & Oirase: Expedición al Bosque Primario UNESCO",
      japaneseTitle: "白神山地・原生林の旅 (Shirakami-Sanchi Genseirin)",
      description:
        "El último remanente de bosque primario virgen de hayas en Asia Oriental, donde los senderos no cuentan con señalización en idiomas occidentales y se exige registro de conservación forestal. Guiado por un Matagi (antigua casta de cazadores y rastreadores de montaña), descubre los míticos Doce Lagos Azules (Juniko) y camina junto a las cascadas secretas de Oirase.",
      heroImage:
        "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop",
      priceBaseUsd: 2790,
      seasonTag: "koyo",
      seasonLabel: "🍁 Bosque Primario & Cascadas (Jun - Nov)",
      durationDays: 6,
      rating: 4.93,
      reviewsCount: 112,
      highlights: JSON.stringify([
        "Permiso forestal y acompañamiento por rastreadores locales tradicionales Matagi",
        "Exploración de Juniko y el místico Aoike (estanque de agua zafiro transparente)",
        "Crucero privado en catamarán por el cráter volcánico del Lago Towada",
        "Hospedaje en posadas rurales con gastronomía de recolección de montaña (Sansai)",
        "Pase JR Bus Tohoku exclusivo con asistencia bilingüe continua",
      ]),
      itinerarySummary: JSON.stringify([
        {
          day: 1,
          title: "Llegada a Shin-Aomori y briefing de expedición con el Sensei",
        },
        {
          day: 2,
          title:
            "Ingreso al área virgen de Shirakami-Sanchi con guía de montaña",
        },
        {
          day: 3,
          title:
            "Los 12 lagos de Juniko y el enigma del lago azul eléctrico Aoike",
        },
        {
          day: 4,
          title:
            "Travesía por la garganta de Oirase: 14 cascadas entre follaje dorado",
        },
        {
          day: 5,
          title:
            "Santuario oculto Towada Jinja y navegación privada en el cráter",
        },
        {
          day: 6,
          title: "Almuerzo de despedida en taberna tradicional de pescadores",
        },
      ]),
      isFeatured: true,
    },
    {
      slug: "nebuta-cofradias-secretas",
      title: "Nebuta Matsuri: Acceso a Cofradías y Talleres de Maestros",
      japaneseTitle: "ねぶた師・秘伝の工房 (Nebuta-shi Hiden no Kōbō)",
      description:
        "No seas un simple espectador tras la valla. Este paquete te abre las puertas cerradas de los talleres de los 'Nebuta-shi' (los pocos maestros vivos que diseñan los gigantes de fuego), incluye tu confección y alquiler de vestimenta tradicional para desfilar y bailar como Haneto oficial dentro de la comitiva, y te brinda hospedaje reservado con un año de anticipación en una ciudad con ocupación hotelera al 100%.",
      heroImage:
        "https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1200&auto=format&fit=crop",
      priceBaseUsd: 3390,
      seasonTag: "nebuta",
      seasonLabel: "🏮 Acceso VIP a Cofradías (2 - 7 Agosto)",
      durationDays: 8,
      rating: 4.98,
      reviewsCount: 215,
      highlights: JSON.stringify([
        "Entrada exclusiva a los hangares de construcción antes de que salgan a la calle",
        "Traje tradicional de bailarín Haneto a medida y lección de coreografía tradicional",
        "Participación oficial desfilando junto a la carroza principal en el festival",
        "Alojamiento garantizado en Ryokan tradicional frente al mar (habitaciones bloqueadas con antelación)",
        "Degustación ceremonial de sake de la prefectura junto a los líderes del barrio",
      ]),
      itinerarySummary: JSON.stringify([
        {
          day: 1,
          title:
            "Llegada y bienvenida con entrega del traje Haneto personalizado",
        },
        {
          day: 2,
          title:
            "Acceso privado a los talleres Nebuta Rasse Duo con un maestro artesano",
        },
        {
          day: 3,
          title:
            "Noche de desfile: Bailas dentro de la procesión al ritmo de tambores taiko",
        },
        {
          day: 4,
          title: "Excursión a aldeas pesqueras de la península de Tsugaru",
        },
        {
          day: 5,
          title:
            "Desfile marítimo: Carrozas flotantes sobre la bahía y fuegos artificiales",
        },
        {
          day: 6,
          title: "Día de descanso en baños termales tradicionales de Asamushi",
        },
        {
          day: 7,
          title:
            "Gastronomía secreta de tabernas Izakaya recomendadas por locales",
        },
        {
          day: 8,
          title: "Despedida de honor y entrega de certificado de cofradía",
        },
      ]),
      isFeatured: true,
    },
    {
      slug: "hirosaki-samurai-sakura",
      title: "Hirosaki Samurái: Cerezos Ocultos y Casas de Té Clanes Tsugaru",
      japaneseTitle: "弘前・武家屋敷と桜 (Hirosaki Buke Yashiki to Sakura)",
      description:
        "Más allá del parque principal, adéntrate en el distrito de clanes samurái de Nakamachi con acceso a residencias privadas cerradas al público general. Participa en una ceremonia de té privada con descendientes de la guardia del señor feudal Tsugaru y navega por el foso rosado del castillo en barca tradicional guiada.",
      heroImage:
        "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop",
      priceBaseUsd: 2890,
      seasonTag: "sakura",
      seasonLabel: "🌸 Cerezos & Clanes Samurái (Abril - Mayo)",
      durationDays: 7,
      rating: 4.96,
      reviewsCount: 148,
      highlights: JSON.stringify([
        "Acceso especial a residencias samurái del clan Tsugaru con guía historiador",
        "Navegación tradicional privada por el foso del castillo tapizado de pétalos rosados",
        "Ceremonia de té y wagashi artesanal en jardín privado del período Edo",
        "Estancia en Ryokan centenario con tatami y cena Kaiseki de temporada",
        "JR East Tohoku Pass 5 días ilimitado para Shinkansen y trenes locales",
      ]),
      itinerarySummary: JSON.stringify([
        {
          day: 1,
          title:
            "Encuentro en Shin-Aomori y traslado al pueblo feudal de Hirosaki",
        },
        {
          day: 2,
          title:
            "Castillo de Hirosaki: floración de 2.600 cerezos centenarios y picnic privado",
        },
        {
          day: 3,
          title:
            "Distrito Samurái Nakamachi: visita a casas señoriales y maestros espaderos",
        },
        {
          day: 4,
          title:
            "Ruta de los templos Zen Chosho-ji y meditación matutina guiada",
        },
        {
          day: 5,
          title:
            "Ascenso al mirador del Monte Iwaki y termas de montaña en Sukayu",
        },
        {
          day: 6,
          title: "Mercado tradicional y cata de sidras de manzana de autor",
        },
        { day: 7, title: "Retorno en Shinkansen Gran Class a Tokio" },
      ]),
      isFeatured: true,
    },
  ];

  for (const pack of packs) {
    await prisma.travelPack.create({ data: pack });
  }

  console.log(
    `✅ Seed completado con éxito: ${packs.length} expediciones secretas cargadas.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
