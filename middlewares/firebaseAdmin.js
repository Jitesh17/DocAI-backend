const admin = require('firebase-admin');

const serviceAccountPath = process.env.NODE_ENV === 'production'
  ? '/etc/secrets/serviceAccountKey.json'  // Path in Render
  : '../secrets/serviceAccountKey.json';    // Path in local development

const serviceAccount = require(serviceAccountPath);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();

module.exports = { auth };