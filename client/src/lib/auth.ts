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
  return signInWithRedirect({ provider: 'Google' });
}

export async function signInWithApple() {
  return signInWithRedirect({ provider: 'Apple' });
}

export async function signInWithFacebook() {
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
