// Demo helper: one click fills a form with sample answers so it can be tried end to end. Remove before launch.
export default function DemoFill({ onFill, label = "Autofill sample answers" }: { onFill: () => void; label?: string }) {
  return (
    <button type="button" className="demo-fill" onClick={onFill}>
      <span aria-hidden="true">⚡</span> {label}
    </button>
  );
}
