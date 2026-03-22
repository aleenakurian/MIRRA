import { useState, useRef } from "react";
import ProfileSelector from "../components/ProfileSelector";
import RecommendationCard from "../components/RecommendationCard";
import InsightsCard from "../components/InsightsCard";
import ChatView from "../components/ChatView";
import TomorrowPreview from "../components/TomorrowPreview";
import CyclePhaseCard from "../components/CyclePhaseCard";
import ChatOnboarding from "../components/ChatOnboarding";
import { getRecommendations, getInsights, createProfile } from "../services/api";
import WearableCard from "../components/WearableCard";


export default function Dashboard() {
  const [feedbackStatus, setFeedbackStatus] = useState({});
  const [profile, setProfile] = useState(null);       // profile_id string
  const [stage, setStage] = useState("welcome");       // welcome | basic_info | onboarding | dashboard
  const [recos, setRecos] = useState([]);
  const [insights, setInsights] = useState(null);
  const [energy, setEnergy] = useState("normal");
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", work: "" });
  const profileRef = useRef(null);

  const inputStyle = {
    width: "100%", padding: "12px", marginBottom: "12px",
    borderRadius: "10px", border: "1px solid #eee", fontSize: "14px", outline: "none"
  };
  const buttonStyle = {
    width: "100%", padding: "12px", borderRadius: "12px", border: "none",
    background: "linear-gradient(135deg, #ff8fab, #ffc2d1)",
    color: "white", fontWeight: "600", cursor: "pointer", marginTop: "10px"
  };

  // Called after basic info form (name + work)
  const goToOnboarding = () => {
    if (!newUser.name || !newUser.work) return;
    setStage("onboarding");
  };

  // Called when ChatOnboarding completes or is skipped
  const finishOnboarding = async (fullUserData) => {
    setLoading(true);
    try {
      const res = await createProfile(fullUserData);
      const profileId = res.data.profile_id;
      setProfile(profileId);
      profileRef.current = profileId;
      await loadRecommendations(profileId);
      await loadInsights(profileId);
      setStage("dashboard");
    } catch (err) {
      console.error("Profile creation failed:", err);
    }
    setLoading(false);
  };

  const loadRecommendations = async (profileId) => {
    const r = await getRecommendations(profileId);
    const recommendations = r.data.recommendations || [];
    setRecos(recommendations);
    const meal = recommendations.find(r => r.category === "meal");
    if (meal && meal.justification?.explanation_text?.includes("Low energy")) {
      setEnergy("low");
    } else {
      setEnergy("normal");
    }
  };

  const loadInsights = async (profileId) => {
    const i = await getInsights(profileId);
    setInsights({ ...i.data });
  };

  const refreshAfterFeedback = async () => {
    const currentProfile = profileRef.current;
    if (!currentProfile) return;
    await loadInsights(currentProfile);
  };

  const loadData = async (profileId) => {
    setLoading(true);
    try {
      await loadRecommendations(profileId);
      await loadInsights(profileId);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSelect = (id) => {
    if (id === "NEW_USER") {
      setStage("basic_info");
      return;
    }
    setProfile(id);
    profileRef.current = id;
    setStage("dashboard");
    loadData(id);
  };

  return (
  <>
    {loading && (
      <>
        <div className="shimmer"></div>
        <div className="shimmer"></div>
        <div className="shimmer"></div>
      </>
    )}

    {/* Header */}
    <div style={{
      marginBottom: "1px", padding: "20px", textAlign: "center",
      background: "linear-gradient(135deg, #ff8fab, #ffc2d1)", color: "white"
    }}>
      <div style={{ fontSize: "24px", fontWeight: "600" }}>MIRRA 💖</div>
      <div style={{ opacity: 0.9 }}>Your life, intelligently simplified</div>
    </div>

    {/* ← container only wraps welcome/onboarding screens */}
    <div className="container">
      {stage === "welcome" && (
        <>
          <div style={{ textAlign: "center", marginTop: "10px", animation: "fadeIn 0.5s ease" }}>
            <div className="title">Welcome to MIRRA 💖</div>
            <div className="subtitle">Let's reduce your mental load today</div>
          </div>
          <div style={{ marginTop: "20px" }}>
            <ProfileSelector onSelect={handleSelect} />
          </div>
        </>
      )}

      {stage === "basic_info" && (
        <div style={{ marginTop: "40px", display: "flex", justifyContent: "center" }}>
          <div style={{
            width: "100%", maxWidth: "400px", padding: "30px",
            borderRadius: "20px", background: "white",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)", animation: "fadeIn 0.5s ease"
          }}>
            <div style={{ fontSize: "22px", fontWeight: "600", marginBottom: "10px", textAlign: "center" }}>
              Let's get to know you 💖
            </div>
            <div style={{ fontSize: "14px", opacity: 0.7, marginBottom: "20px", textAlign: "center" }}>
              I'll start simplifying your day right away
            </div>
            <input
              placeholder="Your name"
              style={inputStyle}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
            <input
              placeholder="What do you do? (student, working professional...)"
              style={inputStyle}
              onChange={(e) => setNewUser({ ...newUser, work: e.target.value })}
            />
            <button
              style={{ ...buttonStyle, opacity: (!newUser.name || !newUser.work) ? 0.6 : 1 }}
              disabled={!newUser.name || !newUser.work}
              onClick={goToOnboarding}
            >
              Next ✨
            </button>
          </div>
        </div>
      )}

      {stage === "onboarding" && (
        <ChatOnboarding newUser={newUser} onComplete={finishOnboarding} />
      )}
    </div>

    {/* ← dashboard is OUTSIDE container */}
    {stage === "dashboard" && profile && (
      <div style={{ padding: "1px 20px", animation: "fadeIn 0.5s ease" }}>
        <div className="title" style={{ marginBottom: "16px" ,textAlign: "center" }}>
          Today with MIRRA 💖
        </div>

        <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>

          {/* LEFT */}
          <div style={{ width: "260px", flexShrink: 0 }}>
            <WearableCard profileId={profile} />
          </div>

          {/* RIGHT */}
          <div style={{ flex: 1, minWidth: 0, maxWidth:"1100px"}}>
            <ChatView recos={recos} energy={energy} profileId={profile} />
            <CyclePhaseCard profileId={profile} />
            <TomorrowPreview recos={recos} profileId={profile} />
            

            <div style={{ padding: "12px", borderRadius: "12px", background: "#f8f9fa", marginBottom: "12px" }}>
              📅 {recos.length} decisions handled for you today ✨
            </div>

            {!loading && recos.map(r => (
              <RecommendationCard
                key={r.reco_id}
                reco={r}
                profileId={profile}
                refresh={refreshAfterFeedback}
                status={feedbackStatus[r.reco_id] || null}
                onStatus={(id, s) => setFeedbackStatus(prev => ({ ...prev, [id]: s }))}
              />
            ))}

            {insights && <InsightsCard insights={insights} />}
          </div>

        </div>
      </div>
    )}

    {stage === "dashboard" && profile && (
      <div style={{
        margin: "10px 20px", padding: "10px", borderRadius: "12px",
        background: energy === "low" ? "#ffe5ec" : "#e7f5ff"
      }}>
        {energy === "low" ? "🌙 Low energy day — taking it easy" : "⚡ You're in a good zone today"}
      </div>
    )}
  </>
);
}