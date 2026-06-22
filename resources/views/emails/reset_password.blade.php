<!DOCTYPE html>
<html>
<head>
    <title>Reset Password</title>
</head>
<body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; padding: 20px;">
    <h2>Halo,</h2>
    <p>Kami menerima permintaan untuk mereset password akun Anda.</p>
    <p>Berikut adalah kode verifikasi (OTP) Anda:</p>
    <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
        {{ $code }}
    </div>
    <p>Kode ini hanya berlaku selama 15 menit.</p>
    <p>Jika Anda tidak meminta reset password, Anda dapat mengabaikan email ini.</p>
    <br>
    <p>Terima kasih,</p>
    <p>Tim TaskApp</p>
</body>
</html>
