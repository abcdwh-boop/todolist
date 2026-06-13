import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  orderBy
} from 'firebase/firestore';

// Firebase configuration using Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Authentication helper functions
export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  // Get user role from Firestore
  const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
  if (userDoc.exists()) {
    return { user: userCredential.user, role: userDoc.data().role };
  }
  // Default role if not specified
  return { user: userCredential.user, role: 'unknown' };
};

export const registerStudent = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Set student role in Firestore
  await setDoc(doc(db, 'users', user.uid), {
    email: user.email,
    role: 'student',
    createdAt: new Date().toISOString()
  });
  
  return { user, role: 'student' };
};

export const logoutUser = () => signOut(auth);

// Todo CRUD operations
export const todoService = {
  // Create a new Todo
  addTodo: async (task, userId, userRole, userEmail) => {
    return await addDoc(collection(db, 'todos'), {
      task,
      completed: false,
      createdBy: userId,
      createdByEmail: userEmail,
      creatorRole: userRole,
      createdAt: new Date().toISOString()
    });
  },
  
  // Read Todos (real-time stream)
  // Teachers can see all todos, students can only see their own
  subscribeTodos: (userId, userRole, callback) => {
    let q;
    if (userRole === 'teacher') {
      // Teachers can see everything, ordered by creation time
      q = query(collection(db, 'todos'), orderBy('createdAt', 'desc'));
    } else {
      // Students can only see their own
      q = query(
        collection(db, 'todos'), 
        where('createdBy', '==', userId),
        orderBy('createdAt', 'desc')
      );
    }
    
    return onSnapshot(q, (snapshot) => {
      const todos = [];
      snapshot.forEach((doc) => {
        todos.push({ id: doc.id, ...doc.data() });
      });
      callback(todos);
    });
  },
  
  // Update Todo (Toggle completion or update task text)
  updateTodo: async (todoId, updates) => {
    const todoRef = doc(db, 'todos', todoId);
    return await updateDoc(todoRef, updates);
  },
  
  // Delete Todo
  deleteTodo: async (todoId) => {
    const todoRef = doc(db, 'todos', todoId);
    return await deleteDoc(todoRef);
  }
};
