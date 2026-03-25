# Backend Handoff: Tours, Currency, Agents

## 1. Tours

Extend tour DTOs and `/api/tours` payloads with:

```ts
type CurrencyCode = "RUB" | "USD" | "EUR" | "CNY"

type TourHotel = {
  name: string
  stars: number
  note?: string
  basePrice: number
  baseCurrency: CurrencyCode
}

type Tour = {
  id: string
  publicId?: string
  title: string
  shortDescription: string
  fullDescriptionBlocks: Array<{ title: string; items: string[] }>
  programText?: string
  price: number
  baseCurrency?: CurrencyCode
  image: string
  tags: string[]
  categories: string[]
  hasHotelOptions?: boolean
  hotels: TourHotel[]
  dateFrom?: string
  dateTo?: string
  durationDays?: number
  durationNights?: number
  available?: boolean
}
```

Notes:
- `programText` is the new primary itinerary source.
- `fullDescriptionBlocks` stays supported as legacy optional content.
- `price` remains the base tour price and is not replaced by hotel prices.
- `hotels[]` is informational only and is not part of booking submission.

## 2. Currency Settings

Add admin settings endpoint:

```http
GET /api/admin/currency-settings
PUT /api/admin/currency-settings
```

Payload:

```ts
type CurrencySettings = {
  baseCurrency: "RUB"
  rates: Array<{
    currency: CurrencyCode
    rate: number        // how many RUB for 1 unit of currency
    markupPercent: number
  }>
  updatedAt: string
}
```

Rules:
- `RUB` must always exist with `rate = 1`.
- Frontend now takes market rates from `https://www.cbr-xml-daily.ru/daily_json.js`.
- Admin manually edits only `markupPercent`; rate values should either be cached from the same source or accepted as snapshot values sent by frontend.
- Homepage ticker shows exactly these quotes: `USD -> RUB`, `CNY -> RUB`, `USD -> CNY`.
- `USD -> CNY` is derived on frontend from two CBR quotes, not stored separately.
- Markup is applied by frontend after conversion into target currency.
- Response must be available without breaking public pages; admin update requires `ADMIN`.

## 3. Agent Applications And Role

Extend role enum with:

```ts
type Role = "CLIENT" | "AGENT" | "MANAGER" | "ADMIN"
```

Add endpoints:

```http
POST /api/agent-applications
GET /api/admin/agent-applications
PATCH /api/admin/agent-applications/:id
```

Create payload:

```ts
type CreateAgentApplicationInput = {
  companyName: string
  contactName: string
  email: string
  phone: string
  website?: string
  city?: string
  comment?: string
}
```

Entity:

```ts
type AgentApplication = {
  id: string
  userId?: string
  email: string
  name?: string
  companyName: string
  contactName: string
  phone: string
  website?: string
  city?: string
  comment?: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: string
  updatedAt?: string
  reviewedAt?: string
  reviewerName?: string
  rejectionReason?: string
}
```

Review rules:
- `APPROVED` should promote the related account to role `AGENT`.
- `REJECTED` keeps current role unchanged.
- Admin endpoints are `ADMIN` only.

## 4. Agent Charter Pricing

Keep existing client charter endpoints intact and add a dedicated agent listing:

```http
GET /api/charter/flights/agent
```

Return the same flight model plus pricing fields:

```ts
type AgentCharterFlight = {
  id: string
  publicId: string
  from: string
  to: string
  dateFrom: string
  dateTo: string
  weekDays: number[]
  categories: string[]
  seatsTotal: number
  hasBusinessClass: boolean
  hasComfortClass: boolean
  isActive: boolean
  price?: number
  priceCurrency?: CurrencyCode
  agentPrice?: number
  agentCommission?: number
}
```

Access rules:
- `/api/charter/flights/agent` must return data only for authenticated `AGENT` users.
- Client-facing routes must never expose `agentPrice` or `agentCommission`.

## 5. Booking Compatibility

No change required in tour booking payloads for v1.

Important:
- Hotel choice is discussed after booking in chat.
- Tour booking still sends only `tourId`, participants and notes.
- Frontend already allows `CLIENT` and `AGENT` to open traveler tour areas where needed.
