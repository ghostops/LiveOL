import * as React from 'react';
import { TouchableOpacity, Easing, AppState, AppStateStatus } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { COLORS, px } from 'util/const';
import { Toast } from 'native-base';
import { Lang } from 'lib/lang';

interface Props {
	interval: number;
	promise?: () => Promise<void>;
}

interface State {
	backgroundColor: string;
	fill: string;
}

export class OLRefetcherCircle extends React.PureComponent<Props, State> {
	state: State = {
		backgroundColor: 'white',
		fill: COLORS.MAIN,
	};

	circularProgress;

	interval: NodeJS.Timeout | number;

	invert = () => {
		if (this.state.backgroundColor === 'white') {
			this.setState({
				backgroundColor: COLORS.MAIN,
				fill: 'white',
			});
		} else {
			this.setState({
				backgroundColor: 'white',
				fill: COLORS.MAIN,
			});
		}
	};

	animate = async () => {
		if (this.props.promise) {
			await this.props.promise();
		}

		setTimeout(() => {
			this.invert();
			if (this.circularProgress) {
				this.circularProgress.reAnimate(0, 100, this.props.interval, Easing.linear);
			}
		}, 100);
	};

	startAnimation = () => {
		if (this.circularProgress) {
			void this.animate();

			this.interval = setInterval(() => void this.animate(), this.props.interval + 500);
		}
	};

	stopAnimation = () => {
		if (this.circularProgress) {
			this.circularProgress.animate(0, 0, Easing.linear);
		}

		if (this.interval) {
			clearInterval(this.interval as number);
		}
	};

	componentDidMount() {
		AppState.addEventListener('change', this.appStateChange);
		this.startAnimation();
	}

	componentWillUnmount() {
		AppState.removeEventListener('change', this.appStateChange);
		this.stopAnimation();
	}

	appStateChange = (event: AppStateStatus) => {
		if (event === 'active') {
			this.startAnimation();
		} else {
			this.stopAnimation();
		}
	};

	hint = () => {
		Toast.show({
			text: Lang.print('classes.timerHint'),
		});
	};

	render() {
		return (
			<TouchableOpacity
				onPress={this.hint}
				style={{
					position: 'absolute',
					bottom: px(0),
					right: px(0),
				}}>
				<AnimatedCircularProgress
					ref={(ref) => (this.circularProgress = ref)}
					size={px(50)}
					width={px(14)}
					fill={0}
					tintColor={this.state.fill}
					backgroundColor={this.state.backgroundColor}
					padding={10}
				/>
			</TouchableOpacity>
		);
	}
}
