import { useCallback, useMemo, useRef, memo } from 'react';
import {
  AutocompleteDropdown,
  AutocompleteDropdownItem,
} from 'react-native-autocomplete-dropdown';
import { TextInput } from 'react-native-gesture-handler';
import { COLORS } from '~/util/const';

type Props = {
  dataSet: { id: string; title: string }[] | null;
  onAddItem: (item: string) => void;
  onChangeText?: (text: string) => void;
};

const OLTrackingDropdownComponent = ({
  dataSet,
  onAddItem,
  onChangeText,
}: Props) => {
  const dropdownRef = useRef<TextInput | null>(null);

  // Memoize the dataset to prevent re-renders
  const memoizedDataSet = useMemo(() => dataSet, [dataSet]);

  // Memoize the select handler
  const handleSelectItem = useCallback(
    (item: AutocompleteDropdownItem | null) => {
      if (item && item.title) {
        onAddItem(item.title);
        setTimeout(() => {
          dropdownRef.current?.clear();
          onChangeText?.('');
        }, 1);
      }
    },
    [onAddItem, onChangeText],
  );

  // Don't clear on blur - let the user scroll the list without resetting
  const handleBlur = useCallback(() => {
    // Only clear if no text is entered (user dismissed without selecting)
    // The dropdown library handles closing the suggestions list
  }, []);

  // Memoize the change text handler
  const handleChangeText = useCallback(
    (text: string) => {
      onChangeText?.(text);
    },
    [onChangeText],
  );

  // Memoize container style
  const containerStyle = useMemo(() => ({ flex: 1 }), []);

  // Memoize input container style
  const inputContainerStyle = useMemo(
    () => ({
      backgroundColor: COLORS.WHITE,
      borderColor: COLORS.MAIN,
      borderWidth: 2,
      borderRadius: 8,
    }),
    [],
  );

  // Memoize text input style
  const textInputStyle = useMemo(
    () => ({
      color: COLORS.BLACK,
    }),
    [],
  );

  return (
    <AutocompleteDropdown
      ref={dropdownRef}
      closeOnBlur={false} // Don't close when scrolling the list
      closeOnSubmit={true}
      showChevron={true}
      showClear={true} // Enable clear button so users can manually clear
      clearOnFocus={false} // Don't clear when focusing input
      trimSearchText={true}
      enableLoadingIndicator={false}
      onSelectItem={handleSelectItem}
      onChangeText={handleChangeText}
      dataSet={memoizedDataSet}
      // Performance optimizations
      suggestionsListMaxHeight={300}
      debounce={0} // We handle debouncing in parent
      useFilter={false} // Disable client-side filtering (we do server-side)
      emptyResultText="No results"
      containerStyle={containerStyle}
      onBlur={handleBlur}
      inputContainerStyle={inputContainerStyle}
      textInputProps={{
        style: textInputStyle,
        autoCorrect: false,
        autoCapitalize: 'none',
        keyboardType: 'default',
      }}
      flatListProps={{
        keyboardShouldPersistTaps: 'handled',
        removeClippedSubviews: true,
        maxToRenderPerBatch: 10,
        windowSize: 5,
        initialNumToRender: 10,
        nestedScrollEnabled: true, // Allow nested scrolling
      }}
    />
  );
};

// Memo the component to prevent unnecessary re-renders
export const OLTrackingDropdown = memo(OLTrackingDropdownComponent);
