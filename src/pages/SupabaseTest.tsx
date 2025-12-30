import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function SupabaseTest() {
    const [status, setStatus] = useState<string>('Testing...');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        testSupabase();
    }, []);

    const testSupabase = async () => {
        if (!supabase) {
            setStatus('❌ Supabase not configured');
            setError('supabase client is null');
            return;
        }

        try {
            // Test 1: Check if we can reach Supabase
            const { data, error } = await supabase.auth.getSession();
            if (error) {
                setStatus('❌ Supabase connection failed');
                setError(error.message);
                return;
            }

            setStatus('✅ Supabase connected successfully!');
        } catch (err: any) {
            setStatus('❌ Error connecting to Supabase');
            setError(err.message || String(err));
        }
    };

    const testSignup = async () => {
        if (!supabase) return;

        setStatus('Testing signup...');
        setError('');

        try {
            const testEmail = `test${Date.now()}@example.com`;
            const { data, error } = await supabase.auth.signUp({
                email: testEmail,
                password: 'password123',
                options: {
                    data: { name: 'Test User' }
                }
            });

            if (error) {
                setStatus('❌ Signup failed');
                setError(error.message);
                return;
            }

            if (data.session) {
                setStatus('✅ Signup successful! (Email confirmation disabled)');
            } else if (data.user && !data.session) {
                setStatus('📧 Signup successful but requires email confirmation');
                setError('User created but session not available. Email confirmation may still be enabled.');
            }
        } catch (err: any) {
            setStatus('❌ Signup error');
            setError(err.message || String(err));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="p-6 max-w-md w-full space-y-4">
                <h1 className="text-2xl font-bold">Supabase Diagnostic</h1>

                <div className="space-y-2">
                    <div className="text-lg">{status}</div>
                    {error && (
                        <div className="text-sm text-red-500 bg-red-50 p-3 rounded">
                            <strong>Error:</strong> {error}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Button onClick={testSupabase} className="w-full">
                        Test Connection
                    </Button>
                    <Button onClick={testSignup} className="w-full" variant="outline">
                        Test Signup
                    </Button>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                    <div><strong>URL:</strong> {(import.meta.env.VITE_SUPABASE_URL as string) || 'Not set'}</div>
                    <div><strong>Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Not set'}</div>
                </div>
            </Card>
        </div>
    );
}
