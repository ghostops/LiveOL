import * as React from 'react';
import { px, fontPx } from 'util/const';
import _ from 'lodash';
import * as NB from 'native-base';
import { Lang } from 'lib/lang';
import { HomeListItem } from './listItem';
import { isDateToday, dateToReadable } from 'util/date';
import { FlatList } from 'react-native';
import { OLSafeAreaView } from '../safeArea';
import { Competition } from 'lib/graphql/fragments/types/Competition';
import { OLLoading } from '../loading';

const {
    List,
    ListItem,
    Text,
    View,
} = NB;

interface Props {
    competitions: Competition[];
    onCompetitionPress: (comp: Competition) => void;
    listHeader: React.ReactElement;
    loadMore: () => void;
    loading: boolean;
}

export const groupVisibleCompetitions = (
    visibleCompetitions: Competition[],
): Record<string, Competition[]> => {
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

export const HomeList: React.FC<Props> = ({
    competitions,
    onCompetitionPress,
    listHeader,
    loadMore,
    loading,
}) => {
    const [moreLoading, setMoreLoading] = React.useState(false);

    const visibleCompetitions = groupVisibleCompetitions(competitions);

    const renderListItem = (competition: Competition, index: number, total: number) => (
        <HomeListItem
            key={competition.id}
            competition={competition}
            index={index}
            onCompetitionPress={onCompetitionPress}
            total={total}
        />
    );

    const renderListSection = (date: string, competitions: Record<string, Competition[]>) => {
        const isToday = isDateToday(date);
        const dateStr = dateToReadable(date);

        return (
            <OLSafeAreaView key={date}>
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
                            {dateStr} {isToday && `(${Lang.print('home.today')})`}
                        </Text>
                    </ListItem>

                    <List>
                        {competitions[date].map((comp, index) => (
                            renderListItem(comp, index, competitions[date].length)
                        ))}
                    </List>
                </View>
            </OLSafeAreaView>
        );
    };

    if (loading) {
        return <OLLoading />;
    }

    return (
        <FlatList
            ListHeaderComponent={listHeader}
            data={Object.keys(visibleCompetitions)}
            renderItem={({ item }) => renderListSection(item, visibleCompetitions)}
            keyExtractor={(item) => `${item}`}
            onEndReached={async () => {
                setMoreLoading(true);
                await loadMore();
                setMoreLoading(false);
            }}
            onEndReachedThreshold={0.1}
            ListFooterComponent={(
                moreLoading &&
                <OLLoading />
            )}
            ListEmptyComponent={(
                !loading &&
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
            )}
        />
    );
};
