import * as React from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { COLORS, px } from 'util/const';
import { Lang } from 'lib/lang';
import { OLResultItem } from 'views/components/result/list/item';
import { OLSafeAreaView } from 'views/components/safeArea';
import { OLText } from 'views/components/text';
import { Result } from 'lib/graphql/fragments/types/Result';
import { ResultHeader } from 'views/components/result/header';

interface Props {
  results: Result[];
  competitionId: number;
  className: string;
  disabled?: boolean;
  club?: boolean;
}

export const OLResultsList: React.FC<Props> = props => {
  const renderResult = ({ item }: any) => {
    const result: Result = item;

    return (
      <OLResultItem
        key={result.start + result.name}
        result={result}
        disabled={props.disabled}
        club={props.club}
      />
    );
  };

  if (!props.results) {
    return <ActivityIndicator size="large" color={COLORS.MAIN} />;
  }

  return (
    <OLSafeAreaView>
      <FlatList
        nestedScrollEnabled
        ListHeaderComponent={
          <ResultHeader
            className={props.className}
            competitionId={props.competitionId}
          />
        }
        ListFooterComponent={<View style={{ height: 45 }} />}
        data={props.results}
        renderItem={renderResult}
        keyExtractor={(item: Result) => item.name}
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
    </OLSafeAreaView>
  );
};
