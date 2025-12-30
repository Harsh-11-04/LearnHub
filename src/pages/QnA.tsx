import { useState, useEffect } from "react";
import { SUBJECTS } from "@/types/learning";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useAppContext } from "@/contexts/AppContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageTransition from "@/components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, ThumbsUp, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";

import { qnaService, Question, Answer } from "@/services/qna.service";

/**
 * QnA Page
 * This page demonstrates peer-to-peer question answering with animations.
 */

const QnA = () => {
  const { user } = useAppContext();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, Answer[]>>({});
  const [expandedQ, setExpandedQ] = useState<string | null>(null);

  const [qForm, setQForm] = useState({
    title: "",
    body: "",
    subject: "",
  });

  const [aForm, setAForm] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      const data = await qnaService.getQuestions();
      setQuestions(data);

      // Pre-load answers for visible questions (simplified)
      data.forEach(async (q) => {
        const ans = await qnaService.getAnswers(q.id);
        setAnswers(prev => ({ ...prev, [q.id]: ans }));
      });
    };
    load();
  }, []);

  const askQuestion = async () => {
    if (!qForm.title || !qForm.subject || !user) return;

    try {
      const newQuestion = await qnaService.createQuestion({
        title: qForm.title,
        content: qForm.body,
        tags: [qForm.subject]
      });
      setQuestions([newQuestion, ...questions]);
      setQForm({ title: "", body: "", subject: "" });
    } catch (e) {
      console.error(e);
    }
  };

  const addAnswer = async (questionId: string) => {
    if (!aForm[questionId] || !user) return;

    try {
      const newAnswer = await qnaService.addAnswer(questionId, aForm[questionId]);
      setAnswers(prev => ({
        ...prev,
        [questionId]: [...(prev[questionId] || []), newAnswer],
      }));
      setAForm({ ...aForm, [questionId]: "" });
      if (expandedQ !== questionId) setExpandedQ(questionId);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedQ(expandedQ === id ? null : id);
  };

  return (
    <PageTransition className="container mx-auto px-4 py-10 space-y-8 max-w-4xl">
      {/* Ask Question */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6 border-l-4 border-l-cyan-500 shadow-md bg-background/60 backdrop-blur-md">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-cyan-500" />
            Ask the Community
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              placeholder="What's your question?"
              value={qForm.title}
              onChange={(e) => setQForm({ ...qForm, title: e.target.value })}
              className="text-lg font-medium"
            />

            <Select
              value={qForm.subject}
              onValueChange={(v) => setQForm({ ...qForm, subject: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Textarea
            className="mt-4 min-h-[100px]"
            placeholder="Describe your problem in detail..."
            value={qForm.body}
            onChange={(e) => setQForm({ ...qForm, body: e.target.value })}
          />

          <motion.div className="mt-4 flex justify-end" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={askQuestion} disabled={!qForm.title}>
              Post Question
            </Button>
          </motion.div>
        </Card>
      </motion.div>

      {/* Empty State */}
      <AnimatePresence>
        {questions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-muted-foreground py-12"
          >
            <p className="text-lg">No questions yet. Be the first to ask!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Questions List */}
      <div className="space-y-6">
        <AnimatePresence>
          {questions.map((q) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              layout
            >
              <Card className="overflow-hidden hover:border-cyan-200 dark:hover:border-cyan-900 transition-colors bg-background/40 backdrop-blur-md">
                <CardHeader className="p-6 pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold hover:text-cyan-600 transition-colors cursor-pointer" onClick={() => toggleExpand(q.id)}>
                        {q.title}
                      </h3>
                      <div className="flex gap-2 text-xs text-muted-foreground mt-2">
                        <span className="bg-secondary px-2 py-1 rounded-md">{q.tags?.[0] || 'General'}</span>
                        <span className="flex items-center gap-1">Asked by <span className="font-medium text-foreground">{q.author?.name || 'Unknown'}</span></span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => toggleExpand(q.id)}>
                      {expandedQ === q.id ? <ChevronUp /> : <ChevronDown />}
                    </Button>
                  </div>
                  <p className="text-muted-foreground mt-2">{q.content}</p>
                </CardHeader>

                <CardContent className="p-6 pt-0">
                  {/* Answers Section */}
                  <AnimatePresence>
                    {expandedQ === q.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t mt-4 pt-4 space-y-4">
                          <h4 className="font-semibold text-sm text-muted-foreground">
                            {answers[q.id]?.length || 0} Answers
                          </h4>

                          {(answers[q.id] || []).map((a) => (
                            <motion.div
                              key={a.id}
                              className="bg-secondary/20 p-4 rounded-lg flex gap-3"
                              initial={{ x: -10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                            >
                              <div className="flex flex-col items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-green-500">
                                  <ThumbsUp className="h-4 w-4" />
                                </Button>
                                <span className="text-xs font-bold">{a.upvotes}</span>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm">{a.content}</p>
                                <div className="text-xs text-muted-foreground mt-2 flex justify-between">
                                  <span>Answered by {a.author?.name || 'Unknown'}</span>
                                  {a.isAccepted && (
                                    <span className="text-green-600 flex items-center gap-1">
                                      <CheckCircle className="h-3 w-3" /> Best Answer
                                    </span>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}

                          {/* Answer Input */}
                          <div className="flex gap-3 items-start mt-4">
                            <Input
                              placeholder="Know the answer? Share it here..."
                              value={aForm[q.id] || ""}
                              onChange={(e) =>
                                setAForm({ ...aForm, [q.id]: e.target.value })
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') addAnswer(q.id);
                              }}
                            />
                            <Button size="sm" onClick={() => addAnswer(q.id)}>
                              Answer
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export default QnA;
