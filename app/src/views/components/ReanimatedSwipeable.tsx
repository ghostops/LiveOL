import React, { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface ReanimatedSwipeableProps {
  children: ReactNode;
  renderRightActions?: () => ReactNode;
  rightActionsWidth?: number;
  onSwipeableOpen?: (direction: 'left' | 'right') => void;
}

export const ReanimatedSwipeable: React.FC<ReanimatedSwipeableProps> = ({
  children,
  renderRightActions,
  rightActionsWidth = 100,
  onSwipeableOpen,
}) => {
  const translateX = useSharedValue(0);
  const isOpen = useSharedValue(false);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate(event => {
      // Only allow swiping left (negative translation)
      if (event.translationX < 0) {
        translateX.value = Math.max(event.translationX, -rightActionsWidth);
      } else if (isOpen.value) {
        // If already open, allow swiping right to close
        translateX.value = Math.max(
          event.translationX - rightActionsWidth,
          -rightActionsWidth,
        );
      }
    })
    .onEnd(() => {
      // Snap to open or closed based on threshold
      const threshold = -rightActionsWidth / 2;
      const shouldOpen = translateX.value < threshold;

      translateX.value = withSpring(shouldOpen ? -rightActionsWidth : 0, {
        damping: 15,
        stiffness: 150,
      });

      if (shouldOpen && !isOpen.value) {
        isOpen.value = true;
        if (onSwipeableOpen) {
          runOnJS(onSwipeableOpen)('right');
        }
      } else if (!shouldOpen && isOpen.value) {
        isOpen.value = false;
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={styles.container}>
      {renderRightActions && (
        <Animated.View
          style={[styles.rightActions, { width: rightActionsWidth }]}
        >
          {renderRightActions()}
        </Animated.View>
      )}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.content, animatedStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  content: {
    backgroundColor: 'white',
  },
  rightActions: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
});
