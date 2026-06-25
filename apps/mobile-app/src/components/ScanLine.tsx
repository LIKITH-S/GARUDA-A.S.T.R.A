import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { COLORS } from '../constants/theme';

interface ScanLineProps {
  color?: string;
  duration?: number;
}

export const ScanLine: React.FC<ScanLineProps> = ({
  color = COLORS.secondary,
  duration = 3000,
}) => {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: 1,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [translateY, duration]);

  // Interpolate translateY to convert to absolute container height position
  const translateYInterpolated = translateY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 160], // Based on parent container heights
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View
        style={[
          styles.scanLine,
          {
            backgroundColor: color,
            shadowColor: color,
            transform: [{ translateY: translateYInterpolated }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  scanLine: {
    height: 2,
    width: '100%',
    position: 'absolute',
    left: 0,
    zIndex: 10,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 5,
  },
});
export default ScanLine;
