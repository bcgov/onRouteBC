import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiMethodNotAllowedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { Permissions } from '../../decorator/permissions.decorator';
import { DmsService } from '../dms/dms.service';
import { IUserJWT } from '../../interface/user-jwt.interface';
import { FileDownloadModes } from '../../enum/file-download-modes.enum';
import { IChesAttachment } from '../../interface/attachment.ches.interface';
import { createFile } from '../../helper/file.helper';
import { FILE_ENCODING_TYPE } from '../../constants/dops.constant';
import { NotificationService } from './notification.service';
import { ExceptionDto } from '../../exception/exception.dto';
import { NotificationDocumentDto } from './dto/request/notification-document.dto';
import { NotificationDto } from './dto/request/notification.dto';
import { JwtOneOfAuthGuard } from '../../guard/jwt-one-of-auth.guard';
import {
  CLIENT_USER_ROLE_LIST,
  IDIR_USER_ROLE_LIST,
} from '../../enum/user-role.enum';

@ApiBearerAuth()
@ApiBadRequestResponse({
  description: 'Bad Request Response',
  type: ExceptionDto,
})
@ApiNotFoundResponse({
  description: 'The Notification Api Not Found Response',
  type: ExceptionDto,
})
@ApiMethodNotAllowedResponse({
  description: 'The Notification Api Method Not Allowed Response',
  type: ExceptionDto,
})
@ApiInternalServerErrorResponse({
  description: 'The Notification Api Internal Server Error Response',
  type: ExceptionDto,
})
@ApiTags('Notifications')
@Controller('notification')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly dmsService: DmsService,
  ) {}

  /**
   * Sends an notification with document attachments to a specified recipient.
   *
   * @param req The current user request object, containing user details.
   * @param notificationDocumentDto The data transfer object containing notification details such as subject, recipient(s), template name, data for the template, and IDs of documents to attach.
   * @returns A success message and the transaction ID of the sent notification.
   */
  @ApiOperation({
    summary: 'Send Notification with Document Attachments',
    description:
      'Processes and sends an notification with specified documents as attachments to the given recipient(s), and returns a transaction ID for the operation.',
  })
  @UseGuards(JwtOneOfAuthGuard)
  @Post('/document')
  @Permissions({
    allowedBCeIDRoles: CLIENT_USER_ROLE_LIST,
    allowedIdirRoles: IDIR_USER_ROLE_LIST,
  })
  async notificationWithDocumentsFromDops(
    @Req() req: Request,
    @Body() notificationDocumentDto: NotificationDocumentDto,
  ) {
    let attachments: IChesAttachment[];
    // Retrieves the current user details from the request
    const currentUser = req.user as IUserJWT;
    // Destructures the required fields from the NotificationDocumentDto
    const { subject, to, cc, bcc, templateName, data, documentIds } =
      notificationDocumentDto;

    // Processes document IDs to attach them to the notification
    if (documentIds?.length) {
      attachments = await Promise.all(
        documentIds.map(async (documentId) => {
          // Downloads the document specified by documentId for the current user
          const { file, s3Object } = await this.dmsService.download(
            currentUser,
            documentId,
            FileDownloadModes.PROXY,
            undefined,
            currentUser.companyId,
          );
          // Converts the downloaded content to the specified file encoding type
          const content = (await createFile(s3Object)).toString(
            FILE_ENCODING_TYPE,
          );
          // Returns the attachment configuration for each document
          return {
            contentType: file.objectMimeType,
            encoding: FILE_ENCODING_TYPE,
            filename: file.fileName,
            content: content,
          };
        }),
      );
    }

    // Sends the email notification with attachments and returns the transaction ID
    const emailTransactionId = await this.notificationService.sendEmailMessage(
      templateName,
      data,
      subject,
      to,
      false,
      attachments,
      cc,
      bcc,
    );

    // Returns a success message and the transaction ID of the sent notification
    return {
      message: 'Notification sent successfully.',
      emailTransactionId: emailTransactionId,
    };
  }

  /**
   * Sends a simple notification without document attachments to a specified recipient.
   *
   * @param req The current user request object, containing user details.
   * @param notificationDocumentDto The data transfer object containing notification details such as subject, recipients, template name, and data for the template.
   * @returns A success message and the transaction ID of the sent notification.
   */
  @ApiOperation({
    summary: 'Send Simple Notification',
    description:
      'Sends a simple notification using the specified template to the given recipient(s), and returns a transaction ID for the operation.',
  })
  @Post()
  @Permissions({
    allowedBCeIDRoles: CLIENT_USER_ROLE_LIST,
    allowedIdirRoles: IDIR_USER_ROLE_LIST,
  })
  async notificationWithoutDocument(
    @Req() req: Request,
    @Body() notificationDocumentDto: NotificationDto,
  ) {
    // Destructures the required fields from the NotificationDocumentDto
    const { subject, to, cc, bcc, templateName, data } =
      notificationDocumentDto;

    // Sends the notification with attachments and returns the transaction ID
    const transactionId = await this.notificationService.sendEmailMessage(
      templateName,
      data,
      subject,
      to,
      false,
      null,
      cc,
      bcc,
    );

    // Returns a success message and the transaction ID of the sent notification
    return {
      message: 'Notification sent successfully.',
      transactionId: transactionId,
    };
  }
}
