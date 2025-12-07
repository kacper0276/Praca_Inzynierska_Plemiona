import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export class CreateServerSeed1765071719257 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

    await queryRunner.query(
      `INSERT INTO servers (name, hostname, port, status, \`lastChecked\`) VALUES (?, ?, ?, ?, ?)`,
      ['Główny Serwer', '127.0.0.1', port, 'UNKNOWN', null],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

    await queryRunner.query(
      `DELETE FROM servers WHERE hostname = ? AND port = ?`,
      ['localhost', port],
    );
  }
}
