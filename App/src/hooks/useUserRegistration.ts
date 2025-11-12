import { useCallback, useState } from 'react';
import { $api } from '~/lib/react-query/api';

const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff: 1s, 2s, 4s

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface RegisterUserParams {
  deviceId: string;
  language?: string;
  hasPlus?: boolean;
}

export const useUserRegistration = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { mutateAsync: registerUserMutation } = $api.useMutation(
    'post',
    '/v2/users/register',
  );

  const registerUser = useCallback(
    async (params: RegisterUserParams) => {
      setIsRegistering(true);
      setError(null);

      let lastError: Error | null = null;

      // Try up to 3 times with exponential backoff
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          __DEV__ &&
            console.log(`[User Registration] Attempt ${attempt + 1}/3`, params);

          const response = await registerUserMutation({
            body: {
              deviceId: params.deviceId,
              language: params.language,
              hasPlus: params.hasPlus,
            },
          });

          __DEV__ &&
            console.log('[User Registration] Success:', response.data);

          setIsRegistering(false);
          return response.data;
        } catch (err: any) {
          lastError = err;
          __DEV__ &&
            console.warn(
              `[User Registration] Attempt ${attempt + 1}/3 failed:`,
              err.message || err,
            );

          // If this isn't the last attempt, wait before retrying
          if (attempt < 2) {
            await wait(RETRY_DELAYS[attempt]);
          }
        }
      }

      // All attempts failed
      __DEV__ &&
        console.error(
          '[User Registration] All attempts failed:',
          lastError?.message || lastError,
        );

      setError(lastError);
      setIsRegistering(false);

      // Don't throw - fail gracefully
      return null;
    },
    [registerUserMutation],
  );

  return {
    registerUser,
    isRegistering,
    error,
  };
};
