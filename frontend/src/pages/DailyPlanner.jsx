import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, CheckCircle2, Circle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PomodoroTimer from '@/components/PomodoroTimer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DailyPlanner = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', category: 'today' });
  const [filter, setFilter] = useState('all');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const savedTasks = localStorage.getItem('focusflow_tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('focusflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!newTask.title.trim()) return;

    const task = {
      id: Date.now(),
      title: newTask.title,
      description: newTask.description,
      category: newTask.category,
      status: 'active',
      createdAt: new Date().toISOString(),
      date: currentDate.toISOString().split('T')[0],
    };

    setTasks([...tasks, task]);
    setNewTask({ title: '', description: '', category: 'today' });
  };

  const updateTaskStatus = (id, status) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, status } : task)));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const filteredTasks = tasks.filter((task) => {
    const taskDate = task.date || new Date(task.createdAt).toISOString().split('T')[0];
    const isToday = taskDate === currentDate.toISOString().split('T')[0];
    
    if (!isToday) return false;
    
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const stats = {
    total: filteredTasks.length,
    active: filteredTasks.filter((t) => t.status === 'active').length,
    done: filteredTasks.filter((t) => t.status === 'done').length,
    cancelled: filteredTasks.filter((t) => t.status === 'cancelled').length,
  };

  const changeDate = (days) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isToday = currentDate.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl animate-fade-in">
      {/* Intro Section */}
      <Card className="glass glass-hover mb-6 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-primary-foreground">MS</span>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Meet Shah</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Financial analyst and fitness enthusiast merging discipline with productivity. I believe that mastering your money and your body 
                creates the foundation for achieving anything. This planner keeps me focused on what truly matters—one task, one rep, one day at a time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass glass-hover">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Daily Tasks</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => changeDate(-1)}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={isToday ? 'default' : 'outline'}
                    size="sm"
                    onClick={goToToday}
                    className="text-xs"
                  >
                    {isToday ? 'Today' : 'Go to Today'}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => changeDate(1)}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{formatDate(currentDate)}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-primary/10">
                  <div className="text-2xl font-bold text-primary">{stats.active}</div>
                  <div className="text-xs text-muted-foreground">Active</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-success/10">
                  <div className="text-2xl font-bold text-success">{stats.done}</div>
                  <div className="text-xs text-muted-foreground">Done</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-muted-foreground">{stats.cancelled}</div>
                  <div className="text-xs text-muted-foreground">Cancelled</div>
                </div>
              </div>

              {/* Filter */}
              <div className="flex items-center space-x-2">
                {['all', 'active', 'done', 'cancelled'].map((f) => (
                  <Button
                    key={f}
                    variant={filter === f ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(f)}
                    className="capitalize"
                  >
                    {f}
                  </Button>
                ))}
              </div>

              {/* Add Task Form */}
              <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border/50">
                <Input
                  placeholder="Task title (required)"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                />
                <Textarea
                  placeholder="Add a note (optional)"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="min-h-[60px]"
                />
                <div className="flex items-center space-x-2">
                  <Select
                    value={newTask.category}
                    onValueChange={(value) => setNewTask({ ...newTask, category: value })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="backlog">Backlog</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={addTask} className="flex-1">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              </div>

              {/* Task List */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Circle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No tasks to show</p>
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-4 rounded-lg border transition-all hover:shadow-lg ${
                        task.status === 'done'
                          ? 'bg-success/5 border-success/30'
                          : task.status === 'cancelled'
                          ? 'bg-muted/50 border-border opacity-60'
                          : 'bg-card border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4
                              className={`font-medium ${
                                task.status === 'done' || task.status === 'cancelled'
                                  ? 'line-through text-muted-foreground'
                                  : ''
                              }`}
                            >
                              {task.title}
                            </h4>
                            <Badge variant="outline" className="text-xs capitalize">
                              {task.category}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          {task.status !== 'done' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateTaskStatus(task.id, 'done')}
                              className="hover:text-success"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                          )}
                          {task.status !== 'cancelled' && task.status !== 'done' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateTaskStatus(task.id, 'cancelled')}
                              className="hover:text-destructive"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          )}
                          {task.status !== 'active' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateTaskStatus(task.id, 'active')}
                              className="hover:text-primary"
                            >
                              <Circle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTask(task.id)}
                            className="hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Pomodoro */}
        <div className="lg:col-span-1">
          <PomodoroTimer tasks={filteredTasks} />
        </div>
      </div>
    </div>
  );
};

export default DailyPlanner;