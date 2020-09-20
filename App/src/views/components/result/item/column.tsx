import * as React from 'react';
import { View } from 'native-base';
import { ViewProps, FlexAlignType } from 'react-native';
import { Col, ColProps } from 'react-native-easy-grid';

interface Props extends ColProps {
    align?: FlexAlignType;
}

export const OLResultColumn: React.FC<Props> = (props) => {
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
                    justifyContent: 'flex-start',
                }}
            >
                {props.children}
            </View>
        </Col>
    );
};
