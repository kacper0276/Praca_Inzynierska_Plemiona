import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export class FileLogger extends Logger {
  private logFilePath: string;
  private errorLogFilePath: string;

  constructor(context?: string) {
    super(context);

    const logsDir = path.join(process.cwd(), 'logs');
    const appLogsDir = path.join(logsDir, 'app');
    const errorLogsDir = path.join(logsDir, 'errors');

    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    if (!fs.existsSync(appLogsDir)) {
      fs.mkdirSync(appLogsDir, { recursive: true });
    }
    if (!fs.existsSync(errorLogsDir)) {
      fs.mkdirSync(errorLogsDir, { recursive: true });
    }

    this.logFilePath = path.join(appLogsDir, `app-${this.getDateString()}.log`);
    this.errorLogFilePath = path.join(
      errorLogsDir,
      `error-${this.getDateString()}.log`,
    );
  }

  private getDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  private formatTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  private writeToFile(
    filePath: string,
    message: string,
    level: string,
    context?: string,
  ): void {
    const timestamp = this.formatTimestamp();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${
      context ? `[${context}] ` : ''
    }${message}\n`;

    fs.appendFileSync(filePath, logEntry);
  }

  log(message: any): void {
    super.log(message);
    this.writeToFile(this.logFilePath, message, 'log');
  }

  error(message: any, trace?: string): void {
    super.error(message, trace);
    const errorMessage = trace ? `${message}\n${trace}` : message;
    this.writeToFile(this.errorLogFilePath, errorMessage, 'error');
  }

  warn(message: any): void {
    super.warn(message);
    this.writeToFile(this.logFilePath, message, 'warn');
  }

  debug(message: any): void {
    super.debug(message);
    this.writeToFile(this.logFilePath, message, 'debug');
  }

  verbose(message: any): void {
    super.verbose(message);
    this.writeToFile(this.logFilePath, message, 'verbose');
  }
}
