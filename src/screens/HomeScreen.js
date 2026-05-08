import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
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
import GlowScoreRing from '../components/GlowScoreRing';
import StatCard from '../components/StatCard';
import XPBar from '../components/XPBar';
import GradientButton from '../components/GradientButton';

const GREETINGS = ['Good morning', 'Good afternoon', 'Good evening'];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return GREETINGS[0];
  if (h < 18) return GREETINGS[1];
  return GREETINGS[2];
}

function getStreakMessage(streak) {
  if (streak >= 30) return '🔥 Legendary streak!';
  if (streak >= 14) return '⚡ On fire — keep going!';
  if (streak >= 7) return '💪 Solid week streak!';
  if (streak >= 3) return '🌱 Building momentum';
  return '🚀 Start your streak today';
}

export default function HomeScreen() {
  const { user, stats, challenges, completedCount } = useApp();
  const navigation = useNavigation();
  const headerFade = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(contentSlide, { toValue: 0, duration: 500, delay: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  const todayChallenge = challenges.find((c) => c.status === 'pending');
  const waterPercent = stats.water / 2;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: headerFade }]}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{user.name} 👋</Text>
          </View>
          <TouchableOpacity
            style={styles.premiumBtn}
            onPress={() => navigation.navigate('Subscription')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#C5A5FF', '#29D0A0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.premiumGrad}
            >
              <Ionicons name="star" size={13} color="#fff" />
              <Text style={styles.premiumText}>Pro</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Streak Banner */}
        <Animated.View style={[styles.streakBanner, { opacity: headerFade }]}>
          <LinearGradient
            colors={['rgba(255,255,255,0.96)', 'rgba(239,230,255,0.84)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.streakGrad}
          >
            <Text style={styles.streakMsg}>{getStreakMessage(user.streak)}</Text>
            <View style={styles.streakCount}>
              <Text style={styles.streakNum}>{user.streak}</Text>
              <Text style={styles.streakDay}>day streak</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* XP Bar */}
        <Animated.View
          style={[styles.section, { opacity: headerFade, transform: [{ translateY: contentSlide }] }]}
        >
          <XPBar level={user.level} xp={user.xp} xpToNext={user.xpToNext} />
        </Animated.View>

        {/* Glow Score Ring */}
        <Animated.View
          style={[styles.ringSection, { opacity: headerFade, transform: [{ translateY: contentSlide }] }]}
        >
          <LinearGradient
            colors={['rgba(255,255,255,1)', 'rgba(244,237,255,0.86)']}
            style={styles.ringCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.ringGlow} />
            <Text style={styles.sectionLabel}>TODAY'S GLOW SCORE</Text>
            <GlowScoreRing score={user.glowScore} size={182} />
            <Text style={styles.ringSubtitle}>Your NextSelf journey today</Text>
          </LinearGradient>
        </Animated.View>

        {/* Quick Stats */}
        <Animated.View style={[{ opacity: headerFade, transform: [{ translateY: contentSlide }] }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Daily Stats</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.sectionLink}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.statsGrid}>
            <StatCard
              icon="😴"
              label="Sleep"
              value={stats.sleep}
              unit="hrs"
              color="#6C5CE7"
              progress={stats.sleep / 9}
            />
            <StatCard
              icon="💧"
              label="Water"
              value={stats.water}
              unit="L"
              color="#00D9A3"
              progress={waterPercent}
            />
          </View>
          <View style={styles.statsGrid}>
            <StatCard
              icon="💪"
              label="Workout"
              value={stats.workout ? 'Done' : 'Pending'}
              color={stats.workout ? '#00D9A3' : '#FFB020'}
            />
            <StatCard
              icon="⚡"
              label="Challenges"
              value={`${completedCount}/${challenges.length}`}
              color="#FFB020"
              progress={completedCount / challenges.length}
            />
          </View>
        </Animated.View>

        {/* Today's Challenge Preview */}
        {todayChallenge && (
          <Animated.View style={[styles.challengePreview, { opacity: headerFade }]}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Next Challenge</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Challenges')}
                activeOpacity={0.7}
              >
                <Text style={styles.sectionLink}>View All →</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Challenges')}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['rgba(255,255,255,1)', 'rgba(248,244,252,0.92)']}
                style={styles.challengeCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.challengeIcon}>{todayChallenge.icon}</Text>
                <View style={styles.challengeInfo}>
                  <Text style={styles.challengeTitle}>{todayChallenge.title}</Text>
                  <Text style={styles.challengeDesc} numberOfLines={1}>
                    {todayChallenge.description}
                  </Text>
                </View>
                <View style={styles.xpPill}>
                  <Text style={styles.xpPillText}>+{todayChallenge.xp}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* CTA Button */}
        <Animated.View
          style={[styles.ctaSection, { opacity: headerFade, transform: [{ translateY: contentSlide }] }]}
        >
          <GradientButton
            label="Start Today's Growth"
            icon="🚀"
            gradient={[colors.primary, colors.accent]}
            onPress={() => navigation.navigate('Challenges')}
            style={styles.ctaBtn}
          />
        </Animated.View>

        {/* Spacer for tab bar */}
        <View style={{ height: 90 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 16,
    marginBottom: 18,
  },
  headerLeft: {},
  greeting: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 27,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  premiumBtn: {
    borderRadius: 22,
    overflow: 'hidden',
    marginTop: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 15,
    elevation: 4,
  },
  premiumGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
    borderRadius: 20,
  },
  premiumText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  streakBanner: {
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 3,
  },
  streakGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
  },
  streakMsg: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  streakCount: {
    alignItems: 'flex-end',
  },
  streakNum: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primaryDark,
    letterSpacing: -0.5,
  },
  streakDay: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
  },
  ringSection: {
    marginBottom: 24,
  },
  ringCard: {
    borderRadius: 26,
    alignItems: 'center',
    paddingTop: 26,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 5,
  },
  ringGlow: {
    position: 'absolute',
    top: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primaryGlow,
    opacity: 0.85,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  ringSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 12,
    fontWeight: '500',
    textAlign: 'center',
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
    letterSpacing: -0.3,
  },
  sectionLink: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    marginHorizontal: -5,
    marginBottom: 0,
  },
  challengePreview: {
    marginTop: 8,
    marginBottom: 8,
  },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 12,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 3,
  },
  challengeIcon: {
    fontSize: 28,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  challengeDesc: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  xpPill: {
    backgroundColor: colors.primaryGlow,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  xpPillText: {
    color: colors.primaryLight,
    fontSize: 12,
    fontWeight: '800',
  },
  ctaSection: {
    marginTop: 20,
    marginBottom: 8,
  },
  ctaBtn: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
});
