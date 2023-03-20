import React from 'react';
import { useTheme } from 'hooks/useTheme';
import { ScrollView } from 'react-native';
import { OLText } from 'views/components/text';

export const OLPlus: React.FC = () => {
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
        italics
        bold
        size={32}
        style={{ textAlign: 'center', margin: px(16) }}
      >
        Do more with LiveOL+
      </OLText>
    </ScrollView>
  );
};
