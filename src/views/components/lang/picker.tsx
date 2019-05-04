import * as React from 'react';
import { TouchableOpacity, ScrollView } from 'react-native';
import { OLFlag } from './flag';
import { UNIT, COLORS } from 'util/const';
import Lang from 'lib/lang';
import { Updates } from 'expo';

interface State {
    active: string;
}

export class LanguagePicker extends React.PureComponent<any, State> {
    state = { active: Lang.active };

    render() {
        return (
            <ScrollView
                style={{
                    width: '100%',
                    padding: UNIT / 2,
                }}
                horizontal
            >
                {
                    Lang.availible.map((lang) => (
                        <TouchableOpacity
                            onPress={async () => {
                                await Lang.set(lang);
                                this.setState({ active: lang }, Updates.reloadFromCache);
                            }}
                            style={{
                                marginRight: UNIT,
                                borderColor: (
                                    lang === this.state.active
                                    ? COLORS.MAIN
                                    : 'transparent'
                                ),
                                borderBottomWidth: 2,
                            }}
                            key={lang}
                        >
                            <OLFlag
                                code={lang}
                                size={32}
                            />
                        </TouchableOpacity>
                    ))
                }
            </ScrollView>
        );
    }
}
