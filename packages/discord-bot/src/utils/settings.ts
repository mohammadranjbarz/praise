import { SettingsModel } from 'api/dist/settings/entities';

export const getSetting = async (
  settingKey: string
): Promise<string | number | boolean> => {
  const setting = await SettingsModel.findOne({ key: settingKey });
  return setting?.value || '';
};

export const putSetting = async (
  settingKey: String,
  updatedValue: String
): Promise<void> => {
  await SettingsModel.updateOne({ key: settingKey }, { value: updatedValue });
};

/*
export const getAllSettings = async () => {
  const settings = await SettingsModel.find({});
  return settings;
};
*/
