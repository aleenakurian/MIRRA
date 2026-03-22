import { useState } from "react";
import { sendFeedback } from "../services/api";

export default function RecommendationCard({ reco, profileId, refresh, status, onStatus }) {
  const [clicked, setClicked] = useState(false);
  const [loading, setLoading] = useState(false);

  const icons = {
    meal: "🍲",
    grocery: "🛒",
    work: "💼"
  };

  const handleAction = async (action, alt = null) => {
  if (loading) return;
  setLoading(true);
  setClicked(true);
  console.log("onStatus called:", reco.reco_id, action); // ← check this
  onStatus(reco.reco_id, action);
  try {
    await sendFeedback(profileId, reco.reco_id, action, alt);
    await refresh();
  } catch (err) {
    console.error("Feedback error:", err);
  }
  setLoading(false);
};

  return (
    <div
      className="card"
      style={{
        opacity: clicked ? 0.6 : 1,
        transform: clicked ? "scale(0.98)" : "scale(1)",
        transition: "all 0.2s ease"
      }}
    >
      <div className="title">
        {icons[reco.category]} {reco.title}
      </div>

      <p>{reco.default_action}</p>

      {reco.alternatives && (
        <div style={{ marginTop: "8px" }}>
          {reco.alternatives.map((alt, i) => (
            <button
              key={i}
              className="button reject"
              style={{ marginBottom: "6px" }}
              onClick={() => handleAction("modify", alt)}
              disabled={loading}
            >
              Try: {alt}
            </button>
          ))}
        </div>
      )}

      <div className="subtitle">
        {reco.justification?.explanation_text}
      </div>
      <br />

      <button
        className="button accept"
        onClick={() => handleAction("accept")}
        disabled={loading || !!status} // ← disable after any action
      >
        {status === "accept" ? "✓ Accepted" : "Accept"}
      </button>
      <button
        className="button reject"
        onClick={() => handleAction("reject")}
        disabled={loading || !!status} // ← disable after any action
      >
        {status === "reject" ? "✕ Rejected" : "Reject"}
      </button>
    </div>
  );
}