export const getResetPasswordEmailTemplate = (
  resetLink: string,
  userName: string,
): string => `
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resetowanie hasła</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333; margin: 0; padding: 0; }
        .email-container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .email-header { background: linear-gradient(90deg, #080078, #be0533); color: #ffffff; text-align: center; padding: 20px; font-size: 24px; }
        .email-body { padding: 20px; }
        .btn { display: inline-block; background: linear-gradient(90deg, #080078, #be0533); color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; margin: 20px 0; }
        .footer { background-color: #f1f1f1; text-align: center; padding: 10px; font-size: 12px; color: #665; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">Zmiana hasła</div>
        <div class="email-body">
            <p>Witaj ${userName},</p>
            <p>Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta. Kliknij w poniższy przycisk, aby ustawić nowe hasło:</p>
            
            <div style="text-align: center;">
                <a href="${resetLink}" target="_blank" class="btn">Zmień hasło</a>
            </div>

            <p>Link jest ważny przez 15 minut.</p>
            <p style="font-size: 12px; color: #777;">Jeśli przycisk nie działa, skopiuj poniższy link do przeglądarki:<br>${resetLink}</p>
        </div>
        <div class="footer">&copy; 2025 Serwis. Wszelkie prawa zastrzeżone.</div>
    </div>
</body>
</html>
`;
