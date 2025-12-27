import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight, GripVertical, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const HabitTracker = () => {
  const [habits, setHabits] = useState([]);
  const [habitCompletions, setHabitCompletions] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [newHabitName, setNewHabitName] = useState('');
  const [draggedHabit, setDraggedHabit] = useState(null);
  const isInitialMountHabits = useRef(true);
  const isInitialMountCompletions = useRef(true);

  useEffect(() => {
    const savedHabits = localStorage.getItem('focusflow_habits');
    if (savedHabits) {
      try {
        const parsed = JSON.parse(savedHabits);
        setHabits(parsed);
      } catch (e) {
        console.error('Error parsing saved habits:', e);
      }
    }
    const savedCompletions = localStorage.getItem('focusflow_habit_completions');
    if (savedCompletions) {
      try {
        const parsed = JSON.parse(savedCompletions);
        setHabitCompletions(parsed);
      } catch (e) {
        console.error('Error parsing saved completions:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (isInitialMountHabits.current) {
      isInitialMountHabits.current = false;
      return;
    }
    localStorage.setItem('focusflow_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    if (isInitialMountCompletions.current) {
      isInitialMountCompletions.current = false;
      return;
    }
    localStorage.setItem('focusflow_habit_completions', JSON.stringify(habitCompletions));
  }, [habitCompletions]);

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    const habit = {
      id: Date.now(),
      name: newHabitName,
      order: habits.length,
      createdAt: new Date().toISOString(),
    };
    setHabits([...habits, habit]);
    setNewHabitName('');
  };

  const deleteHabit = (id) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      setHabits(habits.filter((h) => h.id !== id));
      // Clean up completions for this habit
      const newCompletions = { ...habitCompletions };
      Object.keys(newCompletions).forEach((key) => {
        if (key.startsWith(`${id}-`)) {
          delete newCompletions[key];
        }
      });
      setHabitCompletions(newCompletions);
    }
  };

  const toggleCompletion = (habitId, dateKey) => {
    const key = `${habitId}-${dateKey}`;
    setHabitCompletions({
      ...habitCompletions,
      [key]: !habitCompletions[key],
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const changeMonth = (delta) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentMonth(newDate);
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  const isToday = (date) => {
    const today = new Date();
    return getDateKey(date) === getDateKey(today);
  };

  const days = getDaysInMonth(currentMonth);

  // Group days into weeks
  const weeks = [];
  let currentWeek = [];
  days.forEach((day, index) => {
    currentWeek.push(day);
    if (day.getDay() === 0 || index === days.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  // Calculate statistics
  const monthKey = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}`;
  const totalPossibleCompletions = habits.length * days.length;
  const actualCompletions = Object.keys(habitCompletions).filter((key) => {
    const [habitId, dateKey] = key.split('-');
    return dateKey.startsWith(monthKey) && habitCompletions[key];
  }).length;
  const completionPercentage = totalPossibleCompletions > 0 ? (actualCompletions / totalPossibleCompletions) * 100 : 0;

  // Daily progress
  const dailyProgress = days.map((day) => {
    const dateKey = getDateKey(day);
    const completedCount = habits.filter((habit) => habitCompletions[`${habit.id}-${dateKey}`]).length;
    const total = habits.length;
    const percentage = total > 0 ? (completedCount / total) * 100 : 0;
    return { day, completedCount, total, percentage };
  });

  // Habit analysis
  const habitAnalysis = habits.map((habit) => {
    const completedDays = days.filter((day) => {
      const dateKey = getDateKey(day);
      return habitCompletions[`${habit.id}-${dateKey}`];
    }).length;
    const completionRate = days.length > 0 ? (completedDays / days.length) * 100 : 0;
    return { habit, completedDays, completionRate };
  });

  // Drag and drop handlers
  const handleDragStart = (e, habit) => {
    setDraggedHabit(habit);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetHabit) => {
    e.preventDefault();
    if (!draggedHabit || draggedHabit.id === targetHabit.id) return;

    const draggedIndex = habits.findIndex((h) => h.id === draggedHabit.id);
    const targetIndex = habits.findIndex((h) => h.id === targetHabit.id);

    const newHabits = [...habits];
    newHabits.splice(draggedIndex, 1);
    newHabits.splice(targetIndex, 0, draggedHabit);

    setHabits(newHabits.map((h, i) => ({ ...h, order: i })));
    setDraggedHabit(null);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-[95%] animate-fade-in">
      <Card className="glass glass-hover mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-3xl mb-2">Habit Tracker</CardTitle>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)}>
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <h2 className="text-xl font-semibold min-w-[200px] text-center">{formatMonthYear(currentMonth)}</h2>
                <Button variant="ghost" size="icon" onClick={() => changeMonth(1)}>
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Monthly Stats
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Monthly Statistics</DialogTitle>
                    <DialogDescription>
                      Detailed analytics for {formatMonthYear(currentMonth)}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 mt-4">
                    {/* Habit Analysis */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Habit Performance</h3>
                      <div className="space-y-3">
                        {habitAnalysis.map(({ habit, completedDays, completionRate }) => (
                          <div key={habit.id} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{habit.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {completedDays} / {days.length} days
                              </span>
                            </div>
                            <Progress value={completionRate} className="h-2" />
                            <div className="text-xs text-muted-foreground mt-1 text-right">
                              {completionRate.toFixed(1)}% completion
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Weekly Breakdown */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Weekly Breakdown</h3>
                      <div className="space-y-2">
                        {weeks.map((week, weekIndex) => {
                          const weekCompletions = week.reduce((sum, day) => {
                            const dateKey = getDateKey(day);
                            const dayCompletions = habits.filter(
                              (habit) => habitCompletions[`${habit.id}-${dateKey}`]
                            ).length;
                            return sum + dayCompletions;
                          }, 0);
                          const weekTotal = week.length * habits.length;
                          const weekPercentage = weekTotal > 0 ? (weekCompletions / weekTotal) * 100 : 0;

                          return (
                            <div key={weekIndex} className="p-3 rounded-lg bg-muted/20 border border-border/30">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Week {weekIndex + 1}</span>
                                <span className="text-sm text-muted-foreground">
                                  {weekCompletions} / {weekTotal}
                                </span>
                              </div>
                              <Progress value={weekPercentage} className="h-1.5" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <div className="text-3xl font-bold text-foreground">{habits.length}</div>
              <div className="text-sm text-muted-foreground">Total Habits</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-primary/10">
              <div className="text-3xl font-bold text-primary">{actualCompletions}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-success/10">
              <div className="text-3xl font-bold text-success">{completionPercentage.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Progress</div>
            </div>
          </div>

          <Progress value={completionPercentage} className="h-3" />

          {/* Add Habit */}
          <div className="flex space-x-2">
            <Input
              placeholder="Add a new habit..."
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addHabit()}
            />
            <Button onClick={addHabit}>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Habit Table */}
      <Card className="glass glass-hover overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 glass">
              <tr>
                <th className="sticky left-0 z-20 glass p-4 text-left border-b border-r border-border/50 min-w-[200px]">
                  <span className="font-semibold">My Habits</span>
                </th>
                {weeks.map((week, weekIndex) => (
                  <th
                    key={weekIndex}
                    colSpan={week.length}
                    className="p-2 text-center border-b border-r border-border/50 text-xs font-medium text-muted-foreground"
                  >
                    Week {weekIndex + 1}
                  </th>
                ))}
              </tr>
              <tr>
                <th className="sticky left-0 z-20 glass border-b border-r border-border/50"></th>
                {days.map((day) => (
                  <th
                    key={getDateKey(day)}
                    className="p-2 border-b border-r border-border/30 min-w-[40px]">
                    <div className="text-xs text-muted-foreground">
                      {day.toLocaleDateString('en-US', { weekday: 'narrow' })}
                    </div>
                    <div className="text-sm font-medium">{day.getDate()}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {habits.length === 0 ? (
                <tr>
                  <td colSpan={days.length + 1} className="p-12 text-center text-muted-foreground">
                    No habits added yet. Start by adding your first habit above!
                  </td>
                </tr>
              ) : (
                habits.map((habit) => (
                  <tr
                    key={habit.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, habit)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, habit)}
                    className="hover:bg-muted/20 transition-colors cursor-move"
                  >
                    <td className="sticky left-0 z-10 glass p-4 border-b border-r border-border/50">
                      <div className="flex items-center space-x-2">
                        <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium truncate flex-1">{habit.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteHabit(habit.id)}
                          className="flex-shrink-0 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                    {days.map((day) => {
                      const dateKey = getDateKey(day);
                      const isCompleted = habitCompletions[`${habit.id}-${dateKey}`];
                      const today = isToday(day);
                      return (
                        <td key={dateKey} className="p-1 border-b border-r border-border/30 text-center">
                          <button
                            onClick={() => toggleCompletion(habit.id, dateKey)}
                            className={`w-8 h-8 rounded-md transition-all ${
                              isCompleted
                                ? 'bg-primary hover:bg-primary/80 shadow-lg shadow-primary/30'
                                : today
                                ? 'bg-muted hover:bg-muted-foreground/20 ring-2 ring-primary ring-offset-2 ring-offset-background'
                                : 'bg-muted hover:bg-muted-foreground/20'
                            }`}
                          >
                            {isCompleted && (
                              <div className="w-full h-full flex items-center justify-center text-primary-foreground font-bold">
                                ✓
                              </div>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Daily Progress */}
      <Card className="glass glass-hover mt-6">
        <CardHeader>
          <CardTitle>Daily Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-20 gap-2">
            {dailyProgress.map(({ day, completedCount, total, percentage }) => (
              <div
                key={getDateKey(day)}
                className="flex flex-col items-center p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="text-xs text-muted-foreground mb-1">
                  {day.toLocaleDateString('en-US', { weekday: 'narrow' })} {day.getDate()}
                </div>
                <div className="text-sm font-bold text-primary">{percentage.toFixed(0)}%</div>
                <div className="text-xs text-muted-foreground">
                  {completedCount}/{total}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HabitTracker;