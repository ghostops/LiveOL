import { ViewStyle, FlexAlignType, View, TouchableOpacity } from 'react-native';
import { HIT_SLOP } from '~/util/const';
import { PORTRAIT_SIZE } from '~/views/components/result/list/item';
import { OLText } from '../text';
import { OLResultColumn } from './item/column';
import {
  LANDSCAPE_WIDTH,
  getExtraSize,
} from '~/views/components/result/table/row';
import { Grid } from 'react-native-easy-grid';
import { TFunction, useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSortingStore } from '~/store/sorting';
import { OLIcon } from '../icon';
import { useTheme } from '~/hooks/useTheme';
import { useOLNavigation } from '~/hooks/useNavigation';
import { useIap } from '~/hooks/useIap';
import { TRPCQueryOutput, trpc } from '~/lib/trpc/client';

interface OwnProps {
  competitionId: number;
  className: string;
  table?: boolean;
  maxRowSize?: number;
  sorting?: boolean;
}

interface Label {
  key: string;
  text: string;
  size?: number;
  style?: ViewStyle;
  align?: FlexAlignType;
}

const labels =
  (t: TFunction) =>
  (
    table: boolean,
    maxSize: number,
    splits?: TRPCQueryOutput['getSplitControls'],
  ): Label[] => {
    const all: Record<string, Label> = {
      place: {
        key: 'place',
        size: PORTRAIT_SIZE.place,
        text: t('classes.header.place'),
        style: {
          width: table ? LANDSCAPE_WIDTH.place : 'auto',
        },
        align: 'center',
      },
      name: {
        key: 'name',
        size: PORTRAIT_SIZE.name,
        text: t('classes.header.name'),
        style: {
          width: table
            ? LANDSCAPE_WIDTH.name + getExtraSize(splits?.length)
            : 'auto',
        },
      },
      time: {
        key: 'result',
        size: PORTRAIT_SIZE.time,
        text: t('classes.header.time'),
        align: 'flex-end',
        style: {
          width: table ? LANDSCAPE_WIDTH.time : 'auto',
        },
      },
      start: {
        key: 'start',
        size: PORTRAIT_SIZE.start,
        text: t('classes.header.start'),
        style: {
          width: table ? LANDSCAPE_WIDTH.start : 'auto',
        },
      },
    };

    const inPortrait: Label[] = [all.place, all.name, all.time];

    const inLandscape: Label[] = [
      all.place,
      all.name,
      all.start,
      ...(splits || []).map(s => {
        return {
          key: `split-${s.id}`,
          text: s.name,
          style: {
            width: LANDSCAPE_WIDTH.splits,
          },
        } as Label;
      }),
      all.time,
    ];

    return table ? inLandscape : inPortrait;
  };

export const ResultHeader: React.FC<OwnProps> = ({
  table,
  className,
  competitionId,
  maxRowSize,
  sorting = true,
}) => {
  const { t } = useTranslation();
  const { left, right } = useSafeAreaInsets();
  const { fontPx, px } = useTheme();
  const { plusActive } = useIap();
  const { navigate } = useOLNavigation();

  const { setSortingDirection, setSortingKey, sortingDirection, sortingKey } =
    useSortingStore();

  const getSplitControlsQuery = trpc.getSplitControls.useQuery({
    competitionId,
    className,
  });

  const renderCol = (
    { text, size, align, style, key }: Label,
    index: number,
  ) => {
    const indexKey = `${text}:${index}`;

    return (
      <OLResultColumn
        size={size}
        key={indexKey}
        align={align || 'flex-start'}
        style={style}
      >
        <TouchableOpacity
          activeOpacity={sorting ? 0.7 : 1}
          onPress={() => {
            if (!sorting) {
              return;
            }

            if (!plusActive) {
              navigate('Plus', { feature: 'sorting' });
              setSortingKey('place');
              setSortingDirection('asc');
              return;
            }

            setSortingKey(key);
            setSortingDirection(sortingDirection === 'asc' ? 'desc' : 'asc');
          }}
          hitSlop={HIT_SLOP}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {key === sortingKey &&
            !(sortingKey === 'place' && sortingDirection === 'asc') && (
              <OLIcon
                size={fontPx(14)}
                name={
                  sortingDirection === 'asc' ? 'chevron-up' : 'chevron-down'
                }
                style={{ marginRight: px(2) }}
              />
            )}
          <OLText
            size={16}
            bold
            style={{
              color: '#444444',
            }}
            numberOfLines={1}
          >
            {text}
          </OLText>
        </TouchableOpacity>
      </OLResultColumn>
    );
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        paddingVertical: px(6),
        paddingRight: px(20) + right,
        backgroundColor: '#e3e3e3',
        borderBottomColor: '#cccccc',
        borderBottomWidth: 1,
        paddingLeft: left,
        height: px(35),
      }}
    >
      {!getSplitControlsQuery.isLoading && !getSplitControlsQuery.error && (
        <Grid>
          {labels(t)(
            !!table,
            maxRowSize || 0,
            getSplitControlsQuery.data || [],
          ).map(renderCol)}
        </Grid>
      )}
    </View>
  );
};
