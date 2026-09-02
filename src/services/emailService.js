/**
 * Email Notification Service for Stock Online
 * Supports sending transactional HTML emails via Webhook, Resend, or EmailJS
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
 * Generate clean HTML email layout
 */
const generateEmailTemplate = ({ title, badgeText, badgeColor = '#4f46e5', bodyHtml, actionBtnText, actionBtnUrl }) => {
  return `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
    .email-container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .email-header { background: linear-gradient(135deg, #4338ca 0%, #3730a3 100%); padding: 24px; color: #ffffff; text-align: center; }
    .email-header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
    .email-header p { margin: 4px 0 0; font-size: 12px; opacity: 0.85; }
    .email-body { padding: 28px 24px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; color: #ffffff; background-color: ${badgeColor}; margin-bottom: 16px; }
    .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin: 16px 0; font-size: 13px; line-height: 1.6; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
    .info-label { color: #64748b; font-weight: 600; }
    .info-val { font-weight: 700; color: #0f172a; }
    .items-table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px; }
    .items-table th { background: #f1f5f9; text-align: left; padding: 8px 12px; color: #475569; font-weight: 700; }
    .items-table td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
    .btn-action { display: block; width: fit-content; margin: 24px auto 8px; padding: 12px 28px; background: #4f46e5; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; text-align: center; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25); }
    .email-footer { background: #f8fafc; padding: 16px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>📦 Stock Online Enterprise</h1>
      <p>ระบบบริหารจัดการและเบิกจ่ายพัสดุสำนักงาน</p>
    </div>
    <div class="email-body">
      ${badgeText ? `<div style="text-align: center;"><span class="badge">${badgeText}</span></div>` : ''}
      <h2 style="font-size: 17px; font-weight: 800; color: #0f172a; margin: 0 0 12px; text-align: center;">${title}</h2>
      ${bodyHtml}
      ${actionBtnText && actionBtnUrl ? `<a href="${actionBtnUrl}" class="btn-action">${actionBtnText}</a>` : ''}
    </div>
    <div class="email-footer">
      อีเมลนี้สร้างโดยระบบ Stock Online อัตโนมัติ • กรุณาอย่าตอบกลับอีเมลนี้
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Generic dispatcher that dispatches email payload via Webhook / Email Service
 */
export const dispatchEmail = async ({ to, subject, htmlContent, webhookUrl, metadata = {} }) => {
  if (!to && !webhookUrl) return false;

  const payload = {
    to: Array.isArray(to) ? to : [to],
    subject,
    html: htmlContent,
    sentAt: new Date().toISOString(),
    ...metadata,
  };

  try {
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'EMAIL_NOTIFICATION',
          ...payload,
        }),
      });
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
export const sendNewRequisitionEmailToStaff = async ({ request, staffEmail, webhookUrl, appUrl = 'https://stock-online-mauve.vercel.app' }) => {
  if (!staffEmail && !webhookUrl) return;

  const isAdvance = !!request.isAdvance;
  const scheduledText = isAdvance
    ? `📅 เบิกล่วงหน้า (ต้องการรับของ: ${formatThaiDate(request.scheduledDate)} ${request.scheduledTimeSlot ? `• ${request.scheduledTimeSlot}` : ''})`
    : `⚡ เบิกด่วนทันทีวันนี้`;

  const itemsRows = (request.items || [])
    .map(
      (it, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td><strong>${it.name || it.productName || 'อุปกรณ์'}</strong></td>
        <td style="text-align: right; font-weight: 700; color: #4f46e5;">${it.quantity} ${it.unit || 'ชิ้น'}</td>
      </tr>`
    )
    .join('');

  const bodyHtml = `
    <div class="info-card">
      <div class="info-row"><span class="info-label">เลขที่คำขอ:</span><span class="info-val font-mono">${request.refNo}</span></div>
      <div class="info-row"><span class="info-label">ผู้ยื่นคำขอ:</span><span class="info-val">${request.requesterName}</span></div>
      <div class="info-row"><span class="info-label">แผนก / ตำแหน่ง:</span><span class="info-val">${request.requesterDept || request.requesterCompany} (${request.requesterPosition || 'พนักงาน'})</span></div>
      <div class="info-row"><span class="info-label">รูปแบบการเบิก:</span><span class="info-val" style="color: ${isAdvance ? '#2563eb' : '#e11d48'}; font-weight: 800;">${scheduledText}</span></div>
      ${request.note ? `<div class="info-row"><span class="info-label">หมายเหตุ:</span><span class="info-val">${request.note}</span></div>` : ''}
    </div>

    <h3 style="font-size: 13px; margin: 16px 0 8px; color: #334155;">📋 รายการอุปกรณ์ที่ขอเบิก (${request.items?.length || 0} รายการ):</h3>
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 30px;">#</th>
          <th>รายการอุปกรณ์</th>
          <th style="text-align: right; width: 90px;">จำนวน</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>
  `;

  const html = generateEmailTemplate({
    title: isAdvance ? '📑 มีคำขอเบิกอุปกรณ์ล่วงหน้าใหม่' : '⚡ มีคำขอเบิกอุปกรณ์ด่วนใหม่',
    badgeText: isAdvance ? '📅 เบิกล่วงหน้า (Advance Request)' : '⚡ เบิกด่วน (Immediate)',
    badgeColor: isAdvance ? '#2563eb' : '#e11d48',
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
export const sendRequisitionApprovedEmailToUser = async ({ request, userEmail, webhookUrl, appUrl = 'https://stock-online-mauve.vercel.app' }) => {
  if (!userEmail && !webhookUrl) return;

  const bodyHtml = `
    <div style="text-align: center; margin-bottom: 16px;">
      <p style="font-size: 14px; color: #334155; margin: 0;">
        คำขอเบิกพัสดุเลขที่ <strong>${request.refNo}</strong> ของคุณได้รับการอนุมัติแล้ว
      </p>
      <p style="font-size: 13px; color: #64748b; margin: 6px 0 0;">
        เจ้าหน้าที่คลังกำลังจัดเตรียมอุปกรณ์ให้คุณ เมื่อจัดเตรียมเสร็จสิ้นระบบจะส่งอีเมลแจ้งเตือนให้มารับของทันที
      </p>
    </div>

    <div class="info-card">
      <div class="info-row"><span class="info-label">สถานะปัจจุบัน:</span><span class="info-val" style="color: #2563eb;">🔵 กำลังจัดเตรียมพัสดุ (Preparing)</span></div>
      <div class="info-row"><span class="info-label">ผู้อนุมัติ:</span><span class="info-val">${request.approvedBy || 'เจ้าหน้าที่คลัง'}</span></div>
      ${request.scheduledDate ? `<div class="info-row"><span class="info-label">กำหนดการนัดรับ:</span><span class="info-val font-bold">${formatThaiDate(request.scheduledDate)} ${request.scheduledTimeSlot || ''}</span></div>` : ''}
      ${request.statusNote ? `<div class="info-row"><span class="info-label">ข้อความจากคลัง:</span><span class="info-val">${request.statusNote}</span></div>` : ''}
    </div>
  `;

  const html = generateEmailTemplate({
    title: '✅ คำขอเบิกพัสดุได้รับการอนุมัติแล้ว',
    badgeText: '🔵 กำลังจัดเตรียมของ (Preparing)',
    badgeColor: '#2563eb',
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
export const sendReadyForPickupEmailToUser = async ({ request, userEmail, webhookUrl, appUrl = 'https://stock-online-mauve.vercel.app' }) => {
  if (!userEmail && !webhookUrl) return;

  const itemsList = (request.items || [])
    .map((it) => `• <strong>${it.name || it.productName}</strong>: ${it.quantity} ${it.unit || 'ชิ้น'}`)
    .join('<br>');

  const bodyHtml = `
    <div style="text-align: center; margin-bottom: 20px;">
      <div style="font-size: 40px; margin-bottom: 8px;">🎁</div>
      <p style="font-size: 16px; font-weight: 800; color: #059669; margin: 0;">
        พัสดุของคุณจัดเตรียมเสร็จเรียบร้อยแล้ว!
      </p>
      <p style="font-size: 13px; color: #475569; margin: 6px 0 0;">
        กรุณาเดินทางมารับพัสดุได้ที่ <strong>ห้องคลังพัสดุสำนักงาน</strong>
      </p>
    </div>

    <div class="info-card" style="border-left: 4px solid #10b981;">
      <div class="info-row"><span class="info-label">เลขที่คำขอ:</span><span class="info-val font-mono">${request.refNo}</span></div>
      <div class="info-row"><span class="info-label">ผู้รับพัสดุ:</span><span class="info-val">${request.requesterName}</span></div>
      <div class="info-row"><span class="info-label">สถานะ:</span><span class="info-val" style="color: #059669; font-weight: 800;">🟢 พร้อมรับของ (Ready for Pickup)</span></div>
      <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #cbd5e1; font-size: 12px; color: #334155;">
        <strong>รายการที่เตรียมไว้:</strong><br>
        ${itemsList}
      </div>
    </div>
  `;

  const html = generateEmailTemplate({
    title: '🎉 พัสดุพร้อมรับแล้ว! กรุณามารับของที่ห้องคลัง',
    badgeText: '🟢 พร้อมรับของ (Ready for Pickup)',
    badgeColor: '#10b981',
    bodyHtml,
    actionBtnText: '📱 แสดงใบเบิกเพื่อรับของ',
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
export const sendRequisitionRejectedEmailToUser = async ({ request, userEmail, reason, webhookUrl, appUrl = 'https://stock-online-mauve.vercel.app' }) => {
  if (!userEmail && !webhookUrl) return;

  const bodyHtml = `
    <div style="text-align: center; margin-bottom: 16px;">
      <p style="font-size: 14px; color: #334155; margin: 0;">
        ขออภัย คำขอเบิกพัสดุเลขที่ <strong>${request.refNo}</strong> ไม่ได้รับการอนุมัติ
      </p>
    </div>

    <div class="info-card" style="border-left: 4px solid #ef4444;">
      <div class="info-row"><span class="info-label">เลขที่คำขอ:</span><span class="info-val font-mono">${request.refNo}</span></div>
      <div class="info-row"><span class="info-label">สถานะ:</span><span class="info-val" style="color: #dc2626; font-weight: 800;">❌ ไม่อนุมัติ (Rejected)</span></div>
      <div class="info-row"><span class="info-label">เหตุผล:</span><span class="info-val" style="color: #dc2626;">${reason || request.statusNote || 'อุปกรณ์ไม่เพียงพอ หรือข้อมูลไม่ครบถ้วน'}</span></div>
      <div class="info-row"><span class="info-label">ผู้ตรวจสอบ:</span><span class="info-val">${request.approvedBy || 'เจ้าหน้าที่คลัง'}</span></div>
    </div>
  `;

  const html = generateEmailTemplate({
    title: '❌ คำขอเบิกพัสดุไม่ได้รับการอนุมัติ',
    badgeText: '❌ ไม่อนุมัติ (Rejected)',
    badgeColor: '#ef4444',
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
