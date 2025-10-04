import nodemailer from "nodemailer";

async function main() {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true, // true para 465, false para 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    let info = await transporter.sendMail({
      from: '"Teste Plataforma" <no-reply@sua-plataforma.com>',
      to: "seuemail@gmail.com",
      subject: "Teste SMTP",
      text: "Se você recebeu este e-mail, o SMTP está OK 🚀",
    });

    console.log("Email enviado:", info.messageId);
  } catch (err) {
    console.error("Erro SMTP:", err);
  }
}

main();
