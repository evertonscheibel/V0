# Script para Iniciar o Sistema - Sistema de Gestão de TI
# Execute com: .\start.ps1

Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                       ║" -ForegroundColor Cyan
Write-Host "║   🚀 Iniciando Sistema de Gestão de TI               ║" -ForegroundColor Cyan
Write-Host "║                                                       ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Função para iniciar backend
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD\backend
    npm run dev
}

Write-Host "✅ Backend iniciado em segundo plano" -ForegroundColor Green
Write-Host "   http://localhost:3000" -ForegroundColor Gray
Write-Host ""

# Aguardar 3 segundos
Start-Sleep -Seconds 3

# Função para iniciar frontend
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD\frontend
    npm run dev
}

Write-Host "✅ Frontend iniciado em segundo plano" -ForegroundColor Green
Write-Host "   http://localhost:5173" -ForegroundColor Gray
Write-Host ""

Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                       ║" -ForegroundColor Green
Write-Host "║   ✅ SISTEMA RODANDO!                                ║" -ForegroundColor Green
Write-Host "║                                                       ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Acesse: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "👥 Credenciais de teste:" -ForegroundColor Yellow
Write-Host "   Admin:    admin@gestao.com    / admin123" -ForegroundColor White
Write-Host "   Técnico:  joao@gestao.com     / tecnico123" -ForegroundColor White
Write-Host "   Cliente:  maria@cliente.com   / cliente123" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Pressione Ctrl+C para parar os servidores" -ForegroundColor Yellow
Write-Host ""

# Aguardar jobs
try {
    Wait-Job -Job $backendJob, $frontendJob
}
finally {
    # Limpar jobs ao sair
    Stop-Job -Job $backendJob, $frontendJob
    Remove-Job -Job $backendJob, $frontendJob
}
