import { Animated } from 'react-native';
import { create } from 'zustand';

type HomeHeaderState = {
  scrollY: Animated.Value;
  onListScroll: (event: any) => void;
};

export const useHomeHeaderStore = create<HomeHeaderState>((set, get) => ({
  scrollY: new Animated.Value(0),
  onListScroll: event =>
    get().scrollY.setValue(event.nativeEvent.contentOffset.y),
}));
