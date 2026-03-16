import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { useOLNavigation } from '~/hooks/useNavigation';
import { useTheme } from '~/hooks/useTheme';
import { $api } from '~/lib/react-query/api';
import { COLORS } from '~/util/const';
import { OLText } from '~/views/components/text';
import { useState } from 'react';
import { FlatList } from 'react-native';
import { HomeRowItem } from '../home';
import DateTimePicker, {
  DateType,
  useDefaultStyles,
} from 'react-native-ui-datepicker';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MIN_SEARCH_LENGTH = 2;

export const OLSceneSearch = () => {
  const { colors, px } = useTheme();
  const { navigate, goBack } = useOLNavigation();
  const { t } = useTranslation();
  const { bottom } = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);

  // Only fetch if we have a search query or date filters
  const shouldFetch =
    debouncedSearchQuery.trim().length >= MIN_SEARCH_LENGTH ||
    startDate !== undefined ||
    endDate !== undefined;

  const searchResults = $api.useQuery(
    'get',
    '/v2/competitions/search',
    {
      params: {
        query: {
          q: debouncedSearchQuery.trim() || undefined,
          startDate: startDate,
          endDate: endDate,
        },
      },
    },
    {
      enabled: shouldFetch,
    },
  );

  const competitions = searchResults.data?.data.competitions || [];

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.BACKGROUND }}>
      <View
        style={[
          style.header,
          {
            paddingHorizontal: px(16),
            paddingBottom: px(12),
          },
        ]}
      >
        <View style={style.searchRow}>
          <TextInput
            style={[
              style.searchInput,
              {
                flex: 1,
                paddingHorizontal: px(12),
                paddingVertical: px(8),
              },
            ]}
            placeholder={t('Search competitions or organizers...')}
            placeholderTextColor={COLORS.GRAY}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
          />
        </View>

        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          style={[
            {
              marginTop: px(8),
            },
            style.filterButton,
          ]}
        >
          <OLText size={14} style={{ color: COLORS.WHITE }}>
            📅 {t('Filter by date')}
            {showFilters ? ' ▼' : ' ▶'}
          </OLText>
        </TouchableOpacity>

        {showFilters && (
          <DatePicker
            onChange={(sD, eD) => {
              sD && setStartDate(format(sD, 'yyyy-MM-dd'));
              eD && setEndDate(format(eD, 'yyyy-MM-dd'));
            }}
          />
        )}
      </View>

      {/* Results */}
      <View style={{ flex: 1 }}>
        {!shouldFetch ? (
          <View style={style.emptyState}>
            <OLText size={16}>
              {t('Enter at least {{ count }} characters to search', {
                count: MIN_SEARCH_LENGTH,
              })}
            </OLText>
          </View>
        ) : searchResults.isLoading ? (
          <View style={style.emptyState}>
            <ActivityIndicator size="large" color={colors.MAIN} />
          </View>
        ) : (
          <FlatList
            data={competitions}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <HomeRowItem
                item={item}
                onPress={() => {
                  goBack();
                  // Small delay to ensure modal is closed before navigating
                  setTimeout(() => {
                    navigate('Competition', {
                      olCompetitionId: item.olCompetitionId,
                    });
                  }, 100);
                }}
                showDate
                showOrganizationName
              />
            )}
            ItemSeparatorComponent={ItemSeparator}
            ListEmptyComponent={
              searchResults.isLoading ? null : (
                <View style={style.emptyState}>
                  <OLText size={16}>{t('No competitions found')}</OLText>
                </View>
              )
            }
          />
        )}
      </View>

      {/* Results count */}
      {shouldFetch && !searchResults.isLoading && competitions.length > 0 && (
        <View
          style={{
            padding: px(8),
            backgroundColor: COLORS.BACKGROUND,
            alignItems: 'center',
            paddingBottom: bottom,
          }}
        >
          <OLText size={12}>
            {competitions.length} result{competitions.length !== 1 ? 's' : ''}{' '}
            {competitions.length === 100 ? '(max limit)' : ''}
          </OLText>
        </View>
      )}
    </View>
  );
};

function ItemSeparator() {
  return <View style={{ height: 1, backgroundColor: COLORS.BORDER }} />;
}

function DatePicker({
  onChange,
}: {
  onChange: (startDate: Date, endDate: Date) => void;
}) {
  const defaultStyles = useDefaultStyles();
  const colorScheme = useColorScheme();
  const [startDate, setStartDate] = useState<DateType>(new Date());
  const [endDate, setEndDate] = useState<DateType>(new Date());

  return (
    <DateTimePicker
      mode="range"
      startDate={startDate}
      endDate={endDate}
      onChange={event => {
        setStartDate(event.startDate);
        setEndDate(event.endDate);
        if (event.startDate && event.endDate) {
          onChange(event.startDate as Date, event.endDate as Date);
        }
      }}
      styles={{
        ...defaultStyles,
        day_label: {
          ...defaultStyles.day_label,
          color: COLORS.BLACK,
        },
        selected: {
          ...defaultStyles.selected_label,
          backgroundColor: COLORS.MAIN,
        },
        selected_label: {
          ...defaultStyles.selected_label,
          color: COLORS.WHITE,
        },
        header: {
          ...defaultStyles.header,
          backgroundColor: colorScheme === 'dark' ? COLORS.DARK : COLORS.WHITE,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        },
      }}
      style={{ backgroundColor: COLORS.WHITE, borderRadius: 16, marginTop: 8 }}
      firstDayOfWeek={1}
    />
  );
}

const style = StyleSheet.create({
  header: {
    backgroundColor: COLORS.MAIN,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  item: {
    padding: 12,
    backgroundColor: COLORS.WHITE,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    padding: 4,
    backgroundColor: COLORS.DARK,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
});
