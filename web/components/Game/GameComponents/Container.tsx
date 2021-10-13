import styled from '@emotion/styled';
import tilingDot from './tiling-dot.png';
import { Box } from 'components/@basic';

const Container = styled(Box)`
  color: transparent;

  width: 31em;
  height: 31em;

  box-sizing: content-box;

  line-height: 0.5em;
  min-width: 31em;
  min-height: 31em;

  background: url('${tilingDot}') currentcolor;
  background-size: 1em;

  @media screen and (max-width: 21em) {
    font-size: 7.75px;
  }

  @media screen and (max-width: 14em) {
    font-size: 5px;
  }
`;

export default Container;
