import { useState, useEffect, useRef } from "react";
import { getFamily, getSelfcare } from "../services/api";

export default function ChatView({ recos, energy, profileId }) {
  const [family, setFamily] = useState(null);
  const [selfcare, setSelfcare] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatStep, setChatStep] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!profileId || profileId.startsWith("USER")) return;
    getFamily(profileId).then(res => setFamily(res.data)).catch(() => {});
    getSelfcare(profileId).then(res => setSelfcare(res.data)).catch(() => {});
  }, [profileId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const names = {
    "MIRRA-F-0001": "Aarohi",
    "MIRRA-F-0002": "Naina"
  };
  const name = names[profileId] || "there";

  const heavyDay = recos && recos.some(r =>
    r.justification?.explanation_text?.toLowerCase().includes("meeting")
  );

  const hasChild = family?.dependents?.some(d => d.type === "child");
  const hasElder = family?.dependents?.some(d => d.type === "elder_parent");
  const homeworkWindow = family?.household_rules?.kid_homework_window;
  const hasSelfcare = selfcare && Object.keys(selfcare).length > 0 && !family?.dependents?.length;
  const isInterviewing = selfcare?.current_focus?.job_search_stage === "active interviewing";
  const peakWindow = selfcare?.energy_patterns?.peak;
  const ruminationWindow = selfcare?.energy_patterns?.rumination_risk_window;
  const motivationStyle = selfcare?.motivation?.responds_to?.[0];

  let intro = "";
  if (!recos || recos.length === 0) intro = "";
  else if (profileId.startsWith("USER")) {
    intro = `Hey ${name}, I'm still learning your patterns — but I've started helping you already.`;
  } else if (hasSelfcare) {
    if (energy === "low" && isInterviewing) {
      intro = `Hey ${name}, energy's a bit low today — let's keep it simple and save your best focus for interview prep 🌸`;
    } else if (energy === "low") {
      intro = `Hey ${name}, taking it gentle today is totally valid. One small step at a time 💛`;
    } else if (heavyDay && isInterviewing) {
      intro = `Hey ${name}, busy day ahead — your peak focus window is ${peakWindow}. Block that for interview practice 🎯`;
    } else if (isInterviewing) {
      intro = `Hey ${name}, you're in a good zone today! ${peakWindow ? `Use ${peakWindow} for your best prep work.` : "Make the most of it."} You've got this 💪`;
    } else if (peakWindow) {
      intro = `Hey ${name}, your peak window is ${peakWindow} — I've planned around that for you today ⚡`;
    } else {
      intro = `Hey ${name}, let's make today a small win 🌸`;
    }
    const hour = new Date().getHours();
    if (ruminationWindow && hour >= 21) intro += ` Wind down before ${ruminationWindow.split("-")[0]} tonight.`;
    if (motivationStyle === "small wins") intro += " Every step counts ✨";
  } else {
    if (heavyDay && energy === "low") {
      intro = `Hey ${name}, today looks packed and your energy is low, so I've kept things light for you.`;
      if (hasChild && homeworkWindow) intro += ` Don't forget homework time at ${homeworkWindow}.`;
    } else if (heavyDay) {
      intro = `Hey ${name}, busy schedule today — I've optimized your tasks.`;
      if (hasChild && homeworkWindow) intro += ` Block ${homeworkWindow} for homework.`;
    } else if (energy === "low") {
      intro = `Hey ${name}, you're low on energy today, so I've made things easier.`;
      if (hasElder) intro += ` Reminder: check elder medications.`;
    } else {
      intro = `Hey ${name}, you're in a good flow today, let's make the most of it.`;
      if (hasChild && homeworkWindow) intro += ` Homework window is ${homeworkWindow} — you've got time.`;
    }
  }

  // ── Chat window logic ──
  const openChat = () => {
    setChatOpen(true);
    if (chatMessages.length === 0) {
      setChatMessages([
        {
          from: "mirra",
          text: `Hi ${name}, did today's leadership meeting go well?`,
          options: ["Yes", "No"]
        }
      ]);
      setChatStep(1);
    }
  };

  const handleChatOption = (option) => {
    const updated = [
      ...chatMessages,
      { from: "user", text: option }
    ];

    if (chatStep === 1 && option === "Yes") {
      updated.push({
        from: "mirra",
        text: "Want to tell me more about it?",
        options: ["Sure!", "Maybe later"]
      });
      setChatStep(2);
    } else if (chatStep === 1 && option === "No") {
      updated.push({
        from: "mirra",
        text: "That's okay — I've noted that. Want me to factor that into tomorrow's plan?",
        options: ["Yes please", "No thanks"]
      });
      setChatStep(2);
    } else {
      updated.push({
        from: "mirra",
        text: "Got it! I'll keep that in mind for your recommendations 💖"
      });
      setChatStep(0);
    }

    setChatMessages(updated);
  };

  const lastMessage = chatMessages[chatMessages.length - 1];

  return (
    <>
      {/* ── Main chat intro ── */}
      {recos && recos.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <div style={{
            background: "#f1f3f5", padding: "12px", borderRadius: "12px",
            marginBottom: "10px", maxWidth: "100%", animation: "chatFade 0.3s ease"
          }}>
            <b>MIRRA 💖</b>
            <div style={{ marginTop: "5px" }}>{intro}</div>
          </div>
        </div>
      )}

      {/* ── Floating chat button ── */}
      <button
        onClick={openChat}
        style={{
          position: "fixed",
          bottom: "28px",
          right: "28px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          border: "none",
          background: "linear-gradient(135deg, #ff8fab, #ffc2d1)",
          color: "white",
          fontSize: "24px",
          cursor: "pointer",
          boxShadow: "0 4px 16px rgba(255, 143, 171, 0.5)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.2s ease"
        }}
        onMouseOver={e => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
      >
        💬
      </button>

      {/* ── Chat window ── */}
      {chatOpen && (
        <div style={{
          position: "fixed",
          bottom: "96px",
          right: "28px",
          width: "320px",
          background: "white",
          borderRadius: "20px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          zIndex: 1000,
          overflow: "hidden",
          animation: "fadeIn 0.3s ease"
        }}>
          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #ff8fab, #ffc2d1)",
            padding: "14px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "white"
          }}>
            <div style={{ fontWeight: "600" }}>MIRRA 💖</div>
            <button
              onClick={() => setChatOpen(false)}
              style={{
                background: "none", border: "none", color: "white",
                fontSize: "18px", cursor: "pointer", lineHeight: 1
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div style={{
            padding: "14px",
            maxHeight: "280px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}>
            {chatMessages.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.from === "mirra" ? "flex-start" : "flex-end",
                background: msg.from === "mirra" ? "#fff0f5" : "linear-gradient(135deg, #ff8fab, #ffc2d1)",
                color: msg.from === "mirra" ? "#333" : "white",
                padding: "10px 14px",
                borderRadius: msg.from === "mirra" ? "0 14px 14px 14px" : "14px 0 14px 14px",
                maxWidth: "80%",
                fontSize: "14px"
              }}>
                {msg.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Options */}
          {lastMessage?.options && (
            <div style={{
              padding: "0 14px 14px",
              display: "flex",
              flexDirection: "column",
              gap: "6px"
            }}>
              {lastMessage.options.map(opt => (
                <button
                  key={opt}
                  onClick={() => handleChatOption(opt)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "20px",
                    border: "1.5px solid #ff8fab",
                    background: "white",
                    color: "#ff8fab",
                    fontWeight: "500",
                    cursor: "pointer",
                    fontSize: "13px",
                    textAlign: "left"
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}