import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const MODES = {
  focus: { label: 'Focus', duration: 25, color: 'primary' },
  shortBreak: { label: 'Short Break', duration: 5, color: 'success' },
  longBreak: { label: 'Long Break', duration: 15, color: 'accent' },
  deepWork: { label: 'Deep Work', duration: 50, color: 'warning' },
};

const QUOTES = [
  'Discipline today creates freedom tomorrow.',
  'Every rep counts. Every task matters.',
  'Financial freedom starts with focused effort.',
  'Strong mind, strong portfolio, strong body.',
  'Compound your efforts, compound your results.',
  'Focus is your greatest asset.',
  'Build wealth one focused hour at a time.',
  'Consistency beats intensity every time.',
];

const PomodoroTimer = ({ tasks }) => {
  const [mode, setMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(MODES.focus.duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [rounds, setRounds] = useState(0);
  const [settings, setSettings] = useState({
    focus: 25,
    shortBreak: 5,
    longBreak: 15,
    deepWork: 50,
    roundsUntilLongBreak: 4,
    autoNext: false,
    soundEnabled: true,
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [quote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const intervalRef = useRef(null);

  useEffect(() => {
    const savedSettings = localStorage.getItem('focusflow_pomodoro_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    const savedRounds = localStorage.getItem('focusflow_pomodoro_rounds');
    if (savedRounds) {
      setRounds(parseInt(savedRounds));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('focusflow_pomodoro_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('focusflow_pomodoro_rounds', rounds.toString());
  }, [rounds]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
}, [isRunning, timeLeft]);
  const handleTimerComplete = () => {
    setIsRunning(false);
    if (settings.soundEnabled) {
      playCompletionSound();
    }
    if (mode === 'focus') {
      const newRounds = rounds + 1;
      setRounds(newRounds);
    }
  };

  const playCompletionSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnMpBSuAzfLaizsIGGS57OihUBALTKXh8bllHAU2jdXyzn0vBSh+zPDckTsKE1y06+ypWBQLQ5zd8sFuJAUuhM/z1YU2Bhxqvu7mnEoPDlOq5O+zYBoIPJTY88p2KwUqf8vx3I0+CRZiturqpVIRC0mi4PK8aB8GM4nU8tGAMQYfadzu56RGDQ5RqOPxsmAbCDuS2PTLeSsFKX/M8d6PQAoUXLPq7KlXEwtJouDyvmwiBDGHzvPWhjQHHW3A7eeeSg4OUKfj8bJgGgg7kNjzyn0uBSh+y/HdjT4KFV+16+yoVREMSKHf8r5sIgQvhM3z14Y1Bxxtvu3mnksODU+n4/KyYRsIPZHY88t8LQUpfs3x3Y4+ChRcsurqp1URC0ef4PK+bSMEMIXO89aGNQcdbL7t5p5LDg1Pp+PytWIcCDyP2PPLfC0FKH3N8d2OPwoUW7Lq6qdVEQtHnt/yvm4kBC+EzvPXhjYHHGu+7uaeTA4NT6fk8rVjHAg8jtfzy3wuBSh9zvHdjz8KFVux6uqoVRIMR53f8r9vJAQug83z14c2Bxtrve7mnkwPDU6m5PO2Yx0IPY3X88p9LwUme8zw3o8/ChVaserqqVYRC0ad3vK/cCQELYHN89eHNwcbaLzu5p9LDw1NpuTztWMdCT2M1/PJfi8FJXnL8N6PQAsVWLDq6qlWEQtFnN7yv3EkBC2AzPPYiDcIGma77OafTBANS6Xk87ZkHQo9itbzyn0wBSR4yvDej0EMFVew6uupVxIMRJve8sBxJQUtf8vz2Ig4CBlluurnoVAQDEmk5PO3ZR4KPYnV88p+MQUkd8nw35FBDBVWr+rsqlgSDEKa3fLBciYFK37K89mJOQgZY7rq5qFREAw=');
    audio.play();
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    const modeKey = mode === 'focus' ? 'focus' : mode === 'shortBreak' ? 'shortBreak' : mode === 'longBreak' ? 'longBreak' : 'deepWork';
    setTimeLeft(settings[modeKey] * 60);
  };

  const changeMode = (newMode) => {
    setMode(newMode);
    setIsRunning(false);
    const modeKey = newMode === 'focus' ? 'focus' : newMode === 'shortBreak' ? 'shortBreak' : newMode === 'longBreak' ? 'longBreak' : 'deepWork';
    setTimeLeft(settings[modeKey] * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (() => {
    const modeKey = mode === 'focus' ? 'focus' : mode === 'shortBreak' ? 'shortBreak' : mode === 'longBreak' ? 'longBreak' : 'deepWork';
    const total = settings[modeKey] * 60;
    return ((total - timeLeft) / total) * 100;
  })();

  const activeTasks = tasks.filter((t) => t.status === 'active');

  return (
    <div className="space-y-6">
      {/* Quote Card */}
      <Card className="glass glass-hover border-primary/20">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground italic text-center leading-relaxed">
            "{quote}"
          </p>
        </CardContent>
      </Card>

      {/* Timer Card */}
      <Card className="glass glass-hover">
        <CardHeader>
          <CardTitle>Pomodoro Timer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode Selection */}
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(MODES).map(([key, { label }]) => (
              <Button
                key={key}
                variant={mode === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => changeMode(key)}
                className="text-xs"
              >
                {label}
              </Button>
            ))}
          </div>

          {/* Timer Display */}
          <div className="relative">
            <div className="aspect-square max-w-[280px] mx-auto relative">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="8"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">{formatTime(timeLeft)}</div>
                  <div className="text-sm text-muted-foreground capitalize">{MODES[mode].label}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-3">
            <Button
              size="lg"
              onClick={toggleTimer}
              className="px-8"
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Start
                </>
              )}
            </Button>
            <Button variant="outline" size="lg" onClick={resetTimer}>
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>

          {/* Task Selection */}
          {activeTasks.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm">Attach a task (optional)</Label>
              <Select value={selectedTask || 'none'} onValueChange={(v) => setSelectedTask(v === 'none' ? null : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="No task attached" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No task attached</SelectItem>
                  {activeTasks.map((task) => (
                    <SelectItem key={task.id} value={task.id.toString()}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Stats */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Rounds Today:</span>
              <span className="font-bold text-primary text-lg">{rounds}</span>
            </div>
          </div>

          {/* Settings */}
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <span>Settings</span>
              <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-3 space-y-3 p-3 rounded-lg bg-muted/20 border border-border/50">
              <div className="space-y-2">
                <Label className="text-xs">Focus Duration (min)</Label>
                <Input
                  type="number"
                  value={settings.focus}
                  onChange={(e) => setSettings({ ...settings, focus: parseInt(e.target.value) || 25 })}
                  min="1"
                  max="60"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Short Break (min)</Label>
                <Input
                  type="number"
                  value={settings.shortBreak}
                  onChange={(e) => setSettings({ ...settings, shortBreak: parseInt(e.target.value) || 5 })}
                  min="1"
                  max="30"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Long Break (min)</Label>
                <Input
                  type="number"
                  value={settings.longBreak}
                  onChange={(e) => setSettings({ ...settings, longBreak: parseInt(e.target.value) || 15 })}
                  min="1"
                  max="60"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Sound Enabled</Label>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
                >
                  {settings.soundEnabled ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </details>
        </CardContent>
      </Card>
    </div>
  );
};

export default PomodoroTimer;
