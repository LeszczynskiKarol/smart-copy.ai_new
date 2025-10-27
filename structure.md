# KOMPLETNA STRUKTURA PROJEKTU SMART-COPY.AI

smart-copy.ai_new/
├── backend/
│ ├── prisma/
│ │ └── schema.prisma
│ ├── src/
│ │ ├── middleware/
│ │ │ └── auth.middleware.ts
│ │ ├── routes/
│ │ │ └── auth.routes.ts
│ │ ├── services/
│ │ │ ├── auth.service.ts
│ │ │ └── email.service.ts
│ │ ├── types/
│ │ │ └── index.ts
│ │ ├── utils/
│ │ │ ├── helpers.ts
│ │ │ ├── jwt.ts
│ │ │ └── recaptcha.ts
│ │ └── index.ts
│ ├── .env
│ ├── .env.example
│ ├── package.json
│ └── tsconfig.json
│
└── frontend/
├── src/
│ ├── components/
│ │ ├── auth/
│ │ │ ├── RegisterForm.tsx
│ │ │ ├── LoginForm.tsx
│ │ │ ├── VerifyCodeForm.tsx
│ │ │ ├── ForgotPasswordForm.tsx
│ │ │ └── ResetPasswordForm.tsx
│ │ ├── layout/
│ │ │ ├── Header.tsx
│ │ │ ├── Footer.tsx
│ │ │ └── Layout.tsx
│ │ └── ui/
│ │ └── LoadingSpinner.tsx
│ ├── config/
│ │ └── index.ts
│ ├── lib/
│ │ ├── api.ts
│ │ └── recaptcha.ts
│ ├── pages/
│ │ ├── HomePage.tsx
│ │ ├── RegisterPage.tsx
│ │ ├── LoginPage.tsx
│ │ ├── VerifyPage.tsx
│ │ ├── ForgotPasswordPage.tsx
│ │ ├── ResetPasswordPage.tsx
│ │ ├── DashboardPage.tsx
│ │ ├── TermsPage.tsx
│ │ └── PrivacyPage.tsx
│ ├── services/
│ │ └── auth.service.ts
│ ├── store/
│ │ └── authStore.ts
│ ├── types/
│ │ └── index.ts
│ ├── App.tsx
│ ├── main.tsx
│ └── index.css
├── public/
│ └── vite.svg
├── .env.example
├── .env.local
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
