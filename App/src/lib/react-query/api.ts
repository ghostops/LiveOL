import createFetchClient from 'openapi-fetch';
import createClient from 'openapi-react-query';
import type { paths } from './schema';
import { Platform } from 'react-native';

const getUri = () => {
  if (__DEV__) {
    return Platform.select({
      default: 'http://localhost:3036',
      android: 'http://10.0.2.2:3036',
    });
  }

  return 'https://api-liveol.larsendahl.se';
};

const fetchClient = createFetchClient<paths>({
  baseUrl: getUri(),
});

export const $api = createClient(fetchClient);

export const $fetch = fetchClient;
