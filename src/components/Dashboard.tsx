import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Clock, Users, TrendingUp, Activity, Play, Pause, Square } from "lucide-react";

const Dashboard = () => {
  const isTracking = false; // Mock state

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Smart Time Tracker</h1>
          <p className="text-muted-foreground">Track your productivity and manage your time effectively</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant={isTracking ? "destructive" : "default"} 
            size="lg"
            className="shadow-glow"
          >
            {isTracking ? (
              <>
                <Square className="w-5 h-5 mr-2" />
                Stop Tracking
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Start Tracking
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours Today</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">7.5h</div>
            <p className="text-xs text-muted-foreground">+1.2h from yesterday</p>
          </CardContent>
        </Card>

        <Card className="glass-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productivity Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">85%</div>
            <Progress value={85} className="mt-2 productivity-indicator" />
          </CardContent>
        </Card>

        <Card className="glass-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Team Members</CardTitle>
            <Users className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">12</div>
            <p className="text-xs text-muted-foreground">3 currently tracking</p>
          </CardContent>
        </Card>

        <Card className="glass-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Status</CardTitle>
            <Activity className="h-4 w-4 text-idle" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-idle">Idle</div>
            <p className="text-xs text-muted-foreground">Last active 5m ago</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card shadow-card">
          <CardHeader>
            <CardTitle>Today's Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Productive Time</span>
                <span className="text-sm font-medium text-productive">6.2h</span>
              </div>
              <Progress value={82} className="h-2" />
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Idle Time</span>
                <span className="text-sm font-medium text-idle">1.3h</span>
              </div>
              <Progress value={18} className="h-2" />
              
              <div className="pt-4 border-t border-border/50">
                <div className="text-sm text-muted-foreground">Most productive: 2:00 PM - 4:00 PM</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card shadow-card">
          <CardHeader>
            <CardTitle>Team Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Alex Johnson", hours: "8.2h", status: "productive" },
                { name: "Sarah Chen", hours: "7.5h", status: "productive" },
                { name: "Mike Rodriguez", hours: "6.8h", status: "idle" },
                { name: "Emily Davis", hours: "5.2h", status: "offline" },
              ].map((member) => (
                <div key={member.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      member.status === 'productive' ? 'bg-productive' :
                      member.status === 'idle' ? 'bg-idle' : 'bg-offline'
                    }`} />
                    <span className="text-sm">{member.name}</span>
                  </div>
                  <span className="text-sm font-medium">{member.hours}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;