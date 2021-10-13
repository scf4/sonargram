import { FC } from 'react';
import Head from 'next/head';
import useApi from 'swr';

import useGetMobilePlatform from 'hooks/use-get-mobile-platform';

import { FlexBox, Text, Button } from 'components/@basic';
import Page from 'components/Page';
import Game from './GameRenderer';

// import exportImage from 'react-component-export-image';

// import dynamic from 'next/dynamic';
// const Stage = dynamic(() => import('./PixiGameRender'), { ssr: false });

const Room: FC<{ id: string }> = ({ id }) => {
  const { data } = useApi(`https://${process.env.API_DOMAIN ?? 'api.sonargr.am'}/?id=${id}`);
  const { isIos } = useGetMobilePlatform();

  if (!data) return null;

  const title = data.name ?? 'Sonargram';
  const roomName = data.name ?? '';
  const creatorName = data.creatorName ?? '';

  const createdByText = creatorName ? `Created by @${creatorName}` : null;

  const hasShareUrl = !!data.url;
  const href = data.url ?? 'https://sonar.app';

  const openSonarLabel = isIos && hasShareUrl ? 'VIEW ON SONAR' : 'CREATE YOUR OWN SPACE ON SONAR';

  return (
    <Page>
      <Head>
        <title>{title}</title>
      </Head>

      <FlexBox justifyContent="center">
        <Text fontSize={1} fontWeight="medium">
          {roomName}
        </Text>
      </FlexBox>

      {createdByText && (
        <Text mt={1} opacity={0.75} fontSize={0} textAlign="center">
          {createdByText}
        </Text>
      )}

      <FlexBox mt={4}>
        <Game data={data} />
      </FlexBox>

      <FlexBox mt={4} opacity={0.75} justifyContent="center">
        <Button href={href}>{openSonarLabel}</Button>
      </FlexBox>
    </Page>
  );
};

export default Room;
