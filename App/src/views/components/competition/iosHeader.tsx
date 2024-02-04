import { View } from 'react-native';
import { COLORS, px } from '~/util/const';
import { OLText } from '~/views/components/text';

interface Props {
  name: string;
}

export const OLCompetitionIOSHeader: React.FC<Props> = ({ name }) => (
  <View
    style={{
      backgroundColor: COLORS.MAIN,
      paddingVertical: px(15),
    }}
  >
    <OLText
      size={18}
      bold
      italics
      uppercase
      style={{
        paddingHorizontal: px(16),
        textAlign: 'center',
        color: 'white',
      }}
    >
      {name}
    </OLText>
  </View>
);
