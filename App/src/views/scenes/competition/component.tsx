import * as React from 'react';
import { Class } from 'lib/graphql/fragments/types/Class';
import { Competition } from 'lib/graphql/fragments/types/Competition';
import { EventorCompetitionFragment } from 'lib/graphql/fragments/types/EventorCompetitionFragment';
import { px } from 'util/const';
import { Lang } from 'lib/lang';
import { ListItem, View } from 'native-base';
import { OLCompetitionHeader } from 'views/components/competition/header';
import { OLLoading } from 'views/components/loading';
import { OLSafeAreaView } from 'views/components/safeArea';
import { OLText } from 'views/components/text';
import { FlatList } from 'react-native';

interface Props {
    loading: boolean;
    competition: Competition & EventorCompetitionFragment;
    classes: Class[] | null;
    goToLastPassings: () => void;
    goToClass: (name: string) => () => void;
}

export const OLCompetition: React.SFC<Props> = (props) => {
    const renderClass = ({ item }) => {
        const { name }: Class = item;

        return (
            <ListItem
                key={name}
                style={{
                    marginLeft: 0,
                    paddingHorizontal: px(15),
                }}
                onPress={props.goToClass(name)}
            >
                <OLText
                    font="Proxima_Nova"
                    size={16}
                >
                    {name}
                </OLText>
            </ListItem>
        );
    };

    if (props.loading) {
        return <OLLoading />;
    }

    return (
        <OLSafeAreaView>
            <FlatList
                data={props.classes}
                renderItem={renderClass}
                ListEmptyComponent={(
                    <OLText
                        font="Proxima_Nova"
                        size={16}
                        style={{
                            textAlign: 'center',
                            paddingTop: px(45),
                        }}
                    >
                        {Lang.print('competitions.noClasses')}
                    </OLText>
                )}
                ListHeaderComponent={(
                    <OLCompetitionHeader
                        competition={props.competition}
                        goToLastPassings={props.goToLastPassings}
                    />
                )}
                keyExtractor={(item: Class) => item.id}
                ListFooterComponent={<View style={{ height: px(45) }} />}
            />
        </OLSafeAreaView>
    );
};
