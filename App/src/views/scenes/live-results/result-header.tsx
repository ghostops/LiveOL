import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { OLText } from '~/views/components/text';
import { useRowWidths } from './useRowWidths';
import { useOrientation } from '~/hooks/useOrientation';
import { OrientationType } from 'react-native-orientation-locker';

type Props = {
  liveSplitControls?:
    | {
        name: string;
        code: string;
      }[]
    | undefined;
};

export const OLResultHeader = (props: Props) => {
  const { t } = useTranslation();
  const { name, place, splits, time } = useRowWidths();
  const orientation = useOrientation();

  return (
    <View
      style={{
        flexDirection: 'row',
        borderBottomWidth: 1,
        alignItems: 'center',
        paddingVertical: 8,
      }}
    >
      <View
        style={{
          width: place,
          alignItems:
            orientation === OrientationType.PORTRAIT ? 'center' : 'flex-end',
        }}
      >
        <OLText>{t('classes.header.place')}</OLText>
      </View>
      <View style={{ width: name, alignItems: 'flex-start' }}>
        <OLText>{t('classes.header.name')}</OLText>
      </View>
      {props.liveSplitControls?.map(split => (
        <View
          key={split.code}
          style={{ width: splits, alignItems: 'flex-start' }}
        >
          <OLText>{split.name}</OLText>
        </View>
      ))}
      <View style={{ width: time, alignItems: 'flex-end', paddingRight: 8 }}>
        <OLText>{t('classes.header.time')}</OLText>
      </View>
    </View>
  );
};
