import * as React from 'react';
import { isLiveRunning } from 'util/isLive';
import { OLResultAnimation } from 'views/components/result/item/animation';
import { OLResultBadge } from 'views/components/result/item/badge';
import { OLResultClub } from 'views/components/result/item/club';
import { OLResultColumn } from 'views/components/result/item/column';
import { OLResultListItem } from '../item/listItem';
import { OLResultLiveRunning } from '../item/liveRunning';
import { OLResultName } from 'views/components/result/item/name';
import { OLResultTime } from 'views/components/result/item/time';
import { OLResultTimeplus } from 'views/components/result/item/timeplus';
import { OLSplits } from 'views/components/result/item/splits';
import { OLStartTime } from 'views/components/result/item/start';
import { px } from 'util/const';
import { Result } from 'lib/graphql/fragments/types/Result';
import { TouchableOpacity, Dimensions, View } from 'react-native';
import Toast from 'react-native-toast-message';

interface OwnProps {
	result: Result;
	disabled?: boolean;
}

type Props = OwnProps;

export const LANDSCAPE_WIDTH = {
	place: px(60),
	name: px(160),
	start: px(100),
	time: px(60),
	splits: px(90),
};

export const getExtraSize = (splits: number): number => {
	const { width } = Dimensions.get('window');

	const noSplits = [LANDSCAPE_WIDTH.place, LANDSCAPE_WIDTH.name, LANDSCAPE_WIDTH.start, LANDSCAPE_WIDTH.time].reduce(
		(a, b) => a + b,
		0,
	);

	const withSplits = noSplits + LANDSCAPE_WIDTH.splits * splits;

	let extraSize = 0;

	if (withSplits < width) {
		extraSize = width - withSplits;
	}

	return extraSize - px(20);
};

export class OLTableRow extends React.PureComponent<Props> {
	private moreInfo = () => {
		void Toast.show({
			type: 'info',
			text1: this.props.result.name,
			text2: this.props.result.club,
		});
	};

	renderTime = () => {
		const { result, disabled } = this.props;

		if (disabled) {
			return null;
		}

		if (!result.result.length) {
			if (isLiveRunning(result)) {
				return <OLResultLiveRunning date={result.liveRunningStart} />;
			}
		}

		return (
			<>
				<OLResultTime status={result.status} time={result.result} />

				<View style={{ height: px(4) }} />

				<OLResultTimeplus status={result.status} timeplus={result.timeplus} />
			</>
		);
	};

	render() {
		const { result } = this.props;

		const extraSize = getExtraSize(this.props.result.splits.length);

		return (
			<OLResultAnimation result={result}>
				<OLResultListItem>
					<OLResultColumn align="center" style={{ width: LANDSCAPE_WIDTH.place }}>
						<OLResultBadge place={result.place} />
					</OLResultColumn>

					<OLResultColumn style={{ width: LANDSCAPE_WIDTH.name + extraSize }}>
						<TouchableOpacity style={{ flex: 1 }} onPress={this.moreInfo}>
							<OLResultName name={result.name} />

							<OLResultClub club={result.club} />
						</TouchableOpacity>
					</OLResultColumn>

					<OLResultColumn style={{ width: LANDSCAPE_WIDTH.start }}>
						<OLStartTime time={result.start} />
					</OLResultColumn>

					{result.splits.map((split) => {
						return (
							<OLResultColumn style={{ width: LANDSCAPE_WIDTH.splits }} key={split.id} align="flex-start">
								<OLSplits split={split} best={split.place === 1} />
							</OLResultColumn>
						);
					})}

					<OLResultColumn align="flex-end" style={{ width: LANDSCAPE_WIDTH.time }}>
						{this.renderTime()}
					</OLResultColumn>
				</OLResultListItem>
			</OLResultAnimation>
		);
	}
}
