import * as React from 'react';
import { COLORS, px, fontPx } from 'util/const';
import { Lang } from 'lib/lang';
import { OLLastPassingResult } from 'views/components/latest_passings/listItem';
import { OLLoading } from 'views/components/loading';
import { OLRefetcher } from 'views/components/refetcher';
import { OLSafeAreaView } from 'views/components/safeArea';
import { OLText } from 'views/components/text';
import { Passing } from 'lib/graphql/fragments/types/Passing';
import { ScrollView, RefreshControl } from 'react-native';
import { View, Title } from 'native-base';

interface Props {
	passings: Passing[];
	refresh: () => Promise<void>;
	landscape: boolean;
	loading: boolean;
}

export const OLPassings: React.FC<Props> = (props) => {
	if (props.loading && Boolean(!props.passings || !props.passings.length)) {
		return <OLLoading />;
	}

	return (
		<OLSafeAreaView>
			<ScrollView
				refreshControl={
					<RefreshControl
						onRefresh={props.refresh}
						refreshing={props.loading}
						colors={[COLORS.MAIN]}
						tintColor={COLORS.MAIN}
					/>
				}>
				<View
					style={{
						padding: px(20),
					}}>
					{!props.passings.length && (
						<OLText
							font="Proxima_Nova_Bold"
							size={16}
							style={{
								textAlign: 'center',
							}}>
							{Lang.print('competitions.passings.empty')}
						</OLText>
					)}
					{Boolean(props.passings.length) && (
						<>
							<Title
								style={{
									textAlign: 'left',
									fontSize: fontPx(20),
									marginVertical: 10,
									color: 'black',
								}}>
								{Lang.print('competitions.passings.title')}
							</Title>

							<View
								style={{
									flexDirection: props.landscape ? 'row' : 'column',
								}}>
								{props.passings.map((passing, index) => (
									<OLLastPassingResult key={index} passing={passing} landscape={props.landscape} />
								))}
							</View>
						</>
					)}
				</View>
			</ScrollView>

			<OLRefetcher refetch={props.refresh} interval={15000} />
		</OLSafeAreaView>
	);
};
