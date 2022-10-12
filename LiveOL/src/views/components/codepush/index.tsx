import React from 'react';
import codePush, { CodePushOptions } from 'react-native-code-push';

type Props = {
  children: any;
};

class OLCodePushContainer extends React.Component<Props> {
  render() {
    return this.props.children;
  }
}

export const OLCodePush = codePush({
  checkFrequency: __DEV__
    ? codePush.CheckFrequency.MANUAL
    : codePush.CheckFrequency.ON_APP_START,
} as CodePushOptions)(OLCodePushContainer);
