import { ConfettiButton, DonateButton } from "./Actions";

export default function GiveCta() {
  return (
    <div className="cta reveal">
      <div>
        <h2>Every gift counts, any size</h2>
        <p>Your gift puts scholarships, tools and certifications in the hands of Lake County students. Give once, monthly or yearly, and every gift gets a little confetti.</p>
      </div>
      <div className="hero-actions" style={{ marginTop: 0 }}>
        <DonateButton className="btn solid">Make your gift today</DonateButton>
        <ConfettiButton>Throw confetti 🎉</ConfettiButton>
      </div>
    </div>
  );
}
