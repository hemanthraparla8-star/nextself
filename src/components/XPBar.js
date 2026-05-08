import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

export default function XPBar({ level, xp, xpToNext, style }) {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const percent = Math.min(xp / xpToNext, 1);

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: percent,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [percent]);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        <View style={styles.levelBadge}>
          <LinearGradient
            colors={[colors.primary, colors.primaryLight]}
            style={styles.levelGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.levelText}>Lv.{level}</Text>
          </LinearGradient>
        </View>
        <Text style={styles.xpText}>
          {xp.toLocaleString()} / {xpToNext.toLocaleString()} XP
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fillWrap,
            {
              width: widthAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        >
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fill}
          />
        </Animated.View>
        <View style={[styles.glow, { left: `${percent * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  levelBadge: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  levelGrad: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  xpText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'visible',
    position: 'relative',
  },
  fillWrap: {
    height: '100%',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    flex: 1,
    borderRadius: 3,
  },
  glow: {
    position: 'absolute',
    top: -4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.accent,
    opacity: 0.6,
    marginLeft: -7,
  },
});
