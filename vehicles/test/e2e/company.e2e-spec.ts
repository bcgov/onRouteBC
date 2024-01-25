import * as request from 'supertest';
import { Test } from '@nestjs/testing';

import { getRepositoryToken } from '@nestjs/typeorm';
import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { DataSource, Repository } from 'typeorm';
import { Company } from '../../src/modules/company-user-management/company/entities/company.entity';
import { CompanyModule } from '../../src/modules/company-user-management/company/company.module';
import {
  COMPANY_LIST,
  createRedCompanyDtoMock,
  readRedCompanyDtoMock,
  readRedCompanyMetadataDtoMock,
  readRedCompanyUserDtoMock,
  redCompanyEntityMock,
  updateRedCompanyDtoMock,
} from '../util/mocks/data/company.mock';
import {
  createQueryBuilderMock,
  dataSourceMockFactory,
} from '../util/mocks/factory/dataSource.factory.mock';
import {
  redCompanyAdminUserJWTMock,
  sysAdminStaffUserJWTMock,
} from '../util/mocks/data/jwt.mock';
import { TestUserMiddleware } from './test-user.middleware';
import { AddressProfile } from '../../src/modules/common/profiles/address.profile';
import { ContactProfile } from '../../src/modules/common/profiles/contact.profile';
import { CompanyProfile } from '../../src/modules/company-user-management/company/profiles/company.profile';
import { UsersProfile } from '../../src/modules/company-user-management/users/profiles/user.profile';
import * as constants from '../util/mocks/data/test-data.constants';
import * as databaseHelper from 'src/common/helper/database.helper';
import { Cache } from 'cache-manager';
import { EmailService } from '../../src/modules/email/email.service';
import { HttpService } from '@nestjs/axios';
import { EmailModule } from '../../src/modules/email/email.module';
import { App } from 'supertest/types';
import { INestApplication } from '@nestjs/common';

let repo: DeepMocked<Repository<Company>>;
let emailService: DeepMocked<EmailService>;
let cacheManager: DeepMocked<Cache>;
let httpService: DeepMocked<HttpService>;

describe('Company (e2e)', () => {
  let app: INestApplication<Express.Application>;

  beforeAll(async () => {
    jest.clearAllMocks();
    repo = createMock<Repository<Company>>();
    emailService = createMock<EmailService>();
    cacheManager = createMock<Cache>();
    httpService = createMock<HttpService>();
    const dataSourceMock = dataSourceMockFactory() as DataSource;
    const moduleFixture = await Test.createTestingModule({
      imports: [
        CompanyModule.forRoot(dataSourceMock, cacheManager),
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
        EmailModule.forRoot(httpService, cacheManager),
      ],
      providers: [
        CompanyProfile,
        ContactProfile,
        AddressProfile,
        UsersProfile,
        { provide: EmailService, useValue: emailService },
      ],
    })
      .overrideProvider(getRepositoryToken(Company))
      .useValue(repo)
      .compile();

    app = moduleFixture.createNestApplication();
    TestUserMiddleware.testUser = redCompanyAdminUserJWTMock;
    app.use(TestUserMiddleware.prototype.use.bind(TestUserMiddleware));
    await app.init();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('/companies CREATE', () => {
    it('should create a new Company.', async () => {
      repo.findOne
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(redCompanyEntityMock);

      jest
        .spyOn(emailService, 'sendEmailMessage')
        .mockImplementation(async () => {
          return Promise.resolve('00000000-0000-0000-0000-000000000000');
        });
      jest
        .spyOn(databaseHelper, 'callDatabaseSequence')
        .mockImplementation(async () => {
          return Promise.resolve('000005');
        });
      const response = await request(app.getHttpServer() as unknown as App)
        .post('/companies')
        .send(createRedCompanyDtoMock)
        .expect(201);
      expect(response.body).toMatchObject(readRedCompanyUserDtoMock);
    });
  });

  describe('/companies/meta-data GETAll', () => {
    it('should return an array of company metadata associated with the user', async () => {
      const PARAMS = { userGUID: constants.RED_COMPANY_ADMIN_USER_GUID };
      findCompanywithParams(PARAMS);

      //console.log('testUser', TestUserMiddleware.testUser)
      console.log('GUID', constants.RED_COMPANY_ADMIN_USER_GUID)

      const response = await request(app.getHttpServer() as unknown as App)
        .get('/companies/meta-data')
        .expect(200);

      console.log('response', response)

      expect(response.body).toContainEqual(readRedCompanyMetadataDtoMock);
    });
    it('should throw a forbidden exception when user is not READ_ORG and userGUID is passed as Query Param', async () => {
      const PARAMS = { userGUID: constants.RED_COMPANY_ADMIN_USER_GUID };
      findCompanywithParams(PARAMS);

      TestUserMiddleware.testUser = redCompanyAdminUserJWTMock;
      

      await request(app.getHttpServer() as unknown as App)
        .get(
          '/companies/meta-data?userGUID=' +
            constants.RED_COMPANY_ADMIN_USER_GUID,
        )
        .expect(403);
    });
    it('should return an array of company metadata associated with the userGUID Query Param when logged in as Staff', async () => {
      const PARAMS = { userGUID: constants.RED_COMPANY_ADMIN_USER_GUID };
      findCompanywithParams(PARAMS);

      TestUserMiddleware.testUser = sysAdminStaffUserJWTMock;

      const response = await request(app.getHttpServer() as unknown as App)
        .get(
          '/companies/meta-data?userGUID=' +
            constants.RED_COMPANY_ADMIN_USER_GUID,
        )
        .expect(200);

      expect(response.body).toContainEqual(readRedCompanyMetadataDtoMock);
    });
  });

  describe('/companies/1 PUT', () => {
    it('should update the company and return the latest value.', async () => {
      repo.findOne.mockResolvedValue({
        ...redCompanyEntityMock,
        extension: null,
      });
      const response = await request(app.getHttpServer() as unknown as App)
        .put('/companies/1')
        .send(updateRedCompanyDtoMock)
        .expect(200);

      expect(response.body).toMatchObject({
        ...readRedCompanyDtoMock,
        extension: null,
      });
    });
  });

  describe('/companies/1 GET', () => {
    it('should return a company with companyId as 1.', async () => {
      repo.findOne.mockResolvedValue(redCompanyEntityMock);
      const response = await request(app.getHttpServer() as unknown as App)
        .get('/companies/1')
        .expect(200);

      expect(response.body).toMatchObject(readRedCompanyDtoMock);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
function findCompanywithParams(PARAMS: { userGUID: string }) {
  const FILTERED_LIST = COMPANY_LIST.filter(
    (r) => r.companyUsers[0].user.userGUID === PARAMS.userGUID,
  );
  jest
    .spyOn(repo, 'createQueryBuilder')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    .mockImplementation(() => createQueryBuilderMock(FILTERED_LIST));
}
