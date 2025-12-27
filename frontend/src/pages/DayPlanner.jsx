import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit2, Clock, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 11 PM
const CATEGORIES = [
  { value: 'work', label: 'Work', color: 'bg-primary/20 border-primary text-primary' },
  { value: 'personal', label: 'Personal', color: 'bg-success/20 border-success text-success' },
  { value: 'fitness', label: 'Fitness', color: 'bg-warning/20 border-warning text-warning' },
  { value: 'meeting', label: 'Meeting', color: 'bg-accent/20 border-accent text-accent' },
  { value: 'other', label: 'Other', color: 'bg-muted border-border text-muted-foreground' },
];

const DayPlanner = () => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    startTime: '09:00',
    endTime: '10:00',
    category: 'work',
    notes: '',
  });
  const [draggedEvent, setDraggedEvent] = useState(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    const savedEvents = localStorage.getItem('focusflow_day_planner_events');
    if (savedEvents) {
      try {
        const parsed = JSON.parse(savedEvents);
        setEvents(parsed);
      } catch (e) {
        console.error('Error parsing saved events:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    localStorage.setItem('focusflow_day_planner_events', JSON.stringify(events));
  }, [events]);

  const formatTime = (hour) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${ampm}`;
  };

  const getDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const isToday = getDateKey(selectedDate) === getDateKey(new Date());

  const addEvent = () => {
    if (!newEvent.title.trim()) return;

    if (editingEvent) {
      setEvents(
        events.map((event) =>
          event.id === editingEvent.id
            ? { ...event, ...newEvent, date: getDateKey(selectedDate) }
            : event
        )
      );
      setEditingEvent(null);
    } else {
      const event = {
        id: Date.now(),
        ...newEvent,
        date: getDateKey(selectedDate),
        createdAt: new Date().toISOString(),
      };
      setEvents([...events, event]);
    }

    setNewEvent({
      title: '',
      startTime: '09:00',
      endTime: '10:00',
      category: 'work',
      notes: '',
    });
    setIsAddDialogOpen(false);
  };

  const deleteEvent = (id) => {
    setEvents(events.filter((event) => event.id !== id));
  };

  const startEdit = (event) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      startTime: event.startTime,
      endTime: event.endTime,
      category: event.category,
      notes: event.notes || '',
    });
    setIsAddDialogOpen(true);
  };

  const getEventsForDate = () => {
    const dateKey = getDateKey(selectedDate);
    return events
      .filter((event) => event.date === dateKey)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const getEventPosition = (startTime, endTime) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = (startHour - 6) * 60 + startMin;
    const endMinutes = (endHour - 6) * 60 + endMin;
    const duration = endMinutes - startMinutes;
    
    const hourHeight = 80; // pixels per hour
    const top = (startMinutes / 60) * hourHeight;
    const height = Math.max((duration / 60) * hourHeight, 40);
    
    return { top, height };
  };

  const handleDragStart = (e, event) => {
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, hour) => {
    e.preventDefault();
    if (!draggedEvent) return;

    const [startHour, startMin] = draggedEvent.startTime.split(':').map(Number);
    const [endHour, endMin] = draggedEvent.endTime.split(':').map(Number);
    const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);

    const newStartTime = `${hour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
    const newEndMinutes = hour * 60 + startMin + duration;
    const newEndHour = Math.floor(newEndMinutes / 60);
    const newEndMin = newEndMinutes % 60;
    const newEndTime = `${newEndHour.toString().padStart(2, '0')}:${newEndMin.toString().padStart(2, '0')}`;

    setEvents(
      events.map((event) =>
        event.id === draggedEvent.id
          ? { ...event, startTime: newStartTime, endTime: newEndTime }
          : event
      )
    );
    setDraggedEvent(null);
  };

  const todayEvents = getEventsForDate();
  const categoryStats = CATEGORIES.map(cat => ({
    ...cat,
    count: todayEvents.filter(e => e.category === cat.value).length
  }));

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl animate-fade-in">
      {/* Header */}
      <Card className="glass glass-hover mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-3xl mb-2">Day Planner</CardTitle>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" onClick={() => changeDate(-1)}>
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-lg font-semibold min-w-[280px] text-center">
                    {formatDate(selectedDate)}
                  </span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => changeDate(1)}>
                  <ChevronRight className="w-5 h-5" />
                </Button>
                <Button
                  variant={isToday ? 'default' : 'outline'}
                  size="sm"
                  onClick={goToToday}
                >
                  {isToday ? 'Today' : 'Go to Today'}
                </Button>
              </div>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingEvent(null);
                  setNewEvent({
                    title: '',
                    startTime: '09:00',
                    endTime: '10:00',
                    category: 'work',
                    notes: '',
                  });
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      placeholder="Event title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={newEvent.startTime}
                        onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        value={newEvent.endTime}
                        onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={newEvent.category}
                      onValueChange={(value) => setNewEvent({ ...newEvent, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes (optional)</Label>
                    <Input
                      placeholder="Add notes..."
                      value={newEvent.notes}
                      onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                    />
                  </div>
                  <Button onClick={addEvent} className="w-full">
                    {editingEvent ? 'Update Event' : 'Add Event'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <div className="text-2xl font-bold text-foreground">{todayEvents.length}</div>
              <div className="text-xs text-muted-foreground">Total Events</div>
            </div>
            {categoryStats.filter(c => c.count > 0).map(cat => (
              <div key={cat.value} className={`text-center p-3 rounded-lg border ${cat.color}`}>
                <div className="text-2xl font-bold">{cat.count}</div>
                <div className="text-xs">{cat.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-3">
          <Card className="glass glass-hover">
            <CardContent className="p-0">
              <div className="relative">
                {/* Hour rows */}
                <div className="space-y-0">
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="flex border-b border-border/30 hover:bg-muted/20 transition-colors"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, hour)}
                      style={{ height: '80px' }}
                    >
                      <div className="w-24 flex-shrink-0 p-4 text-sm font-medium text-muted-foreground border-r border-border/30">
                        {formatTime(hour)}
                      </div>
                      <div className="flex-1 relative p-2">
                        {/* Events will be positioned absolutely here */}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Positioned events */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="relative h-full" style={{ paddingLeft: '96px', paddingTop: 0 }}>
                    {todayEvents.map((event) => {
                      const { top, height } = getEventPosition(event.startTime, event.endTime);
                      const category = CATEGORIES.find((c) => c.value === event.category);
                      
                      return (
                        <div
                          key={event.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, event)}
                          className={`absolute left-2 right-2 p-3 rounded-lg border-l-4 cursor-move pointer-events-auto ${category.color} backdrop-blur-sm transition-all hover:shadow-lg group`}
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                            zIndex: 10,
                          }}
                        >
                          <div className="flex items-start justify-between h-full">
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm truncate mb-1">
                                {event.title}
                              </div>
                              <div className="flex items-center space-x-2 text-xs opacity-75">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {event.startTime} - {event.endTime}
                                </span>
                              </div>
                              {event.notes && height > 60 && (
                                <div className="text-xs opacity-75 mt-1 truncate">
                                  {event.notes}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => startEdit(event)}
                                className="h-6 w-6"
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteEvent(event.id)}
                                className="h-6 w-6 hover:text-destructive"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event List Sidebar */}
        <div className="lg:col-span-1">
          <Card className="glass glass-hover sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Events List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
                {todayEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>No events scheduled</p>
                  </div>
                ) : (
                  todayEvents.map((event) => {
                    const category = CATEGORIES.find((c) => c.value === event.category);
                    return (
                      <div
                        key={event.id}
                        className={`p-3 rounded-lg border ${category.color} transition-all hover:shadow-md`}
                      >
                        <div className="font-medium text-sm mb-1">{event.title}</div>
                        <div className="flex items-center space-x-2 text-xs opacity-75 mb-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {event.startTime} - {event.endTime}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {category.label}
                        </Badge>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DayPlanner;
