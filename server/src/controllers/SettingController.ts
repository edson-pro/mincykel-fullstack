import { Request, Response } from "express";

import { Setting } from "../entities/Setting";
import { AppDataSource } from "../data-source";
import { NotFoundError } from "../errors/http.errors";
import { asyncHandler } from "../utils/async-handler";

export class SettingController {
  upsert = asyncHandler(async (request: Request, response: Response) => {
    const { key, value, type } = request.body;

    const settingsRepository = AppDataSource.getRepository(Setting);

    // existing setting
    const existingSetting = await settingsRepository.findOne({
      where: { key },
    });

    if (existingSetting) {
      await settingsRepository.update(existingSetting.id, { value });
    } else {
      await settingsRepository.save({ key, value, type });
    }

    return response.status(200).json({ key, value, type });
  });

  get = asyncHandler(async (request: Request, response: Response) => {
    const { key } = request.params;

    const settingsRepository = AppDataSource.getRepository(Setting);

    const setting = await settingsRepository.findOne({ where: { key } });

    if (!setting) {
      throw new NotFoundError("Setting not found");
    }

    return response.json(setting);
  });

  list = asyncHandler(async (request: Request, response: Response) => {
    const settingsRepository = AppDataSource.getRepository(Setting);

    const settings = await settingsRepository.find();

    return response.json(settings);
  });

  delete = asyncHandler(async (request: Request, response: Response) => {
    const { key } = request.params;

    const settingsRepository = AppDataSource.getRepository(Setting);

    const setting = await settingsRepository.findOne({ where: { key } });

    if (!setting) {
      throw new NotFoundError("Setting not found");
    }

    await settingsRepository.delete({ key });

    return response.status(204).json();
  });
}
