# 🚀 Smart-Copy.AI - Inteligentny Generator Treści

Profesjonalna aplikacja full-stack do generowania treści marketingowych za pomocą sztucznej inteligencji.

## ✨ Funkcje

### System Autoryzacji ✅

- ✅ Rejestracja z weryfikacją email (AWS SES)
- ✅ Logowanie JWT z access + refresh tokens
- ✅ Weryfikacja email za pomocą 6-cyfrowego kodu
- ✅ Reset hasła z linkiem email
- ✅ Google reCAPTCHA v3 protection
- ✅ Rate limiting na wysyłkę emaili
- ✅ Obsługa przerwanych rejestracji
- ✅ Automatyczne przekierowania
- ✅ Walidacja hasła w czasie rzeczywistym
- ✅ Podgląd hasła (show/hide)

### UI/UX ✅

- ✅ Nowoczesny design z TailwindCSS
- ✅ Animacje Framer Motion
- ✅ Responsywny layout (mobile-first)
- ✅ Toast notifications
- ✅ Loading states
- ✅ Error handling
- ✅ Form validation z React Hook Form + Zod

### Architektura

- **Backend**: Fastify + Prisma + PostgreSQL + TypeScript
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **State Management**: Zustand
- **Data Fetching**: Axios + React Query
- **Auth**: JWT + AWS SES
- **Security**: bcrypt, reCAPTCHA, rate limiting

## 📦 Instalacja

Szczegółowe instrukcje znajdują się w pliku `INSTRUKCJA_INSTALACJI.md`.

### Szybki start:

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edytuj .env z własnymi kluczami
npx prisma migrate dev
npm run dev

# Frontend (nowe okno terminala)
cd frontend
npm install
cp .env.example .env.local
# Edytuj .env.local
npm run dev
```

## 🔑 Konfiguracja

### Wymagane usługi:

1. **PostgreSQL** - baza danych
2. **AWS SES** - wysyłka emaili
3. **Google reCAPTCHA v3** - ochrona przed botami

### Zmienne środowiskowe:

**Backend (.env):**

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
RECAPTCHA_SECRET_KEY="..."
```

**Frontend (.env.local):**

```env
VITE_API_URL=http://localhost:4000/api
VITE_RECAPTCHA_SITE_KEY=your-site-key
```

## 📸 Screenshots

### Strona główna

- Hero section z CTA
- Sekcja z funkcjami
- Footer z linkami

### Rejestracja

- Formularz z walidacją
- Podgląd hasła
- Wskaźnik siły hasła
- Checkbox regulaminu

### Weryfikacja

- 6-cyfrowy kod
- Countdown do ponownej wysyłki
- Obsługa rate limiting

### Dashboard

- Statystyki użytkownika
- Szybkie akcje
- Ostatnia aktywność

## 🛣️ Roadmap

### Faza 2 (Następne kroki):

- [ ] Integracja z Claude AI API
- [ ] Generator treści marketingowych
- [ ] Historia generowanych treści
- [ ] Eksport do PDF/DOCX
- [ ] System płatności (Stripe)
- [ ] Limity tokenów dla użytkowników
- [ ] Szablony treści
- [ ] Panel administracyjny

### Faza 3 (Przyszłość):

- [ ] Współpraca zespołowa
- [ ] API dla developerów
- [ ] Mobile app (React Native)
- [ ] Integracje (Zapier, Make)
- [ ] Analytics dashboard
- [ ] A/B testing treści

## 🏗️ Struktura projektu

```
smart-copy.ai_new/
├── backend/                 # Fastify API
│   ├── prisma/             # Database schema
│   ├── src/
│   │   ├── middleware/     # Auth middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Helpers
│   └── package.json
│
└── frontend/               # React SPA
    ├── src/
    │   ├── components/     # React components
    │   │   ├── auth/      # Auth forms
    │   │   ├── layout/    # Layout components
    │   │   └── ui/        # UI components
    │   ├── pages/         # Route pages
    │   ├── services/      # API calls
    │   ├── store/         # Zustand store
    │   └── lib/           # Utilities
    └── package.json
```

## 🔧 Tech Stack

### Backend

- **Framework**: Fastify 5.x
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT + bcrypt
- **Email**: AWS SES
- **Validation**: Zod
- **Language**: TypeScript

### Frontend

- **Framework**: React 18 + Vite
- **Styling**: TailwindCSS
- **Forms**: React Hook Form + Zod
- **State**: Zustand
- **Routing**: React Router 6
- **Animations**: Framer Motion
- **HTTP**: Axios
- **Language**: TypeScript

## 📚 API Endpoints

### Auth

- `POST /api/auth/register` - Rejestracja użytkownika
- `POST /api/auth/verify` - Weryfikacja kodu email
- `POST /api/auth/login` - Logowanie
- `POST /api/auth/resend-code` - Ponowna wysyłka kodu
- `POST /api/auth/forgot-password` - Reset hasła (request)
- `POST /api/auth/reset-password` - Reset hasła (confirm)
- `GET /api/auth/me` - Pobierz dane użytkownika

## 🧪 Testing

```bash
# Backend tests (TODO)
cd backend
npm test

# Frontend tests (TODO)
cd frontend
npm test

# E2E tests (TODO)
npm run test:e2e
```

## 🚀 Deployment

### Backend (przykład z AWS/DigitalOcean):

1. Skonfiguruj PostgreSQL w chmurze
2. Ustaw zmienne środowiskowe
3. `npm run build`
4. `npm start`

### Frontend (przykład z Vercel/Netlify):

1. Połącz z repo Git
2. Ustaw build command: `npm run build`
3. Ustaw zmienne środowiskowe
4. Deploy

## 🔒 Security

- ✅ HTTPS only (produkcja)
- ✅ JWT tokens z refresh mechanism
- ✅ Hasła hashowane (bcrypt)
- ✅ reCAPTCHA protection
- ✅ Rate limiting
- ✅ Input validation (Zod)
- ✅ SQL injection protection (Prisma)
- ✅ XSS protection
- ✅ CORS configured

## 📄 Licencja

Własnościowa - użytek komercyjny.

## 👨‍💻 Autor

**Karol** - Full-Stack Developer

- Toruń, Poland
- 15+ lat doświadczenia
- Specjalizacja: Next.js, React, Node.js, AWS

## 🙏 Podziękowania

- Anthropic (Claude AI)
- OpenAI (koncepcja)
- Społeczność React
- TailwindCSS team

---

**Status projektu**: 🟢 Aktywny rozwój

Wersja: 1.0.0 (System autoryzacji - KOMPLETNY)
