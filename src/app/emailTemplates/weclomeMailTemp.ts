// -----welcome email after signup, pixtos theme (white card, red accent, rainbow stripe like the logo)
export const WelcomeMailTemp = (
	userName: string,
	dashboardUrl: string = "#",
) => {
	const year = new Date().getFullYear();

	return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to Pixtos</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: Inter, Arial, Helvetica, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f8fafc" style="padding: 40px 16px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="max-width: 560px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0;">

            <!-- Rainbow stripe (logo colors) -->
            <tr>
              <td style="padding: 0; line-height: 0; font-size: 0;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td height="6" bgcolor="#ef4444" style="background-color: #ef4444; height: 6px;"></td>
                    <td height="6" bgcolor="#f97316" style="background-color: #f97316; height: 6px;"></td>
                    <td height="6" bgcolor="#eab308" style="background-color: #eab308; height: 6px;"></td>
                    <td height="6" bgcolor="#22c55e" style="background-color: #22c55e; height: 6px;"></td>
                    <td height="6" bgcolor="#3b82f6" style="background-color: #3b82f6; height: 6px;"></td>
                    <td height="6" bgcolor="#a855f7" style="background-color: #a855f7; height: 6px;"></td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Header -->
            <tr>
              <td align="center" style="padding: 32px 28px 8px;">
                <h1 style="margin: 0; font-size: 26px; color: #0f172a; font-weight: bold; letter-spacing: 0.3px;">
                  Pixtos
                </h1>
                <p style="margin: 8px 0 0; font-size: 14px; color: #64748b;">
                  We are thrilled to have you with us!
                </p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td align="center" style="padding: 28px 28px 32px; text-align: center;">
                <h2 style="margin: 0 0 12px; font-size: 22px; color: #0f172a;">
                  Welcome, ${userName}! 🎉
                </h2>
                <p style="margin: 0 0 26px; font-size: 15px; line-height: 1.7; color: #475569;">
                  Thank you for joining Pixtos. Your account is now active, so you can start uploading your photos and videos, grouping them into albums, and finding any memory in seconds with AI-powered search.
                </p>

                <!-- Call To Action Button -->
                <a href="${dashboardUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 15px; font-weight: bold; color: #ffffff; text-decoration: none; background-color: #dc2626; border-radius: 999px;">
                  Go to My Library
                </a>

                <p style="margin: 28px 0 0; font-size: 14px; line-height: 1.7; color: #64748b;">
                  If you have any questions or need help getting started, feel free to reach out to our support team.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" bgcolor="#f8fafc" style="padding: 20px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                  © ${year} Pixtos. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};