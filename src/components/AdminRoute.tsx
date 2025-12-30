import { Navigate, Outlet } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext';
import { Loader2 } from 'lucide-react';
import Header from '@/components/Header';

const AdminRoute = () => {
    const { user, loading, isAuthenticated } = useAppContext();

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Allow access if user is admin OR for demo purposes (not authenticated = demo mode)
    const hasAccess = (user && user.role === 'admin') || !isAuthenticated;

    if (isAuthenticated && user && user.role !== 'admin') {
        // Only block if authenticated but not admin
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen relative flex flex-col">
            <Header />
            <main className="flex-1 pt-24 px-4 pb-20 container mx-auto max-w-7xl animate-fade-in relative z-10">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminRoute;

