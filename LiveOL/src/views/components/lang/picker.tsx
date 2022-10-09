import * as React from 'react';
import { useTheme } from 'hooks/useTheme';
import { TouchableOpacity, Modal, View } from 'react-native';
import { OLFlag } from './flag';
import { Lang } from 'lib/lang';
// import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OLText } from '../text';
// import { FlatList } from 'react-native-gesture-handler';
import { OLButton } from '../button';

type Props = {
  button?: boolean;
};

export const LanguagePicker: React.FC<Props> = ({ button = false }) => {
  return null;
  // const { colors, px } = useTheme();
  // const [activeLanguage, setActiveLanguage] = React.useState<string>(
  //   Lang.active,
  // );
  // const [active, setActive] = React.useState(false);
  // const safeInsets = useSafeAreaInsets();

  // const langNames = Lang.getLangName();

  // return (
  //   <>
  //     {!button ? (
  //       <View
  //         style={{
  //           flex: 1,
  //           justifyContent: 'center',
  //           paddingLeft: 10,
  //         }}>
  //         <TouchableOpacity
  //           onPress={() => setActive(true)}
  //           style={{
  //             flexDirection: 'row',
  //             alignItems: 'center',
  //             alignSelf: 'flex-start',
  //           }}
  //           hitSlop={{ bottom: 20, left: 20, right: 40, top: 20 }}>
  //           <Ionicons name="earth-outline" size={24} color="black" />
  //           <OLFlag
  //             code={activeLanguage}
  //             size={24}
  //             style={{ borderColor: 'black', borderWidth: 1, marginLeft: 6 }}
  //           />
  //         </TouchableOpacity>
  //       </View>
  //     ) : (
  //       <OLButton onPress={() => setActive(true)}>
  //         {Lang.print('language.pick')}
  //       </OLButton>
  //     )}

  //     <Modal visible={active} animationType="slide">
  //       <View style={safeInsets}>
  //         <TouchableOpacity
  //           onPress={() => setActive(false)}
  //           hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
  //           style={{ marginLeft: 16 }}>
  //           <Ionicons name="md-close" size={32} color="black" />
  //         </TouchableOpacity>

  //         <FlatList
  //           data={Lang.available}
  //           renderItem={({ item: lang }) => {
  //             return (
  //               <TouchableOpacity
  //                 onPress={async () => {
  //                   await Lang.set(lang);
  //                   setActiveLanguage(lang);
  //                   RNRestart.Restart();
  //                 }}
  //                 style={{
  //                   alignItems: 'center',
  //                   flexDirection: 'row',
  //                   paddingLeft: px(24),
  //                   paddingVertical: px(16),
  //                   backgroundColor:
  //                     lang === activeLanguage ? colors.MAIN : 'transparent',
  //                 }}
  //                 key={lang}>
  //                 <OLFlag
  //                   code={lang}
  //                   size={32}
  //                   style={{
  //                     borderColor: 'black',
  //                     borderWidth: 1,
  //                     marginRight: px(6),
  //                   }}
  //                 />
  //                 <OLText
  //                   font={
  //                     lang === activeLanguage
  //                       ? 'Proxima-Nova-Bold regular'
  //                       : 'Proxima Nova Regular'
  //                   }
  //                   size={16}
  //                   style={{
  //                     color: lang === activeLanguage ? 'white' : 'black',
  //                   }}>
  //                   {langNames.find(({ key }) => key === lang).name}
  //                 </OLText>
  //               </TouchableOpacity>
  //             );
  //           }}
  //           keyExtractor={(item: string) => item}
  //           style={{ height: '100%', paddingTop: px(24) }}
  //         />
  //       </View>
  //     </Modal>
  //   </>
  // );
};
