#!/usr/bin/env node
/**
 * Project X - Cold Outreach System
 * Sends personalized emails to Austin businesses
 */

const nodemailer = require('nodemailer');

// Email config
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'alex@atxaisolutions.net',
    pass: 'tmsw fzrm bsgf ssnx'
  }
});

// Austin business prospects
const prospects = [
  { name: "Austin HVAC Pros", email: "info@austinhvacpros.com", trade: "HVAC" },
  { name: "Texas Roofing Co", email: "contact@texasroofingco.com", trade: "Roofing" },
  { name: "Austin Plumbing Solutions", email: "service@austinplumbing.com", trade: "Plumbing" },
  { name: "ATX Electric", email: "info@atxelectric.com", trade: "Electrician" },
  { name: "Hill Country Handyman", email: "hillcountry@handyman.com", trade: "Handyman" },
];

// Email template
function createEmail(business) {
  return {
    subject: `${business.name} - Automate Your Customer Service`,
    text: `Hi there,

I came across ${business.name} while looking for quality ${business.trade.toLowerCase()} contractors in Austin.

I'm Alex from ATX AI Solutions. We help local service businesses like yours automate customer service, scheduling, and lead qualification using AI.

What we do:
• AI chatbot that answers customer questions 24/7
• Automated appointment booking
• Lead qualification (so you only talk to serious prospects)
• Email follow-up automation

One of our HVAC clients in Austin gets 15+ qualified leads per week now, and their chatbot handles 80% of customer questions without them lifting a finger.

Worth a 10-minute call to see if it makes sense for ${business.name}?

Best,
Alex
ATX AI Solutions
alex@atxaisolutions.net
https://atxaisolutions.net

P.S. - No obligation, just showing you what's possible with AI.`,
    html: `<p>Hi there,</p>

<p>I came across <strong>${business.name}</strong> while looking for quality ${business.trade.toLowerCase()} contractors in Austin.</p>

<p>I'm Alex from <strong>ATX AI Solutions</strong>. We help local service businesses automate customer service, scheduling, and lead qualification using AI.</p>

<p><strong>What we do:</strong></p>
<ul>
<li>AI chatbot that answers customer questions 24/7</li>
<li>Automated appointment booking</li>
<li>Lead qualification (so you only talk to serious prospects)</li>
<li>Email follow-up automation</li>
</ul>

<p>One of our HVAC clients in Austin gets <strong>15+ qualified leads per week</strong> now, and their chatbot handles 80% of customer questions without them lifting a finger.</p>

<p>Worth a 10-minute call to see if it makes sense for ${business.name}?</p>

<p>Best,<br>
Alex<br>
ATX AI Solutions<br>
<a href="mailto:alex@atxaisolutions.net">alex@atxaisolutions.net</a><br>
<a href="https://atxaisolutions.net">atxaisolutions.net</a></p>

<p><em>P.S. - No obligation, just showing you what's possible with AI.</em></p>`
  };
}

// Send test email
async function sendTest() {
  try {
    const testEmail = createEmail(prospects[0]);
    const info = await transporter.sendMail({
      from: 'Alex <alex@atxaisolutions.net>',
      to: 'casianig@gmail.com',
      subject: '[TEST] ' + testEmail.subject,
      text: testEmail.text,
      html: testEmail.html
    });
    console.log('Test email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Test failed:', error.message);
    return false;
  }
}

// Send to all prospects
async function startOutreach() {
  console.log('Starting Project X outreach...\n');
  
  for (const prospect of prospects) {
    try {
      const email = createEmail(prospect);
      const info = await transporter.sendMail({
        from: 'Alex <alex@atxaisolutions.net>',
        to: prospect.email,
        subject: email.subject,
        text: email.text,
        html: email.html
      });
      console.log(`✅ Sent to ${prospect.name} (${prospect.email})`);
      
      // Wait 2-5 minutes between emails
      await new Promise(r => setTimeout(r, 180000));
    } catch (error) {
      console.error(`❌ Failed to send to ${prospect.name}:`, error.message);
    }
  }
  
  console.log('\nOutreach complete!');
}

// Run based on command
const command = process.argv[2];
if (command === 'test') {
  sendTest();
} else if (command === 'start') {
  startOutreach();
} else {
  console.log('Usage:');
  console.log('  node outreach.js test   - Send test email to yourself');
  console.log('  node outreach.js start  - Start full outreach campaign');
}
