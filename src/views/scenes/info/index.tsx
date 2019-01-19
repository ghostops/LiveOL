import * as React from 'react';
import {
    Container,
    Content,
    Card,
    CardItem,
    Text,
    Body,
    Title,
    Button,
} from 'native-base';
import { UNIT, COLORS } from '../../../util/const';
import Lang from '../../../lib/lang';
import { NavigationScreenProp } from 'react-navigation';
import { Platform, AsyncStorage } from 'react-native';
import { StoreReview } from 'expo';

interface Props {
    navigation: NavigationScreenProp<any, any>;
}

interface State {
    canReview: boolean;
}

class AppReview {
    private key: string = 'OL:APP:REVIEW';

    public canReview = (): boolean => StoreReview.isSupported() || Platform.OS === 'android';

    public hasReviewed = async (): Promise<boolean> => {
        const saved = await AsyncStorage.getItem(this.key) || null;
        return (!!saved && saved === 'true');
    }

    public prompt = async (): Promise<void> => {
        StoreReview.requestReview();
        return await AsyncStorage.setItem(this.key, 'true');
    }
}

export class OLInfo extends React.PureComponent<Props, State> {
    static navigationOptions = ({ navigation }) => ({
        title: `Info`,
        headerTitleStyle: {
            color: 'white',
        },
        headerStyle: {
            backgroundColor: COLORS.MAIN,
        },
        headerTintColor: 'white',
    })

    review: AppReview = new AppReview();

    state: State = {
        canReview: false,
    };

    async componentWillMount() {
        this.setState({ canReview: this.review.canReview() && !(await this.review.hasReviewed()) });
    }

    render() {
        return (
            <Container>
                <Content style={{ padding: 10 }}>
                    <Card style={{ paddingVertical: UNIT }}>
                        <CardItem>
                            <Body>
                                <Title
                                    style={{
                                        textAlign: 'center',
                                        width: '100%',
                                    }}
                                >
                                    {Lang.print('info.title')}
                                </Title>

                                {
                                    (Lang.print('info.body') as any)
                                    .map((text: string) => (
                                        <Text
                                            key={text}
                                            style={{
                                                marginTop: UNIT,
                                            }}
                                        >
                                            {text}
                                        </Text>
                                    ))
                                }

                                {
                                    this.state.canReview &&
                                    <Button
                                        full
                                        onPress={() => this.review.prompt()}
                                        rounded
                                        style={{
                                            marginTop: UNIT,
                                            backgroundColor: COLORS.MAIN,
                                        }}
                                    >
                                        <Text>
                                            {Lang.print('info.rate')}
                                        </Text>
                                    </Button>
                                }
                            </Body>
                        </CardItem>
                    </Card>
                </Content>
            </Container>
        );
    }
}
