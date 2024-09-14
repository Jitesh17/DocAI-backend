const admin = require('firebase-admin');

let serviceAccount;
if (process.env.NODE_ENV === 'production') {
  try {
    serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);
    console.log('Successfully parsed SERVICE_ACCOUNT_KEY environment variable');
  } catch (error) {
    console.error('Error parsing SERVICE_ACCOUNT_KEY:', error);
  }
} else {
  serviceAccount = require('../secrets/serviceAccountKey.json');
}
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();

module.exports = { auth };