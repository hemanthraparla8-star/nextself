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

import { colors } from '../theme/colors';
import GradientButton from '../components/GradientButton';

const FEATURES = [
  { icon: '✨', label: 'Unlimited AI scans per day', pro: true },
  { icon: '🎯', label: 'Personalized growth plans', pro: true },
  { icon: '📊', label: 'Advanced analytics & insights', pro: true },
  { icon: '🏆', label: 'Exclusive premium challenges', pro: true },
  { icon: '🎖️', label: 'Custom badge & avatar styles', pro: true },
  { icon: '🔥', label: 'Streak protection (miss 1 day)', pro: true },
  { icon: '📅', label: 'Weekly AI coaching summaries', pro: true },
  { icon: '🚫', label: 'Ad-free experience', pro: true },
];

const PLANS = [
  {
    id: 'monthly',
    label: 'Monthly',
    price: '$7.99',
    period: '/month',
    badge: null,
    description: 'Billed monthly',
  },
  {
    id: 'annual',
    label: 'Annual',
    price: '$3.99',
    period: '/month',
    badge: 'BEST VALUE',
    description: 'Billed $47.99/year · Save 50%',
  },
];

const TESTIMONIALS = [
  { name: 'Marcus T.', quote: 'Went from shy introvert to confident in 30 days.', stars: 5 },
  { name: 'Priya R.', quote: 'The AI feedback is actually helpful and kind.', stars: 5 },
  { name: 'Jake M.', quote: 'My streak is 42 days. Never felt this good.', stars: 5 },
];

export default function SubscriptionScreen() {
  const navigation = useNavigation();
  const [selectedPlan, setSelectedPlan] = useState('annual');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, delay: 100, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <Animated.View style={[styles.hero, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <LinearGradient
            colors={[colors.primary + 'CC', colors.accent + 'CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGlowBall}
          />
          <Text style={styles.heroEmoji}>✨</Text>
          <Text style={styles.heroTitle}>NextSelf Pro</Text>
          <Text style={styles.heroSubtitle}>
            Unlock your full potential with AI-powered coaching, unlimited scans, and exclusive growth tools.
          </Text>
        </Animated.View>

        {/* Plan selector */}
        <Animated.View style={[styles.plansRow, { opacity: fadeAnim }]}>
          {PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[styles.planCard, selectedPlan === plan.id && styles.planCardSelected]}
              onPress={() => setSelectedPlan(plan.id)}
              activeOpacity={0.8}
            >
              {selectedPlan === plan.id && (
                <LinearGradient
                  colors={['rgba(108,92,231,0.2)', 'rgba(0,217,163,0.1)']}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
              )}
              {plan.badge && (
                <View style={styles.planBadge}>
                  <LinearGradient
                    colors={[colors.primary, colors.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.planBadgeGrad}
                  >
                    <Text style={styles.planBadgeText}>{plan.badge}</Text>
                  </LinearGradient>
                </View>
              )}
              <Text style={styles.planLabel}>{plan.label}</Text>
              <View style={styles.planPriceRow}>
                <Text style={[styles.planPrice, selectedPlan === plan.id && styles.planPriceActive]}>
                  {plan.price}
                </Text>
                <Text style={styles.planPeriod}>{plan.period}</Text>
              </View>
              <Text style={styles.planDesc}>{plan.description}</Text>
              {selectedPlan === plan.id && (
                <View style={styles.checkMark}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Features */}
        <Animated.View style={[styles.featuresSection, { opacity: fadeAnim }]}>
          <Text style={styles.featuresTitle}>Everything in Pro</Text>
          <View style={styles.featuresList}>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={styles.featureIconWrap}>
                  <Text style={styles.featureIcon}>{f.icon}</Text>
                </View>
                <Text style={styles.featureLabel}>{f.label}</Text>
                <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Social Proof */}
        <Animated.View style={[styles.testimonialsSection, { opacity: fadeAnim }]}>
          <Text style={styles.testimonialsTitle}>What users say</Text>
          {TESTIMONIALS.map((t, i) => (
            <View key={i} style={styles.testimonialCard}>
              <LinearGradient
                colors={['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.01)']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <View style={styles.stars}>
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Text key={j} style={styles.star}>⭐</Text>
                ))}
              </View>
              <Text style={styles.quote}>"{t.quote}"</Text>
              <Text style={styles.reviewer}>— {t.name}</Text>
            </View>
          ))}
        </Animated.View>

        {/* CTA */}
        <Animated.View style={[styles.ctaSection, { opacity: fadeAnim }]}>
          <GradientButton
            label={`Start Pro — ${PLANS.find((p) => p.id === selectedPlan)?.price}/mo`}
            gradient={[colors.primary, colors.accent]}
            onPress={() => {}}
            style={styles.ctaBtn}
            icon="🚀"
          />
          <Text style={styles.ctaSmall}>7-day free trial · Cancel anytime · No commitment</Text>
        </Animated.View>

        {/* Trust row */}
        <View style={styles.trustRow}>
          {['🔒 Secure', '✅ Free Trial', '💳 Cancel Anytime'].map((t, i) => (
            <View key={i} style={styles.trustItem}>
              <Text style={styles.trustText}>{t}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
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
    paddingTop: 8,
    marginBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 32,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 24,
  },
  heroGlowBall: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    top: -100,
    opacity: 0.12,
  },
  heroEmoji: {
    fontSize: 52,
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -1,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  plansRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  planCard: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: colors.primary,
  },
  planBadge: {
    position: 'absolute',
    top: -1,
    left: '50%',
    transform: [{ translateX: -38 }],
    borderRadius: 0,
    overflow: 'hidden',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  planBadgeGrad: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  planBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  planLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  planPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.textSecondary,
    letterSpacing: -0.5,
  },
  planPriceActive: {
    color: colors.textPrimary,
  },
  planPeriod: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  planDesc: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '500',
    marginTop: 2,
  },
  checkMark: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  featuresSection: {
    marginBottom: 28,
  },
  featuresTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  featuresList: {
    gap: 4,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  featureIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIcon: {
    fontSize: 16,
  },
  featureLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  testimonialsSection: {
    marginBottom: 28,
  },
  testimonialsTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  testimonialCard: {
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 10,
    overflow: 'hidden',
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 8,
  },
  star: {
    fontSize: 12,
  },
  quote: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: 8,
    fontWeight: '500',
  },
  reviewer: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  ctaSection: {
    marginBottom: 16,
    alignItems: 'center',
  },
  ctaBtn: {
    width: '100%',
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaSmall: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  trustItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 20,
  },
  trustText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
