import * as React from 'react';
import { connect } from 'react-redux';
import { Lang } from 'lib/lang';
import { NavigationProp } from '@react-navigation/native';
import { OLButton } from 'views/components/button';
import { OLFlag } from 'views/components/lang/flag';
import { Platform, AsyncStorage, Alert, TouchableOpacity, View, Image } from 'react-native';
import { UNIT, VERSION, APP_VERSION, ANDROID_VERSION_CODE } from 'util/const';
import { Updates, Linking, ScreenOrientation } from 'expo';
import * as NB from 'native-base';

const {
    Container,
    Content,
    Card,
    CardItem,
    Text,
    Body,
} = NB;

interface OwnProps {
    navigation: NavigationProp<any, any>;
}

interface StateProps {
    landscape: boolean;
}

type Props = StateProps & OwnProps;

interface State {
    canReview: boolean;
}

const PHRASEAPP_IMAGE = require('../../../../assets/images/phraseapp.png');

class Component extends React.PureComponent<Props, State> {
    state: State = {
        canReview: false,
    };

    componentDidMount() {
        this.props.navigation.setOptions({
            title: Lang.print('info.title'),
        });
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

    contact = () => Linking.openURL('https://goo.gl/forms/fFmS1WGVUU1Wu0c03');

    BUTTONS = [{
        text: Lang.print('info.update.check'),
        onPress: this.update,
    }, {
        text: Lang.print('info.appStore'),
        onPress: this.openAppStore,
    }, {
        text: Lang.print('info.contact'),
        onPress: this.contact,
    }];

    openPhraseApp = () => Linking.openURL('https://phraseapp.com');

    versionAlert = () => {
        Alert.alert(
            'VERSION',
            `App Version: ${APP_VERSION}, Package Version: ${VERSION}, ` +
            `Android Version Code: ${ANDROID_VERSION_CODE}`,
        );
    }

    renderGeneralCard = () => (
        <Card style={{ paddingVertical: UNIT, flex: 1 }}>
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
                </Body>
            </CardItem>
        </Card>
    )

    renderActionCard = () => (
        <Card style={{ paddingVertical: UNIT, flex: 1 }}>
            <CardItem>
                <Body>
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
    )

    translationCredits = [{
        code: 'no',
        name: 'Pål Kittilsen',
    }];

    renderTranslationCredit = ({ code, name }: { code, name }, index) => (
        <View
            key={`${code}:${index}`}
            style={{
                flexDirection: 'row',
                alignItems: 'center',
            }}
        >
            <OLFlag
                code={code}
                size={32}
            />

            <Text
                style={{
                    marginLeft: 5,
                }}
            >
                {name}
            </Text>
        </View>
    )

    renderCreditCard = () => (
        <Card style={{ paddingVertical: UNIT }}>
            <CardItem>
                <Body>
                    <TouchableOpacity
                        onPress={this.openPhraseApp}
                        style={{
                            alignItems: 'center',
                            width: '100%',
                        }}
                    >
                        <Text style={{
                            marginBottom: UNIT,
                            fontWeight: 'bold',
                            textAlign: 'center',
                        }}>
                            {Lang.print('info.translations.phraseapp')}:
                        </Text>

                        <Image
                            source={PHRASEAPP_IMAGE}
                        />
                    </TouchableOpacity>

                    <View
                        style={{
                            height: 1,
                            width: '100%',
                            backgroundColor: 'black',
                            opacity: .15,
                            marginVertical: 25,
                        }}
                    />

                    <Text style={{
                        marginBottom: UNIT,
                        fontWeight: 'bold',
                    }}>
                        {Lang.print('info.translations.credit')}:
                    </Text>

                    {this.translationCredits.map(this.renderTranslationCredit)}
                </Body>
            </CardItem>
        </Card>
    )

    render() {
        return (
            <Container>
                <Content
                    style={{
                        padding: 10,
                    }}
                >
                    <View
                        style={{
                            flexDirection: (
                                this.props.landscape
                                ? 'row'
                                : 'column'
                            ),
                        }}
                    >
                        {this.renderGeneralCard()}
                        {this.renderActionCard()}
                    </View>

                    <View>
                        {this.renderCreditCard()}
                    </View>

                    <View style={{ height: 25 }} />
                </Content>
            </Container>
        );
    }
}

const mapStateToProps = (state: AppState): StateProps => ({
    landscape: state.general.rotation === ScreenOrientation.Orientation.LANDSCAPE,
});

export const OLInfo = connect(mapStateToProps, null)(Component);
