import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Platform, TouchableOpacity } from 'react-native';
import { HIT_SLOP, px } from 'util/const';
import { useDispatch, useSelector } from 'react-redux';
import { toggleMute } from 'store/stores/general';

export const AudioControlls: React.FC = () => {
	const muted = useSelector<AppState, boolean>((state) => state.general.audioMuted);
	const dispatch = useDispatch();
	const onPress = () => dispatch(toggleMute());

	if (Platform.OS === 'android') return null;

	return (
		<TouchableOpacity onPress={onPress} style={{ marginRight: px(12) }} hitSlop={HIT_SLOP}>
			<Ionicons name={muted ? 'ios-volume-mute' : 'ios-volume-high'} size={24} color="white" />
		</TouchableOpacity>
	);
};
