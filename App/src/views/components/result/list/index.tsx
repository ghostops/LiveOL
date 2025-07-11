import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { px } from '~/util/const';
import { OLResultItem } from '~/views/components/result/list/item';
import { OLText } from '~/views/components/text';
import { ResultHeader } from '~/views/components/result/header';
import { useTranslation } from 'react-i18next';
import { useScrollToRunner } from '~/hooks/useScrollToRunner';
import { useOlListItemHeight } from '../item/listItem';
import { OLSafeAreaView } from '~/views/components/safeArea';
import { firstIndexSize } from '../../follow/followSheet';
import { paths } from '~/lib/react-query/schema';

interface Props {
  results: paths['/v1/results/{competitionId}/club/{clubName}']['get']['responses']['200']['content']['application/json']['data']['results'];
  competitionId: number;
  className: string;
  disabled?: boolean;
  club?: boolean;
  followedRunnerId?: string;
  loading: boolean;
}

export const OLResultsList: React.FC<Props> = props => {
  const { t } = useTranslation();
  const listRef = useScrollToRunner(props);
  const listItemHeight = useOlListItemHeight();

  const renderItem = ({ item }: any) => {
    const result: paths['/v1/results/{competitionId}/club/{clubName}']['get']['responses']['200']['content']['application/json']['data']['results'][0] =
      item;

    return (
      <OLResultItem
        key={result.start + result.name}
        result={result}
        disabled={props.disabled}
        club={props.club}
        followed={props.followedRunnerId === result.id}
      />
    );
  };

  if (!props.results) {
    return null;
  }

  return (
    <OLSafeAreaView>
      <ResultHeader
        className={props.className}
        competitionId={props.competitionId}
        sorting={!props.club}
      />
      <FlashList
        ref={listRef}
        initialScrollIndex={0}
        estimatedItemSize={listItemHeight}
        ListFooterComponent={<View style={{ height: 45 + firstIndexSize }} />}
        data={props.results}
        renderItem={renderItem}
        keyExtractor={(
          item: paths['/v1/results/{competitionId}/club/{clubName}']['get']['responses']['200']['content']['application/json']['data']['results'][0],
        ) => item.id}
        ListEmptyComponent={
          !props.loading ? (
            <View
              style={{
                paddingVertical: px(50),
              }}
            >
              <OLText
                size={18}
                style={{
                  textAlign: 'center',
                }}
              >
                {t('classes.empty')}
              </OLText>
            </View>
          ) : null
        }
        extraData={{ followed: props.followedRunnerId }}
      />
    </OLSafeAreaView>
  );
};
