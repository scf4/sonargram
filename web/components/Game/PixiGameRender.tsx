import { FC, useRef } from 'react';
import * as PIXI from 'pixi.js';

//  const block = useCallback((g: PIXI.Graphics) =>
//     g.clear();
//     g.isSprite = true;
//     g.height = 37;
//     g.width = 37;
//     g.beginFill(0xffffff);
//     g.drawRect(9, 9, 1, 1);
//     g.endFill();
//     return r.generateTexture(g);
//   }, []);

PIXI.settings.RESOLUTION = window.devicePixelRatio ?? 1;
PIXI.settings.SCALE_MODE = 1;

const GameRender: FC = () => {
  const ref = useRef(null);
  const [rows, cols] = [31, 31];
  const cellSize = 32;

  const app = new PIXI.Application({});

  return <div ref={ref} />;
};

export default GameRender;
