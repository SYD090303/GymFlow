import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import GymLandingPage from './pages/landing/GymLandingPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Overview from './pages/dashboard/overview/Overview';
import DashboardIndex from './pages/dashboard/DashboardIndex';
import MembersPage from './pages/dashboard/members/MembersPage';
import CheckIn from './pages/dashboard/checkin/CheckIn';
import ReceptionistsPage from './pages/dashboard/receptionists/ReceptionistsPage';
import PlansPage from './pages/dashboard/plans/PlansPage';
import SettingsPage from './pages/dashboard/settings/SettingsPage';
import ReceptionistDashboard from './pages/dashboard/receptionist/ReceptionistDashboard';
import MemberDashboard from './pages/dashboard/member/MemberDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<GymLandingPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />}>
            <Route index element={<DashboardIndex />} />
            <Route path="members" element={<MembersPage />} />
            <Route path="check-in" element={<CheckIn />} />
            <Route path="receptionists" element={<ReceptionistsPage />} />
            <Route path="receptionist" element={<ReceptionistDashboard />} />
            <Route path="member" element={<MemberDashboard />} />
            <Route path="plans" element={<PlansPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
