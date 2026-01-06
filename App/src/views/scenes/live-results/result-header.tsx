import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { OLText } from '~/views/components/text';
import { useRowWidths } from './useRowWidths';
import { useOrientation } from '~/hooks/useOrientation';
import { OrientationType } from 'react-native-orientation-locker';
import { useTheme } from '~/hooks/useTheme';
import { useSortingStore } from '~/store/sorting';
import { HIT_SLOP } from '~/util/const';
import { OLIcon } from '~/views/components/icon';

type Props = {
  liveSplitControls?:
    | {
        name: string;
        code: string;
      }[]
    | undefined;
};

export const OLResultHeader = (props: Props) => {
  const { t } = useTranslation();
  const { name, place, splits, time } = useRowWidths();
  const orientation = useOrientation();
  const { colors } = useTheme();
  const { setSortingDirection, setSortingKey, sortingDirection } =
    useSortingStore();

  return (
    <View
      style={{
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.BORDER,
        backgroundColor: colors.WHITE,
        alignItems: 'center',
        paddingVertical: 8,
      }}
    >
      <TouchableOpacity
        style={[
          styles.column,
          {
            width: place,
            justifyContent:
              orientation === OrientationType.PORTRAIT ? 'center' : 'flex-end',
            paddingRight: 8,
          },
        ]}
        onPress={() => {
          setSortingKey('place');
          setSortingDirection(sortingDirection === 'asc' ? 'desc' : 'asc');
        }}
        hitSlop={HIT_SLOP}
      >
        <SortingIcon name="place" />
        <OLText bold>#</OLText>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          setSortingKey('name');
          setSortingDirection(sortingDirection === 'asc' ? 'desc' : 'asc');
        }}
        style={[styles.column, { width: name }]}
        hitSlop={HIT_SLOP}
      >
        <SortingIcon name="name" />
        <OLText bold>{t('Name')}</OLText>
      </TouchableOpacity>
      {props.liveSplitControls?.map(split => (
        <TouchableOpacity
          key={split.code}
          style={[styles.column, { width: splits }]}
          onPress={() => {
            setSortingKey('split-' + split.code);
            setSortingDirection(sortingDirection === 'asc' ? 'desc' : 'asc');
          }}
          hitSlop={HIT_SLOP}
        >
          <SortingIcon name={'split-' + split.code} />
          <OLText bold numberOfLines={1}>
            {split.name}
          </OLText>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={[
          styles.column,
          { width: time, paddingRight: 16, justifyContent: 'flex-end' },
        ]}
        onPress={() => {
          setSortingKey('result');
          setSortingDirection(sortingDirection === 'asc' ? 'desc' : 'asc');
        }}
        hitSlop={HIT_SLOP}
      >
        <SortingIcon name="result" />
        <OLText bold>{t('Time')}</OLText>
      </TouchableOpacity>
    </View>
  );
};

const SortingIcon = ({ name }: { name: string }) => {
  const { sortingKey, sortingDirection } = useSortingStore();

  if (name !== sortingKey) {
    return null;
  }

  if (sortingKey === 'place' && sortingDirection === 'asc') {
    return null;
  }

  return (
    <OLIcon
      size={14}
      name={sortingDirection === 'asc' ? 'chevron-up' : 'chevron-down'}
      style={{ marginRight: 2 }}
    />
  );
};

const styles = StyleSheet.create({
  column: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
});
