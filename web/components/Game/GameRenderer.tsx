import { FC } from 'react';
import Block from './GameComponents/Block';
import Container from './GameComponents/Container';
import { FlexBox } from 'components/@basic';

import map from '../../emoji-map';

interface Data {
  name: string;
  snapshot: string[][];
  savedAt: string;
  creatorName: string;
  url: string;
}

const GameRender: FC<{ data: Data }> = (props) => {
  if (!props.data?.snapshot) return null;

  const { name, savedAt, creatorName, url, snapshot } = props.data;

  return (
    <FlexBox mx="auto">
      <Container mx="auto" fontSize={['8px', '17px']}>
        {snapshot.map((rows) =>
          rows.map((block, i) => {
            const shouldSpin = block === 'coin';
            return <Block key={i} src={map[block]?.imageUrl} shouldSpin={shouldSpin} />;
          }),
        )}
      </Container>
    </FlexBox>
  );
};

export default GameRender;
