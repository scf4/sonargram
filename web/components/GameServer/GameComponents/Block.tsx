import styled from '@emotion/styled';
import { FC } from 'react';
import { Box } from 'components/@basic';

const Img = styled(Box)`
  box-sizing: border-box;
  overflow: hidden;
  height: 1em;
  width: 1em;
  border: 0.5px solid transparent;
  display: inline-block;
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

const Block: FC<{ src: string }> = ({ src }) => {
  if (!src) return <Empty />;
  return <Img src={src} />;
};

export default Block;
