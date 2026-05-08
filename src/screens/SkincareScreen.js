import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient as SvgLinearGradient,
  Path,
  Stop,
} from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import GradientButton from '../components/GradientButton';
import { analyzeSkincareScan } from '../services/skincareAnalysisService';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');
const VIEWFINDER_SIZE = Math.min(width - 40, 360);
const WEB_SAMPLE_PHOTO =
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80';

const ROUTINE_TABS = ['AM', 'PM'];

function MetricBar({ label, value, color }) {
  return (
    <View style={styles.metricRow}>
      <View style={styles.metricTop}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={[styles.metricValue, { color }]}>{value}%</Text>
      </View>
      <View style={styles.metricTrack}>
        <View style={[styles.metricFill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function FaceMap({ analyzing, complete }) {
  const scanAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (analyzing) {
      scanAnim.setValue(0);
      Animated.loop(
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      ).start();
    } else {
      scanAnim.stopAnimation();
    }
  }, [analyzing, scanAnim]);

  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-115, 115],
  });

  return (
    <View style={styles.faceMap}>
      <Svg width="100%" height="100%" viewBox="0 0 240 280">
        <Defs>
          <SvgLinearGradient id="skinGlow" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#172B31" />
            <Stop offset="1" stopColor="#111216" />
          </SvgLinearGradient>
          <SvgLinearGradient id="meshGlow" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={colors.primary} />
            <Stop offset="1" stopColor={colors.accent} />
          </SvgLinearGradient>
        </Defs>
        <Ellipse cx="120" cy="130" rx="74" ry="98" fill="url(#skinGlow)" stroke="#31444A" strokeWidth="2" />
        <Path d="M70 118 C94 102, 146 102, 170 118" stroke="#46565E" strokeWidth="1" fill="none" />
        <Path d="M84 154 C100 170, 140 170, 156 154" stroke="#46565E" strokeWidth="1" fill="none" />
        <Path d="M120 86 C112 118, 112 142, 120 172" stroke="#46565E" strokeWidth="1" fill="none" />
        <G opacity="0.55">
          {[72, 96, 120, 144, 168].map((x) => (
            <Line key={`v-${x}`} x1={x} y1="60" x2={240 - x} y2="218" stroke="#26333A" strokeWidth="1" />
          ))}
          {[74, 102, 130, 158, 186].map((y) => (
            <Path key={`h-${y}`} d={`M58 ${y} C88 ${y + 10}, 152 ${y + 10}, 182 ${y}`} stroke="#26333A" strokeWidth="1" fill="none" />
          ))}
        </G>
        <Circle cx="92" cy="122" r="5" fill={complete ? '#00D9A3' : '#6C5CE7'} />
        <Circle cx="148" cy="122" r="5" fill={complete ? '#00D9A3' : '#6C5CE7'} />
        <Circle cx="120" cy="158" r="5" fill="#FFB020" />
        <Circle cx="94" cy="174" r="5" fill="#00D9A3" />
        <Circle cx="146" cy="174" r="5" fill="#00D9A3" />
        <Path d="M50 236 L190 236" stroke="url(#meshGlow)" strokeWidth="2" opacity="0.65" />
      </Svg>
      {analyzing && (
        <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />
      )}
      <View style={styles.faceMapBadge}>
        <Ionicons name={complete ? 'checkmark-circle' : 'scan'} size={15} color={complete ? colors.accent : colors.primaryLight} />
        <Text style={styles.faceMapBadgeText}>{complete ? 'Map complete' : 'Dermal map'}</Text>
      </View>
    </View>
  );
}

function RoutineStep({ item, index }) {
  return (
    <View style={styles.routineStep}>
      <View style={styles.stepIndex}>
        <Text style={styles.stepIndexText}>{index + 1}</Text>
      </View>
      <View style={styles.stepBody}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepName}>{item.step}</Text>
          <Text style={styles.stepTiming}>{item.timing}</Text>
        </View>
        <Text style={styles.stepProduct}>{item.product}</Text>
        <Text style={styles.stepWhy}>{item.why}</Text>
      </View>
    </View>
  );
}

function ProductRecommendation({ item }) {
  return (
    <View style={styles.productCard}>
      <View style={styles.productTop}>
        <View>
          <Text style={styles.productCategory}>{item.category}</Text>
          <Text style={styles.productType}>{item.productType}</Text>
        </View>
        <View style={styles.matchBadge}>
          <Text style={styles.matchText}>{item.match}</Text>
        </View>
      </View>
      <Text style={styles.productWhy}>{item.why}</Text>
      <View style={styles.ingredientRow}>
        {item.ingredients?.map((ingredient) => (
          <View key={ingredient} style={styles.ingredientPill}>
            <Text style={styles.ingredientText}>{ingredient}</Text>
          </View>
        ))}
      </View>
      {item.avoid?.length ? (
        <Text style={styles.avoidText}>Avoid: {item.avoid.join(', ')}</Text>
      ) : null}
    </View>
  );
}

export default function SkincareScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [capturedUri, setCapturedUri] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [routineTab, setRoutineTab] = useState('AM');
  const cameraRef = useRef(null);

  const metrics = useMemo(
    () => [
      { label: 'Hydration', value: analysis?.hydration ?? 0, color: colors.accent },
      { label: 'Texture', value: analysis?.texture ?? 0, color: colors.primaryLight },
      { label: 'Tone evenness', value: analysis?.tone ?? 0, color: '#7DD3FC' },
      { label: 'Oil balance', value: analysis?.oilBalance ?? 0, color: colors.warning },
      { label: 'Barrier', value: analysis?.barrier ?? 0, color: '#FF6B6B' },
    ],
    [analysis]
  );

  const activeRoutine = routineTab === 'AM' ? analysis?.morningRoutine : analysis?.nightRoutine;

  const handleCapture = async () => {
    if (Platform.OS === 'web') {
      setCapturedUri('web-preview');
      return;
    }

    if (!cameraRef.current || !cameraReady) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.75,
        skipProcessing: true,
      });
      setCapturedUri(photo.uri);
    } catch (_) {
      Alert.alert('Camera unavailable', 'We could not capture a photo. Try again in better lighting.');
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo access to upload a skincare scan.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled) {
      setCapturedUri(result.assets[0].uri);
      setAnalysis(null);
    }
  };

  const handleUseWebSample = () => {
    setCapturedUri(WEB_SAMPLE_PHOTO);
    setAnalysis(null);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const result = await analyzeSkincareScan({ imageUri: capturedUri });
      setAnalysis(result.result);
    } catch (_) {
      Alert.alert('Analysis unavailable', 'We could not generate your skincare routine. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetScan = () => {
    setCapturedUri(null);
    setAnalysis(null);
    setIsAnalyzing(false);
  };

  const renderCameraSurface = () => {
    if (capturedUri) {
      return (
        <LinearGradient
          colors={['rgba(108,92,231,0.18)', 'rgba(0,217,163,0.08)', 'rgba(255,255,255,0.03)']}
          style={styles.capturedPreview}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {capturedUri !== 'web-preview' && (
            <>
              <Image source={{ uri: capturedUri }} style={styles.previewImage} />
              <LinearGradient
                colors={['rgba(8,10,13,0.28)', 'rgba(8,10,13,0.82)']}
                style={StyleSheet.absoluteFill}
              />
            </>
          )}
          <FaceMap analyzing={isAnalyzing} complete={!!analysis} />
        </LinearGradient>
      );
    }

    if (!permission) {
      return (
        <View style={styles.cameraFallback}>
          <Ionicons name="scan-outline" size={34} color={colors.primaryLight} />
          <Text style={styles.cameraFallbackText}>Preparing camera permissions...</Text>
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View style={styles.cameraFallback}>
          <Ionicons name="camera-outline" size={36} color={colors.primaryLight} />
          <Text style={styles.cameraFallbackTitle}>Enable camera scan</Text>
          <Text style={styles.cameraFallbackText}>
            NextSelf uses your camera to estimate skincare needs and build a routine.
          </Text>
          <GradientButton
            label="Allow Camera"
            icon="📷"
            size="small"
            gradient={[colors.primary, colors.accent]}
            onPress={requestPermission}
            style={styles.permissionBtn}
          />
        </View>
      );
    }

    return (
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="front"
        onCameraReady={() => setCameraReady(true)}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Skincare Lab</Text>
            <Text style={styles.subtitle}>Face scan to daily routine</Text>
          </View>
          <View style={styles.statusChip}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>AI Derm</Text>
          </View>
        </View>

        <View style={styles.heroPanel}>
          <LinearGradient
            colors={['rgba(108,92,231,0.14)', 'rgba(0,217,163,0.06)', 'rgba(255,255,255,0.02)']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.scanHeader}>
            <View>
              <Text style={styles.scanEyebrow}>LIVE SKIN MAPPING</Text>
              <Text style={styles.scanTitle}>{analysis ? `${analysis.skinScore}/100 skin score` : 'Front camera analysis'}</Text>
            </View>
            <Ionicons name="aperture" size={26} color={colors.accent} />
          </View>

          <View style={styles.viewfinderWrap}>
            {renderCameraSurface()}
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
            {!capturedUri && permission?.granted && (
              <View style={styles.faceGuide}>
                <Ionicons name="person-outline" size={82} color="rgba(255,255,255,0.24)" />
                <Text style={styles.faceGuideText}>Center face in natural light</Text>
              </View>
            )}
          </View>

          <View style={styles.scanStatsRow}>
            <View style={styles.scanStat}>
              <Text style={styles.scanStatValue}>{analysis?.skinType ?? 'Pending'}</Text>
              <Text style={styles.scanStatLabel}>Skin type</Text>
            </View>
            <View style={styles.scanDivider} />
            <View style={styles.scanStat}>
              <Text style={styles.scanStatValue}>{analysis ? `${analysis.confidence}%` : '--'}</Text>
              <Text style={styles.scanStatLabel}>Confidence</Text>
            </View>
            <View style={styles.scanDivider} />
            <View style={styles.scanStat}>
              <Text style={styles.scanStatValue}>{analysis?.sensitivity ?? '--'}</Text>
              <Text style={styles.scanStatLabel}>Sensitivity</Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            {!capturedUri ? (
              <>
                <TouchableOpacity style={styles.iconButton} onPress={handlePickImage} activeOpacity={0.75}>
                  <Ionicons name="image-outline" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={handleUseWebSample} activeOpacity={0.75}>
                  <Ionicons name="globe-outline" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                <GradientButton
                  label="Capture Face Scan"
                  icon="📷"
                  gradient={[colors.primary, colors.accent]}
                  onPress={handleCapture}
                  disabled={permission?.granted && Platform.OS !== 'web' && !cameraReady}
                  style={styles.primaryAction}
                />
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.iconButton} onPress={resetScan} activeOpacity={0.75}>
                  <Ionicons name="refresh" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                <GradientButton
                  label={analysis ? 'Refresh Analysis' : 'Analyze Skin'}
                  icon="✨"
                  gradient={[colors.primary, colors.accent]}
                  onPress={handleAnalyze}
                  disabled={isAnalyzing}
                  style={styles.primaryAction}
                />
              </>
            )}
          </View>
        </View>

        {isAnalyzing && (
          <View style={styles.processingPanel}>
            <Ionicons name="analytics" size={18} color={colors.accent} />
            <Text style={styles.processingText}>Reading hydration, tone, texture, oil balance, and barrier signals...</Text>
          </View>
        )}

        {analysis && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Skin Metrics</Text>
              <Text style={styles.sectionHint}>Personalized from scan</Text>
            </View>
            <View style={styles.metricsPanel}>
              {metrics.map((metric) => (
                <MetricBar key={metric.label} {...metric} />
              ))}
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Detected Focus Areas</Text>
              <Text style={styles.sectionHint}>{analysis.detectedConcerns.length} signals</Text>
            </View>
            {analysis.detectedConcerns.map((concern) => (
              <View key={concern.id} style={styles.concernCard}>
                <View style={[styles.concernIcon, { backgroundColor: concern.color + '22' }]}>
                  <Ionicons name="locate" size={18} color={concern.color} />
                </View>
                <View style={styles.concernBody}>
                  <View style={styles.concernTop}>
                    <Text style={styles.concernLabel}>{concern.label}</Text>
                    <Text style={[styles.concernSeverity, { color: concern.color }]}>{concern.severity}</Text>
                  </View>
                  <Text style={styles.concernArea}>{concern.area}</Text>
                  <Text style={styles.concernNote}>{concern.note}</Text>
                </View>
              </View>
            ))}

            <View style={styles.routinePanel}>
              <View style={styles.routineHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Personal Routine</Text>
                  <Text style={styles.sectionHint}>Built for combination skin</Text>
                </View>
                <View style={styles.routineTabs}>
                  {ROUTINE_TABS.map((tab) => (
                    <TouchableOpacity
                      key={tab}
                      onPress={() => setRoutineTab(tab)}
                      style={[styles.routineTab, routineTab === tab && styles.routineTabActive]}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.routineTabText, routineTab === tab && styles.routineTabTextActive]}>{tab}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              {activeRoutine?.map((step, index) => (
                <RoutineStep key={step.id} item={step} index={index} />
              ))}
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Product Matches</Text>
              <Text style={styles.sectionHint}>Ingredient-first</Text>
            </View>
            {analysis.productRecommendations?.map((item) => (
              <ProductRecommendation key={item.id} item={item} />
            ))}
          </>
        )}

        <View style={styles.disclaimer}>
          <Ionicons name="shield-checkmark-outline" size={16} color={colors.accent} />
          <Text style={styles.disclaimerText}>
            Skincare guidance is educational and not a medical diagnosis. For acne, rashes, pain, or persistent irritation, use a licensed dermatologist.
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
    marginBottom: 18,
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
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.6,
  },
  heroPanel: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  scanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  scanEyebrow: {
    fontSize: 10,
    color: colors.accent,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  scanTitle: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  viewfinderWrap: {
    width: '100%',
    aspectRatio: 1,
    maxHeight: VIEWFINDER_SIZE,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#080A0D',
    borderWidth: 1,
    borderColor: '#2D4A4E',
    position: 'relative',
    alignSelf: 'center',
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  cameraFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    gap: 10,
    backgroundColor: '#101216',
  },
  cameraFallbackTitle: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  cameraFallbackText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    textAlign: 'center',
  },
  permissionBtn: {
    marginTop: 8,
  },
  capturedPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  faceMap: {
    width: '82%',
    height: '88%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanLine: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: '50%',
    height: 2,
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
  faceMapBadge: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  faceMapBadgeText: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  cornerTL: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 36,
    height: 36,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: colors.accent,
  },
  cornerTR: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: colors.accent,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    width: 36,
    height: 36,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: colors.primaryLight,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: colors.primaryLight,
  },
  faceGuide: {
    position: 'absolute',
    alignSelf: 'center',
    top: '33%',
    alignItems: 'center',
  },
  faceGuideText: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '700',
  },
  scanStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    marginTop: 14,
    overflow: 'hidden',
  },
  scanStat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  scanStatValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  scanStatLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 3,
    fontWeight: '600',
  },
  scanDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  primaryAction: {
    flex: 1,
  },
  iconButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    backgroundColor: colors.accentGlow,
    borderWidth: 1,
    borderColor: 'rgba(0,217,163,0.25)',
    padding: 14,
    marginBottom: 16,
  },
  processingText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 6,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  sectionHint: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '700',
  },
  metricsPanel: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 18,
  },
  metricRow: {
    marginBottom: 14,
  },
  metricTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  metricTrack: {
    height: 6,
    borderRadius: 4,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  metricFill: {
    height: '100%',
    borderRadius: 4,
  },
  concernCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },
  concernIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  concernBody: {
    flex: 1,
  },
  concernTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  concernLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  concernSeverity: {
    fontSize: 11,
    fontWeight: '900',
  },
  concernArea: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 7,
  },
  concernNote: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  routinePanel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 16,
    marginTop: 8,
    marginBottom: 18,
  },
  routineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  routineTabs: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    padding: 3,
  },
  routineTab: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  routineTabActive: {
    backgroundColor: colors.primaryGlow,
  },
  routineTabText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
  },
  routineTabTextActive: {
    color: colors.primaryLight,
  },
  routineStep: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  stepIndex: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: colors.accentGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepIndexText: {
    color: colors.accent,
    fontWeight: '900',
    fontSize: 13,
  },
  stepBody: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  stepName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  stepTiming: {
    color: colors.warning,
    fontSize: 11,
    fontWeight: '800',
  },
  stepProduct: {
    color: colors.primaryLight,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
    marginBottom: 5,
  },
  stepWhy: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  disclaimer: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: colors.surfaceLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  productCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },
  productTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  productCategory: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  productType: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    flexShrink: 1,
  },
  matchBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryGlow,
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  matchText: {
    color: colors.primaryLight,
    fontSize: 10,
    fontWeight: '900',
  },
  productWhy: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  ingredientRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  ingredientPill: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  ingredientText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  avoidText: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
  },
  disclaimerText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
  },
});
