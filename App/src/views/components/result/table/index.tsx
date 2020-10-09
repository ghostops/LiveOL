import * as React from 'react';
import { COLORS, px } from 'util/const';
import { FlatList } from 'react-native-gesture-handler';
import { Lang } from 'lib/lang';
import { OLSafeAreaView } from 'views/components/safeArea';
import { OLTableRow } from 'views/components/result/table/row';
import { OLText } from 'views/components/text';
import { Result } from 'lib/graphql/fragments/types/Result';
import { ResultHeader } from 'views/components/result/header';
import { ScrollView } from 'react-native';
import { View, Spinner } from 'native-base';

interface Props {
	results: Result[];

	competitionId: number;
	className: string;
}

export const OLResultsTable: React.FC<Props> = (props) => {
	const renderResult = ({ item }) => {
		const result: Result = item;

		return <OLTableRow key={result.start + result.name} result={result} />;
	};

	if (!props.results) {
		return <Spinner color={COLORS.MAIN} />;
	}

	return (
		<OLSafeAreaView>
			<ScrollView horizontal>
				<FlatList
					nestedScrollEnabled
					ListHeaderComponent={
						<ResultHeader
							className={props.className}
							competitionId={props.competitionId}
							maxRowSize={px(200)}
							table
						/>
					}
					ListFooterComponent={<View style={{ height: 45 }} />}
					data={props.results}
					renderItem={renderResult}
					keyExtractor={(item: Result) => item.name}
					ListEmptyComponent={
						<View
							style={{
								paddingVertical: px(50),
							}}>
							<OLText
								font="Proxima_Nova_Bold"
								size={18}
								style={{
									textAlign: 'center',
								}}>
								{Lang.print('classes.empty')}
							</OLText>
						</View>
					}
				/>
			</ScrollView>
		</OLSafeAreaView>
	);
};
