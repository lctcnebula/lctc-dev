import { jsPDF } from "jspdf";
import { applicationRows, type Application, type Lists } from "./application";
import { site } from "./content";

// Builds the student's copy of their grant application as a PDF, entirely in the browser.
// Loaded on demand from the "Download a copy" button so jsPDF stays out of the page bundle.

// The logo file is print-size; scaling it down first keeps the PDF to a few hundred KB instead of several MB.
async function logoData() {
  try {
    const img = new Image();
    img.src = "/assets/logo.png";
    await img.decode();
    const c = Object.assign(document.createElement("canvas"), { width: 540, height: Math.round(540 * img.height / img.width) });
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/png");
  } catch { return ""; }
}

export async function downloadApplicationPdf(a: Application, programs: Lists["programs"]) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), M = 54, inner = W - M * 2;
  const blue: [number, number, number] = [1, 89, 152], muted: [number, number, number] = [96, 108, 122];
  let y = M;

  const room = (h: number) => { if (y + h > H - M) { doc.addPage(); y = M; } };

  const logo = await logoData();
  if (logo) { doc.addImage(logo, "PNG", M, y, 180, 180 * 483 / 1781); y += 180 * 483 / 1781 + 22; }

  doc.setFont("helvetica", "bold").setFontSize(16).setTextColor(...blue);
  doc.text("Student Grant Application", M, y); y += 18;
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(...muted);
  doc.text(`${site.name} · Applicant copy`, M, y); y += 14;
  doc.setDrawColor(...blue).setLineWidth(1.5).line(M, y, W - M, y); y += 22;

  const labelW = 130;
  for (const [k, v] of applicationRows(a, programs)) {
    const lines = doc.setFontSize(10.5).splitTextToSize(v, inner - labelW) as string[];
    room(lines.length * 14 + 6);
    doc.setFont("helvetica", "bold").setTextColor(...muted).text(k.toUpperCase(), M, y);
    doc.setFont("helvetica", "normal").setTextColor(20, 30, 40).text(lines, M + labelW, y);
    y += lines.length * 14 + 6;
  }

  y += 10; room(40);
  doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(...blue).text("Essay", M, y); y += 16;
  doc.setFont("helvetica", "normal").setFontSize(10.5).setTextColor(20, 30, 40);
  for (const line of doc.splitTextToSize(a.essay.trim(), inner) as string[]) { room(15); doc.text(line, M, y); y += 15; }

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i).setFontSize(8.5).setTextColor(...muted);
    doc.text(`${a.id} · Page ${i} of ${pages}`, W - M, H - 30, { align: "right" });
  }
  doc.save(`${a.id}.pdf`);
}
