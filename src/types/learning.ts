// src/types/learning.ts
// ==================================================
// Peer-to-Peer Learning & Resource Sharing Platform
// Core Domain Models (FINAL VERSION)
// ==================================================

// -----------------------------
// Shared Types
// -----------------------------

export type ResourceType = "notes" | "pdf" | "video" | "link";

// -----------------------------
// Resource Model
// -----------------------------

export interface Resource {
  id: string;
  title: string;
  description: string;
  subject: string;
  type: ResourceType;

  // Either file_url or link will be used depending on type
  file_url?: string;
  link?: string;

  tags: string[];

  uploaded_by: string; // user id
  uploader_name?: string;

  upload_date: string; // ISO string
  created_at?: string; // optional (DB generated)

  views: number;
  downloads: number;
  average_rating: number; // 1–5
}

// -----------------------------
// Study Group / Learning Circle
// -----------------------------

export interface StudyGroup {
  id: string;
  name: string;
  subject: string;
  description: string;

  members: string[]; // user ids
  member_count?: number;

  created_by: string; // user id
  created_at: string;
}

// -----------------------------
// Q&A Forum Models
// -----------------------------

export interface Question {
  id: string;
  title: string;
  body: string;
  subject: string;

  asked_by: string; // user id
  asker_name?: string;

  views: number;
  answer_count?: number;
  created_at: string;
}

export interface Answer {
  id: string;
  question_id: string;
  body: string;

  answered_by: string; // user id
  answerer_name?: string;

  is_best_answer: boolean;
  upvotes: number;
  created_at: string;
}

// -----------------------------
// User Profile (Gamification)
// -----------------------------

export interface UserProfile {
  id: string;
  name: string;
  email: string;

  avatar_url?: string;
  bio?: string;

  subjects: string[];
  currently_learning: string[];
  can_help_with: string[];

  contribution_points: number;
  resources_shared: number;
  questions_answered: number;

  badges?: string[];

  university?: string;
  year?: string;
  created_at: string;
}

// -----------------------------
// Constants (UI Helpers)
// -----------------------------

export const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Programming",
  "English",
  "History",
  "Geography",
  "Economics",
  "Business Studies",
  "Accounting",
  "Engineering",
  "Medicine",
  "Arts",
  "Languages",
  "Psychology",
  "Sociology",
  "Political Science",
  "Other",
];

export const RESOURCE_TYPES: {
  value: ResourceType;
  label: string;
  icon: string;
}[] = [
  { value: "notes", label: "Notes", icon: "📝" },
  { value: "pdf", label: "PDF Document", icon: "📄" },
  { value: "video", label: "Video Tutorial", icon: "🎥" },
  { value: "link", label: "External Link", icon: "🔗" },
];

export const BADGES = [
  { name: "Beginner", points: 0, icon: "🌱" },
  { name: "Contributor", points: 50, icon: "⭐" },
  { name: "Helper", points: 100, icon: "🤝" },
  { name: "Expert", points: 250, icon: "🏆" },
  { name: "Mentor", points: 500, icon: "👨‍🏫" },
  { name: "Legend", points: 1000, icon: "🎓" },
];
