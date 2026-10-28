# LCTC Foundation tour video

The latest render (not in git) is `lctc-foundation-tour.mp4` — 3:15, 1080p, OpenAI voice ("coral"), loudness-normalized. `lctc-foundation-tour-small.mp4` is a 1600px copy for sharing.
`lctc-foundation-tour-draft*.mp4` are the earlier macOS-voice drafts.

## Re-make it with the OpenAI voice

1. Serve the site's production build on port 3100:
   `cd .. && npx next build && npx next start -p 3100` (from the repo root)
2. In this folder (first time: `npm install`):
   `OPENAI_API_KEY=sk-... node tts.mjs` (writes audio/ and durations.json; uses gpt-4o-mini-tts, voice "coral")
3. `node record.mjs` (records every scene, each as long as its new voiceover)
4. `node assemble.mjs lctc-foundation-tour.mp4`
5. Normalize loudness (the OpenAI voice comes out quiet):
   `ffmpeg -i lctc-foundation-tour.mp4 -c:v copy -af loudnorm=I=-16:TP=-1.5:LRA=11 -c:a aac -b:a 192k final.mp4`

Edit the narration in `script.json`; scene actions live in `record.mjs`.
Recording uses fresh browser profiles, so nothing is saved into your own browser.
