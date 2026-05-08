import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

export default function BadgeCard({ badge }) {
  const { name, icon, description, earned, progress, total, earnedDate } = badge;

  return (
    <View style={[styles.card, !earned && styles.cardLocked]}>
      {earned && (
        <LinearGradient
          colors={['rgba(108,92,231,0.15)', 'rgba(0,217,163,0.08)']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
      <View style={[styles.iconWrap, earned ? styles.iconEarned : styles.iconLocked]}>
        <Text style={[styles.icon, !earned && styles.iconDimmed]}>{icon}</Text>
        {earned && <View style={styles.checkDot} />}
      </View>
      <Text style={[styles.name, !earned && styles.nameLocked]} numberOfLines={1}>
        {name}
      </Text>
      <Text style={styles.desc} numberOfLines={2}>
        {description}
      </Text>
      {earned ? (
        <View style={styles.earnedBadge}>
          <Text style={styles.earnedText}>✓ Earned</Text>
        </View>
      ) : progress != null ? (
        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${(progress / total) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {progress}/{total}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    marginRight: 12,
    padding: 14,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    alignItems: 'center',
  },
  cardLocked: {
    opacity: 0.55,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  iconEarned: {
    backgroundColor: colors.primaryGlow,
  },
  iconLocked: {
    backgroundColor: colors.surfaceLight,
  },
  icon: {
    fontSize: 26,
  },
  iconDimmed: {
    opacity: 0.5,
  },
  checkDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  name: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  nameLocked: {
    color: colors.textSecondary,
  },
  desc: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 13,
    marginBottom: 10,
  },
  earnedBadge: {
    backgroundColor: colors.accentGlow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  earnedText: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '700',
  },
  progressWrap: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
