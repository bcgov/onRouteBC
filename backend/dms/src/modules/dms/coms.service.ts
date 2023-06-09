/**
 * Service responsible for interacting with COMS (Content Object Management
 * System).
 */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ReadCOMSDto } from './dto/response/read-coms.dto';
import { ReadFileDto } from './dto/response/read-file.dto';
import { IFile } from '../../common/interface/file.interface';
import { Response } from 'express';
import { FileDownloadModes } from '../../common/enum/file-download-modes.enum';
import { lastValueFrom, map } from 'rxjs';
import { Stream } from 'stream';

@Injectable()
export class ComsService {
  constructor(private readonly httpService: HttpService) {}

  /**
   * Creates an object in COMS.
   * @param file - The file to be uploaded. It can be either an
   *               {@link Express.Multer.File} object or an
   *               {@link IFile} object.
   * @returns A Promise that resolves to an array of ReadCOMSDto
   *          objects
   *           representing the created objects.
   */
  async createObject(
    file: Express.Multer.File | IFile,
    s3ObjectId?: string,
  ): Promise<ReadCOMSDto[]> {
    // Extract necessary properties from the file
    const { buffer, originalname, filename, mimetype } = file;

    // Create a FormData object and append the file to it
    const fd = new FormData();
    let headers: any;
    if (mimetype === 'application/pdf') {
      fd.append(
        'file',
        new Blob([buffer], { type: mimetype }),
        filename ? filename : originalname,
      );
      headers = {
        'Content-Type': 'application/pdf',
      };
    } else {
      fd.append('file', new Blob([buffer]), filename ? filename : originalname);
      headers = {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
      };
    }

    // Set the request configuration
    const reqConfig: AxiosRequestConfig = {
      headers: headers,
      auth: {
        username: process.env.BASICAUTH_USERNAME,
        password: process.env.BASICAUTH_PASSWORD,
      },
    };

    // Construct the URL for the request
    let url = process.env.COMS_URL + `object`;
    if (s3ObjectId) {
      url = url.concat('/', s3ObjectId);
    }

    // Send the POST request to create the object and retrieve the response
    const responseData: ReadCOMSDto[] = await lastValueFrom(
      this.httpService.post(url, fd, reqConfig).pipe(
        map((response) => {
          return response;
        }),
      ),
    )
      .then((response) => {
        if (s3ObjectId) {
          return [response.data as ReadCOMSDto];
        }
        return response.data as ReadCOMSDto[];
      })
      .catch((error) => {
        console.log('createObject error: ', error);
        throw new InternalServerErrorException();
      });

    return responseData;
  }

  /**
   * Creates a file from a stream of data.
   * @param data - The stream of data to create a file from.
   * @returns A Promise resolving to a Buffer representing the created file.
   */
  private async createFile(data: Stream) {
    // Read the stream data and concatenate all chunks into a single Buffer
    const streamReadPromise = new Promise<Buffer>((resolve) => {
      const chunks: Buffer[] = [];
      data.on('data', (chunk: Buffer) => {
        chunks.push(Buffer.from(chunk));
      });
      data.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });
    // Return the Promise that resolves to the created file Buffer
    return streamReadPromise;
  }

  /**
   * Retrieves an object from COMS.
   * @param readFile - The {@link ReadFileDto} object containing the information
   *                   about the file to be retrieved.
   * @param download - The file download mode - {@link FileDownloadModes}.
   * @returns A Promise that resolves to a string (url) or ArrayBuffer (proxy) representing the retrieved
   *          object.
   */
  async getObject(
    readFile: ReadFileDto,
    download = FileDownloadModes.URL,
    res?: Response,
  ): Promise<ArrayBuffer | string> {
    
    // Set the request configuration
    const reqConfig: AxiosRequestConfig = {
      auth: {
        username: process.env.BASICAUTH_USERNAME,
        password: process.env.BASICAUTH_PASSWORD,
      },
    };

    // Set the request parameters
    const params = {
      download: download,
      expiresIn: process.env.COMS_PRESIGNED_URL_EXPIRY,
    };

    // Construct the URL for the request
    const url = `${
      process.env.COMS_URL
    }object/${readFile.s3ObjectId?.toLowerCase()}`;


    if (download === FileDownloadModes.PROXY) {
      const axiosResponse = await lastValueFrom(
        this.httpService.get(url, {
          params: { download: download },
          ...reqConfig,
          responseType: 'stream',
        }),
      )
        .then(async (response) => {
          return await this.createFile(response.data);
        })
        .catch((error) => {
          console.log('COMS getObject proxy error: ', error);
          throw new InternalServerErrorException();
        });

      return axiosResponse;
    }
    // Send the GET request to retrieve the object and retrieve the response
    const axiosResponse = await lastValueFrom(
      this.httpService.get(url, { params, ...reqConfig }).pipe(
        map((response) => {
          return response;
        }),
      ),
    )
      .then((response) => {
        return response;
      })
      .catch((error) => {
        console.log('COMS getObject url Error: ', error);
        throw new InternalServerErrorException();
      });

    if (res) {
      this.convertAxiosToExpress(axiosResponse, res);
    }
    return axiosResponse.data as string;
  }

  /**
   * Converts the headers from an Axios response to Express response headers.
   * @param response - The {@link AxiosResponse} object containing the response
   *                   headers.
   * @param res - The Express {@link Response} object.
   */
  convertAxiosToExpress(response: AxiosResponse, res: Response) {
    // Get the headers from the Axios response
    const headers = response.headers;

    // Set the headers in the Express response object using the res.set() method
    Object.keys(headers).forEach((key) => {
      res.set(key, headers[key] as string);
    });
  }
}
