import { useTheme } from 'hooks/useTheme';
import React from 'react';
import { Image, Linking, ScrollView, View } from 'react-native';
import { OLButton } from 'views/components/button';
import { OLText } from 'views/components/text';

const NOTIFICATION_IMG = require('../../../../assets/images/notification.png');
const REFRESH_IMG = require('../../../../assets/images/refresh.png');
const FOLLOW_IMG = require('../../../../assets/images/follow.png');
const SORT_IMG = require('../../../../assets/images/sort.png');

const OLPromoItem: React.FC<{ text: string; img: any }> = ({ text, img }) => {
  const { px } = useTheme();

  return (
    <View style={{ marginBottom: px(64), alignItems: 'center' }}>
      <OLText
        font="Proxima Nova Regular"
        size={20}
        style={{ textAlign: 'center', marginBottom: px(16) }}
      >
        {text}
      </OLText>

      <Image
        source={img}
        style={{
          borderRadius: 4,
        }}
        resizeMode="contain"
      />
    </View>
  );
};

export const OLPromo: React.FC = () => {
  const { px } = useTheme();
  return (
    <ScrollView
      style={{
        paddingTop: px(32),
        paddingHorizontal: px(16),
        backgroundColor: 'white',
      }}
      contentContainerStyle={{ paddingBottom: px(64) }}
    >
      <OLText
        font="Rift Bold"
        size={32}
        style={{ textAlign: 'center', marginBottom: px(32) }}
      >
        Do more with LiveOL+
      </OLText>

      <OLPromoItem
        text="Follow specific people and get quick access to their results"
        img={FOLLOW_IMG}
      />

      <OLPromoItem
        text="Follow runners and get notifications"
        img={NOTIFICATION_IMG}
      />

      <OLPromoItem text="Custom refresh time" img={REFRESH_IMG} />

      <OLPromoItem text="Sorting the result columns" img={SORT_IMG} />

      <OLText
        font="Proxima Nova Regular"
        size={16}
        style={{ textAlign: 'center', marginBottom: px(16) }}
      >
        But most importantly of all, you will be supporting the continued
        maintenance of LiveOL and make sure the app stays alive.
      </OLText>

      <OLButton
        style={{ marginBottom: px(32) }}
        onPress={() => {
          Linking.openURL('https://liveol.larsendahl.se#plus');
        }}
      >
        I am interested
      </OLButton>
    </ScrollView>
  );
};
