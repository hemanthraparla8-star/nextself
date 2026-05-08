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
import { useNavigation } from '@react-navigation/native';

import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import ProgressChart from '../components/ProgressChart';
import BadgeCard from '../components/BadgeCard';
import GradientButton from '../components/GradientButton';
import { COMPLETED_CHALLENGES_LOG } from '../data/dummyData';

const PERSONAL_STATS = [
  { label: 'Total XP', icon: '⚡', getValue: (u) => u.xp.toLocaleString(), color: colors.primary },
  { label: 'Current Level', icon: '🏆', getValue: (u) => `Level ${u.level}`, color: colors.warning },
  { label: 'Best Streak', icon: '🔥', getValue: (u) => `${u.streak} days`, color: '#FF6B6B' },
  { label: 'Glow Score', icon: '✨', getValue: (u) => `${u.glowScore}/100`, color: colors.accent },
  { label: 'Tasks Done', icon: '✅', getValue: (u) => u.totalChallenges, color: colors.accent },
  { label: 'Badges Earned', icon: '🎖️', getValue: (_, b) => b.filter((x) => x.earned).length, color: colors.primary },
];

const RANGE_OPTIONS = ['Week', 'Month', 'All Time'];

export default function ProgressScreen() {
  const { user, badges, progressHistory } = useApp();
  const navigation = useNavigation();
  const headerFade = useRef(new Animated.Value(0)).current;
  const chartSlide = useRef(new Animated.Value(30)).current;
  const [activeRange, setActiveRange] = useState('Week');

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(chartSlide, { toValue: 0, duration: 600, delay: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  const weekAvg = Math.round(
    progressHistory.reduce((a, b) => a + b.score, 0) / progressHistory.length
  );
  const weekHigh = Math.max(...progressHistory.map((d) => d.score));
  const weekChallenges = progressHistory.reduce((a, b) => a + b.challenges, 0);
  const weekTrend = progressHistory[progressHistory.length - 1].score - progressHistory[0].score;

  const earnedBadges = badges.filter((b) => b.earned);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: headerFade }]}>
          <View>
            <Text style={styles.title}>Progress</Text>
            <Text style={styles.subtitle}>Your glow-up journey</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Subscription')}
            style={styles.proChip}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary, colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.proGrad}
            >
              <Text style={styles.proText}>↑ Go Pro</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Week Summary */}
        <Animated.View style={[styles.weekSummary, { opacity: headerFade }]}>
          <LinearGradient
            colors={['rgba(108,92,231,0.12)', 'rgba(0,217,163,0.06)']}
            style={styles.weekCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.weekHeader}>
              <Text style={styles.weekTitle}>This Week</Text>
              <View
                style={[
                  styles.trendBadge,
                  { backgroundColor: weekTrend >= 0 ? colors.accentGlow : colors.warningGlow },
                ]}
              >
                <Text
                  style={[
                    styles.trendText,
                    { color: weekTrend >= 0 ? colors.accent : colors.warning },
                  ]}
                >
                  {weekTrend >= 0 ? '↑' : '↓'} {Math.abs(weekTrend)} pts
                </Text>
              </View>
            </View>
            <View style={styles.weekStats}>
              {[
                { label: 'Avg Score', val: weekAvg },
                { label: 'Peak', val: weekHigh },
                { label: 'Challenges', val: weekChallenges },
              ].map((item, i) => (
                <View key={i} style={styles.weekStat}>
                  <Text style={styles.weekStatNum}>{item.val}</Text>
                  <Text style={styles.weekStatLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Chart Section */}
        <Animated.View
          style={[styles.chartSection, { opacity: headerFade, transform: [{ translateY: chartSlide }] }]}
        >
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Glow Score History</Text>
            <View style={styles.rangeRow}>
              {RANGE_OPTIONS.map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setActiveRange(r)}
                  style={[styles.rangeTab, activeRange === r && styles.rangeTabActive]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.rangeText, activeRange === r && styles.rangeTextActive]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.chartCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.01)']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <ProgressChart data={progressHistory} />
          </View>
        </Animated.View>

        {/* Personal Stats Grid */}
        <Animated.View style={[{ opacity: headerFade }]}>
          <Text style={styles.sectionTitle}>Personal Stats</Text>
          <View style={styles.statsGrid}>
            {PERSONAL_STATS.map((stat, i) => (
              <View key={i} style={styles.statCell}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)']}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                  <Text style={styles.statIconText}>{stat.icon}</Text>
                </View>
                <Text style={[styles.statVal, { color: stat.color }]}>
                  {typeof stat.getValue === 'function'
                    ? stat.getValue(user, badges)
                    : stat.getValue}
                </Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Badges Earned */}
        <Animated.View style={[styles.badgesSection, { opacity: headerFade }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Badges Earned</Text>
            <Text style={styles.badgeCountText}>{earnedBadges.length} of {badges.length}</Text>
          </View>
          {earnedBadges.length === 0 ? (
            <View style={styles.emptyBadges}>
              <Text style={styles.emptyBadgeIcon}>🎖️</Text>
              <Text style={styles.emptyBadgeText}>Complete challenges to earn badges</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }}
            >
              {badges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </ScrollView>
          )}
        </Animated.View>

        {/* Completed Log */}
        <Animated.View style={[styles.logSection, { opacity: headerFade }]}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {COMPLETED_CHALLENGES_LOG.map((log, i) => (
            <View key={log.id} style={styles.logItem}>
              <View style={styles.logIconWrap}>
                <Text style={styles.logIcon}>{log.icon}</Text>
              </View>
              <View style={styles.logInfo}>
                <Text style={styles.logTitle}>{log.title}</Text>
                <Text style={styles.logDate}>{log.date}</Text>
              </View>
              <View style={styles.logXP}>
                <Text style={styles.logXPText}>+{log.xp} XP</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Before vs Now */}
        <Animated.View style={[styles.reflectionSection, { opacity: headerFade }]}>
          <Text style={styles.sectionTitle}>Before vs Now</Text>
          <LinearGradient
            colors={['rgba(108,92,231,0.1)', 'rgba(0,217,163,0.05)']}
            style={styles.reflectionCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.reflectionRow}>
              <View style={styles.reflectionSide}>
                <Text style={styles.reflectionLabel}>BEFORE</Text>
                <Text style={styles.reflectionStat}>Lv. 1</Text>
                <Text style={styles.reflectionStat}>0 XP</Text>
                <Text style={styles.reflectionStat}>0 streak</Text>
              </View>
              <View style={styles.reflectionDivider}>
                <Text style={styles.reflectionArrow}>→</Text>
              </View>
              <View style={styles.reflectionSide}>
                <Text style={[styles.reflectionLabel, { color: colors.accent }]}>NOW</Text>
                <Text style={[styles.reflectionStat, { color: colors.textPrimary }]}>
                  Lv. {user.level}
                </Text>
                <Text style={[styles.reflectionStat, { color: colors.textPrimary }]}>
                  {user.xp.toLocaleString()} XP
                </Text>
                <Text style={[styles.reflectionStat, { color: colors.textPrimary }]}>
                  {user.streak} day streak
                </Text>
              </View>
            </View>
            <View style={styles.glowUpBadge}>
              <Text style={styles.glowUpText}>✨ Glow-Up in Progress</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Upgrade CTA */}
        <Animated.View style={[{ opacity: headerFade, marginTop: 8, marginBottom: 8 }]}>
          <GradientButton
            label="Unlock Advanced Analytics"
            icon="📊"
            gradient={[colors.primary, colors.accent]}
            onPress={() => navigation.navigate('Subscription')}
          />
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
  proChip: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 4,
  },
  proGrad: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  proText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  weekSummary: {
    marginBottom: 20,
  },
  weekCard: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  weekTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  trendBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '700',
  },
  weekStats: {
    flexDirection: 'row',
  },
  weekStat: {
    flex: 1,
    alignItems: 'center',
  },
  weekStatNum: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  weekStatLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
    marginTop: 2,
  },
  chartSection: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  rangeRow: {
    flexDirection: 'row',
    gap: 4,
  },
  rangeTab: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rangeTabActive: {
    backgroundColor: colors.primaryGlow,
    borderColor: colors.primary,
  },
  rangeText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  rangeTextActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  chartCard: {
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    paddingHorizontal: 4,
    overflow: 'hidden',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  statCell: {
    width: '30.5%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    overflow: 'hidden',
    minHeight: 96,
    justifyContent: 'center',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statIconText: {
    fontSize: 16,
  },
  statVal: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },
  badgesSection: {
    marginBottom: 24,
  },
  badgeCountText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 14,
  },
  emptyBadges: {
    alignItems: 'center',
    paddingVertical: 28,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyBadgeIcon: { fontSize: 32, marginBottom: 8 },
  emptyBadgeText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  logSection: {
    marginBottom: 24,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  logIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logIcon: { fontSize: 18 },
  logInfo: { flex: 1 },
  logTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  logDate: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  logXP: {
    backgroundColor: colors.primaryGlow,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  logXPText: {
    color: colors.primaryLight,
    fontSize: 11,
    fontWeight: '800',
  },
  reflectionSection: {
    marginBottom: 20,
  },
  reflectionCard: {
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  reflectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  reflectionSide: {
    flex: 1,
    gap: 6,
  },
  reflectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  reflectionStat: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  reflectionDivider: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  reflectionArrow: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: '800',
  },
  glowUpBadge: {
    alignSelf: 'center',
    backgroundColor: colors.primaryGlow,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary + '50',
  },
  glowUpText: {
    color: colors.primaryLight,
    fontSize: 13,
    fontWeight: '700',
  },
});
