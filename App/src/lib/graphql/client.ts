import ApolloClient from 'apollo-boost';
import { APP_VERSION, DEVICE_NAME } from 'util/const';

const userId = `LiveOLApp:${APP_VERSION}:${DEVICE_NAME}`;

export const client = new ApolloClient({
    uri: 'https://2b56825e.ngrok.io',
    // uri: 'https://api.liveol.larsendahl.se',
    headers: { userId },
});
