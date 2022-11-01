import React from 'react';
import { Platform, TouchableOpacity } from 'react-native';
import { HIT_SLOP, px } from 'util/const';
import { useAudioStore } from 'store/audio';
import { OLIcon } from 'views/components/icon';

export const AudioControlls: React.FC = () => {
  const { isMuted, setMuted } = useAudioStore();
  const onPress = () => setMuted(!isMuted);

  if (Platform.OS === 'android') {
    return null;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ marginRight: px(12) }}
      hitSlop={HIT_SLOP}
    >
      <OLIcon
        name={isMuted ? 'ios-volume-mute' : 'ios-volume-high'}
        size={24}
        color="white"
      />
    </TouchableOpacity>
  );
};
