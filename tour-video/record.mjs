// Records one clip per scene from the local site (http://localhost:3000), each as long as its voiceover.
// Every scene gets a fresh browser context, so nothing is saved into anyone's real browser storage.
// Usage: node record.mjs [sceneId ...]
import { chromium } from "playwright";
import { mkdirSync, readFileSync, renameSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";

const BASE = "http://localhost:3100"; // production build: no dev overlay, no compile pauses
const W = 1600, H = 900, PAD = 1.4; // seconds of breathing room after each line
const durations = JSON.parse(readFileSync("durations.json", "utf8"));
const only = process.argv.slice(2);
const EXE = `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;

// A visible cursor with a click pulse (headless video has no pointer of its own).
const CURSOR = `
addEventListener("DOMContentLoaded", () => {
  const c = document.createElement("div");
  c.style.cssText = "position:fixed;left:0;top:0;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;background:rgba(255,138,61,.85);border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.35);z-index:2147483647;pointer-events:none;transition:transform .15s;transform:translate(-100px,-100px)";
  document.documentElement.appendChild(c);
  let x = -100, y = -100;
  addEventListener("mousemove", e => { x = e.clientX; y = e.clientY; c.style.transform = "translate(" + x + "px," + y + "px)"; }, true);
  addEventListener("mousedown", () => { c.style.transform = "translate(" + x + "px," + y + "px) scale(.7)"; }, true);
  addEventListener("mouseup", () => { c.style.transform = "translate(" + x + "px," + y + "px)"; }, true);
});`;

const sleep = ms => new Promise(r => setTimeout(r, ms));

function helpers(page) {
  let mx = W / 2, my = H / 2;
  const h = {
    async go(path) { await page.goto(BASE + path, { waitUntil: "load", timeout: 30000 }); await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {}); await sleep(500); },
    async scrollTo(y, ms = 1500) {
      await page.evaluate(([y, ms]) => new Promise(done => {
        const s = scrollY, d = (typeof y === "number" ? y : document.querySelector(y).getBoundingClientRect().top + scrollY - 110) - s, t0 = performance.now();
        const step = t => { const k = Math.min(1, (t - t0) / ms), e = k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2; scrollTo(0, s + d * e); k < 1 ? requestAnimationFrame(step) : done(); };
        requestAnimationFrame(step);
      }), [y, ms]);
    },
    async scrollBy(dy, ms = 1500) { const y = await page.evaluate(() => scrollY); await h.scrollTo(y + dy, ms); },
    async move(x, y, steps = 25) { await page.mouse.move(x, y, { steps }); mx = x; my = y; },
    async point(loc) { const l = typeof loc === "string" ? page.locator(loc).first() : loc; await l.scrollIntoViewIfNeeded(); const b = await l.boundingBox(); if (b) await h.move(b.x + b.width / 2, b.y + b.height / 2); return l; },
    async click(loc, after = 500) { const l = await h.point(loc); await sleep(250); await l.click(); await sleep(after); },
    async type(loc, text) { const l = await h.point(loc); await l.click(); await page.keyboard.type(text, { delay: 45 }); },
    page,
  };
  // DEBUG=1 logs any action that takes over 1.5s, to find steps that stall.
  if (process.env.DEBUG) for (const k of ["click", "point", "type", "scrollTo"]) {
    const f = h[k];
    h[k] = async (...a) => { const t = Date.now(); try { return await f(...a); } finally { const d = Date.now() - t; if (d > 1500 + (typeof a[1] === "number" ? a[1] : 0)) console.log("  slow", k, String(a[0]).slice(0, 60), d + "ms"); } };
  }
  return h;
}

const title = (big, small) => `<html><body style="margin:0;height:100vh;display:grid;place-items:center;background:linear-gradient(135deg,#0A2540,#015998);font-family:system-ui,sans-serif;color:#F4F7FB;text-align:center">
<div><div style="display:inline-block;background:#fff;border-radius:22px;padding:22px 30px;margin-bottom:44px"><img src="${BASE}/assets/logo.png" style="width:440px;display:block"></div>
<div style="font:italic 800 76px/1.05 Impact,'Arial Narrow',sans-serif;text-transform:uppercase;letter-spacing:1px">${big}</div>
<div style="margin-top:22px;font-size:30px;letter-spacing:8px;text-transform:uppercase;color:#FFC79E">${small}</div></div></body></html>`;

// Each scene gets the page already loaded at its starting point; `run` fills the clip's time.
const scenes = {
  "01-title": { start: async h => { await h.page.setContent(title("Lake County Tech Campus Foundation", "Skills · Success · Future")); await sleep(600); }, run: async () => {} },
  "02-home": {
    start: h => h.go("/"),
    run: async h => { await sleep(2500); await h.scrollBy(950, 3500); await sleep(2500); await h.scrollBy(900, 3500); await sleep(2000); await h.scrollTo(".paths", 3000); await h.point(".paths .path:nth-child(2)"); },
  },
  "03-donate": {
    start: h => h.go("/donate"),
    run: async h => {
      const p = h.page;
      await sleep(1000); await h.scrollTo("#give", 2000); await sleep(500);
      await h.point(".gift-option:nth-child(1)"); await sleep(1200); await h.point(".gift-option:nth-child(2)"); await sleep(1000);
      await h.scrollBy(260, 1200); await h.point(".gift-option:nth-child(6)"); await sleep(600); await h.scrollBy(260, 1200); await h.point(".gift-option:nth-child(10)"); await sleep(1500);
      await h.click(".gift-option:nth-child(6)", 1600);
      await h.click('button[aria-label="One more"]', 900); await h.click('button[aria-label="One more"]', 1200);
      await h.click('label.choice:has-text("In honor of someone")', 900);
      await h.type("#d-who", "Rosa Diaz"); await sleep(400); await h.click('.occasions button:has-text("graduation")', 1400);
      await h.click('button.pay:has-text("Continue")', 1400);
      await h.click('button.demo-fill', 1200);
      await h.click('button[type=submit].pay', 4200);
    },
  },
  "04-programs": {
    start: h => h.go("/programs"),
    run: async h => { await sleep(1200); await h.scrollTo(".paths", 1800); await sleep(800); await h.scrollBy(600, 3200); await sleep(600); await h.click('a.path[href="/programs/cybersecurity"]', 1500); await h.scrollBy(500, 2200); },
  },
  "05-events": {
    start: h => h.go("/events"),
    run: async h => { await sleep(1200); await h.scrollBy(600, 2200); await h.click('a[href="/events/meet-the-mission-november-2026"]', 1500); await h.scrollTo("form.rsvp", 1800); await h.click("form.rsvp .demo-fill", 900); await h.click('form.rsvp button[type=submit]', 2500); },
  },
  "06-blog": {
    start: h => h.go("/blog"),
    run: async h => { await sleep(1000); await h.scrollBy(550, 2000); await h.click('a[href="/blog/save-the-date-fall-donor-reception"]', 1500); await h.scrollBy(600, 2600); },
  },
  "07-board": {
    start: h => h.go("/board"),
    run: async h => { await sleep(1200); await h.scrollBy(650, 2600); await sleep(800); await h.scrollBy(500, 2200); await h.click('a[href="/board/sebastian-kapala"]', 1800); },
  },
  "08-apply": {
    start: h => h.go("/apply"),
    run: async h => {
      await sleep(500); await h.scrollTo(".form-card", 1200); await h.click(".demo-fill", 800);
      for (let i = 0; i < 3; i++) await h.click('.form-card form button[type=submit]', 700);
      await h.click('.form-card form button[type=submit]', 1000);
      await h.point('button:has-text("Download PDF")');
    },
  },
  "09-alumni": {
    start: h => h.go("/alumni"),
    run: async h => { await sleep(600); await h.scrollTo(".alumni-grid", 1500); await sleep(2200); await h.scrollTo("form.form-card", 1800); await h.point("#al-photo"); },
  },
  "10-admin": {
    start: h => h.go("/login"),
    run: async h => {
      const p = h.page;
      await sleep(600); await h.click('.demo-box button:has-text("admin@lctc.demo") >> nth=1', 900);
      await h.click('form button[type=submit]', 2600);
      await h.scrollBy(500, 2000); await sleep(800); await h.scrollTo(0, 1000);
      await h.click('.admin-nav a[href="/admin/donations"]', 2600);
      await h.click('.admin-nav a[href="/admin/applications"]', 2400);
      await h.click('.admin-nav a[href="/admin/events"]', 2200);
      await h.click('.admin-nav a[href="/admin/board"]', 2200);
      await h.click('.admin-nav a[href="/admin/reports"]', 1800);
    },
  },
  "11-outro": { start: async h => { await h.page.setContent(title("Give a student their start", "Lake County Tech Campus Foundation")); await sleep(600); }, run: async () => {} },
};

mkdirSync("clips", { recursive: true });
const browser = await chromium.launch({ executablePath: EXE });
for (const [id, sc] of Object.entries(scenes)) {
  if (only.length && !only.includes(id)) continue;
  const total = (durations[id] + PAD) * 1000;
  rmSync("raw", { recursive: true, force: true });
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, recordVideo: { dir: "raw", size: { width: W, height: H } }, reducedMotion: "no-preference" });
  await ctx.addInitScript(CURSOR);
  const page = await ctx.newPage();
  page.setDefaultTimeout(5000);
  const t0 = Date.now();
  const h = helpers(page);
  await sc.start(h);
  await h.move(W * .55, H * .55, 1);
  const tStart = Date.now();
  try { await sc.run(h); } catch (e) { console.warn(id, "action failed:", e.message.split("\n")[0]); }
  const left = total - (Date.now() - tStart);
  if (left > 0) await sleep(left);
  const video = page.video();
  await ctx.close();
  const raw = await video.path();
  const skip = ((tStart - t0) / 1000).toFixed(2);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-ss", skip, "-i", raw, "-t", (total / 1000).toFixed(2), "-vf", "fps=30,scale=1920:1080:flags=lanczos", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", `clips/${id}.mp4`]);
  console.log(id, "recorded", (total / 1000).toFixed(1) + "s", left < 0 ? `(actions ran ${(-left / 1000).toFixed(1)}s long)` : "");
}
await browser.close();
