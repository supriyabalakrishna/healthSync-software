import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import VitalRecording from './pages/VitalRecording';
import MealPlanner from './pages/MealPlanner';
import Analytics from './pages/Analytics';
import Emergency from './pages/Emergency';
import PillReminder from './pages/PillReminder';
import Login from './pages/Login';
import SignUp from './pages/SignUp';

function ProtectedRoute({ isAuthenticated, children }) {
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('patient');

  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem('user');
    const storedUserId = localStorage.getItem('userId');
    
    if (user && storedUserId) {
      const userData = JSON.parse(user);
      setIsAuthenticated(true);
      setUserId(storedUserId);
      setUserName(userData.name);
      setUserRole(userData.role);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setUserId(null);
    setUserName('');
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            isAuthenticated && userId ? (
              <div className="flex min-h-screen">
                <Sidebar userName={userName} userRole={userRole} onLogout={handleLogout} />
                <main className="flex-1 ml-64 p-6 overflow-y-auto">
                  <Routes>
                    <Route path="/" element={<Dashboard userId={userId} userName={userName} />} />
                    <Route path="/vitals" element={<VitalRecording userId={userId} />} />
                    <Route path="/meals" element={<MealPlanner userId={userId} />} />
                    <Route path="/analytics" element={<Analytics userId={userId} />} />
                    <Route path="/emergency" element={<Emergency userId={userId} />} />
                    <Route path="/pills" element={<PillReminder userId={userId} />} />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </main>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
