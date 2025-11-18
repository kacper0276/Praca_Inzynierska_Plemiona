# Changelog

Wszystkie znaczące zmiany w tym projekcie będą dokumentowane w tym pliku.
Format oparty jest na [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
a ten projekt stosuje [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] - 04.06.2025 - 04.11.2025

### Added

- Zainicjowanie projektu.
- Stworzenie podstawowej struktury katalogów i plików.
- Konfiguracja początkowych narzędzi deweloperskich (np. linter, system budowania).
- konfiguracja nginx
- konfiguracja Dockerfile
- Podstawowe grafiki
- Dodanie pliku `README.md` z podstawowym opisem projektu.

## [0.0.2] - 05.11.2025 - 16.11.2025

### Added

- Stworzenie toastr komponentu i serwisu
- Dodano odświeżanie tokenu
- Automatyczne logowanie, jeśli token jest ważny
- Notyfikacje
- Stworzenie modułu ttl, w celu generowania kodu do aktywowania konta
- Usuwanie nieaktywnych kont
- Wysyłanie maila dla zarejestrowanego użytkownika z kodem potrzebnym do aktywowania kodu
- Ustawienie statusu online jeśli użytkownik wybierze serwer
- Dodanie intervału który sprawdza dostępność serwerów
- Pobieranie układu wioski z backendu za pomocą socketów
- Interwał który dodaje surowce dla użytkownika, po stronie serwera
- Odbieranie i wyświetlanie aktuanej ilości surowców na aplikacji klienta
- Zapisywanie w bazie przesunięcia budynku, usunięcia i utworzenia nowego
- Dodanie kosztów budynków
- Użycie transakcyjności dla tworzenia budynków
- Dodanie podstawowego wyglądu panela administratora
- Rozszerzanie wioski i pobieranie jest z backendu
- Wysyłanie zgłoszeń na backend
- Pobieranie profilu użytkownika z backendu

### Changed

- Zmiana struktury projektu
- Zmiana formularza rejestracji
- Poprawa w kodzie migracji
- Zmieniono sposób łączenia się po webSocket (dodano zabezpieczenie w postaci tokenu)
- Poprawiono sprawdzenie czy dana wioska jest zalogowanego użytkownika
- Zmieniona nazwa gry

### Removed

- Usunięto zbędne biblioteki
