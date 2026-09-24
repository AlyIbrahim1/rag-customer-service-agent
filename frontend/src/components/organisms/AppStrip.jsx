export default function AppStrip({ t }) {
  return <div className="appstrip"><div className="pill">
    <img className="l" src="/icons/my-eand-app.svg" alt="" />
    <span>{t.app}</span>
    <a href="#"><img src="/icons/badges/google-play.png" alt="Google Play" /></a>
    <a href="#"><img src="/icons/badges/app-store.png" alt="App Store" /></a>
  </div></div>;
}
