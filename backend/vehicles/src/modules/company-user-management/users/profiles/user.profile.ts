import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import {
  createMap,
  forMember,
  forSelf,
  fromValue,
  ignore,
  mapFrom,
  Mapper,
  mapWithArguments,
} from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { CreateContactDto } from '../../../common/dto/request/create-contact.dto';
import { Contact } from '../../../common/entities/contact.entity';
import { CreateUserDto } from '../dto/request/create-user.dto';
import { ReadUserDto } from '../dto/response/read-user.dto';
import { UpdateUserDto } from '../dto/request/update-user.dto';
import { IdirUser } from '../entities/idir.user.entity';
import { ReadUserOrbcStatusDto } from '../dto/response/read-user-orbc-status.dto';
import { ReadPendingUserDto } from '../../pending-users/dto/response/read-pending-user.dto';

@Injectable()
export class UsersProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      /**
       * The mapping is between CreateUserDto to User mapping. In the mapping,
       * there are four forMember calls. The first one maps the userGUID
       * property of the destination object to a generated UUID using the
       * tempUserGuid function (which will be removed once login has been
       * implemented). The remaining forMember calls map the userName,
       * directory, and userContact properties of the destination object to
       * properties of the source object using mapWithArguments or mapFrom.
       */
      createMap(
        mapper,
        CreateUserDto,
        User,
        forMember(
          (d) => d.userGUID,
          mapWithArguments((source, { userGUID }) => {
            return userGUID;
          }),
        ),
        forMember(
          (d) => d.userName,
          mapWithArguments((source, { userName }) => {
            return userName;
          }),
        ),
        forMember(
          (d) => d.directory,
          mapWithArguments((source, { directory }) => {
            return directory;
          }),
        ),
        forMember(
          (d) => d.createdUserGuid,
          mapWithArguments((source, { userGUID }) => {
            return userGUID;
          }),
        ),
        forMember(
          (d) => d.createdUser,
          mapWithArguments((source, { userName }) => {
            return userName;
          }),
        ),
        forMember(
          (d) => d.createdUserDirectory,
          mapWithArguments((source, { directory }) => {
            return directory;
          }),
        ),

        forMember(
          (d) => d.createdDateTime,
          mapWithArguments((source, { timestamp }) => {
            return timestamp;
          }),
        ),

        forMember(
          (d) => d.upatedUserGuid,
          mapWithArguments((source, { userGUID }) => {
            return userGUID;
          }),
        ),
        forMember(
          (d) => d.updatedUser,
          mapWithArguments((source, { userName }) => {
            return userName;
          }),
        ),
        forMember(
          (d) => d.updatedUserDirectory,
          mapWithArguments((source, { directory }) => {
            return directory;
          }),
        ),

        forMember(
          (d) => d.updatedDateTime,
          mapWithArguments((source, { timestamp }) => {
            return timestamp;
          }),
        ),
        forMember(
          (d) => d.userContact,
          mapFrom((s) => {
            return this.mapper.map(s, CreateContactDto, Contact);
          }),
        ),
      );

      /**
       * The mapping is between UpdateUserDto to User mapping.
       */
      createMap(
        mapper,
        UpdateUserDto,
        User,
        forMember(
          (d) => d.userGUID,
          mapWithArguments((source, { userGUID }) => {
            return userGUID;
          }),
        ),
        forMember(
          (d) => d.upatedUserGuid,
          mapWithArguments((source, { userGUID }) => {
            return userGUID;
          }),
        ),
        forMember(
          (d) => d.updatedUser,
          mapWithArguments((source, { userName }) => {
            return userName;
          }),
        ),
        forMember(
          (d) => d.updatedUserDirectory,
          mapWithArguments((source, { directory }) => {
            return directory;
          }),
        ),
        forMember(
          (d) => d.updatedDateTime,
          mapWithArguments((source, { timestamp }) => {
            return timestamp;
          }),
        ),
        forMember(
          (d) => d.userContact,
          mapFrom((s) => {
            return this.mapper.map(s, CreateContactDto, Contact);
          }),
        ),
        forMember((d) => d.userAuthGroup, ignore()),
      );

      /**
       * The mapping is between User to ReadUserDto mapping. In the mapping
       * there are two forMember calls. These map the userGUID,  and userName
       * properties of the source object to properties of the destination object
       * using mapFrom. forSelf flattens the userContacts and maps to
       * ReadUserDto
       */
      createMap(
        mapper,
        User,
        ReadUserDto,
        forMember(
          (d) => d.userName,
          mapFrom((s) => s.userName),
        ),
        forSelf(Contact, (source) => source.userContact),
        forMember(
          (d) => d.userAuthGroup,
          mapFrom((s) => {
            if (s.companyUsers?.length && s.companyUsers[0]?.userAuthGroup) {
              //the logic to be revisited if the application decide to support
              //one user id multiple companies
              return s.companyUsers[0]?.userAuthGroup;
            } else {
              return s.userAuthGroup;
            }
          }),
        ),
        forMember(
          (d) => d.phone1Extension,
          mapFrom((s) => s.userContact.extension1),
        ),

        forMember(
          (d) => d.phone2Extension,
          mapFrom((s) => s.userContact.extension2),
        ),
        forMember(
          (d) => d.provinceCode,
          mapFrom((s) => s.userContact?.province?.provinceCode),
        ),
        forMember(
          (d) => d.countryCode,
          mapFrom((s) => s.userContact?.province?.country?.countryCode),
        ),
      );

      /**
       * The mapping is between IdirUser to ReadUserDto mapping.
       */
      createMap(
        mapper,
        IdirUser,
        ReadUserDto,
        forMember(
          (d) => d.userName,
          mapFrom((s) => s.userName),
        ),
        forMember(
          (d) => d.userGUID,
          mapFrom((s) => s.userGUID),
        ),
        forMember(
          (d) => d.userAuthGroup,
          mapFrom((s) => s.userAuthGroup),
        ),
        forMember(
          (d) => d.statusCode,
          mapFrom((s) => s.statusCode),
        ),
      );

      /**
       * The mapping is between IdirUser to ReadUserOrbcStatusDto mapping.
       */
      createMap(
        mapper,
        IdirUser,
        ReadUserOrbcStatusDto,
        forMember(
          (d) => d.user.firstName,
          mapFrom((s) => s.userName),
        ),
        forMember(
          (d) => d.user.lastName,
          mapFrom((s) => s.lastName),
        ),
        forMember(
          (d) => d.user.email,
          mapFrom((s) => s.email),
        ),
        forMember(
          (d) => d.user.userName,
          mapFrom((s) => s.userName),
        ),
        forMember(
          (d) => d.user.userGUID,
          mapFrom((s) => s.userGUID),
        ),
        forMember(
          (d) => d.user.userAuthGroup,
          mapFrom((s) => s.userAuthGroup),
        ),
        forMember(
          (d) => d.user.statusCode,
          mapFrom((s) => s.statusCode),
        ),
      );

      createMap(
        mapper,
        ReadPendingUserDto,
        ReadUserDto,
        forMember((d) => d.statusCode, fromValue('PENDING')),
      );
    };
  }
}
