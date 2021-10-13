import { FC, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { Box } from 'components/@basic';

const spinAnimation = keyframes`
  from {
    transform: rotateY(0deg);
  }
  to {
    transform: rotateY(359deg);
  }
`;

const Img = styled(Box)`
  box-sizing: border-box;
  overflow: hidden;
  height: 1em;
  width: 1em;
  border: 0.5px solid transparent;
  display: inline-block;
  transition: opacity 500ms ease-out;
  opacity: ${(props) => (props.show ? 1 : 0)};
  animation: ${spinAnimation} 1.4s linear infinite;
  ${(props) => !props.shouldSpin && 'animation: none;'}
`;

Img.defaultProps = {
  as: 'img',
};

const Empty = styled.div<any>`
  height: 1em;
  width: 1em;
  border: 0.5px solid transparent;
  display: inline-block;
`;

const Block: FC<{ src: string; shouldSpin: boolean }> = ({ src, shouldSpin }) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const seconds = Math.random() * 550;
    setTimeout(() => {
      setShow(true);
    }, seconds);
  }, []);

  if (!src) return <Empty />;

  return <Img src={src} show={show} shouldSpin={shouldSpin} />;
};

export default Block;
