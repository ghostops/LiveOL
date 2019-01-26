import * as React from 'react';
import { Text, Button, NativeBase } from 'native-base';
import { COLORS } from 'util/const';

interface Props extends NativeBase.Button {
    beforeText?: React.ReactNode;
    afterText?: React.ReactNode;
    children: string;
}

export const OLButton: React.SFC<Props> = (props) => {
    return (
        <Button
            {...props}
            style={{
                justifyContent: 'center',
                backgroundColor: COLORS.MAIN,
                opacity: props.disabled ? 0.35 : 1,
                borderRadius: 4,
                ...props.style,
            }}
        >
            {props.beforeText}
            <Text>
                {props.children}
            </Text>
            {props.afterText}
        </Button>
    );
};
