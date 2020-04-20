import * as ScreenOrientation from 'expo-screen-orientation';

export const isLandscape = (rotation): boolean => {
    return (
        rotation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
        rotation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
    );
};
