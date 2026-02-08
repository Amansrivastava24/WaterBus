const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Send OTP email using SendGrid
const sendOTPEmail = async (email, otp, userName = 'User') => {
    try {
        const msg = {
            to: email,
            from: process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER, // Verified sender email
            subject: 'Your WaterFlow OTP Code',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .container {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            border-radius: 16px;
                            padding: 40px;
                            text-align: center;
                            color: white;
                        }
                        .logo {
                            font-size: 32px;
                            font-weight: bold;
                            margin-bottom: 20px;
                        }
                        .otp-box {
                            background: white;
                            color: #667eea;
                            font-size: 48px;
                            font-weight: bold;
                            letter-spacing: 8px;
                            padding: 20px;
                            border-radius: 12px;
                            margin: 30px 0;
                            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                        }
                        .message {
                            font-size: 16px;
                            margin: 20px 0;
                        }
                        .footer {
                            font-size: 14px;
                            opacity: 0.9;
                            margin-top: 30px;
                        }
                        .warning {
                            background: rgba(255,255,255,0.1);
                            padding: 15px;
                            border-radius: 8px;
                            margin-top: 20px;
                            font-size: 13px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="logo">💧 WaterFlow</div>
                        <h2>Hello ${userName}!</h2>
                        <p class="message">Your One-Time Password (OTP) for authentication is:</p>
                        
                        <div class="otp-box">${otp}</div>
                        
                        <p class="message">This OTP will expire in <strong>10 minutes</strong>.</p>
                        
                        <div class="warning">
                            ⚠️ <strong>Security Notice:</strong><br>
                            Never share this OTP with anyone. WaterFlow team will never ask for your OTP.
                        </div>
                        
                        <div class="footer">
                            If you didn't request this OTP, please ignore this email.
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await sgMail.send(msg);
        console.log('OTP email sent via SendGrid to:', email);
        return { success: true };
    } catch (error) {
        console.error('SendGrid error:', error.response?.body || error.message);
        return { success: false, error: error.message };
    }
};

// Send welcome email using SendGrid
const sendWelcomeEmail = async (email, userName) => {
    try {
        const msg = {
            to: email,
            from: process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER,
            subject: 'Welcome to WaterFlow! 🎉',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .container {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            border-radius: 16px;
                            padding: 40px;
                            color: white;
                        }
                        h1 { margin-bottom: 20px; }
                        .content {
                            background: white;
                            color: #333;
                            padding: 30px;
                            border-radius: 12px;
                            margin: 20px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>🎉 Welcome to WaterFlow, ${userName}!</h1>
                        <div class="content">
                            <h2>You're all set!</h2>
                            <p>Thank you for joining WaterFlow. Your account has been successfully created and verified.</p>
                            <p>You can now:</p>
                            <ul>
                                <li>✅ Manage your customers</li>
                                <li>✅ Track daily deliveries</li>
                                <li>✅ Monitor payments</li>
                                <li>✅ View analytics</li>
                            </ul>
                            <p>Get started by setting up your business profile and adding your first customer!</p>
                        </div>
                        <p style="margin-top: 20px; font-size: 14px;">
                            Need help? Reply to this email or visit our support page.
                        </p>
                    </div>
                </body>
                </html>
            `
        };

        await sgMail.send(msg);
        console.log('Welcome email sent via SendGrid to:', email);
    } catch (error) {
        console.error('SendGrid welcome email error:', error.response?.body || error.message);
    }
};

module.exports = { sendOTPEmail, sendWelcomeEmail };
