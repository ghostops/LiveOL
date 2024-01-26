import { useEffect } from 'react';
import { FlatList, View } from 'react-native';
import { px } from '~/util/const';
import { OLResultItem } from '~/views/components/result/list/item';
import { OLText } from '~/views/components/text';
import { ResultHeader } from '~/views/components/result/header';
import { useTranslation } from 'react-i18next';
import { useScrollToRunner } from '~/hooks/useScrollToRunner';
import { useOlListItemHeight } from '../item/listItem';
import { OLSafeAreaView } from '~/views/components/safeArea';
import { TRPCQueryOutput } from '~/lib/trpc/client';

interface Props {
  results: TRPCQueryOutput['getResults'];
  competitionId: number;
  className: string;
  disabled?: boolean;
  club?: boolean;
  followedRunnerId?: string;
}

export const OLResultsList: React.FC<Props> = props => {
  const { t } = useTranslation();
  const flatListRef = useScrollToRunner(props);
  const listItemHeight = useOlListItemHeight();

  // Force update the list to prevent not rendering items
  useEffect(() => {
    if (!flatListRef) {
      return;
    }

    const timeout = setTimeout(() => {
      flatListRef?.current?.forceUpdate();
    }, 2000);

    return () => clearTimeout(timeout);
  }, [flatListRef]);

  const renderItem = ({ item }: any) => {
    const result: TRPCQueryOutput['getResults'][0] = item;

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
      <FlatList
        ref={flatListRef}
        getItemLayout={(_data, index) => ({
          index,
          length: listItemHeight,
          offset: index * listItemHeight,
        })}
        stickyHeaderIndices={[0]}
        ListHeaderComponent={
          <ResultHeader
            className={props.className}
            competitionId={props.competitionId}
            sorting={!props.club}
          />
        }
        ListFooterComponent={<View style={{ height: 45 }} />}
        data={props.results}
        renderItem={renderItem}
        keyExtractor={(item: TRPCQueryOutput['getResults'][0]) => item.id}
        ListEmptyComponent={
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
        }
      />
    </OLSafeAreaView>
  );
};
