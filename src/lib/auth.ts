'use client';

import { Auth, createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
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

  // Send email verification
  await sendEmailVerification(user);

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
  
  // Sign the user out until they verify their email
  await signOut(auth);

  return userCredential;
}

export async function logout(auth: Auth) {
  return await signOut(auth);
}
