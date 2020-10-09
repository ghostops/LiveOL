import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { COLORS, px } from 'util/const';
import { FlatList } from 'react-native-gesture-handler';
import { Lang } from 'lib/lang';
import { OLResultItem } from 'views/components/result/list/item';
import { OLSafeAreaView } from 'views/components/safeArea';
import { OLText } from 'views/components/text';
import { Result } from 'lib/graphql/fragments/types/Result';
import { ResultHeader } from 'views/components/result/header';

interface Props {
	results: Result[];
	competitionId: number;
	className: string;
}

export const OLResultsList: React.FC<Props> = (props) => {
	const renderResult = ({ item }) => {
		const result: Result = item;

		return <OLResultItem key={result.start + result.name} result={result} />;
	};

	if (!props.results) {
		return <ActivityIndicator size="large" color={COLORS.MAIN} />;
	}

	return (
		<OLSafeAreaView>
			<FlatList
				nestedScrollEnabled
				ListHeaderComponent={<ResultHeader className={props.className} competitionId={props.competitionId} />}
				ListFooterComponent={<View style={{ height: 45 }} />}
				data={props.results}
				renderItem={renderResult}
				keyExtractor={(item: Result) => item.name}
				ListEmptyComponent={
					<View
						style={{
							paddingVertical: px(50),
						}}
					>
						<OLText
							font="Proxima_Nova_Bold"
							size={18}
							style={{
								textAlign: 'center',
							}}
						>
							{Lang.print('classes.empty')}
						</OLText>
					</View>
				}
			/>
		</OLSafeAreaView>
	);
};
