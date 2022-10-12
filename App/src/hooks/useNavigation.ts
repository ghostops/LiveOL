import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/core';
import { RootStack } from 'lib/nav/router';

export const useOLNavigation = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStack>>();

  return navigation;
};
