// filepath: /home/bmljlee1/SOC/FinalProject/final-project-404-bra/src/App.tsx
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar";
import Dashboard from "./pages/Dashboard";
import TaskView from "./pages/TaskView";
import RewardView from "./pages/RewardView";
import KidProfile from "./pages/KidProfile";
import ParentProfile from "./pages/ParentProfile";
import KidDashboard from "./pages/KidDashboard";

const App: React.FC = () => {
  return (
    <Router>
      <NavBar />
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<TaskView />} />
          <Route path="/rewards" element={<RewardView />} />
          <Route path="/kid/:id" element={<KidProfile />} />
          <Route path="/parent" element={<ParentProfile />} />
          <Route path="/kid-dashboard/:kidId" element={<KidDashboard />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
