# reCAPTCHA v3 Handoff

Frontend already sends reCAPTCHA v3 metadata for sensitive actions.

## Env

- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is used on frontend
- `RECAPTCHA_SECRET_KEY` must be used only on backend/server-side verification

## Incoming request contract

Sensitive requests now include these headers:

- `X-Recaptcha-Token`
- `X-Recaptcha-Action`

## Actions already used by frontend

- `login_submit`
- `register_submit`
- `contact_submit`
- `mailing_subscribe`
- `agent_application_submit`
- `tour_booking_create`
- `charter_booking_create`
- `group_transport_booking_create`

## Endpoints that already send reCAPTCHA headers

- `POST /auth/login`
- `POST /auth/register`
- `POST /api/contacts`
- `POST /api/mailing/subscribe`
- `POST /api/agent-applications`
- `POST /api/bookings`
- `POST /api/charter/bookings`
- `POST /api/group-transport/bookings`

## Verification flow on backend

For each protected endpoint:

1. Read `X-Recaptcha-Token`
2. Read `X-Recaptcha-Action`
3. Verify token against Google:
   - `POST https://www.google.com/recaptcha/api/siteverify`
   - payload: `secret`, `response`
4. Validate:
   - `success === true`
   - `action` matches `X-Recaptcha-Action`
   - `score` is above your threshold, recommended starting point `0.5`
5. Reject request with `400/403` if verification fails

## Important

- Do not trust action from frontend without comparing it to the verified Google response
- Secret key must never be exposed to the browser
- For authenticated endpoints, reCAPTCHA should be an extra anti-abuse layer, not a replacement for auth
