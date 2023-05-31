import { ApolloClient, InMemoryCache } from '@apollo/client';
import { Platform } from 'react-native';
import { VERSION } from 'util/const';

const userId = `LiveOLApp:${VERSION}`;

const getUri = () => {
  if (__DEV__) {
    return Platform.select({
      ios: 'http://localhost:4000',
      android: 'http://10.0.2.2:4000',
    });
  }

  return 'https://api-liveol.larsendahl.se';
};

export const client = new ApolloClient({
  uri: getUri(),
  headers: { userId },
  cache: new InMemoryCache(),
});
