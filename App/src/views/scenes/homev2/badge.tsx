import { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { OLText } from '~/views/components/text';

type Props = {
  text: string;
  background: string;
  color: string;
};

export const OLHomeBadge = ({ text, background, color }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <TouchableOpacity
      onPress={() => setIsExpanded(!isExpanded)}
      style={[style.badge, { backgroundColor: background }]}
    >
      <OLText size={12} style={{ color }}>
        {isExpanded ? text : text.slice(0, 1)}
      </OLText>
    </TouchableOpacity>
  );
};

const style = StyleSheet.create({
  badge: {
    borderRadius: 4,
    paddingHorizontal: 4,
  },
});
