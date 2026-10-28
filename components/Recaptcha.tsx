"use client";

import { useEffect, useRef } from "react";

// Google reCAPTCHA v2 ("I'm not a robot" checkbox). The site is front-end only, so the token is only checked for
// presence here; real spam protection needs a server that verifies it with the secret key.
// Set NEXT_PUBLIC_RECAPTCHA_SITE_KEY (from google.com/recaptcha/admin, v2 checkbox, with the site's domains added)
// to turn it on. Without a key nothing renders and forms don't ask for it.
export const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

type Grecaptcha = {
  render: (el: HTMLElement, o: { sitekey: string; callback: (t: string) => void; "expired-callback": () => void }) => number;
};
declare global { interface Window { grecaptcha?: Grecaptcha; lctcRecaptchaReady?: () => void } }

let loading: Promise<Grecaptcha> | null = null;
function load() {
  return loading ??= new Promise(resolve => {
    window.lctcRecaptchaReady = () => resolve(window.grecaptcha!);
    const s = document.createElement("script");
    s.src = "https://www.google.com/recaptcha/api.js?onload=lctcRecaptchaReady&render=explicit";
    s.async = true;
    document.head.appendChild(s);
  });
}

export default function Recaptcha({ onChange }: { onChange: (token: string) => void }) {
  return SITE_KEY ? <Widget onChange={onChange} /> : null;
}

function Widget({ onChange }: { onChange: (token: string) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const id = useRef<number | null>(null);
  const cb = useRef(onChange);
  cb.current = onChange;

  useEffect(() => {
    let live = true;
    load().then(g => {
      if (!live || !box.current || id.current !== null) return;
      id.current = g.render(box.current, { sitekey: SITE_KEY, callback: t => cb.current(t), "expired-callback": () => cb.current("") });
    });
    return () => { live = false; };
  }, []);

  return <div className="recaptcha" ref={box} />;
}
