const core = require('@actions/core');
const github = require('@actions/github');
const admin = require('firebase-admin');

(async () => {
  try {
    const firebaseKey = core.getInput('firebase-key', { required: true });

    // save statistics to db
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(Buffer.from(firebaseKey, 'base64').toString('utf-8'))),
    });

    const db = admin.firestore();
    const author = github.context;
    const type = process.env.GITHUB_EVENT_NAME;
    const dbt_state = process.env.DBT_RUN_STATE || 'no_dbt';
    const wholeEnv = process.env

    const docRef = db.collection('usersGitHub').doc(author.payload.sender.id.toString());
    await docRef.set(
      {
        author,
        wholeEnv,
        [type]: admin.firestore.FieldValue.increment(1),
        [dbt_state]: admin.firestore.FieldValue.increment(1),
      },
      { merge: true }
    );
  } catch (error) {
    core.setFailed(error.message);
  }
})();