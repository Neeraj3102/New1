import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Calendar, Grid3x3, CalendarDays, Plus, CheckCircle2, Circle, Trash2, ArrowRight, Timer, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const LandingPage = () => {
  const [quickTasks, setQuickTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const isInitialMount = useRef(true);

  useEffect(() => {
    const savedTasks = localStorage.getItem('focusflow_quick_tasks');
    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks);
        setQuickTasks(parsed);
      } catch (e) {
        console.error('Error parsing quick tasks:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    localStorage.setItem('focusflow_quick_tasks', JSON.stringify(quickTasks));
  }, [quickTasks]);

  const addTask = () => {
    if (!newTask.trim()) return;

    const task = {
      id: Date.now(),
      title: newTask,
      done: false,
      createdAt: new Date().toISOString(),
    };

    setQuickTasks([...quickTasks, task]);
    setNewTask('');
  };

  const toggleTask = (id) => {
    setQuickTasks(quickTasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task)));
  };

  const deleteTask = (id) => {
    setQuickTasks(quickTasks.filter((task) => task.id !== id));
  };

  const completedCount = quickTasks.filter((t) => t.done).length;
  const progressPercentage = quickTasks.length > 0 ? (completedCount / quickTasks.length) * 100 : 0;

  const features = [
    {
      icon: CheckSquare,
      title: 'Daily Planner',
      description: 'Organize your tasks with smart date navigation and status tracking',
      link: '/daily-planner',
      color: 'text-primary',
    },
    {
      icon: Timer,
      title: 'Pomodoro Timer',
      description: 'Stay focused with customizable work sessions and break intervals',
      link: '/daily-planner',
      color: 'text-accent',
    },
    {
      icon: Calendar,
      title: 'Habit Tracker',
      description: 'Build consistency with monthly habit tracking and analytics',
      link: '/habit-tracker',
      color: 'text-success',
    },
    {
      icon: Target,
      title: 'Eisenhower Matrix',
      description: 'Prioritize tasks by urgency and importance for maximum impact',
      link: '/matrix-view',
      color: 'text-warning',
    },
    {
      icon: CalendarDays,
      title: 'Calendar View',
      description: 'Visualize your schedule and manage tasks across the month',
      link: '/calendar-view',
      color: 'text-primary',
    },
    {
      icon: Grid3x3,
      title: 'Smart Organization',
      description: 'Drag-and-drop interface with localStorage persistence',
      link: '/matrix-view',
      color: 'text-accent',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <CheckSquare className="w-10 h-10 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          FocusFlow
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-2">
          Your all-in-one productivity workspace
        </p>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          Combine task management, habit tracking, and focused work sessions in one beautiful interface
        </p>
      </div>

      {/* Quick Task Section */}
      <div className="max-w-3xl mx-auto mb-12">
        <Card className="glass glass-hover border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Quick Tasks</h2>
              <Badge variant="outline" className="text-sm">
                {completedCount} / {quickTasks.length} completed
              </Badge>
            </div>

            {/* Progress Bar */}
            {quickTasks.length > 0 && (
              <div className="mb-4">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Add Task Input */}
            <div className="flex space-x-2 mb-4">
              <Input
                placeholder="What needs to be done?"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                className="flex-1"
              />
              <Button onClick={addTask} size="icon">
                <Plus className="w-5 h-5" />
              </Button>
            </div>

            {/* Task List */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
              {quickTasks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Circle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No tasks yet. Add one to get started!</p>
                </div>
              ) : (
                quickTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border transition-all hover:shadow-md ${
                      task.done
                        ? 'bg-success/5 border-success/30 opacity-75'
                        : 'bg-card border-border hover:border-primary/50'
                    }`}
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                    >
                      {task.done ? (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                      )}
                    </button>
                    <span
                      className={`flex-1 ${
                        task.done ? 'line-through text-muted-foreground' : 'text-foreground'
                      }`}
                    >
                      {task.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTask(task.id)}
                      className="flex-shrink-0 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* CTA */}
            {quickTasks.length > 0 && (
              <div className="mt-4 text-center">
                <Link to="/daily-planner">
                  <Button variant="outline" className="group">
                    Open Full Planner
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Features Grid */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">Powerful Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link key={index} to={feature.link}>
                <Card className="glass glass-hover h-full border-border/50 hover:border-primary/50 transition-all group cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-colors">
                        <Icon className={`w-6 h-6 ${feature.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center">
        <Card className="glass glass-hover border-primary/30 max-w-2xl mx-auto">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">Ready to boost your productivity?</h2>
            <p className="text-muted-foreground mb-6">
              Start organizing your tasks, building habits, and achieving your goals today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/daily-planner">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/habit-tracker">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Track Habits
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LandingPage;
