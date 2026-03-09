// hooks/useUserRole.ts
// Fetches the current user's role from Firestore and watches for changes in real time.

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export type UserRole = 'user' | 'staff' | 'admin';

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  verified: boolean;
  createdAt: string;
  phone?: string;
  street?: string;
  city?: string;
  zip?: string;
  idType?: string;
  idNumber?: string;
  idImageUrl?: string;
}

export function useUserRole(currentUser: User | null) {
  const [role, setRole] = useState<UserRole>('user');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setRole('user');
      setUserData(null);
      setRoleLoading(false);
      return;
    }

    // Create user doc if it doesn't exist yet (first login)
    const userRef = doc(db, 'users', currentUser.uid);

    const ensureUserDoc = async () => {
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || '',
          role: 'user',
          verified: false,
          createdAt: new Date().toISOString(),
        });
      }
    };

    ensureUserDoc();

    // Listen in real time so role changes in Firestore take effect immediately
    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as UserData;
        setRole(data.role || 'user');
        setUserData(data);
      }
      setRoleLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return { role, userData, roleLoading };
}