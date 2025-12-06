# 📘 Praca Inżynierska - Dokumentacja Projektu

Projekt składa się z backendu (NestJS) oraz klienta (Angular).

## ⚠️ Wymagania Wstępne

- **Node.js**: Zalecana wersja **v22.17.0**
- **Yarn**: Wymagany do obsługi backendu.
- **Docker**: Do uruchomienia bazy danych.

## 📂 Struktura Projektu

```text
root/
├── backend/            # API (NestJS)
│   ├── .env            # Konfiguracja główna
│   ├── config/         # Pliki konfiguracyjne JSON
│   └── src/
├── client/             # Klient (Angular)
│   ├── src/environments/
│   └── src/
└── README.md
```

---

## ⚙️ 1. Konfiguracja (Backend)

Wejdź do katalogu `backend/`, utwórz plik `.env` i wklej zawartość:

### Plik `.env`

```properties
# APP CONFIG
PORT=3000
JWT_SECRET=tajny_klucz_jwt
JWT_REFRESH_SECRET=tajny_klucz_refresh
```

Następnie uzupełnij pliki konfiguracyjne w folderze `backend/config/`:

### Plik `database.json`

```json
{
  "host": "localhost",
  "port": 3307,
  "username": "root",
  "password": "root",
  "database": "praca_inzynierska",
  "synchronize": true
}
```

### Plik `mailer.json`

```json
{
  "host": "",
  "port": 465,
  "secure": true,
  "auth": {
    "user": "",
    "pass": ""
  },
  "defaults": {
    "from": "\"No Reply\" <>"
  }
}
```

### Plik `migrations.json`

```json
{
  "host": "localhost",
  "port": 3307,
  "username": "root",
  "password": "root",
  "database": "praca_inzynierska",
  "synchronize": false
}
```

---

## ⚙️ 2. Konfiguracja (Frontend)

Wejdź do katalogu `client/src/environments/`. Należy podmienić zawartość plików `environment.ts` oraz `environment.prod.ts`.

> **WAŻNE!** Porty w poniższych plikach muszą zgadzać się z portem ustawionym w backendzie.

### Plik `environment.ts`

```typescript
export const environment = {
  production: false,
  serverBaseUrl: "http://localhost:3000",
  apiUrl: "http://localhost:3000/api",
  wsUrl: "http://localhost:3000",
};
```

### Plik `environment.prod.ts`

```typescript
export const environment = {
  production: true,
  serverBaseUrl: "http://localhost:3000",
  apiUrl: "http://localhost:3000/api",
  wsUrl: "http://localhost:3000",
};
```

---

## 🗄️ 3. Baza Danych (Docker)

Baza danych musi działać na porcie **3307** lub możemy użyć np. Xamppa wtedy w konfiguracji backendu ustawiamy inny port. Uruchom poniższą komendę w terminalu:

```bash
docker run --name praca-db \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=praca_inzynierska \
  -p 3307:3306 \
  -d mysql:8.0
```

---

## 🚀 4. Uruchomienie Aplikacji

Potrzebujesz dwóch osobnych terminali.

### TERMINAL 1: Backend (NestJS)

Backend wykorzystuje menedżer pakietów **Yarn**.

Instalacja i uruchomienie serwera deweloperskiego:

```bash
cd backend
yarn install
yarn start:dev
```

**Opcjonalnie - Uruchomienie migracji:**
Jeśli masz skonfigurowaną bazę i chcesz uruchomić migracje ręcznie:

```bash
yarn migration:run
```

### TERMINAL 2: Frontend (Angular)

```bash
cd client
npm install
npm start
```

> Aplikacja działa na: http://localhost:4200
