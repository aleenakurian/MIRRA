export default function InsightsCard({ insights }) {
  if (!insights) return null;

  return (
    <div
      className="card"
      style={{
        marginTop: "20px",
        animation: "fadeIn 0.4s ease"
      }}
    >
      <div className="title">📊 Your Impact</div>

      <div style={{ marginTop: "10px" }}>
        ⏱️ Time saved: <b>{insights.time_saved_minutes} mins</b>
      </div>

      <div>
        ✅ Accepted: <b>{insights.accepted}</b>
      </div>

      <div>
        ❌ Rejected: <b>{insights.rejected}</b>
      </div>

      <div>
        ✏️ Modified: <b>{insights.modified}</b>
      </div>

      <div style={{ marginTop: "10px" }}>
        📈 Acceptance rate:{" "}
        <b>
          {insights.accepted + insights.rejected > 0
            ? Math.round(
                (insights.accepted /
                  (insights.accepted + insights.rejected)) *
                  100
              )
            : 0}
          %
        </b>
      </div>
    </div>
  );
}