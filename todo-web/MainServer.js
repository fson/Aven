import CloudContext from '../cloud-core/CloudContext';
import createEvalSource from '../cloud-core/createEvalSource';
import createCloudClient from '../cloud-core/createCloudClient';
import createProtectedSource from '../cloud-auth/createProtectedSource';
import startFSStorageSource from '../cloud-fs/startFSStorageSource';
import WebServer from '../aven-web/WebServer';
import SMSAgent from '../sms-agent-twilio/SMSAgent';
import EmailAgent from '../email-agent-sendgrid/EmailAgent';
import SMSAuthProvider from '../cloud-auth-sms/SMSAuthProvider';
import EmailAuthProvider from '../cloud-auth-email/EmailAuthProvider';
import RootAuthProvider from '../cloud-auth-root/RootAuthProvider';
import { hashSecureString } from '../cloud-utils/Crypto';
import { createReducerLambda } from '../cloud-core/useCloudReducer';
import { TaskReducer } from '../todo-app/FullHome';

import App from './App';

const getEnv = c => process.env[c];

const runServer = async () => {
  console.log('☁️ Starting Cloud 💨');

  // #0

  const storageSource = await startFSStorageSource({
    domain: 'todo.aven.io',
    dataDir: './db',
  });
  // const storageSource = await startPostgresStorageSource({
  //   config: 'postgresql://postgres:aven-test-password@localhost:5432/postgres',
  //   domains: ['todo.aven.io'],
  // })

  // #1
  // // To serve on port 8888:

  // await startSourceServer({
  //   source: storageSource,
  //   listenLocation: 8888
  // });

  // // To get source proxy from the client:

  // const source = createBrowserNetworkSource({
  //   authority: 'my.server.dev',
  //   useSSL: true,
  // });

  // #5
  const source = createEvalSource({
    source: storageSource,
    domain: 'todo.aven.io',
    evalDocs: {
      TaskReducer: createReducerLambda('TaskReducer', TaskReducer, []),
    },
  });

  // #3
  const emailAgent =
    process.env.SENDGRID_API_KEY &&
    EmailAgent({
      defaultFromEmail: 'Aven Todos <support@aven.io>',
      config: {
        sendgridAPIKey: process.env.SENDGRID_API_KEY,
      },
    });
  const emailAuthProvider =
    emailAgent &&
    EmailAuthProvider({
      agent: emailAgent,
    });

  const smsAgent =
    process.env.TWILIO_ACCOUNT_SID &&
    SMSAgent({
      defaultFromNumber: process.env.TWILIO_FROM_NUMBER,
      config: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
      },
    });
  const smsAuthProvider =
    smsAgent &&
    SMSAuthProvider({
      agent: smsAgent,
      getMessage: (authCode, verifyInfo, accountId) => {
        return `Todos App Auth Code: ${authCode}`;
      },
    });

  // UNSAFE, TESTING ONLY! DELETE ME BEFORE PRODUCTION!
  const rootAuthProvider = RootAuthProvider({
    rootPasswordHash: await hashSecureString('pw'),
  });

  const protectedSource = createProtectedSource({
    source,
    providers: [smsAuthProvider, emailAuthProvider, rootAuthProvider].filter(
      provider => provider
    ),
  });

  async function putPermission({ name, defaultRule }) {
    await protectedSource.dispatch({
      domain: 'todo.aven.io',
      type: 'PutPermissionRules',
      auth: {
        accountId: 'root',
        verificationInfo: {},
        verificationResponse: { password: 'pw' },
      },
      defaultRule,
      name,
    });
  }

  await putPermission({
    defaultRule: { canRead: true, canWrite: true },
    name: 'Todos',
  });
  await putPermission({
    defaultRule: { canRead: true, canWrite: true },
    name: 'Message',
  });
  await putPermission({
    defaultRule: { canRead: true, canWrite: true },
    name: 'TaskActions',
  });
  await putPermission({
    defaultRule: { canRead: true },
    name: 'TaskActions^TaskReducer',
  });

  // #2
  const client = createCloudClient({
    source: protectedSource,
    domain: 'todo.aven.io',
  });

  // #4
  const context = new Map();

  context.set(CloudContext, client);

  const webService = await WebServer({
    App,
    context,
    source: protectedSource,
    serverListenLocation: getEnv('PORT'),
    assets: require(process.env.RAZZLE_ASSETS_MANIFEST),
  });

  console.log('☁️️ Web Ready 🕸');

  return {
    close: async () => {
      await webService.close();
      await source.close();
    },
  };
};

export default runServer;
