import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcryptjs';

export class CreateUser1762898948625 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    await queryRunner.query(
      `INSERT INTO users (email, login, password, \`role\`, \`isActive\`) VALUES (?, ?, ?, ?, ?)`,
      ['admin@example.com', 'admin', hashedPassword, 'ADMIN', true],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM users WHERE email = $1`, [
      'admin@example.com',
    ]);
  }
}
