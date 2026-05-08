import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

const DIFFICULTY_COLORS = {
  Easy: colors.accent,
  Medium: colors.warning,
  Hard: '#FF6B6B',
};

export default function ChallengeCard({ challenge, onComplete, onSkip, compact = false }) {
  const { title, description, category, xp, icon, difficulty, color, status } = challenge;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const isCompleted = status === 'completed';
  const isSkipped = status === 'skipped';
  const isPending = status === 'pending';
  const difficultyColor = DIFFICULTY_COLORS[difficulty] || colors.textSecondary;

  const handlePress = (fn) => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 50 }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50 }),
    ]).start(fn);
  };

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient
        colors={
          isCompleted
            ? ['rgba(0,217,163,0.08)', 'rgba(0,217,163,0.02)']
            : isSkipped
            ? ['rgba(80,80,88,0.1)', 'rgba(80,80,88,0.02)']
            : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)']
        }
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View
        style={[
          styles.leftAccent,
          {
            backgroundColor: isCompleted ? colors.accent : isSkipped ? colors.textMuted : color,
          },
        ]}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.iconBubble, { backgroundColor: (isCompleted ? colors.accent : color) + '22' }]}>
            <Text style={styles.icon}>{isCompleted ? '✅' : icon}</Text>
          </View>
          <View style={styles.meta}>
            <View style={styles.tags}>
              <View style={[styles.diffBadge, { backgroundColor: difficultyColor + '22' }]}>
                <Text style={[styles.diffText, { color: difficultyColor }]}>{difficulty}</Text>
              </View>
              <View style={styles.xpBadge}>
                <Text style={styles.xpText}>+{xp} XP</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={[styles.title, (isCompleted || isSkipped) && styles.titleDimmed]}>
          {title}
        </Text>
        {!compact && (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        )}

        {isPending && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={() => handlePress(() => onSkip && onSkip(challenge.id))}
              activeOpacity={0.7}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.completeBtn}
              onPress={() => handlePress(() => onComplete && onComplete(challenge.id))}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.primary, colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.completeGrad}
              >
                <Text style={styles.completeText}>Complete ✓</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {isCompleted && (
          <View style={styles.completedRow}>
            <Text style={styles.completedText}>Completed — +{xp} XP earned 🎉</Text>
          </View>
        )}

        {isSkipped && (
          <View style={styles.skippedRow}>
            <Text style={styles.skippedText}>Skipped for today</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: 12,
  },
  leftAccent: {
    width: 4,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
  meta: {
    flex: 1,
    justifyContent: 'center',
  },
  tags: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  diffText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  xpBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: colors.primaryGlow,
  },
  xpText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primaryLight,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  titleDimmed: {
    opacity: 0.5,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  skipBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  skipText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  completeBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  completeGrad: {
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 12,
  },
  completeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  completedRow: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,217,163,0.15)',
  },
  completedText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  skippedRow: {
    marginTop: 8,
  },
  skippedText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
});
