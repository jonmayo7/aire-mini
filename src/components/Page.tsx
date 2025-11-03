import { useNavigate } from 'react-router-dom';
import { type PropsWithChildren } from 'react';

export function Page({ children, back = true }: PropsWithChildren<{
  /**
   * True if it is allowed to go back from this page.
   */
  back?: boolean
}>) {
  // TODO: Implement browser back button handling if needed for PWA
  return <>{children}</>;
}