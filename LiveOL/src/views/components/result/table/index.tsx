import * as React from 'react';
import { ActivityIndicator, FlatList, ScrollView, View } from 'react-native';
import { COLORS, px } from 'util/const';
import { Lang } from 'lib/lang';
import { OLSafeAreaView } from 'views/components/safeArea';
import { OLTableRow } from 'views/components/result/table/row';
import { OLText } from 'views/components/text';
import { ResultHeader } from 'views/components/result/header';
import { OlResult } from 'lib/graphql/generated/types';

interface Props {
  results: OlResult[];
  competitionId: number;
  className: string;
  disabled?: boolean;
}

export const OLResultsTable: React.FC<Props> = props => {
  const renderResult = ({ item }: any) => {
    const result: OlResult = item;

    return (
      <OLTableRow
        key={result.start + result.name}
        result={result}
        disabled={props.disabled}
      />
    );
  };

  if (!props.results) {
    return <ActivityIndicator size="large" color={COLORS.MAIN} />;
  }

  return (
    <OLSafeAreaView>
      <ScrollView horizontal>
        <FlatList
          nestedScrollEnabled
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
              }}>
              <OLText
                font="Proxima-Nova-Bold regular"
                size={18}
                style={{
                  textAlign: 'center',
                }}>
                {Lang.print('classes.empty')}
              </OLText>
            </View>
          }
        />
      </ScrollView>
    </OLSafeAreaView>
  );
};
