import { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";
import TimeTrackerApp from "./TimeTrackerApp";

const AuthWrapper = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<'login' | 'signup'>('login');

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleSignup = () => {
    setIsAuthenticated(true);
  };

  // Mock authentication check - replace with Supabase auth
  // useEffect(() => {
  //   const checkAuth = async () => {
  //     const { data: { session } } = await supabase.auth.getSession();
  //     setIsAuthenticated(!!session);
  //   };
  //   checkAuth();
  // }, []);

  if (isAuthenticated) {
    return <TimeTrackerApp />;
  }

  return currentView === 'login' ? (
    <Login onLogin={handleLogin} />
  ) : (
    <Signup onSignup={handleSignup} />
  );
};

export default AuthWrapper;