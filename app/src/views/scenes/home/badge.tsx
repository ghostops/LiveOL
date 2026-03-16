import { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { FEATURE_FLAGS } from '~/util/featureFlags';
import { OLText } from '~/views/components/text';

type Props = {
  text: string;
  background: string;
  color: string;
  expanded?: boolean;
};

export const OLHomeBadge = ({ text, background, color, expanded }: Props) => {
  const [isExpanded, setIsExpanded] = useState(expanded ?? false);
  if (FEATURE_FLAGS.ENABLE_HOME_BADGES === false) {
    return null;
  }
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
