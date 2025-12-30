import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Brain, Clock, Trophy, Play, CheckCircle, Check, X,
    XCircle, RotateCcw, Timer, Zap, Award, Target
} from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { toast } from 'sonner';

interface Quiz {
    id: string;
    title: string;
    subject: string;
    questions: number;
    duration: string;
    durationSeconds: number;
    difficulty: 'easy' | 'medium' | 'hard';
    status: 'available' | 'in-progress' | 'completed';
    score?: number;
    dueDate?: string;
}

interface QuizQuestion {
    question: string;
    options: string[];
    correct: number;
}

interface QuizResult {
    quiz: Quiz;
    answers: Record<number, number>;
    questions: QuizQuestion[];
    score: number;
    correctCount: number;
    totalQuestions: number;
    timeTaken: number;
}

const mockQuizzes: Quiz[] = [
    {
        id: '1',
        title: 'OS Mid-term Quiz',
        subject: 'Operating Systems',
        questions: 5,
        duration: '5 mins',
        durationSeconds: 5 * 60,
        difficulty: 'hard',
        status: 'available',
        dueDate: 'Tomorrow'
    },
    {
        id: '2',
        title: 'DBMS Practice Test',
        subject: 'Database Management',
        questions: 5,
        duration: '5 mins',
        durationSeconds: 5 * 60,
        difficulty: 'medium',
        status: 'available',
        dueDate: '3 days'
    },
    {
        id: '3',
        title: 'JavaScript Fundamentals',
        subject: 'Web Development',
        questions: 5,
        duration: '5 mins',
        durationSeconds: 5 * 60,
        difficulty: 'easy',
        status: 'completed',
        score: 88
    },
    {
        id: '4',
        title: 'Data Structures Quiz 2',
        subject: 'Computer Science',
        questions: 5,
        duration: '5 mins',
        durationSeconds: 5 * 60,
        difficulty: 'hard',
        status: 'completed',
        score: 72
    }
];

const mockQuestions: QuizQuestion[] = [
    { question: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correct: 1 },
    { question: 'Which data structure uses LIFO?', options: ['Queue', 'Stack', 'Array', 'Tree'], correct: 1 },
    { question: 'What does SQL stand for?', options: ['Structured Query Language', 'Simple Query Language', 'Standard Query Logic', 'Sequential Query Language'], correct: 0 },
    { question: 'What is the main purpose of an index in a database?', options: ['Store data', 'Speed up queries', 'Encrypt data', 'Backup data'], correct: 1 },
    { question: 'Which React hook is used for side effects?', options: ['useState', 'useContext', 'useEffect', 'useReducer'], correct: 2 },
];

const Quizzes = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>(mockQuizzes);
    const [filter, setFilter] = useState<'all' | 'available' | 'completed'>('all');
    const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);
    const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

    // Timer effect
    useEffect(() => {
        if (!activeQuiz || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    toast.warning('Time is up! Submitting quiz...');
                    handleSubmitQuiz();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [activeQuiz, timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getTimerColor = () => {
        if (timeLeft <= 60) return 'text-red-500 animate-pulse';
        if (timeLeft <= 300) return 'text-orange-500';
        return 'text-muted-foreground';
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-500/10 text-green-500';
            case 'medium': return 'bg-yellow-500/10 text-yellow-500';
            case 'hard': return 'bg-red-500/10 text-red-500';
            default: return '';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    const filteredQuizzes = filter === 'all'
        ? quizzes
        : quizzes.filter(q => q.status === filter);

    const startQuiz = (quiz: Quiz) => {
        setActiveQuiz(quiz);
        setCurrentQuestion(0);
        setAnswers({});
        setTimeLeft(quiz.durationSeconds || 300);
        setStartTime(Date.now());
        setShowFeedback(false);
        setQuizResult(null);
        toast.info(`Starting: ${quiz.title}`);
    };

    const selectAnswer = (optionIndex: number) => {
        // Allow changing answer - just update it
        setAnswers({ ...answers, [currentQuestion]: optionIndex });
    };

    const handleSubmitQuiz = () => {
        if (!activeQuiz) return;

        const timeTaken = Math.floor((Date.now() - startTime) / 1000);
        let correctCount = 0;

        // Calculate score based on actual answers
        Object.entries(answers).forEach(([qIndex, answer]) => {
            const question = mockQuestions[parseInt(qIndex) % mockQuestions.length];
            if (answer === question.correct) {
                correctCount++;
            }
        });

        const totalQuestions = activeQuiz.questions;
        const score = Math.round((correctCount / totalQuestions) * 100);

        // Update quiz status
        setQuizzes(prev => prev.map(q =>
            q.id === activeQuiz.id ? { ...q, status: 'completed' as const, score } : q
        ));

        // Show results
        setQuizResult({
            quiz: activeQuiz,
            answers,
            questions: mockQuestions.slice(0, totalQuestions),
            score,
            correctCount,
            totalQuestions,
            timeTaken
        });

        setActiveQuiz(null);
        setTimeLeft(0);
    };

    const closeResults = () => {
        setQuizResult(null);
    };

    // Results screen
    if (quizResult) {
        return (
            <PageTransition className="container mx-auto px-4 py-8 max-w-3xl">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                >
                    {/* Score Card */}
                    <Card className="p-8 text-center bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                        >
                            <div className={`text-7xl font-bold mb-2 ${getScoreColor(quizResult.score)}`}>
                                {quizResult.score}%
                            </div>
                        </motion.div>
                        <h2 className="text-2xl font-bold mb-4">{quizResult.quiz.title}</h2>

                        <div className="flex justify-center gap-8 text-sm">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span>{quizResult.correctCount} Correct</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <XCircle className="h-5 w-5 text-red-500" />
                                <span>{quizResult.totalQuestions - quizResult.correctCount} Wrong</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-blue-500" />
                                <span>{formatTime(quizResult.timeTaken)}</span>
                            </div>
                        </div>

                        {quizResult.score >= 80 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 rounded-full text-yellow-500"
                            >
                                <Trophy className="h-5 w-5" />
                                Excellent Performance!
                            </motion.div>
                        )}
                    </Card>

                    {/* Answer Review */}
                    <Card className="p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            Answer Review
                        </h3>
                        <div className="space-y-4">
                            {quizResult.questions.map((q, index) => {
                                const userAnswer = quizResult.answers[index];
                                const isCorrect = userAnswer === q.correct;

                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`p-4 rounded-lg border ${isCorrect ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`p-1 rounded-full ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                                                {isCorrect ? <Check className="h-4 w-4 text-white" /> : <X className="h-4 w-4 text-white" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium mb-2">Q{index + 1}: {q.question}</p>
                                                <div className="text-sm space-y-1">
                                                    <p className="text-muted-foreground">
                                                        Your answer: <span className={isCorrect ? 'text-green-500' : 'text-red-500'}>{q.options[userAnswer] || 'Not answered'}</span>
                                                    </p>
                                                    {!isCorrect && (
                                                        <p className="text-green-500">
                                                            Correct answer: {q.options[q.correct]}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </Card>

                    <div className="flex gap-4 justify-center">
                        <Button variant="outline" onClick={closeResults}>
                            Back to Quizzes
                        </Button>
                        <Button onClick={() => startQuiz(quizResult.quiz)} className="bg-purple-500 hover:bg-purple-600">
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Retake Quiz
                        </Button>
                    </div>
                </motion.div>
            </PageTransition>
        );
    }

    // Quiz taking UI
    if (activeQuiz) {
        const q = mockQuestions[currentQuestion % mockQuestions.length];
        const selectedAnswer = answers[currentQuestion];
        const hasAnswered = selectedAnswer !== undefined;
        const isCorrect = hasAnswered && selectedAnswer === q.correct;

        return (
            <PageTransition className="container mx-auto px-4 py-8 max-w-3xl">
                <Card className="p-8 bg-background/80 backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">{activeQuiz.title}</h2>
                        <div className={`flex items-center gap-2 font-mono text-lg ${getTimerColor()}`}>
                            <Timer className="h-5 w-5" />
                            <span>{formatTime(timeLeft)}</span>
                        </div>
                    </div>

                    <Progress value={(currentQuestion + 1) / activeQuiz.questions * 100} className="mb-6" />

                    <div className="mb-8">
                        <p className="text-sm text-muted-foreground mb-2">
                            Question {currentQuestion + 1} of {activeQuiz.questions}
                        </p>
                        <h3 className="text-xl font-semibold mb-6">{q.question}</h3>

                        <div className="space-y-3">
                            {q.options.map((option, i) => {
                                let buttonClass = 'border-border hover:border-muted-foreground';
                                let showIcon = false;
                                let iconType: 'correct' | 'wrong' | null = null;

                                // Show color coding if user has answered this question
                                if (hasAnswered) {
                                    if (i === q.correct) {
                                        buttonClass = 'border-green-500 bg-green-500/20 text-green-700 dark:text-green-300';
                                        showIcon = true;
                                        iconType = 'correct';
                                    } else if (i === selectedAnswer) {
                                        buttonClass = 'border-red-500 bg-red-500/20 text-red-700 dark:text-red-300';
                                        showIcon = true;
                                        iconType = 'wrong';
                                    }
                                }

                                return (
                                    <motion.button
                                        key={i}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => selectAnswer(i)}
                                        className={`w-full p-4 text-left rounded-lg border transition-all ${buttonClass}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="font-medium mr-3">{String.fromCharCode(65 + i)}.</span>
                                                {option}
                                            </div>
                                            {showIcon && iconType === 'correct' && (
                                                <Check className="h-5 w-5 text-green-500" />
                                            )}
                                            {showIcon && iconType === 'wrong' && !isCorrect && (
                                                <X className="h-5 w-5 text-red-500" />
                                            )}
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>

                        {hasAnswered && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`mt-4 p-3 rounded-lg text-center ${isCorrect ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}
                            >
                                {isCorrect ? '✓ Correct!' : `✗ Incorrect! The answer is: ${q.options[q.correct]}`}
                            </motion.div>
                        )}
                    </div>

                    <div className="flex justify-between">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                            disabled={currentQuestion === 0}
                        >
                            Previous
                        </Button>
                        {currentQuestion < activeQuiz.questions - 1 ? (
                            <Button
                                onClick={() => setCurrentQuestion(currentQuestion + 1)}
                            >
                                Next
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmitQuiz}
                                className="bg-green-500 hover:bg-green-600"
                            >
                                Submit Quiz
                            </Button>
                        )}
                    </div>
                </Card>

                <Button
                    variant="ghost"
                    className="mt-4"
                    onClick={() => setActiveQuiz(null)}
                >
                    <XCircle className="h-4 w-4 mr-2" />
                    Exit Quiz
                </Button>
            </PageTransition>
        );
    }

    return (
        <PageTransition className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Brain className="h-8 w-8 text-yellow-500" />
                    Quizzes
                </h1>
                <p className="text-muted-foreground mt-1">Test your knowledge and track progress</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 text-center">
                    <Zap className="h-6 w-6 mx-auto text-yellow-500 mb-2" />
                    <p className="text-2xl font-bold">{quizzes.filter(q => q.status === 'available').length}</p>
                    <p className="text-sm text-muted-foreground">Available</p>
                </Card>
                <Card className="p-4 text-center">
                    <CheckCircle className="h-6 w-6 mx-auto text-green-500 mb-2" />
                    <p className="text-2xl font-bold">{quizzes.filter(q => q.status === 'completed').length}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                </Card>
                <Card className="p-4 text-center">
                    <Trophy className="h-6 w-6 mx-auto text-purple-500 mb-2" />
                    <p className="text-2xl font-bold">
                        {Math.round(quizzes.filter(q => q.score).reduce((a, q) => a + (q.score || 0), 0) /
                            Math.max(1, quizzes.filter(q => q.score).length))}%
                    </p>
                    <p className="text-sm text-muted-foreground">Avg Score</p>
                </Card>
                <Card className="p-4 text-center">
                    <Clock className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                    <p className="text-2xl font-bold">2</p>
                    <p className="text-sm text-muted-foreground">Due Soon</p>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                {['all', 'available', 'completed'].map(f => (
                    <Button
                        key={f}
                        variant={filter === f ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter(f as any)}
                        className="capitalize"
                    >
                        {f}
                    </Button>
                ))}
            </div>

            {/* Quiz List */}
            <div className="grid gap-4">
                {filteredQuizzes.map((quiz, index) => (
                    <motion.div
                        key={quiz.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card className="p-6 hover:shadow-lg transition-shadow bg-background/60 backdrop-blur-sm">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-semibold text-lg">{quiz.title}</h3>
                                        <Badge className={getDifficultyColor(quiz.difficulty)}>
                                            {quiz.difficulty}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span>{quiz.subject}</span>
                                        <span>•</span>
                                        <span>{quiz.questions} questions</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {quiz.duration}
                                        </span>
                                        {quiz.dueDate && (
                                            <>
                                                <span>•</span>
                                                <span className="text-orange-500">Due: {quiz.dueDate}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {quiz.status === 'completed' ? (
                                        <>
                                            <span className={`text-2xl font-bold ${getScoreColor(quiz.score!)}`}>
                                                {quiz.score}%
                                            </span>
                                            <Button variant="outline" size="sm" onClick={() => startQuiz(quiz)}>
                                                <RotateCcw className="h-4 w-4 mr-2" />
                                                Retake
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            onClick={() => startQuiz(quiz)}
                                            className="bg-yellow-500 hover:bg-yellow-600 text-black"
                                        >
                                            <Play className="h-4 w-4 mr-2" />
                                            Start Quiz
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </PageTransition>
    );
};

export default Quizzes;
