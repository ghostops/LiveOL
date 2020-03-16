import * as React from 'react';

import {
    Text,
    View,
    Button,
} from 'native-base';
import { UNIT, COLORS } from 'util/const';
import { Ionicons } from '@expo/vector-icons';
import { ViewStyle } from 'react-native';
import { Lang } from 'lib/lang';

interface Props {
    page: number;
    size: number;
    lastPageCompetitions: Comp[];
    paginateBegining: () => void;
    paginateBackwards: () => void;
    paginateForward: () => void;
    paginateEnd: () => void;
}

const BUTTON_STYLE = (disabled: boolean): ViewStyle => ({
    flex: 1,
    marginLeft: UNIT / 2,
    justifyContent: 'center',
    backgroundColor: COLORS.MAIN,
    opacity: disabled ? 0.35 : 1,
});

export const Pagination: React.SFC<Props> = ({
    page,
    paginateBegining,
    paginateBackwards,
    paginateEnd,
    paginateForward,
    lastPageCompetitions,
    size,
}) => {
    return (
        <View style={{
            width: '100%',
            paddingVertical: UNIT,
            paddingHorizontal: UNIT,
        }}>
                <Text style={{
                    width: '100%',
                    textAlign: 'center',
                    paddingBottom: UNIT,
                }}>
                    {Lang.print('home.page')} {page}
                </Text>

                <View
                    style={{
                        width: '100%',
                        flexDirection: 'row',
                    }}
                >
                    <Button
                        style={BUTTON_STYLE(page === 1)}
                        disabled={page === 1}
                        onPress={paginateBegining}
                    >
                        <Ionicons
                            name="md-rewind"
                            size={32}
                            color="white"
                        />
                    </Button>

                    <Button
                        style={BUTTON_STYLE(page === 1)}
                        disabled={page === 1}
                        onPress={paginateBackwards}
                    >
                        <Ionicons
                            name="md-arrow-dropleft"
                            size={32}
                            color="white"
                        />
                    </Button>

                    <Button
                        style={BUTTON_STYLE(lastPageCompetitions.length < size)}
                        disabled={lastPageCompetitions.length < size}
                        onPress={paginateForward}
                    >
                        <Ionicons
                            name="md-arrow-dropright"
                            size={32}
                            color="white"
                        />
                    </Button>

                    <Button
                        style={BUTTON_STYLE(lastPageCompetitions.length < size)}
                        disabled={lastPageCompetitions.length < size}
                        onPress={paginateEnd}
                    >
                        <Ionicons
                            name="md-fastforward"
                            size={32}
                            color="white"
                        />
                    </Button>
                </View>
            </View>
    );
};
