import ApolloClient from 'apollo-boost';
import { VERSION, DEVICE_NAME } from 'util/const';

const userId = `LiveOLApp:${VERSION}:${DEVICE_NAME}`;

export const client = new ApolloClient({
	uri: 'https://api-liveol.larsendahl.se',
	headers: { userId },
});
