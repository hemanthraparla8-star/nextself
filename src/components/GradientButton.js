import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

export default function GradientButton({
  label,
  onPress,
  gradient = [colors.primary, colors.primaryLight],
  style,
  textStyle,
  icon,
  disabled = false,
  size = 'normal',
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const isSmall = size === 'small';

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        onPress={disabled ? null : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        disabled={disabled}
      >
        <LinearGradient
          colors={disabled ? [colors.textMuted, colors.textMuted] : gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.btn, isSmall && styles.btnSmall]}
        >
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={[styles.label, isSmall && styles.labelSmall, textStyle]}>{label}</Text>
        </LinearGradient>
        {!disabled && (
          <View style={[styles.glow, { backgroundColor: gradient[0] + '40' }]} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 16,
    gap: 8,
  },
  btnSmall: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  glow: {
    position: 'absolute',
    bottom: -6,
    left: 16,
    right: 16,
    height: 12,
    borderRadius: 8,
    opacity: 0.6,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  labelSmall: {
    fontSize: 13,
  },
  icon: {
    fontSize: 18,
  },
});
