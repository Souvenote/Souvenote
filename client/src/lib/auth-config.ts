import { Amplify } from 'aws-amplify';

const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
const userPoolClientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
const redirectSignIn = process.env.NEXT_PUBLIC_REDIRECT_SIGN_IN || 'http://localhost:3000/';
const redirectSignOut = process.env.NEXT_PUBLIC_REDIRECT_SIGN_OUT || 'http://localhost:3000/';

const basicAuthConfigured =
  Boolean(userPoolId) &&
  Boolean(userPoolClientId) &&
  !userPoolId?.includes('XXXXXXXX') &&
  !userPoolClientId?.includes('xxxxxxxx');

const oauthConfigured =
  Boolean(domain) &&
  !domain?.includes('your-domain');

const cognitoConfig = basicAuthConfigured
  ? {
      Auth: {
        Cognito: {
          userPoolId: userPoolId!,
          userPoolClientId: userPoolClientId!,
          ...(oauthConfigured
            ? {
                loginWith: {
                  oauth: {
                    domain: domain!,
                    scopes: ['openid', 'email', 'phone'],
                    redirectSignIn: [redirectSignIn],
                    redirectSignOut: [redirectSignOut],
                    responseType: 'code' as const,
                  },
                },
              }
            : {}),
        },
      },
    }
  : null;

if (cognitoConfig) {
  Amplify.configure(cognitoConfig);
}

export default cognitoConfig;
