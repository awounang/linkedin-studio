import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react'
import { hashPassword, randomSalt, uid } from './lib/ids'
import { findAccount, loadSnapshot, saveSnapshot } from './lib/storage'
import type { Account, AppSnapshot, Pillar, Post, Profile, SavedSnippet, UserData } from './types'

type Toast = { id: string; message: string }

type State = AppSnapshot & { toasts: Toast[] }

type Action =
  | { type: 'hydrate'; snapshot: AppSnapshot }
  | { type: 'toast'; message: string }
  | { type: 'dismiss-toast'; id: string }
  | { type: 'signup'; account: Account }
  | { type: 'login'; userId: string }
  | { type: 'logout' }
  | { type: 'delete-account' }
  | { type: 'patch-workspace'; patch: Partial<UserData> }
  | { type: 'set-profile'; profile: Profile; completeOnboarding?: boolean }
  | { type: 'set-pillars'; pillars: Pillar[] }
  | { type: 'upsert-post'; post: Post }
  | { type: 'add-posts'; posts: Post[] }
  | { type: 'delete-post'; id: string }
  | { type: 'upsert-snippet'; snippet: SavedSnippet }
  | { type: 'delete-snippet'; id: string }
  | { type: 'replace-workspace'; data: UserData }

function workspaceOf(state: State): UserData | null {
  if (!state.sessionUserId) return null
  return (
    state.workspaces[state.sessionUserId] ?? {
      profile: null,
      onboardingComplete: false,
      pillars: [],
      posts: [],
      snippets: [],
    }
  )
}

function writeWorkspace(state: State, userId: string, data: UserData): State {
  return {
    ...state,
    workspaces: { ...state.workspaces, [userId]: data },
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'hydrate':
      return { ...state, ...action.snapshot }
    case 'toast':
      return {
        ...state,
        toasts: [...state.toasts.slice(-3), { id: uid('toast'), message: action.message }],
      }
    case 'dismiss-toast':
      return { ...state, toasts: state.toasts.filter((item) => item.id !== action.id) }
    case 'signup':
      return {
        ...state,
        accounts: [...state.accounts, action.account],
        sessionUserId: action.account.id,
        workspaces: {
          ...state.workspaces,
          [action.account.id]: {
            profile: null,
            onboardingComplete: false,
            pillars: [],
            posts: [],
            snippets: [],
          },
        },
      }
    case 'login':
      return { ...state, sessionUserId: action.userId }
    case 'logout':
      return { ...state, sessionUserId: null }
    case 'delete-account': {
      if (!state.sessionUserId) return state
      const workspaces = Object.fromEntries(
        Object.entries(state.workspaces).filter(([id]) => id !== state.sessionUserId),
      )
      return {
        ...state,
        sessionUserId: null,
        accounts: state.accounts.filter((item) => item.id !== state.sessionUserId),
        workspaces,
      }
    }
    case 'patch-workspace': {
      if (!state.sessionUserId) return state
      const current = workspaceOf(state)
      if (!current) return state
      return writeWorkspace(state, state.sessionUserId, { ...current, ...action.patch })
    }
    case 'set-profile': {
      if (!state.sessionUserId) return state
      const current = workspaceOf(state)
      if (!current) return state
      return writeWorkspace(state, state.sessionUserId, {
        ...current,
        profile: action.profile,
        onboardingComplete: action.completeOnboarding ?? current.onboardingComplete,
      })
    }
    case 'set-pillars': {
      if (!state.sessionUserId) return state
      const current = workspaceOf(state)
      if (!current) return state
      return writeWorkspace(state, state.sessionUserId, { ...current, pillars: action.pillars })
    }
    case 'upsert-post': {
      if (!state.sessionUserId) return state
      const current = workspaceOf(state)
      if (!current) return state
      const exists = current.posts.some((item) => item.id === action.post.id)
      const posts = exists
        ? current.posts.map((item) => (item.id === action.post.id ? action.post : item))
        : [action.post, ...current.posts]
      return writeWorkspace(state, state.sessionUserId, { ...current, posts })
    }
    case 'add-posts': {
      if (!state.sessionUserId) return state
      const current = workspaceOf(state)
      if (!current) return state
      return writeWorkspace(state, state.sessionUserId, {
        ...current,
        posts: [...action.posts, ...current.posts],
      })
    }
    case 'delete-post': {
      if (!state.sessionUserId) return state
      const current = workspaceOf(state)
      if (!current) return state
      return writeWorkspace(state, state.sessionUserId, {
        ...current,
        posts: current.posts.filter((item) => item.id !== action.id),
      })
    }
    case 'upsert-snippet': {
      if (!state.sessionUserId) return state
      const current = workspaceOf(state)
      if (!current) return state
      const exists = current.snippets.some((item) => item.id === action.snippet.id)
      const snippets = exists
        ? current.snippets.map((item) => (item.id === action.snippet.id ? action.snippet : item))
        : [action.snippet, ...current.snippets]
      return writeWorkspace(state, state.sessionUserId, { ...current, snippets })
    }
    case 'delete-snippet': {
      if (!state.sessionUserId) return state
      const current = workspaceOf(state)
      if (!current) return state
      return writeWorkspace(state, state.sessionUserId, {
        ...current,
        snippets: current.snippets.filter((item) => item.id !== action.id),
      })
    }
    case 'replace-workspace': {
      if (!state.sessionUserId) return state
      return writeWorkspace(state, state.sessionUserId, action.data)
    }
    default:
      return state
  }
}

type StoreValue = {
  state: State
  dispatch: Dispatch<Action>
  account: Account | null
  data: UserData | null
  toast: (message: string) => void
  signup: (name: string, email: string, password: string) => Promise<string | null>
  login: (email: string, password: string) => Promise<string | null>
  logout: () => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    ...loadSnapshot(),
    toasts: [] as Toast[],
  })

  useEffect(() => {
    saveSnapshot({
      version: state.version,
      accounts: state.accounts,
      sessionUserId: state.sessionUserId,
      workspaces: state.workspaces,
    })
  }, [state.version, state.accounts, state.sessionUserId, state.workspaces])

  const account = state.accounts.find((item) => item.id === state.sessionUserId) ?? null
  const data = workspaceOf(state)

  const value = useMemo<StoreValue>(
    () => ({
      state,
      dispatch,
      account,
      data,
      toast: (message) => dispatch({ type: 'toast', message }),
      signup: async (name, email, password) => {
        if (findAccount(state.accounts, email)) {
          return 'Un compte existe déjà avec cet e-mail sur cet appareil.'
        }
        if (password.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères.'
        const salt = randomSalt()
        const passwordHash = await hashPassword(password, salt)
        const next: Account = {
          id: uid('user'),
          name: name.trim(),
          email: email.trim().toLowerCase(),
          passwordHash,
          salt,
          createdAt: new Date().toISOString(),
        }
        dispatch({ type: 'signup', account: next })
        return null
      },
      login: async (email, password) => {
        const found = findAccount(state.accounts, email)
        if (!found) return 'Aucun compte local ne correspond à cet e-mail.'
        const passwordHash = await hashPassword(password, found.salt)
        if (passwordHash !== found.passwordHash) return 'Mot de passe incorrect.'
        dispatch({ type: 'login', userId: found.id })
        return null
      },
      logout: () => dispatch({ type: 'logout' }),
    }),
    [state, account, data],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const value = useContext(StoreContext)
  if (!value) throw new Error('Store manquant')
  return value
}
