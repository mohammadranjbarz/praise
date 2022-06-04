import { SettingsModel } from 'api/dist/settings/entities';

export const getSetting = async (
  settingKey: string
): Promise<string | number | boolean> => {
  const setting = await SettingsModel.findOne({ key: settingKey });
  return setting?.value || '';
};

/*
export const getAllSettings = async () => {
  const settings = await SettingsModel.find({});
  return settings;
};
*/
