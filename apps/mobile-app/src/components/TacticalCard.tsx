import React from 'react';
import { StyleSheet, View, Pressable, ViewStyle } from 'react-native';
import { COLORS, ROUNDED } from '../constants/theme';

interface TacticalCardProps {
  children: React.ReactNode;
  accentColor?: string;
  onPress?: () => void;
  style?: ViewStyle;
  containerStyle?: ViewStyle;
}

export const TacticalCard: React.FC<TacticalCardProps> = ({
  children,
  accentColor,
  onPress,
  style,
  containerStyle,
}) => {
  const CardContent = (
    <View
      style={[
        styles.card,
        accentColor ? { borderLeftWidth: 4, borderLeftColor: accentColor } : null,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.pressable,
          pressed && styles.pressed,
          containerStyle,
        ]}
      >
        {CardContent}
      </Pressable>
    );
  }

  return <View style={[styles.pressable, containerStyle]}>{CardContent}</View>;
};

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },
  card: {
    backgroundColor: COLORS.surfaceContainer,
    borderColor: COLORS.outlineVariant,
    borderWidth: 1,
    borderRadius: ROUNDED.md,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});
export default TacticalCard;
