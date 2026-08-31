export default function Button({ variant = "default", className = "", type = "button", ...props }) {
  return <button {...props} type={type} className={`button button--${variant} ${className}`.trim()} />;
}
