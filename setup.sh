#!/bin/bash

# Kolory do outputu
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Smart-Copy.ai - Setup & Deploy Script${NC}"
echo "==========================================="

# Ustaw katalog bazowy
BASE_DIR="/var/www/smart-copy.ai_new"
cd $BASE_DIR

# Funkcja do sprawdzania błędów
check_error() {
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Błąd: $1${NC}"
        exit 1
    fi
}

# 1. Sprawdź czy .env istnieją
echo -e "\n${YELLOW}📋 Sprawdzam pliki konfiguracyjne...${NC}"
if [ ! -f backend/.env ]; then
    echo -e "${RED}❌ Brak pliku backend/.env${NC}"
    exit 1
fi

if [ ! -f frontend/.env.local ]; then
    echo -e "${RED}❌ Brak pliku frontend/.env.local${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Pliki .env znalezione${NC}"

# 2. Instaluj zależności backend
echo -e "\n${YELLOW}📦 Instaluję zależności backend...${NC}"
cd $BASE_DIR/backend
npm install
check_error "Instalacja zależności backend"

# 3. Generuj Prisma Client
echo -e "\n${YELLOW}🔧 Generuję Prisma Client...${NC}"
npx prisma generate
check_error "Generowanie Prisma Client"

# 4. Uruchom migracje bazy danych
echo -e "\n${YELLOW}🗄️  Uruchamiam migracje bazy danych...${NC}"
npx prisma migrate deploy
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Próbuję reset bazy danych...${NC}"
    read -p "Czy chcesz zresetować bazę danych? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npx prisma migrate reset --force
        check_error "Reset bazy danych"
    fi
fi

# 5. Instaluj zależności frontend
echo -e "\n${YELLOW}📦 Instaluję zależności frontend...${NC}"
cd $BASE_DIR/frontend
npm install
check_error "Instalacja zależności frontend"

# 6. Buduj frontend
echo -e "\n${YELLOW}🏗️  Buduję frontend...${NC}"
npm run build
check_error "Budowanie frontend"

# 7. Twórz folder na logi
echo -e "\n${YELLOW}📁 Tworzę folder na logi...${NC}"
mkdir -p $BASE_DIR/logs
echo -e "${GREEN}✅ Folder logs utworzony${NC}"

# 8. Zatrzymaj stare procesy PM2
echo -e "\n${YELLOW}🛑 Zatrzymuję stare procesy...${NC}"
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# 9. Twórz plik ecosystem PM2
echo -e "\n${YELLOW}⚙️  Tworzę konfigurację PM2...${NC}"
cat > $BASE_DIR/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'smart-backend',
      cwd: '/var/www/smart-copy.ai_new/backend',
      script: 'npx',
      args: 'tsx src/index.ts',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
        NODE_OPTIONS: '--max-old-space-size=1024'
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: '/var/www/smart-copy.ai_new/logs/backend-error.log',
      out_file: '/var/www/smart-copy.ai_new/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000
    }
  ]
};
EOF
echo -e "${GREEN}✅ Konfiguracja PM2 utworzona${NC}"

# 10. Uruchom backend przez PM2
echo -e "\n${YELLOW}🚀 Uruchamiam backend...${NC}"
cd $BASE_DIR
pm2 start ecosystem.config.js
check_error "Uruchomienie backend"

# 11. Zapisz konfigurację PM2
echo -e "\n${YELLOW}💾 Zapisuję konfigurację PM2...${NC}"
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu 2>/dev/null || true

# 12. Reload nginx
echo -e "\n${YELLOW}🔄 Przeładowuję Nginx...${NC}"
sudo nginx -t
check_error "Test konfiguracji Nginx"
sudo nginx -s reload
check_error "Przeładowanie Nginx"

# 13. Czekaj na uruchomienie backend
echo -e "\n${YELLOW}⏳ Czekam na uruchomienie backend...${NC}"
sleep 5

# 14. Sprawdź status
echo -e "\n${YELLOW}🔍 Sprawdzam status aplikacji...${NC}"
echo -e "\n${GREEN}Status PM2:${NC}"
pm2 status

# 15. Test health endpoint
echo -e "\n${YELLOW}🏥 Test health endpoint...${NC}"
HEALTH_CHECK=$(curl -s http://localhost:4000/health)
if [[ $HEALTH_CHECK == *"ok"* ]]; then
    echo -e "${GREEN}✅ Backend działa poprawnie${NC}"
else
    echo -e "${RED}❌ Backend nie odpowiada${NC}"
    echo "Sprawdź logi: pm2 logs smart-backend"
fi

# 16. Pokaż URLe
echo -e "\n${GREEN}🎉 Aplikacja uruchomiona!${NC}"
echo "==========================================="
echo -e "📍 Frontend: ${GREEN}https://www.smart-copy.ai${NC}"
echo -e "📍 API: ${GREEN}https://www.smart-copy.ai/api${NC}"
echo -e "📍 Health: ${GREEN}http://localhost:4000/health${NC}"
echo "==========================================="
echo -e "\n${YELLOW}📝 Przydatne komendy:${NC}"
echo "  pm2 status         - status aplikacji"
echo "  pm2 logs           - wszystkie logi"
echo "  pm2 logs smart-backend - logi backend"
echo "  pm2 restart all    - restart aplikacji"
echo "  pm2 monit          - monitoring CPU/RAM"
echo "==========================================="