module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    const path = req.url.split('?')[0];
    
    // Twilio SMS webhook
    if (path === '/sms' && req.method === 'POST') {
        const { From, Body, FromCity, FromState } = req.body || {};
        
        const lead = {
            id: Date.now(),
            phone: From,
            message: (Body || '').trim(),
            city: FromCity || 'Unknown',
            state: FromState || 'Unknown',
            source: 'sms',
            timestamp: new Date().toISOString(),
            status: 'new',
            tags: []
        };
        
        // Parse intent from message
        const msgLower = (Body || '').toLowerCase();
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
            reply = `Great choice! Our strategy session will give you a clear automation roadmap. Book here: [CALENDLY_LINK] - Alex`;
        } else {
            reply = `Thanks for texting ATX AI Solutions! I'm Alex - I'll reach out shortly to see how we can help automate your business. Text STOP to unsubscribe.`;
        }
        
        console.log(`[LEAD] ${From}: ${(Body || '').substring(0, 50)}...`);
        
        // Twilio expects TwiML response
        res.setHeader('Content-Type', 'application/xml');
        res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>${reply}</Message>
</Response>`);
        return;
    }
    
    // Health check
    if (path === '/health') {
        res.status(200).json({ status: 'ok', service: 'atx-ai-sms-webhook' });
        return;
    }
    
    res.status(404).send('Not found');
};
