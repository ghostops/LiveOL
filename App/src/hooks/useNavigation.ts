import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NavigationContainerRef } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/core';
import { RootStack } from '~/lib/nav/router';

let navRef: NavigationContainerRef<RootStack> | null = null;

export const useOLNavigation = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStack>>();

  return navigation;
};

export const useOLNavigationRef = () => {
  return {
    setNavRef: (ref: NavigationContainerRef<RootStack>) => {
      navRef = ref;
    },
    getNavRef: () => navRef,
  };
};
