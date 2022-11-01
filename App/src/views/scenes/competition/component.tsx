import React from 'react';
import { FlatList, View } from 'react-native';
import { OLCompetitionHeader } from 'views/components/competition/header';
import { OLListItem } from 'views/components/list/item';
import { OLLoading } from 'views/components/loading';
import { OLSafeAreaView } from 'views/components/safeArea';
import { OLText } from 'views/components/text';
import { px } from 'util/const';
import { useTranslation } from 'react-i18next';
import { OlClass, OlCompetition } from 'lib/graphql/generated/types';

interface Props {
  loading: boolean;
  competition: OlCompetition;
  classes: OlClass[] | null;
  goToLastPassings: () => void;
  goToClass: (name: string | null) => () => void;
}

export const OLCompetition: React.FC<Props> = props => {
  const { t } = useTranslation();

  const renderClass = ({ item }: any) => {
    const { name }: OlClass = item;

    return (
      <OLListItem
        key={name}
        style={{
          marginLeft: 0,
          paddingHorizontal: px(15),
        }}
        onPress={props.goToClass(name)}
      >
        <OLText font="Proxima Nova Regular" size={18}>
          {name}
        </OLText>
      </OLListItem>
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
        ListEmptyComponent={
          <OLText
            font="Proxima Nova Regular"
            size={16}
            style={{
              textAlign: 'center',
              paddingTop: px(45),
            }}
          >
            {t('competitions.noClasses')}
          </OLText>
        }
        ListHeaderComponent={
          <OLCompetitionHeader
            competition={props.competition}
            goToLastPassings={props.goToLastPassings}
          />
        }
        keyExtractor={(item: OlClass, index) => item.id || index.toString()}
        ListFooterComponent={<View style={{ height: px(45) }} />}
      />
    </OLSafeAreaView>
  );
};
