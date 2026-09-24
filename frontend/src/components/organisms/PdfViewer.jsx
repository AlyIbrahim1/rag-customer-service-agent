import { useEffect, useRef, useState } from "react";
import Icon from "../atoms/Icon";
import { PLAN_FILES, planPdf } from "../../content";

// Plan PDF dialog. Pages are drawn to <canvas> with pdf.js (loaded as a global
// script in index.html); if pdf.js fails, the browser's own viewer is used.
export default function PdfViewer({ index, page = 1, isOpen, lang, t, formatNumber, onClose, onAsk }) {
  const [status, setStatus] = useState("loading"); // loading | ready | iframe
  const [numPages, setNumPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [renderTick, setRenderTick] = useState(0);
  const dialogRef = useRef(null);
  const pagesRef = useRef(null);
  const canvasHostRef = useRef(null);
  const closeRef = useRef(null);
  const docRef = useRef(null);
  const P = t.pdf;
  const info = index < 4 ? t.plans[index] : t.dataLine;
  const src = planPdf(index, lang);
  const initialPage = Number.isInteger(page) && page > 0 ? page : 1;

  // Load the PDF whenever the dialog opens or the plan/language changes.
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setStatus("loading"); setNumPages(0); setZoom(1);
    const lib = window.pdfjsLib;
    if (!lib) { setStatus("iframe"); return; }
    lib.GlobalWorkerOptions.workerSrc = "/vendor/pdfjs/pdf.worker.min.js";
    const task = lib.getDocument({ url: src });
    task.promise.then((doc) => {
      if (cancelled) return;
      docRef.current = doc;
      setNumPages(doc.numPages);
      setStatus("ready");
    }).catch((error) => {
      if (cancelled) return;
      console.warn("[pdf] pdf.js unavailable, using browser viewer:", error);
      setStatus("iframe");
    });
    return () => { cancelled = true; docRef.current = null; task.destroy(); };
  }, [isOpen, src]);

  // Draw every page, re-drawing on zoom and (debounced) window resize.
  useEffect(() => {
    if (status !== "ready") return;
    const doc = docRef.current, host = canvasHostRef.current;
    let cancelled = false;
    (async () => {
      host.replaceChildren();
      pagesRef.current.scrollTop = 0;
      const targetPage = Math.min(initialPage, doc.numPages);
      const avail = pagesRef.current.clientWidth - 44;
      for (let n = 1; n <= doc.numPages; n++) {
        const page = await doc.getPage(n);
        if (cancelled) return;
        const base = page.getViewport({ scale: 1 });
        const vp = page.getViewport({ scale: Math.min(avail / base.width, 1.6) * zoom });
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(vp.width * dpr); canvas.height = Math.floor(vp.height * dpr);
        canvas.style.width = `${Math.floor(vp.width)}px`; canvas.style.height = `${Math.floor(vp.height)}px`;
        canvas.setAttribute("role", "img"); canvas.setAttribute("aria-label", `${info.name} — ${n}/${doc.numPages}`);
        host.appendChild(canvas);
        await page.render({ canvasContext: canvas.getContext("2d"), viewport: vp, transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null }).promise;
        if (cancelled) return;
        if (n === targetPage && n > 1) {
          const viewport = pagesRef.current;
          viewport.scrollTop += canvas.getBoundingClientRect().top - viewport.getBoundingClientRect().top - parseFloat(getComputedStyle(viewport).paddingTop);
        }
      }
    })().catch((error) => console.warn("[pdf] render failed:", error));
    return () => { cancelled = true; };
  }, [status, zoom, renderTick, info.name, initialPage]);

  useEffect(() => {
    if (status !== "ready") return;
    let timer;
    const onResize = () => { clearTimeout(timer); timer = setTimeout(() => setRenderTick((n) => n + 1), 200); };
    window.addEventListener("resize", onResize);
    return () => { clearTimeout(timer); window.removeEventListener("resize", onResize); };
  }, [status]);

  // Dialog behaviour: lock page scroll, focus close button, restore focus,
  // Escape closes, Tab stays inside.
  useEffect(() => {
    if (!isOpen) return;
    const lastFocus = document.activeElement;
    document.body.classList.add("noscroll");
    const focusTimer = setTimeout(() => closeRef.current?.focus(), 50);
    function onKeyDown(event) {
      if (event.key === "Escape") { event.stopPropagation(); onClose(); }
      if (event.key === "Tab") {
        const focusable = [...dialogRef.current.querySelectorAll("button, a[href]")].filter((el) => el.offsetParent);
        if (!focusable.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      clearTimeout(focusTimer);
      document.body.classList.remove("noscroll");
      document.removeEventListener("keydown", onKeyDown, true);
      lastFocus?.focus();
    };
  }, [isOpen, onClose]);

  const changeZoom = (step) => setZoom((z) => Math.max(0.5, Math.min(3, z + step)));
  const zoomVisible = status === "ready" ? undefined : { visibility: "hidden" };

  return <div ref={dialogRef} className={`pdfm${isOpen ? " open" : ""}`} role="dialog" aria-modal="true" aria-labelledby="pdfTitle" aria-hidden={!isOpen} onClick={(event) => { if (event.target === dialogRef.current) onClose(); }}>
    <div className="box">
      <div className="bar">
        {info.img && <img src={info.img} alt="" />}
        <div className="ttl">
          <h3 id="pdfTitle">{info.name}</h3>
          <small>{P.sub}{numPages > 0 && ` · ${P.pages(numPages)}`} · <b>{t.from} {formatNumber(info.price)} {t.perMonth}</b></small>
        </div>
        <div className="zoom" style={zoomVisible}>
          <button type="button" aria-label={P.zoomOut} onClick={() => changeZoom(-0.25)}><Icon name="minus" className="ico" /></button>
          <span>{Math.round(zoom * 100)}%</span>
          <button type="button" aria-label={P.zoomIn} onClick={() => changeZoom(0.25)}><Icon name="plus" className="ico" /></button>
        </div>
        <div className="act">
          <button type="button" className="primary" onClick={() => { onClose(); onAsk(t.askAbout(info.name)); }}><Icon name="bubble" /><span>{P.ask}</span></button>
          <a href={src} download={`eand-${PLAN_FILES[index]}${lang === "ar" ? "-ar" : ""}.pdf`}><Icon name="download" /><span className="lbl">{P.download}</span></a>
          <button ref={closeRef} type="button" className="x" aria-label={P.close} title={P.close} onClick={onClose}><Icon name="x" strokeWidth="2.2" /></button>
        </div>
      </div>
      <div className="pages" ref={pagesRef}>
        {isOpen && status === "loading" && <div className="state"><div className="spin" /><div>{P.loading}</div></div>}
        {isOpen && status === "ready" && <div ref={canvasHostRef} style={{ display: "contents" }} />}
        {isOpen && status === "iframe" && <iframe title={info.name} src={`${src}#page=${initialPage}&view=FitH`} />}
      </div>
    </div>
  </div>;
}
