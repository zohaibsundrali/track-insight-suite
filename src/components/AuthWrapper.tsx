import { useAuth } from "@/hooks/useAuth";
import { useSearchParams } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import InviteSignup from "./InviteSignup";
import TimeTrackerApp from "./TimeTrackerApp";

const AuthWrapper = () => {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <TimeTrackerApp />;
  }

  // If there's an invite token, show invite signup
  if (inviteToken) {
    return <InviteSignup inviteToken={inviteToken} />;
  }

  // Default auth flow - only show login, signup is invite-only
  return <Login />;
};

export default AuthWrapper;