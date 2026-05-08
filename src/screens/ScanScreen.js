import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { analyzeGlowupScan } from '../services/glowupAnalysisService';
import AIResultCard from '../components/AIResultCard';
import GradientButton from '../components/GradientButton';

const { width } = Dimensions.get('window');

const SCAN_STAGES = ['Ready', 'Analyzing', 'Done'];
const WEB_SAMPLE_PHOTO =
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80';

function ScanViewfinder({ isScanning, imageUri }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const cornerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isScanning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.04, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
      Animated.timing(cornerAnim, { toValue: 1, duration: 600, useNativeDriver: false }).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isScanning]);

  const cornerColor = cornerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.primary, colors.accent],
  });

  return (
    <Animated.View style={[styles.viewfinder, { transform: [{ scale: pulseAnim }] }]}>
      {imageUri && (
        <>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          <LinearGradient
            colors={['rgba(0,0,0,0.08)', 'rgba(0,0,0,0.55)']}
            style={StyleSheet.absoluteFill}
          />
        </>
      )}
      {/* Corner brackets */}
      {[
        { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
        { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
        { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
        { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
      ].map((s, i) => (
        <Animated.View
          key={i}
          style={[styles.corner, s, { borderColor: isScanning ? colors.accent : colors.primary }]}
        />
      ))}
      <View style={styles.viewfinderInner}>
        {isScanning ? (
          <View style={styles.scanningContent}>
            <Text style={styles.scanningIcon}>🔍</Text>
            <Text style={styles.scanningText}>Analyzing...</Text>
          </View>
        ) : imageUri ? (
          <View style={styles.scanningContent}>
            <View style={styles.uploadedBadge}>
              <Ionicons name="checkmark-circle" size={16} color={colors.accent} />
              <Text style={styles.uploadedBadgeText}>Photo ready</Text>
            </View>
          </View>
        ) : (
          <View style={styles.scanningContent}>
            <View style={styles.faceIcon}>
              <Text style={{ fontSize: 40 }}>👤</Text>
            </View>
            <Text style={styles.viewfinderHint}>Tap Analyze to get AI feedback</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

function LoadingDots() {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    const anims = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      )
    );
    Animated.parallel(anims).start();
  }, []);

  return (
    <View style={styles.dotsRow}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={[styles.dot, { opacity: dot, transform: [{ scale: dot.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }] }]}
        />
      ))}
    </View>
  );
}

export default function ScanScreen() {
  const { user, recordScan } = useApp();
  const [stage, setStage] = useState('idle'); // idle | scanning | results
  const [results, setResults] = useState([]);
  const [imageUri, setImageUri] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const resultsSlide = useRef(new Animated.Value(40)).current;

  const scansLeft = user.isPremium
    ? '∞'
    : Math.max(0, user.maxScansPerDay - user.scansToday);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo access to use this feature.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleCaptureImage = async () => {
    if (Platform.OS === 'web') {
      setImageUri(WEB_SAMPLE_PHOTO);
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access to take a scan photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      cameraType: ImagePicker.CameraType.front,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleUseWebSample = () => {
    setImageUri(WEB_SAMPLE_PHOTO);
  };

  const handleAnalyze = async () => {
    if (!user.isPremium && user.scansToday >= user.maxScansPerDay) {
      Alert.alert(
        'Daily Limit Reached',
        'Upgrade to NextSelf Pro for unlimited AI scans.',
        [{ text: 'Maybe Later', style: 'cancel' }, { text: 'Upgrade', style: 'default' }]
      );
      return;
    }

    setStage('scanning');
    setResults([]);

    try {
      const analysis = await analyzeGlowupScan({ imageUri });
      setStage('results');
      setResults(analysis.result);
      recordScan(analysis.result);

      Animated.parallel([
        Animated.timing(resultsSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
    } catch (_) {
      Alert.alert('Analysis unavailable', 'We could not generate AI feedback. Please try again.');
      setStage('idle');
    }
  };

  const handleReset = () => {
    setStage('idle');
    setResults([]);
    setImageUri(null);
    resultsSlide.setValue(40);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View>
            <Text style={styles.title}>AI Analysis</Text>
            <Text style={styles.subtitle}>Get personalized glow-up feedback</Text>
          </View>
          <View style={styles.scansLeft}>
            <Text style={styles.scansNum}>{scansLeft}</Text>
            <Text style={styles.scansLabel}>scans left</Text>
          </View>
        </Animated.View>

        {/* Scan Mode Tabs */}
        <Animated.View style={[styles.modeTabs, { opacity: fadeAnim }]}>
          {['AI Self-Analysis', 'Style Tips', 'Routine Check'].map((tab, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.modeTab, i === 0 && styles.modeTabActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.modeTabText, i === 0 && styles.modeTabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {stage !== 'results' && (
          <Animated.View style={[styles.scanArea, { opacity: fadeAnim }]}>
            {/* Viewfinder */}
            <ScanViewfinder isScanning={stage === 'scanning'} imageUri={imageUri} />

            {/* Image actions */}
            {stage === 'idle' && (
              <View style={styles.imageActionsRow}>
                <TouchableOpacity style={styles.pickImageBtn} onPress={handlePickImage} activeOpacity={0.7}>
                  <Ionicons name="image-outline" size={18} color={colors.textSecondary} />
                  <Text style={styles.pickImageText}>
                    {imageUri && imageUri !== WEB_SAMPLE_PHOTO ? 'Photo selected ✓' : 'Upload photo'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.pickImageBtn} onPress={handleCaptureImage} activeOpacity={0.7}>
                  <Ionicons name="camera-outline" size={18} color={colors.textSecondary} />
                  <Text style={styles.pickImageText}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.pickImageBtn} onPress={handleUseWebSample} activeOpacity={0.7}>
                  <Ionicons name="globe-outline" size={18} color={colors.textSecondary} />
                  <Text style={styles.pickImageText}>Use web sample</Text>
                </TouchableOpacity>
              </View>
            )}

            {stage === 'scanning' && (
              <View style={styles.scanningStatus}>
                <LoadingDots />
                <Text style={styles.scanningLabel}>Processing your AI feedback...</Text>
                <View style={styles.scanSteps}>
                  {['Face detection', 'Feature analysis', 'Generating tips'].map((step, i) => (
                    <View key={i} style={styles.scanStep}>
                      <View style={[styles.scanStepDot, { backgroundColor: i < 2 ? colors.accent : colors.border }]} />
                      <Text style={[styles.scanStepText, i < 2 && styles.scanStepDone]}>{step}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Main action */}
            {stage === 'idle' && (
              <GradientButton
                label="Analyze Now"
                icon="✨"
                gradient={[colors.primary, colors.accent]}
                onPress={handleAnalyze}
                style={styles.analyzeBtn}
              />
            )}
          </Animated.View>
        )}

        {/* Results */}
        {stage === 'results' && (
          <Animated.View
            style={[
              styles.resultsSection,
              { opacity: fadeAnim, transform: [{ translateY: resultsSlide }] },
            ]}
          >
            {/* Results Header */}
            <LinearGradient
              colors={['rgba(0,217,163,0.12)', 'rgba(0,217,163,0.03)']}
              style={styles.resultsHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.resultsTitle}>✅ Analysis Complete</Text>
              <Text style={styles.resultsSubtitle}>
                Here's your personalized glow-up plan for today.
              </Text>
              <View style={styles.resultsStats}>
                <View style={styles.resultStat}>
                  <Text style={styles.resultStatNum}>4</Text>
                  <Text style={styles.resultStatLabel}>Areas reviewed</Text>
                </View>
                <View style={styles.resultStatDivider} />
                <View style={styles.resultStat}>
                  <Text style={styles.resultStatNum}>8</Text>
                  <Text style={styles.resultStatLabel}>Tips generated</Text>
                </View>
                <View style={styles.resultStatDivider} />
                <View style={styles.resultStat}>
                  <Text style={styles.resultStatNum}>+50</Text>
                  <Text style={styles.resultStatLabel}>XP earned</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Result Cards */}
            {results.map((result, i) => (
              <AIResultCard key={result.id} result={result} index={i} />
            ))}

            {/* Rescan */}
            <GradientButton
              label="Scan Again"
              icon="🔄"
              gradient={[colors.surfaceLight, colors.surface]}
              textStyle={{ color: colors.textSecondary }}
              onPress={handleReset}
              style={{ marginTop: 4 }}
            />
          </Animated.View>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            💡 Feedback is constructive and AI-generated. Always feel great about who you are — these are just ideas to explore.
          </Text>
        </View>

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
  scansLeft: {
    alignItems: 'flex-end',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 3,
  },
  scansNum: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  scansLabel: {
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  modeTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  modeTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeTabActive: {
    backgroundColor: colors.primaryGlow,
    borderColor: colors.primary,
  },
  modeTabText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  modeTabTextActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  scanArea: {
    alignItems: 'center',
    marginBottom: 24,
  },
  viewfinder: {
    width: width - 80,
    height: width - 80,
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 26,
    elevation: 5,
  },
  previewImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: colors.primary,
  },
  viewfinderInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  viewfinderHint: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  scanningContent: {
    alignItems: 'center',
  },
  scanningIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  scanningText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent,
  },
  pickImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  imageActionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  pickImageText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  uploadedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.52)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  uploadedBadgeText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  scanningStatus: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  scanningLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
  },
  scanSteps: {
    gap: 8,
    width: '100%',
    paddingHorizontal: 20,
  },
  scanStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scanStepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scanStepText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  scanStepDone: {
    color: colors.accent,
  },
  analyzeBtn: {
    width: '100%',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  resultsSection: {
    marginBottom: 16,
  },
  resultsHeader: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 4,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  resultsSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
  },
  resultsStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultStat: {
    flex: 1,
    alignItems: 'center',
  },
  resultStatNum: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: -0.5,
  },
  resultStatLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
  resultStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  disclaimer: {
    marginTop: 8,
    padding: 14,
    backgroundColor: colors.surfaceLight,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disclaimerText: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 16,
    textAlign: 'center',
  },
});
