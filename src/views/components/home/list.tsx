import * as React from 'react';
import { px, fontPx } from 'util/const';
import _ from 'lodash';
import * as NB from 'native-base';
import { Lang } from 'lib/lang';
import { HomeListItem } from './listItem';
import { today } from 'util/date';
import { FlatList } from 'react-native';
import { OLSafeAreaView } from '../safeArea';

const {
    List,
    ListItem,
    Text,
    View,
} = NB;

interface Props {
    competitions: Comp[];
    onCompetitionPress: (comp: Comp) => void;
    listHeader: React.ReactElement;
}

export const getVisibleCompetitions = (competitions: Comp[], page: number, size: number) =>
    competitions.slice(
        size * (page === 1 ? 0 : (page || 1)),
        (size * (page || 1)) + size,
    );

export const groupVisibleCompetitions = (visibleCompetitions: Comp[]): Record<string, Comp[]> => {
    const uniqEs6 = (arrArg) => (
        arrArg.filter((elem, pos, arr) => {
            return arr.indexOf(elem) === pos;
        })
    );

    const keys = uniqEs6(visibleCompetitions.map((comp) => comp.date));
    const map = {};

    for (const key of keys) {
        map[key] = [];
    }

    for (const comp of visibleCompetitions) {
        map[comp.date].push(comp);
    }

    return map;
};

export const HomeList: React.SFC<Props> = ({
    competitions,
    onCompetitionPress,
    listHeader,
}) => {
    const visibleCompetitions = groupVisibleCompetitions(competitions);

    const renderListItem = (competition: Comp, index: number, total: number) => (
        <HomeListItem
            key={competition.id}
            competition={competition}
            index={index}
            onCompetitionPress={onCompetitionPress}
            total={total}
        />
    );

    const renderListSection = (key: string, competitions: Record<string, Comp[]>) => {
        return (
            <OLSafeAreaView key={key}>
                <View>
                    <ListItem
                        itemDivider
                        style={{
                            marginLeft: 0,
                            paddingHorizontal: px(16),
                        }}
                    >
                        <Text style={{
                            fontSize: fontPx(16),
                            fontWeight: 'bold',
                        }}>
                            {key} {key === today() && `(${Lang.print('home.today')})`}
                        </Text>
                    </ListItem>

                    <List>
                        {competitions[key].map((comp, index) => (
                            renderListItem(comp, index, competitions[key].length)
                        ))}
                    </List>
                </View>
            </OLSafeAreaView>
        );
    };

    if (!Object.keys(visibleCompetitions).length) {
        return (
            <View
                style={{
                    width: '100%',
                    paddingVertical: px(16 * 4),
                }}
            >
                <Text
                    style={{
                        fontSize: fontPx(16),
                        textAlign: 'center',
                    }}
                >
                    {Lang.print('home.nothingSearch')}
                </Text>
            </View>
        );
    }

    return (
        <FlatList
            ListHeaderComponent={listHeader}
            data={Object.keys(visibleCompetitions)}
            renderItem={({ item }) => renderListSection(item, visibleCompetitions)}
            keyExtractor={(item) => `${item}`}
        />
    );
};
