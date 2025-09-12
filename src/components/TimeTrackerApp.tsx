import { useState } from "react";
import Navigation from "./Navigation";
import Dashboard from "./Dashboard";
import Team from "./Team";
import Reports from "./Reports";
import Profile from "./Profile";

const TimeTrackerApp = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "team":
        return <Team />;
      case "reports":
        return <Reports />;
      case "profile":
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 lg:ml-64">
        {renderContent()}
      </main>
    </div>
  );
};

export default TimeTrackerApp;