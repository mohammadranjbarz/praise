import jwtDecode from 'jwt-decode';
import { atom, selector, selectorFamily } from 'recoil';
import { JWT } from '../utils/jwt';
import { recoilPersist } from 'recoil-persist';
import { TokenSet } from 'api/dist/auth/types';
import { UserRole } from 'api/dist/user/types';

const { persistAtom } = recoilPersist();

export const ROLE_USER = UserRole.USER;
export const ROLE_ADMIN = UserRole.ADMIN;
export const ROLE_QUANTIFIER = UserRole.QUANTIFIER;

export const ActiveTokenSet = atom<TokenSet | undefined>({
  key: 'ActiveTokenSet',
  default: undefined,
  effects_UNSTABLE: [persistAtom],
});

export const AccessToken = selector<string | undefined>({
  key: 'AccessToken',
  get: ({ get }) => {
    const tokens = get(ActiveTokenSet);
    if (!tokens) return undefined;
    return tokens.accessToken;
  },
});

export const RefreshToken = selector<string | undefined>({
  key: 'RefreshToken',
  get: ({ get }) => {
    const tokens = get(ActiveTokenSet);
    if (!tokens) return undefined;

    return tokens.refreshToken;
  },
});

export const DecodedAccessToken = selector({
  key: 'DecodedAccessToken',
  get: ({ get }) => {
    const accessToken = get(AccessToken);
    if (!accessToken) return undefined;
    return jwtDecode(accessToken);
  },
});

export const ActiveUserId = selector({
  key: 'ActiveUserId',
  get: ({ get }) => {
    const activeTokenSet = get(ActiveTokenSet);
    if (!activeTokenSet) return;

    const decodedToken = get(DecodedAccessToken);
    if (!decodedToken) return undefined;
    return (decodedToken as JWT).userId;
  },
});

export const ActiveUserRoles = selector({
  key: 'ActiveUserRoles',
  get: ({ get }) => {
    const activeTokenSet = get(ActiveTokenSet);
    if (!activeTokenSet) return;

    const decodedToken = get(DecodedAccessToken);
    if (!decodedToken) return;
    return (decodedToken as JWT).roles;
  },
});

export const HasRole = selectorFamily({
  key: 'HasRole',
  get:
    (role: string) =>
    ({ get }): boolean | undefined => {
      const userRoles = get(ActiveUserRoles);
      if (!userRoles) return undefined;
      return userRoles.includes(role);
    },
});