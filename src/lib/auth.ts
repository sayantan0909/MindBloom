'use client';

import { Auth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { Firestore, doc, serverTimestamp, setDoc } from 'firebase/firestore';

export async function register(
  auth: Auth,
  firestore: Firestore,
  email: string,
  password: string,
  extraData: { name: string }
) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Create user document in Firestore
  const userRef = doc(firestore, 'users', user.uid);
  await setDoc(userRef, {
    id: user.uid,
    email: user.email,
    name: extraData.name,
    createdAt: serverTimestamp(),
    role: 'student',
    preferredLanguage: 'en'
  });

  return userCredential;
}

export async function logout(auth: Auth) {
  return await signOut(auth);
}
