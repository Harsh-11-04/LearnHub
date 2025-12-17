import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppContext } from '@/contexts/AppContext';
import { Code2, Github, ArrowLeft } from 'lucide-react';

const AuthPage: React.FC = () => {
  const { setUser, setCurrentPage } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleGoogleAuth = () => {
    const mockUser = {
      id: '1',
      name: 'Tanvi Ganotra',
      email: 'tanvi123@example.com',
      avatar: 'https://github.com/shadcn.png',
      techStack: ['React', 'Bootstrap', 'TailwindCSS'],
    };
    setUser(mockUser);
    setCurrentPage('feed');
  };

  const handleEmailAuth = (isSignUp: boolean) => {
    if (!email || !password || (isSignUp && !name)) return;

    const mockUser = {
      id: '1',
      name: isSignUp ? name : 'Tanvi Ganotra',
      email,
      avatar: 'https://github.com/TanviGanotra30',
      techStack: ['React', 'Bootstrap', 'TailwindCSS'],
    };
    setUser(mockUser);
    setCurrentPage('feed');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center transition-colors duration-700 bg-gradient-to-br from-slate-100 via-slate-200 to-cyan-100 dark:from-slate-900 dark:via-slate-800 dark:to-cyan-900 p-4">

      {/* Back to Home Button (Top-Left Corner) */}
      <div className="absolute top-6 left-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage('landing')}
          className="flex items-center gap-2 border-slate-400 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <Card className="w-full max-w-md border border-slate-300 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-800/50 backdrop-blur-md transition-all">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-br from-cyan-400/20 to-orange-400/20 dark:from-cyan-500/20 dark:to-orange-500/20">
              <Code2 className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white transition-colors">
            Welcome to LearnHub
          </CardTitle>
          <p className="text-slate-600 dark:text-slate-300 transition-colors">
            Join the developer community
          </p>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 border border-slate-300 dark:border-slate-700">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* Sign In Tab */}
            <TabsContent value="signin" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tanvi123@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                onClick={() => handleEmailAuth(false)}
              >
                Sign In
              </Button>
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="signup" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Tanvi Ganotra"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="tanvi123@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                onClick={() => handleEmailAuth(true)}
              >
                Sign Up
              </Button>
            </TabsContent>
          </Tabs>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-300 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-100 dark:bg-slate-800 px-2 text-slate-500 dark:text-slate-400 transition-colors">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full gap-2 border-slate-400 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
            onClick={handleGoogleAuth}
          >
            <Github className="h-4 w-4" />
            Continue with GitHub
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
