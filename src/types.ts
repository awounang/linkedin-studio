export type Objective =
  | 'visibility'
  | 'credibility'
  | 'education'
  | 'networking'
  | 'business'

export type Tone =
  | 'expert'
  | 'accessible'
  | 'inspiring'
  | 'direct'
  | 'conversational'

export type Format =
  | 'story'
  | 'educational'
  | 'opinion'
  | 'lesson'
  | 'case-study'

export type Length = 'short' | 'medium' | 'long'

export type PostStatus = 'idea' | 'draft' | 'ready' | 'published'

export type Angle =
  | 'audience'
  | 'myth'
  | 'decision'
  | 'season'
  | 'question'
  | 'limit'
  | 'method'
  | 'language'
  | 'tradeoff'
  | 'craft'

export type Account = {
  id: string
  name: string
  email: string
  passwordHash: string
  salt: string
  createdAt: string
}

export type Profile = {
  profession: string
  expertise: string[]
  audience: string
  audienceDetails: string
  objectives: Objective[]
  tone: Tone
  positioning: string
  communicationNotes: string
}

export type Topic = {
  id: string
  title: string
  objective: Objective
  notes: string
  angle?: Angle
}

export type Pillar = {
  id: string
  title: string
  description: string
  topics: Topic[]
}

export type Post = {
  id: string
  title: string
  content: string
  hook: string
  hooks: string[]
  outline: string[]
  cta: string
  format: Format
  length: Length
  tone: Tone
  audience: string
  objective: Objective
  topic: string
  pillarId?: string
  angle?: Angle
  status: PostStatus
  scheduledDate?: string
  createdAt: string
  updatedAt: string
  isExample?: boolean
  notes?: string
}

export type SavedSnippet = {
  id: string
  text: string
  kind: 'hook' | 'cta'
  format?: Format
  objective?: Objective
  createdAt: string
}

export type UserData = {
  profile: Profile | null
  onboardingComplete: boolean
  pillars: Pillar[]
  posts: Post[]
  snippets: SavedSnippet[]
}

export type AppSnapshot = {
  version: 1
  accounts: Account[]
  sessionUserId: string | null
  workspaces: Record<string, UserData>
}
