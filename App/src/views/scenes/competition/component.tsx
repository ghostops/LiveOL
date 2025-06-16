import { FlatList, View } from 'react-native';
import { OLCompetitionHeader } from '~/views/components/competition/header';
import { OLListItem } from '~/views/components/list/item';
import { OLLoading } from '~/views/components/loading';
import { OLSafeAreaView } from '~/views/components/safeArea';
import { OLText } from '~/views/components/text';
import { px } from '~/util/const';
import { useTranslation } from 'react-i18next';
import { firstIndexSize } from '~/views/components/follow/followSheet';
import { paths } from '~/lib/react-query/schema';

interface Props {
  loading: boolean;
  competition?: paths['/v1/competitions/{competitionId}']['get']['responses']['200']['content']['application/json']['data']['competition'];
  classes?: paths['/v1/competitions/{competitionId}']['get']['responses']['200']['content']['application/json']['data']['classes'];
  goToClass: (name: string | null) => () => void;
  latestPassings?: paths['/v1/competitions/{competitionId}/last-passings']['get']['responses']['200']['content']['application/json']['data']['passings'];
}

export const OLCompetition: React.FC<Props> = props => {
  const { t } = useTranslation();

  const renderClass = ({ item }: any) => {
    const {
      name,
    }: paths['/v1/competitions/{competitionId}']['get']['responses']['200']['content']['application/json']['data']['classes'][0] =
      item;

    return (
      <OLListItem
        key={name}
        style={{
          marginLeft: 0,
          paddingHorizontal: px(15),
        }}
        onPress={props.goToClass(name)}
      >
        <OLText size={18}>{name}</OLText>
      </OLListItem>
    );
  };

  if (props.loading || !props.competition) {
    return <OLLoading />;
  }

  return (
    <OLSafeAreaView>
      <FlatList
        data={props.classes}
        renderItem={renderClass}
        ListEmptyComponent={
          <OLText
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
            latestPassings={props.latestPassings}
          />
        }
        keyExtractor={(item, index) => item.id || index.toString()}
        ListFooterComponent={
          <View style={{ height: px(45) + firstIndexSize }} />
        }
      />
    </OLSafeAreaView>
  );
};
