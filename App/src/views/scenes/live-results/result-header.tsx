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
    <View style={{ flexDirection: 'row', borderBottomWidth: 1 }}>
      <View style={{ width: place }}>
        <OLText>{t('classes.header.place')}</OLText>
      </View>
      <View style={{ width: name }}>
        <OLText>{t('classes.header.name')}</OLText>
      </View>
      {props.liveSplitControls?.map(split => (
        <View key={split.code} style={{ width: splits }}>
          <OLText>{split.name}</OLText>
        </View>
      ))}
      <View style={{ width: time }}>
        <OLText>{t('classes.header.time')}</OLText>
      </View>
      <View style={{ width: start }}>
        <OLText>{t('classes.header.start')}</OLText>
      </View>
    </View>
  );
};
