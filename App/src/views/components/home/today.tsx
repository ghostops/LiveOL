import * as React from 'react';
import { dateToReadable } from 'util/date';
import { UNIT, COLORS } from 'util/const';
import { List, View, CardItem, Card, Body } from 'native-base';
import { Lang } from 'lib/lang';
import { OLSafeAreaView } from '../safeArea';
import { Competition } from 'lib/graphql/fragments/types/Competition';
import { OLText } from '../text';

interface Props {
	competitions: Competition[];
	renderListItem: (comp: Competition, index?: number, total?: number) => React.ReactChild;
}

export const TodaysCompetitions: React.FC<Props> = ({ competitions, renderListItem }) => {
	const nothingToday = !competitions || competitions.length === 0;

	const innerCompetitions = () => (
		<React.Fragment>
			<OLText
				font="Rift_Bold"
				size={18}
				style={{
					textAlign: 'center',
					color: 'white',
				}}
			>
				{Lang.print('home.today')}
			</OLText>

			<OLText
				font="Proxima_Nova_Bold"
				size={16}
				style={{
					textAlign: 'center',
					color: 'white',
				}}
			>
				{dateToReadable(new Date(competitions[0].date).toISOString())}
			</OLText>

			<OLSafeAreaView>
				<Card
					style={{
						marginTop: UNIT,
						width: '100%',
					}}
				>
					<CardItem>
						<Body style={{ width: '100%' }}>
							<List style={{ width: '100%' }}>
								{competitions.map((comp, index) => renderListItem(comp, index, competitions.length))}
							</List>
						</Body>
					</CardItem>
				</Card>
			</OLSafeAreaView>
		</React.Fragment>
	);

	const innerNothing = () => (
		<React.Fragment>
			<OLText
				font="Rift_Bold_Italic"
				size={18}
				style={{
					color: 'white',
					textAlign: 'center',
				}}
			>
				{Lang.print('home.nothingToday')}
			</OLText>
		</React.Fragment>
	);

	return (
		<View
			style={{
				padding: UNIT,
				backgroundColor: COLORS.MAIN,
			}}
		>
			{nothingToday ? innerNothing() : innerCompetitions()}
		</View>
	);
};
