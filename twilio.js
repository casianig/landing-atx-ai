const twilio = require('twilio');

// Twilio credentials - use environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = twilio(accountSid, authToken);

// Buy a phone number for testing
async function buyPhoneNumber() {
  try {
    const numbers = await client.availablePhoneNumbers('US')
      .local
      .list({ areaCode: 512, limit: 1 }); // Austin area code
    
    if (numbers.length === 0) {
      console.log('No 512 numbers available, trying any US number...');
      const anyNumbers = await client.availablePhoneNumbers('US')
        .local
        .list({ limit: 1 });
      
      if (anyNumbers.length === 0) {
        console.log('No numbers available');
        return;
      }
      
      const purchasedNumber = await client.incomingPhoneNumbers.create({
        phoneNumber: anyNumbers[0].phoneNumber,
        friendlyName: 'ATX AI Receptionist'
      });
      
      console.log('Purchased:', purchasedNumber.phoneNumber);
      return purchasedNumber.phoneNumber;
    }
    
    const purchasedNumber = await client.incomingPhoneNumbers.create({
      phoneNumber: numbers[0].phoneNumber,
      friendlyName: 'ATX AI Receptionist'
    });
    
    console.log('Purchased Austin number:', purchasedNumber.phoneNumber);
    return purchasedNumber.phoneNumber;
  } catch (error) {
    console.error('Error buying number:', error.message);
  }
}

// List current numbers
async function listNumbers() {
  try {
    const numbers = await client.incomingPhoneNumbers.list();
    console.log('Your Twilio numbers:');
    numbers.forEach(n => console.log(`  ${n.phoneNumber} - ${n.friendlyName}`));
  } catch (error) {
    console.error('Error listing numbers:', error.message);
  }
}

module.exports = { client, buyPhoneNumber, listNumbers };
