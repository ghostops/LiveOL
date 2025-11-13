import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useOLNavigation } from '~/hooks/useNavigation';
import { useTheme } from '~/hooks/useTheme';
import { $api } from '~/lib/react-query/api';
import { COLORS } from '~/util/const';
import { OLText } from '~/views/components/text';
import { useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import { HomeRowItem } from '../home';

export const OLSceneSearch = () => {
  const { colors, px } = useTheme();
  const { navigate, goBack } = useOLNavigation();

  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Only fetch if we have a search query or date filters
  const shouldFetch =
    debouncedQuery.trim().length >= 2 ||
    startDate.trim().length > 0 ||
    endDate.trim().length > 0;

  const searchResults = $api.useQuery(
    'get',
    '/v2/competitions/search',
    {
      params: {
        query: {
          q: debouncedQuery.trim() || undefined,
          startDate: startDate.trim() || undefined,
          endDate: endDate.trim() || undefined,
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
      {/* Header */}
      <View
        style={[
          style.header,
          {
            paddingTop: px(50),
            paddingHorizontal: px(16),
            paddingBottom: px(12),
          },
        ]}
      >
        <View style={style.searchRow}>
          <TouchableOpacity onPress={goBack} style={{ marginRight: px(12) }}>
            <OLText size={18}>✕</OLText>
          </TouchableOpacity>
          <TextInput
            style={[
              style.searchInput,
              {
                flex: 1,
                paddingHorizontal: px(12),
                paddingVertical: px(8),
              },
            ]}
            placeholder="Search competitions or organizers..."
            placeholderTextColor={COLORS.BACKGROUND}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
          />
        </View>

        {/* Filter toggle */}
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          style={{ marginTop: px(8) }}
        >
          <OLText size={14}>{showFilters ? '▼' : '▶'} Date Filters</OLText>
        </TouchableOpacity>

        {/* Date filters */}
        {showFilters && (
          <View style={{ marginTop: px(8), gap: px(8) }}>
            <View>
              <OLText size={12} style={{ marginBottom: px(4) }}>
                Start Date (YYYY-MM-DD)
              </OLText>
              <TextInput
                style={[
                  style.searchInput,
                  {
                    paddingHorizontal: px(12),
                    paddingVertical: px(8),
                  },
                ]}
                placeholder="2024-01-01"
                placeholderTextColor={COLORS.BACKGROUND}
                value={startDate}
                onChangeText={setStartDate}
                keyboardType="numbers-and-punctuation"
              />
            </View>
            <View>
              <OLText size={12} style={{ marginBottom: px(4) }}>
                End Date (YYYY-MM-DD)
              </OLText>
              <TextInput
                style={[
                  style.searchInput,
                  {
                    paddingHorizontal: px(12),
                    paddingVertical: px(8),
                  },
                ]}
                placeholder="2024-12-31"
                placeholderTextColor={COLORS.BACKGROUND}
                value={endDate}
                onChangeText={setEndDate}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>
        )}
      </View>

      {/* Results */}
      <View style={{ flex: 1 }}>
        {!shouldFetch ? (
          <View style={style.emptyState}>
            <OLText size={16}>Enter at least 2 characters to search</OLText>
          </View>
        ) : searchResults.isLoading ? (
          <View style={style.emptyState}>
            <ActivityIndicator size="large" color={colors.MAIN} />
          </View>
        ) : competitions.length === 0 ? (
          <View style={style.emptyState}>
            <OLText size={16}>No competitions found</OLText>
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
              />
            )}
            ItemSeparatorComponent={ItemSeparator}
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
});
