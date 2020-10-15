

import * as React from 'react';

interface IEllipseTextProps {
}

const EllipseText: React.FunctionComponent<IEllipseTextProps> = ({children}) => {
  return <>
    <style jsx>{`
        span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    `}</style>
    <span>
        {children}
    </span>
  </>;
};

export default EllipseText;
