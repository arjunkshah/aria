import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { User, Project, Repository, Changelog, AppNotification } from '../types';

// Firebase configuration - Real project settings
const firebaseConfig = {
  apiKey: "AIzaSyB_6F82vd6S4PWf3O9fr3MlSDdho6625H0",
  authDomain: "aria-changelog-reviewer.firebaseapp.com",
  projectId: "aria-changelog-reviewer",
  storageBucket: "aria-changelog-reviewer.firebasestorage.app",
  messagingSenderId: "921213738643",
  appId: "1:921213738643:web:55cea0c7da2b2a19967766",
  databaseURL: "https://aria-changelog-reviewer-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Auth service
export const authService = {
  // Sign in with email and password
  async signIn(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  // Sign up with email and password
  async signUp(email: string, password: string, name: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user profile in Firestore
    const userData: User = {
      id: userCredential.user.uid,
      email: email,
      name: name,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      settings: {
        theme: 'dark',
        notifications: true,
        autoGeneration: true,
        emailNotifications: true
      }
    };
    
    await setDoc(doc(db, 'users', userCredential.user.uid), userData);
    return userCredential.user;
  },

  // Sign out
  async signOut() {
    await signOut(auth);
  },

  // Get current user
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
};

// Firestore service
export const firestoreService = {
  // User operations
  async getUser(userId: string): Promise<User | null> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? userDoc.data() as User : null;
  },

  async updateUser(userId: string, userData: Partial<User>) {
    await updateDoc(doc(db, 'users', userId), userData);
  },

  // Project operations
  async createProject(project: Project) {
    await setDoc(doc(db, 'projects', project.id), project);
  },

  async getProjects(userId: string): Promise<Project[]> {
    const projectsQuery = query(
      collection(db, 'projects'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(projectsQuery);
    return snapshot.docs.map(doc => doc.data() as Project);
  },

  async updateProject(projectId: string, projectData: Partial<Project>) {
    await updateDoc(doc(db, 'projects', projectId), projectData);
  },

  async deleteProject(projectId: string) {
    await deleteDoc(doc(db, 'projects', projectId));
  },

  // Repository operations
  async createRepository(repository: Repository) {
    await setDoc(doc(db, 'repositories', repository.id), repository);
  },

  async getRepositories(projectId: string): Promise<Repository[]> {
    const reposQuery = query(
      collection(db, 'repositories'),
      where('projectId', '==', projectId),
      orderBy('lastChecked', 'desc')
    );
    const snapshot = await getDocs(reposQuery);
    return snapshot.docs.map(doc => doc.data() as Repository);
  },

  async updateRepository(repoId: string, repoData: Partial<Repository>) {
    await updateDoc(doc(db, 'repositories', repoId), repoData);
  },

  // Changelog operations
  async createChangelog(changelog: Changelog) {
    await setDoc(doc(db, 'changelogs', changelog.id), changelog);
  },

  async getChangelogs(projectId: string): Promise<Changelog[]> {
    const changelogsQuery = query(
      collection(db, 'changelogs'),
      where('projectId', '==', projectId),
      orderBy('generatedAt', 'desc')
    );
    const snapshot = await getDocs(changelogsQuery);
    return snapshot.docs.map(doc => doc.data() as Changelog);
  },

  // Notification operations
  async createNotification(notification: Omit<AppNotification, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'notifications'), notification);
    return docRef.id;
  },

  async getNotifications(projectId: string, userId: string): Promise<AppNotification[]> {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('projectId', '==', projectId),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(notificationsQuery);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }) as AppNotification);
  },

  async markNotificationAsRead(notificationId: string) {
    await updateDoc(doc(db, 'notifications', notificationId), { read: true });
  },

  async deleteNotification(notificationId: string) {
    await deleteDoc(doc(db, 'notifications', notificationId));
  }
};

export { auth, db }; 