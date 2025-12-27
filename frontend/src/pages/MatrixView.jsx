import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, GripVertical, AlertCircle, TrendingUp, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const QUADRANTS = {
  urgent_important: {
    label: 'Do First',
    description: 'Urgent & Important',
    icon: AlertCircle,
    color: 'destructive',
    bgClass: 'bg-destructive/5 hover:bg-destructive/10',
    borderClass: 'border-destructive/30',
  },
  not_urgent_important: {
    label: 'Schedule',
    description: 'Not Urgent & Important',
    icon: TrendingUp,
    color: 'primary',
    bgClass: 'bg-primary/5 hover:bg-primary/10',
    borderClass: 'border-primary/30',
  },
  urgent_not_important: {
    label: 'Delegate',
    description: 'Urgent & Not Important',
    icon: Clock,
    color: 'warning',
    bgClass: 'bg-warning/5 hover:bg-warning/10',
    borderClass: 'border-warning/30',
  },
  not_urgent_not_important: {
    label: 'Eliminate',
    description: 'Not Urgent & Not Important',
    icon: Zap,
    color: 'muted',
    bgClass: 'bg-muted/30 hover:bg-muted/50',
    borderClass: 'border-border',
  },
};

const MatrixView = () => {
  const [tasks, setTasks] = useState([]);
  const [draggedTask, setDraggedTask] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    notes: '',
    quadrant: 'urgent_important',
  });

  useEffect(() => {
    const savedTasks = localStorage.getItem('focusflow_matrix_tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('focusflow_matrix_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!newTask.title.trim()) return;

    if (editingTask) {
      setTasks(
        tasks.map((task) =>
          task.id === editingTask.id
            ? { ...task, title: newTask.title, notes: newTask.notes, quadrant: newTask.quadrant }
            : task
        )
      );
      setEditingTask(null);
    } else {
      const task = {
        id: Date.now(),
        title: newTask.title,
        notes: newTask.notes,
        quadrant: newTask.quadrant,
        done: false,
        createdAt: new Date().toISOString(),
      };
      setTasks([...tasks, task]);
    }

    setNewTask({ title: '', notes: '', quadrant: 'urgent_important' });
    setIsAddDialogOpen(false);
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const toggleTaskDone = (id) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task)));
  };

  const startEdit = (task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      notes: task.notes || '',
      quadrant: task.quadrant,
    });
    setIsAddDialogOpen(true);
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetQuadrant) => {
    e.preventDefault();
    if (!draggedTask) return;

    setTasks(
      tasks.map((task) =>
        task.id === draggedTask.id ? { ...task, quadrant: targetQuadrant } : task
      )
    );
    setDraggedTask(null);
  };

  const getQuadrantTasks = (quadrant) => {
    return tasks.filter((task) => task.quadrant === quadrant);
  };

  const stats = {
    total: tasks.length,
    done: tasks.filter((t) => t.done).length,
    byQuadrant: Object.keys(QUADRANTS).reduce((acc, key) => {
      acc[key] = tasks.filter((t) => t.quadrant === key).length;
      return acc;
    }, {}),
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl animate-fade-in">
      {/* Header */}
      <Card className="glass glass-hover mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-3xl mb-2">Eisenhower Matrix</CardTitle>
              <p className="text-sm text-muted-foreground">
                Prioritize tasks by urgency and importance to maximize productivity
              </p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingTask(null);
                  setNewTask({ title: '', notes: '', quadrant: 'urgent_important' });
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      placeholder="Task title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && addTask()}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes (optional)</Label>
                    <Textarea
                      placeholder="Add any additional notes..."
                      value={newTask.notes}
                      onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quadrant</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(QUADRANTS).map(([key, { label, description }]) => (
                        <button
                          key={key}
                          onClick={() => setNewTask({ ...newTask, quadrant: key })}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${
                            newTask.quadrant === key
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="font-medium text-sm">{label}</div>
                          <div className="text-xs text-muted-foreground">{description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button onClick={addTask} className="w-full">
                    {editingTask ? 'Update Task' : 'Add Task'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <div className="text-2xl font-bold text-foreground">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total Tasks</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-success/10">
              <div className="text-2xl font-bold text-success">{stats.done}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            {Object.entries(QUADRANTS).slice(0, 3).map(([key]) => (
              <div key={key} className="text-center p-3 rounded-lg bg-muted/20">
                <div className="text-2xl font-bold text-primary">{stats.byQuadrant[key]}</div>
                <div className="text-xs text-muted-foreground">{QUADRANTS[key].label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(QUADRANTS).map(([quadrantKey, quadrant]) => {
          const Icon = quadrant.icon;
          const quadrantTasks = getQuadrantTasks(quadrantKey);

          return (
            <Card
              key={quadrantKey}
              className={`glass glass-hover border-2 ${quadrant.borderClass} ${quadrant.bgClass} transition-all`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, quadrantKey)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg bg-${quadrant.color}/10`}>
                      <Icon className={`w-5 h-5 text-${quadrant.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{quadrant.label}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{quadrant.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{quadrantTasks.length}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 min-h-[300px]">
                  {quadrantTasks.length === 0 ? (
                    <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
                      No tasks in this quadrant
                    </div>
                  ) : (
                    quadrantTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                        className={`p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all cursor-move ${
                          task.done ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            checked={task.done}
                            onCheckedChange={() => toggleTaskDone(task.id)}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <h4
                              className={`font-medium text-sm mb-1 ${
                                task.done ? 'line-through text-muted-foreground' : ''
                              }`}
                            >
                              {task.title}
                            </h4>
                            {task.notes && (
                              <p className="text-xs text-muted-foreground line-clamp-2">{task.notes}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => startEdit(task)}
                              className="h-8 w-8"
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteTask(task.id)}
                              className="h-8 w-8 hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MatrixView;