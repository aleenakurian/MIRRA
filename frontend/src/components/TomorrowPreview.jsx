import { useEffect, useState } from "react";
import { getFamily, getSelfcare } from "../services/api";

export default function TomorrowPreview({ recos, profileId }) {
  const [family, setFamily] = useState(null);
  const [selfcare, setSelfcare] = useState(null);

  useEffect(() => {
    if (!profileId || profileId.startsWith("USER")) return;
    getFamily(profileId).then(res => setFamily(res.data)).catch(() => {});
    getSelfcare(profileId).then(res => setSelfcare(res.data)).catch(() => {});
  }, [profileId]);

  if (!recos || recos.length === 0) return null;

  const heavyDay = recos.some(r =>
    r.justification?.explanation_text?.toLowerCase().includes("meeting")
  );

  // Aarohi family context
  const hasChild = family?.dependents?.some(d => d.type === "child");
  const hasElder = family?.dependents?.some(d => d.type === "elder_parent");
  const homeworkWindow = family?.household_rules?.kid_homework_window;
  const dinnerTime = family?.household_rules?.weekday_dinner_time;

  // Naina selfcare context
  const hasSelfcare = selfcare && Object.keys(selfcare).length > 0 && !family?.dependents?.length;
  const isInterviewing = selfcare?.current_focus?.job_search_stage === "active interviewing";
  const learningPlan = selfcare?.current_focus?.learning_plan || [];
  const peakWindow = selfcare?.energy_patterns?.peak;

  const items = [];

  if (heavyDay) {
    items.push({ icon: "📅", text: "Meeting-heavy day — prep meals or groceries today" });
  } else {
    items.push({ icon: "📅", text: "Tomorrow looks balanced — good time to plan ahead" });
  }

  // Aarohi-specific
  if (hasChild && homeworkWindow) {
    items.push({ icon: "📚", text: `School coordination + homework at ${homeworkWindow}` });
  }
  if (hasElder) {
    items.push({ icon: "💊", text: "Elder medication check due" });
  }
  if (dinnerTime) {
    items.push({ icon: "🍽️", text: `Dinner planned for ${dinnerTime}` });
  }

  // Naina-specific
  if (hasSelfcare) {
    if (isInterviewing) {
      items.push({ icon: "🎯", text: "Interview prep — night-before kit: outfit + practice + meals" });
    }
    if (peakWindow) {
      items.push({ icon: "⚡", text: `Block ${peakWindow} for deep focus or learning` });
    }
    if (learningPlan.length > 0) {
      items.push({ icon: "📖", text: `Learning: ${learningPlan[0]} — even 25 mins counts` });
    }
    items.push({ icon: "🌿", text: "Wind-down reminder: avoid doom-scrolling after 9:30pm" });
  }

  // Grocery for anyone
  const groceryReco = recos.find(r => r.category === "grocery");
  if (groceryReco) {
    items.push({ icon: "🛒", text: "Grocery restock — order tonight to get it in time" });
  }

  return (
    <div style={{
      padding: "14px", borderRadius: "12px",
      background: "#eef6ff", marginBottom: "12px"
    }}>
      <div style={{ fontWeight: "600", marginBottom: "8px" }}>🔮 Tomorrow</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {items.map((item, i) => (
          <div key={i} style={{ fontSize: "13px", display: "flex", gap: "6px", alignItems: "flex-start" }}>
            <span>{item.icon}</span>
            <span style={{ color: "#444" }}>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
