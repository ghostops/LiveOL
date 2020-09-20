import * as React from 'react';
import { View } from 'native-base';
import { OLText } from '../text';
import { Image, Linking, ViewStyle } from 'react-native';
import { px } from 'util/const';
import { TouchableOpacity } from 'react-native-gesture-handler';

interface Props {
    name: string;
    logoUrl?: string;
    size?: string;
    style?: ViewStyle;
}

export const OLCompetitionClub: React.FC<Props> = ({ name, style, logoUrl, size }) => {
    return (
        <View style={style}>
            <View
                style={{
                    alignItems: 'center',
                }}
            >
                <Image
                    source={{ uri: `${logoUrl}?type=${size}` }}
                    style={{
                        height: px(40),
                        width: px(40),
                        marginBottom: px(8),
                    }}
                />

                <OLText
                    size={18}
                    font="Rift_Bold_Italic"
                >
                    {name}
                </OLText>
            </View>
        </View>
    );
};
