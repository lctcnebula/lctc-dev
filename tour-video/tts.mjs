// Voiceover per scene. Uses OpenAI TTS when OPENAI_API_KEY is set, otherwise macOS `say` (draft voice).
// Writes audio/<id>.m4a and durations.json.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const scenes = JSON.parse(readFileSync("script.json", "utf8"));
const key = process.env.OPENAI_API_KEY;
mkdirSync("audio", { recursive: true });
const durations = {};

for (const s of scenes) {
  const out = `audio/${s.id}.m4a`;
  if (key) {
    const r = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts", voice: "coral", input: s.text, response_format: "mp3",
        instructions: "Warm, confident narrator for a nonprofit website tour. Friendly, clear, medium pace.",
      }),
    });
    if (!r.ok) throw new Error(`OpenAI TTS failed for ${s.id}: ${r.status} ${await r.text()}`);
    writeFileSync(`audio/${s.id}.mp3`, Buffer.from(await r.arrayBuffer()));
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", `audio/${s.id}.mp3`, "-c:a", "aac", "-b:a", "192k", out]);
  } else {
    execFileSync("say", ["-v", "Samantha", "-r", "175", "-o", `audio/${s.id}.aiff`, s.text]);
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", `audio/${s.id}.aiff`, "-c:a", "aac", "-b:a", "192k", out]);
  }
  durations[s.id] = +execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out]).toString().trim();
  console.log(s.id, durations[s.id].toFixed(1) + "s");
}
writeFileSync("durations.json", JSON.stringify(durations, null, 2));
console.log("total", Object.values(durations).reduce((a, b) => a + b, 0).toFixed(1) + "s", key ? "(OpenAI)" : "(draft: macOS say)");
