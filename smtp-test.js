import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config(); // ← Isso carrega o .env
async function main() {
  try {
    console.log("SMTP_HOST:", process.env.SMTP_HOST);
console.log("SMTP_PORT:", process.env.SMTP_PORT);

let transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


    let info = await transporter.sendMail({
      from: '"Teste Plataforma" <noreply.pecuscontratos@gamil.com>',
      to: "byuripaulo@gmail.com",
      subject: "Teste SMTP",
      text: "Se você recebeu este e-mail, o SMTP está OK 🚀",
    });

    console.log("Email enviado:", info.messageId);
  } catch (err) {
    console.error("Erro SMTP:", err);
  }
}

main();
