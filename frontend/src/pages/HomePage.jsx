import { useCallback, useEffect, useState } from "react";
import AppStrip from "../components/organisms/AppStrip";
import ChatWidget from "../components/organisms/ChatWidget";
import EntertainmentSection from "../components/organisms/EntertainmentSection";
import EShopBanner from "../components/organisms/EShopBanner";
import HeroSlider from "../components/organisms/HeroSlider";
import PdfViewer from "../components/organisms/PdfViewer";
import PlansSection from "../components/organisms/PlansSection";
import QuickLinks from "../components/organisms/QuickLinks";
import ReadAboutSection from "../components/organisms/ReadAboutSection";
import ServicesSection from "../components/organisms/ServicesSection";
import SiteFooter from "../components/organisms/SiteFooter";
import SiteHeader from "../components/organisms/SiteHeader";
import TopBar from "../components/organisms/TopBar";
import { I18N } from "../content";
import HomeTemplate from "../templates/HomeTemplate";

const langFromUrl = () => (/^#ar|[?&]lang=ar/.test(location.hash + location.search) ? "ar" : "en");

export default function HomePage() {
  const [lang, setLang] = useState(langFromUrl);
  const [pdf, setPdf] = useState({ index: 0, page: 1, source: false, isOpen: false });
  const [chatRequest, setChatRequest] = useState(null);
  const t = I18N[lang];
  const formatNumber = (n) => (lang === "ar" ? Number(n).toLocaleString("ar-EG") : String(n));

  // Language drives <html lang/dir>, the tab title, the URL hash and a short fade.
  useEffect(() => {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = lang === "ar" ? "إي آند مصر | الصفحة الرئيسيه" : "e& Egypt | Home Page";
    history.replaceState(null, "", lang === "ar" ? "#ar" : "#en");
    document.body.classList.remove("switching"); void document.body.offsetWidth; document.body.classList.add("switching");
  }, [lang]);

  useEffect(() => {
    const onHashChange = () => { if (location.hash === "#ar" || location.hash === "#en") setLang(location.hash.slice(1)); };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const openPdf = useCallback((index) => setPdf({ index, page: 1, source: false, isOpen: true }), []);
  const openSourcePdf = useCallback((index, page) => setPdf({ index, page, source: true, isOpen: true }), []);
  const closePdf = useCallback(() => setPdf((current) => ({ ...current, isOpen: false })), []);
  const askChat = useCallback((text) => setChatRequest({ text }), []);

  return <HomeTemplate
    topBar={<TopBar t={t} lang={lang} onToggleLang={() => setLang(lang === "en" ? "ar" : "en")} />}
    header={<SiteHeader t={t} onOpenPdf={openPdf} />}
    hero={<HeroSlider t={t} lang={lang} />}
    quickLinks={<QuickLinks t={t} />}
    sections={<>
      <PlansSection t={t} formatNumber={formatNumber} onOpenPdf={openPdf} />
      <ReadAboutSection t={t} />
      <ServicesSection t={t} />
      <EShopBanner t={t} />
      <EntertainmentSection t={t} />
    </>}
    appStrip={<AppStrip t={t} />}
    footer={<SiteFooter t={t} onOpenPdf={openPdf} />}
    overlays={<>
      <PdfViewer index={pdf.index} page={pdf.page} isOpen={pdf.isOpen} lang={pdf.source ? "en" : lang} t={t} formatNumber={formatNumber} onClose={closePdf} onAsk={askChat} />
      <ChatWidget t={t} request={chatRequest} onOpenPdf={openSourcePdf} />
    </>}
  />;
}
