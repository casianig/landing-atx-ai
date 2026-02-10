const express = require('express');
const twilio = require('twilio');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
app.use(express.urlencoded({ extended: false }));

// OpenAI setup
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Twilio credentials - use environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);

// AI Receptionist webhook
app.post('/voice', async (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  
  // Gather speech input
  const gather = twiml.gather({
    input: 'speech',
    timeout: 3,
    speechTimeout: 'auto',
    action: '/handle-response',
    method: 'POST'
  });
  
  gather.say('Hello, thank you for calling. How can I help you today?');
  
  res.type('text/xml');
  res.send(twiml.toString());
});

// Handle AI response
app.post('/handle-response', async (req, res) => {
  const userSpeech = req.body.SpeechResult;
  const twiml = new twilio.twiml.VoiceResponse();
  
  try {
    // Send to OpenAI
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an AI receptionist for a local service business. 
          Be professional, helpful, and concise. 
          Gather: name, phone, service needed, preferred appointment time.
          Keep responses under 20 seconds when spoken.`
        },
        { role: 'user', content: userSpeech }
      ],
      max_tokens: 150
    });
    
    const aiResponse = completion.data.choices[0].message.content;
    
    twiml.say(aiResponse);
    
    // Continue conversation
    const gather = twiml.gather({
      input: 'speech',
      timeout: 3,
      speechTimeout: 'auto',
      action: '/handle-response',
      method: 'POST'
    });
    
  } catch (error) {
    console.error('AI Error:', error);
    twiml.say('I apologize, I did not catch that. Could you please repeat?');
    
    const gather = twiml.gather({
      input: 'speech',
      timeout: 3,
      speechTimeout: 'auto',
      action: '/handle-response',
      method: 'POST'
    });
  }
  
  res.type('text/xml');
  res.send(twiml.toString());
});

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'AI Receptionist running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AI Receptionist running on port ${PORT}`);
});

module.exports = app;
