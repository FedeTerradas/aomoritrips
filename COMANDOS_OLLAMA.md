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
ollama create aomori-sensei -f ./Modelfile.senseiw

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
   > _"Como explicamos en la Parte 2 del informe, AomoriTrips cuenta con una Costura de Inferencia (Inference Seam). Si el viajero está en una zona montañosa sin internet o necesitamos privacidad total de datos sensibles, la IA corre 100% en local con Ollama a costo cero por token y respuesta inmediata."_

---

💡 **Tip:** También tenés disponible el script interactivo `.\probar_ollama.ps1` en esta misma carpeta si preferís ejecutar un menú interactivo.
