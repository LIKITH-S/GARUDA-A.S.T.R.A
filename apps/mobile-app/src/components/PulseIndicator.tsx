import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { COLORS } from '../constants/theme';

interface PulseIndicatorProps {
  color?: string;
  size?: number;
  pulseSize?: number;
  duration?: number;
}

export const PulseIndicator: React.FC<PulseIndicatorProps> = ({
  color = COLORS.primary,
  size = 8,
  pulseSize = 2.5,
  duration = 2000,
}) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: duration,
        useNativeDriver: true,
      })
    );
    animation.start();

    return () => animation.stop();
  }, [pulseAnim, duration]);

  const scale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, pulseSize],
  });

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0.6, 0.4, 0],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.pulse,
          {
            backgroundColor: color,
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [{ scale }],
            opacity,
          },
        ]}
      />
      <View
        style={[
          styles.core,
          {
            backgroundColor: color,
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pulse: {
    position: 'absolute',
  },
  core: {
    zIndex: 2,
  },
});
export default PulseIndicator;
