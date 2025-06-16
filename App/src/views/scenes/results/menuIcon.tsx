import React from 'react';
import { KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { COLORS, HIT_SLOP, px } from '~/util/const';
import { OLIcon } from '~/views/components/icon';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useTranslation } from 'react-i18next';
import { useIap } from '~/hooks/useIap';
import { useFollowingStore } from '~/store/following';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStack } from '~/lib/nav/router';
import { useFollowBottomSheetStore } from '~/store/followBottomSheet';
import { useResultSearchStore } from '~/store/resultSearch';
import { useState } from 'react';
import { Modal, View, TextInput, Button, Text } from 'react-native';

export const ResultMenuIcon: React.FC = () => {
  const { showActionSheetWithOptions } = useActionSheet();
  const { t } = useTranslation();
  const { plusActive, presentPaywall } = useIap();
  const followClass = useFollowingStore(state => state.follow);
  const openSheet = useFollowBottomSheetStore(state => state.open);
  const {
    params: { className, competitionId },
  } = useRoute<RouteProp<RootStack, 'Results'>>();
  const setSearchTerm = useResultSearchStore(state => state.setSearchTerm);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const onPress = () => {
    const options = [
      t('result.searchRunner.title'),
      t('follow.openFollowing'),
      t('result.followClass'),
      t('info.update.hasUpdate.cancel'),
    ];

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: options.length - 1,
      },
      selectedIndex => {
        if (typeof selectedIndex !== 'number') {
          return;
        }

        switch (selectedIndex) {
          case 2:
            if (!plusActive) {
              presentPaywall();
              break;
            }

            followClass({
              id: `${competitionId}:${className}`,
              name: className,
              type: 'class',
            });
            openSheet();

            break;

          case 1:
            if (!plusActive) {
              presentPaywall();
              break;
            }
            openSheet();
            break;
          case 0:
            setModalVisible(true);
            break;
        }
      },
    );
  };

  return (
    <>
      <TouchableOpacity
        onPress={onPress}
        style={{ marginRight: px(12) }}
        hitSlop={HIT_SLOP}
      >
        <OLIcon name="ellipsis-vertical" size={24} color="white" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 8,
              padding: 24,
              width: '80%',
              alignItems: 'stretch',
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              {t('result.searchRunner.title')}
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 4,
                padding: 8,
                marginBottom: 16,
                fontSize: 16,
              }}
              value={searchInput}
              onChangeText={setSearchInput}
              placeholder={t('result.searchRunner.text')}
              autoFocus
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <Button
                title={t('info.update.hasUpdate.cancel')}
                onPress={() => setModalVisible(false)}
                color={COLORS.DARK}
              />
              <Button
                title={t('home.search')}
                onPress={() => {
                  setSearchTerm(searchInput);
                  setModalVisible(false);
                }}
                color={COLORS.MAIN}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};
