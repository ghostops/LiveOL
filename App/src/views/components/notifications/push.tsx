import * as React from 'react';
import { Notification } from 'expo/build/Notifications/Notifications.types';
import { Notifications } from 'expo';
import { Platform } from 'react-native';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import { connect } from 'react-redux';
import { setExpoPushToken, handleNotification } from 'store/stores/general';

interface StateProps {
	setExpoPushToken: (token: string) => void;
	handleNotification: (notification: Notification) => void;
}

class Component extends React.PureComponent<StateProps> {
	notificationSubscription: any;

	registerForPushNotificationsAsync = async () => {
		if (Constants.isDevice) {
			const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
			let finalStatus = existingStatus;
			if (existingStatus !== 'granted') {
				const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
				finalStatus = status;
			}
			if (finalStatus !== 'granted') {
				alert('Failed to get push token for push notification!');
				return;
			}
			const token = await Notifications.getExpoPushTokenAsync();
			console.log(token);
			this.props.setExpoPushToken(token);
		} else {
			alert('Must use physical device for Push Notifications');
		}

		if (Platform.OS === 'android') {
			void Notifications.createChannelAndroidAsync('default', {
				name: 'default',
				sound: true,
				priority: 'max',
				vibrate: [0, 250, 250, 250],
			});
		}
	};

	handleNotification = (notification: Notification) => {
		this.props.handleNotification(notification);
	};

	componentDidMount() {
		void this.registerForPushNotificationsAsync();

		this.notificationSubscription = Notifications.addListener(this.handleNotification);
	}

	render() {
		return null;
	}
}

const mapDispatchToProps = {
	setExpoPushToken,
	handleNotification,
};

export const OLPush = connect(null, mapDispatchToProps)(Component);
