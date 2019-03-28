import * as React from 'react';
import * as NB from 'native-base';
import { NavigationScreenProp } from 'react-navigation';
import { OLButton } from 'views/components/button';
import { Platform, AsyncStorage, Alert, TouchableOpacity } from 'react-native';
import { StoreReview, Updates, Linking } from 'expo';
import { UNIT, VERSION, APP_VERSION, ANDROID_VERSION_CODE } from 'util/const';
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
            ? 'https://itunes.apple.com/us/app/liveol/id1450106846'
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

    purgeCache = async () => {
        const keys: string[] = await AsyncStorage.getAllKeys();
        const removeable = keys.filter((key) => !key.startsWith('OL:'));

        const promises: Promise<void>[] = [];
        for (const key of removeable) {
            promises.push(AsyncStorage.removeItem(key));
        }
        await Promise.all(promises);

        Alert.alert(`${removeable.length} ${Lang.print('info.purged')}`);
    }

    contact = () => Linking.openURL('https://goo.gl/forms/fFmS1WGVUU1Wu0c03');

    donate = () => {
        const link = 'https://www.paypal.me/larsendahl';

        Alert.alert(
            Lang.print('info.donate'),
            Lang.print('info.donateExplanation'),
            [{
                onPress: () => Linking.openURL(link),
                text: 'PayPal',
            }, {
                text: Lang.print('info.update.hasUpdate.cancel'),
                style: 'destructive',
            }],
        );
    }

    BUTTONS = [{
        text: Lang.print('info.rate'),
        onPress: this.review.prompt,
        hidden: !this.state.canReview,
    }, {
        text: Lang.print('info.update.check'),
        onPress: this.update,
    }, {
        text: Lang.print('info.appStore'),
        onPress: this.openAppStore,
    }, {
        text: Lang.print('info.contact'),
        onPress: this.contact,
    }, {
        text: Lang.print('info.purgeCache'),
        onPress: this.purgeCache,
    }];

    versionAlert = () => {
        Alert.alert(
            'VERSION',
            `App Version: ${APP_VERSION}, Package Version: ${VERSION}, ` +
            `Android Version Code: ${ANDROID_VERSION_CODE}`,
        );
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

                                <TouchableOpacity
                                    style={{ width: '100%' }}
                                    onLongPress={this.versionAlert}
                                    activeOpacity={1}
                                >
                                    <Text style={{
                                        marginBottom: UNIT,
                                        fontWeight: 'bold',
                                    }}>
                                        {Lang.print('info.version')}: {VERSION}
                                    </Text>
                                </TouchableOpacity>

                                {
                                    this.BUTTONS.map((button, index) => {
                                        if (button.hidden) return null;

                                        return (
                                            <OLButton
                                                full
                                                key={button.text + index}
                                                onPress={() => button.onPress()}
                                                style={{
                                                    marginBottom: (
                                                        index !== this.BUTTONS.length - 1
                                                        ? UNIT
                                                        : 0
                                                    ),
                                                }}
                                            >
                                                {button.text}
                                            </OLButton>
                                        );
                                    })
                                }
                            </Body>
                        </CardItem>
                    </Card>
                </Content>
            </Container>
        );
    }
}
