import * as React from 'react';
import { Competition } from 'lib/graphql/fragments/types/Competition';
import { HomeList } from 'views/components/home/list';
import { HomeListItem } from 'views/components/home/listItem';
import { Lang } from 'lib/lang';
import { LanguagePicker } from 'views/components/lang/picker';
import { OLLoading } from 'views/components/loading';
import { OLSearch } from 'views/components/search/container';
import { px, COLORS } from 'util/const';
import { TodaysCompetitions } from 'views/components/home/today';
import * as NB from 'native-base';

const {
    Spinner,
    Text,
    View,
    Button,
} = NB;

interface Props {
    competitions: Competition[];
    todaysCompetitions: Competition[];
    onCompetitionPress: (competition: Competition) => void;
    openSearch: () => void;
    searching: boolean;
    loading: boolean;
}

export class OLHome extends React.PureComponent<Props> {
    renderTodaysCompetitions = () => {
        if (this.props.searching) {
            return null;
        }

        return (
            <TodaysCompetitions
                competitions={this.props.todaysCompetitions}
                renderListItem={(competition, index, total) => (
                    <HomeListItem
                        competition={competition}
                        index={index}
                        key={competition.id}
                        onCompetitionPress={this.props.onCompetitionPress}
                        total={total}
                    />
                )}
            />
        );
    }

    renderInner = () => {
        if (this.props.loading) {
            return <OLLoading />;
        }

        return (
            <HomeList
                competitions={this.props.competitions}
                onCompetitionPress={this.props.onCompetitionPress}
                listHeader={this.renderTodaysCompetitions()}
            />
        );
    }

    renderHeader = () => {
        return (
            <View
                style={{
                    flexDirection: 'row',
                    height: px(50),
                }}
            >
                <LanguagePicker />

                <View
                    style={{
                        height: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingRight: px(10),
                        flexDirection: 'row',
                    }}
                >
                    <Button
                        transparent
                        onPress={this.props.openSearch}
                    >
                        <Text>
                            {Lang.print('home.search')}
                        </Text>
                    </Button>
                </View>
            </View>
        );
    }

    render() {
        return (
            <View style={{
                flex: 1,
                width: '100%',
            }}>
                <View style={{ flex: 1 }}>
                    {this.renderHeader()}

                    {this.renderInner()}
                </View>

                <OLSearch />
            </View>
        );
    }
}
