export default function ThemeSelect({ value, onChange }) {
  return <label className="theme-select">Appearance<select value={value} onChange={(event) => onChange(event.target.value)}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label>;
}
