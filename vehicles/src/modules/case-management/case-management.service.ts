import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Case } from './entities/case.entity';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { IUserJWT } from '../../common/interface/user-jwt.interface';
import { Nullable } from '../../common/types/common';
import { LogAsyncMethodExecution } from '../../common/decorator/log-async-method-execution.decorator';
import { CaseType } from '../../common/enum/case-type.enum';
import { CaseStatusType } from '../../common/enum/case-status-type.enum';
import { Permit } from '../permit-application-payment/permit/entities/permit.entity';
import { CaseEvent } from './entities/case-event.entity';
import { CaseEventType } from '../../common/enum/case-event-type.enum';
import { User } from '../company-user-management/users/entities/user.entity';
import { throwUnprocessableEntityException } from '../../common/helper/exception.helper';
import {
  getQueryRunner,
  setBaseEntityProperties,
} from '../../common/helper/database.helper';
import { DataNotFoundException } from '../../common/exception/data-not-found.exception';
import { CaseActivity } from './entities/case-activity.entity';
import { CaseActivityType } from '../../common/enum/case-activity-type.enum';
import { CaseNotes } from './entities/case-notes.entity';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { ReadCaseEvenDto } from './dto/response/read-case-event.dto';
import { ReadCaseActivityDto } from './dto/response/read-case-activity.dto';
import { ReadCaseMetaDto } from './dto/response/read-case-meta.dto';

@Injectable()
export class CaseManagementService {
  private readonly logger = new Logger(CaseManagementService.name);
  constructor(
    @InjectMapper() private readonly classMapper: Mapper,
    private dataSource: DataSource,
    @InjectRepository(Case)
    private readonly caseRepository: Repository<Case>,
    @InjectRepository(CaseActivity)
    private readonly caseActivityRepository: Repository<CaseActivity>,
  ) {}

  /**
   * Creates a new case event instance and sets the base entity properties,
   * such as `eventDate` and `user`, using the provided `caseEntity`,
   * `caseEventType`, and `currentUser`.
   *
   * @param caseEntity - The `Case` entity to which the event is associated.
   * @param caseEventType - The type of event to log (e.g., OPENED, CLOSED).
   * @param currentUser - The current user performing the action, captured in the event.
   * @returns Returns a new `CaseEvent` object set with the given parameters.
   */
  private createEvent(
    caseEntity: Case,
    caseEventType: CaseEventType,
    currentUser: IUserJWT,
  ) {
    const newEvent = new CaseEvent();
    newEvent.case = caseEntity;
    newEvent.caseEventType = caseEventType;
    newEvent.eventDate = new Date();
    newEvent.user = new User();
    newEvent.user.userGUID = currentUser.userGUID;
    setBaseEntityProperties({ entity: newEvent, currentUser });
    return newEvent;
  }

  /**
   * Finds the latest `Case` entity based on a combination of `caseId`, `originalCaseId`, and `applicationId`.
   * If a matching case is found, it returns the existing case; otherwise, it returns `undefined`.
   *
   * @param queryRunner - Optional, an existing QueryRunner, typically part of a larger transaction.
   * @param caseId - Optional, the ID of the case to find.
   * @param originalCaseId - Optional, the original ID of the case to find.
   * @param applicationId - Optional, the ID of the permit associated with the case.
   * @returns A `Promise<Nullable<Case>>` which resolves to the latest matching `Case`, or `undefined` if not found.
   */
  @LogAsyncMethodExecution()
  async findLatest({
    queryRunner,
    caseId,
    originalCaseId,
    applicationId,
  }: {
    queryRunner: QueryRunner;
    caseId?: Nullable<number>;
    originalCaseId?: Nullable<number>;
    applicationId?: Nullable<string>;
  }) {
    return await queryRunner.manager.findOne(Case, {
      where: [
        { caseId: caseId },
        { originalCaseId: originalCaseId },
        { permit: { permitId: applicationId } },
      ],
      order: { caseId: { direction: 'DESC' } },
    });
  }

  /**
   * Opens a new case if an existing case with the same applicationId is closed.
   * This method checks if the existing case is closed, creates a new case, and then logs
   * an event indicating the case has been opened.
   *
   * @param currentUser - The current user executing the action.
   * @param queryRunner - Optional, existing QueryRunner instance.
   * @param applicationId - The ID of the permit associated with the new case.
   * @returns A `Promise<ReadCaseEvenDto>` object containing the event details of the opened case.
   * @throws `DataNotFoundException` - If the existing case is not closed, the operation will not proceed.
   */
  @LogAsyncMethodExecution()
  async openCase({
    currentUser,
    queryRunner,
    applicationId,
  }: {
    currentUser: IUserJWT;
    queryRunner?: Nullable<QueryRunner>;
    applicationId: string;
  }): Promise<ReadCaseEvenDto> {
    let localQueryRunner = true;
    ({ localQueryRunner, queryRunner } = await getQueryRunner({
      queryRunner,
      dataSource: this.dataSource,
    }));
    try {
      const existingCase = await this.findLatest({
        queryRunner,
        applicationId,
      });
      if (
        existingCase &&
        existingCase?.caseStatusType !== CaseStatusType.CLOSED
      ) {
        throwUnprocessableEntityException('Application in queue already.');
      }
      let newCase = new Case();
      newCase.caseType = CaseType.DEFAULT;
      newCase.caseStatusType = CaseStatusType.OPEN;
      newCase.permit = new Permit();
      newCase.permit.permitId = applicationId;
      newCase.previousCaseId = existingCase?.caseId;
      newCase.originalCaseId = existingCase?.originalCaseId;
      setBaseEntityProperties({ entity: newCase, currentUser });
      newCase = await queryRunner.manager.save<Case>(newCase);
      newCase.originalCaseId = newCase.originalCaseId ?? newCase.caseId;
      newCase = await queryRunner.manager.save<Case>(newCase);

      let newEvent = this.createEvent(
        newCase,
        CaseEventType.OPENED,
        currentUser,
      );
      newEvent = await queryRunner.manager.save<CaseEvent>(newEvent);
      if (localQueryRunner) {
        await queryRunner.commitTransaction();
      }
      return await this.classMapper.mapAsync(
        newEvent,
        CaseEvent,
        ReadCaseEvenDto,
      );
    } catch (error) {
      if (localQueryRunner) {
        await queryRunner.rollbackTransaction();
      }
      this.logger.error(error);
      throw error;
    } finally {
      if (localQueryRunner) {
        await queryRunner.release();
      }
    }
  }

  /**
   * Closes an existing case in the system by updating its status to `CLOSED`.
   * If no existing case is provided, it will attempt to load the case based on
   * the provided identifiers (caseId, originalCaseId, applicationId).
   * Also, ensures a new event is created to log this operation.
   *
   * @param currentUser - The current user executing the action.
   * @param queryRunner - Optional, existing QueryRunner instance.
   * @param caseId - Optional, the ID of the case to close.
   * @param originalCaseId - Optional, the original ID of the case.
   * @param applicationId - Optional, the ID of the permit associated with the case.
   * @param existingCase - Optional, the instance of the case to be closed.
   * @returns A `Promise<ReadCaseEvenDto>` object containing the event details of the closed case.
   * @throws `DataNotFoundException` - If case cannot be found or does not exist.
   * @throws `UnprocessableEntityException` - If the case is already closed.
   */
  @LogAsyncMethodExecution()
  async closeCase({
    currentUser,
    queryRunner,
    caseId,
    originalCaseId,
    applicationId,
    existingCase,
  }: {
    currentUser: IUserJWT;
    queryRunner?: Nullable<QueryRunner>;
    caseId?: Nullable<number>;
    originalCaseId?: Nullable<number>;
    applicationId?: Nullable<string>;
    existingCase?: Nullable<Case>;
  }): Promise<ReadCaseEvenDto> {
    let localQueryRunner = true;
    ({ localQueryRunner, queryRunner } = await getQueryRunner({
      queryRunner,
      dataSource: this.dataSource,
    }));
    try {
      if (!existingCase) {
        existingCase = await this.findLatest({
          queryRunner,
          caseId,
          originalCaseId,
          applicationId,
        });
      }
      if (!existingCase) {
        throw new DataNotFoundException();
      } else if (existingCase.caseStatusType === CaseStatusType.CLOSED) {
        throwUnprocessableEntityException('Application no longer available.');
      }

      existingCase.caseStatusType = CaseStatusType.CLOSED; //Rename to CaseStatusType
      setBaseEntityProperties({
        entity: existingCase,
        currentUser,
        update: true,
      });
      existingCase = await queryRunner.manager.save<Case>(existingCase);
      let newEvent = this.createEvent(
        existingCase,
        CaseEventType.CLOSED,
        currentUser,
      );
      newEvent = await queryRunner.manager.save<CaseEvent>(newEvent);

      if (localQueryRunner) {
        await queryRunner.commitTransaction();
      }
      return await this.classMapper.mapAsync(
        newEvent,
        CaseEvent,
        ReadCaseEvenDto,
      );
    } catch (error) {
      if (localQueryRunner) {
        await queryRunner.rollbackTransaction();
      }
      this.logger.error(error);
      throw error;
    } finally {
      if (localQueryRunner) {
        await queryRunner.release();
      }
    }
  }

  /**
   * Assigns a user to an existing case, updates the case's assigned user, and logs the assignment event.
   * If the case does not exist or is already closed, it throws appropriate exceptions. Optionally,
   * starts a workflow if the case is in an open state.
   *
   * @param currentUser - The current user executing the action.
   * @param queryRunner - Optional, existing QueryRunner instance.
   * @param caseId - Optional, the ID of the case to be assigned.
   * @param originalCaseId - Optional, the original ID of the case.
   * @param applicationId - Optional, the ID of the permit associated with the case.
   * @param existingCase - Optional, the existing `Case` entity to be assigned.
   * @returns A `Promise<ReadCaseEvenDto>` object containing the event details of the assignment.
   * @throws `DataNotFoundException` - If the case cannot be found or does not exist.
   * @throws `UnprocessableEntityException` - If the case is already closed.
   */
  @LogAsyncMethodExecution()
  async assignCase({
    currentUser,
    queryRunner,
    caseId,
    originalCaseId,
    applicationId,
    existingCase,
  }: {
    currentUser: IUserJWT;
    queryRunner?: Nullable<QueryRunner>;
    caseId?: Nullable<number>;
    originalCaseId?: Nullable<number>;
    applicationId?: Nullable<string>;
    existingCase?: Nullable<Case>;
  }): Promise<ReadCaseEvenDto> {
    let localQueryRunner = true;
    ({ localQueryRunner, queryRunner } = await getQueryRunner({
      queryRunner,
      dataSource: this.dataSource,
    }));
    try {
      if (!existingCase) {
        existingCase = await this.findLatest({
          queryRunner,
          caseId,
          originalCaseId,
          applicationId,
        });
      }
      if (!existingCase) {
        throw new DataNotFoundException();
      } else if (existingCase.caseStatusType === CaseStatusType.CLOSED) {
        throwUnprocessableEntityException('Application no longer available.');
      }

      existingCase.assignedUser = new User();
      existingCase.assignedUser.userGUID = currentUser.userGUID; //TODO: In future, get the userGuid in request payload
      setBaseEntityProperties({
        entity: existingCase,
        currentUser,
        update: true,
      });
      existingCase = await queryRunner.manager.save<Case>(existingCase);

      let newEvent = this.createEvent(
        existingCase,
        CaseEventType.ASSIGNED,
        currentUser,
      );
      newEvent = await queryRunner.manager.save<CaseEvent>(newEvent);
      if (existingCase.caseStatusType === CaseStatusType.OPEN) {
        await this.workflowStart({
          currentUser,
          queryRunner,
          existingCase,
        });
      }
      if (localQueryRunner) {
        await queryRunner.commitTransaction();
      }
      return await this.classMapper.mapAsync(
        newEvent,
        CaseEvent,
        ReadCaseEvenDto,
      );
    } catch (error) {
      if (localQueryRunner) {
        await queryRunner.rollbackTransaction();
      }
      this.logger.error(error);
      throw error;
    } finally {
      if (localQueryRunner) {
        await queryRunner.release();
      }
    }
  }

  /**
   * Retrieves metadata for an existing case, ensuring it is available and in an acceptable state.
   * If the case does not exist or is already closed, it throws appropriate exceptions.
   *
   * @param queryRunner - Optional, existing QueryRunner instance.
   * @param caseId - Optional, the ID of the case to be queried.
   * @param originalCaseId - Optional, the original ID of the case.
   * @param applicationId - Optional, the ID of the permit associated with the case.
   * @param existingCase - Optional, the existing `Case` entity to be queried.
   * @returns A `Promise<ReadCaseMetaDto>` object containing the metadata details of the case.
   * @throws `DataNotFoundException` - If the case cannot be found or does not exist.
   * @throws `UnprocessableEntityException` - If the case is already closed.
   */
  @LogAsyncMethodExecution()
  async getCaseMetadata({
    queryRunner,
    caseId,
    originalCaseId,
    applicationId,
    existingCase,
  }: {
    queryRunner?: Nullable<QueryRunner>;
    caseId?: Nullable<number>;
    originalCaseId?: Nullable<number>;
    applicationId?: Nullable<string>;
    existingCase?: Nullable<Case>;
  }): Promise<ReadCaseMetaDto> {
    let localQueryRunner = true;
    ({ localQueryRunner, queryRunner } = await getQueryRunner({
      queryRunner,
      dataSource: this.dataSource,
    }));
    try {
      if (!existingCase) {
        existingCase = await this.findLatest({
          queryRunner,
          caseId,
          originalCaseId,
          applicationId,
        });
      }
      if (!existingCase) {
        throw new DataNotFoundException();
      } else if (existingCase.caseStatusType === CaseStatusType.CLOSED) {
        throwUnprocessableEntityException('Application no longer available.');
      }

      if (localQueryRunner) {
        await queryRunner.commitTransaction();
      }
      return await this.classMapper.mapAsync(
        existingCase,
        Case,
        ReadCaseMetaDto,
      );
    } catch (error) {
      if (localQueryRunner) {
        await queryRunner.rollbackTransaction();
      }
      this.logger.error(error);
      throw error;
    } finally {
      if (localQueryRunner) {
        await queryRunner.release();
      }
    }
  }

  /**
   * Starts the workflow for an existing case by changing its status to `IN_PROGRESS`.
   * It first retrieves or verifies the existence of the `Case` based on provided identifiers.
   * If the case does not exist or is closed, an appropriate exception is thrown.
   * On successful execution, the method logs the workflow start event.
   *
   * @param currentUser - The current user executing the action.
   * @param queryRunner - Optional, existing QueryRunner instance.
   * @param caseId - Optional, the ID of the case.
   * @param originalCaseId - Optional, the original ID of the case.
   * @param applicationId - Optional, the ID of the permit associated with the case.
   * @param existingCase - Optional, the existing `Case` entity. If not provided, it will be retrieved.
   * @returns A `Promise<ReadCaseEvenDto>` object containing the event details of the started workflow.
   * @throws `DataNotFoundException` - If the case cannot be found or does not exist.
   * @throws `UnprocessableEntityException` - If the case is already closed or not open.
   */
  @LogAsyncMethodExecution()
  async workflowStart({
    currentUser,
    queryRunner,
    caseId,
    originalCaseId,
    applicationId,
    existingCase,
  }: {
    currentUser: IUserJWT;
    queryRunner?: Nullable<QueryRunner>;
    caseId?: Nullable<number>;
    originalCaseId?: Nullable<number>;
    applicationId?: Nullable<string>;
    existingCase?: Nullable<Case>;
  }): Promise<ReadCaseEvenDto> {
    let localQueryRunner = true;
    ({ localQueryRunner, queryRunner } = await getQueryRunner({
      queryRunner,
      dataSource: this.dataSource,
    }));
    try {
      if (!existingCase) {
        existingCase = await this.findLatest({
          queryRunner,
          caseId,
          originalCaseId,
          applicationId,
        });
      }
      if (!existingCase) {
        throw new DataNotFoundException();
      } else if (existingCase.caseStatusType !== CaseStatusType.OPEN) {
        throwUnprocessableEntityException('Application no longer available.');
      }

      existingCase.caseStatusType = CaseStatusType.IN_PROGRESS;
      setBaseEntityProperties({
        entity: existingCase,
        currentUser,
        update: true,
      });
      existingCase = await queryRunner.manager.save<Case>(existingCase);

      let newEvent = this.createEvent(
        existingCase,
        CaseEventType.WORKFLOW_STARTED,
        currentUser,
      );
      newEvent = await queryRunner.manager.save<CaseEvent>(newEvent);

      if (localQueryRunner) {
        await queryRunner.commitTransaction();
      }
      return await this.classMapper.mapAsync(
        newEvent,
        CaseEvent,
        ReadCaseEvenDto,
      );
    } catch (error) {
      if (localQueryRunner) {
        await queryRunner.rollbackTransaction();
      }
      this.logger.error(error);
      throw error;
    } finally {
      if (localQueryRunner) {
        await queryRunner.release();
      }
    }
  }

  /**
   * Completes the workflow for an existing case by changing its status from `IN_PROGRESS` to `CLOSED`.
   * It checks the current status of the case, creates any necessary notes, logs the workflow completion event,
   * and saves the corresponding activities. If the case is already closed or not in progress, appropriate
   * exceptions are thrown.
   *
   * @param currentUser - The current user executing the action.
   * @param queryRunner - Optional, existing QueryRunner instance.
   * @param caseId - Optional, the ID of the case.
   * @param originalCaseId - Optional, the original ID of the case.
   * @param applicationId - Optional, the ID of the permit associated with the case.
   * @param existingCase - Optional, the existing `Case` entity. If not provided, it will be retrieved.
   * @param caseActivityType - The type of case activity to log.
   * @param comment - Optional, a comment to add as notes during this workflow.
   * @returns A `Promise<ReadCaseEvenDto>` object containing the event details of the completed workflow.
   * @throws `DataNotFoundException` - If the case cannot be found or does not exist.
   * @throws `UnprocessableEntityException` - If the case is already closed or is not in progress.
   */
  @LogAsyncMethodExecution()
  async workflowEnd({
    currentUser,
    queryRunner,
    caseId,
    originalCaseId,
    applicationId,
    existingCase,
    caseActivityType,
    comment,
  }: {
    currentUser: IUserJWT;
    queryRunner?: Nullable<QueryRunner>;
    caseId?: Nullable<number>;
    originalCaseId?: Nullable<number>;
    applicationId?: Nullable<string>;
    existingCase?: Nullable<Case>;
    caseActivityType: CaseActivityType;
    comment?: Nullable<string>;
  }): Promise<ReadCaseEvenDto> {
    let localQueryRunner = true;
    ({ localQueryRunner, queryRunner } = await getQueryRunner({
      queryRunner,
      dataSource: this.dataSource,
    }));
    try {
      if (!existingCase) {
        existingCase = await this.findLatest({
          queryRunner,
          caseId,
          originalCaseId,
          applicationId,
        });
      }
      if (!existingCase) {
        throw new DataNotFoundException();
      } else if (existingCase.assignedUser?.userGUID !== currentUser.userGUID) {
        throwUnprocessableEntityException(
          `Application no longer available. This application is claimed by ${existingCase.assignedUser?.userName}`,
        );
      } else if (existingCase.caseStatusType !== CaseStatusType.IN_PROGRESS) {
        throwUnprocessableEntityException('Application no longer available.');
      }

      let caseNotes: CaseNotes;
      if (comment) {
        caseNotes = await this.addNotes({
          currentUser,
          queryRunner,
          existingCase,
          comment,
        });
      }

      let newEvent = this.createEvent(
        existingCase,
        CaseEventType.WORKFLOW_COMPLETED,
        currentUser,
      );
      newEvent = await queryRunner.manager.save<CaseEvent>(newEvent);

      const newActivity = new CaseActivity();
      newActivity.case = existingCase;
      newActivity.caseEvent = newEvent;
      newActivity.caseActivityType = caseActivityType;
      newActivity.dateTime = new Date();
      newActivity.user = new User();
      newActivity.user.userGUID = currentUser.userGUID;
      setBaseEntityProperties({ entity: newActivity, currentUser });
      if (comment) {
        newActivity.caseNotes = caseNotes;
      }
      await queryRunner.manager.save<CaseActivity>(newActivity);

      if (existingCase.caseStatusType === CaseStatusType.IN_PROGRESS) {
        await this.closeCase({
          currentUser,
          queryRunner,
          existingCase,
        });
      }

      if (localQueryRunner) {
        await queryRunner.commitTransaction();
      }
      return await this.classMapper.mapAsync(
        newEvent,
        CaseEvent,
        ReadCaseEvenDto,
      );
    } catch (error) {
      if (localQueryRunner) {
        await queryRunner.rollbackTransaction();
      }
      this.logger.error(error);
      throw error;
    } finally {
      if (localQueryRunner) {
        await queryRunner.release();
      }
    }
  }

  /**
   * Withdraws an existing case by first ensuring the current case status is valid for withdrawal.
   * If the case has already been closed or is in progress, an appropriate exception is thrown.
   * The method creates a withdrawal event, logs the withdrawal activity, and finally closes the case.
   *
   * @param currentUser - The current user executing the withdrawal action.
   * @param queryRunner - Optional, existing QueryRunner instance used in the transaction process.
   * @param caseId - Optional, the ID of the case to be withdrawn. Can be used to retrieve the existing case.
   * @param originalCaseId - Optional, the original ID of the case to be withdrawn. Useful in lookup scenarios.
   * @param applicationId - Optional, the ID of the permit application associated with the case.
   * @param existingCase - Optional, the pre-loaded `Case` entity, if provided, will be used directly.
   * @returns A `Promise<ReadCaseEvenDto>` object containing the event details of the withdrawn case.
   * @throws `DataNotFoundException` - If the case cannot be found or does not exist.
   * @throws `UnprocessableEntityException` - If the case is already closed or in progress.
   */
  @LogAsyncMethodExecution()
  async caseWithdrawn({
    currentUser,
    queryRunner,
    caseId,
    originalCaseId,
    applicationId,
    existingCase,
  }: {
    currentUser: IUserJWT;
    queryRunner?: Nullable<QueryRunner>;
    caseId?: Nullable<number>;
    originalCaseId?: Nullable<number>;
    applicationId?: Nullable<string>;
    existingCase?: Nullable<Case>;
  }): Promise<ReadCaseEvenDto> {
    let localQueryRunner = true;
    ({ localQueryRunner, queryRunner } = await getQueryRunner({
      queryRunner,
      dataSource: this.dataSource,
    }));
    try {
      if (!existingCase) {
        existingCase = await this.findLatest({
          queryRunner,
          caseId,
          originalCaseId,
          applicationId,
        });
      }
      if (!existingCase) {
        throw new DataNotFoundException();
      } else if (existingCase.caseStatusType !== CaseStatusType.OPEN) {
        throwUnprocessableEntityException(
          'Application Status Application(s) have either been withdrawn or are in review by the Provincial Permit Centre.',
        );
      }

      let newEvent = this.createEvent(
        existingCase,
        CaseEventType.CASE_WITHDRAWN,
        currentUser,
      );
      newEvent = await queryRunner.manager.save<CaseEvent>(newEvent);

      const newActivity = new CaseActivity();
      newActivity.case = existingCase;
      newActivity.caseEvent = newEvent;
      newActivity.caseActivityType = CaseActivityType.WITHDRAWN;
      newActivity.dateTime = new Date();
      newActivity.user = new User();
      newActivity.user.userGUID = currentUser.userGUID;
      setBaseEntityProperties({ entity: newActivity, currentUser });
      await queryRunner.manager.save<CaseActivity>(newActivity);

      await this.closeCase({
        currentUser,
        queryRunner,
        existingCase,
      });

      if (localQueryRunner) {
        await queryRunner.commitTransaction();
      }
      return await this.classMapper.mapAsync(
        newEvent,
        CaseEvent,
        ReadCaseEvenDto,
      );
    } catch (error) {
      if (localQueryRunner) {
        await queryRunner.rollbackTransaction();
      }
      this.logger.error(error);
      throw error;
    } finally {
      if (localQueryRunner) {
        await queryRunner.release();
      }
    }
  }

  /**
   * Adds a note to an existing case by creating a new `CaseEvent` and `CaseNotes` record.
   * If an existing case is not provided, it attempts to find one using the provided
   * case identifiers (`caseId`, `originalCaseId`, `applicationId`). Ensures that only cases
   * with an 'IN_PROGRESS' status can have notes added; otherwise, an exception is thrown.
   *
   * @param currentUser - The current user executing the action.
   * @param queryRunner - Optional, existing QueryRunner instance.
   * @param caseId - Optional, the ID of the case to retrieve if `existingCase` is not provided.
   * @param originalCaseId - Optional, the original ID of the case to retrieve.
   * @param applicationId - Optional, the ID of the permit associated with the case.
   * @param existingCase - Optional, the instance of the case to which the note will be added.
   * @param comment - Optional, the comment content of the note.
   * @returns A `Promise<CaseNotes>` object containing the details of the added note.
   * @throws `DataNotFoundException` - If the case cannot be found or does not exist.
   * @throws `UnprocessableEntityException` - If the case is closed or not in progress.
   */
  @LogAsyncMethodExecution()
  async addNotes({
    currentUser,
    queryRunner,
    caseId,
    originalCaseId,
    applicationId,
    existingCase,
    comment,
  }: {
    currentUser: IUserJWT;
    queryRunner?: Nullable<QueryRunner>;
    caseId?: Nullable<number>;
    originalCaseId?: Nullable<number>;
    applicationId?: Nullable<string>;
    existingCase?: Nullable<Case>;
    comment?: Nullable<string>;
  }): Promise<CaseNotes> {
    let localQueryRunner = true;
    ({ localQueryRunner, queryRunner } = await getQueryRunner({
      queryRunner,
      dataSource: this.dataSource,
    }));
    if (!existingCase) {
      existingCase = await queryRunner.manager.findOne(Case, {
        where: [
          { caseId: caseId },
          { originalCaseId: originalCaseId },
          { permit: { permitId: applicationId } },
        ],
        order: { caseId: { direction: 'DESC' } },
      });
    }
    if (!existingCase) {
      throw new DataNotFoundException();
    } else if (existingCase.caseStatusType !== CaseStatusType.IN_PROGRESS) {
      throwUnprocessableEntityException('Application no longer available.');
    }
    try {
      let newEvent = this.createEvent(
        existingCase,
        CaseEventType.NOTE_CREATED,
        currentUser,
      );
      newEvent = await queryRunner.manager.save<CaseEvent>(newEvent);

      let newCaseNotes = new CaseNotes();
      newCaseNotes.case = existingCase;
      newCaseNotes.caseEvent = newEvent;
      newCaseNotes.comment = comment;
      newCaseNotes.user = new User();
      newCaseNotes.user.userGUID = currentUser.userGUID;
      newCaseNotes.notesDate = new Date();
      setBaseEntityProperties({ entity: newCaseNotes, currentUser });

      newCaseNotes = await queryRunner.manager.save<CaseNotes>(newCaseNotes);

      if (localQueryRunner) {
        await queryRunner.commitTransaction();
      }

      return newCaseNotes;
    } catch (error) {
      if (localQueryRunner) {
        await queryRunner.rollbackTransaction();
      }
      this.logger.error(error);
      throw error;
    } finally {
      if (localQueryRunner) {
        await queryRunner.release();
      }
    }
  }

  /**
   * The method creates a notification event.
   *
   * @param currentUser - The current user executing the withdrawal action.
   * @param queryRunner - Optional, existing QueryRunner instance used in the transaction process.
   * @param caseId - Optional, the ID of the case to be withdrawn. Can be used to retrieve the existing case.
   * @param originalCaseId - Optional, the original ID of the case to be withdrawn. Useful in lookup scenarios.
   * @param applicationId - Optional, the ID of the permit application associated with the case.
   * @param existingCase - Optional, the pre-loaded `Case` entity, if
   */
  @LogAsyncMethodExecution()
  async createNotificationEvent({
    currentUser,
    queryRunner,
    caseId,
    originalCaseId,
    applicationId,
    existingCase,
  }: {
    currentUser: IUserJWT;
    queryRunner?: Nullable<QueryRunner>;
    caseId?: Nullable<number>;
    originalCaseId?: Nullable<number>;
    applicationId?: Nullable<string>;
    existingCase?: Nullable<Case>;
  }): Promise<ReadCaseEvenDto> {
    let localQueryRunner = true;
    ({ localQueryRunner, queryRunner } = await getQueryRunner({
      queryRunner,
      dataSource: this.dataSource,
    }));
    try {
      if (!existingCase) {
        existingCase = await this.findLatest({
          queryRunner,
          caseId,
          originalCaseId,
          applicationId,
        });
      }

      let newEvent = this.createEvent(
        existingCase,
        CaseEventType.NOTIFICATION,
        currentUser,
      );
      newEvent = await queryRunner.manager.save<CaseEvent>(newEvent);

      if (localQueryRunner) {
        await queryRunner.commitTransaction();
      }
      return await this.classMapper.mapAsync(
        newEvent,
        CaseEvent,
        ReadCaseEvenDto,
      );
    } catch (error) {
      if (localQueryRunner) {
        await queryRunner.rollbackTransaction();
      }
      this.logger.error(error);
      throw error;
    } finally {
      if (localQueryRunner) {
        await queryRunner.release();
      }
    }
  }

  /**
   * Retrieves the activity history for a specific case by fetching and mapping `CaseActivity` records.
   * Filters are applied based on the permit's `applicationId` and the specified `caseActivityType`.
   * Joins additional details, including user information and associated case notes, for each activity.
   *
   * @param currentUser - The current user executing the action.
   * @param applicationId - The ID of the permit associated with the case.
   * @param caseActivityType - The type of case activity to filter.
   * @returns A `Promise<ReadCaseActivityDto[]>` containing the list of activities for the specified case.
   */
  @LogAsyncMethodExecution()
  async fetchActivityHistory({
    currentUser,
    applicationId,
    caseActivityType,
  }: {
    currentUser: IUserJWT;
    applicationId: Nullable<string>;
    caseActivityType: CaseActivityType;
  }): Promise<ReadCaseActivityDto[]> {
    const caseActivity = await this.caseActivityRepository
      .createQueryBuilder('caseActivity')
      .innerJoinAndSelect('caseActivity.user', 'user')
      .leftJoinAndSelect('caseActivity.caseNotes', 'caseNotes')
      .innerJoinAndSelect('caseActivity.case', 'case')
      .innerJoinAndSelect('case.permit', 'permit')
      .where('permit.id = :applicationId', { applicationId })
      .andWhere('caseActivity.caseActivityType = :caseActivityType', {
        caseActivityType,
      })
      .orderBy('caseActivity.dateTime', 'DESC')
      .getMany();

    const caseActivityDto = await this.classMapper.mapArrayAsync(
      caseActivity,
      CaseActivity,
      ReadCaseActivityDto,
      {
        extraArgs: () => ({
          currentUser: currentUser,
        }),
      },
    );

    return caseActivityDto;
  }
}
