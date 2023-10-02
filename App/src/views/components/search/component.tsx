import React, { useCallback, useState } from 'react';
import _ from 'lodash';
import {
  Animated,
  TouchableOpacity,
  Keyboard,
  TextInput,
  View,
} from 'react-native';
import { OLText } from '../text';
import { fontPx, px } from 'util/const';
import { OLIcon } from '../icon';
import { useTranslation } from 'react-i18next';

type Props = {
  setSearchTerm: (term: string | null) => void;
  setSearching: (value: boolean) => void;
};

const SEARCH_SIZE = px(60);

export const OLSearch: React.FC<Props> = ({ setSearching, setSearchTerm }) => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');

  const search = useCallback(() => {
    setTimeout(() => {
      setSearchTerm(searchText);
    }, 0);
  }, [setSearchTerm, searchText]);

  const hideSearch = useCallback(() => {
    Keyboard.dismiss();

    _.defer(() => {
      setSearching(false);
      setSearchTerm(null);
    });
  }, [setSearchTerm, setSearching]);

  return (
    <Animated.View>
      <View
        style={{
          paddingTop: 0,
          height: SEARCH_SIZE,
          backgroundColor: '#fafafa',
          flexDirection: 'row',
          width: '100%',
          alignItems: 'center',
        }}
      >
        <TouchableOpacity
          style={{
            height: '100%',
            justifyContent: 'center',
            paddingHorizontal: px(8),
          }}
          onPress={hideSearch}
        >
          <OLIcon name="close" size={fontPx(20)} />
        </TouchableOpacity>

        <View
          style={{
            flexDirection: 'row',
            flex: 1,
            alignItems: 'center',
            backgroundColor: '#d9d9d9',
            borderRadius: 8,
          }}
        >
          <OLIcon
            name="search"
            size={fontPx(18)}
            style={{ marginLeft: px(4), color: 'black' }}
          />
          <TextInput
            placeholder={t('home.search')}
            onChangeText={setSearchText}
            onSubmitEditing={search}
            autoFocus
            style={{
              padding: 6,
              flex: 1,
              color: 'black'
            }}
            focusable
          />
        </View>

        <TouchableOpacity
          onPress={search}
          style={{
            flex: 0.25,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <OLText size={16} style={{ color: 'black' }}>
            {t('home.search')}
          </OLText>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};
