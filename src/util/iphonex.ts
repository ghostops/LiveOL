import { Dimensions, Platform } from 'react-native';

const { height, width } = Dimensions.get('window');

export const xtraSpace = 30;

export const isIphoneX = (
    Platform.OS === 'ios' &&
    (
        (height === 812 || width === 812) ||
        (height === 896 || width === 896)
    )
);
