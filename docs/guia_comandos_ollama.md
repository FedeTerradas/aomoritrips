# Guía Rápida de Comandos Ollama para AomoriTrips

> **Objetivo**: Pruebas de Inteligencia Artificial Local (SLM) y preparación para la grabación del video de entrega final (UTN.BA).

---

## 1. Paso Inicial: Iniciar el Servicio en Windows

Ollama corre en segundo plano como una aplicación en la bandeja del sistema:

1. Abrí el menú Inicio de Windows y ejecutá **"Ollama"**.
2. Verificá que aparezca el ícono de la llamita blanca en la barra de tareas (al lado del reloj de Windows).
3. Abrí una terminal de PowerShell y verificá que responda:
   ```powershell
   ollama --version
   ```

---

## 2. Comandos de Diagnóstico y Estado

```powershell
# Ver todos los modelos descargados en tu máquina
ollama list

# Ver qué modelo está cargado en la memoria RAM/VRAM en este momento
ollama ps

# Ver ayuda general de comandos
ollama --help
```

---

## 3. Descarga y Chat Interactivo con `llama3.2:1b`

El modelo ultraliviano del proyecto es `llama3.2:1b` (~1.3 GB). La primera vez que lo ejecutes se descargará de forma automática:

```powershell
ollama run llama3.2:1b
```

### Preguntas sugeridas para probar en el prompt `>>>`:

```text
>>> ¿Qué lugares recomiendas visitar en la prefectura de Aomori durante el invierno y por qué?
>>> Explicame en dos oraciones qué es un baño termal secreto (Hitō) en Japón.
>>> ¿Qué precauciones debo tener al caminar en el bosque primario de Shirakami-Sanchi?
```

> **Para salir del chat**: escribí `/bye` y presioná Enter (o presiona `Ctrl + D`).

---

## 4. Compilar tu Propio Modelo de "Aomori Sensei"

Ya tenés listo en la raíz del proyecto el archivo `Modelfile.sensei` con la personalidad, temperatura y system prompt del mentor turístico.

### Compilar el modelo local:

```powershell
ollama create aomori-sensei -f ./Modelfile.sensei
```

### Ejecutar y chatear con tu Sensei personalizado:

```powershell
ollama run aomori-sensei
```

Verás que ahora te saluda con tono de Sensei japonés y responde orientado al turismo de Tohoku.

---

## 5. Probar la Conexión HTTP (Inference Seam)

AomoriTrips se comunica con Ollama a través de llamadas HTTP en el puerto `11434`. Podés probar esta llamada desde PowerShell tal como lo hace el backend de la app:

```powershell
Invoke-RestMethod -Uri "http://localhost:11434/api/generate" -Method Post -ContentType "application/json" -Body '{"model": "llama3.2:1b", "prompt": "Hola Sensei, ¿dónde queda Aomori?", "stream": false}' | Select-Object -ExpandProperty response
```

---

## 6. Guion de 30 Segundos para el Video de Demostración

Cuando estés grabando la última parte del video (el segmento técnico):

1. Mostrá tu ventana de PowerShell.
2. Ejecutá:
   ```powershell
   ollama run llama3.2:1b
   ```
3. Escribí:
   ```text
   >>> ¿Qué lugares recomiendas visitar en Aomori durante el invierno?
   ```
4. Explicá brevemente:
   > _"Como evidencia de la Parte 2 del informe, la arquitectura implementa una Costura de Inferencia (Inference Seam). Si el viajero se encuentra en una zona montañosa de Tohoku sin internet o no deseamos transmitir datos sensibles de pasajeros a la nube, la inferencia corre 100% en la máquina local a costo cero por token y con latencias instantáneas."_
