# Launch Plan and Monetization Checklist

## Phase 1: PWA Validation (No Ads)
### Checklist
- Gameplay loop stable (no critical bugs, tutorial clear on first run).
- Cross-device UX validated in mobile browsers (iOS Safari + Android Chrome).
- Telemetry events captured: session_start, session_end, run_start, run_end, score, tier_reached, unlock_event, theme_selected.
- Privacy policy published; analytics disclosure added (if analytics enabled).

### Implementation Plan
1) Instrument analytics with minimal, privacy-safe events.
2) Validate onboarding (first-run tutorial, pause flow, reset flow).
3) Confirm performance and input reliability on target devices.
4) Collect retention data (D1/D7), session length, completion rate.

## Phase 2: Capacitor + Rewarded Ads (Mediation)
### Checklist
- Capacitor iOS/Android builds compile and run on devices.
- Rewarded ads are opt-in only, with cooldown + session caps.
- Mediation configured (AdMob + Unity + ironSource + AppLovin).
- GDPR/CCPA consent and iOS ATT prompt implemented.

### Implementation Plan
1) Wrap web app with Capacitor and validate lifecycle (pause/resume, audio).
2) Add rewarded ads at game-over and revive points.
3) Cap rewards: 1 per run, 3 per session, 60–90s cooldown.
4) Configure mediation and monitor fill rate + eCPM.

## Phase 3: IAP for Cosmetics/Themes
### Checklist
- StoreKit 2 + Google Play Billing v6+ verified.
- “Earnable + unlock early” model implemented for themes.
- Restore purchases, receipt validation, and error states tested.

### Implementation Plan
1) Define cosmetic packs (themes, rails, particles) and pricing.
2) Implement store UI with previews and locked states.
3) Wire IAP flow + restore; validate receipts server-side if needed.
4) Monitor conversion and adjust pricing/placement.
