import * as React from 'react';
import { COLORS, px } from 'util/const';
import { connect } from 'react-redux';
import { ListItem, View, Text, Badge } from 'native-base';
import { OLResultAnimation } from 'views/components/result/item/animation';
import { OLResultBadge } from 'views/components/result/item/badge';
import { OLResultClub } from 'views/components/result/item/club';
import { OLResultColumn } from 'views/components/result/item/column';
import { OLResultName } from 'views/components/result/item/name';
import { OLResultTime } from 'views/components/result/item/time';
import { OLResultTimeplus } from 'views/components/result/item/timeplus';
import { OLSplits } from 'views/components/result/item/splits';
import { OLStartTime } from 'views/components/result/item/start';
import { Result } from 'lib/graphql/fragments/types/Result';
import { showToast } from 'lib/toasts/competitiorInfo';
import { TouchableOpacity } from 'react-native';
import { OLResultListItem } from '../item/listItem';
import { OLResultLiveRunning } from '../item/liveRunning';
import { isLiveRunning, startIsAfterNow } from 'util/isLive';

interface OwnProps {
	result: Result;
}

type Props = OwnProps;

export const PORTRAIT_SIZE = {
	place: 15,
	name: 50,
	start: 0,
	time: 35,
};

export class OLResultItem extends React.PureComponent<Props> {
	renderTime = () => {
		const { result } = this.props;

		if (!result.result.length) {
			if (isLiveRunning(result)) {
				return <OLResultLiveRunning date={result.liveRunningStart} />;
			}

			if (!startIsAfterNow(result)) {
				return <OLStartTime time={result.start} />;
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

		const moreInfo = () => {
			showToast(result.name, result.club);
		};

		return (
			<OLResultAnimation result={result}>
				<OLResultListItem>
					<OLResultColumn size={PORTRAIT_SIZE.place} align="center">
						<OLResultBadge place={result.place} />
					</OLResultColumn>

					<OLResultColumn size={PORTRAIT_SIZE.name}>
						<TouchableOpacity style={{ flex: 1 }} onPress={moreInfo}>
							<OLResultName name={result.name} />

							<OLResultClub club={result.club} />
						</TouchableOpacity>
					</OLResultColumn>

					<OLResultColumn align="flex-end" size={PORTRAIT_SIZE.time}>
						{this.renderTime()}
					</OLResultColumn>
				</OLResultListItem>
			</OLResultAnimation>
		);
	}
}
