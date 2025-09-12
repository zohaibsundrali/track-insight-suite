import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Clock, 
  Settings, 
  Target, 
  TrendingUp,
  Calendar,
  Award
} from "lucide-react";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Senior Developer",
    department: "Engineering",
    bio: "Passionate developer with 5+ years of experience in full-stack development.",
    workingHours: "9:00 AM - 5:00 PM",
    timezone: "UTC-5 (Eastern Time)",
  });

  const [preferences, setPreferences] = useState({
    screenshotFrequency: 5, // minutes
    trackIdleTime: true,
    emailNotifications: true,
    weeklyReports: true,
    showProductivityScore: true,
  });

  const timeStats = {
    todayHours: 6.5,
    weeklyHours: 32.5,
    monthlyHours: 142.8,
    productivityScore: 87,
    averageDaily: 7.2,
  };

  const recentLogs = [
    { date: "2024-01-20", startTime: "09:15", endTime: "17:30", totalHours: 7.75, productivity: 89 },
    { date: "2024-01-19", startTime: "09:00", endTime: "17:15", totalHours: 7.25, productivity: 92 },
    { date: "2024-01-18", startTime: "09:30", endTime: "17:45", totalHours: 7.25, productivity: 85 },
    { date: "2024-01-17", startTime: "09:00", endTime: "17:00", totalHours: 7.0, productivity: 88 },
    { date: "2024-01-16", startTime: "09:15", endTime: "17:30", totalHours: 7.75, productivity: 91 },
  ];

  const achievements = [
    { title: "Consistency Champion", description: "Worked 5 days in a row", icon: "🏆", earned: true },
    { title: "Early Bird", description: "Started work before 9 AM for a week", icon: "🌅", earned: true },
    { title: "Productivity Master", description: "Maintained 90%+ productivity", icon: "⚡", earned: false },
    { title: "Time Tracker Pro", description: "Used time tracking for 30 days", icon: "⏰", earned: true },
  ];

  const handleSaveProfile = () => {
    setIsEditing(false);
    // Here you would typically save to backend
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">My Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and view your time tracking statistics</p>
        </div>
        <Button 
          variant={isEditing ? "default" : "outline"} 
          onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
        >
          {isEditing ? "Save Changes" : "Edit Profile"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-accent flex items-center justify-center">
                  <span className="text-2xl font-bold text-accent-foreground">
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{profile.name}</h3>
                  <p className="text-muted-foreground">{profile.role}</p>
                  <Badge variant="secondary">{profile.department}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={profile.role}
                    onChange={(e) => setProfile(prev => ({ ...prev, role: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={profile.department}
                    onChange={(e) => setProfile(prev => ({ ...prev, department: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  disabled={!isEditing}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Recent Time Logs */}
          <Card className="glass-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Time Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentLogs.map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        <div className="font-medium">{log.date}</div>
                        <div className="text-muted-foreground">{log.startTime} - {log.endTime}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">{log.totalHours}h</div>
                        <div className="text-xs text-muted-foreground">Total</div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`${
                          log.productivity >= 90 ? 'text-productive border-productive' :
                          log.productivity >= 80 ? 'text-idle border-idle' :
                          'text-offline border-offline'
                        }`}
                      >
                        {log.productivity}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats and Settings Sidebar */}
        <div className="space-y-6">
          {/* Time Statistics */}
          <Card className="glass-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Time Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Today</span>
                  <span className="font-medium">{timeStats.todayHours}h</span>
                </div>
                <Progress value={(timeStats.todayHours / 8) * 100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>This Week</span>
                  <span className="font-medium">{timeStats.weeklyHours}h</span>
                </div>
                <Progress value={(timeStats.weeklyHours / 40) * 100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Productivity Score</span>
                  <span className="font-medium text-accent">{timeStats.productivityScore}%</span>
                </div>
                <Progress value={timeStats.productivityScore} className="h-2 productivity-indicator" />
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Monthly Total</span>
                  <span className="font-medium">{timeStats.monthlyHours}h</span>
                </div>
                <div className="flex justify-between">
                  <span>Daily Average</span>
                  <span className="font-medium">{timeStats.averageDaily}h</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="glass-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <div key={index} className={`flex items-center gap-3 p-2 rounded-lg ${achievement.earned ? 'bg-accent/10' : 'opacity-50'}`}>
                    <span className="text-lg">{achievement.icon}</span>
                    <div>
                      <div className="text-sm font-medium">{achievement.title}</div>
                      <div className="text-xs text-muted-foreground">{achievement.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="glass-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Track Idle Time</Label>
                  <p className="text-xs text-muted-foreground">Monitor when you're away</p>
                </div>
                <Switch 
                  checked={preferences.trackIdleTime}
                  onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, trackIdleTime: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">Daily summary emails</p>
                </div>
                <Switch 
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, emailNotifications: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Weekly Reports</Label>
                  <p className="text-xs text-muted-foreground">Automatic weekly reports</p>
                </div>
                <Switch 
                  checked={preferences.weeklyReports}
                  onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, weeklyReports: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;