import Head from 'next/head';
import { FC } from 'react';

const Metadata: FC<any> = ({ title = '' }) => (
  <Head>
    <title>{title ? `${title} | Sonargram` : 'Sonargram'}</title>
    <link rel="icon" href="/favicon.png" type="image/png" />
    <meta name="og:type" content="website" />
    <meta name="og:image" content="/og-image.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=1" />
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-37J87VRL8M"></script>
    <script
      dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag() {
            window.dataLayer.push(arguments)
          }
          gtag('js', new Date());

          gtag('config', 'G-37J87VRL8M');
        `,
      }}
    />
  </Head>
);

export default Metadata;
