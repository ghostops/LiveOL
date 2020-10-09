import * as React from 'react';
import { Competition } from 'lib/graphql/fragments/types/Competition';
import { FlatList, View } from 'react-native';
import { HomeListItem } from './listItem';
import { isDateToday, dateToReadable } from 'util/date';
import { Lang } from 'lib/lang';
import { OLLoading } from '../loading';
import { OLSafeAreaView } from '../safeArea';
import { OLText } from '../text';
import { COLORS, px } from 'util/const';
import { OLListItem } from '../list/item';

interface Props {
	competitions: Competition[];
	onCompetitionPress: (comp: Competition) => void;
	listHeader: React.ReactElement;
	loadMore: () => Promise<any>;
	loading: boolean;
}

export const groupVisibleCompetitions = (visibleCompetitions: Competition[]): Record<string, Competition[]> => {
	const uniqEs6 = (arrArg) =>
		arrArg.filter((elem, pos, arr) => {
			return arr.indexOf(elem) === pos;
		}) as string[];

	const keys = uniqEs6(visibleCompetitions.map((comp) => comp.date));
	const map = {};

	for (const key of keys) {
		map[key] = [];
	}

	for (const comp of visibleCompetitions) {
		map[comp.date].push(comp);
	}

	return map;
};

export const HomeList: React.FC<Props> = ({ competitions, onCompetitionPress, listHeader, loadMore, loading }) => {
	const [moreLoading, setMoreLoading] = React.useState(false);

	const visibleCompetitions = groupVisibleCompetitions(competitions);

	const renderListItem = (competition: Competition, index: number, total: number) => (
		<HomeListItem
			key={competition.id}
			competition={competition}
			index={index}
			onCompetitionPress={onCompetitionPress}
			total={total}
		/>
	);

	const renderListSection = (date: string, competitions: Record<string, Competition[]>) => {
		const isToday = isDateToday(date);
		const dateStr = dateToReadable(date);

		return (
			<OLSafeAreaView key={date}>
				<View>
					<OLListItem
						itemDivider
						style={{
							marginLeft: 0,
							paddingHorizontal: px(16),
						}}
					>
						<OLText size={16} font="Proxima_Nova_Bold">
							{dateStr} {isToday && `(${Lang.print('home.today')})`}
						</OLText>
					</OLListItem>

					<View style={{ backgroundColor: 'white' }}>
						{competitions[date].map((comp, index) =>
							renderListItem(comp, index, competitions[date].length),
						)}
					</View>
				</View>
			</OLSafeAreaView>
		);
	};

	if (loading) {
		return <OLLoading />;
	}

	return (
		<FlatList
			ListHeaderComponent={listHeader}
			data={Object.keys(visibleCompetitions)}
			renderItem={({ item }) => renderListSection(item, visibleCompetitions)}
			keyExtractor={(item) => `${item}`}
			onEndReached={async () => {
				setMoreLoading(true);
				await loadMore();
				setMoreLoading(false);
			}}
			onEndReachedThreshold={0.1}
			ListFooterComponent={moreLoading && <OLLoading />}
			ListEmptyComponent={
				!loading && (
					<View
						style={{
							width: '100%',
							paddingVertical: px(16 * 4),
						}}
					>
						<OLText
							font="Proxima_Nova"
							size={16}
							style={{
								textAlign: 'center',
							}}
						>
							{Lang.print('home.nothingSearch')}
						</OLText>
					</View>
				)
			}
		/>
	);
};
