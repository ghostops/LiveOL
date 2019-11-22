import * as React from 'react';
import * as NB from 'native-base';
import { UNIT } from 'util/const';
import { ResultList } from 'views/components/result/list';
import Lang from 'lib/lang';

const {
    Container,
    View,
    Title,
} = NB;

interface Props {
    fetcher: () => Promise<Result[]>;
}

const POLL = 15000;

export class OLResults extends React.PureComponent<Props> {
    interval: number;

    renderInner = () => {
        return (
            <View>
                <View
                    style={{
                        paddingTop: 10,
                        paddingHorizontal: 10,
                    }}
                >
                    <Title style={{
                        textAlign: 'left',
                        fontSize: UNIT * 1.35,
                        paddingBottom: 10,
                        color: 'black',
                    }}>
                        {Lang.print('classes.resultsFor')}: {}
                    </Title>
                </View>

                <ResultList
                    refetchTimeout={POLL}
                    fetcher={this.props.fetcher}
                    subtitle="club"
                    onResultPress={(result) => {
                        // const { params: { id } } = this.props.navigation.state;
                        // this.props.navigation.push(Routes.club, {
                        //     id,
                        //     clubName: result.club,
                        //     title: result.club,
                        // });
                    }}
                />
            </View>
        );
    }

    render() {
        return (
            <Container>
                {this.renderInner()}
            </Container>
        );
    }
}
