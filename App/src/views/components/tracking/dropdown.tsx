import { useRef } from 'react';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import { TextInput } from 'react-native-gesture-handler';
import { COLORS } from '~/util/const';

type Props = {
  dataSet: { id: string; title: string }[] | null;
  onAddItem: (item: string) => void;
};

export const OLTrackingDropdown = ({ dataSet, onAddItem }: Props) => {
  const dropdownRef = useRef<TextInput | null>(null);

  return (
    <AutocompleteDropdown
      ref={dropdownRef}
      closeOnBlur={true}
      closeOnSubmit={true}
      showChevron={true}
      showClear={false}
      trimSearchText={true}
      enableLoadingIndicator={false}
      onSelectItem={e => {
        if (e && e.title) {
          onAddItem(e.title);
          setTimeout(() => {
            dropdownRef.current?.clear();
          }, 1);
        }
      }}
      dataSet={dataSet}
      containerStyle={{
        flex: 1,
      }}
      onBlur={() => {
        dropdownRef.current?.clear();
      }}
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
