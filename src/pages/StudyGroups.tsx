import { useState } from "react";
import { StudyGroup, SUBJECTS } from "@/types/learning";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const StudyGroups = () => {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [form, setForm] = useState({
    name: "",
    subject: "",
    description: "",
  });

  const createGroup = () => {
    if (!form.name || !form.subject) return;

    const newGroup: StudyGroup = {
      id: Date.now().toString(),
      name: form.name,
      subject: form.subject,
      description: form.description,
      members: [],
      created_by: "demo-user",
      created_at: new Date().toISOString(),
    };

    setGroups([newGroup, ...groups]);
    setForm({ name: "", subject: "", description: "" });
  };

  return (
    <div className="container mx-auto px-4 py-10 space-y-10">
      {/* Create Group */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Create Study Group</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <Input
            placeholder="Group Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <Select
            value={form.subject}
            onValueChange={(v) => setForm({ ...form, subject: v })}
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
        </div>

        <Textarea
          className="mt-4"
          placeholder="Group description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <Button className="mt-4" onClick={createGroup}>
          Create Group
        </Button>
      </Card>

      {/* Groups List */}
      <div className="grid md:grid-cols-2 gap-6">
        {groups.map((g) => (
          <Card key={g.id} className="p-5 space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{g.name}</h3>
              <span className="text-sm text-muted-foreground">
                {g.subject}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{g.description}</p>

            <Button size="sm" variant="outline">
              Join Group
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudyGroups;
