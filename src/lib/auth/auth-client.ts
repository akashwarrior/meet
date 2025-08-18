import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient({
  //you can pass client configuration here
});

export const { signIn, signOut, signUp, useSession } = authClient;
