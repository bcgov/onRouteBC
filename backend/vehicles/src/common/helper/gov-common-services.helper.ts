import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig } from 'axios';
import { lastValueFrom } from 'rxjs';
import { GovCommonServices } from '../enum/gov-common-services.enum';
import { InternalServerErrorException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { GovCommonServicesToken } from '../interface/gov-common-services-token.interface';

const GOV_COMMON_SERVICES_TOKEN = 'GOV_COMMON_SERVICES_TOKEN';
export async function getAccessToken(
  govCommonServices: GovCommonServices,
  httpService: HttpService,
  cacheManager: Cache,
) {
  const tokenFromCache: GovCommonServicesToken = await cacheManager.get(
    GOV_COMMON_SERVICES_TOKEN,
  );
  if (tokenFromCache) {
    if (Date.now() < tokenFromCache.expires_at) {
      return tokenFromCache.access_token;
    }
  }
  let tokenUrl: string = undefined;
  let username: string = undefined;
  let password: string = undefined;
  if (govCommonServices === GovCommonServices.COMMON_HOSTED_EMAIL_SERVICE) {
    tokenUrl = process.env.CHES_TOKEN_URL;
    username = process.env.CHES_CLIENT_ID;
    password = process.env.CHES_CLIENT_SECRET;
  } else if (
    govCommonServices === GovCommonServices.COMMON_DOCUMENT_GENERATION_SERVICE
  ) {
    tokenUrl = process.env.CDOGS_TOKEN_URL;
    username = process.env.CDOGS_CLIENT_ID;
    password = process.env.CDOGS_CLIENT_SECRET;
  }

  const reqData = 'grant_type=client_credentials';

  const reqConfig: AxiosRequestConfig = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    auth: {
      username: username,
      password: password,
    },
  };

  const token = await lastValueFrom(
    httpService.post(tokenUrl, reqData, reqConfig),
  )
    .then((response) => {
      return response.data as GovCommonServicesToken;
    })
    .catch((error) => {
      console.log('Error: getCommonServiceAccessToken() ', error);
      throw new InternalServerErrorException();
    });

  token.expires_at = Date.now() + (token.expires_in - 15) * 1000;

  await cacheManager.set(GOV_COMMON_SERVICES_TOKEN, token);

  return token.access_token;
}
