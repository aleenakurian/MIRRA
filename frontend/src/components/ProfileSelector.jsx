import { useEffect, useState } from "react";
import { getProfiles } from "../services/api";

export default function ProfileSelector({ onSelect }) {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    getProfiles().then(res => setProfiles(res.data));
  }, []);

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      marginTop: "40px"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "400px",
        padding: "30px",
        borderRadius: "20px",
        background: "white",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
      }}>
        
        {/* Title */}
        <div className="title" style={{ textAlign: "center" }}>
          Choose Profile
        </div>

        {/* Existing users */}
        <div style={{ marginTop: "20px" }}>
          <div style={{
            fontSize: "15px",
            opacity: 0.9,
            marginBottom: "10px",
            textAlign: "center",
          }}>
            Existing users
          </div>

          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}>
            {profiles.map(p => (
  <button
    key={p.profile_id}
    className="button accept"
    onClick={() => onSelect(p.profile_id)}
    style={{ fontWeight: "600", fontSize: "16px" }}
  >
    {p.demographics?.name_alias || p.created_for || p.profile_id}
  </button>
))}
          </div>
        </div>

        {/* Divider */}
        <div style={{
          margin: "20px 0",
          height: "1px",
          background: "#eee"
        }} />

        {/* New user */}
        <div style={{ textAlign: "center" }}>
  <div style={{
    fontSize: "15px",
    opacity: 0.9,
    marginBottom: "10px"
  }}>
    New here?
  </div>
  <button
    className="button accept"
    onClick={() => onSelect("NEW_USER")}
  >
    + Create New Profile
  </button>
</div>

      </div>
    </div>
  );
}