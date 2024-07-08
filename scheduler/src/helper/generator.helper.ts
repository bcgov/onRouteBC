import { config as dotenvConfig } from "dotenv";
import * as fs from 'fs';
import { join, resolve } from 'path';
import { CgiSftpService } from "src/modules/cgi-sftp/cgi-sftp.service";
import { Transaction } from "src/modules/transactions/transaction.entity";
import { Readable } from "typeorm/platform/PlatformTools";
import { CgiConstants } from "src/common/constants/cgi.constant";

const envFilePath = resolve(__dirname, "../../../.env");
const result = dotenvConfig({ path: envFilePath });

if (result.error) {
  throw result.error;
}

const maxBatchId: string = '';

class BatchHeader {
  feederNumber: string;
  batchType: string;
  transactionType: string;
  fiscalYear: number;
  batchNumber: string;
  messageVersion: string;

  constructor() {
    this.feederNumber = process.env.FEEDER_NUMBER;
    this.batchType = CgiConstants.BATCH_TYPE;
    this.transactionType = CgiConstants.TRANSACTION_TYPE_BH;
    this.fiscalYear = getFiscalYear();
    this.batchNumber = getBatchNumber();
    this.messageVersion = CgiConstants.MESSAGE_VERSION;
  } 
}

  function formatDateToCustomString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }
  
  function getFiscalYear(): number {
    const currentYear = new Date().getFullYear();
    return currentYear + 1;
  }
  
  let batchCounter = 0;

  function getBatchNumber(): string {
    batchCounter++;
    return batchCounter.toString().padStart(9, '0');
  }
  
  // Journal name: 10 characters
  let globalJournalName: string = '';
  
  function getJournalName(): string {
    const prefix = CgiConstants.PREFIX;
    const randomChars = generateRandomChars(8); // Generate 8 random characters
    const journalName: string = prefix + randomChars;
    return journalName;
  }
  
  function generateRandomChars(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }
  
  function getJournalBatchName(): string {
    // 25 characters
    const prefix = CgiConstants.PREFIX; // Ministry Alpha identifier prefix
    const randomChars = generateRandomChars(23); // Generate 23 random characters
    return prefix + randomChars;
  }
  
  function getControlTotal(transactions: Transaction[]): string {
    // 15 characters
    let total: number = 0.0;
    for (const transaction of transactions) {
      if(transaction.TRANSACTION_TYPE === `R`)
        if(transaction.TOTAL_TRANSACTION_AMOUNT > 0.0)
          transaction.TOTAL_TRANSACTION_AMOUNT = 0.0 - transaction.TOTAL_TRANSACTION_AMOUNT;
      total += Number(transaction.TOTAL_TRANSACTION_AMOUNT);
    }
  
    let totalString: string = total.toFixed(2); // Ensure two decimal places
    const isNegative: boolean = totalString.startsWith('-');
    const integerPartLength: number = isNegative ? totalString.length - 1 : totalString.length;
    const paddingLength: number = 15 - integerPartLength;
  
    if (paddingLength > 0) {
      totalString = totalString.padStart(totalString.length + paddingLength, ' ');
    }
  
    return totalString;
  }
  
  function getExternalReferenceSource(): string {
    // 100 chars, optional
    // return `QP`;
    return ``;
  }

  function getFlowThru(length: number): string {
    return ' '.repeat(length);
  }
  
  let jvLineNumberCounter: number = 0;
  
  function getJvLiineNumber(): string {
    // 5 chars
    jvLineNumberCounter++;
    return String(jvLineNumberCounter).padStart(5, '0');
  }
  
  function getGlEffectiveDate(): string {
    const currentDate: Date = new Date();
    const year: number = currentDate.getFullYear();
    const month: string = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
    const day: string = currentDate.getDate().toString().padStart(2, '0');
  
    return `${year}${month}${day}`;
  }
  
  function getAck(): string {
    // 50 chars
    // Client - (3 Characters)
    // Responsibility - (5 Characters)
    // Service Line - (5 Characters)
    // STOB - (4 Characters)
    // Project - (7 Characters)
    // Location - (6 Characters)
    // Future - (4 Characters)
    // Unused Filler - (16 Characters)
    const client = getClient();
    const responsibility = getResponsibility();
    const serviceLine = getServiceLine();
    const stob = getStob();
    const project = getProject();
    const location = getLocation();
    const future = CgiConstants.FUTURE;
    const unusedFiller = ' '.repeat(16);//16 spaces
    let result = '';
    result = result + client + responsibility + serviceLine + stob + project + location + future + unusedFiller;
    return result;
  }
  
  function getClient(): string {
    // 3 chars
    return CgiConstants.CLIENT;
  }
  
  function getResponsibility(): string {
    // 5 chars
    return CgiConstants.RESPONSIBILITY;
  }
  
  function getServiceLine(): string {
    // 5 chars
    return CgiConstants.SERVICE_LINE;
  }
  
  function getStob(): string {
    // 4 chars
    return CgiConstants.STOB;
  }
  
  function getProject(): string {
    // 7 chars
    return CgiConstants.PROJECT;
  }
  
  function getLocation(): string {
    // 6 chars
    return `0`.repeat(6);
  }
  
  function getFuture(): string {
    // 4 chars
    return `0`.repeat(4);
  }
  
  function getUnusedFiller(): string {
    // 16 chars
    return `0`.repeat(16);
  }
  
  function getLineCode(): string {
    // 1 char, C or D
    return CgiConstants.LINE_CODE;
  }
  
  function getLineDescription(): string {
    // 100 chars
    return ` `.repeat(100);
  }
  
  function getFeederNumberClientSystem(): string {
    // 4 chars
    return `0`.repeat(4);
  }
  
  function getControlCount(transactions: Transaction[]): string {
    // 15 chars
    const numberStr = transactions.length.toString();
    const desiredLength = 15;
    const paddedString = numberStr.padStart(desiredLength, '0');
    return paddedString;
    
  }
  
  function populateBatchHeader(filename: string, ackFilename: string): string {
    let batchHeader: string = ``;
    const feederNumber: string = process.env.FEEDER_NUMBER;
    const batchType: string = CgiConstants.BATCH_TYPE;
    const transactionType: string = CgiConstants.TRANSACTION_TYPE_BH;
    const delimiterHex = 0x1D;
    const delimiter = String.fromCharCode(delimiterHex);
    const fiscalYear: number = getFiscalYear();
    const batchNumber: string = getBatchNumber();
    const messageVersion: string = CgiConstants.MESSAGE_VERSION;
    batchHeader = batchHeader + feederNumber + batchType + transactionType + delimiter + feederNumber + fiscalYear + batchNumber + messageVersion + delimiter + `\n`;
    const bt: BatchHeader = new BatchHeader();
    bt.feederNumber = feederNumber;
    bt.batchType = batchType;
    bt.transactionType = transactionType;
    bt.fiscalYear = fiscalYear;
    bt.batchNumber = batchNumber;
    bt.messageVersion = messageVersion;
    console.log(filename);
    console.log(ackFilename);
    return batchHeader;
  }

function populateJournalHeader(transactions: Transaction[]): string {
  let journalHeader: string = ``;
  const feederNumber: string = process.env.FEEDER_NUMBER;
  const batchType: string = CgiConstants.BATCH_TYPE;
  const transactionType: string = CgiConstants.TRANSACTION_TYPE_JH;
  const delimiterHex = 0x1D;
  const delimiter = String.fromCharCode(delimiterHex);
  const journalName: string = globalJournalName;
  const journalBatchName: string = getJournalBatchName();
  const controlTotal: string = getControlTotal(transactions);
  const recordType: string = CgiConstants.RECORD_TYPE;
  const countryCurrencyCode: string = CgiConstants.COUNTRY_CURRENCY_CODE;
  const externalReferenceSource: string = getExternalReferenceSource();
  const flowThru: string = getFlowThru(110);
  journalHeader = journalHeader + feederNumber + batchType + transactionType + delimiter + journalName + journalBatchName + controlTotal
    + recordType + countryCurrencyCode + externalReferenceSource + flowThru + delimiter + `\n`;
  return journalHeader;
}

function populateJournalVoucherDetail(cgiFileName: string, transactions: Transaction[]): void {
  const feederNumber: string = process.env.FEEDER_NUMBER;
  const batchType: string = CgiConstants.BATCH_TYPE;
  const delimiterHex = 0x1D;
  const delimiter = String.fromCharCode(delimiterHex);
  const journalName: string = globalJournalName;
  const flowThru: string = getFlowThru(110);
  const jvLineNumber: string = getJvLiineNumber();
  const glEffectiveDate: string = getGlEffectiveDate();
  const ack: string = getAck();
  console.log(ack);
  const client: string = getClient();
  const responsibility: string = getResponsibility();
  const serviceLine: string = getServiceLine();
  const stob: string = getStob();
  const project: string = getProject();
  const location: string = getLocation();
  const future: string = getFuture();
  const unusedFiller: string = getUnusedFiller();
  const supplierNumber: string = process.env.SUPPLIER_NUMBER;
  const lineCode: string = getLineCode();
  const lineDescription: string = getLineDescription();

  for (const transaction of transactions) {
    const transactionType = transaction.TRANSACTION_TYPE;
    let lineTotal = '';    
    lineTotal = getLineTotle(transaction.TOTAL_TRANSACTION_AMOUNT);
    let journalVoucher: string = `${feederNumber}`;
    journalVoucher += `${batchType}`;
    journalVoucher += `${transactionType}`;
    journalVoucher += `${delimiter}`;
    journalVoucher += `${journalName}`;
    journalVoucher += `${jvLineNumber}`;
    journalVoucher += `${glEffectiveDate}`;
    journalVoucher += `${client}`;
    journalVoucher += `${responsibility}`;
    journalVoucher += `${serviceLine}`;
    journalVoucher += `${stob}`;
    journalVoucher += `${project}`;
    journalVoucher += `${location}`;
    journalVoucher += `${future}`;
    journalVoucher += `${unusedFiller}`;
    journalVoucher += `${supplierNumber}`;
    journalVoucher += `${lineTotal}`;
    journalVoucher += `${lineCode}`;
    journalVoucher += `${lineDescription}`;
    journalVoucher += `${flowThru}`;
    journalVoucher += `${delimiter}`;
    journalVoucher += `\n`;

    fs.appendFileSync(cgiFileName, journalVoucher);
  }
}

function getLineTotle(total: number) {
  let totalString: string = total.toFixed(2); // Ensure two decimal places
    const isNegative: boolean = totalString.startsWith('-');
    const integerPartLength: number = isNegative ? totalString.length - 1 : totalString.length;
    const paddingLength: number = 15 - integerPartLength;
  
    if (paddingLength > 0) {
      totalString = totalString.padStart(totalString.length + paddingLength, ' ');
    }
  
    return totalString;

}

function populateBatchTrailer(transactions: Transaction[]): string {
  let batchTrailer: string = ``;
  const feederNumber: string = process.env.FEEDER_NUMBER;
  const batchType: string = CgiConstants.BATCH_TYPE;
  const transactionType: string = CgiConstants.TRANSACTION_TYPE_BT;
  const delimiterHex = 0x1D;
  const delimiter = String.fromCharCode(delimiterHex);
  const fiscalYear: number = getFiscalYear();
  const batchNumber: string = getBatchNumber();
  const controlTotal: string = getControlTotal(transactions);
  const feederNumberClientSystem: string = getFeederNumberClientSystem();
  const controlCount: string = getControlCount(transactions);

  batchTrailer = batchTrailer + feederNumber + batchType + transactionType + delimiter + feederNumber
    + fiscalYear + batchNumber + controlCount + controlTotal + feederNumberClientSystem + delimiter  + `\n`;
  return batchTrailer;
}

function generateCgiFile(transactions: Transaction[]): void {
  const now: Date = new Date();
  const cgiCustomString: string = formatDateToCustomString(now);
  const cgiFileName: string = `F3535.${cgiCustomString}`;
  const batchHeader: string = populateBatchHeader('test_cgi_file', 'test_cgi_ack_file');
  fs.writeFileSync(cgiFileName, batchHeader);
  console.log(maxBatchId);
  const journalHeader: string = populateJournalHeader(transactions);
  fs.appendFileSync(cgiFileName, journalHeader);
  populateJournalVoucherDetail(cgiFileName, transactions);
  const batchTrailer: string = populateBatchTrailer(transactions);
  fs.appendFileSync(cgiFileName, batchTrailer);
  console.log(`${cgiFileName} generated.`);
  const cgiTrigerFileName: string = `F3535.${cgiCustomString}.TRG`;
  fs.writeFileSync(cgiTrigerFileName, ``);
  console.log(`${cgiTrigerFileName} generated.`);
}

async function uploadFile(): Promise<string> {
  const currentDir = process.cwd();
  const sourceDir = currentDir;
  const destinationDir = currentDir;

  try {
    const files = await fs.promises.readdir(sourceDir);
    const inboxFiles = files.filter(file => file.startsWith('F3535.'));
    if (inboxFiles.length === 0) {
      console.log('No files can be uploaded');
      return null;
    }

    for (let index = 0; index < inboxFiles.length; index++) {
      const file = inboxFiles[index];
      
      const sourceFile = join(sourceDir, file);
      const destinationFile = join(destinationDir, file);

      // Read the file's data
      const fileData = await fs.promises.readFile(sourceFile);

      // Create a readable stream from the buffer
      const fileStream = new Readable();
      fileStream.push(fileData);
      fileStream.push(null); // Indicate the end of the stream

      // Construct the file object
      const multerFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: file,
        encoding: '7bit',
        mimetype: 'application/octet-stream',
        size: fileData.length,
        destination: destinationDir,
        filename: file,
        path: destinationFile,
        buffer: fileData,
        stream: fileStream,
      };

      const cgiSftpService: CgiSftpService = new CgiSftpService();
      const fileContent: Express.Multer.File = multerFile; 
      const fileName: string = file;
      cgiSftpService.upload(fileContent, fileName);  
      return file; 
    }
  } catch (err) {
    console.error('Error uploading files:', err);
  }
}

export const generate = async (transactions: Transaction[]): Promise<string> => {
  globalJournalName = getJournalName();
  generateCgiFile(transactions);
  return await uploadFile();
}