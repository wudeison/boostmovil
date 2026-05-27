# 🚀 Script para compilar y sincronizar proyecto con Capacitor y Android Studio

Write-Host "1️⃣ Compilando proyecto React/Angular/Vue..." -ForegroundColor Cyan
npm run build

Write-Host "2️⃣ Copiando archivos al contenedor Capacitor..." -ForegroundColor Cyan
npx cap copy

Write-Host "3️⃣ Sincronizando proyecto Android..." -ForegroundColor Cyan
npx cap sync android

Write-Host "4️⃣ Abriendo Android Studio..." -ForegroundColor Cyan
npx cap open android

Write-Host "✅ Listo. Ahora compila el APK desde Android Studio (Build > Build APKs)."
