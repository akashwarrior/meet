import CredentialsProvider from 'next-auth/providers/credentials';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/app/lib/firebase";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: 'email', type: 'text', placeholder: '', required: true },
                password: { label: 'password', type: 'password', placeholder: '', required: true },
            },
            async authorize(credentials: Record<"username" | "password", string> | undefined) {
                if (!credentials?.username || !credentials.password) {
                    return null;
                }

                try {
                    const user = await signInWithEmailAndPassword(auth, credentials.username, credentials.password)
                    return {
                        id: user.user.uid,
                        image: user.user.photoURL,
                        name: user.user.displayName,
                        email: user.user.email
                    };
                } catch (error) {
                    console.log(error);
                }
                return null;
            },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/signin',
    },
}