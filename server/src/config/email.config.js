import nodemailer from 'nodemailer';



const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendEmail = async (to, subject, content, isHtml = false) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject
        };

        // Nếu là HTML thì sử dụng thuộc tính html, ngược lại dùng text
        if (isHtml) {
            mailOptions.html = content;
        } else {
            mailOptions.text = content;
        }

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email: ', error);
    }
}

export default sendEmail;