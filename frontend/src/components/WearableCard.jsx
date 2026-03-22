import { useEffect, useState } from "react";
import { getWearable, getFamily, getSelfcare } from "../services/api";

export default function WearableCard({ profileId }) {
  const [data, setData] = useState(null);
  const [family, setFamily] = useState(null);
  const [selfcare, setSelfcare] = useState(null);

  useEffect(() => {
    if (!profileId || profileId.startsWith("USER")) return;
    getWearable(profileId).then(res => setData(res.data)).catch(() => {});
    getFamily(profileId).then(res => setFamily(res.data)).catch(() => {});
    getSelfcare(profileId).then(res => setSelfcare(res.data)).catch(() => {});
  }, [profileId]);

  const stepsGoal = 10000;
  const stepsPercent = data ? Math.min((data.steps / stepsGoal) * 100, 100) : 0;

  const hasFamily = family?.dependents?.length > 0;
  const hasSelfcare = selfcare && Object.keys(selfcare).length > 0 && !hasFamily;

  if (!data && !hasFamily && !hasSelfcare) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

      {/* ── Activity card ── */}
      {data && data.steps !== null && (
        <div style={{
          background: "white", borderRadius: "16px", padding: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)", animation: "fadeIn 0.4s ease"
        }}>
          <div style={{ fontWeight: "600", fontSize: "15px", marginBottom: "12px" }}>
            📊 Today's Activity
          </div>
          <div style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
              <span>👟 Steps</span>
              <span style={{ fontWeight: "600" }}>{data.steps.toLocaleString()} / {stepsGoal.toLocaleString()}</span>
            </div>
            <div style={{ background: "#f0f0f0", borderRadius: "999px", height: "8px" }}>
              <div style={{
                width: `${stepsPercent}%`, height: "100%", borderRadius: "999px",
                background: "linear-gradient(135deg, #ff8fab, #ffc2d1)", transition: "width 0.6s ease"
              }} />
            </div>
          </div>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "#fff0f5", borderRadius: "10px", padding: "10px 12px"
          }}>
            <span style={{ fontSize: "13px" }}>🔥 Calories Burned</span>
            <span style={{ fontWeight: "700", fontSize: "16px", color: "#ff8fab" }}>
              {data.calories.toLocaleString()} kcal
            </span>
          </div>
        </div>
      )}

      {/* ── Family card (Aarohi) ── */}
      {hasFamily && (
        <div style={{
          background: "white", borderRadius: "16px", padding: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)", animation: "fadeIn 0.5s ease"
        }}>
          <div style={{ fontWeight: "600", fontSize: "15px", marginBottom: "12px" }}>🏠 Family Today</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {family.dependents.map((dep, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "8px", fontSize: "13px",
                padding: "8px 10px", background: "#fff0f5", borderRadius: "10px"
              }}>
                <span>{dep.type === "child" ? "🧒" : "👴"}</span>
                <span style={{ color: "#555" }}>
                  {dep.type === "child"
                    ? `Child (${dep.age}y) · ${dep.notes || "primary school"}`
                    : `Elder (${dep.age}y) · ${dep.notes || "needs care"}`}
                </span>
              </div>
            ))}
            {family.household_rules?.kid_homework_window && (
              <div style={{
                display: "flex", alignItems: "center", gap: "8px", fontSize: "13px",
                padding: "8px 10px", background: "#f0f7ff", borderRadius: "10px"
              }}>
                <span>📚</span>
                <span style={{ color: "#555" }}>Homework: <b>{family.household_rules.kid_homework_window}</b></span>
              </div>
            )}
            {family.household_rules?.weekday_dinner_time && (
              <div style={{
                display: "flex", alignItems: "center", gap: "8px", fontSize: "13px",
                padding: "8px 10px", background: "#fff8f0", borderRadius: "10px"
              }}>
                <span>🍽️</span>
                <span style={{ color: "#555" }}>Dinner at <b>{family.household_rules.weekday_dinner_time}</b></span>
              </div>
            )}
            {family.no_push_after && (
              <div style={{
                display: "flex", alignItems: "center", gap: "8px", fontSize: "13px",
                padding: "8px 10px", background: "#f5f0ff", borderRadius: "10px"
              }}>
                <span>🌙</span>
                <span style={{ color: "#555" }}>Quiet after <b>{family.no_push_after}</b></span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Selfcare card (Naina) ── */}
      {hasSelfcare && (
        <div style={{
          background: "white", borderRadius: "16px", padding: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)", animation: "fadeIn 0.5s ease"
        }}>
          <div style={{ fontWeight: "600", fontSize: "15px", marginBottom: "12px" }}>✨ Your Goals</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>

            {/* Wellbeing goals */}
            {selfcare.wellbeing_goals?.movement && (
              <div style={{
                display: "flex", alignItems: "center", gap: "8px", fontSize: "13px",
                padding: "8px 10px", background: "#fff0f5", borderRadius: "10px"
              }}>
                <span>🧘</span>
                <span style={{ color: "#555" }}>{selfcare.wellbeing_goals.movement}</span>
              </div>
            )}
            {selfcare.wellbeing_goals?.nutrition && (
              <div style={{
                display: "flex", alignItems: "center", gap: "8px", fontSize: "13px",
                padding: "8px 10px", background: "#fff8f0", borderRadius: "10px"
              }}>
                <span>🥗</span>
                <span style={{ color: "#555" }}>{selfcare.wellbeing_goals.nutrition}</span>
              </div>
            )}
            {selfcare.wellbeing_goals?.mental_health && (
              <div style={{
                display: "flex", alignItems: "center", gap: "8px", fontSize: "13px",
                padding: "8px 10px", background: "#f0f7ff", borderRadius: "10px"
              }}>
                <span>💆</span>
                <span style={{ color: "#555" }}>{selfcare.wellbeing_goals.mental_health}</span>
              </div>
            )}

            {/* Energy peak */}
            {selfcare.energy_patterns?.peak && (
              <div style={{
                display: "flex", alignItems: "center", gap: "8px", fontSize: "13px",
                padding: "8px 10px", background: "#f5fff0", borderRadius: "10px"
              }}>
                <span>⚡</span>
                <span style={{ color: "#555" }}>Peak focus: <b>{selfcare.energy_patterns.peak}</b></span>
              </div>
            )}

            {/* Rumination risk */}
            {selfcare.energy_patterns?.rumination_risk_window && (
              <div style={{
                display: "flex", alignItems: "center", gap: "8px", fontSize: "13px",
                padding: "8px 10px", background: "#f5f0ff", borderRadius: "10px"
              }}>
                <span>🌙</span>
                <span style={{ color: "#555" }}>Wind down before <b>{selfcare.energy_patterns.rumination_risk_window.split("-")[0]}</b></span>
              </div>
            )}

            {/* Career focus */}
            {selfcare.current_focus?.career_goal && (
              <div style={{
                display: "flex", alignItems: "center", gap: "8px", fontSize: "13px",
                padding: "8px 10px", background: "#fff0f5", borderRadius: "10px"
              }}>
                <span>🎯</span>
                <span style={{ color: "#555" }}>{selfcare.current_focus.career_goal}</span>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
