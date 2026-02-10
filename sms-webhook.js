#!/usr/bin/env node
/**
 * Twilio SMS Webhook Handler for ATX AI Solutions
 * Receives SMS messages and stores leads
 * 
 * Setup:
 * 1. Deploy this to a server (Vercel, Railway, etc.)
 * 2. Set webhook URL in Twilio: https://your-domain.com/sms
 * 3. Configure environment variables
 */

const http = require('http');
const url = require('url');
const fs = require('fs').promises;
const path = require('path');

const PORT = process.env.PORT || 3000;
const LEADS_FILE = path.join(__dirname, 'leads.json');

// Simple in-memory storage (use DB in production)
let leads = [];

async function loadLeads() {
    try {
        const data = await fs.readFile(LEADS_FILE, 'utf8');
        leads = JSON.parse(data);
    } catch (e) {
        leads = [];
    }
}

async function saveLeads() {
    await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2));
}

function formatPhone(phone) {
    return phone.replace(/\D/g, '').replace(/^(\d{1})/, '+1$1');
}

async function handleSMS(body) {
    const params = new URLSearchParams(body);
    const from = params.get('From');
    const message = params.get('Body') || '';
    const city = params.get('FromCity') || 'Unknown';
    const state = params.get('FromState') || 'Unknown';
    
    const lead = {
        id: Date.now(),
        phone: from,
        message: message.trim(),
        city,
        state,
        source: 'sms',
        timestamp: new Date().toISOString(),
        status: 'new',
        tags: []
    };
    
    // Parse intent from message
    const msgLower = message.toLowerCase();
    if (msgLower.includes('chatbot') || msgLower.includes('bot')) {
        lead.interest = 'chatbot';
        lead.tags.push('chatbot');
    } else if (msgLower.includes('automation') || msgLower.includes('full')) {
        lead.interest = 'full_automation';
        lead.tags.push('full_automation');
    } else if (msgLower.includes('consult') || msgLower.includes('strategy') || msgLower.includes('session')) {
        lead.interest = 'consultation';
        lead.tags.push('consultation');
    } else {
        lead.interest = 'general';
    }
    
    // Auto-reply based on interest
    let reply = '';
    if (lead.interest === 'chatbot') {
        reply = `Thanks for your interest in our AI Chatbot! I'll text you shortly to schedule a quick call. - Alex @ ATX AI Solutions`;
    } else if (lead.interest === 'full_automation') {
        reply = `Thanks! Full automation can transform your business. Let's chat about your needs - I'll text you shortly. - Alex @ ATX AI Solutions`;
    } else if (lead.interest === 'consultation') {
        reply = `Great choice! Book your free 30-min strategy session here: https://calendly.com/alex-atxaisolutions/30min - Alex @ ATX AI Solutions`;
    } else {
        reply = `Thanks for texting ATX AI Solutions! I'm Alex - I'll reach out shortly to see how we can help automate your business. Text STOP to unsubscribe.`;
    }
    
    leads.push(lead);
    await saveLeads();
    
    console.log(`[LEAD] ${from}: ${message.substring(0, 50)}...`);
    
    return reply;
}

const server = http.createServer(async (req, res) => {
    const parsed = url.parse(req.url, true);
    
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Twilio SMS webhook
    if (parsed.pathname === '/sms' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            const reply = await handleSMS(body);
            
            // Twilio expects TwiML response
            res.writeHead(200, { 'Content-Type': 'application/xml' });
            res.end(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>${reply}</Message>
</Response>`);
        });
        return;
    }
    
    // Get leads (protected endpoint)
    if (parsed.pathname === '/leads' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(leads.slice(-50).reverse(), null, 2));
        return;
    }
    
    // Health check
    if (parsed.pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', leads: leads.length }));
        return;
    }
    
    res.writeHead(404);
    res.end('Not found');
});

loadLeads().then(() => {
    server.listen(PORT, () => {
        console.log(`ATX AI Solutions SMS webhook running on port ${PORT}`);
        console.log(`Webhook URL: http://localhost:${PORT}/sms`);
        console.log(`Leads endpoint: http://localhost:${PORT}/leads`);
    });
});