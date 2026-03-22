export default function CyclePhaseCard({ profileId }) {

  // 🧠 Mock cycle mapping (based on your data)
  const cycleMap = {
    "MIRRA-F-0001": { phase: "Follicular", energy: "Rising energy, great for focus" },
    "MIRRA-F-0002": { phase: "Luteal", energy: "Lower energy, prioritize lighter tasks" }
  };

  const data = cycleMap[profileId];

  if (!data) return null;

  return (
    <div style={{
      padding: "12px",
      borderRadius: "12px",
      background: "#fff0f6",
      marginBottom: "12px"
    }}>
      🌸 <b>{data.phase} Phase</b>
      <div style={{ fontSize: "14px", marginTop: "4px" }}>
        {data.energy}
      </div>
    </div>
  );
}