import ApolloClient from 'apollo-boost';
import { APP_VERSION, DEVICE_NAME } from 'util/const';

const userId = `LiveOLApp:${APP_VERSION}:${DEVICE_NAME}`;

export const client = new ApolloClient({
    // uri: 'https://api-liveol.larsendahl.se',
    uri: 'https://b5c0b6c3.ngrok.io',
    headers: { userId },
});
