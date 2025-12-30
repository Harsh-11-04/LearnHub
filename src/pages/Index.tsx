import { Button } from "@/components/ui/button";
import { BookOpen, Users, MessageSquare, Award, TrendingUp, Search } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Learn Together, Grow Together
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          A peer-to-peer learning and resource sharing platform where students
          collaborate, share knowledge, and support each other academically.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg" className="text-lg">
            <Link to="/resources">Browse Resources</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-lg">
            <Link to="/groups">Explore Study Groups</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything You Need for Collaborative Learning
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </section>

      {/* Stats Section (Academic-safe, indicative values) */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index}>
              <div className="text-4xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string; }) => (
  <div className="p-6 rounded-lg border bg-card hover:shadow-lg transition-all">
    <Icon className="w-12 h-12 text-primary mb-4" />
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const features = [
  {
    icon: BookOpen,
    title: "Share Learning Resources",
    description:
      "Upload and access notes, PDFs, videos, and useful links shared by peers.",
  },
  {
    icon: Users,
    title: "Study Groups",
    description:
      "Create or join subject-based study groups to collaborate and learn together.",
  },
  {
    icon: MessageSquare,
    title: "Peer-to-Peer Help",
    description:
      "Ask questions and receive answers from fellow learners in a collaborative environment.",
  },
  {
    icon: Award,
    title: "Recognition & Badges",
    description:
      "Earn points and badges for contributing resources and helping others learn.",
  },
  {
    icon: TrendingUp,
    title: "Track Contributions",
    description:
      "Monitor your shared resources, answered questions, and learning activity.",
  },
  {
    icon: Search,
    title: "Discover Learners",
    description:
      "Find peers with similar subjects and learning interests to study together.",
  },
];

const stats = [
  { value: "Prototype", label: "Academic Project" },
  { value: "Multiple", label: "Learning Modules" },
  { value: "Scalable", label: "System Design" },
  { value: "Future-Ready", label: "Backend Integration" },
];

export default Index;
