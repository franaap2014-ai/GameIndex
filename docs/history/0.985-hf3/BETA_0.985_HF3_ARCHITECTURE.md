# GameIndex Beta 0.985 HF3 — Visual & Media Recovery

Runtime identity: `0.985.3` · schema 27 · `LOCAL_FIRST_NO_API_KEY`.

## Visual system
Rebirth is now theme-aware instead of globally blue. Supported identities: FREE Dark, FREE Light, PRO Green, TESTER Blue, DEV Red, DEV Green, DEV Blue and CREATOR Tech. The desktop header uses fixed grid geometry so the GI mark, GameIndex wordmark and release badge share the same vertical center.

## Images
Image Engine 3 remains the only current image runtime. HF3 adds strict contextual title/source filtering and rejects physical merchandise, cosplay, event photos and real-person photos for game covers. Exact Wikipedia game-page discovery is preferred, then contextual Wikipedia/Commons discovery. Schema 27 invalidates HF2 IE3 cached revisions so previously accepted bad Roblox/Fortnite media is not reused.

## Audio
HF3 ships four original GameIndex WAV loops. Managed same-origin per-game audio still has priority. Built-in routing provides a general Rebirth track plus original Minecraft/Roblox/Fortnite-style GameIndex tracks. No commercial music is bundled.

## Intelligence
GI Core scripts remain authoritative. Dexter uses Ollama `gemma3:4b` as an optional semantic edge and the site remains usable with Ollama offline.
