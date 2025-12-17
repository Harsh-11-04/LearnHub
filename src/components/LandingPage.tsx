
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/contexts/AppContext';
import {
  Code2,
  Users,
  MessageCircle,
  Github,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const { setCurrentPage } = useAppContext();

  const features = [
    {
      icon: Code2,
      title: 'Developer Feed',
      description:
        'Share code snippets, project updates, and connect with fellow learners.',
    },
    {
      icon: MessageCircle,
      title: 'Real-time Chat',
      description:
        'Instant messaging with learners worldwide, discuss ideas and collaborate.',
    },
    {
      icon: Users,
      title: 'Dev Study Groups',
      description:
        'Form teams, work on open-source projects, and build amazing things together.',
    },
  ];
return (
  <div className="min-h-screen transition-colors duration-700 bg-gradient-to-br from-slate-100 via-slate-200 to-cyan-100 dark:from-slate-900 dark:via-slate-800 dark:to-cyan-900 pt-[72px]  overflow-x-hidden">
    {/* 
      pt-[72px] → pushes content down exactly the navbar height (no extra gap)
      Remove if your navbar isn't fixed 
    */}
    <div className="container mx-auto px-4">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="flex justify-center mb-6">
          <Badge
            variant="secondary"
            className="gap-2 text-sm px-4 py-2 border border-cyan-500/30 bg-gradient-to-r from-cyan-400/20 to-orange-400/20 dark:from-cyan-500/20 dark:to-orange-500/20"
          >
            <Sparkles className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
            Now in Beta
          </Badge>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-500 via-orange-400 to-amber-400 bg-clip-text text-transparent">
          LearnHub
        </h1>

        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto transition-colors">
          The ultimate collaboration platform for learners. Share updates, chat live, and form Study Groups to build the next big thing.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => setCurrentPage('auth')}
            className="gap-2 text-lg px-8 py-6 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white transition-all"
          >
            Get Started
            <ArrowRight className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="gap-2 text-lg px-8 py-6 border-orange-400/50 text-orange-500 dark:text-orange-400 hover:bg-orange-500/10 transition-all"
          >
            <Github className="h-5 w-5" />
            View on GitHub
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {features.map((feature, index) => (
          <Card
            key={index}
            className="border-2 border-slate-300 dark:border-slate-700 hover:border-cyan-500/50 transition-all bg-slate-100/60 dark:bg-slate-800/50 backdrop-blur rounded-2xl"
          >
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-gradient-to-br from-cyan-400/20 to-orange-400/20 dark:from-cyan-500/20 dark:to-orange-500/20">
                  <feature.icon className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 transition-colors">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Section */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white transition-colors">
          Join the Developer Community
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Active learners', value: '10K+' },
            { label: 'Projects Created', value: '2.5K+' },
            { label: 'Messages Sent', value: '500K+' },
            { label: 'Study Groups Formed', value: '1.2K+' },
          ].map((stat, index) => (
            <div key={index}>
              <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-cyan-500 to-orange-400 bg-clip-text mb-2">
                {stat.value}
              </div>
              <div className="text-slate-700 dark:text-slate-400 transition-colors">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
};
export default LandingPage;
