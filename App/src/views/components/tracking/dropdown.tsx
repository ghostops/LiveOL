import { useCallback, useMemo, useRef } from 'react';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import { TextInput } from 'react-native-gesture-handler';
import { COLORS } from '~/util/const';

type Props = {
  dataSet: { id: string; title: string }[] | null;
  onAddItem: (item: string) => void;
  onChangeText?: (text: string) => void;
};

export const OLTrackingDropdown = ({
  dataSet,
  onAddItem,
  onChangeText,
}: Props) => {
  const dropdownRef = useRef<TextInput | null>(null);

  // Memoize the dataset to prevent re-renders
  const memoizedDataSet = useMemo(() => dataSet, [dataSet]);

  // Memoize the select handler
  const handleSelectItem = useCallback(
    (e: { id: string; title: string } | null) => {
      if (e && e.title) {
        onAddItem(e.title);
        setTimeout(() => {
          dropdownRef.current?.clear();
          onChangeText?.('');
        }, 1);
      }
    },
    [onAddItem, onChangeText],
  );

  // Memoize the blur handler
  const handleBlur = useCallback(() => {
    dropdownRef.current?.clear();
    onChangeText?.('');
  }, [onChangeText]);

  // Memoize the change text handler
  const handleChangeText = useCallback(
    (text: string) => {
      onChangeText?.(text);
    },
    [onChangeText],
  );

  return (
    <AutocompleteDropdown
      ref={dropdownRef}
      closeOnBlur={true}
      closeOnSubmit={true}
      showChevron={true}
      showClear={false}
      trimSearchText={true}
      enableLoadingIndicator={false}
      onSelectItem={handleSelectItem}
      onChangeText={handleChangeText}
      dataSet={memoizedDataSet}
      // Performance optimizations
      suggestionsListMaxHeight={300}
      debounce={0} // We handle debouncing in parent
      useFilter={false} // Disable client-side filtering (we do server-side)
      containerStyle={{
        flex: 1,
      }}
      onBlur={handleBlur}
      inputContainerStyle={{
        backgroundColor: COLORS.WHITE,
        borderColor: COLORS.MAIN,
        borderWidth: 2,
        borderRadius: 8,
      }}
      textInputProps={{
        style: {
          color: COLORS.BLACK,
        },
      }}
    />
  );
};
