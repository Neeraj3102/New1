import { useState, useEffect } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DailyPlanner from './pages/DailyPlanner';
import DayPlanner from './pages/DayPlanner';
import HabitTracker from './pages/HabitTracker';
import MatrixView from './pages/MatrixView';
import CalendarView from './pages/CalendarView';
import Navigation from './components/Navigation';
import DebugPanel from './components/DebugPanel';

function App() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Set dark mode by default
    document.documentElement.classList.add('dark');
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    setIsDark(!isDark);
  };

  return (
    <div className="App min-h-screen bg-background">
      <BrowserRouter>
        <Navigation isDark={isDark} toggleTheme={toggleTheme} />
        <main className="pt-20">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/daily-planner" element={<DailyPlanner />} />
            <Route path="/habit-tracker" element={<HabitTracker />} />
            <Route path="/matrix-view" element={<MatrixView />} />
            <Route path="/calendar-view" element={<CalendarView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <DebugPanel />
      </BrowserRouter>
    </div>
  );
}

export default App;