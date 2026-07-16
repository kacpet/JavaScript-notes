import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';

import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';

import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyCQ_vLym7jl5NZVaPLrs5NlHwMbCfSlmvM',

  authDomain: 'notes-3c60f.firebaseapp.com',

  projectId: 'notes-3c60f',

  storageBucket: 'notes-3c60f.firebasestorage.app',

  messagingSenderId: '399103790950',

  appId: '1:399103790950:web:6838ef76e393041eb602a7',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);
