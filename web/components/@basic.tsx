import { FC } from 'react';
import styled from '@emotion/styled';
import * as ss from 'styled-system';
import shouldForwardProp from '@styled-system/should-forward-prop';

const Box = styled('div', { shouldForwardProp })(
  ss.typography,
  ss.space,
  ss.color,
  ss.flexbox,
  ss.layout,
  ss.display,
  ss.background,
  ss.size,
);

const Text = styled(Box)({ as: 'span' });

const FlexBox = styled(Box)({ display: 'flex' });

const ButtonWrapper = styled(Box)(
  `
  border: 1.5px solid transparent;
  text-align: center;
  font-weight: medium;
  font-size: 11px;
  border-radius: 11px;
  padding: 6px 8px 4px 8px;
  display: inline-flex;
  justify-content: center;
  align-contentw: center;
`,
  { as: 'a' },
);

const Button: FC<{ href: string }> = ({ children, href, ...props }) => (
  <ButtonWrapper {...props}>
    <Text
      textAlign="center"
      noreferer
      nooopener
      fontWeight="medium"
      fontSize="12px"
      as="a"
      href={href}
    >
      {children}
    </Text>
  </ButtonWrapper>
);

export { Box, FlexBox, Text, Button };
