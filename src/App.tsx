import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import NavBar from "./components/NavBar";
import Dashboard from "./pages/Dashboard";
import TaskView from "./pages/TaskView";
import RewardView from "./pages/RewardView";
import KidProfile from "./pages/KidProfile";
import ParentProfile from "./pages/ParentProfile";
import KidDashboard from "./pages/KidDashboard";
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import CreateProfile from "./pages/Create-profile";

const Layout = () => {
  const location = useLocation();

  const hideNavRoutes = ["/login", "/create-profile", "/"];

  return (
    <>
      {!hideNavRoutes.includes(location.pathname) && <NavBar />}
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create-profile" element={<CreateProfile />} />
          <Route
            path="tasks"
            element={
              <ProtectedRoute>
                <TaskView />
              </ProtectedRoute>
            }
          />
          <Route path="/rewards" element={<RewardView />} />
          <Route path="/kid/:id" element={<KidProfile />} />
          <Route path="/parent" element={<ParentProfile />} />
          <Route path="/kid-dashboard/:kidId" element={<KidDashboard />} />
        </Routes>
      </div>
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout />
      </Router>
    </AuthProvider>
  );
};

export default App;
