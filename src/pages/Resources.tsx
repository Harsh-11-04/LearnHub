import { useState } from "react";
import { Resource, RESOURCE_TYPES, SUBJECTS } from "@/types/learning";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const Resources = () => {
  const [resources, setResources] = useState<Resource[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "",
    type: "notes",
    link: "",
  });

  const addResource = () => {
    if (!form.title || !form.subject) return;

    const newResource: Resource = {
      id: Date.now().toString(),
      title: form.title,
      description: form.description,
      subject: form.subject,
      type: form.type as any,
      link: form.link,
      tags: [],
      uploaded_by: "demo-user",
      uploader_name: "Student",
      upload_date: new Date().toISOString(),
      views: 0,
      downloads: 0,
      average_rating: 0,
    };

    setResources([newResource, ...resources]);
    setForm({ title: "", description: "", subject: "", type: "notes", link: "" });
  };

  const rateResource = (id: string, rating: number) => {
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, average_rating: rating } : r))
    );
  };

  return (
    <div className="container mx-auto px-4 py-10 space-y-10">
      {/* Upload Form */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Share a Learning Resource</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <Input
            placeholder="Resource Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <Select value={form.subject} onValueChange={(v) => setForm({ ...form, subject: v })}>
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

          <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Resource Type" />
            </SelectTrigger>
            <SelectContent>
              {RESOURCE_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.icon} {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Resource Link (optional)"
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
          />
        </div>

        <Textarea
          className="mt-4"
          placeholder="Short description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <Button className="mt-4" onClick={addResource}>
          Add Resource
        </Button>
      </Card>

      {/* Resource Feed */}
      <div className="grid md:grid-cols-2 gap-6">
        {resources.map((r) => (
          <Card key={r.id} className="p-5 space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{r.title}</h3>
              <span className="text-sm text-muted-foreground">{r.subject}</span>
            </div>
            <p className="text-sm text-muted-foreground">{r.description}</p>

            {r.link && (
              <a href={r.link} target="_blank" className="text-primary text-sm">
                View Resource
              </a>
            )}

            {/* Rating */}
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`cursor-pointer ${r.average_rating >= star ? "text-yellow-400" : "text-gray-300"}`}
                  onClick={() => rateResource(r.id, star)}
                >
                  ★
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Resources;
