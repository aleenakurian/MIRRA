import { useState, useEffect, useRef } from "react";

const questions = [
  {
    key: "food",
    text: "What kind of meals do you prefer? 🍽️",
    options: ["Quick & easy", "Healthy", "Comfort food"]
  },
  {
    key: "work_rhythm",
    text: "How does your workday usually feel? 💼",
    options: ["Structured", "Chaotic", "Flexible"]
  },
  {
    key: "pain_point",
    text: "What drains you the most? 😮‍💨",
    options: ["Making decisions", "Planning ahead", "Time pressure"]
  },
  {
    key: "tone",
    text: "How should MIRRA talk to you? 💬",
    options: ["Warm & gentle", "Direct & quick", "Playful"]
  },
  {
    key: "no_push_after",
    text: "When should MIRRA stop nudging you for the day? 🌙",
    options: ["After 8pm", "After 9pm", "After 10pm"]
  }
];

const chipStyle = {
  padding: "10px 16px",
  borderRadius: "20px",
  border: "1.5px solid #ff8fab",
  background: "white",
  color: "#ff8fab",
  fontWeight: "500",
  cursor: "pointer",
  textAlign: "left",
  fontSize: "14px"
};

export default function ChatOnboarding({ newUser, onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [customInput, setCustomInput] = useState("");
  const [showPermissions, setShowPermissions] = useState(false);
  const [permissions, setPermissions] = useState({ wearable: null, flo: null });
  const [chat, setChat] = useState([
    {
      from: "mirra",
      text: `Hi ${newUser.name}! 💖 I'm MIRRA. I'll ask you a few quick questions to get started. You can skip anytime.`
    },
    {
      from: "mirra",
      text: questions[0].text
    }
  ]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const current = questions[step];

  const handleAnswer = (answer) => {
    const updated = { ...answers, [current.key]: answer };
    setAnswers(updated);

    setChat(prev => [
      ...prev,
      { from: "user", text: answer },
      step < questions.length - 1
        ? { from: "mirra", text: questions[step + 1].text }
        : { from: "mirra", text: "Almost done! 🌸 Let me ask for a couple of permissions to personalise your experience." }
    ]);

    if (step < questions.length - 1) {
      setStep(step + 1);
      setCustomInput("");
    } else {
      setTimeout(() => setShowPermissions(true), 2000); // ← 2 seconds to read the message
    }
  };

  const handleSkip = () => setShowPermissions(true);
  const handlePermission = (key, value) => setPermissions(prev => ({ ...prev, [key]: value }));
  const handleFinish = () => onComplete({ ...newUser, ...answers, permissions });
  const bothAnswered = permissions.wearable !== null && permissions.flo !== null;

  // ── Permissions screen ──────────────────────────────
  if (showPermissions) {
    return (
      <div style={{
        maxWidth: "500px", margin: "40px auto", padding: "24px",
        borderRadius: "20px", background: "white",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)", animation: "fadeIn 0.4s ease"
      }}>
        <div style={{ fontWeight: "700", fontSize: "18px", marginBottom: "6px", color: "#ff8fab" }}>
          MIRRA 💖
        </div>
        <div style={{ fontSize: "15px", fontWeight: "600", marginBottom: "6px" }}>
          One last step ✨
        </div>
        <div style={{ fontSize: "13px", color: "#777", marginBottom: "24px" }}>
          MIRRA works best when it can see your health signals. You can always change this later.
        </div>

        {/* Wearable permission */}
        <div style={{ background: "#fff0f5", borderRadius: "16px", padding: "16px", marginBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <span style={{ fontSize: "24px" }}>⌚</span>
            <div>
              <div style={{ fontWeight: "600", fontSize: "14px" }}>Smartwatch / Fitness Tracker</div>
              <div style={{ fontSize: "12px", color: "#777" }}>
                Steps, calories, sleep & stress — to track your energy levels
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => handlePermission("wearable", "granted")}
              style={{
                ...chipStyle, flex: 1, textAlign: "center",
                background: permissions.wearable === "granted" ? "#ff8fab" : "white",
                color: permissions.wearable === "granted" ? "white" : "#ff8fab"
              }}
            >
              ✓ Allow access
            </button>
            <button
              onClick={() => handlePermission("wearable", "denied")}
              style={{
                ...chipStyle, flex: 1, textAlign: "center",
                background: permissions.wearable === "denied" ? "#eee" : "white",
                color: "#999", borderColor: "#ddd"
              }}
            >
              Not now
            </button>
          </div>
        </div>

        {/* Flo permission */}
        <div style={{ background: "#fff0f5", borderRadius: "16px", padding: "16px", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <span style={{ fontSize: "24px" }}>🌸</span>
            <div>
              <div style={{ fontWeight: "600", fontSize: "14px" }}>Flo — Cycle Tracking App</div>
              <div style={{ fontSize: "12px", color: "#777" }}>
                Cycle phase, mood & energy — so MIRRA can plan around your body
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => handlePermission("flo", "granted")}
              style={{
                ...chipStyle, flex: 1, textAlign: "center",
                background: permissions.flo === "granted" ? "#ff8fab" : "white",
                color: permissions.flo === "granted" ? "white" : "#ff8fab"
              }}
            >
              ✓ Allow access
            </button>
            <button
              onClick={() => handlePermission("flo", "denied")}
              style={{
                ...chipStyle, flex: 1, textAlign: "center",
                background: permissions.flo === "denied" ? "#eee" : "white",
                color: "#999", borderColor: "#ddd"
              }}
            >
              Not now
            </button>
          </div>
        </div>

        <button
          onClick={handleFinish}
          disabled={!bothAnswered}
          style={{
            width: "100%", padding: "12px", borderRadius: "12px", border: "none",
            background: bothAnswered ? "linear-gradient(135deg, #ff8fab, #ffc2d1)" : "#eee",
            color: bothAnswered ? "white" : "#aaa",
            fontWeight: "600", fontSize: "15px",
            cursor: bothAnswered ? "pointer" : "not-allowed"
          }}
        >
          Start with MIRRA ✨
        </button>

        <div style={{ textAlign: "center", marginTop: "12px", fontSize: "11px", color: "#aaa" }}>
          Your data stays private and is never sold 🔒
        </div>
      </div>
    );
  }

  // ── Questions screen ────────────────────────────────
  return (
    <div style={{
      maxWidth: "500px", margin: "40px auto", padding: "20px",
      borderRadius: "20px", background: "white",
      boxShadow: "0 10px 30px rgba(0,0,0,0.08)", animation: "fadeIn 0.4s ease"
    }}>
      <div style={{ fontWeight: "700", fontSize: "18px", marginBottom: "16px", color: "#ff8fab" }}>
        MIRRA 💖
      </div>

      {/* Chat history */}
      <div style={{
        maxHeight: "300px", overflowY: "auto", marginBottom: "16px",
        display: "flex", flexDirection: "column", gap: "10px"
      }}>
        {chat.map((msg, i) => (
          <div key={i} style={{
            alignSelf: msg.from === "mirra" ? "flex-start" : "flex-end",
            background: msg.from === "mirra" ? "#fff0f5" : "linear-gradient(135deg, #ff8fab, #ffc2d1)",
            color: msg.from === "mirra" ? "#333" : "white",
            padding: "10px 14px",
            borderRadius: msg.from === "mirra" ? "0 14px 14px 14px" : "14px 0 14px 14px",
            maxWidth: "80%", fontSize: "14px"
          }}>
            {msg.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Quick reply chips */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {current.options.map(opt => (
          <button key={opt} onClick={() => handleAnswer(opt)} style={chipStyle}>
            {opt}
          </button>
        ))}

        <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
          <input
            placeholder="Or type your own..."
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && customInput.trim() && handleAnswer(customInput.trim())}
            style={{
              flex: 1, padding: "10px 14px", borderRadius: "20px",
              border: "1px solid #eee", fontSize: "14px", outline: "none"
            }}
          />
          <button
            onClick={() => customInput.trim() && handleAnswer(customInput.trim())}
            style={{
              padding: "10px 16px", borderRadius: "20px", border: "none",
              background: "linear-gradient(135deg, #ff8fab, #ffc2d1)",
              color: "white", fontWeight: "600", cursor: "pointer"
            }}
          >
            →
          </button>
        </div>
      </div>

      {/* Progress + skip */}
      <div style={{ marginTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "12px", opacity: 0.5 }}>
          {step + 1} of {questions.length}
        </div>
        <button
          onClick={handleSkip}
          style={{ background: "none", border: "none", fontSize: "12px", opacity: 0.5, cursor: "pointer" }}
        >
          This is enough for now →
        </button>
      </div>
    </div>
  );
}