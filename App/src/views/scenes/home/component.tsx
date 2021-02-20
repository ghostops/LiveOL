import * as React from 'react';
import { Competition } from 'lib/graphql/fragments/types/Competition';
import { HomeList } from 'views/components/home/list';
import { HomeListItem } from 'views/components/home/listItem';
import { Lang } from 'lib/lang';
import { LanguagePicker } from 'views/components/lang/picker';
import { OLSearch } from 'views/components/search/container';
import { OLText } from 'views/components/text';
import { px } from 'util/const';
import { TodaysCompetitions } from 'views/components/home/today';
import { View, TouchableOpacity } from 'react-native';
import { OLButton } from 'views/components/button';

interface Props {
	competitions: Competition[];
	todaysCompetitions: Competition[];
	onCompetitionPress: (competition: Competition) => void;
	openSearch: () => void;
	searching: boolean;
	loading: boolean;
	loadMore: () => Promise<any>;
	refetch: () => Promise<void>;
}

export class OLHome extends React.PureComponent<Props> {
	renderTodaysCompetitions = () => {
		if (this.props.searching) {
			return null;
		}

		return (
			<TodaysCompetitions
				competitions={this.props.todaysCompetitions}
				renderListItem={(competition, index, total) => (
					<HomeListItem
						competition={competition}
						index={index}
						key={competition.id}
						onCompetitionPress={this.props.onCompetitionPress}
						total={total}
					/>
				)}
			/>
		);
	};

	renderHeader = () => {
		return (
			<View
				style={{
					flexDirection: 'row',
					height: px(50),
				}}
			>
				<LanguagePicker />

				<View
					style={{
						height: '100%',
						justifyContent: 'center',
						alignItems: 'center',
						paddingRight: px(10),
						flexDirection: 'row',
					}}
				>
					<TouchableOpacity onPress={this.props.openSearch}>
						<OLText font="Proxima_Nova" size={16}>
							{Lang.print('home.search')}
						</OLText>
					</TouchableOpacity>
				</View>
			</View>
		);
	};

	render() {
		return (
			<View
				style={{
					flex: 1,
					width: '100%',
				}}
			>
				<View style={{ flex: 1 }}>
					{this.renderHeader()}

					<HomeList
						loading={this.props.loading}
						competitions={this.props.competitions}
						onCompetitionPress={this.props.onCompetitionPress}
						listHeader={this.renderTodaysCompetitions()}
						loadMore={this.props.loadMore}
						refetch={this.props.refetch}
					/>
				</View>

				<OLSearch />
			</View>
		);
	}
}
