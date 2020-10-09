import * as React from 'react';
import { SafeAreaConsumer } from 'react-native-safe-area-context';
import { View } from 'native-base';

export class OLSafeAreaView extends React.PureComponent {
	render() {
		return (
			<SafeAreaConsumer>
				{(insets) => {
					return (
						<View
							style={{
								paddingLeft: insets.left,
								paddingRight: insets.right,
								flex: 1,
							}}>
							{this.props.children}
						</View>
					);
				}}
			</SafeAreaConsumer>
		);
	}
}
