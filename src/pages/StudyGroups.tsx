import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SUBJECTS } from "@/types/learning";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageTransition from "@/components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import { Users, CheckCircle, Loader2, Plus, MessageCircle } from "lucide-react";
import { groupsService, StudyGroup } from "@/services/groups.service";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const StudyGroups = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<Record<string, boolean>>({});
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await groupsService.getAll();
        setGroups(data);
        // Mark groups user is already a member of
        const joinedMap: Record<string, boolean> = {};
        data.forEach(g => {
          if (g.members.includes('mock-user-1')) {
            joinedMap[g.id] = true;
          }
        });
        setJoined(joinedMap);
      } catch (error) {
        toast.error("Failed to load study groups");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const [form, setForm] = useState({
    name: "",
    subject: "",
    description: "",
  });

  const createGroup = async () => {
    if (!form.name || !form.subject) return;

    setCreating(true);
    try {
      const newGroup = await groupsService.create({
        name: form.name,
        subject: form.subject,
        description: form.description
      });
      setGroups([newGroup, ...groups]);
      setJoined(prev => ({ ...prev, [newGroup.id]: true }));
      setForm({ name: "", subject: "", description: "" });
      toast.success("Study group created!");

      // Navigate to chat after creating
      navigate(`/groups/${newGroup.id}/chat`);
    } catch (error) {
      console.error("Failed to create group", error);
      toast.error("Failed to create group");
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (id: string) => {
    setJoining(prev => ({ ...prev, [id]: true }));
    try {
      const result = await groupsService.join(id);

      if (result.joined) {
        setJoined(prev => ({ ...prev, [id]: true }));
        // Update member count
        setGroups(prev => prev.map(g =>
          g.id === id ? { ...g, members: result.members, memberCount: result.members.length } : g
        ));
        toast.success("Joined group successfully!");

        // Navigate to chat after joining
        navigate(`/groups/${id}/chat`);
      } else {
        // User left the group
        setJoined(prev => ({ ...prev, [id]: false }));
        setGroups(prev => prev.map(g =>
          g.id === id ? { ...g, members: result.members, memberCount: result.members.length } : g
        ));
        toast.info("Left group");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to join group");
    } finally {
      setJoining(prev => ({ ...prev, [id]: false }));
    }
  };

  const openChat = (groupId: string) => {
    navigate(`/groups/${groupId}/chat`);
  };

  return (
    <PageTransition className="container mx-auto px-4 py-10 space-y-10 max-w-5xl">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar / Create Form */}
        <motion.div
          className="w-full md:w-1/3"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="sticky top-24 border-t-4 border-t-pink-500 shadow-xl bg-background/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-pink-500" />
                New Group
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Group Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled={creating}
              />

              <Select
                value={form.subject}
                onValueChange={(v) => setForm({ ...form, subject: v })}
                disabled={creating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Textarea
                placeholder="What is this group about?"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={4}
                disabled={creating}
              />

              <Button
                className="w-full bg-pink-600 hover:bg-pink-700"
                onClick={createGroup}
                disabled={!form.name || !form.subject || creating}
              >
                {creating ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</>
                ) : (
                  "Create Study Group"
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <div className="w-full md:w-2/3 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8 text-pink-500" />
              Find Your Squad
            </h2>
          </div>

          {groups.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 border-2 border-dashed rounded-xl bg-secondary/20"
            >
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No active groups. Why not start one?</p>
            </motion.div>
          )}

          <motion.div
            className="grid gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            <AnimatePresence>
              {loading ? (
                // Skeleton Loading State
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="bg-background/40 backdrop-blur-md">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <Skeleton className="h-6 w-48 mb-2" />
                          <Skeleton className="h-4 w-32 rounded-full" />
                          <Skeleton className="h-4 w-full mt-4" />
                          <Skeleton className="h-4 w-3/4 mt-2" />
                          <Skeleton className="h-4 w-24 mt-4" />
                        </div>
                        <Skeleton className="h-9 w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                groups.map((g) => (
                  <motion.div
                    key={g.id}
                    variants={{
                      hidden: { y: 20, opacity: 0 },
                      visible: { y: 0, opacity: 1 }
                    }}
                    layout
                  >
                    <Card className="hover:shadow-md transition-shadow border-l-4 border-l-transparent hover:border-l-pink-400 group bg-background/40 backdrop-blur-md">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold group-hover:text-pink-600 transition-colors">{g.name}</h3>
                            <span className="inline-block mt-2 px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-xs rounded-full font-medium">
                              {g.subject}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {joined[g.id] && (
                              <motion.div whileTap={{ scale: 0.95 }}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openChat(g.id)}
                                  className="border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950"
                                >
                                  <MessageCircle className="h-4 w-4 mr-2" />
                                  Chat
                                </Button>
                              </motion.div>
                            )}
                            <motion.div whileTap={{ scale: 0.95 }}>
                              <Button
                                size="sm"
                                variant={joined[g.id] ? "outline" : "default"}
                                className={`transition-all duration-300 ${joined[g.id] ? "border-green-500 text-green-600 hover:text-green-700 hover:bg-green-50" : ""}`}
                                onClick={() => handleJoin(g.id)}
                                disabled={joining[g.id]}
                              >
                                {joining[g.id] ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : joined[g.id] ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" /> Joined
                                  </>
                                ) : (
                                  "Join Group"
                                )}
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                        <p className="text-muted-foreground mt-4 leading-relaxed">{g.description}</p>
                        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{g.memberCount || g.members?.length || 1} members</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default StudyGroups;
