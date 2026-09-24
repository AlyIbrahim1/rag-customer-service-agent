// Two-line section heading: "Our" / "Plans" (second word indented).
export default function SectionTitle({ parts: [first, second] }) {
  return <h2 className="stitle">{first}<span>{second}</span></h2>;
}
