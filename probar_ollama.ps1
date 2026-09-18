# ==============================================================================
# Script de Prueba Rápida para Ollama - AomoriTrips (UTN.BA)
# ==============================================================================

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "         AOMORITRIPS - PANEL DE PRUEBAS DE OLLAMA         " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar si el comando ollama está disponible
$ollamaCmd = Get-Command ollama -ErrorAction SilentlyContinue
if (-not $ollamaCmd) {
    Write-Host "[ALERTA] No se encontro 'ollama' en el PATH actual." -ForegroundColor Red
    Write-Host "Por favor asegurate de haber instalado Ollama y de haberlo iniciado desde el menu Inicio." -ForegroundColor Yellow
    exit 1
}

# 2. Menú de opciones
Write-Host "Selecciona que accion deseas realizar:" -ForegroundColor White
Write-Host " [1] Ver version y modelos instalados (ollama list)" -ForegroundColor Green
Write-Host " [2] Ejecutar chat interactivo con llama3.2:1b (descarga si no esta)" -ForegroundColor Green
Write-Host " [3] Compilar y ejecutar 'aomori-sensei' desde Modelfile.sensei" -ForegroundColor Green
Write-Host " [4] Probar llamada HTTP REST (Inference Seam al puerto 11434)" -ForegroundColor Green
Write-Host " [5] Ver guia de comandos y guion del video (COMANDOS_OLLAMA.md)" -ForegroundColor Green
Write-Host " [Q] Salir" -ForegroundColor Gray
Write-Host ""

$opcion = Read-Host "Ingresa tu opcion (1-5 o Q)"

switch ($opcion) {
    "1" {
        Write-Host "`n>>> Version de Ollama:" -ForegroundColor Cyan
        ollama --version
        Write-Host "`n>>> Modelos locales instalados:" -ForegroundColor Cyan
        ollama list
        Write-Host "`n>>> Modelos activos en memoria (VRAM/RAM):" -ForegroundColor Cyan
        ollama ps
    }
    "2" {
        Write-Host "`n>>> Iniciando chat interactivo con llama3.2:1b..." -ForegroundColor Cyan
        Write-Host "(Escribi '/bye' para salir del chat cuando termines)`n" -ForegroundColor Yellow
        ollama run llama3.2:1b
    }
    "3" {
        Write-Host "`n>>> Compilando modelo personalizado 'aomori-sensei'..." -ForegroundColor Cyan
        ollama create aomori-sensei -f ./Modelfile.sensei
        Write-Host "`n>>> Ejecutando 'aomori-sensei'..." -ForegroundColor Cyan
        Write-Host "(Escribi '/bye' para salir del chat cuando termines)`n" -ForegroundColor Yellow
        ollama run aomori-sensei
    }
    "4" {
        Write-Host "`n>>> Enviando llamada HTTP REST a http://localhost:11434/api/generate..." -ForegroundColor Cyan
        try {
            $body = @{
                model = "llama3.2:1b"
                prompt = "¿Que lugares recomiendas visitar en Aomori en invierno?"
                stream = $false
            } | ConvertTo-Json

            $res = Invoke-RestMethod -Uri "http://localhost:11434/api/generate" -Method Post -ContentType "application/json" -Body $body -TimeoutSec 30
            Write-Host "`n>>> Respuesta obtenida con exito:`n" -ForegroundColor Green
            Write-Host $res.response -ForegroundColor White
        } catch {
            Write-Host "`n[ERROR] No se pudo conectar al endpoint local de Ollama." -ForegroundColor Red
            Write-Host "Verifica que la aplicacion Ollama este corriendo en la bandeja del sistema de Windows." -ForegroundColor Yellow
            Write-Host $_.Exception.Message -ForegroundColor DarkGray
        }
    }
    "5" {
        if (Get-Command code -ErrorAction SilentlyContinue) {
            code COMANDOS_OLLAMA.md
        } else {
            Get-Content COMANDOS_OLLAMA.md | More
        }
    }
    Default {
        Write-Host "Operacion cancelada o finalizada." -ForegroundColor Gray
    }
}
