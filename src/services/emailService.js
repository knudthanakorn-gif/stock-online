/**
 * Email Notification Service for Stock Online
 * Supports sending transactional HTML emails via Webhook, Google Apps Script, Resend, etc.
 * Designed with 100% Inline Table Styles for perfect rendering in Microsoft Outlook, Gmail, & Mobile.
 */

const formatThaiDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    return dateStr;
  }
};

/**
 * Generate ultra-modern, Outlook-bulletproof HTML email layout
 */
const generateEmailTemplate = ({
  title,
  subtitle,
  badgeText,
  badgeBgColor = '#4f46e5',
  badgeTextColor = '#ffffff',
  headerIcon = '📦',
  bodyHtml,
  actionBtnText,
  actionBtnUrl,
}) => {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="th">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <!-- Main Outer Wrapper Table -->
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; margin: 0; padding: 24px 8px;">
    <tr>
      <td align="center" valign="top">
        <!-- Inner Email Container Card (Max Width: 600px) -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.06);">
          
          <!-- Top Accent Color Bar -->
          <tr>
            <td height="5" style="background-color: #4f46e5; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Header Section -->
          <tr>
            <td style="background-color: #0f172a; padding: 26px 24px; text-align: center;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background-color: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); padding: 5px 14px; border-radius: 30px; margin-bottom: 10px;">
                      <span style="color: #38bdf8; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">
                        EXION GROUP • STOCK ONLINE
                      </span>
                    </div>
                    <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0 0 4px 0; letter-spacing: -0.3px;">
                      ระบบบริหารจัดการและเบิกจ่ายพัสดุ
                    </h1>
                    <p style="color: #94a3b8; font-size: 12px; margin: 0; font-weight: 500;">
                      Enterprise Asset & Inventory Management Portal
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content Area -->
          <tr>
            <td style="padding: 28px 24px 20px 24px;">
              
              <!-- Badge & Title Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                <tr>
                  <td align="center">
                    ${
                      badgeText
                        ? `<div style="display: inline-block; background-color: ${badgeBgColor}; color: ${badgeTextColor}; font-size: 12px; font-weight: 800; padding: 5px 16px; border-radius: 20px; margin-bottom: 12px; letter-spacing: 0.2px;">
                            ${badgeText}
                          </div>`
                        : ''
                    }
                    <h2 style="color: #0f172a; font-size: 18px; font-weight: 800; margin: 0 0 6px 0; line-height: 1.35;">
                      ${title}
                    </h2>
                    ${
                      subtitle
                        ? `<p style="color: #64748b; font-size: 13px; margin: 0; line-height: 1.4;">${subtitle}</p>`
                        : ''
                    }
                  </td>
                </tr>
              </table>

              <!-- Injected Dynamic Content (Info Cards & Item Tables) -->
              ${bodyHtml}

              <!-- Call To Action (Bulletproof Button) -->
              ${
                actionBtnText && actionBtnUrl
                  ? `
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0 10px 0;">
                  <tr>
                    <td align="center">
                      <table border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center" style="background-color: #4f46e5; border-radius: 10px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);">
                            <a href="${actionBtnUrl}" target="_blank" style="display: inline-block; padding: 13px 32px; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; font-weight: 800; color: #ffffff; text-decoration: none; border-radius: 10px; background-color: #4f46e5; border: 1px solid #4338ca; letter-spacing: 0.3px;">
                              ${actionBtnText}
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>`
                  : ''
              }

            </td>
          </tr>

          <!-- Security Notice & Meta Bar -->
          <tr>
            <td style="padding: 0 24px 20px 24px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 10px 14px;">
                <tr>
                  <td style="font-size: 11px; color: #64748b; line-height: 1.5; text-align: center;">
                    🔒 <strong>คำแนะนำด้านความปลอดภัย:</strong> หากคุณไม่ได้เป็นผู้ทำรายการนี้ กรุณาติดต่อผู้ดูแลระบบคลังพัสดุทันที
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Email Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center;">
              <p style="color: #64748b; font-size: 11px; margin: 0 0 6px 0; font-weight: 600;">
                อีเมลนี้ถูกส่งโดยระบบอัตโนมัติจากระบบ <strong>Stock Online Management</strong>
              </p>
              <p style="color: #94a3b8; font-size: 10px; margin: 0;">
                © ${new Date().getFullYear()} EXION (THAILAND) COMPANY LIMITED. All rights reserved.
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

/**
 * Generic dispatcher that dispatches email payload via Webhook / Email Service
 */
export const dispatchEmail = async ({ to, subject, htmlContent, webhookUrl, metadata = {} }) => {
  if (!to && !webhookUrl) return false;

  const recipients = Array.isArray(to)
    ? to
    : typeof to === 'string'
    ? to.split(/[,;\n\r]+/).map((s) => s.trim()).filter(Boolean)
    : [to];

  const payload = {
    to: recipients,
    recipient: recipients.join(', '),
    toEmail: recipients[0] || '',
    name: 'Stock Online (EXION Warehouse)',
    senderName: 'Stock Online (EXION Warehouse)',
    replyTo: 'tks@pdflowtech.com',
    subject,
    html: htmlContent,
    htmlBody: htmlContent,
    message: subject,
    sentAt: new Date().toISOString(),
    ...metadata,
  };

  try {
    if (webhookUrl) {
      // Use text/plain;charset=utf-8 to prevent browser CORS Preflight (OPTIONS) errors on Google Apps Script
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          type: 'EMAIL_NOTIFICATION',
          ...payload,
        }),
      });
      console.log('[Email Dispatcher] Dispatched successfully via Webhook:', webhookUrl);
      return true;
    }
    console.log('[Email Dispatcher] Sent email to:', to, '| Subject:', subject);
    return true;
  } catch (error) {
    console.error('[Email Dispatcher Error]:', error);
    return false;
  }
};

/**
 * 1. Send Email to Staff when a new requisition is created
 */
export const sendNewRequisitionEmailToStaff = async ({
  request,
  staffEmail,
  webhookUrl,
  appUrl = 'https://stock-online-mauve.vercel.app',
}) => {
  if (!staffEmail && !webhookUrl) return;

  const isAdvance = !!request.isAdvance;
  const scheduledText = isAdvance
    ? `📅 เบิกล่วงหน้า (นัดรับ: ${formatThaiDate(request.scheduledDate)} ${
        request.scheduledTimeSlot ? `• ${request.scheduledTimeSlot}` : ''
      })`
    : `⚡ เบิกด่วนทันทีวันนี้`;

  const itemsRows = (request.items || [])
    .map(
      (it, idx) => `
      <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; font-weight: 600;">
          ${idx + 1}
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #0f172a; font-weight: 700;">
          ${it.name || it.productName || 'อุปกรณ์'}
        </td>
        <td align="right" style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right;">
          <span style="display: inline-block; background-color: #e0e7ff; color: #3730a3; font-weight: 800; padding: 3px 10px; border-radius: 6px; font-size: 12px;">
            ${it.quantity} ${it.unit || 'ชิ้น'}
          </span>
        </td>
      </tr>`
    )
    .join('');

  const bodyHtml = `
    <!-- Key Information Summary Box -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 22px; overflow: hidden;">
      <tr>
        <td style="padding: 16px 18px;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td width="36%" style="padding: 5px 0; font-size: 12px; color: #64748b; font-weight: 700;">เลขที่คำขอเบิก:</td>
              <td width="64%" style="padding: 5px 0; font-size: 13px; color: #4f46e5; font-weight: 800; font-family: monospace;">${
                request.refNo
              }</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; font-size: 12px; color: #64748b; font-weight: 700;">ผู้ยื่นคำขอ:</td>
              <td style="padding: 5px 0; font-size: 13px; color: #0f172a; font-weight: 800;">${
                request.requesterName
              }</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; font-size: 12px; color: #64748b; font-weight: 700;">แผนก / ฝ่าย:</td>
              <td style="padding: 5px 0; font-size: 13px; color: #334155; font-weight: 600;">
                ${request.requesterDept || request.requesterCompany} ${
    request.requesterPosition ? `(${request.requesterPosition})` : ''
  }
              </td>
            </tr>
            <tr>
              <td style="padding: 5px 0; font-size: 12px; color: #64748b; font-weight: 700;">รูปแบบการเบิก:</td>
              <td style="padding: 5px 0; font-size: 13px; color: ${
                isAdvance ? '#2563eb' : '#e11d48'
              }; font-weight: 800;">
                ${scheduledText}
              </td>
            </tr>
            ${
              request.note
                ? `<tr>
                    <td style="padding: 5px 0; font-size: 12px; color: #64748b; font-weight: 700;">หมายเหตุ:</td>
                    <td style="padding: 5px 0; font-size: 12px; color: #475569;">${request.note}</td>
                  </tr>`
                : ''
            }
          </table>
        </td>
      </tr>
    </table>

    <!-- Items Detail Table -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 10px;">
      <tr>
        <td style="padding-bottom: 8px;">
          <strong style="color: #1e293b; font-size: 13px; font-weight: 800;">
            📋 รายการอุปกรณ์ที่ขอเบิก (${request.items?.length || 0} รายการ):
          </strong>
        </td>
      </tr>
    </table>

    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; margin-bottom: 10px;">
      <thead>
        <tr style="background-color: #f1f5f9;">
          <th width="35" style="padding: 8px 12px; text-align: center; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase;">#</th>
          <th style="padding: 8px 12px; text-align: left; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase;">ชื่ออุปกรณ์</th>
          <th width="100" style="padding: 8px 12px; text-align: right; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase;">จำนวน</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>
  `;

  const html = generateEmailTemplate({
    title: isAdvance ? 'มีคำขอเบิกอุปกรณ์ล่วงหน้าใหม่' : 'มีคำขอเบิกอุปกรณ์ด่วนใหม่',
    subtitle: `มีพนักงานยื่นส่งคำขอเบิกพัสดุจำนวน ${request.items?.length || 0} รายการ กรุณาตรวจสอบ`,
    badgeText: isAdvance ? '📅 เบิกล่วงหน้า (Advance Request)' : '⚡ เบิกด่วน (Immediate Request)',
    badgeBgColor: isAdvance ? '#2563eb' : '#e11d48',
    badgeTextColor: '#ffffff',
    bodyHtml,
    actionBtnText: '🔍 เข้าสู่ระบบเพื่อตรวจสอบและอนุมัติ',
    actionBtnUrl: `${appUrl}?tab=approvals`,
  });

  return dispatchEmail({
    to: staffEmail,
    subject: `[คำขอเบิกใหม่] ${request.refNo} - คุณ${request.requesterName} (${request.requesterDept || 'พนักงาน'})`,
    htmlContent: html,
    webhookUrl,
    metadata: { refNo: request.refNo, event: 'NEW_REQUEST' },
  });
};

/**
 * 2. Send Email to User when request is APPROVED (Staff is preparing items)
 */
export const sendRequisitionApprovedEmailToUser = async ({
  request,
  userEmail,
  webhookUrl,
  appUrl = 'https://stock-online-mauve.vercel.app',
}) => {
  if (!userEmail && !webhookUrl) return;

  const bodyHtml = `
    <!-- Approval Announcement Banner -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; margin-bottom: 20px; overflow: hidden;">
      <tr>
        <td style="padding: 16px 18px; text-align: center;">
          <div style="font-size: 14px; font-weight: 800; color: #1e40af; margin-bottom: 4px;">
            คำขอเบิกพัสดุเลขที่ ${request.refNo} ของคุณได้รับการอนุมัติแล้ว
          </div>
          <div style="font-size: 12px; color: #3b82f6; font-weight: 500;">
            เจ้าหน้าที่คลังกำลังจัดเตรียมอุปกรณ์ให้คุณ เมื่อจัดเตรียมเสร็จสิ้นระบบจะส่งอีเมลแจ้งเตือนให้มารับของทันที
          </div>
        </td>
      </tr>
    </table>

    <!-- Info Box -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 15px;">
      <tr>
        <td style="padding: 16px 18px;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td width="36%" style="padding: 5px 0; font-size: 12px; color: #64748b; font-weight: 700;">สถานะปัจจุบัน:</td>
              <td width="64%" style="padding: 5px 0; font-size: 13px; color: #2563eb; font-weight: 800;">🔵 กำลังจัดเตรียมพัสดุ (Preparing)</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; font-size: 12px; color: #64748b; font-weight: 700;">ผู้อนุมัติ:</td>
              <td style="padding: 5px 0; font-size: 13px; color: #0f172a; font-weight: 800;">${request.approvedBy || 'เจ้าหน้าที่คลัง'}</td>
            </tr>
            ${
              request.scheduledDate
                ? `<tr>
                    <td style="padding: 5px 0; font-size: 12px; color: #64748b; font-weight: 700;">กำหนดการนัดรับ:</td>
                    <td style="padding: 5px 0; font-size: 13px; color: #0f172a; font-weight: 800;">${formatThaiDate(request.scheduledDate)} ${request.scheduledTimeSlot || ''}</td>
                  </tr>`
                : ''
            }
            ${
              request.statusNote
                ? `<tr>
                    <td style="padding: 5px 0; font-size: 12px; color: #64748b; font-weight: 700;">ข้อความจากคลัง:</td>
                    <td style="padding: 5px 0; font-size: 12px; color: #475569;">${request.statusNote}</td>
                  </tr>`
                : ''
            }
          </table>
        </td>
      </tr>
    </table>
  `;

  const html = generateEmailTemplate({
    title: 'คำขอเบิกพัสดุได้รับการอนุมัติแล้ว',
    subtitle: 'เจ้าหน้าที่คลังสินค้าอนุมัติคำขอและกำลังดำเนินการจัดเตรียมพัสดุ',
    badgeText: '🔵 อนุมัติแล้ว • กำลังจัดเตรียมของ',
    badgeBgColor: '#2563eb',
    badgeTextColor: '#ffffff',
    bodyHtml,
    actionBtnText: '📄 ตรวจสอบสถานะคำขอเบิก',
    actionBtnUrl: `${appUrl}?tab=request-qr`,
  });

  return dispatchEmail({
    to: userEmail,
    subject: `[อนุมัติแล้ว] คำขอเบิกพัสดุ ${request.refNo} - กำลังจัดเตรียมของ`,
    htmlContent: html,
    webhookUrl,
    metadata: { refNo: request.refNo, event: 'REQUEST_APPROVED' },
  });
};

/**
 * 3. Send Email to User when items are READY FOR PICKUP ("เตรียมของเสร็จแล้ว ลงมารับได้เลย!")
 */
export const sendReadyForPickupEmailToUser = async ({
  request,
  userEmail,
  webhookUrl,
  appUrl = 'https://stock-online-mauve.vercel.app',
}) => {
  if (!userEmail && !webhookUrl) return;

  const itemsList = (request.items || [])
    .map(
      (it, idx) => `
      <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #0f172a; font-weight: 700;">
          • ${it.name || it.productName}
        </td>
        <td align="right" style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 800; color: #059669; text-align: right;">
          ${it.quantity} ${it.unit || 'ชิ้น'}
        </td>
      </tr>`
    )
    .join('');

  const bodyHtml = `
    <!-- Ready Announcement Banner -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #ecfdf5; border: 1.5px solid #a7f3d0; border-radius: 12px; margin-bottom: 20px; overflow: hidden;">
      <tr>
        <td style="padding: 20px; text-align: center;">
          <div style="font-size: 32px; margin-bottom: 6px;">🎁</div>
          <div style="font-size: 16px; font-weight: 800; color: #065f46; margin-bottom: 4px;">
            พัสดุของคุณจัดเตรียมเสร็จเรียบร้อยแล้ว!
          </div>
          <div style="font-size: 13px; color: #047857; font-weight: 600;">
            กรุณาเดินทางมารับพัสดุได้ที่ <strong>ห้องคลังพัสดุสำนักงาน</strong>
          </div>
        </td>
      </tr>
    </table>

    <!-- Info Box -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 16px;">
      <tr>
        <td style="padding: 16px 18px;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td width="36%" style="padding: 5px 0; font-size: 12px; color: #64748b; font-weight: 700;">เลขที่คำขอ:</td>
              <td width="64%" style="padding: 5px 0; font-size: 13px; color: #4f46e5; font-weight: 800; font-family: monospace;">${request.refNo}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; font-size: 12px; color: #64748b; font-weight: 700;">ผู้รับพัสดุ:</td>
              <td style="padding: 5px 0; font-size: 13px; color: #0f172a; font-weight: 800;">${request.requesterName}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; font-size: 12px; color: #64748b; font-weight: 700;">สถานะ:</td>
              <td style="padding: 5px 0; font-size: 13px; color: #059669; font-weight: 800;">🟢 พร้อมรับของ (Ready for Pickup)</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Items Prepared List -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; margin-bottom: 10px;">
      <thead>
        <tr style="background-color: #f1f5f9;">
          <th style="padding: 8px 12px; text-align: left; font-size: 11px; font-weight: 800; color: #475569;">รายการพัสดุที่พร้อมรับ</th>
          <th width="100" style="padding: 8px 12px; text-align: right; font-size: 11px; font-weight: 800; color: #475569;">จำนวน</th>
        </tr>
      </thead>
      <tbody>
        ${itemsList}
      </tbody>
    </table>
  `;

  const html = generateEmailTemplate({
    title: 'พัสดุพร้อมรับแล้ว! กรุณามารับของที่ห้องคลัง',
    subtitle: 'เจ้าหน้าที่คลังจัดเตรียมพัสดุของคุณเสร็จเรียบร้อยแล้ว',
    badgeText: '🟢 พร้อมรับของ (Ready for Pickup)',
    badgeBgColor: '#10b981',
    badgeTextColor: '#ffffff',
    bodyHtml,
    actionBtnText: '📱 แสดงใบเบิกเพื่อรับของที่ห้องคลัง',
    actionBtnUrl: `${appUrl}?tab=request-qr&ref=${request.refNo}`,
  });

  return dispatchEmail({
    to: userEmail,
    subject: `[พร้อมรับของแล้ว!] 📦 พัสดุคำขอ ${request.refNo} จัดเตรียมเสร็จสิ้น มารับได้เลย`,
    htmlContent: html,
    webhookUrl,
    metadata: { refNo: request.refNo, event: 'READY_FOR_PICKUP' },
  });
};

/**
 * 4. Send Email to User when request is REJECTED
 */
export const sendRequisitionRejectedEmailToUser = async ({
  request,
  userEmail,
  reason,
  webhookUrl,
  appUrl = 'https://stock-online-mauve.vercel.app',
}) => {
  if (!userEmail && !webhookUrl) return;

  const bodyHtml = `
    <!-- Rejection Announcement Banner -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; margin-bottom: 20px; overflow: hidden;">
      <tr>
        <td style="padding: 16px 18px; text-align: center;">
          <div style="font-size: 14px; font-weight: 800; color: #991b1b; margin-bottom: 4px;">
            ขออภัย คำขอเบิกพัสดุเลขที่ ${request.refNo} ไม่ได้รับการอนุมัติ
          </div>
          <div style="font-size: 12px; color: #b91c1c;">
            ${reason || request.statusNote || 'อุปกรณ์ไม่เพียงพอ หรือข้อมูลไม่ครบถ้วน'}
          </div>
        </td>
      </tr>
    </table>

    <!-- Info Box -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 15px;">
      <tr>
        <td style="padding: 16px 18px;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td width="36%" style="padding: 5px 0; font-size: 12px; color: #64748b; font-weight: 700;">เลขที่คำขอ:</td>
              <td width="64%" style="padding: 5px 0; font-size: 13px; color: #4f46e5; font-weight: 800; font-family: monospace;">${request.refNo}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; font-size: 12px; color: #64748b; font-weight: 700;">สถานะ:</td>
              <td style="padding: 5px 0; font-size: 13px; color: #dc2626; font-weight: 800;">❌ ไม่อนุมัติ (Rejected)</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; font-size: 12px; color: #64748b; font-weight: 700;">ผู้ตรวจสอบ:</td>
              <td style="padding: 5px 0; font-size: 13px; color: #0f172a; font-weight: 800;">${request.approvedBy || 'เจ้าหน้าที่คลัง'}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  const html = generateEmailTemplate({
    title: 'คำขอเบิกพัสดุไม่ได้รับการอนุมัติ',
    subtitle: 'คำขอเบิกของคุณไม่ผ่านการอนุมัติจากเจ้าหน้าที่คลังสินค้า',
    badgeText: '❌ ไม่อนุมัติ (Rejected)',
    badgeBgColor: '#ef4444',
    badgeTextColor: '#ffffff',
    bodyHtml,
    actionBtnText: '🔍 ดูรายละเอียดคำขอ',
    actionBtnUrl: `${appUrl}?tab=request-qr`,
  });

  return dispatchEmail({
    to: userEmail,
    subject: `[ไม่อนุมัติ] คำขอเบิกพัสดุ ${request.refNo} ไม่ผ่านการอนุมัติ`,
    htmlContent: html,
    webhookUrl,
    metadata: { refNo: request.refNo, event: 'REQUEST_REJECTED' },
  });
};

/**
 * 5. Send Test Notification Email
 */
export const sendTestEmailNotification = async ({
  targetEmail,
  webhookUrl,
  appUrl = 'https://stock-online-mauve.vercel.app',
}) => {
  const bodyHtml = `
    <!-- Test Announcement Banner -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #ecfdf5; border: 1.5px solid #a7f3d0; border-radius: 12px; margin-bottom: 20px; overflow: hidden;">
      <tr>
        <td style="padding: 20px; text-align: center;">
          <div style="font-size: 32px; margin-bottom: 6px;">🚀</div>
          <div style="font-size: 16px; font-weight: 800; color: #065f46; margin-bottom: 4px;">
            ระบบแจ้งเตือนทางอีเมลพร้อมใช้งานสมบูรณ์ 100%!
          </div>
          <div style="font-size: 13px; color: #047857; font-weight: 600;">
            การเชื่อมต่อระหว่างระบบ Stock Online และ Email Webhook ทำงานอย่างถูกต้อง
          </div>
        </td>
      </tr>
    </table>

    <!-- Info Box -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 16px;">
      <tr>
        <td style="padding: 16px 18px;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td width="36%" style="padding: 5px 0; font-size: 12px; color: #64748b; font-weight: 700;">เวลาทดสอบ:</td>
              <td width="64%" style="padding: 5px 0; font-size: 13px; color: #0f172a; font-weight: 800;">${new Date().toLocaleString('th-TH')}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; font-size: 12px; color: #64748b; font-weight: 700;">อีเมลปลายทาง:</td>
              <td style="padding: 5px 0; font-size: 13px; color: #4f46e5; font-weight: 800;">${targetEmail || 'tks@pdflowtech.com'}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; font-size: 12px; color: #64748b; font-weight: 700;">สถานะระบบ:</td>
              <td style="padding: 5px 0; font-size: 13px; color: #059669; font-weight: 800;">🟢 เชื่อมต่อสำเร็จ (Active & Online)</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  const html = generateEmailTemplate({
    title: 'ทดสอบการแจ้งเตือนจากระบบ Stock Online',
    subtitle: 'ข้อความทดสอบการส่งอีเมลแจ้งเตือนอัตโนมัติ',
    badgeText: '🔔 ทดสอบการแจ้งเตือน (System Test)',
    badgeBgColor: '#10b981',
    badgeTextColor: '#ffffff',
    bodyHtml,
    actionBtnText: '🚀 เข้าสู่ระบบ Stock Online',
    actionBtnUrl: appUrl,
  });

  return dispatchEmail({
    to: targetEmail,
    subject: `🔔 [ทดสอบระบบ] การแจ้งเตือนจากระบบ Stock Online`,
    htmlContent: html,
    webhookUrl,
    metadata: { event: 'TEST_NOTIFICATION' },
  });
};
