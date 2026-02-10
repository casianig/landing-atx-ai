#!/usr/bin/env node
/**
 * Project X - 9-Minute AI Campaign
 * Sends cold emails to Austin businesses
 */

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'alex@atxaisolutions.net',
    pass: 'tmsw fzrm bsgf ssnx'
  }
});

// Austin prospects - HVAC, Roofing, Plumbing, Electric
const prospects = [
  { name: "Austin HVAC Solutions", email: "info@austinhvac.com" },
  { name: "Texas Roof Masters", email: "contact@texasroof.com" },
  { name: "ATX Plumbing Pro", email: "service@atxplumbing.com" },
  { name: "Austin Electric Co", email: "info@austinelectric.com" },
  { name: "Hill Country HVAC", email: "hillcountry@hvac.com" },
];

// 9-Minute AI Email
function createEmail(business) {
  return {
    subject: `9 minutes to automate ${business.name}'s customer service`,
    text: `Hi,

I built an AI system that answers your customer calls 24/7, books appointments, and qualifies leads.

Takes 9 minutes to set up. No tech skills needed.

I recorded a video showing exactly how it works:
https://atxaisolutions.net/9minute

Watch it. If you want it, it's $2,000 flat fee, 3-day delivery, done.

No calls. No demos. Just results.

Alex
ATX AI Solutions
alex@atxaisolutions.net

P.S. - Your competitors are already using this. Want to see how it works before they get too far ahead?`,
    html: `<p>Hi,</p>

<p>I built an AI system that answers your customer calls 24/7, books appointments, and qualifies leads.</p>

<p><strong>Takes 9 minutes to set up.</strong> No tech skills needed.</p>

<p>I recorded a video showing exactly how it works:<br>
<a href="https://atxaisolutions.net/9minute">https://atxaisolutions.net/9minute</a></p>

<p>Watch it. If you want it, it's <strong>$2,000 flat fee</strong>, 3-day delivery, done.</p>

<p>No calls. No demos. Just results.</p>

<p>Alex<br>
ATX AI Solutions<br>
<a href="mailto:alex@atxaisolutions.net">alex@atxaisolutions.net</a></p>

<p><em>P.S. - Your competitors are already using this. Want to see how it works before they get too far ahead?</em></p>`
  };
}

// Send campaign
async function startCampaign() {
  console.log('Starting Project X - 9-Minute AI Campaign\n');
  
  for (let i = 0; i < prospects.length; i++) {
    const prospect = prospects[i];
    try {
      const email = createEmail(prospect);
      const info = await transporter.sendMail({
        from: 'Alex <alex@atxaisolutions.net>',
        to: prospect.email,
        subject: email.subject,
        text: email.text,
        html: email.html
      });
      console.log(`✅ ${i+1}/${prospects.length} - Sent to ${prospect.name}`);
      
      // Wait 3 minutes between emails (don't spam)
      if (i < prospects.length - 1) {
        await new Promise(r => setTimeout(r, 180000));
      }
    } catch (error) {
      console.error(`❌ Failed to ${prospect.name}:`, error.message);
    }
  }
  
  console.log('\n✅ Campaign complete! Check for replies in inbox.');
}

// Run
startCampaign();
