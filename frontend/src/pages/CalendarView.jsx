import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const CalendarView = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [matrixTasks, setMatrixTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    // Load tasks from daily planner
    const savedTasks = localStorage.getItem('focusflow_tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }

    // Load tasks from matrix view
    const savedMatrixTasks = localStorage.getItem('focusflow_matrix_tasks');
    if (savedMatrixTasks) {
      setMatrixTasks(JSON.parse(savedMatrixTasks));
    }
  }, []);

  const changeMonth = (delta) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentMonth(newDate);
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
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

  const isSameMonth = (date) => {
    return (
      date.getMonth() === currentMonth.getMonth() &&
      date.getFullYear() === currentMonth.getFullYear()
    );
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    const days = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const getTasksForDate = (date) => {
    const dateKey = getDateKey(date);

    const dailyTasks = tasks.filter((task) => {
      const taskDate = task.date || new Date(task.createdAt).toISOString().split('T')[0];
      return taskDate === dateKey;
    });

    return dailyTasks;
  };

  const updateTaskStatus = (taskId, status) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, status } : task
    );
    setTasks(updatedTasks);
    localStorage.setItem('focusflow_tasks', JSON.stringify(updatedTasks));
  };

  const deleteTask = (taskId) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(updatedTasks);
    localStorage.setItem('focusflow_tasks', JSON.stringify(updatedTasks));
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setIsSheetOpen(true);
  };

  const days = getDaysInMonth();
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl animate-fade-in">
      {/* Header */}
      <Card className="glass glass-hover mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-3xl mb-2">Calendar View</CardTitle>
              <p className="text-sm text-muted-foreground">
                View and manage your tasks across the month
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button variant="outline" onClick={goToToday}>
                Today
              </Button>
              <Button variant="ghost" size="icon" onClick={() => changeMonth(1)}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-semibold">{formatMonthYear(currentMonth)}</h2>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <Card className="glass glass-hover">
        <CardContent className="p-4">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="space-y-2">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-2">
                {week.map((day) => {
                  const dayTasks = getTasksForDate(day);
                  const today = isToday(day);
                  const sameMonth = isSameMonth(day);
                  const activeTasks = dayTasks.filter((t) => t.status === 'active').length;
                  const doneTasks = dayTasks.filter((t) => t.status === 'done').length;

                  return (
                    <button
                      key={getDateKey(day)}
                      onClick={() => handleDateClick(day)}
                      className={`min-h-[100px] p-2 rounded-lg border-2 transition-all text-left ${
                        today
                          ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                          : sameMonth
                          ? 'border-border hover:border-primary/50 bg-card'
                          : 'border-border/30 bg-muted/20 opacity-50'
                      } hover:shadow-md`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-sm font-semibold ${
                            today ? 'text-primary' : sameMonth ? 'text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {day.getDate()}
                        </span>
                        {dayTasks.length > 0 && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0">
                            {dayTasks.length}
                          </Badge>
                        )}
                      </div>
                      {dayTasks.length > 0 && (
                        <div className="space-y-1">
                          {activeTasks > 0 && (
                            <div className="flex items-center space-x-1">
                              <Circle className="w-3 h-3 text-primary" />
                              <span className="text-xs text-muted-foreground">{activeTasks}</span>
                            </div>
                          )}
                          {doneTasks > 0 && (
                            <div className="flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3 text-success" />
                              <span className="text-xs text-muted-foreground">{doneTasks}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Task Details Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedDate && (
            <>
              <SheetHeader>
                <SheetTitle>
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </SheetTitle>
                <SheetDescription>
                  {selectedDateTasks.length === 0
                    ? 'No tasks scheduled for this day'
                    : `${selectedDateTasks.length} task${selectedDateTasks.length !== 1 ? 's' : ''} scheduled`}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-4">
                {selectedDateTasks.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Circle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No tasks for this day</p>
                  </div>
                ) : (
                  selectedDateTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-4 rounded-lg border transition-all ${
                        task.status === 'done'
                          ? 'bg-success/5 border-success/30'
                          : task.status === 'cancelled'
                          ? 'bg-muted/50 border-border opacity-60'
                          : 'bg-card border-border'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4
                            className={`font-medium mb-1 ${
                              task.status === 'done' || task.status === 'cancelled'
                                ? 'line-through text-muted-foreground'
                                : ''
                            }`}
                          >
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className={`ml-2 capitalize ${
                            task.status === 'done'
                              ? 'border-success text-success'
                              : task.status === 'active'
                              ? 'border-primary text-primary'
                              : 'border-border text-muted-foreground'
                          }`}
                        >
                          {task.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 mt-3">
                        {task.status !== 'done' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateTaskStatus(task.id, 'done')}
                            className="flex-1"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Mark Done
                          </Button>
                        )}
                        {task.status === 'done' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateTaskStatus(task.id, 'active')}
                            className="flex-1"
                          >
                            <Circle className="w-4 h-4 mr-2" />
                            Reopen
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteTask(task.id)}
                          className="hover:text-destructive hover:border-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CalendarView;