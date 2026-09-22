# ⛩️ AomoriTrips (青森トリップス)

> **Plataforma de Expediciones a Rutas Secretas de Japón con Asistente Agéntico Autónomo y Validación Offline**  
> Proyecto Final de Ciclo · **Curso de Inteligencia Artificial para Programadores**  
> **Universidad Tecnológica Nacional (UTN.BA)** · Centro de e-Learning  
> **Autor**: Federico Terradas

[![Next.js](https://img.shields.io/badge/Next.js-16.3.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19.3-2D3748?logo=prisma)](https://www.prisma.io/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL_Mode-003B57?logo=sqlite)](https://www.sqlite.org/)
[![Tests](https://img.shields.io/badge/Tests-50%20Passed-brightgreen)](tests/)
[![Security](https://img.shields.io/badge/OWASP%20LLM01-Protected-orange)](src/lib/agent/guardrails.ts)
[![PCI--DSS](https://img.shields.io/badge/PCI--DSS%20v4.0-Tokenized-green)](src/lib/security/tokenization.ts)

---

## 📌 Enlaces del Proyecto

| Recurso                    | Enlace                                                                                   | Descripción                                           |
| :------------------------- | :--------------------------------------------------------------------------------------- | :---------------------------------------------------- |
| **Repositorio GitHub**     | [github.com/FedeTerradas/aomoritrips](https://github.com/FedeTerradas/aomoritrips)       | Código fuente, historial de commits y suite de tests  |
| **Aplicación Web en Vivo** | [aomoritrips.vercel.app](https://aomoritrips.vercel.app)                                 | Despliegue en producción en Vercel con SSR            |
| **Video de Demostración**  | [youtu.be/B51qa_Ni-n0](https://youtu.be/B51qa_Ni-n0)                                     | Video demostrativo del ciclo completo (3:45 min)      |
| **Informe Académico**      | [`docs/informe_entrega_final_aomoritrips.md`](docs/informe_entrega_final_aomoritrips.md) | Informe técnico según la rúbrica oficial de la UTN.BA |

---

## 🎯 Propuesta de Valor y Problema que Resuelve

Planificar un viaje al Japón rural y profundo (prefectura de Aomori y región de Tohoku) presenta barreras severas para el viajero occidental y latinoamericano:

1. **Barrera Idiomática Extrema**: En los ryokans rurales, templos y baños termales (_Hitō_), el personal habla exclusivamente japonés y se rige por códigos de etiqueta milenarios.
2. **Dispersión Geográfica y Transporte Escaso**: Las zonas naturales más auténticas (Monte Hakkoda, Osorezan, Shirakami-Sanchi) no cuentan con transporte público masivo regular.
3. **Falta de Conectividad en Montaña**: En pasos nevados y bosques primarios, la cobertura 4G/5G es inestable o nula, inutilizando vouchers que dependan de la nube.
4. **Falta de Transparencia de Precios**: Sobrecargos imprevistos en destino, reservas de trenes Shinkansen fragmentadas y comisiones ocultas.

**La Solución de AomoriTrips**:

- **Paquetes Curados y Cerrados**: Vuelos internacionales, tren bala Shinkansen ilimitado (JR East Pass), estadías en Ryokan tradicional con Onsen y guía bilingüe, con precio total garantizado sin cargos ocultos.
- **Aomori Sensei (青森の先生)**: Asistente agéntico bilingüe con ciclo de decisión (`Observe → Reason → Tool Call → Verify → Synthesize`) y memoria conversacional persistente en base de datos.
- **Billetera de Vouchers QR Offline**: Generación de billetes digitales con código único (`AOM-2026-XXXX`) y QR criptográfico de alta fidelidad que funciona al 100% sin conexión a internet.
- **Quiz Cultural "¿Cuál es tu Japón?"**: Diagnóstico interactivo de 7 preguntas para identificar la temporada y región ideal, generando una tarjeta personalizada compartible.
- **Armador de Itinerarios Grupales**: Generador de itinerarios día a día adaptado al perfil del grupo (pareja, amigos, familia) con calculadora de presupuesto DIY.

---

## 🏛️ Arquitectura del Sistema

```
                      ┌──────────────────────────────────────────┐
                      │            Cliente Web (Browser)         │
                      │  Next.js 16 + React 19 + Vanilla Tokens  │
                      └────────────────────┬─────────────────────┘
                                           │ HTTPS / JSON
                                           ▼
                      ┌──────────────────────────────────────────┐
                      │          Next.js Route Handlers          │
                      │   /api/packs  /api/bookings  /api/chat   │
                      └────────────────────┬─────────────────────┘
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    ▼                                             ▼
┌──────────────────────────────────────┐     ┌──────────────────────────────────────┐
│       Perímetro de Seguridad         │     │         Motor Agéntico Propio        │
│ • Guardrails regex (OWASP LLM01)     │     │ • Loop de Decisión FSM               │
│ • Validación estricta con Zod        │────▶│ • Function Calling Determinístico    │
│ • Tokenización PCI-DSS v4.0 (Luhn)   │     │ • Multi-objective Response Synthesis │
└──────────────────────────────────────┘     └──────────────────┬───────────────────┘
                                                                │
                                      ┌─────────────────────────┴─────────────────────────┐
                                      ▼                                                   ▼
                    ┌───────────────────────────────────┐               ┌───────────────────────────────────┐
                    │    Inferencia Híbrida de IA       │               │    Persistencia y Memoria (DB)    │
                    │ • Cloud: Gemini / Groq / OpenAI   │               │ • Prisma ORM                      │
                    │ • Local SLM: Ollama (Llama 3.2 1B)│               │ • SQLite WAL Mode (dev.db)        │
                    │   (42.8 tok/s, 100% offline)      │               │ • AgentSession & Preferences      │
                    └───────────────────────────────────┘               └───────────────────────────────────┘
```

---

## 💻 Stack Tecnológico

| Componente          | Tecnología / Herramienta                       | Por qué se eligió                                                                                                                                    |
| :------------------ | :--------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**        | **Next.js 16 (React 19 / Turbopack)**          | Server-Side Rendering (SSR) ultra-rápido, Server Components y tokens CSS de identidad Washi (`#1C4F7C` y `#F97316`) sin bundle bloat.                |
| **Backend & API**   | **Next.js App Router (Node.js en TypeScript)** | Monolito modular con tipado de extremo a extremo, compartiendo interfaces Zod entre cliente y servidor sin microservicios redundantes.               |
| **Base de Datos**   | **Prisma ORM + SQLite (Modo WAL)**             | Integridad referencial ACID estricta en archivo autocontenido (`prisma/dev.db`), cero latencia y portabilidad a PostgreSQL sin cambios de código.    |
| **Orquestación IA** | **Código Propio en TypeScript (FSM)**          | Control determinístico del loop agéntico sin abstracciones pesadas de frameworks externos (anti-bloat), con Circuit Breaker y verificación estricta. |
| **Modelo de IA**    | **Híbrido: Cloud LLM + Local SLM (Ollama)**    | Inferencia en la nube para producción rápida y modelo local `llama3.2:1b` para contingencia offline y privacidad en destino.                         |
| **Ciberseguridad**  | **Zod + Guardrails Regex + Web Crypto**        | Protección contra Prompt Injections (OWASP LLM01), tokenización PCI-DSS v4.0, algoritmo de Luhn y firmas HMAC-SHA256 para QR offline.                |
| **Despliegue**      | **Vercel**                                     | Despliegue continuo serverless con CI/CD automático, SSL y distribución en Edge Network.                                                             |

---

## 🛡️ Matriz de Ciberseguridad y Privacidad

El proyecto implementa medidas concretas auditadas por una suite de pruebas automatizadas:

1. **Inyección de Prompt (OWASP LLM01)**: Interceptación perimetral en [`src/lib/agent/guardrails.ts`](src/lib/agent/guardrails.ts) que bloquea intentos de jailbreak (`ignore instructions`, `system prompt dump`, `DAN mode`).
2. **Exposición de Credenciales**: Variables de entorno estrictamente aisladas en `.env.local` e ignoradas por Git en [`.gitignore`](.gitignore).
3. **Privacidad de Pasajeros (PII Mínima)**: Principio de minimización de datos: únicamente se almacena nombre y correo para el voucher; pasaportes enmascarados (`•••••••123A`).
4. **Tokenización de Tarjetas (PCI-DSS v4.0)**: Algoritmo de Luhn (Módulo 10), detección automática de emisor (BIN) y almacenamiento exclusivo de tokens opacos (`tok_visa_...`) sin guardar números de tarjeta en texto plano.
5. **Autenticidad de Vouchers Offline**: Código único con prefijo institucional `AOM-2026-XXXX` y datos firmados para validación óptica sin internet.

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos

- **Node.js**: v20.x o superior
- **npm**: v10.x o superior
- _(Opcional para IA local)_: **Ollama** con modelo `llama3.2:1b`

### 1. Clonar el repositorio

```bash
git clone https://github.com/FedeTerradas/aomoritrips.git
cd aomoritrips
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto (copiando el de ejemplo si existe):

```env
DATABASE_URL="file:./dev.db"
NODE_ENV="development"
# Opcional para inferencia cloud:
# GROQ_API_KEY="gsk_..."
# OPENAI_API_KEY="sk-..."
```

### 4. Inicializar y poblar la base de datos

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará accesible en **`http://localhost:3000`**.

### 6. Ejecutar pruebas unitarias y chequeo de tipos

```bash
# Ejecutar la suite completa de 16 tests automatizados:
npm run test

# Verificar tipos estrictos de TypeScript:
npm run typecheck
```

---

## 🤖 Uso del SLM Local (Ollama)

Para correr el agente en modo 100% offline con privacidad total:

```bash
# 1. Iniciar servicio de Ollama
ollama serve

# 2. Descargar e interactuar con el modelo local liviano
ollama run llama3.2:1b "Recomiéndame 3 lugares imperdibles para visitar en Aomori durante el invierno"
```

---

## 📁 Estructura del Proyecto

```
aomoritrips/
├── docs/                      # Documentación, diagramas de arquitectura y memoria técnica
│   ├── diagrams/              # Diagramas Mermaid y renders visuales (1440x900 y 2048x1320)
│   └── informe_entrega_final_aomoritrips.md # Informe técnico académico oficial UTN.BA
├── prisma/                    # Modelado de datos relacional
│   ├── schema.prisma          # Esquema de Prisma (Packs, Bookings, Sessions, Messages, Quiz)
│   └── seed.ts                # Semilla de datos curados de Aomori y Tohoku
├── public/                    # Assets estáticos, tipografías y fotografías de Aomori
├── src/
│   ├── app/                   # App Router de Next.js
│   │   ├── api/               # Route Handlers RESTful (/agent/chat, /bookings, /packs, etc.)
│   │   ├── cultura/           # Guías culturales de Tohoku
│   │   ├── itinerary-builder/ # Armador interactivo de itinerarios con IA
│   │   ├── mis-suenos/        # Bucket List persistente de destinos soñados
│   │   ├── quiz/              # Quiz interactivo "¿Cuál es tu Japón?"
│   │   └── page.tsx           # Página principal (Catálogo, Sensei IA, Billetera, Perfil)
│   ├── components/            # Componentes React (Navbar, PackCard, BookingModal, WalletView, etc.)
│   ├── hooks/                 # Hooks personalizados (useFavorites, useBucketList)
│   └── lib/                   # Lógica de dominio, seguridad y orquestación agéntica
│       ├── agent/             # Loop agéntico, guardrails, herramientas y tipos
│       └── security/          # Bóveda de tokenización PCI-DSS y validación Luhn
├── tests/                     # Suite de pruebas unitarias (Node.js Test Runner + tsx)
├── package.json
└── tsconfig.json
```

---

## 📄 Licencia

Desarrollado con fines académicos para la **Universidad Tecnológica Nacional (UTN.BA)** · Centro de e-Learning.  
Autor: **Federico Terradas** · Septiembre 2026.
