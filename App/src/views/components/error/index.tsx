import * as React from 'react';
import { ApolloError } from '@apollo/client';
import { OLText } from '../text';
import { ScrollView, RefreshControl } from 'react-native';
import { COLORS, px } from 'util/const';

interface Props {
  error?: ApolloError;
  refetch?: () => Promise<any>;
}

export const OLError: React.FC<Props> = ({ error, refetch }) => {
  const [loading, setLoading] = React.useState(false);

  return (
    <ScrollView
      scrollEnabled={!!refetch}
      refreshControl={
        <RefreshControl
          onRefresh={async () => {
            try {
              setLoading(true);
              await refetch();
            } finally {
              setLoading(false);
            }
          }}
          refreshing={loading}
          colors={[COLORS.MAIN]}
          tintColor={COLORS.MAIN}
        />
      }
      contentContainerStyle={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: px(20),
      }}
    >
      <OLText size={16} style={{ textAlign: 'center' }}>
        {error.message}
      </OLText>

      {!!refetch && (
        <OLText size={12} style={{ paddingTop: px(10) }}>
          Pull down to try again
        </OLText>
      )}
    </ScrollView>
  );
};
