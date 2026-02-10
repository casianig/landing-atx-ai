#!/usr/bin/env node
/**
 * Stripe Webhook Handler for ATX AI Solutions
 * Receives payment events and triggers audit delivery workflow
 * 
 * Setup:
 * 1. Deploy this alongside sms-webhook
 * 2. Add STRIPE_WEBHOOK_SECRET to environment
 * 3. Set webhook endpoint in Stripe Dashboard: https://your-domain.com/stripe-webhook
 * 4. Select events: checkout.session.completed, invoice.paid
 */

const crypto = require('crypto');
const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const PORT = process.env.PORT || 3002;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const AUDITS_FILE = path.join(__dirname, 'audits-pending.json');

// Verify Stripe signature
function verifySignature(payload, signature, secret) {
    const elements = signature.split(',');
    const signatureHash = elements.find(e => e.startsWith('v1='))?.split('v1=')[1];
    
    const expectedHash = crypto
        .createHmac('sha256', secret)
        .update(payload, 'utf8')
        .digest('hex');
    
    return signatureHash === expectedHash;
}

async function handleCheckoutCompleted(session) {
    const customerEmail = session.customer_email || session.customer_details?.email;
    const customerName = session.customer_details?.name || 'Customer';
    const amount = session.amount_total / 100;
    const service = session.metadata?.service || 'unknown';
    
    const audit = {
        id: session.id,
        email: customerEmail,
        name: customerName,
        amount,
        service,
        status: 'pending_intake',
        createdAt: new Date().toISOString(),
        intakeResponses: {}
    };
    
    // Save to pending audits
    let audits = [];
    try {
        const data = await fs.readFile(AUDITS_FILE, 'utf8');
        audits = JSON.parse(data);
    } catch (e) {
        audits = [];
    }
    audits.push(audit);
    await fs.writeFile(AUDITS_FILE, JSON.stringify(audits, null, 2));
    
    console.log(`[AUDIT ORDER] ${customerEmail} bought ${service} for $${amount}`);
    
    // TODO: Send intake email to customer
    // TODO: Notify me (Alex) via Telegram/email
    
    return audit;
}

const server = http.createServer(async (req, res) => {
    if (req.url === '/stripe-webhook' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            const signature = req.headers['stripe-signature'];
            
            if (!WEBHOOK_SECRET) {
                console.error('STRIPE_WEBHOOK_SECRET not set');
                res.writeHead(500);
                res.end('Webhook secret not configured');
                return;
            }
            
            if (!verifySignature(body, signature, WEBHOOK_SECRET)) {
                res.writeHead(400);
                res.end('Invalid signature');
                return;
            }
            
            const event = JSON.parse(body);
            
            if (event.type === 'checkout.session.completed') {
                await handleCheckoutCompleted(event.data.object);
            }
            
            res.writeHead(200);
            res.end('Received');
        });
        return;
    }
    
    if (req.url === '/audits' && req.method === 'GET') {
        try {
            const data = await fs.readFile(AUDITS_FILE, 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        } catch (e) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end('[]');
        }
        return;
    }
    
    res.writeHead(404);
    res.end('Not found');
});

server.listen(PORT, () => {
    console.log(`Stripe webhook handler running on port ${PORT}`);
});