import * as React from 'react';
import * as NB from 'native-base';
import { NavigationScreenProp } from 'react-navigation';
import { OLButton } from 'views/components/button';
import { Platform, AsyncStorage, Alert } from 'react-native';
import { StoreReview, Updates, Linking } from 'expo';
import { UNIT, VERSION, DEFAULT_HEADER } from 'util/const';
import Lang from 'lib/lang';

const {
    Container,
    Content,
    Card,
    CardItem,
    Text,
    Body,
} = NB;

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
        ...DEFAULT_HEADER,
        title: Lang.print('info.title'),
    })

    review: AppReview = new AppReview();

    state: State = {
        canReview: false,
    };

    async componentWillMount() {
        // You cannot review yet
        // tslint:disable-next-line
        // this.setState({ canReview: this.review.canReview() && !(await this.review.hasReviewed()) });
    }

    openAppStore = async () => {
        Linking.openURL(
            Platform.OS === 'ios'
            ? 'https://google.com'
            : 'https://play.google.com/store/apps/details?id=se.liveol.rn',
        );
    }

    update = async () => {
        let canUpdate = false;

        if (!__DEV__) {
            const update = await Updates.checkForUpdateAsync() as any;
            canUpdate = !!update.isAvailable;
        }

        if (canUpdate) {
            Alert.alert(
                Lang.print('info.update.hasUpdate.title'),
                Lang.print('info.update.hasUpdate.text'),
                [{
                    onPress: async () => {
                        !__DEV__ && await Updates.fetchUpdateAsync();
                        Updates.reload();
                    },
                    text: Lang.print('info.update.hasUpdate.cta'),
                }, {
                    text: Lang.print('info.update.hasUpdate.cancel'),
                    style: 'cancel',
                }],
            );
        } else {
            Alert.alert(
                Lang.print('info.update.noUpdate.title'),
                Lang.print('info.update.noUpdate.text'),
            );
        }
    }

    render() {
        return (
            <Container>
                <Content style={{ padding: 10 }}>
                    <Card style={{ paddingVertical: UNIT }}>
                        <CardItem>
                            <Body>
                                {
                                    (Lang.print('info.body') as any)
                                    .map((text: string) => (
                                        <Text
                                            key={text}
                                            style={{
                                                marginBottom: UNIT,
                                            }}
                                        >
                                            {text}
                                        </Text>
                                    ))
                                }

                                {
                                    this.state.canReview &&
                                    <OLButton
                                        full
                                        onPress={() => this.review.prompt()}
                                        style={{
                                            marginBottom: UNIT,
                                        }}
                                    >
                                        {Lang.print('info.rate')}
                                    </OLButton>
                                }

                                <Text style={{
                                    marginBottom: UNIT,
                                    fontWeight: 'bold',
                                }}>
                                    {Lang.print('info.version')}: {VERSION}
                                </Text>

                                <OLButton
                                    style={{ marginBottom: UNIT }}
                                    onPress={this.update}
                                    full
                                >
                                    {Lang.print('info.update.check')}
                                </OLButton>

                                <OLButton
                                    onPress={this.openAppStore}
                                    full
                                >
                                    {Lang.print('info.appStore')}
                                </OLButton>
                            </Body>
                        </CardItem>
                    </Card>
                </Content>
            </Container>
        );
    }
}
