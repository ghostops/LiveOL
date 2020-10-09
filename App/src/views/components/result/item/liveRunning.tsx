import * as React from 'react';
import { diffDateNow } from 'util/date';
import { View } from 'native-base';
import { OLText } from 'views/components/text';

interface Props {
	date: string;
}

interface State {
	value: string;
}

export class OLResultLiveRunning extends React.PureComponent<Props, State> {
	state: State = { value: null };

	interval;

	componentDidMount() {
		this.startCounting();
	}

	componentWillUnmount() {
		this.stopCounting();
	}

	stopCounting = () => {
		if (this.interval) {
			clearInterval(this.interval);
		}
	};

	startCounting = () => {
		this.interval = setInterval(() => {
			const value = diffDateNow(this.props.date);

			this.setState({ value });
		});
	};

	render() {
		if (!this.state.value) {
			return null;
		}

		return (
			<View
				style={{
					flex: 1,
					justifyContent: 'center',
				}}
			>
				<OLText size={18} font="PTMono-Regular">
					{this.state.value}
				</OLText>
			</View>
		);
	}
}
