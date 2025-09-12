import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Download, Eye, Filter, Clock, Activity } from "lucide-react";

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [selectedUser, setSelectedUser] = useState("all");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const timeData = [
    { day: "Mon", productive: 6.5, idle: 1.5 },
    { day: "Tue", productive: 7.2, idle: 0.8 },
    { day: "Wed", productive: 8.1, idle: 0.4 },
    { day: "Thu", productive: 6.8, idle: 1.2 },
    { day: "Fri", productive: 7.5, idle: 0.5 },
  ];

  const screenshots = [
    { id: 1, timestamp: "2024-01-20 14:30", user: "Alex Johnson", activity: "high", thumbnail: "/api/placeholder/200/150" },
    { id: 2, timestamp: "2024-01-20 14:25", user: "Sarah Chen", activity: "medium", thumbnail: "/api/placeholder/200/150" },
    { id: 3, timestamp: "2024-01-20 14:20", user: "Mike Rodriguez", activity: "high", thumbnail: "/api/placeholder/200/150" },
    { id: 4, timestamp: "2024-01-20 14:15", user: "Emily Davis", activity: "low", thumbnail: "/api/placeholder/200/150" },
    { id: 5, timestamp: "2024-01-20 14:10", user: "Alex Johnson", activity: "high", thumbnail: "/api/placeholder/200/150" },
    { id: 6, timestamp: "2024-01-20 14:05", user: "Sarah Chen", activity: "medium", thumbnail: "/api/placeholder/200/150" },
  ];

  const activityLog = [
    { time: "14:35", user: "Alex Johnson", action: "Started task: API Development", type: "start" },
    { time: "14:30", user: "Sarah Chen", action: "Completed: Database Migration", type: "complete" },
    { time: "14:25", user: "Mike Rodriguez", action: "Break started", type: "break" },
    { time: "14:20", user: "Emily Davis", action: "Started task: UI Design", type: "start" },
    { time: "14:15", user: "Alex Johnson", action: "Screenshot captured", type: "screenshot" },
  ];

  const getActivityBadgeColor = (activity: string) => {
    switch (activity) {
      case "high": return "text-productive border-productive";
      case "medium": return "text-idle border-idle";
      case "low": return "text-offline border-offline";
      default: return "";
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case "start": return "🚀";
      case "complete": return "✅";
      case "break": return "☕";
      case "screenshot": return "📸";
      default: return "📝";
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights into team productivity and time tracking</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="alex">Alex Johnson</SelectItem>
              <SelectItem value="sarah">Sarah Chen</SelectItem>
              <SelectItem value="mike">Mike Rodriguez</SelectItem>
              <SelectItem value="emily">Emily Davis</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Time Tracked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">156.5h</div>
            <p className="text-xs text-muted-foreground">+12.3h vs last period</p>
          </CardContent>
        </Card>

        <Card className="glass-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Productivity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">87%</div>
            <Progress value={87} className="mt-2 productivity-indicator" />
          </CardContent>
        </Card>

        <Card className="glass-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Screenshots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">1,284</div>
            <p className="text-xs text-muted-foreground">Captured this period</p>
          </CardContent>
        </Card>

        <Card className="glass-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-idle">22/25</div>
            <p className="text-xs text-muted-foreground">Team attendance</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Chart */}
        <Card className="glass-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Daily Time Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timeData.map((day) => (
                <div key={day.day} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{day.day}</span>
                    <span>{day.productive + day.idle}h total</span>
                  </div>
                  <div className="flex gap-1 h-4 rounded-full overflow-hidden bg-muted/30">
                    <div 
                      className="bg-productive" 
                      style={{ width: `${(day.productive / (day.productive + day.idle)) * 100}%` }}
                    />
                    <div 
                      className="bg-idle" 
                      style={{ width: `${(day.idle / (day.productive + day.idle)) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Productive: {day.productive}h</span>
                    <span>Idle: {day.idle}h</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card className="glass-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {activityLog.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                  <span className="text-lg">{getActionIcon(activity.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.user}</p>
                    <p className="text-xs text-muted-foreground">{activity.action}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Screenshots Gallery */}
      <Card className="glass-card shadow-card">
        <CardHeader>
          <CardTitle>Screenshots Gallery</CardTitle>
          <p className="text-sm text-muted-foreground">
            Recent screenshots captured during active time tracking
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {screenshots.map((screenshot) => (
              <div key={screenshot.id} className="group relative">
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="relative cursor-pointer rounded-lg overflow-hidden border border-border/50 hover:border-primary/50 transition-colors">
                      <div className="aspect-video bg-muted/30 flex items-center justify-center">
                        <span className="text-muted-foreground">Screenshot Preview</span>
                      </div>
                      <div className="absolute inset-0 bg-background/0 group-hover:bg-background/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Eye className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl glass-card">
                    <div className="aspect-video bg-muted/30 rounded-lg flex items-center justify-center">
                      <span className="text-muted-foreground">Full Screenshot View</span>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{screenshot.user}</span>
                    <Badge variant="outline" className={`text-xs ${getActivityBadgeColor(screenshot.activity)}`}>
                      {screenshot.activity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{screenshot.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;