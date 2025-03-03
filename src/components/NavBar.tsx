// filepath: /home/bmljlee1/SOC/FinalProject/final-project-404-bra/src/components/NavBar.tsx
import React from "react";
import { Link } from "react-router-dom";

const NavBar: React.FC = () => {
  return (
    <nav className="p-4 bg-blue-500 text-white">
      <ul className="flex space-x-4">
        <li>
          <Link to="/">Dashboard</Link>
        </li>
        <li>
          <Link to="/tasks">Tasks</Link>
        </li>
        <li>
          <Link to="/rewards">Rewards</Link>
        </li>
        <li>
          <Link to="/parent">Parent Profile</Link>
        </li>
        <li>
          <Link to="/kid-dashboard/1">Kid Dashboard</Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
