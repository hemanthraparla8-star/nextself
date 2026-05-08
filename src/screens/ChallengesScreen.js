import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import ChallengeCard from '../components/ChallengeCard';
import BadgeCard from '../components/BadgeCard';
import XPBar from '../components/XPBar';

const CATEGORY_ICONS = {
  fitness: { icon: '💪', color: '#FF6B6B', label: 'Fitness' },
  social: { icon: '💬', color: colors.primary, label: 'Social' },
  health: { icon: '💧', color: colors.accent, label: 'Health' },
  confidence: { icon: '✨', color: colors.warning, label: 'Confidence' },
};

const FILTER_OPTIONS = ['All', 'Fitness', 'Social', 'Health', 'Confidence'];

export default function ChallengesScreen() {
  const { user, badges, challenges, completedCount, completeChallenge, skipChallenge } = useApp();
  const [activeFilter, setActiveFilter] = useState('All');
  const headerFade = useRef(new Animated.Value(0)).current;
  const [celebrateXP, setCelebrateXP] = useState(null);
  const xpBounce = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const handleComplete = (id) => {
    const challenge = challenges.find((c) => c.id === id);
    completeChallenge(id);
    if (challenge) {
      setCelebrateXP(`+${challenge.xp} XP`);
      Animated.sequence([
        Animated.spring(xpBounce, { toValue: 1.3, useNativeDriver: true, speed: 20 }),
        Animated.spring(xpBounce, { toValue: 1, useNativeDriver: true, speed: 20 }),
      ]).start(() => {
        setTimeout(() => setCelebrateXP(null), 1500);
      });
    }
  };

  const filteredChallenges =
    activeFilter === 'All'
      ? challenges
      : challenges.filter(
          (c) => c.category.toLowerCase() === activeFilter.toLowerCase()
        );

  const pendingCount = challenges.filter((c) => c.status === 'pending').length;
  const skippedCount = challenges.filter((c) => c.status === 'skipped').length;
  const earnedBadges = badges.filter((b) => b.earned);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: headerFade }]}>
          <View>
            <Text style={styles.title}>Challenges</Text>
            <Text style={styles.subtitle}>Grow a little every day</Text>
          </View>
          {celebrateXP && (
            <Animated.View
              style={[styles.xpCelebrate, { transform: [{ scale: xpBounce }] }]}
            >
              <Text style={styles.xpCelebrateText}>{celebrateXP} 🎉</Text>
            </Animated.View>
          )}
        </Animated.View>

        {/* Streak & Stats */}
        <Animated.View style={[styles.statsRow, { opacity: headerFade }]}>
          <LinearGradient
            colors={['rgba(108,92,231,0.15)', 'rgba(108,92,231,0.05)']}
            style={styles.statBig}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.statBigNum}>{user.streak}</Text>
            <Text style={styles.statBigLabel}>🔥 Day Streak</Text>
          </LinearGradient>
          <View style={styles.statSmallCol}>
            <View style={[styles.statSmall, { backgroundColor: colors.accentGlow }]}>
              <Text style={styles.statSmallNum}>{completedCount}</Text>
              <Text style={styles.statSmallLabel}>Done Today</Text>
            </View>
            <View style={[styles.statSmall, { backgroundColor: colors.surface }]}>
              <Text style={styles.statSmallNum}>{user.totalChallenges}</Text>
              <Text style={styles.statSmallLabel}>All Time</Text>
            </View>
          </View>
        </Animated.View>

        {/* XP Progress */}
        <Animated.View style={[styles.xpSection, { opacity: headerFade }]}>
          <XPBar level={user.level} xp={user.xp} xpToNext={user.xpToNext} />
        </Animated.View>

        {/* Today's Summary */}
        <Animated.View style={[styles.summaryRow, { opacity: headerFade }]}>
          {[
            { label: 'Remaining', val: pendingCount, color: colors.primary },
            { label: 'Completed', val: completedCount, color: colors.accent },
            { label: 'Skipped', val: skippedCount, color: colors.textMuted },
          ].map((item, i) => (
            <View key={i} style={styles.summaryItem}>
              <Text style={[styles.summaryNum, { color: item.color }]}>{item.val}</Text>
              <Text style={styles.summaryLabel}>{item.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Filter Tabs */}
        <Animated.ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.filterScroll, { opacity: headerFade }]}
          contentContainerStyle={styles.filterContent}
        >
          {FILTER_OPTIONS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterTab, activeFilter === f && styles.filterTabActive]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.ScrollView>

        {/* Challenges List */}
        <Animated.View style={[{ opacity: headerFade }]}>
          <Text style={styles.sectionTitle}>
            {activeFilter === 'All' ? "Today's Challenges" : `${activeFilter} Challenges`}
          </Text>
          {filteredChallenges.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎯</Text>
              <Text style={styles.emptyText}>No challenges in this category today</Text>
            </View>
          ) : (
            filteredChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onComplete={handleComplete}
                onSkip={skipChallenge}
              />
            ))
          )}
        </Animated.View>

        {/* Badges Section */}
        <Animated.View style={[styles.badgesSection, { opacity: headerFade }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <Text style={styles.badgeCount}>
              {earnedBadges.length}/{badges.length} earned
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {badges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </ScrollView>
        </Animated.View>

        {/* Category breakdown */}
        <Animated.View style={[styles.categoriesSection, { opacity: headerFade }]}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesGrid}>
            {Object.entries(CATEGORY_ICONS).map(([key, val]) => {
              const count = challenges.filter(
                (c) => c.category === key && c.status === 'completed'
              ).length;
              const total = challenges.filter((c) => c.category === key).length;
              return (
                <TouchableOpacity
                  key={key}
                  style={styles.categoryCard}
                  activeOpacity={0.7}
                  onPress={() => setActiveFilter(val.label)}
                >
                  <View style={[styles.catIconWrap, { backgroundColor: val.color + '22' }]}>
                    <Text style={styles.catIcon}>{val.icon}</Text>
                  </View>
                  <Text style={styles.catLabel}>{val.label}</Text>
                  <Text style={[styles.catCount, { color: val.color }]}>
                    {count}/{total}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  xpCelebrate: {
    backgroundColor: colors.primaryGlow,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  xpCelebrateText: {
    color: colors.primaryLight,
    fontWeight: '800',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statBig: {
    flex: 1.4,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statBigNum: {
    fontSize: 38,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  statBigLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 4,
  },
  statSmallCol: {
    flex: 1,
    gap: 10,
  },
  statSmall: {
    flex: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statSmallNum: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  statSmallLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  xpSection: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
    overflow: 'hidden',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  summaryNum: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  summaryLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '500',
    marginTop: 3,
    letterSpacing: 0.3,
  },
  filterScroll: {
    marginBottom: 20,
  },
  filterContent: {
    gap: 8,
    paddingRight: 4,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterTabActive: {
    backgroundColor: colors.primaryGlow,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  badgesSection: {
    marginTop: 8,
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  badgeCount: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  categoriesSection: {
    marginBottom: 8,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  catIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catIcon: {
    fontSize: 18,
  },
  catLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  catCount: {
    fontSize: 12,
    fontWeight: '700',
  },
});
