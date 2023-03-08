import React from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { COLORS, px } from 'util/const';
import { OLResultItem } from 'views/components/result/list/item';
import { OLSafeAreaView } from 'views/components/safeArea';
import { OLText } from 'views/components/text';
import { ResultHeader } from 'views/components/result/header';
import { OlResult } from 'lib/graphql/generated/types';
import { useTranslation } from 'react-i18next';

interface Props {
  results: OlResult[];
  competitionId: number;
  className: string;
  disabled?: boolean;
  club?: boolean;
}

export const OLResultsList: React.FC<Props> = props => {
  const { t } = useTranslation();

  const renderResult = ({ item }: any) => {
    const result: OlResult = item;

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
    </OLSafeAreaView>
  );
};
