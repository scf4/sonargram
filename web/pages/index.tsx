import { FC, useEffect, useState } from 'react';
import Head from 'next/head';
import Room from 'components/Game';

export default ({ id }: { id?: string }) => {
  return (
    <>
      <Head>
        <title>Sonargram</title>
      </Head>
      {!id && <div></div>}
    </>
  );
};
