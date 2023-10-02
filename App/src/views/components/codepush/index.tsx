import React from 'react';

export const OLCodePush: React.FC<any> = ({ children }) => {
  if (__DEV__) {
    return children;
  }

  return <>{children}</>;
};
