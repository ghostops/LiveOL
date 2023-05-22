import React from 'react';
import { View } from 'react-native';
import { OLText } from 'views/components/text';

type Props = {
  runners: any;
  classes: any;
  clubs: any;
};

export const OLFollow: React.FC<Props> = ({ classes, clubs, runners }) => {
  return (
    <View style={{ flex: 1 }}>
      {classes.map((c: any) => (
        <OLText size={12}>{c}</OLText>
      ))}
      {clubs.map((c: any) => (
        <OLText size={12}>{c}</OLText>
      ))}
      {runners.map((r: any) => (
        <OLText size={12}>{r}</OLText>
      ))}
    </View>
  );
};
