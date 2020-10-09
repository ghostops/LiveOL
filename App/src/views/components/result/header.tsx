import * as React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { GET_SPLIT_CONTROLS } from 'lib/graphql/queries/results';
import { GetSplitControls, GetSplitControlsVariables } from 'lib/graphql/queries/types/GetSplitControls';
import { Grid } from 'react-native-easy-grid';
import { LANDSCAPE_WIDTH, getExtraSize } from 'views/components/result/table/row';
import { Lang } from 'lib/lang';
import { OLResultColumn } from './item/column';
import { OLText } from '../text';
import { PORTRAIT_SIZE } from 'views/components/result/list/item';
import { px } from 'util/const';
import { Split } from 'lib/graphql/fragments/types/Split';
import { useQuery } from '@apollo/react-hooks';
import { ViewStyle, FlexAlignType, View } from 'react-native';

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

const labels = (table: boolean, maxSize: number, splits?: Split[]): Label[] => {
	const all: Record<string, Label> = {
		place: {
			size: PORTRAIT_SIZE.place,
			text: Lang.print('classes.header.place'),
			style: {
				width: table ? LANDSCAPE_WIDTH.place : 'auto',
			},
			align: 'center',
		},
		name: {
			size: PORTRAIT_SIZE.name,
			text: Lang.print('classes.header.name'),
			style: {
				width: table ? LANDSCAPE_WIDTH.name + getExtraSize(splits.length) : 'auto',
			},
		},
		time: {
			size: PORTRAIT_SIZE.time,
			text: Lang.print('classes.header.time'),
			align: 'flex-end',
			style: {
				width: table ? LANDSCAPE_WIDTH.time : 'auto',
			},
		},
		start: {
			size: PORTRAIT_SIZE.start,
			text: Lang.print('classes.header.start'),
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
			(s) =>
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

const Component: React.FC<OwnProps> = ({ table, className, competitionId, maxRowSize }) => {
	const { data, loading, error } = useQuery<GetSplitControls, GetSplitControlsVariables>(GET_SPLIT_CONTROLS, {
		variables: { competitionId, className },
	});

	const splits: Split[] = _.get(data, 'results.getSplitControls', []);

	const renderCol = ({ text, size, align, style }: Label, index: number) => {
		const key = `${text}:${index}`;

		return (
			<OLResultColumn size={size} key={key} align={align || 'flex-start'} style={style}>
				<OLText
					font="Rift_Bold"
					size={18}
					style={{
						color: '#444444',
					}}
					numberOfLines={1}
				>
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
			}}
		>
			{!loading && !error && <Grid>{labels(table, maxRowSize || 0, splits).map(renderCol)}</Grid>}
		</View>
	);
};

export const ResultHeader = (connect(null, null)(Component) as unknown) as React.ComponentClass<OwnProps>;
