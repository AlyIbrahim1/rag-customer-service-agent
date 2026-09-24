import { pdfIndexOf } from "../../content";

// Menu / footer link. Labels that name a plan (e.g. "Emerald") open its PDF.
export default function MenuLink({ label, onOpenPdf }) {
  const pdf = pdfIndexOf(label);
  const open = pdf === undefined ? undefined : (event) => { event.preventDefault(); onOpenPdf(pdf); };
  return <a href="#" onClick={open}>{label}</a>;
}
