import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Shield, User, UserPlus, LogIn, Calendar } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  details: any;
  created_at: string;
  profiles?: {
    name: string;
    email: string;
  };
}

const AuditLogs = () => {
  const { profile } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  useEffect(() => {
    if (profile?.role !== 'admin') {
      toast.error("Access denied. Admin privileges required.");
      return;
    }
    fetchAuditLogs();
  }, [profile]);

  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          id,
          user_id,
          action,
          details,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Fetch profile data separately for each unique user_id
      const userIds = [...new Set(data?.map(log => log.user_id) || [])];
      const profilesData: Record<string, { name: string; email: string }> = {};

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, name, email')
          .in('user_id', userIds);

        profiles?.forEach(profile => {
          profilesData[profile.user_id] = {
            name: profile.name,
            email: profile.email
          };
        });
      }

      // Combine logs with profile data
      const logsWithProfiles = data?.map(log => ({
        ...log,
        profiles: profilesData[log.user_id] || { name: 'Unknown', email: 'unknown@example.com' }
      })) || [];

      setLogs(logsWithProfiles);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'user_signup':
        return <UserPlus className="w-4 h-4" />;
      case 'user_login':
        return <LogIn className="w-4 h-4" />;
      case 'invitation_created':
        return <User className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'user_signup':
        return "bg-green-100 text-green-800";
      case 'user_login':
        return "bg-blue-100 text-blue-800";
      case 'invitation_created':
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === "" || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    
    return matchesSearch && matchesAction;
  });

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">Admin privileges required to view audit logs.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Audit Logs
            </CardTitle>
            <CardDescription>
              Track all system activities including user signups, logins, and invitations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs by action, email, or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="user_signup">User Signups</SelectItem>
                  <SelectItem value="user_login">User Logins</SelectItem>
                  <SelectItem value="invitation_created">Invitations</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={fetchAuditLogs} variant="outline">
                Refresh
              </Button>
            </div>

            <ScrollArea className="h-[600px]">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4" />
                  <p>No audit logs found matching your criteria.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredLogs.map((log) => (
                    <Card key={log.id} className="border-l-4 border-l-primary/20">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-full bg-primary/10">
                              {getActionIcon(log.action)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge 
                                  variant="secondary" 
                                  className={getActionColor(log.action)}
                                >
                                  {log.action.replace('_', ' ').toUpperCase()}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
                                </span>
                              </div>
                              <div className="text-sm">
                                <p className="font-medium">
                                  {log.profiles?.name || 'Unknown User'} ({log.profiles?.email})
                                </p>
                                {log.details && (
                                  <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                                    <pre className="whitespace-pre-wrap">
                                      {JSON.stringify(log.details, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuditLogs;