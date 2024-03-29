import { ScrollView, View } from 'react-native';
import { px } from '~/util/const';
import { OLTableRow } from '~/views/components/result/table/row';
import { OLText } from '~/views/components/text';
import { ResultHeader } from '~/views/components/result/header';
import { useTranslation } from 'react-i18next';
import { useScrollToRunner } from '~/hooks/useScrollToRunner';
import { useOlListItemHeight } from '../item/listItem';
import { TRPCQueryOutput } from '~/lib/trpc/client';
import { FlashList } from '@shopify/flash-list';
import { firstIndexSize } from '../../follow/followSheet';

interface Props {
  results: TRPCQueryOutput['getResults']['results'];
  competitionId: number;
  className: string;
  disabled?: boolean;
  followedRunnerId?: string;
  club?: boolean;
}

export const OLResultsTable: React.FC<Props> = props => {
  const { t } = useTranslation();
  const listRef = useScrollToRunner(props);
  const listItemHeight = useOlListItemHeight();

  const renderResult = ({ item }: any) => {
    const result: TRPCQueryOutput['getResults']['results'][0] = item;

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
      <View>
        <ResultHeader
          className={props.className}
          competitionId={props.competitionId}
          maxRowSize={px(200)}
          table
        />
        <FlashList
          ref={listRef}
          nestedScrollEnabled
          estimatedItemSize={listItemHeight}
          ListFooterComponent={<View style={{ height: 45 + firstIndexSize }} />}
          data={props.results}
          renderItem={renderResult}
          keyExtractor={(item: TRPCQueryOutput['getResults']['results'][0]) =>
            item.id
          }
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
      </View>
    </ScrollView>
  );
};
