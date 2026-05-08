import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DAILY_CHALLENGES, BADGES, PROGRESS_HISTORY } from '../data/dummyData';

const AppContext = createContext(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};

const STORAGE_KEY = '@nextself_state';

const DEFAULT_USER = {
  name: 'Alex',
  level: 7,
  xp: 2340,
  xpToNext: 3000,
  streak: 12,
  glowScore: 73,
  totalChallenges: 47,
  isPremium: false,
  scansToday: 1,
  maxScansPerDay: 3,
};

const DEFAULT_STATS = {
  sleep: 7.5,
  water: 1.8,
  workout: true,
  confidenceStreak: 5,
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(DEFAULT_USER);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [badges, setBadges] = useState(BADGES);
  const [progressHistory, setProgressHistory] = useState(PROGRESS_HISTORY);
  const [challenges, setChallenges] = useState(() =>
    DAILY_CHALLENGES.map((c, i) => ({
      ...c,
      status: i === 0 ? 'completed' : 'pending',
    }))
  );
  const [lastScanResults, setLastScanResults] = useState(null);

  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.user) setUser(parsed.user);
        if (parsed.stats) setStats(parsed.stats);
        if (parsed.challenges) setChallenges(parsed.challenges);
      }
    } catch (_) {}
  };

  const saveState = useCallback(async (updatedUser, updatedChallenges) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ user: updatedUser, challenges: updatedChallenges })
      );
    } catch (_) {}
  }, []);

  const completeChallenge = useCallback(
    (id) => {
      setChallenges((prev) => {
        const next = prev.map((c) => (c.id === id ? { ...c, status: 'completed' } : c));
        const challenge = prev.find((c) => c.id === id);
        if (challenge) {
          setUser((u) => {
            const streakBonus = Math.floor(u.streak / 7) * 0.1 + 1;
            const earned = Math.round(challenge.xp * streakBonus);
            const newXp = u.xp + earned;
            const newScore = Math.min(100, u.glowScore + 2);
            const updated = {
              ...u,
              xp: newXp,
              glowScore: newScore,
              totalChallenges: u.totalChallenges + 1,
            };
            saveState(updated, next);
            return updated;
          });
        }
        return next;
      });
    },
    [saveState]
  );

  const skipChallenge = useCallback((id) => {
    setChallenges((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'skipped' } : c)));
  }, []);

  const resetChallenges = useCallback(() => {
    setChallenges(DAILY_CHALLENGES.map((c) => ({ ...c, status: 'pending' })));
  }, []);

  const updateStat = useCallback((key, value) => {
    setStats((prev) => ({ ...prev, [key]: value }));
  }, []);

  const recordScan = useCallback((results) => {
    setLastScanResults(results);
    setUser((u) => ({ ...u, scansToday: u.scansToday + 1 }));
  }, []);

  const completedCount = challenges.filter((c) => c.status === 'completed').length;
  const totalXp = user.xp;
  const xpPercent = totalXp / user.xpToNext;

  const value = {
    user,
    stats,
    badges,
    challenges,
    progressHistory,
    lastScanResults,
    completedCount,
    totalXp,
    xpPercent,
    completeChallenge,
    skipChallenge,
    resetChallenges,
    updateStat,
    recordScan,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
