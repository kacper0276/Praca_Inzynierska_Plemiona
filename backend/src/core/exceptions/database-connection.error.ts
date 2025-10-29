export class DatabaseConnectionError extends Error {
  constructor(message: string) {
    super(`Błąd połączenia z bazą danych: ${message}`);
    this.name = 'DatabaseConnectionError';
  }
}
