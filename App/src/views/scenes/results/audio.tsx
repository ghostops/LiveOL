import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Platform, TouchableOpacity } from 'react-native';
import { HIT_SLOP, px } from 'util/const';
import { useRecoilState } from 'recoil';
import { isMutedAtom } from 'store/isMutedAtom';

export const AudioControlls: React.FC = () => {
	const [muted, setMuted] = useRecoilState(isMutedAtom);
	const onPress = () => setMuted(!muted);

	if (Platform.OS === 'android') return null;

	return (
		<TouchableOpacity onPress={onPress} style={{ marginRight: px(12) }} hitSlop={HIT_SLOP}>
			<Ionicons name={muted ? 'ios-volume-mute' : 'ios-volume-high'} size={24} color="white" />
		</TouchableOpacity>
	);
};
