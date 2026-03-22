import {
  signUp as amplifySignUp,
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  signInWithRedirect,
  confirmSignUp as amplifyConfirmSignUp,
  resetPassword as amplifyResetPassword,
  confirmResetPassword as amplifyConfirmResetPassword,
  getCurrentUser as amplifyGetCurrentUser,
  fetchAuthSession,
} from 'aws-amplify/auth';

const authEnv = {
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
  clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
  domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN,
  redirectSignIn: process.env.NEXT_PUBLIC_REDIRECT_SIGN_IN,
  redirectSignOut: process.env.NEXT_PUBLIC_REDIRECT_SIGN_OUT,
};

export function isAuthConfigured() {
  return Boolean(
    authEnv.userPoolId &&
      authEnv.clientId &&
      !authEnv.userPoolId.includes('XXXXXXXX') &&
      !authEnv.clientId.includes('xxxxxxxx')
  );
}

export function isOauthConfigured() {
  return Boolean(
    authEnv.domain &&
      authEnv.redirectSignIn &&
      authEnv.redirectSignOut &&
      !authEnv.domain.includes('your-domain')
  );
}

export function getAuthConfigErrorMessage() {
  return 'Authentication is not configured yet. Add your real Cognito values to client/.env.local and server/.env.';
}

export function getOauthConfigErrorMessage() {
  return 'Google sign-in is not configured yet. Add your Cognito domain and redirect URLs to client/.env.local.';
}

export function getAuthErrorMessage(error: unknown) {
  const name = typeof error === 'object' && error && 'name' in error ? String(error.name) : '';
  const message = typeof error === 'object' && error && 'message' in error ? String(error.message) : '';

  switch (name) {
    case 'UsernameExistsException':
      return 'An account with this email already exists.';
    case 'InvalidPasswordException':
      return 'Password does not meet Cognito requirements.';
    case 'CodeMismatchException':
      return 'That confirmation code is incorrect.';
    case 'ExpiredCodeException':
      return 'That confirmation code has expired.';
    case 'UserNotConfirmedException':
      return 'Please confirm your email before logging in.';
    case 'NotAuthorizedException':
      return 'Incorrect email or password.';
    case 'UserNotFoundException':
      return 'No account was found with that email.';
    default:
      return message || 'Authentication failed. Please try again.';
  }
}

export async function signUp(email: string, password: string, fullName: string) {
  return amplifySignUp({
    username: email,
    password,
    options: {
      userAttributes: {
        email,
        name: fullName,
      },
    },
  });
}

export async function confirmSignUp(email: string, code: string) {
  return amplifyConfirmSignUp({
    username: email,
    confirmationCode: code,
  });
}

export async function signIn(email: string, password: string) {
  return amplifySignIn({
    username: email,
    password,
  });
}

export async function signOut() {
  return amplifySignOut();
}

export async function signInWithGoogle() {
  if (!isOauthConfigured()) {
    throw new Error(getOauthConfigErrorMessage());
  }

  return signInWithRedirect({ provider: 'Google' });
}

export async function signInWithApple() {
  if (!isOauthConfigured()) {
    throw new Error(getOauthConfigErrorMessage());
  }

  return signInWithRedirect({ provider: 'Apple' });
}

export async function signInWithFacebook() {
  if (!isOauthConfigured()) {
    throw new Error(getOauthConfigErrorMessage());
  }

  return signInWithRedirect({ provider: 'Facebook' });
}

export async function resetPassword(email: string) {
  return amplifyResetPassword({ username: email });
}

export async function confirmResetPassword(
  email: string,
  code: string,
  newPassword: string
) {
  return amplifyConfirmResetPassword({
    username: email,
    confirmationCode: code,
    newPassword,
  });
}

export async function getCurrentUser() {
  return amplifyGetCurrentUser();
}

export async function getAccessToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.accessToken?.toString() ?? null;
  } catch {
    return null;
  }
}

export async function getIdToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString() ?? null;
  } catch {
    return null;
  }
}
