# Viva Group - коммерческая витрина туроператора

Витринный продукт для туроператора с личными кабинетами клиентов, менеджеров
и админов. Фокус - качественный UI/UX: preloader, плавные переходы страниц,
скролл-анимации, кастомные карусели и выразительная подача блоков.

## Что это за продукт

- Публичная витрина: главная, туры, групповые перевозки, карго, контакты.
- Кабинеты: CLIENT / MANAGER / ADMIN с четким разделением прав.
- Полный цикл бронирований: от выбора тура до чата и статусов в реальном времени.
- Админ-панель: управление турами, менеджерами и доступностью.
- Интеграция с боевым API (Auth/Туры/Бронирования/Чаты).

## Коммерческие сценарии

### Клиент

- Просматривает туры, фильтрует и открывает карточку.
- Оставляет бронирование, получает уведомление об успехе/ошибке.
- Видит брони в ЛК, открывает детали и общается в чате.
- Создает заявку на групповую перевозку через форму направлений.

### Менеджер

- Видит только бронирования клиентов.
- Меняет статусы и общается в чатах.
- Имеет поиск по бронированиям.

### Админ

- Все функции менеджера.
- Управление турами: создание, редактирование, доступность.
- Управление сотрудниками: создание менеджеров и админов, статус, роль.

## UI/UX

- Preloader на первом входе, пока загружаются ресурсы.
- Анимированное появление хедера и hero-текста.
- Плавный скролл на Lenis + синхронизация с GSAP.
- Страничные переходы с overlay-анимацией (PageTransition).
- Sticky-hero: основной блок "сжимается" при прокрутке.
- Карусели туров на Embla с кастомной навигацией.
- Почти каждый блок "оживает" при входе в зону видимости.
- Чаты показывают статус соединения (онлайн/подключение/оффлайн).

## Реализация и оптимизации

- Анимации: GSAP + ScrollTrigger (`src/components/pages/*`, `src/hooks/useScrollFadeAnimation.ts`).
- Preloader с таймаутами и ожиданием критических ресурсов (`src/components/ui/Preloader/Preloader.tsx`).
- Переходы между страницами (`src/components/ui/PageTransition/*`).
- Плавный скролл Lenis + GSAP ticker (`src/app/providers.tsx`).
- Карусели туров Embla с кастомными стрелками и точками (`src/components/pages/HomePage/HomeTours/ui/EmblaCarousel/*`).
- Оптимизация изображений: `next/image`, blur placeholder, responsive sizes, priority для первых карточек (`src/lib/image-utils.ts`).
- Фильтры/поиск: debounce и мемоизация (`src/hooks/useTours.ts`).
- UI-компоненты: skeleton, pagination, toaster, error boundary.
- Чаты: WebSocket (socket.io) с fallback на polling, плюс статус соединения (`src/hooks/useMessages.ts`).
- Админ-форма тура с DnD блоков описания (`src/components/forms/TourForm/TourForm.tsx`).

## Технологии

- Next.js 15 (App Router), React 19
- NextAuth (Credentials)
- @tanstack/react-query
- Zod + React Hook Form
- GSAP + ScrollTrigger
- Lenis (smooth scroll)
- Embla Carousel
- socket.io-client
- DnD Kit
- SCSS modules
- TypeScript

## Архитектура

- `src/app` - маршруты (public и admin/client/manager).
- `src/components` - UI и страницы.
- `src/lib` - API, схемы, auth, env, утилиты.
- `src/hooks` - data fetching, анимации и UI-логика.

## Быстрый старт (Bun)

```bash
bun install
bun run dev
```

Фронт по умолчанию: `http://localhost:3001` (dev и start).

## Переменные окружения

В production обязательны:

- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_WS_URL`
- `AUTH_API_URL`

## Команды

```bash
bun run dev
bun run build
bun run start
bun run lint
```

## Ближайшие планы развития

- Интеграция сервиса бронирования чартерных рейсов в личный кабинет.
- Интеграция с amoCRM.
- Расширение публичной части: отдельные страницы туров для лучшего индексирования.
- Наблюдаемость: мониторинг, алерты и централизованные логи.
- CI/CD: автоматическая сборка, проверки и деплой.
- Уведомления клиентам и менеджерам (email/мессенджеры) по статусам заявок.
