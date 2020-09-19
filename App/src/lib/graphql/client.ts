import ApolloClient from 'apollo-boost';
import { APP_VERSION, DEVICE_NAME } from 'util/const';

const userId = `LiveOLApp:${APP_VERSION}:${DEVICE_NAME}`;

export const client = new ApolloClient({
    uri: 'https://bcd9fc8c5c2a.ngrok.io',
    headers: { userId },
});
