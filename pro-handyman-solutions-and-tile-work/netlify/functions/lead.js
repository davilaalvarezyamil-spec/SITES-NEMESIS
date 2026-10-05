// Receives the quote form and sends it to the business by email (Resend) and text (Twilio).
// Set these in Netlify > Site settings > Environment variables:
//   RESEND_API_KEY, LEAD_EMAIL_TO, LEAD_EMAIL_FROM (a sender on a domain verified in Resend)
//   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM (+18135550100), LEAD_SMS_TO (+18135550142)
// Either channel can be left unset; the other still works.
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };
  let d;
  try { d = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, body: 'Bad JSON' }; }
  if (d.company) return { statusCode: 200, body: 'ok' }; // honeypot: bots fill the hidden field

  const clean = (s, n = 500) => String(s || '').replace(/[\r\n]+/g, ' ').trim().slice(0, n);
  const lead = {
    first: clean(d.firstName, 60), last: clean(d.lastName, 60), phone: clean(d.phone, 20),
    email: clean(d.email, 120), problem: clean(d.problem, 1000), isNew: clean(d.newCustomer, 3)
  };
  if (!lead.first || !lead.last || !lead.phone || !lead.email || !lead.problem || !lead.isNew) {
    return { statusCode: 422, body: 'Missing fields' };
  }

  const e = process.env;
  const text = `New quote request\n${lead.first} ${lead.last}\n${lead.phone}\n${lead.email}\nNew customer: ${lead.isNew}\nProblem: ${lead.problem}`;
  const jobs = [];

  if (e.RESEND_API_KEY && e.LEAD_EMAIL_TO) {
    jobs.push(fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${e.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: e.LEAD_EMAIL_FROM || 'Website Leads <onboarding@resend.dev>',
        to: e.LEAD_EMAIL_TO.split(',').map(s => s.trim()),
        reply_to: lead.email,
        subject: `New quote request: ${lead.first} ${lead.last}${lead.isNew === 'Yes' ? ' (new customer)' : ''}`,
        text
      })
    }));
  }

  if (e.TWILIO_ACCOUNT_SID && e.TWILIO_AUTH_TOKEN && e.TWILIO_FROM && e.LEAD_SMS_TO) {
    const auth = Buffer.from(`${e.TWILIO_ACCOUNT_SID}:${e.TWILIO_AUTH_TOKEN}`).toString('base64');
    for (const to of e.LEAD_SMS_TO.split(',').map(s => s.trim())) {
      jobs.push(fetch(`https://api.twilio.com/2010-04-01/Accounts/${e.TWILIO_ACCOUNT_SID}/Messages.json`, {
        method: 'POST',
        headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ From: e.TWILIO_FROM, To: to, Body: text.slice(0, 1500) })
      }));
    }
  }

  if (!jobs.length) return { statusCode: 500, body: 'No delivery channel configured' };
  const results = await Promise.allSettled(jobs);
  const delivered = results.some(r => r.status === 'fulfilled' && r.value.ok);
  if (!delivered) console.error('Lead delivery failed', await Promise.all(results.map(async r => r.status === 'fulfilled' ? r.value.status + ' ' + (await r.value.text()) : String(r.reason))));
  return { statusCode: delivered ? 200 : 502, body: delivered ? 'ok' : 'Delivery failed' };
};
