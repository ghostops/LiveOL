import React from 'react';
import Ionicon from 'react-native-vector-icons/Ionicons';

type Props = React.ComponentProps<typeof Ionicon>;

export const OLIcon: React.FC<Props> = props => {
  return <Ionicon {...props} />;
};
