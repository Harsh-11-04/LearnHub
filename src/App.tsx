import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AppProvider } from "@/contexts/AppContext";
import AppLayout from "@/components/AppLayout";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load route components for better performance
const LandingPage = lazy(() => import("@/components/LandingPage"));
const AuthPage = lazy(() => import("@/components/AuthPage"));
const AuthCallback = lazy(() => import("@/pages/AuthCallback"));
const DemoDashboard = lazy(() => import("@/pages/DemoDashboard"));
const DemoPeerMatch = lazy(() => import("@/pages/DemoPeerMatch"));
const DemoCodeSpace = lazy(() => import("@/pages/DemoCodeSpace"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const FeedPage = lazy(() => import("@/components/FeedPage"));
const ChatPage = lazy(() => import("@/components/ChatPage"));
const ProfilePage = lazy(() => import("@/components/ProfilePage"));
const Resources = lazy(() => import("@/pages/Resources"));
const StudyGroups = lazy(() => import("@/pages/StudyGroups"));
const GroupChat = lazy(() => import("@/pages/GroupChat"));
const QnA = lazy(() => import("@/pages/QnA"));
const Assignments = lazy(() => import("@/pages/Assignments"));
const Quizzes = lazy(() => import("@/pages/Quizzes"));
const Doubts = lazy(() => import("@/pages/Doubts"));
const PeerMatch = lazy(() => import("@/pages/PeerMatch"));
const CodeSpace = lazy(() => import("@/pages/CodeSpace"));
// New interactive pages
const LeaderboardPage = lazy(() => import("@/pages/LeaderboardPage"));
const StudyRoomsPage = lazy(() => import("@/pages/StudyRoomsPage"));
const ActivityPage = lazy(() => import("@/pages/ActivityPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
// Admin pages
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const UserManagement = lazy(() => import("@/pages/UserManagement"));
const ContentModeration = lazy(() => import("@/pages/ContentModeration"));
const AdminAnalytics = lazy(() => import("@/pages/AdminAnalytics"));
const AdminUserWork = lazy(() => import("@/pages/AdminUserWork"));
const AdminContentManagement = lazy(() => import("@/pages/AdminContentManagement"));
const SupabaseTest = lazy(() => import("@/pages/SupabaseTest"));

const queryClient = new QueryClient();

const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="space-y-4 w-full max-w-md p-8">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      }>
        <Routes location={location} key={location.pathname}>
          {/* Public Routes: Accessible by anyone */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/demo" element={<DemoDashboard />} />
          <Route path="/demo/peers" element={<DemoPeerMatch />} />
          <Route path="/demo/code" element={<DemoCodeSpace />} />
          <Route path="/test" element={<SupabaseTest />} />

          {/* Protected Routes: Wrapped in AppLayout */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/peers" element={<PeerMatch />} />
            <Route path="/code" element={<CodeSpace />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/groups" element={<StudyGroups />} />
            <Route path="/groups/:groupId/chat" element={<GroupChat />} />
            <Route path="/qa" element={<QnA />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/quizzes" element={<Quizzes />} />
            <Route path="/doubts" element={<Doubts />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/study-rooms" element={<StudyRoomsPage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* Admin Routes - Protected */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/moderation" element={<ContentModeration />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/user-work" element={<AdminUserWork />} />
              <Route path="/admin/content" element={<AdminContentManagement />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

import GlobalBackground from "@/components/GlobalBackground";
import { CommandPalette } from "@/components/CommandPalette";
import AdminRoute from "@/components/AdminRoute";

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AppProvider>
            <BrowserRouter>
              <GlobalBackground />
              <CommandPalette />
              <Toaster />
              <Sonner />
              <AppRoutes />
            </BrowserRouter>
          </AppProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
