import * as React from 'react';
import { client } from 'lib/graphql/client';
import { connect } from 'react-redux';
import { GET_SERVER_VERSION } from 'lib/graphql/queries/server';
import { isLandscape } from 'util/landscape';
import { Lang } from 'lib/lang';
import { NavigationProp } from '@react-navigation/native';
import { OLButton } from 'views/components/button';
import { OLFlag } from 'views/components/lang/flag';
import { OLText } from 'views/components/text';
import {
    Platform,
    AsyncStorage,
    Alert,
    TouchableOpacity,
    View,
    Image,
    Linking,
} from 'react-native';
import { ServerVersion } from 'lib/graphql/queries/types/ServerVersion';
import { VERSION, px } from 'util/const';
import * as NB from 'native-base';
import * as Updates from 'expo-updates';

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
    secretTaps: number;
}

const PHRASEAPP_IMAGE = require('../../../../assets/images/phraseapp.png');

class Component extends React.PureComponent<Props, State> {
    state: State = {
        secretTaps: 0,
    };

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
                        if (!__DEV__) {
                            await Updates.fetchUpdateAsync();
                            await Updates.reloadAsync();
                        }
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

    expoManifest = () => Alert.alert('Expo Manifest', JSON.stringify(Updates.manifest));

    contact = () => Linking.openURL('https://liveol.larsendahl.se/contact.html');

    BUTTONS = [{
        text: Lang.print('info.update.check'),
        onPress: this.update,
        onLongPress: this.expoManifest,
    }, {
        text: Lang.print('info.contact'),
        onPress: this.contact,
    }];

    openPhraseApp = () => Linking.openURL('https://phraseapp.com');

    versionAlert = async () => {
        const { data } = await client.query<ServerVersion>({
            query: GET_SERVER_VERSION,
        });

        // tslint:disable: prefer-template
        Alert.alert(
            'VERSION',
            `Package Version: ${VERSION}\n` +
            `Server Version: ${data.server.version}\n`,
        );
        // tslint:enable: prefer-template
    }

    renderGeneralCard = () => (
        <Card style={{ paddingVertical: px(16), flex: 1 }}>
            <CardItem>
                <Body>
                    {
                        (Lang.print('info.body') as any)
                        .map((text: string) => (
                            <Text
                                key={text}
                                style={{
                                    marginBottom: px(16),
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
        <Card style={{ paddingVertical: px(16), flex: 1 }}>
            <CardItem>
                <Body>
                    <TouchableOpacity
                        style={{ width: '100%' }}
                        onPress={this.secretTap}
                        activeOpacity={1}
                    >
                        <Text style={{
                            marginBottom: px(16),
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
                                    onPress={() => button.onPress && button.onPress()}
                                    onLongPress={() => button.onLongPress && button.onLongPress()}
                                    style={{
                                        marginBottom: (
                                            index !== this.BUTTONS.length - 1
                                            ? px(16)
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

            <OLText
                font="Proxima_Nova"
                size={16}
                style={{
                    marginLeft: px(5),
                }}
            >
                {name}
            </OLText>
        </View>
    )

    renderCreditCard = () => (
        <Card style={{ paddingVertical: px(16) }}>
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
                            marginBottom: px(16),
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

                    <OLText
                        font="Proxima_Nova_Bold"
                        size={18}
                    >
                        {Lang.print('info.translations.credit')}:
                    </OLText>

                    {this.translationCredits.map(this.renderTranslationCredit)}
                </Body>
            </CardItem>
        </Card>
    )

    secretTap = () => {
        this.setState(
            { secretTaps: this.state.secretTaps + 1 },
            () => {
                if (this.state.secretTaps > 5) {
                    this.setState({ secretTaps: 0 });

                    this.versionAlert();
                }
            },
        );
    }

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
    landscape: isLandscape(state.general.rotation),
});

export const OLInfo = connect(mapStateToProps, null)(Component);
