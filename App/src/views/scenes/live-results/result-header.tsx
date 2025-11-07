import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { OLText } from '~/views/components/text';
import { useRowWidths } from './row';

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
  const { name, place, splits, start, time } = useRowWidths();
  return (
    <View
      style={{
        flexDirection: 'row',
        borderBottomWidth: 1,
        alignItems: 'center',
        paddingVertical: 8,
      }}
    >
      <View style={{ width: place, alignItems: 'center' }}>
        <OLText>{t('classes.header.place')}</OLText>
      </View>
      <View style={{ width: name, alignItems: 'flex-start', paddingLeft: 16 }}>
        <OLText>{t('classes.header.name')}</OLText>
      </View>
      {props.liveSplitControls?.map(split => (
        <View
          key={split.code}
          style={{ width: splits, alignItems: 'flex-start', paddingLeft: 16 }}
        >
          <OLText>{split.name}</OLText>
        </View>
      ))}
      <View style={{ width: time, alignItems: 'flex-end' }}>
        <OLText>{t('classes.header.time')}</OLText>
      </View>
      <View style={{ width: start, alignItems: 'flex-end', paddingRight: 16 }}>
        <OLText>{t('classes.header.start')}</OLText>
      </View>
    </View>
  );
};
