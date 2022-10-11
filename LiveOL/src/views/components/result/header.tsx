import React from 'react';
import _ from 'lodash';
import { ViewStyle, FlexAlignType, View } from 'react-native';
import { px } from 'util/const';
import { PORTRAIT_SIZE } from 'views/components/result/list/item';
import { OLText } from '../text';
import { OLResultColumn } from './item/column';
import {
  LANDSCAPE_WIDTH,
  getExtraSize,
} from 'views/components/result/table/row';
import { Grid } from 'react-native-easy-grid';
import { TFunction, useTranslation } from 'react-i18next';
import { OlSplit } from 'lib/graphql/generated/types';
import { useGetSplitControlsQuery } from 'lib/graphql/generated/gql';

interface OwnProps {
  competitionId: number;
  className: string;
  table?: boolean;
  maxRowSize?: number;
}

interface Label {
  text: string;
  size?: number;
  style?: ViewStyle;
  align?: FlexAlignType;
}

const labels =
  (t: TFunction) =>
  (table: boolean, maxSize: number, splits?: OlSplit[]): Label[] => {
    const all: Record<string, Label> = {
      place: {
        size: PORTRAIT_SIZE.place,
        text: t('classes.header.place'),
        style: {
          width: table ? LANDSCAPE_WIDTH.place : 'auto',
        },
        align: 'center',
      },
      name: {
        size: PORTRAIT_SIZE.name,
        text: t('classes.header.name'),
        style: {
          width: table
            ? LANDSCAPE_WIDTH.name + getExtraSize(splits.length)
            : 'auto',
        },
      },
      time: {
        size: PORTRAIT_SIZE.time,
        text: t('classes.header.time'),
        align: 'flex-end',
        style: {
          width: table ? LANDSCAPE_WIDTH.time : 'auto',
        },
      },
      start: {
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
      ...splits.map(
        s =>
          ({
            text: s.name,
            style: {
              width: LANDSCAPE_WIDTH.splits,
            },
          } as Label),
      ),
      all.time,
    ];

    return table ? inLandscape : inPortrait;
  };

export const ResultHeader: React.FC<OwnProps> = ({
  table,
  className,
  competitionId,
  maxRowSize,
}) => {
  const { t } = useTranslation();

  const { data, loading, error } = useGetSplitControlsQuery({
    variables: { competitionId, className },
  });

  const splits: OlSplit[] = _.get(data, 'results.getSplitControls', []);

  const renderCol = ({ text, size, align, style }: Label, index: number) => {
    const key = `${text}:${index}`;

    return (
      <OLResultColumn
        size={size}
        key={key}
        align={align || 'flex-start'}
        style={style}>
        <OLText
          font="Rift Bold"
          size={18}
          style={{
            color: '#444444',
          }}
          numberOfLines={1}>
          {text}
        </OLText>
      </OLResultColumn>
    );
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        paddingVertical: px(20),
        paddingRight: px(20),
        backgroundColor: '#e3e3e3',
        borderBottomColor: '#cccccc',
        borderBottomWidth: 1,
      }}>
      {!loading && !error && (
        <Grid>{labels(t)(table, maxRowSize || 0, splits).map(renderCol)}</Grid>
      )}
    </View>
  );
};
