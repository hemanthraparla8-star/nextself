import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, radii, shadows } from '../theme/colors';

export default function StatCard({ icon, label, value, unit, color = colors.primary, progress }) {
  const progressPercent = progress != null ? Math.min(progress, 1) : null;

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={gradients.card}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={[styles.iconWrap, { backgroundColor: color + '22' }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.value}>
        {value}
        {unit ? <Text style={styles.unit}> {unit}</Text> : null}
      </Text>
      <Text style={styles.label}>{label}</Text>
      {progressPercent != null && (
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${progressPercent * 100}%`, backgroundColor: color },
            ]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 5,
    padding: 16,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: 'rgba(231,224,234,0.72)',
    overflow: 'hidden',
    minHeight: 108,
    ...shadows.glass,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radii.lg,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  icon: {
    fontSize: 17,
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  label: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  progressTrack: {
    marginTop: 10,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.surfaceHighest,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
