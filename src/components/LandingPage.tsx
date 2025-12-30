import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Sparkles,
  Users,
  Code2,
  TrendingUp,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from './PageTransition';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'GitHub-style contribution graphs and activity tracking',
    },
    {
      icon: Users,
      title: 'Connect with Peers',
      description: 'Find study partners with matching tech stacks',
    },
    {
      icon: Code2,
      title: 'Code Together',
      description: 'Real-time pair programming with Monaco editor',
    },
    {
      icon: Zap,
      title: 'Stay Organized',
      description: 'Priority stack for assignments, quizzes, and doubts',
    },
  ];

  return (
    <PageTransition className="min-h-screen">
      <div className="container mx-auto px-4 py-20">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-20 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Student-Centric Learning Platform</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            LearnHub
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Your command center for academic success. Track progress, collaborate with peers, and ace your studies.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/demo')}
              className="gap-2 text-lg px-8 py-6"
            >
              View Demo
              <ArrowRight className="h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/auth')}
              className="gap-2 text-lg px-8 py-6"
            >
              Sign In
            </Button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, staggerChildren: 0.1 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="p-6 h-full bg-background/60 backdrop-blur-md border-primary/10 hover:border-primary/30 transition-all">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 rounded-full bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="p-12 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-muted-foreground mb-6">
              Join thousands of students already using LearnHub
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="gap-2"
            >
              Create Account
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default LandingPage;
