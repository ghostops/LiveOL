import { useTheme } from 'hooks/useTheme';
import React from 'react';
import { Dimensions, Image, Linking, ScrollView, View } from 'react-native';
import { OLButton } from 'views/components/button';
import { OLText } from 'views/components/text';
import Carousel from 'react-native-snap-carousel';

const NOTIFICATION_IMG = require('../../../../assets/images/notification.png');
const REFRESH_IMG = require('../../../../assets/images/refresh.png');
const FOLLOW_IMG = require('../../../../assets/images/follow.png');
const SORT_IMG = require('../../../../assets/images/sort.png');

const promoItems = [
  {
    text: 'Follow specific people and get quick access to their results',
    img: FOLLOW_IMG,
  },
  {
    text: 'Follow runners and get notifications',
    img: NOTIFICATION_IMG,
  },
  {
    text: 'Custom refresh time',
    img: REFRESH_IMG,
  },
  {
    text: 'Sorting the result columns',
    img: SORT_IMG,
  },
];

const OLPromoItem: React.FC<{ text: string; img: any }> = ({ text, img }) => {
  const { px } = useTheme();

  return (
    <View style={{ alignItems: 'center' }}>
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
        paddingTop: px(16),
        backgroundColor: 'white',
      }}
      contentContainerStyle={{ paddingBottom: px(64) }}
    >
      <OLText
        font="Rift Bold"
        size={32}
        style={{ textAlign: 'center', margin: px(16) }}
      >
        Do more with LiveOL+
      </OLText>

      <Carousel
        data={promoItems}
        renderItem={({ item }) => (
          <OLPromoItem text={item.text} img={item.img} />
        )}
        sliderWidth={Dimensions.get('window').width}
        itemWidth={Dimensions.get('window').width - 16}
        loop
        autoplay
        autoplayInterval={5000}
      />

      <View style={{ paddingHorizontal: px(16), marginTop: px(8) }}>
        <OLText
          font="Proxima Nova Regular"
          size={16}
          style={{ textAlign: 'center', marginBottom: px(32) }}
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
      </View>
    </ScrollView>
  );
};
