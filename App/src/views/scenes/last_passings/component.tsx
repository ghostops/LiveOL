import * as React from 'react';
import { OLLastPassingResult } from '~/views/components/latest_passings/listItem';
import { OLLoading } from '~/views/components/loading';
import { OLRefetcher } from '~/views/components/refetcher';
import { OLSafeAreaView } from '~/views/components/safeArea';
import { OLText } from '~/views/components/text';
import { px } from '~/util/const';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PassingFragment } from '~/lib/graphql/generated/types';

interface Props {
  passings: PassingFragment[];
  refresh: () => Promise<void>;
  landscape: boolean;
  loading: boolean;
}

export const OLPassings: React.FC<Props> = props => {
  const { t } = useTranslation();
  if (props.loading && Boolean(!props.passings || !props.passings.length)) {
    return <OLLoading />;
  }

  return (
    <OLSafeAreaView>
      <OLRefetcher refetch={props.refresh} interval={15000} />

      <View
        style={{
          padding: px(20),
          flex: 1,
        }}
      >
        {!props.passings.length && (
          <OLText
            size={16}
            style={{
              textAlign: 'center',
            }}
          >
            {t('competitions.passings.empty')}
          </OLText>
        )}
        {Boolean(props.passings.length) && (
          <>
            <OLText
              size={20}
              style={{
                textAlign: 'left',
                marginVertical: 10,
                color: 'black',
              }}
            >
              {t('competitions.passings.title')}
            </OLText>

            <View
              style={{
                flexDirection: props.landscape ? 'row' : 'column',
                flex: 1,
              }}
            >
              {props.passings.map((passing, index) => (
                <OLLastPassingResult
                  key={index}
                  passing={passing}
                  landscape={props.landscape}
                />
              ))}
            </View>
          </>
        )}
      </View>
    </OLSafeAreaView>
  );
};
