import { Redirect, Route, Switch } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useAccount } from 'wagmi';
import React, { useEffect } from 'react';
import { ActiveTokenSet, DecodedAccessToken } from '@/model/auth';
import { AuthenticatedLayout } from '../layouts/AuthenticatedLayout';

const ActivatePage = React.lazy(() => import('@/pages/Activate/ActivatePage'));
const ErrorPage = React.lazy(() => import('@/pages/ErrorPage'));
const LoginPage = React.lazy(() => import('@/pages/Login/LoginPage'));

export const Routes = (): JSX.Element => {
  const [tokenSet, setTokenSet] = useRecoilState(ActiveTokenSet);
  const decodedToken = useRecoilValue(DecodedAccessToken);
  const { address } = useAccount();

  // Clear ActiveTokenSet if ethereum address changes
  useEffect(() => {
    if (tokenSet && decodedToken?.identityEthAddress !== address) {
      setTokenSet(undefined);
    }
  }, [tokenSet, address, decodedToken?.identityEthAddress, setTokenSet]);

  return tokenSet && decodedToken?.identityEthAddress === address ? (
    <Switch>
      <Route exact path="/activate">
        <ActivatePage />
      </Route>
      <Route exact path="/404">
        <ErrorPage error={{ message: 'Not found' }} />
      </Route>
      <AuthenticatedLayout />
    </Switch>
  ) : (
    <Switch>
      <Route exact path="/">
        <LoginPage />
      </Route>
      <Route exact path="/activate">
        <ActivatePage />
      </Route>
      <Route path="/*">
        <Redirect
          to={{
            pathname: '/',
          }}
        />
      </Route>
    </Switch>
  );
};
