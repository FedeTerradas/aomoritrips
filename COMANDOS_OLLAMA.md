# 🦙 Comandos de Ollama para la Demo de AomoriTrips

Este archivo contiene los comandos exactos listos para copiar y pegar en PowerShell cuando vayas a probar y grabar el video.

---

## ⚡ Paso 0: Abrir Ollama (Solo una vez)

1. Abrí el menú de inicio de Windows y escribí **Ollama** (Enter).
2. Verificá que aparezca el ícono de la llamita en la bandeja del sistema (al lado de la hora de Windows).

---

## 📋 Comandos Rápidos para la Terminal

Abrí una terminal PowerShell en esta carpeta (`aomoritrips`) y ejecutá:

### 1. Verificar instalación

```powershell
ollama --version
```

### 2. Ver modelos instalados y estado de memoria

```powershell
# Lista los modelos descargados en tu disco
ollama list

# Muestra si hay algún modelo cargado en RAM/VRAM en este instante
ollama ps
```

### 3. Descargar y probar el modelo ultraliviano (`llama3.2:1b`)

_(La primera vez descarga ~1.3 GB automáticamente)_

```powershell
ollama run llama3.2:1b
```

**Preguntas sugeridas para probar en el prompt `>>>`:**

```text
>>> ¿Qué lugares recomendás visitar en Aomori durante el invierno?
>>> Explicame en dos oraciones qué es un onsen tradicional en Japón.
```

_(Para salir del chat interactivo: escribí `/bye` o presioná `Ctrl + D`)_

---

### 4. Compilar tu propio modelo personalizado ("Aomori Sensei")

Ya tenés creado el archivo `Modelfile.sensei` en esta carpeta con la personalidad turística configurada.

```powershell
# Compilar el modelo con el System Prompt de Sensei:
ollama create aomori-sensei -f ./Modelfile.sensei

# Ejecutar tu modelo personalizado:
ollama run aomori-sensei
```

---

### 5. Probar la llamada HTTP como lo hace el frontend (Inference Seam)

Podés hacer una petición directa al servidor local de Ollama (puerto 11434):

```powershell
Invoke-RestMethod -Uri "http://localhost:11434/api/generate" -Method Post -ContentType "application/json" -Body '{"model": "llama3.2:1b", "prompt": "Hola Sensei, ¿dónde queda Aomori?", "stream": false}' | Select-Object -ExpandProperty response
```

---

## 🎬 Mini-Guion para los 30 Segundos del Video

Cuando te toque mostrar la parte técnica / local en el video:

1. **Abrí la terminal** y ejecutá:
   ```powershell
   ollama run llama3.2:1b
   ```
2. **Preguntale al modelo**:
   ```text
   >>> ¿Qué visitar en Aomori en invierno?
   ```
3. **Comentario a decir mientras responde**:
   > _"A nivel de infraestructura implementamos una Costura de Inferencia (Inference Seam): desacoplamos la IA de la lógica de negocio para operar en la nube con Groq o conmutar al instante a un SLM local en Ollama (`llama3.2:1b`), garantizando soberanía total de datos, costo cero y resiliencia determinística offline."_

---

## 🧠 Arquitectura Técnica: ¿Cómo Funciona el Agente por Detrás?

El asistente **Aomori Sensei** opera bajo el patrón de arquitectura agéntica **ReAct (Reasoning + Acting)**. No es un chatbot pasivo con un prompt estático; ante cada mensaje atraviesa 5 capas coordinadas:

### 1. Gateway y Ciberseguridad (Perímetro)

- **Rate Limiting**: En `/api/agent/chat` se limita a **15 requests/minuto por IP** para evitar saturación de inferencia y ataques DoS.
- **Input Guardrails**: `validateAndSanitizeInput()` escanea la entrada buscando inyecciones de prompt, ataques de jailbreak (`"Ignore previous instructions"`, `"DAN mode"`) o caracteres de control maliciosos. Si detecta riesgo, bloquea la consulta de inmediato (`BLOCK_INPUT`).

### 2. Memoria Persistente y Resiliente (Multi-Turn)

- `getOrCreateResilientSession()` recupera de SQLite los últimos 10 mensajes y las preferencias inferidas del viajero (temporada, tamaño del grupo).
- **Mecanismo de Resiliencia**: Si el sistema de archivos estuviera en modo solo lectura o la base de datos no respondiera, conmuta automáticamente a una memoria en RAM (`memorySessionStore`) para no interrumpir al usuario.

### 3. Loop Cognitivo ReAct Gobernado (O-R-E-V)

1. **Observar (Observe)**: Analiza el texto del usuario y extrae entidades implícitas (ej. _"viajo con mi pareja"_ → 2 personas; _"quiero ver cerezos"_ → Sakura en Hirosaki).
2. **Razonar (Thought)**: Determina qué información falta y qué herramientas de backend deben invocarse.
3. **Ejecutar Herramienta (Act)**: Invoca funciones de código tipadas en TypeScript nativo:
   - `toolSearchPacks`: Consulta paquetes turísticos en la base de datos relacional.
   - `toolCalculatePricing`: Aplica la fórmula estacional y descuentos de grupo con precisión matemática.
   - `toolGetSeasonalForecast`: Obtiene clima auténtico, temperatura media y recomendaciones de vestimenta de Tohoku.
   - `toolCreateItineraryDraft`: Genera itinerarios estructurados día por día.
4. **Verificar (Verify & Circuit Breaker)**: Posee un límite estricto de **3 iteraciones máximas (`MAX_ITERATIONS = 3`)** para prevenir bucles infinitos de auto-invocación.

### 4. Cero Alucinación en Datos Críticos

El modelo de lenguaje **nunca calcula precios, fechas ni disponibilidad por su cuenta**. Las herramientas determinísticas de backend ejecutan la matemática exacta, garantizando que el viajero reciba un desglose veraz y transparente sin cargos ocultos.

### 5. Costura de Inferencia (_Inference Seam_)

En `src/lib/agent/inference/index.ts`, el orquestador desacopla la inferencia de la lógica de negocio mediante un router adaptativo:

- **Cloud LLM (Groq / LLaMA 3.3 70B)**: Máxima velocidad y fluidez conversacional en la nube.
- **Local SLM (Ollama / LLaMA 3.2 1B / 3B)**: Inferencia en la máquina local (`localhost:11434`), con costo $0 y máxima privacidad.
- **Fallback Determinístico**: Si se corta internet y Ollama no está activo, un motor de contingencia garantiza que la aplicación **nunca arroje un error 500**.

---

💡 **Tip:** También tenés disponible el script interactivo `.\probar_ollama.ps1` en esta misma carpeta si preferís ejecutar un menú interactivo.
