import { openDB, type DBSchema } from 'idb';
import type { UserRecord, TypingResult, LessonProgress } from '../types';

interface AppDB extends DBSchema {
  users: { key: string; value: UserRecord; indexes: { byUsername: string } };
  results: { key: string; value: TypingResult; indexes: { byUser: string } };
  progress: { key: string; value: LessonProgress; indexes: { byUser: string } };
}

const dbp = openDB<AppDB>('typing-instructor', 1, {
  upgrade(db) {
    const users = db.createObjectStore('users', { keyPath: 'id' });
    users.createIndex('byUsername', 'username', { unique: true });
    const results = db.createObjectStore('results', { keyPath: 'id' });
    results.createIndex('byUser', 'userId');
    const progress = db.createObjectStore('progress', { keyPath: 'id' });
    progress.createIndex('byUser', 'userId');
  },
});

export const uid = () =>
  (crypto as any).randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);

export async function getUserByUsername(username: string) {
  const db = await dbp;
  return db.getFromIndex('users', 'byUsername', username.toLowerCase());
}

export async function putUser(user: UserRecord) {
  const db = await dbp;
  await db.put('users', user);
  return user;
}

export async function getUsers() {
  const db = await dbp;
  return db.getAll('users');
}

export async function addResult(result: TypingResult) {
  const db = await dbp;
  await db.put('results', result);
}

export async function getResultsForUser(userId: string) {
  const db = await dbp;
  const all = await db.getAllFromIndex('results', 'byUser', userId);
  return all.sort((a, b) => a.date - b.date);
}

export async function getProgressForUser(userId: string) {
  const db = await dbp;
  return db.getAllFromIndex('progress', 'byUser', userId);
}

export async function saveProgress(p: LessonProgress) {
  const db = await dbp;
  await db.put('progress', p);
}
