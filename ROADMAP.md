# InfraDZ — Production Android Roadmap

**Target:** Google Play Store, Algeria market  
**Law reference:** قانون المرور 09-26 (2026 edition)  
**Current state:** Functional offline prototype — 7 tabs, 31 violations, keyword-based assistant, local-only storage  

---

## Current State Audit

### What works well
- 7 complete tab screens with RTL Arabic UI throughout
- 31 violations across 8 categories with fines, points, articles, tips
- Speed calculator with 5 road types and degree-based penalty logic
- 12-point licence tracking with 3-year recovery timeline (`usePointsRecovery`)
- Favorites and violation log persisted in `AsyncStorage`
- Dark/light mode with system preference fallback
- HTML report export from the log screen
- SVG ring gauge (`RingGauge`) and animated components

### Critical gaps before store submission
| Gap | Impact |
|-----|--------|
| Assistant labelled `متصل • Offline` simultaneously | Confusing/contradictory UX |
| Only 31 violations — Code 09-26 has ~80+ articles | Incomplete reference |
| Keyword chatbot sold as "AI Assistant" | Misleading; weak experience |
| No app icon, splash screen, or store assets | Blocks Play Store submission |
| No EAS / Android build configuration | Cannot produce an APK/AAB |
| No privacy policy or in-app disclaimer acceptance | Required by Google Play |
| DB schema is empty; API has only `/healthz` | Backend is non-functional |
| No push notifications despite bell icon in UI | Broken affordance |
| `AsyncStorage` log is device-only, no backup | Data loss on reinstall |

---

## Phase 0 — Immediate Fixes (1–2 days)

These are small, high-leverage corrections that unblock everything else.

### 0.1 Fix the assistant status label
**File:** `artifacts/traffic-law-dz/app/(tabs)/assistant.tsx`  
Change the contradictory `متصل • Offline` badge to a single honest state:
- While the assistant is purely keyword-based → show `غير متصل • وضع عدم الاتصال`
- Reserve `متصل` for when a real API is wired up in Phase 3

### 0.2 Fix the bell icon (notifications tab bar)
**File:** `artifacts/traffic-law-dz/app/(tabs)/_layout.tsx`  
Either:
- Remove the notification bell from the tab bar until Phase 4 (recommended), **or**
- Route it to a static "قريباً" (coming soon) screen so tapping it doesn't silently do nothing

### 0.3 Add an app icon and splash screen
**Files needed:**
- `artifacts/traffic-law-dz/assets/icon.png` — 1024×1024 px, no alpha
- `artifacts/traffic-law-dz/assets/splash.png` — 1284×2778 px
- `artifacts/traffic-law-dz/assets/adaptive-icon.png` — 1024×1024 for Android adaptive icon

Update `app.json`:
```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "splash": { "image": "./assets/splash.png", "resizeMode": "contain", "backgroundColor": "#0F172A" },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0F172A"
      }
    }
  }
}
```

### 0.4 Set the Android package name and version
**File:** `artifacts/traffic-law-dz/app.json`
```json
{
  "expo": {
    "name": "InfraDZ",
    "slug": "infra-dz",
    "version": "1.0.0",
    "android": {
      "package": "dz.infra.codeRoute",
      "versionCode": 1,
      "permissions": []
    }
  }
}
```
The package name must be globally unique and cannot be changed after the first upload.

### 0.5 RTL layout enforcement
**File:** `artifacts/traffic-law-dz/app/_layout.tsx`  
Add at app root:
```ts
import { I18nManager } from "react-native";
I18nManager.forceRTL(true);
```
This ensures flex layout, back gestures, and text alignment are consistently right-to-left on all Android devices regardless of system locale.

---

## Phase 1 — Content Completeness (3–5 days)

### 1.1 Expand violation dataset to ~80 violations
The current `data/violations.ts` covers only 31 of the ~80+ articles in 09-26. Missing categories include:
- Heavy vehicle/truck regulations
- Motorcycle-specific rules  
- School zone and hospital zone rules
- Towing and breakdown rules
- Vehicle registration / technical inspection violations
- Alcohol thresholds (exact BAC limits per article)

**Action:** Add remaining violations to `violations.ts` maintaining the existing `Violation` interface. No schema change needed — the UI already handles any list length.

### 1.2 Expand `legalKnowledge.ts` Q&A pairs
The keyword assistant currently has ~30 Q&A pairs. Add:
- Driving licence categories (A, B, C, D, E) and their rules
- Provisional licence rules (2-year period, 6-point limit)
- Vehicle inspection (contrôle technique) frequency
- International driving permit rules
- Police checkpoint rights
- Accident procedure steps (steps to take after a crash)
- Insurance obligation and green card

Target: ~80 `LegalQA` entries and ~30 `LegalArticle` entries.

### 1.3 Add a "Quizz / Entraînement" screen
A multiple-choice quiz mode is the single most-requested feature in traffic law apps in the MENA region. Each question draws from `violations.ts` and `legalKnowledge.ts`.

**Suggested tab placement:** Replace or sit alongside the Favorites tab (low daily-use tab).

**Data model** (static, no backend needed in v1):
```ts
interface QuizQuestion {
  id: string;
  questionAr: string;
  options: string[];       // 4 options
  correctIndex: number;
  explanationAr: string;
  articleRef: string;
}
```

Scoring: 40 questions, 75% pass threshold (same as real Algerian theory test format).

### 1.4 Add missing violation fields
Two fields referenced in UI tooltips but absent from some violation records:
- `fineMax` — some violations have a range (e.g., 100,000–500,000 DZD for criminal articles); fill these in
- `prison` — already typed as optional string; populate for degree-4 and criminal violations

---

## Phase 2 — Backend & Database (1 week)

The Express server and Drizzle ORM are scaffolded but empty. This phase wires them up for the features that benefit most from a server.

### 2.1 Define the DB schema
**File:** `lib/db/src/schema/index.ts`

```ts
// Users (anonymous device-based, no auth required for MVP)
export const devices = pgTable("devices", {
  id: uuid("id").primaryKey().defaultRandom(),
  pushToken: text("push_token"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Violation log (server-side backup)
export const violationLogs = pgTable("violation_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  deviceId: uuid("device_id").references(() => devices.id),
  violationId: text("violation_id").notNull(),
  fine: integer("fine").notNull(),
  points: integer("points").notNull(),
  date: timestamp("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Legal news / law updates (admin-pushed content)
export const legalUpdates = pgTable("legal_updates", {
  id: uuid("id").primaryKey().defaultRandom(),
  titleAr: text("title_ar").notNull(),
  bodyAr: text("body_ar").notNull(),
  publishedAt: timestamp("published_at").defaultNow(),
  severity: text("severity").notNull(), // "info" | "warning" | "critical"
});
```

Run `pnpm --filter @workspace/db run push` after defining these.

### 2.2 Add API routes
**File:** `artifacts/api-server/src/routes/`

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/devices` | POST | Register device, receive UUID |
| `/api/devices/:id/log` | GET | Fetch backed-up violation log |
| `/api/devices/:id/log` | POST | Add entry to cloud log |
| `/api/legal-updates` | GET | Fetch latest law update cards |
| `/api/violations` | GET | Serve violation list (enables future hot-updates) |

### 2.3 Add to OpenAPI spec and regenerate
Update `lib/api-spec/openapi.yaml` with all new routes, then run:
```bash
pnpm --filter @workspace/api-spec run codegen
```
This regenerates the React Query hooks in `lib/api-client-react` and Zod schemas in `lib/api-zod` automatically.

### 2.4 Wire the app to the API (optional sync, offline-first)
**Strategy:** Keep `AsyncStorage` as the primary store. Add a background sync that mirrors the log to the server. Pattern:
1. App starts → load from `AsyncStorage` (instant, offline-safe)
2. If network available → POST any unsynced entries to `/api/devices/:id/log`
3. If app is freshly installed → GET `/api/devices/:id/log` to restore previous log

This gives users data recovery on reinstall without requiring an account.

---

## Phase 3 — Real AI Assistant (3–5 days)

### 3.1 Replace keyword search with an LLM call
The current assistant (`assistant.tsx`) does string matching against `legalKnowledge.ts`. Replace with a proper LLM.

**Recommended approach — Replit AI integration:**
- Use the `external_apis` skill to access an LLM (e.g., OpenAI GPT-4o-mini or a locally fine-tuned Arabic model)
- Send user message + a system prompt that injects the full `legalKnowledge.ts` content as context
- Stream the response using Server-Sent Events (SSE) from the Express server

**System prompt skeleton:**
```
أنت مساعد قانوني متخصص في قانون المرور الجزائري 09-26.
أجب فقط على الأسئلة المتعلقة بالمرور والسياقة في الجزائر.
استشهد دائماً بأرقام المواد القانونية عند الإجابة.
لا تُفتِ في مسائل قانونية خارج نطاق قانون المرور.

--- المعرفة القانونية ---
[injected legalKnowledge.ts content]
```

**Offline fallback:** If network is unavailable, fall back to the existing keyword search and display `وضع عدم الاتصال` clearly.

### 3.2 Add conversation history
Currently each message is stateless. Add a `messages: {role, content}[]` array to the assistant screen and include the last 6 turns in every API call for context continuity.

### 3.3 Fix the status indicator
- `متصل` only when the LLM API is reachable (HTTP 200 from `/api/assistant/health`)
- `غير متصل` when offline, with the keyword fallback active
- Remove the current `• Offline` hardcoded English substring entirely

---

## Phase 4 — Push Notifications for Law Updates (2–3 days)

### 4.1 Install Expo Notifications
```bash
pnpm --filter @workspace/traffic-law-dz add expo-notifications expo-device
```

### 4.2 Request permission and register token
On first launch (after a permission explanation dialog):
```ts
import * as Notifications from "expo-notifications";
const token = await Notifications.getExpoPushTokenAsync();
await api.registerDevice({ pushToken: token.data });
```

### 4.3 Send notifications from the backend
When a new `legalUpdates` row is inserted (via an admin endpoint), the server uses the Expo Push API:
```ts
await fetch("https://exp.host/--/api/v2/push/send", {
  method: "POST",
  body: JSON.stringify({
    to: deviceTokens,
    title: "تحديث قانوني جديد",
    body: update.titleAr,
    data: { updateId: update.id },
  }),
});
```

### 4.4 Wire the bell icon
Replace the non-functional bell in the tab bar with a navigation target that opens the `legalUpdates` list fetched from `/api/legal-updates`. Badge the icon with the count of unread updates.

---

## Phase 5 — Android Build Pipeline (2–3 days)

### 5.1 Install EAS CLI
```bash
npm install -g eas-cli
eas login
```

### 5.2 Configure EAS build profiles
**File:** `artifacts/traffic-law-dz/eas.json`
```json
{
  "cli": { "version": ">= 10.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "android": { "buildType": "app-bundle" }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

### 5.3 Generate a keystore
```bash
cd artifacts/traffic-law-dz
eas credentials
```
Select Android → Generate new keystore. EAS manages it securely on Expo servers. **Never commit the keystore file.**

### 5.4 Build a preview APK for testing
```bash
eas build --platform android --profile preview
```
This produces a downloadable `.apk` for sideloading on test devices.

### 5.5 Build a production AAB for Play Store
```bash
eas build --platform android --profile production
```
Output: `.aab` file, required by Google Play.

### 5.6 Update `app.json` for production
Ensure these are set correctly before the production build:
```json
{
  "expo": {
    "runtimeVersion": { "policy": "appVersion" },
    "updates": {
      "url": "https://u.expo.dev/<your-project-id>",
      "enabled": true,
      "fallbackToCacheTimeout": 0
    }
  }
}
```
This enables EAS Update (OTA updates) so you can push content/law changes without a full Play Store re-submission.

---

## Phase 6 — Play Store Submission (3–5 days)

### 6.1 Create a Google Play Console account
- Cost: $25 one-time registration fee
- URL: https://play.google.com/console
- Use a business/personal Google account dedicated to the app

### 6.2 Required store assets
| Asset | Specification |
|-------|--------------|
| App icon | 512×512 px, PNG, no alpha |
| Feature graphic | 1024×500 px, JPG or PNG |
| Phone screenshots | Min 2, max 8 per form factor. 1080×1920 minimum |
| Short description | Max 80 characters (Arabic) |
| Full description | Max 4000 characters (Arabic + French summary) |

### 6.3 Privacy Policy (mandatory)
Google Play requires a publicly accessible privacy policy URL for any app. Minimum content:
- What data is collected (violation log, device ID, optional push token)
- Where it is stored (local device + your server)
- No data is sold to third parties
- Contact email for deletion requests

Host it at a simple URL (e.g., GitHub Pages or your production domain). Add the URL to both the Play Console and the app's Settings screen.

### 6.4 Content rating questionnaire
In Play Console → Content rating → answer the IARC questionnaire. For a legal reference app with no user-generated content, violence, or gambling, the expected rating is **Everyone (E)**.

### 6.5 App category and tags
- Category: **Education**
- Tags: traffic law, Algeria, code de la route, مرور, رخصة القيادة

### 6.6 Target audience
- Primary: Algeria (DZ) — but do **not** restrict distribution; Algerians abroad will also use it
- Language targeting: Arabic (ar-DZ), French (fr-DZ)

### 6.7 Initial release track
1. **Internal testing** → share with up to 100 testers by email
2. **Closed testing (Alpha)** → broader group, gather feedback
3. **Open testing (Beta)** → public opt-in, app appears in search with "Early access" badge
4. **Production** → full rollout; start at 10–20% staged rollout to catch crashes

---

## Phase 7 — Post-Launch (ongoing)

### 7.1 Crash reporting
Install `expo-updates` and connect to **Sentry** (free tier):
```bash
pnpm --filter @workspace/traffic-law-dz add @sentry/react-native
```
This gives you stack traces, device info, and crash rates from real users.

### 7.2 Analytics (privacy-respecting)
Avoid Google Analytics (GDPR/privacy concerns in Algeria). Use **Expo Analytics** or **PostHog** (self-hostable, open-source):
- Track: screen views, quiz completion rate, most-searched violations, assistant query volume
- Do not track: personal data, device identifiers without consent

### 7.3 OTA law updates with EAS Update
When law 09-26 is amended (new fines, new articles), you can push a JS bundle update without waiting for Play Store review:
```bash
eas update --branch production --message "تحديث غرامات 2026"
```
The app downloads the new bundle silently in the background and applies it on next launch.

### 7.4 App rating prompt
After 3 uses of the violation log or 5 quiz completions, prompt the user to rate the app:
```bash
pnpm --filter @workspace/traffic-law-dz add expo-store-review
```
```ts
import * as StoreReview from "expo-store-review";
if (await StoreReview.hasAction()) StoreReview.requestReview();
```

### 7.5 Localisation into French
A significant portion of Algerian drivers are French-dominant. Add a language toggle in Settings and provide French translations of all strings. Use `i18n-js` or `expo-localization` + `i18next`.

---

## Recommended Build Order

```
Week 1   Phase 0 (immediate fixes) + Phase 1.1–1.2 (content expansion)
Week 2   Phase 1.3 (quiz screen) + Phase 2.1–2.3 (DB schema + API routes)
Week 3   Phase 2.4 (app ↔ API sync) + Phase 3 (real AI assistant)
Week 4   Phase 4 (push notifications) + Phase 5 (EAS build pipeline)
Week 5   Phase 6 (Play Store submission + internal testing)
Week 6+  Phase 7 (post-launch monitoring and iteration)
```

---

## Technical Debt to Address Before Production

| Item | Location | Fix |
|------|----------|-----|
| Silent `catch {}` everywhere | `useViolationLog.ts`, `AppContext.tsx` | Log errors to Sentry, show user-facing toast |
| `genId()` uses `Math.random()` | `useViolationLog.ts:31` | Use `crypto.randomUUID()` or `expo-crypto` |
| No input validation on speed calculator | `calculator.tsx` | Add min/max guards (0–300 km/h) |
| `AsyncStorage` JSON.parse without try/catch typed validation | Multiple hooks | Validate with Zod on read |
| Assistant `scrollToEnd` may misfire on Android keyboard | `assistant.tsx` | Use `KeyboardAvoidingView` + `behavior="padding"` on Android |
| No loading skeleton on violations list | `violations.tsx` | Add `ActivityIndicator` / skeleton for first paint |

---

## Environment Variables Needed for Production

| Variable | Where set | Purpose |
|----------|-----------|---------|
| `DATABASE_URL` | Replit secret (already set) | Postgres connection |
| `EXPO_PUBLIC_DOMAIN` | Replit secret | API base URL for the app |
| `OPENAI_API_KEY` | Replit secret | LLM calls for assistant (Phase 3) |
| `EXPO_PUBLIC_EAS_PROJECT_ID` | `app.json` | EAS Update project binding |
| `SENTRY_DSN` | Replit secret | Crash reporting (Phase 7) |

---

*Last updated: May 2026*
