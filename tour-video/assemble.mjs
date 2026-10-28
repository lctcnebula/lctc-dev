// Joins clips/<id>.mp4 with audio/<id>.m4a into scenes/, then one final MP4.
// Usage: node assemble.mjs <output.mp4>
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const out = process.argv[2] ?? "lctc-foundation-tour.mp4";
const scenes = JSON.parse(readFileSync("script.json", "utf8"));
const dur = JSON.parse(readFileSync("durations.json", "utf8"));
const PAD = 1.4, LEAD = 0.35, FADE = 0.35;
mkdirSync("scenes", { recursive: true });
const ff = args => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args]);

for (const s of scenes) {
  const len = dur[s.id] + PAD;
  ff([
    "-i", `clips/${s.id}.mp4`, "-i", `audio/${s.id}.m4a`,
    "-filter_complex",
    `[0:v]trim=0:${len},setpts=PTS-STARTPTS,fade=t=in:st=0:d=${FADE},fade=t=out:st=${(len - FADE).toFixed(2)}:d=${FADE}[v];` +
    `[1:a]adelay=${LEAD * 1000}|${LEAD * 1000},apad,atrim=0:${len},afade=t=out:st=${(len - 0.2).toFixed(2)}:d=0.2,aresample=48000[a]`,
    "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "19", "-r", "30", "-c:a", "aac", "-b:a", "192k", "-ac", "2",
    `scenes/${s.id}.mp4`,
  ]);
}
writeFileSync("concat.txt", scenes.map(s => `file 'scenes/${s.id}.mp4'`).join("\n"));
ff(["-f", "concat", "-safe", "0", "-i", "concat.txt", "-c", "copy", "-movflags", "+faststart", out]);
const total = +execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out]).toString();
console.log(out, `${Math.floor(total / 60)}:${String(Math.round(total % 60)).padStart(2, "0")}`);
