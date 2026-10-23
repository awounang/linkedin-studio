import type { Account, AppSnapshot, UserData } from '../types'

const KEY = 'linkedin-studio-v1'

const emptyWorkspace = (): UserData => ({
  profile: null,
  onboardingComplete: false,
  pillars: [],
  posts: [],
  snippets: [],
})

export function emptySnapshot(): AppSnapshot {
  return {
    version: 1,
    accounts: [],
    sessionUserId: null,
    workspaces: {},
  }
}

export function loadSnapshot(): AppSnapshot {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptySnapshot()
    const parsed = JSON.parse(raw) as AppSnapshot
    if (parsed.version !== 1 || !parsed.workspaces) return emptySnapshot()
    return parsed
  } catch {
    return emptySnapshot()
  }
}

export function saveSnapshot(snapshot: AppSnapshot): void {
  localStorage.setItem(KEY, JSON.stringify(snapshot))
}

export function ensureWorkspace(snapshot: AppSnapshot, userId: string): AppSnapshot {
  if (snapshot.workspaces[userId]) return snapshot
  return {
    ...snapshot,
    workspaces: {
      ...snapshot.workspaces,
      [userId]: emptyWorkspace(),
    },
  }
}

export function findAccount(accounts: Account[], email: string): Account | undefined {
  return accounts.find((account) => account.email.toLowerCase() === email.trim().toLowerCase())
}
