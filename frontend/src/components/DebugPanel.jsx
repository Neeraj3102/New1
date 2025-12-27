import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bug, Trash2 } from 'lucide-react';

const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [storageData, setStorageData] = useState({});

  const loadStorageData = () => {
    const data = {
      tasks: localStorage.getItem('focusflow_tasks'),
      habits: localStorage.getItem('focusflow_habits'),
      habitCompletions: localStorage.getItem('focusflow_habit_completions'),
      matrixTasks: localStorage.getItem('focusflow_matrix_tasks'),
      pomodoroSettings: localStorage.getItem('focusflow_pomodoro_settings'),
      pomodoroRounds: localStorage.getItem('focusflow_pomodoro_rounds'),
    };

    const parsed = {};
    Object.keys(data).forEach(key => {
      try {
        parsed[key] = data[key] ? JSON.parse(data[key]) : null;
      } catch (e) {
        parsed[key] = data[key];
      }
    });

    setStorageData(parsed);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear ALL data? This cannot be undone!')) {
      localStorage.clear();
      loadStorageData();
      window.location.reload();
    }
  };

  const clearSpecificData = (key) => {
    if (window.confirm(`Clear ${key}?`)) {
      localStorage.removeItem(`focusflow_${key}`);
      loadStorageData();
      window.location.reload();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => {
            setIsOpen(true);
            loadStorageData();
          }}
          variant="outline"
          size="icon"
          className="rounded-full w-12 h-12 shadow-lg"
        >
          <Bug className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-y-auto">
      <Card className="glass shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Debug Panel</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              onClick={loadStorageData}
              variant="outline"
              size="sm"
            >
              Refresh
            </Button>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
            >
              Close
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">Tasks</h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">
                  {storageData.tasks ? `${storageData.tasks.length} items` : '0 items'}
                </span>
                <Button
                  onClick={() => clearSpecificData('tasks')}
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <pre className="text-xs bg-muted/30 p-2 rounded overflow-x-auto max-h-32">
              {JSON.stringify(storageData.tasks, null, 2) || 'null'}
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">Habits</h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">
                  {storageData.habits ? `${storageData.habits.length} items` : '0 items'}
                </span>
                <Button
                  onClick={() => clearSpecificData('habits')}
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <pre className="text-xs bg-muted/30 p-2 rounded overflow-x-auto max-h-32">
              {JSON.stringify(storageData.habits, null, 2) || 'null'}
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">Matrix Tasks</h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">
                  {storageData.matrixTasks ? `${storageData.matrixTasks.length} items` : '0 items'}
                </span>
                <Button
                  onClick={() => clearSpecificData('matrix_tasks')}
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <pre className="text-xs bg-muted/30 p-2 rounded overflow-x-auto max-h-32">
              {JSON.stringify(storageData.matrixTasks, null, 2) || 'null'}
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">Pomodoro</h3>
              <span className="text-xs text-muted-foreground">
                Rounds: {storageData.pomodoroRounds || 0}
              </span>
            </div>
          </div>

          <Button
            onClick={clearAllData}
            variant="destructive"
            size="sm"
            className="w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugPanel;
