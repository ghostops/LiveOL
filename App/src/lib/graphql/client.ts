import { ApolloClient, InMemoryCache } from '@apollo/client';
import { VERSION } from 'util/const';

const userId = `LiveOLApp:${VERSION}`;

export const client = new ApolloClient({
  // uri: 'https://api-liveol.larsendahl.se',
  uri: 'http://localhost:4000',
  headers: { userId },
  cache: new InMemoryCache(),
});
