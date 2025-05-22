import { AppDataSource } from "../data-source";
import { Setting } from "../entities/Setting";

const getSettings = async () => {
  const settingsRepository = AppDataSource.getRepository(Setting);
  const settings = await settingsRepository.find();

  return settings?.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});
};

export default getSettings;
