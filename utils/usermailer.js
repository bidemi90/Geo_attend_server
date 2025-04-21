const nodemailer = require("nodemailer");

const usermailer = async (email, name) => {
  const subject = "Welcome to FUOYE Hostel Management System!";
  const contactTemplate = `
    <div>
      <div>
        <h2 style="color:#2036ea;">Welcome, ${name}!</h2>
      </div>
      <ul>
        <li>Name: ${name}</li>
        <li>Email: ${email}</li>
      </ul>
      <div>
        <h2 style="color:#2036ea;">Getting Started:</h2>
        <p>
          Dear ${name},<br><br>
          Thank you for joining the FUOYE Hostel Management System. Here's a quick overview of how things work:
          <br><br>
          - Browse available hostels and rooms based on your preferences.<br>
          - Submit a request to reserve or book a room.<br>
          - Track your application status in your dashboard.<br>
          - Receive updates on approval, payments, and room details.
          <br><br>
          Make sure to keep your account information safe. If you have any questions, feel free to reach out to our support team.
          <br><br>
          Best regards,<br>
          The FUOYE Hostel Management Team
        </p>
      </div>
      <p style="color:#2036ea;"><i>The FUOYE Hostel Management Team.</i></p>
    </div>
  `;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.maileremail,
      pass: process.env.mailerpassword,
    },
  });

  const mailOptions = {
    from: process.env.maileremail,
    to: email,
    subject: subject,
    text: "Welcome to FUOYE Hostel Management System",
    html: contactTemplate,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Welcome email sent successfully");
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw error;
  }
};

module.exports = { usermailer };

// Example usage
// usermailer('user@example.com', 'John Doe');
