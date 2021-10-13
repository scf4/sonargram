import { AppProps } from 'next/app';
import '../styles/global.css';

import Metadata from 'components/Metadata';

const App = ({ Component, ...props }: AppProps<{ id: string }>) => {
  const id = props.router.query.id!;

  return (
    <>
      <Metadata />
      <Component id={id as string} />
    </>
  );
};

export default App;
