import * as React from 'react';
import { HomeList } from 'views/components/home/list';
import { HomeListItem } from 'views/components/home/listItem';
import { LanguagePicker } from 'views/components/lang/picker';
import { SearchBar } from 'views/components/search/bar';
import { TodaysCompetitions } from 'views/components/home/today';
import { px, COLORS } from 'util/const';
import * as NB from 'native-base';
import { Lang } from 'lib/lang';

const {
    Spinner,
    Text,
    View,
    Button,
} = NB;

interface Props {
    competitions: Comp[];
    todaysCompetitions: Comp[];
    onCompetitionPress: (competition: Comp) => void;
    openSearch: () => void;
    searching: boolean;
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
        if (!this.props.competitions) {
            return <Spinner color={COLORS.MAIN} />;
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

                <SearchBar />
            </View>
        );
    }
}
