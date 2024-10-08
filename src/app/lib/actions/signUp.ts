'use server'

import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";

export async function signUp(email: string, password: string, name: string) {
    try {
        const snapshot = await getDoc(doc(db, "count", "users"));
        const count = snapshot?.data()?.count + 1;
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateDoc(doc(db, "count", "users"), { count });
        await updateProfile(userCredential.user, { displayName: name, photoURL: count.toString() });
        await setDoc(doc(db, count.toString(), "details"), { uid: count });
    } catch (error) {
        console.log(error);
        throw new Error("Failed to create account");
    }
}