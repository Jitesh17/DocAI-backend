const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccountPath = process.env.NODE_ENV === 'production'
  ? '/etc/secrets/serviceAccountKey.json'  // Path in Render
  : '../secrets/serviceAccountKey.json';    // Path in local development

if (fs.existsSync(serviceAccountPath)) {
  console.log('Service account file exists');
  const serviceAccount = require(serviceAccountPath);
} else {
  console.log('Service account file does not exist');
}

const serviceAccount = require(serviceAccountPath);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();

module.exports = { auth };