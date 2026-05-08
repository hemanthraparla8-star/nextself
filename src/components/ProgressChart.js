import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, {
  Path,
  Circle,
  G,
  Defs,
  LinearGradient,
  Stop,
  Text as SvgText,
  Line,
} from 'react-native-svg';
import { colors } from '../theme/colors';

const CHART_HEIGHT = 160;
const PAD = { top: 16, right: 16, bottom: 36, left: 36 };

export default function ProgressChart({ data = [] }) {
  const containerWidth = Dimensions.get('window').width - 48;
  const chartW = containerWidth - PAD.left - PAD.right;
  const chartH = CHART_HEIGHT - PAD.top - PAD.bottom;

  if (!data.length) return null;

  const scores = data.map((d) => d.score);
  const minVal = Math.max(0, Math.min(...scores) - 10);
  const maxVal = Math.min(100, Math.max(...scores) + 10);

  const xOf = (i) => (i / (data.length - 1)) * chartW;
  const yOf = (v) => chartH - ((v - minVal) / (maxVal - minVal)) * chartH;

  // Build smooth bezier path
  const points = data.map((d, i) => ({ x: xOf(i), y: yOf(d.score) }));

  const linePath = points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = points[i - 1];
    const cpX = (prev.x + pt.x) / 2;
    return `${acc} C ${cpX} ${prev.y} ${cpX} ${pt.y} ${pt.x} ${pt.y}`;
  }, '');

  const areaPath = `${linePath} L ${xOf(data.length - 1)} ${chartH} L 0 ${chartH} Z`;

  // Y-axis guide lines
  const yTicks = [minVal, (minVal + maxVal) / 2, maxVal].map((v) => ({
    val: Math.round(v),
    y: yOf(v),
  }));

  return (
    <View style={styles.container}>
      <Svg width={containerWidth} height={CHART_HEIGHT}>
        <Defs>
          <LinearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.primary} stopOpacity="0.35" />
            <Stop offset="1" stopColor={colors.primary} stopOpacity="0.0" />
          </LinearGradient>
          <LinearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={colors.primary} stopOpacity="1" />
            <Stop offset="1" stopColor={colors.accent} stopOpacity="1" />
          </LinearGradient>
        </Defs>

        <G transform={`translate(${PAD.left}, ${PAD.top})`}>
          {/* Grid lines */}
          {yTicks.map((tick, i) => (
            <G key={i}>
              <Line
                x1={0}
                y1={tick.y}
                x2={chartW}
                y2={tick.y}
                stroke={colors.border}
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <SvgText
                x={-8}
                y={tick.y + 4}
                textAnchor="end"
                fill={colors.textMuted}
                fontSize="10"
                fontWeight="500"
              >
                {tick.val}
              </SvgText>
            </G>
          ))}

          {/* Area gradient fill */}
          <Path d={areaPath} fill="url(#areaFill)" />

          {/* Line */}
          <Path
            d={linePath}
            stroke="url(#lineGrad)"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((pt, i) => (
            <G key={i}>
              <Circle cx={pt.x} cy={pt.y} r="5" fill={colors.background} />
              <Circle cx={pt.x} cy={pt.y} r="3.5" fill={colors.primary} />
            </G>
          ))}

          {/* X-axis labels */}
          {data.map((d, i) => (
            <SvgText
              key={i}
              x={xOf(i)}
              y={chartH + 22}
              textAnchor="middle"
              fill={colors.textMuted}
              fontSize="11"
              fontWeight="500"
            >
              {d.day}
            </SvgText>
          ))}
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
});
