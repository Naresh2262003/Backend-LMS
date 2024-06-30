import nodemailer from "nodemailer";

const sendEmail= async(email, subject, message)=>{

    console.log(email);
    console.log(subject);
    console.log(message);

    const transporter = nodemailer.createTransport({
        service:"gmail",// Use `true` for port 465, `false` for all other ports
        auth: {
            user: process.env.SENDER_EMAIL,
            pass: process.env.SENDER_PASSWORD,
        },
    });

    // send mail with defined transport object
    await transporter.sendMail({
        from: process.env.SENDER_EMAIL, // sender address
        to: email, // list of receivers
        subject:subject, // Subject line
        // text: message, // plain text body
        html: `<p>${message}</p>`, // html body
    });
};

export default sendEmail;