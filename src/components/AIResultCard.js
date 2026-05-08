import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, radii, shadows } from '../theme/colors';

export default function AIResultCard({ result, index = 0 }) {
  const { category, icon, color, tips } = result;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = index * 150;
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={gradients.card}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: color + '22' }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.category}>{category}</Text>
          <View style={[styles.dot, { backgroundColor: color }]} />
        </View>
      </View>
      {tips.map((tip, i) => (
        <View key={i} style={styles.tipRow}>
          <View style={[styles.tipBullet, { backgroundColor: color }]} />
          <Text style={styles.tipText}>{tip}</Text>
        </View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(231,224,234,0.72)',
    backgroundColor: colors.surfaceGlass,
    padding: 18,
    marginBottom: 12,
    overflow: 'hidden',
    ...shadows.glass,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
  },
  headerText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  category: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  tipBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 7,
    flexShrink: 0,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
});
