import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { getSFTPConnectionInfo } from 'src/common/helper/sftp.helper';
import * as Client from 'ssh2-sftp-client';

@Injectable()
export class CgiSftpService {
  private readonly logger = new Logger(CgiSftpService.name);

  async upload(fileData: Express.Multer.File, fileName: string) {
    const sftp = new Client();
    const connectionInfo: Client.ConnectOptions = getSFTPConnectionInfo();
    const remotePath = process.env.CFS_REMOTE_PATH; //Remote CFS Path

    try {
      await sftp.connect(connectionInfo);
      this.logger.log(
        `Successfully connected to ${process.env.CFS_SFTP_HOST} via SFTP.`,
      );
    } catch (error) {
      this.logger.error('Cannot connect to sftp.');
      this.logger.error(error);
    }
    try {
      const res = await sftp.put(fileData.buffer, remotePath + fileName);
      this.logger.log(`Successfully sent file ${fileName} via SFTP.`);
      return res;
    } catch (error) {
      this.logger.error('Failed to send file via SFTP.');
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to send file via SFTP.');
    } finally {
      this.logger.log('closing connection');
      void sftp.end();
    }
  }
}
