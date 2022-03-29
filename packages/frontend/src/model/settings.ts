import { makeApiAuthClient } from '@/utils/api';
import { AxiosError, AxiosResponse } from 'axios';
import React from 'react';
import { toast } from 'react-hot-toast';
import {
  atom,
  atomFamily,
  selector,
  selectorFamily,
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil';
import { findIndex } from 'lodash';
import { ApiAuthGet, useAuthApiQuery } from './api';

export interface Setting {
  _id: string;
  key: string;
  type: string;
  label: string;
  description: string;
  value: string;
  valueNormalized: string | Boolean | number | number[] | File;
}

export interface StringSetting extends Setting {
  value: string;
}

const isImageSetting = (setting: Setting): Boolean => {
  return setting.type === 'Image';
};

const AllSettingsRequestId = atom({
  key: 'AllSettingsRequestId',
  default: 0,
});

export const AllSettingsQuery = selector({
  key: 'AllSettingsQuery',
  get: ({ get }) => {
    get(AllSettingsRequestId);
    return get(
      ApiAuthGet({
        url: '/settings/all',
      })
    );
  },
});

export const AllSettings = atom<Setting[]>({
  key: 'AllSettings',
  default: [],
});

export const useAllSettingsQuery = (): void => {
  const allSettingsQueryResponse = useAuthApiQuery(AllSettingsQuery);
  const setAllSettings = useSetRecoilState(AllSettings);

  React.useEffect(() => {
    const settings = allSettingsQueryResponse.data as Setting[];
    if (!Array.isArray(settings) || settings.length === 0) return;

    setAllSettings(settings);
  }, [allSettingsQueryResponse, setAllSettings]);
};

export const SetSettingApiResponse = atom<
  AxiosResponse<unknown> | AxiosError<unknown> | null
>({
  key: 'SetSettingApiResponse',
  default: null,
});

export const SingleSetting = selectorFamily({
  key: 'SingleSetting',
  get:
    (key: string) =>
    ({ get }): Setting | undefined => {
      const allSettings = get(AllSettings);
      if (!allSettings) return undefined;

      const setting = allSettings.find((setting) => setting.key === key);
      if (!setting) return undefined;

      return setting;
    },
});

type useSetSettingReturn = {
  setSetting: (setting: Setting) => Promise<void>;
};
export const useSetSetting = (): useSetSettingReturn => {
  const allSettings = useRecoilValue(AllSettings);

  const setSetting = useRecoilCallback(
    ({ set }) =>
      async (setting: Setting) => {
        const url = `/admin/settings/${setting._id}/set`;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const reqData = (setting: Setting): any => {
          if (isImageSetting(setting)) {
            const data = new FormData();
            data.append('value', setting.value);
            return data;
          } else {
            return setting;
          }
        };

        const apiAuthClient = makeApiAuthClient();
        const response = await apiAuthClient.patch(url, reqData(setting));

        const updatedSetting = response.data as Setting;
        const settingIndex = findIndex(
          allSettings,
          (s: Setting) => s._id === updatedSetting._id
        );
        console.log('settingIndex', settingIndex);

        if (settingIndex === -1) {
          set(AllSettings, [updatedSetting]);
        } else {
          const updatedAllSettings = allSettings.slice();
          updatedAllSettings.splice(settingIndex, 1, updatedSetting);

          set(AllSettings, updatedAllSettings);
        }

        toast.success(`Saved setting "${updatedSetting.label}"`);
      }
  );

  return { setSetting };
};

export const AllPeriodSettings = atomFamily<Setting[], string>({
  key: 'AllPeriodSettings',
  default: [],
});

export const useSetPeriodSetting = (periodId: string): useSetSettingReturn => {
  const [allSettings, setAllSettings] = useRecoilState(
    AllPeriodSettings(periodId)
  );

  const setSetting = useRecoilCallback(() => async (setting: Setting) => {
    const url = `/admin/periods/${periodId}/settings/${setting._id}/set`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reqData = (setting: Setting): any => {
      if (isImageSetting(setting)) {
        const data = new FormData();
        data.append('value', setting.value);
        return data;
      } else {
        return setting;
      }
    };

    const apiAuthClient = makeApiAuthClient();
    const response = await apiAuthClient.patch(url, reqData(setting));

    const updatedSetting = response.data as Setting;
    const settingIndex = findIndex(
      allSettings,
      (s) => s._id === updatedSetting._id
    );

    if (settingIndex === -1) {
      setAllSettings([updatedSetting]);
    } else {
      const updatedAllSettings = allSettings.slice();
      updatedAllSettings.splice(settingIndex, 1, updatedSetting);

      setAllSettings(updatedAllSettings);
    }

    toast.success(`Saved setting "${updatedSetting.label}"`);
  });

  return { setSetting };
};

export const AllPeriodSettingsQuery = selectorFamily({
  key: 'AllPeriodSettingsQuery',
  get:
    (periodId: string) =>
    ({ get }): AxiosResponse<unknown> => {
      return get(
        ApiAuthGet({
          url: `/periods/${periodId}/settings/all`,
        })
      );
    },
});

export const useAllPeriodSettingsQuery = (periodId: string): void => {
  const queryResponse = useAuthApiQuery(AllPeriodSettingsQuery(periodId));
  const [allSettings, setAllSettings] = useRecoilState(
    AllPeriodSettings(periodId)
  );

  React.useEffect(() => {
    const settings = queryResponse.data as Setting[];
    if (!Array.isArray(settings) || settings.length === 0) return;

    setAllSettings(settings);
  }, [queryResponse, setAllSettings, allSettings]);
};
