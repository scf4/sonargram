import { FC } from 'react';
import { Box } from './@basic';

const Page: FC<{ onClick?: () => void }> = ({ children, onClick }) => {
  return (
    <Box onClick={onClick} p={4}>
      {children}
    </Box>
  );
};

export default Page;
