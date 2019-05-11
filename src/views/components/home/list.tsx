import * as React from 'react';
import { UNIT } from 'util/const';
import * as _ from 'lodash';
import * as NB from 'native-base';
import Lang from 'lib/lang';
import { HomeListItem } from './listItem';
import { today } from 'util/date';

const {
    List,
    ListItem,
    Text,
    View,
} = NB;

interface Props {
    competitions: Comp[];
    page: number;
    sizePerPage: number;
    onCompetitionPress: (comp: Comp) => void;
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
    page,
    sizePerPage,
    onCompetitionPress,
}) => {
    const visibleCompetitions = groupVisibleCompetitions(
        getVisibleCompetitions(competitions, page, sizePerPage),
    );

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
            <View key={key}>
                <ListItem
                    itemDivider
                    style={{
                        marginLeft: 0,
                        paddingHorizontal: UNIT,
                    }}
                >
                    <Text style={{
                        fontSize: UNIT,
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
        );
    };

    if (!Object.keys(visibleCompetitions).length) {
        return (
            <View
                style={{
                    width: '100%',
                    paddingVertical: UNIT * 4,
                }}
            >
                <Text
                    style={{
                        fontSize: UNIT,
                        textAlign: 'center',
                    }}
                >
                    {Lang.print('home.nothingSearch')}
                </Text>
            </View>
        );
    }

    return (
        <View>
            {
                Object.keys(visibleCompetitions).map((key) => {
                    return renderListSection(key, visibleCompetitions);
                })
            }
        </View>
    );
};
