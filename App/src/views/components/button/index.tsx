import * as React from 'react';
import { Button, NativeBase } from 'native-base';
import { COLORS, fontPx } from 'util/const';
import { OLText } from '../text';

interface Props extends NativeBase.Button {
    beforeText?: React.ReactNode;
    afterText?: React.ReactNode;
    children: string;
}

export const OLButton: React.FC<Props> = (props) => {
    return (
        <Button
            {...props}
            style={[
                {
                    justifyContent: 'center',
                    backgroundColor: COLORS.MAIN,
                    opacity: props.disabled ? 0.35 : 1,
                    borderRadius: 4,
                },
                props.style,
            ]}
        >
            {props.beforeText}
            <OLText
                font="Rift_Bold"
                size={props.small ? 14 : 16}
                style={{
                    color: 'white',
                }}
            >
                {props.children}
            </OLText>
            {props.afterText}
        </Button>
    );
};
