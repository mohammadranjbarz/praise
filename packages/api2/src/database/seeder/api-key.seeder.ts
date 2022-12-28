import { ApiKeyService } from '@/api-key/api-key.service';
import { CreateApiKeyResponse } from '@/api-key/dto/create-api-key-response';
import { AuthRole } from '@/auth/enums/auth-role.enum';
import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiKeySeeder {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  /**
   * Generate and save a fake ApiKey
   */
  seedApiKey = async (): Promise<CreateApiKeyResponse> => {
    const apiKey = await this.apiKeyService.createApiKey({
      description: faker.lorem.lines(1),
      role: AuthRole.APIKEY_READWRITE,
    });
    return apiKey;
  };
}
