import { useState } from "react";
import { Calendar, Layers, Users, FileText } from "lucide-react";

export default function StatsCards({ stats }) {
  const [viewMode, setViewMode] = useState("people"); // "people" or "reports"

  const toggleView = () => {
    setViewMode(prev => prev === "people" ? "reports" : "people");
  };

  const data = [
    {
      label: "Har'a",
      peopleValue: stats.todayPeople || 0,
      reportsValue: stats.today || 0,
      peopleLabel: "Tajaajila Har'aa",
      reportsLabel: "Gabaasa Har'aa",
      icon: Calendar,
      tone: "ink",
    },
    {
      label: "Ji'a kana",
      peopleValue: stats.monthPeople || 0,
      reportsValue: stats.month || 0,
      peopleLabel: "Tajaajila Ji'a kanaa",
      reportsLabel: "Gabaasa Ji'a kana",
      icon: Layers,
      tone: "gold",
    },
    {
      label: "Waliigala",
      peopleValue: stats.totalPeople || 0,
      reportsValue: stats.total || 0,
      peopleLabel: "Tajaajila Waliigalaa",
      reportsLabel: "Gabaasa Waliigalaa",
      icon: Users,
      tone: "success",
    },
  ];

  return (
    <div className="stats-container">
      <div className="stats-header">
        <button 
          className={`toggle-btn ${viewMode === "people" ? "active" : ""}`}
          onClick={() => setViewMode("people")}
        >
          <Users size={16} />
          Namoota
        </button>
        <button 
          className={`toggle-btn ${viewMode === "reports" ? "active" : ""}`}
          onClick={() => setViewMode("reports")}
        >
          <FileText size={16} />
          Gabaasa
        </button>
      </div>

      <div className="stats-grid">
        {data.map((item, i) => (
          <div 
            className="stat-card-new clickable" 
            key={i}
            onClick={toggleView}
            title={`Click to show ${viewMode === "people" ? "report count" : "people served"}`}
          >
            <div className={`stat-icon stat-icon-${item.tone}`}>
              <item.icon size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label-new">
                {viewMode === "people" ? item.peopleLabel : item.reportsLabel}
              </span>
              <span className="stat-value-new stat-figure">
                {viewMode === "people" 
                  ? item.peopleValue.toLocaleString() 
                  : item.reportsValue.toLocaleString()
                }
              </span>
              <span className="stat-hint">
                {viewMode === "people" 
                  ? `${item.reportsValue} gabaasa` 
                  : `${item.peopleValue} namoota`
                }
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}