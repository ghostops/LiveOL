import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type {
  AppRouter,
  RouterInput,
  RouterOutput,
} from '../../../../Server/src/trpc';
import { Platform } from 'react-native';
import { createTRPCReact } from '@trpc/react-query';
import { VERSION } from '~/util/const';

const userId = `LiveOLApp:${VERSION}`;

const getUri = () => {
  if (__DEV__) {
    return Platform.select({
      default: 'http://localhost:3000',
      android: 'http://10.0.2.2:3000',
    });
  }

  return 'https://trpc-liveol.larsendahl.se';
};

export const trpc = createTRPCReact<AppRouter>();

const httpLink = httpBatchLink({
  url: getUri(),
  async headers() {
    return {
      userId,
    };
  },
});

export const trpcClient = trpc.createClient({
  links: [httpLink],
});

export const plainTrpc = createTRPCClient<AppRouter>({
  links: [httpLink],
});

export type TRPCQueryOutput = RouterOutput;
export type TRPCQueryInput = RouterInput;
