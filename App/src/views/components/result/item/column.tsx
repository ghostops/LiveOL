import * as React from 'react';
import { FlexAlignType, View } from 'react-native';
import { Col, ColProps } from 'react-native-easy-grid';

interface Props extends ColProps {
  align?: FlexAlignType;
}

export const OLResultColumn: React.FC<Props> = props => {
  return (
    <Col
      {...props}
      style={[
        props.style,
        {
          height: '100%',
        },
      ]}
    >
      <View
        style={{
          flex: 1,
          alignItems: props.align || 'flex-start',
          justifyContent: 'center',
        }}
      >
        {props.children}
      </View>
    </Col>
  );
};
