// Inline SVG icons copied from eand-dark-assistant/index.html.
const PATHS = {
  pin: <><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.8 3 2.8 15 0 18M12 3c-2.8 3-2.8 15 0 18" /></>,
  burger: <path d="M4 7h16M4 12h16M4 17h16" />,
  cart: <><path d="M3 4h2l2.4 11h10.2L20 7H6.2" /><circle cx="9" cy="19.5" r="1.3" /><circle cx="17" cy="19.5" r="1.3" /></>,
  profile: <><circle cx="12" cy="8.5" r="3.8" /><path d="M4.5 20c.9-3.6 3.9-5.8 7.5-5.8s6.6 2.2 7.5 5.8" /></>,
  up: <path d="M12 20V4M5 11l7-7 7 7" />,
  down: <path d="M12 4v16M5 13l7 7 7-7" />,
  arrow: <path d="M7 17 17 7M8 7h9v9" />,
  minus: <path d="M5 12h14" />,
  plus: <path d="M12 5v14M5 12h14" />,
  bubble: <path d="M20 12.5a7.5 7.5 0 0 1-11.2 6.5L4 20l1.1-4.3A7.5 7.5 0 1 1 20 12.5z" />,
  chat: <><path d="M20 12.5a7.5 7.5 0 0 1-11.2 6.5L4 20l1.1-4.3A7.5 7.5 0 1 1 20 12.5z" /><circle cx="9" cy="12.5" r=".6" fill="#fff" /><circle cx="12.5" cy="12.5" r=".6" fill="#fff" /><circle cx="16" cy="12.5" r=".6" fill="#fff" /></>,
  download: <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  reset: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></>,
  chevron: <path d="M6 9l6 6 6-6" />,
  send: <path d="M5 12h14M13 6l6 6-6 6" />,
};

export default function Icon({ name, size, ...props }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={size ? { width: size, height: size } : undefined} {...props}>{PATHS[name]}</svg>;
}
