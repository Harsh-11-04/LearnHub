import React from "react";
import { useAppContext } from "@/contexts/AppContext";
import Header from "@/components/Header";
import { Outlet, Navigate } from "react-router-dom";

const AppLayout: React.FC = () => {
  // Use Context API to check authentication state
  const { isAuthenticated, loading } = useAppContext();

  if (loading) return <div>Loading...</div>;

  // PROTECTION LOGIC:
  // If user is not authenticated, redirect them to the Landing Page (/)
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If authenticated, render the main layout
  return (
    <div className="min-h-screen relative flex flex-col">
      <Header />
      {/* 
        Main Content Area 
        - Z-index ensures it sits above the 3D background
        - pb-20 adds space at bottom for scrolling
      */}
      <main className="flex-1 pt-24 px-4 pb-20 container mx-auto max-w-7xl animate-fade-in relative z-10">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
