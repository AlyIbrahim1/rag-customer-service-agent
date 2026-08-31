export default function IconButton({ label, className = "", children, buttonRef, ...props }) {
  return <button {...props} ref={buttonRef} type="button" aria-label={label} title={label} className={`icon-button ${className}`.trim()}>{children}</button>;
}
