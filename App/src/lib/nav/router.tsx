import { useTranslation } from 'react-i18next';
import { StatusBar, View } from 'react-native';
import { OLResults } from '~/views/scenes/results/container';
import { OLInfo } from '~/views/scenes/info/container';
import { OLHome } from '~/views/scenes/home/container';
import { OLCompetition } from '~/views/scenes/competition/container';
import { OLClubResults } from '~/views/scenes/club/container';
import { NavigationContainer } from '@react-navigation/native';
import { HomeHeader } from '~/views/scenes/home/header';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from '~/util/const';
import { BackButton } from './backButton';
import { ResultMenuIcon } from '~/views/scenes/results/menuIcon';
import { OLPlus } from '~/views/scenes/plus/container';
import { ClubMenuIcon } from '~/views/scenes/club/menuIcon';
import { OLPlusFeatureKey } from '~/views/scenes/plus/component';
import { OLRedeemCode } from '~/views/scenes/redeem_modal/component';
import { OLLanguageModal } from '~/views/scenes/language_modal/component';
import { useOLNavigationRef } from '~/hooks/useNavigation';
import { Text } from 'react-native';

export type RootStack = {
  Home: undefined;
  Info: undefined;
  Competition: {
    competitionId: number;
    title: string;
  };
  Results: {
    className: string;
    competitionId: number;
    runnerId?: string;
  };
  Club: {
    clubName: string;
    competitionId: number;
    title: string;
  };
  Plus?: {
    feature?: OLPlusFeatureKey;
  };
  Redeem: undefined;
  Language: undefined;
};

const Stack = createNativeStackNavigator();
function HomeScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
    </View>
  );
}
function RootStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <RootStack />
    </NavigationContainer>
  );
}
