import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

import HomeScreen from '../screens/HomeScreen';
import ScanScreen from '../screens/ScanScreen';
import SkincareScreen from '../screens/SkincareScreen';
import ChallengesScreen from '../screens/ChallengesScreen';
import ProgressScreen from '../screens/ProgressScreen';
import { colors, radii, shadows } from '../theme/colors';

const Tab = createBottomTabNavigator();

const TAB_CONFIG = [
  { name: 'Home', label: 'Home', icon: 'home', screen: HomeScreen },
  { name: 'Scan', label: 'Scan', icon: 'scan', screen: ScanScreen },
  { name: 'Skincare', label: 'Skin', icon: 'sparkles', screen: SkincareScreen },
  { name: 'Challenges', label: 'Grow', icon: 'trophy', screen: ChallengesScreen },
  { name: 'Progress', label: 'Progress', icon: 'bar-chart', screen: ProgressScreen },
];

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBarWrapper, { paddingBottom: insets.bottom || 12 }]}>
      <BlurView intensity={75} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.tabBarInner}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const config = TAB_CONFIG.find((t) => t.name === route.name);
          if (!config) return null;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.7}
              style={styles.tabItem}
            >
              {isFocused && <View style={styles.activeIndicator} />}
              <View style={[styles.iconWrap, isFocused && styles.iconWrapActive]}>
                <Ionicons
                  name={isFocused ? config.icon : `${config.icon}-outline`}
                  size={22}
                  color={isFocused ? colors.primary : colors.textMuted}
                />
              </View>
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                {config.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {TAB_CONFIG.map((tab) => (
        <Tab.Screen key={tab.name} name={tab.name} component={tab.screen} />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    marginHorizontal: 14,
    marginBottom: 10,
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(231,224,234,0.65)',
    ...shadows.glass,
  },
  tabBarInner: {
    flexDirection: 'row',
    paddingTop: 9,
    paddingHorizontal: 8,
    paddingBottom: 7,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    display: 'none',
  },
  iconWrap: {
    width: 40,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.lg,
  },
  iconWrapActive: {
    backgroundColor: colors.primaryGlow,
  },
  tabLabel: {
    fontSize: 9,
    marginTop: 2,
    color: colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});
