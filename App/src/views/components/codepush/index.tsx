import React from 'react';
import codePush from 'react-native-code-push';

type Props = {
  children: any;
};

class OLCodePushContainer extends React.Component<Props> {
  render() {
    return this.props.children;
  }
}

const OLCodePushWrapper = codePush(OLCodePushContainer);

export const OLCodePush: React.FC<Props> = ({ children }) => {
  if (__DEV__) {
    return children;
  }

  return <OLCodePushWrapper>{children}</OLCodePushWrapper>;
};
