import * as React from 'react';
import { FlatList, ScrollView, View } from 'react-native';
import { px } from 'util/const';
import { OLTableRow } from 'views/components/result/table/row';
import { OLText } from 'views/components/text';
import { ResultHeader } from 'views/components/result/header';
import { OlResult } from 'lib/graphql/generated/types';
import { useTranslation } from 'react-i18next';
import { useScrollToRunner } from 'hooks/useScrollToRunner';
import { useOlListItemHeight } from '../item/listItem';

interface Props {
  results: OlResult[];
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

  const renderResult = React.useCallback(
    ({ item }: any) => {
      const result: OlResult = item;

      return (
        <OLTableRow
          key={result.start + result.name}
          result={result}
          disabled={props.disabled}
          followed={props.followedRunnerId === result.id}
          club={props.club}
        />
      );
    },
    [props.club, props.disabled, props.followedRunnerId],
  );

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
        keyExtractor={(item: OlResult) => item.name}
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
