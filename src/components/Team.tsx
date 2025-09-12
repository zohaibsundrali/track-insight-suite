import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, Mail, MoreVertical, Trash2, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Team = () => {
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const teamMembers = [
    {
      id: 1,
      name: "Alex Johnson",
      email: "alex@company.com",
      role: "Team Lead",
      status: "productive",
      todayHours: "8.2h",
      weeklyHours: "42.5h",
      joinedDate: "2024-01-15"
    },
    {
      id: 2,
      name: "Sarah Chen",
      email: "sarah@company.com",
      role: "Developer",
      status: "productive",
      todayHours: "7.5h",
      weeklyHours: "38.2h",
      joinedDate: "2024-02-20"
    },
    {
      id: 3,
      name: "Mike Rodriguez",
      email: "mike@company.com",
      role: "Designer",
      status: "idle",
      todayHours: "6.8h",
      weeklyHours: "35.1h",
      joinedDate: "2024-03-10"
    },
    {
      id: 4,
      name: "Emily Davis",
      email: "emily@company.com",
      role: "Developer",
      status: "offline",
      todayHours: "5.2h",
      weeklyHours: "28.7h",
      joinedDate: "2024-04-05"
    }
  ];

  const inviteLink = "https://timetracker.app/invite/team-xyz-123";

  const handleInvite = () => {
    if (!inviteEmail) return;
    
    toast({
      title: "Invitation sent!",
      description: `Invitation has been sent to ${inviteEmail}`,
    });
    
    setInviteEmail("");
    setIsInviteOpen(false);
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Link copied!",
      description: "Invite link has been copied to clipboard",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "productive": return "bg-productive";
      case "idle": return "bg-idle";
      case "offline": return "bg-offline";
      default: return "bg-muted";
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Team Management</h1>
          <p className="text-muted-foreground">Manage your team members and track their productivity</p>
        </div>
        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-glow">
              <UserPlus className="w-5 h-5 mr-2" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card">
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleInvite} className="flex-1">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Invitation
                </Button>
                <Button variant="outline" onClick={copyInviteLink}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground">Invite Link:</p>
                <p className="text-sm font-mono break-all">{inviteLink}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {teamMembers.length}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Active Now</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">
              {teamMembers.filter(m => m.status !== 'offline').length}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Team Avg Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">7.2h</div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members List */}
      <Card className="glass-card shadow-card">
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-accent flex items-center justify-center">
                      <span className="text-lg font-semibold text-accent-foreground">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getStatusColor(member.status)}`} />
                  </div>
                  
                  <div>
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {member.role}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-medium">Today: {member.todayHours}</p>
                    <p className="text-xs text-muted-foreground">Week: {member.weeklyHours}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`capitalize ${
                        member.status === 'productive' ? 'text-productive border-productive' :
                        member.status === 'idle' ? 'text-idle border-idle' :
                        'text-offline border-offline'
                      }`}
                    >
                      {member.status}
                    </Badge>
                    
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Team;