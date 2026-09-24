import { useEffect, useState } from "react";
import Icon from "../atoms/Icon";
import { IMG } from "../../content";

// Vertical hero carousel: copy on the left, main image with peeks of the
// previous/next slides, arrows + dots on the right. Auto-advances every 6s.
export default function HeroSlider({ t, lang }) {
  const slides = t.slides;
  const [current, setCurrent] = useState(1);
  const show = (i) => setCurrent((i + slides.length) % slides.length);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [current, slides.length]);

  const slide = slides[current];
  // Arabic slide shown in the English layout stays left-aligned, like eand.com.eg.
  const mixed = slide.ar && lang === "en";
  const mixedProps = mixed ? { dir: "rtl", style: { textAlign: "left" } } : {};

  return <section className="hero">
    <div className="container">
      <div className="hero-copy">
        <div key={`${lang}-${current}`} className={`fade${mixed ? " ar-font" : ""}`}>
          <h1 {...mixedProps} dangerouslySetInnerHTML={{ __html: slide.title }} />
          <p {...mixedProps} dangerouslySetInnerHTML={{ __html: slide.text }} />
          {slide.icons && <div className="hero-icons"><img src={IMG.viu} alt="Viu" /><img src={IMG.twist} alt="Twist Music" /></div>}
          {!slide.noBtn && <a href="#" className="btn-details">{t.details}</a>}
        </div>
      </div>
      <div className="stage">
        <div className="peek top"><img src={slides[(current - 1 + slides.length) % slides.length].img} alt="" /></div>
        <div className="main"><img key={slide.img} src={slide.img} alt="" /></div>
        <div className="peek bot"><img src={slides[(current + 1) % slides.length].img} alt="" /></div>
      </div>
      <div className="hero-ctrl">
        <button aria-label="Previous" onClick={() => show(current - 1)}><Icon name="up" className="ico" size={26} /></button>
        <div className="dots">{slides.map((_, i) => <span key={i} className={i === current ? "on" : undefined} onClick={() => show(i)} />)}</div>
        <button aria-label="Next" onClick={() => show(current + 1)}><Icon name="down" className="ico" size={26} /></button>
      </div>
    </div>
  </section>;
}
