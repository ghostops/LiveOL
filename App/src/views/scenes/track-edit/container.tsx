import { $api } from '~/lib/react-query/api';
import { OLEditTrackRunner as Component } from './component';
import { queryClient } from '~/lib/react-query/client';
import { useLayoutEffect, useState } from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStack } from '~/lib/nav/router';
import { useTranslation } from 'react-i18next';
import { useDeviceIdStore } from '~/store/deviceId';
import { useOLNavigation } from '~/hooks/useNavigation';

export const OLEditTrackRunner: React.FC = () => {
  const navigation = useOLNavigation();
  const { params } = useRoute<RouteProp<RootStack, 'EditTrackRunner'>>();
  const { t } = useTranslation();
  const deviceId = useDeviceIdStore(state => state.deviceId);

  useLayoutEffect(() => {
    if (params.isNew === false) {
      navigation.setOptions({ title: params.runner.runnerName });
    } else {
      navigation.setOptions({ title: t('follow.track.edit.title') });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, params.isNew]);

  const [runnerName, setRunnerName] = useState(
    params.isNew === false ? params.runner.runnerName : '',
  );

  const [runnerNameError, setRunnerNameError] = useState<string | null>(null);

  const [runnerClasses, setRunnerClasses] = useState(
    params.isNew === false ? params.runner.runnerClasses : [],
  );
  const [runnerClassesError, setRunnerClassesError] = useState<string | null>(
    null,
  );

  const [runnerClubs, setRunnerClubs] = useState(
    params.isNew === false ? params.runner.runnerClubs : [],
  );
  const [runnerClubsError, setRunnerClubsError] = useState<string | null>(null);

  const addRunnerClass = (name: string) => {
    if (runnerClasses.includes(name)) {
      return;
    }

    setRunnerClasses([...runnerClasses, name]);
  };

  const removeRunnerClass = (name: string) => {
    if (!runnerClasses.includes(name)) {
      return;
    }

    setRunnerClasses(runnerClasses.filter(c => c !== name));
  };

  const addRunnerClub = (name: string) => {
    if (runnerClubs.includes(name)) {
      return;
    }

    setRunnerClubs([...runnerClubs, name]);
  };

  const removeRunnerClub = (name: string) => {
    if (!runnerClubs.includes(name)) {
      return;
    }

    setRunnerClubs(runnerClubs.filter(c => c !== name));
  };

  const { mutateAsync: trackNewRunner, isPending: newPending } =
    $api.useMutation('post', '/v1/track/add', {
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['get', '/v1/track'] });
      },
    });

  const { mutateAsync: editTrackedRunner, isPending: editPending } =
    $api.useMutation('put', '/v1/track/{id}', {
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['get', '/v1/track'] });
      },
    });

  const isPending = editPending || newPending;

  const onSubmit = async (): Promise<void> => {
    setRunnerNameError(null);
    setRunnerClassesError(null);
    setRunnerClubsError(null);

    if (runnerName.trim() === '') {
      setRunnerNameError(t('follow.track.edit.error.nameRequired'));
      return;
    }

    if (runnerClubs.length === 0) {
      setRunnerClubsError(t('follow.track.edit.error.clubRequired'));
      return;
    }

    if (runnerClasses.length === 0) {
      setRunnerClassesError(t('follow.track.edit.error.classRequired'));
      return;
    }

    if (params.isNew) {
      const newRunner = await trackNewRunner({
        body: {
          runnerName,
          runnerClasses,
          runnerClubs,
          deviceId,
        },
      });

      navigation.replace('TrackRunner', { runner: newRunner.data.runner });
      return;
    }

    await editTrackedRunner({
      body: {
        deviceId,
        runnerClasses,
        runnerClubs,
        runnerName,
      },
      params: { path: { id: params.runner.id } },
    });

    navigation.pop();
    return;
  };

  return (
    <Component
      runnerName={runnerName}
      setRunnerName={setRunnerName}
      addRunnerClass={addRunnerClass}
      removeRunnerClass={removeRunnerClass}
      addRunnerClub={addRunnerClub}
      removeRunnerClub={removeRunnerClub}
      runnerClasses={runnerClasses}
      runnerClubs={runnerClubs}
      onSubmit={onSubmit}
      isPending={isPending}
      runnerClassesError={runnerClassesError}
      runnerClubsError={runnerClubsError}
      runnerNameError={runnerNameError}
    />
  );
};
