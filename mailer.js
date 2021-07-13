const nodemailer = require('nodemailer');

async function mailer(mailOptions) {
    try {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: TEST_EMAIL,
                pass: TEST_PASSWORD
            }
        });

        // send mail with defined transport object
        let info = await transporter.sendMail(mailOptions)

        return null
    } catch(err) {
        return err
    }
}

module.exports = mailer;