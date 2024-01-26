import { FlatList, ScrollView, View } from 'react-native';
import { px } from '~/util/const';
import { OLTableRow } from '~/views/components/result/table/row';
import { OLText } from '~/views/components/text';
import { ResultHeader } from '~/views/components/result/header';
import { useTranslation } from 'react-i18next';
import { useScrollToRunner } from '~/hooks/useScrollToRunner';
import { useOlListItemHeight } from '../item/listItem';
import { TRPCQueryOutput } from '~/lib/trpc/client';

interface Props {
  results: TRPCQueryOutput['getResults'];
  competitionId: number;
  className: string;
  disabled?: boolean;
  followedRunnerId?: string;
  club?: boolean;
}

export const OLResultsTable: React.FC<Props> = props => {
  const { t } = useTranslation();
  const flatListRef = useScrollToRunner(props);
  const listItemHeight = useOlListItemHeight();

  const renderResult = ({ item }: any) => {
    const result: TRPCQueryOutput['getResults'][0] = item;

    return (
      <OLTableRow
        key={result.start + result.name}
        result={result}
        disabled={props.disabled}
        followed={props.followedRunnerId === result.id}
        club={props.club}
      />
    );
  };

  if (!props.results) {
    return null;
  }

  return (
    <ScrollView horizontal>
      <FlatList
        ref={flatListRef}
        nestedScrollEnabled
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
            maxRowSize={px(200)}
            table
          />
        }
        ListFooterComponent={<View style={{ height: 45 }} />}
        data={props.results}
        renderItem={renderResult}
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
    </ScrollView>
  );
};
