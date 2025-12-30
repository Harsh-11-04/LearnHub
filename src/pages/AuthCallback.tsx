import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = async () => {
            if (!isSupabaseConfigured || !supabase) {
                // No Supabase, redirect to auth
                navigate('/auth');
                return;
            }

            try {
                // Get the session from the URL
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('Auth callback error:', error);
                    navigate('/auth');
                    return;
                }

                if (session) {
                    // Check if profile exists, create if not
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (!profile) {
                        // Create profile for new user
                        await supabase.from('profiles').insert({
                            id: session.user.id,
                            email: session.user.email || '',
                            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                            avatar_url: session.user.user_metadata?.avatar_url,
                        });
                    }

                    // Redirect to dashboard
                    navigate('/dashboard');
                } else {
                    navigate('/auth');
                }
            } catch (error) {
                console.error('Unexpected error in auth callback:', error);
                navigate('/auth');
            }
        };

        handleCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <h2 className="text-2xl font-bold">Completing sign in...</h2>
                <p className="text-muted-foreground">Please wait while we set up your account</p>
            </div>
        </div>
    );
}
