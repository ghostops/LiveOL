import { ApolloClient, InMemoryCache } from '@apollo/client';
import { VERSION } from 'util/const';

// TODO
const userId = `LiveOLApp:${VERSION}:`; // ${DEVICE_NAME}

export const client = new ApolloClient({
  uri: 'https://api-liveol.larsendahl.se',
  headers: { userId },
  cache: new InMemoryCache(),
});
