import {
  formatLabel,
  LENGTH_TARGET,
  GENERIC_PHRASES,
  objectiveLabel,
  toneLabel,
  UNSUPPORTED_CLAIM_PATTERNS,
} from './catalog'
import { uid } from './ids'
import type {
  Format,
  Length,
  Objective,
  Post,
  Profile,
  SavedSnippet,
  Tone,
} from '../types'

function joinExpertise(expertise: string[]): string {
  if (expertise.length === 0) return 'votre domaine'
  if (expertise.length === 1) return expertise[0]
  return `${expertise.slice(0, -1).join(', ')} et ${expertise[expertise.length - 1]}`
}

function listObjectives(objectives: Objective[]): string {
  if (objectives.length === 0) return 'clarifier votre parole professionnelle'
  return objectives.map((item) => objectiveLabel[item].toLowerCase()).join(', ')
}

export function buildPositioning(profile: Pick<Profile, 'profession' | 'expertise' | 'audience' | 'objectives' | 'tone'>): string {
  const expertise = joinExpertise(profile.expertise)
  const audience = profile.audience.trim() || 'les professionnels concernés par votre métier'
  const profession = profile.profession.trim() || 'professionnel·le'
  return [
    `Je suis ${profession}.`,
    `J’accompagne ${audience} sur ${expertise}.`,
    `Sur LinkedIn, je publie surtout pour ${listObjectives(profile.objectives)}.`,
    `Je m’exprime avec un ton ${toneLabel[profile.tone].toLowerCase()}, en restant factuel et utile.`,
  ].join(' ')
}

const HOOKS: Record<Format, (ctx: DraftContext) => string[]> = {
  story: (ctx) => [
    `Une situation récente, dans mon métier de ${ctx.profession}, m’a rappelé quelque chose de simple.`,
    `Je n’en fais pas une fable. Juste un cas réel, utile pour ${ctx.audience}.`,
    `[Décrivez en une phrase le moment professionnel que vous voulez raconter.]`,
  ],
  educational: (ctx) => [
    `Si vous êtes ${ctx.audience}, ce distinguo évite bien des malentendus.`,
    `On mélange souvent deux choses dans les conversations de ${ctx.audience}.`,
    `Une explication utile — pas un catalogue de ${ctx.profession}.`,
  ],
  opinion: (ctx) => [
    `Je ne cherche pas le débat pour le débat. Voici une position utile pour ${ctx.audience}.`,
    `Sur ce sujet, le problème n’est souvent pas “plus de méthode”. C’est plus de clarté.`,
    `Une confusion qui coûte du temps à ${ctx.audience}, plus qu’un manque d’outils.`,
  ],
  lesson: (ctx) => [
    `Ce que je retiens, sans enjoliver, à propos de ${ctx.topic.toLowerCase()}.`,
    `Une leçon de terrain, utile si vous êtes ${ctx.audience}.`,
    `[Nommez la leçon en une phrase, telle que vous la formuleriez à un pair.]`,
  ],
  'case-study': (ctx) => [
    `Une situation réelle à décomposer — pas un cas marketing.`,
    `Pour ${ctx.audience} : comment on a abordé ${ctx.topic.toLowerCase()}, étape par étape.`,
    `[Donnez le contexte réel : qui, quel enjeu, quelles contraintes. Rien d’inventé.]`,
  ],
}

const CTAS: Record<Objective, string[]> = {
  visibility: [
    'Si ce sujet fait partie de votre actualité, dites-moi comment vous le nommez de votre côté.',
    'Quel est le sujet sur lequel on vous identifie trop peu, selon vous ?',
    'Quelle phrase résumerait le mieux votre métier aujourd’hui ?',
  ],
  credibility: [
    'Quelle exigence refusez-vous de relâcher, même sous la pression du calendrier ?',
    'Quelle méthode vous aide à rester précis quand le sujet est flou ?',
    'Quel point de méthode aimeriez-vous voir développé ?',
  ],
  education: [
    'Quelle étape de ce raisonnement vous paraît encore trop abstraite ?',
    'Quel exemple concret manquerait pour que ce soit vraiment utile ?',
    'Si vous deviez l’expliquer à un collègue, par où commenceriez-vous ?',
  ],
  networking: [
    'Vous avez une expérience différente ? Je lis les retours avec attention.',
    'Qui, dans votre entourage, travaille ce sujet en ce moment ?',
    'Si ce thème vous concerne, je suis preneur d’un échange sobre, sans pitch.',
  ],
  business: [
    'Si cette situation ressemble à la vôtre, précisez le contexte : je vous dirai si je peux aider.',
    'Pour qui ce type d’accompagnement est-il vraiment pertinent, selon vous ?',
    'Quelle question poseriez-vous avant de travailler avec quelqu’un sur ce sujet ?',
  ],
}

type DraftContext = {
  profession: string
  audience: string
  topic: string
  expertise: string
  tone: Tone
  objective: Objective
  notes: string
}

function ctxFrom(profile: Profile, input: DraftInput): DraftContext {
  return {
    profession: profile.profession.trim() || 'professionnel·le',
    audience: profile.audience.trim() || 'votre audience',
    topic: input.topic.trim() || input.formatLabel,
    expertise: joinExpertise(profile.expertise),
    tone: input.tone,
    objective: input.objective,
    notes: input.notes.trim(),
  }
}

export type DraftInput = {
  format: Format
  length: Length
  tone: Tone
  objective: Objective
  topic: string
  audience?: string
  notes: string
  pillarId?: string
  formatLabel: string
}

function notesBlock(notes: string): string {
  if (!notes) {
    return '[Ajoutez ici le fait réel, l’observation ou la question que vous voulez traiter. Rien d’inventé.]'
  }
  return `Point de départ que vous avez indiqué : ${notes}`
}

function toneOpening(tone: Tone, profession: string): string {
  switch (tone) {
    case 'expert':
      return `En tant que ${profession}, je vais rester factuel.`
    case 'accessible':
      return `Je le formule simplement, comme je l’expliquerais à un pair pressé.`
    case 'inspiring':
      return `L’enjeu n’est pas d’en faire un slogan. C’est de rendre le prochain pas plus clair.`
    case 'direct':
      return `Allons au point utile.`
    case 'conversational':
      return `On se dit les choses comme en conversation de travail, sans mise en scène.`
  }
}

function outlineFor(format: Format): string[] {
  switch (format) {
    case 'story':
      return [
        'Première ligne : la situation, sans suspense artificiel',
        'Contexte : rôle, moment, contrainte',
        'Point de bascule : ce qui a rendu la situation intéressante',
        'Action réelle : ce que vous avez fait',
        'Leçon transférable pour l’audience',
        'Question d’ouverture',
      ]
    case 'educational':
      return [
        'Annoncer le distinguo ou la méthode',
        'Dire à qui c’est utile',
        'Expliquer l’idée en 3 étapes maximum',
        'Donner un exemple à compléter (le vôtre)',
        'Lister ce que ce n’est pas',
        'Question pour vérifier la compréhension',
      ]
    case 'opinion':
      return [
        'Position en une phrase',
        'Pourquoi cette position, liée à votre métier',
        'Ce que cette position n’est pas (nuance)',
        'Conséquence concrète pour l’audience',
        'Invitation au désaccord utile',
      ]
    case 'lesson':
      return [
        'La leçon, formulée sans formule magique',
        'Le contexte réel (à compléter)',
        'Ce que vous feriez différemment',
        'Ce que vous ne généralisez pas',
        'Application possible pour l’audience',
      ]
    case 'case-study':
      return [
        'Contexte réel et limites du cas',
        'Problème initial',
        'Démarche suivie (étapes)',
        'Résultat observable, sans chiffre inventé',
        'Limite : ce que ce cas ne prouve pas',
        'Question méthodologique',
      ]
  }
}

function bodyFor(format: Format, length: Length, ctx: DraftContext): string {
  const open = toneOpening(ctx.tone, ctx.profession)
  const note = notesBlock(ctx.notes)
  const commonClose = CTAS[ctx.objective][0]

  const story = [
    `[Décrivez en une phrase la situation professionnelle que vous avez vécue.]`,
    ``,
    open,
    ``,
    `Contexte : j’interviens comme ${ctx.profession} auprès de ${ctx.audience}.`,
    note,
    ``,
    `Le point de bascule : [ce qui a rendu la situation difficile, ambiguë ou instructive].`,
    ``,
    `Ce que j’ai fait : [actions réelles, dans l’ordre, sans enjoliver].`,
    ``,
    `Ce que j’en retiens, utile si vous travaillez sur ${ctx.topic.toLowerCase()} :`,
    `[Formulez une leçon transférable, pas un slogan.]`,
    ``,
    commonClose,
  ]

  const educational = [
    `Sur ${ctx.topic.toLowerCase()}, on mélange souvent l’intention et la méthode.`,
    ``,
    open,
    ``,
    `Ce contenu s’adresse à ${ctx.audience}.`,
    note,
    ``,
    `Une manière simple de poser le sujet :`,
    `1. [Nommez le problème tel qu’il apparaît dans le travail réel.]`,
    `2. [Décrivez le critère que vous utilisez pour le clarifier.]`,
    `3. [Indiquez la première action utile, sans outillage miracle.]`,
    ``,
    `Ce que ce n’est pas : un raccourci, une promesse de résultat, ni une vérité universelle.`,
    ``,
    `Si vous êtes ${ctx.profession} ou ${ctx.audience}, gardez une exigence : relier chaque conseil à une situation réelle.`,
    ``,
    commonClose,
  ]

  const opinion = [
    `Mon avis de ${ctx.profession} sur ${ctx.topic.toLowerCase()} : [formulez votre position en une phrase].`,
    ``,
    open,
    ``,
    `Je le dis pour ${ctx.audience}, pas pour “faire le buzz”.`,
    note,
    ``,
    `Pourquoi cette position : [raison liée à votre pratique, pas à une statistique inventée].`,
    ``,
    `Nuance importante : [ce que vous n’affirmez pas / les cas où vous pourriez penser autrement].`,
    ``,
    `Conséquence concrète : [ce que cela change dans une décision, une réunion, un livrable].`,
    ``,
    commonClose,
  ]

  const lesson = [
    `Leçon retenue, sans mise en scène : [dites la leçon comme à un collègue].`,
    ``,
    open,
    ``,
    `Contexte : ${note}`,
    ``,
    `Ce que je ferais différemment : [un geste, une question, un ordre de travail].`,
    ``,
    `Ce que je ne généralise pas : [la limite de cette leçon, les cas où elle ne s’applique pas].`,
    ``,
    `Si vous êtes ${ctx.audience} et que vous travaillez ${ctx.topic.toLowerCase()}, la question utile est : [question de transfert].`,
    ``,
    commonClose,
  ]

  const caseStudy = [
    `Cas réel — et seulement réel — autour de ${ctx.topic.toLowerCase()}.`,
    ``,
    open,
    ``,
    `Cadre : ${ctx.profession}, audience ${ctx.audience}.`,
    note,
    ``,
    `Problème de départ : [enjeu, contraintes, ce qui n’allait pas].`,
    ``,
    `Démarche :`,
    `1. [Première étape réellement suivie]`,
    `2. [Deuxième étape]`,
    `3. [Ajustement ou décision]`,
    ``,
    `Résultat observable : [fait vérifiable, sans chiffre inventé ni témoignage fabriqué].`,
    ``,
    `Limite : ce cas n’illustre pas tous les contextes. Il montre une manière de travailler, pas une loi.`,
    ``,
    commonClose,
  ]

  const map: Record<Format, string[]> = {
    story,
    educational,
    opinion,
    lesson,
    'case-study': caseStudy,
  }

  let lines = map[format]
  if (length === 'short') {
    lines = lines.filter((line) => !line.startsWith('Ce que ce n’est pas') && !line.startsWith('Nuance'))
    const compact: string[] = []
    let skipped = 0
    for (const line of lines) {
      if (line.startsWith('2.') || line.startsWith('3.')) {
        skipped += 1
        if (skipped > 1) continue
      }
      compact.push(line)
    }
    lines = compact
  }
  if (length === 'long') {
    lines = [
      ...lines.slice(0, -2),
      `Pour rester honnête dans la publication : je n’ajoute ni anecdote décorative, ni résultat que je ne peux pas assumer.`,
      `Si un point dépend d’un chiffre, d’un client ou d’un titre, je le laisse en crochets jusqu’à vérification.`,
      ``,
      ...lines.slice(-2),
    ]
  }
  return lines.join('\n')
}

function titleFor(input: DraftInput, ctx: DraftContext): string {
  const topic = ctx.topic
  const byFormat: Record<Format, string> = {
    story: `Récit — ${topic}`,
    educational: `Clarifier ${topic}`,
    opinion: `Point de vue — ${topic}`,
    lesson: `Leçon — ${topic}`,
    'case-study': `Cas — ${topic}`,
  }
  return byFormat[input.format]
}

export type GeneratedDraft = Pick<
  Post,
  'title' | 'content' | 'hook' | 'hooks' | 'outline' | 'cta'
>

export function generateDraft(profile: Profile, input: DraftInput): GeneratedDraft {
  const context = ctxFrom(profile, {
    ...input,
    audience: input.audience ?? profile.audience,
    formatLabel: formatLabel[input.format],
  })
  const hooks = HOOKS[input.format](context)
  const ctas = CTAS[input.objective]
  const content = bodyFor(input.format, input.length, context)
  return {
    title: titleFor(input, context),
    hooks,
    hook: hooks[0],
    outline: outlineFor(input.format),
    cta: ctas[0],
    content: assemblePost(hooks[0], content, ctas[0]),
  }
}

export function assemblePost(hook: string, body: string, cta: string): string {
  const withoutCta = body.replace(/\n+$/g, '')
  const parts = [hook.trim(), '', withoutCta]
  if (cta && !withoutCta.includes(cta)) {
    parts.push('', cta.trim())
  }
  return parts.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

const FILLER = [
  /il est important de noter que /gi,
  /il convient de rappeler que /gi,
  /en réalité, /gi,
  /dans les faits, /gi,
  /permettez-moi de /gi,
  /je voudrais simplement /gi,
  /à vrai dire, /gi,
  /comme chacun sait, /gi,
  /force est de constater que /gi,
]

export function shortenText(text: string): string {
  let next = text
  for (const pattern of FILLER) next = next.replace(pattern, '')
  next = next
    .split('\n')
    .map((line) => line.replace(/[ \t]{2,}/g, ' ').trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
  const paragraphs = next.split(/\n{2,}/)
  if (paragraphs.length > 8) {
    next = [...paragraphs.slice(0, 4), ...paragraphs.slice(-3)].join('\n\n')
  }
  return next.trim()
}

export function expandText(text: string, profile: Profile, objective: Objective): string {
  if (text.includes('Concrètement')) return text
  const addition = [
    '',
    `Concrètement, pour ${profile.audience || 'votre audience'} :`,
    `[Décrivez une situation observable — une réunion, un livrable, une décision — sans inventer de résultat.]`,
    '',
    `Ce que je ne dis pas : je n’ai pas de statistique miracle, ni de témoignage à fabriquer. Seulement une manière de travailler liée à ${joinExpertise(profile.expertise)}.`,
    '',
    CTAS[objective][1],
  ].join('\n')
  return `${text.trim()}\n${addition}`
}

const VAGUE: [RegExp, string][] = [
  [/\bchoses\b/gi, 'éléments concrets'],
  [/\btruc\b/gi, 'point précis'],
  [/\bbeaucoup\b/gi, 'plusieurs'],
  [/\bun peu\b/gi, ''],
  [/\btrès très\b/gi, 'très'],
  [/\ben gros\b/gi, 'en synthèse'],
]

export function clarifyText(text: string): string {
  let next = text
  for (const [pattern, replacement] of VAGUE) {
    next = next.replace(pattern, replacement)
  }
  if (!next.includes('[') && next.length > 280) {
    next += `\n\nÀ préciser avant publication : [fait réel], [limite du propos], [question à l’audience].`
  }
  const lines = next.split('\n')
  if (lines[0] && lines[0].length > 180) {
    const cut = lines[0].split('. ')[0]
    lines[0] = cut.endsWith('.') ? cut : `${cut}.`
  }
  return lines.join('\n').replace(/[ ]{2,}/g, ' ').trim()
}

export function adjustTone(text: string, tone: Tone): string {
  let next = text
  if (tone === 'direct' || tone === 'expert') {
    next = next
      .replace(/\bpeut-être\b/gi, '')
      .replace(/\bil me semble que /gi, '')
      .replace(/\bje pense que /gi, '')
      .replace(/!+/g, '.')
  }
  if (tone === 'accessible' || tone === 'conversational') {
    next = next.replace(/\bIl convient\b/g, 'Mieux vaut')
    next = next.replace(/\bNéanmoins\b/g, 'Pour autant')
    if (!next.includes('?')) {
      next += `\n\nVous le voyez comment, de votre côté ?`
    }
  }
  if (tone === 'inspiring') {
    if (!/prochain pas|suite utile|avancer/i.test(next)) {
      next += `\n\nLe prochain pas utile n’est pas un grand discours. C’est une décision plus claire, dès cette semaine.`
    }
  }
  if (tone === 'expert') {
    next = next.replace(/\bon\b/g, 'nous')
  }
  return next.replace(/[ ]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
}

export type ReviewIssue = {
  severity: 'info' | 'warning'
  title: string
  detail: string
  excerpt?: string
}

export type ReviewResult = {
  scores: {
    clarity: number
    structure: number
    readability: number
    relevance: number
  }
  issues: ReviewIssue[]
  suggestions: string[]
}

function clamp(value: number): number {
  return Math.max(1, Math.min(5, Math.round(value)))
}

export function reviewPost(post: Post, profile: Profile | null): ReviewResult {
  const text = post.content.trim()
  const issues: ReviewIssue[] = []
  const suggestions: string[] = []

  const sentences = text.split(/(?<=[.!?])\s+/).filter((item) => item.trim().length > 0)
  const avgLen =
    sentences.reduce((sum, item) => sum + item.length, 0) / Math.max(sentences.length, 1)
  const paragraphs = text.split(/\n{2,}/).filter(Boolean)
  const hasQuestion = /\?/.test(text)
  const hasPlaceholder = /\[[^\]]+\]/.test(text)
  const firstLine = text.split('\n').find((line) => line.trim()) ?? ''

  if (firstLine.length > 140) {
    issues.push({
      severity: 'warning',
      title: 'Accroche trop longue',
      detail: 'La première ligne gagne à tenir en une respiration, surtout sur mobile.',
      excerpt: firstLine.slice(0, 140),
    })
  } else if (firstLine.length < 20) {
    issues.push({
      severity: 'info',
      title: 'Accroche trop courte',
      detail: 'La première ligne peut poser un sujet plus précis, sans devenir un titre publicitaire.',
    })
  }

  if (!hasQuestion) {
    issues.push({
      severity: 'info',
      title: 'Pas d’ouverture',
      detail: 'Une question réelle (pas “n’hésitez pas”) aide le réseau et l’objectif conversationnel.',
    })
    suggestions.push('Ajoutez une question liée à l’objectif, plutôt qu’une invitation générique.')
  }

  if (paragraphs.some((item) => item.length > 420)) {
    issues.push({
      severity: 'warning',
      title: 'Paragraphe dense',
      detail: 'Sur LinkedIn, les blocs de 1 à 3 lignes se lisent mieux. Découpez sans ajouter de contenu fictif.',
    })
  }

  const lower = text.toLowerCase()
  for (const phrase of GENERIC_PHRASES) {
    if (lower.includes(phrase)) {
      issues.push({
        severity: 'warning',
        title: 'Formulation générique',
        detail: 'Cette tournure est trop vue. Remplacez-la par une observation réelle de votre métier.',
        excerpt: phrase,
      })
    }
  }

  for (const claim of UNSUPPORTED_CLAIM_PATTERNS) {
    const matches = text.match(claim.pattern)
    if (matches) {
      const unique = [...new Set(matches.map((item) => item.trim()))].slice(0, 4)
      const looksLikeYear = unique.every((item) => /^(19|20)\d{2}$/.test(item))
      if (claim.label.includes('Chiffre') && looksLikeYear) continue
      if (claim.label.includes('Chiffre') && unique.every((item) => item.length <= 1)) continue
      issues.push({
        severity: 'warning',
        title: claim.label,
        detail:
          'Gardez le chiffre seulement s’il est sourcé, ou remettez-le entre crochets jusqu’à vérification. N’inventez rien.',
        excerpt: unique.join(', '),
      })
    }
  }

  if (hasPlaceholder) {
    issues.push({
      severity: 'info',
      title: 'Crochets à compléter',
      detail: 'Le brouillon contient des passages à remplir avec des faits réels avant publication.',
    })
    suggestions.push('Remplacez chaque [crochet] par un élément vérifiable, ou supprimez-le.')
  }

  const target = LENGTH_TARGET[post.length]
  if (text.length < target.min) {
    issues.push({
      severity: 'info',
      title: 'Plus court que la longueur choisie',
      detail: `Environ ${text.length} caractères. Vous pouvez développer un exemple réel, pas une généralité.`,
    })
  }
  if (text.length > target.max) {
    issues.push({
      severity: 'info',
      title: 'Plus long que la longueur choisie',
      detail: `Environ ${text.length} caractères. Raccourcissez en coupant les répétitions, pas le propos.`,
    })
  }

  let relevance = 4
  const audience = (post.audience || profile?.audience || '').toLowerCase()
  const profession = (profile?.profession || '').toLowerCase()
  if (audience && !lower.includes(audience.split(' ')[0] ?? '___')) {
    relevance -= 1
    suggestions.push('Nommez votre audience, ou le moment de travail dans lequel elle se trouve.')
  }
  if (profession && !lower.includes(profession.split(' ')[0] ?? '___')) {
    relevance -= 0.5
  }
  const objectiveHints: Record<Objective, string[]> = {
    visibility: ['je suis', 'je travaille', 'mon métier', 'on m’identifie'],
    credibility: ['méthode', 'exigence', 'critère', 'pratique'],
    education: ['comment', 'étape', 'expliquer', 'distinguer'],
    networking: ['vous', 'échange', 'question', 'de votre côté'],
    business: ['si vous', 'contexte', 'accompagner', 'travailler avec'],
  }
  const hinted = objectiveHints[post.objective].some((item) => lower.includes(item))
  if (!hinted) {
    relevance -= 1
    issues.push({
      severity: 'info',
      title: 'Objectif peu visible',
      detail: `Objectif annoncé : ${objectiveLabel[post.objective].toLowerCase()}. Le texte peut le servir plus clairement, sans changer votre message.`,
    })
  }

  const clarity = clamp(
    5 -
      issues.filter((item) => item.title.includes('générique') || item.title.includes('vague')).length -
      (avgLen > 180 ? 1 : 0),
  )
  const structure = clamp(
    3 +
      (firstLine.length > 20 && firstLine.length < 140 ? 1 : 0) +
      (hasQuestion ? 1 : 0) +
      (paragraphs.length >= 4 ? 0.5 : -0.5),
  )
  const readability = clamp(5 - (avgLen > 160 ? 1.5 : 0) - (paragraphs.some((item) => item.length > 420) ? 1 : 0))
  const relevanceScore = clamp(relevance)

  if (issues.filter((item) => item.severity === 'warning').length === 0) {
    suggestions.push('Relisez à voix haute. Si une phrase sonne “contenu LinkedIn”, reformulez-la comme au travail.')
  }
  suggestions.push('Ne remplacez pas un crochet par une anecdote ou un chiffre dont vous n’êtes pas sûr.')

  return {
    scores: {
      clarity,
      structure,
      readability,
      relevance: relevanceScore,
    },
    issues,
    suggestions: [...new Set(suggestions)],
  }
}

export function defaultSnippets(profile: Profile): SavedSnippet[] {
  const now = new Date().toISOString()
  const audience = profile.audience || 'votre audience'
  const profession = profile.profession || 'votre métier'
  const hooks = [
    `Si vous êtes ${audience}, cette distinction évite bien des malentendus.`,
    `Mon avis de ${profession}, sans effet de manche.`,
    `Une situation réelle — pas une fable de leadership.`,
    `On confond souvent l’intention et la méthode.`,
  ]
  const ctas = [
    `Quelle étape vous paraît encore trop abstraite ?`,
    `Vous le voyez comment, de votre côté ?`,
    `Si ce sujet vous concerne, je lis les retours avec attention.`,
    `Quelle question poseriez-vous avant d’avancer ?`,
  ]
  return [
    ...hooks.map((text) => ({
      id: uid('snip'),
      text,
      kind: 'hook' as const,
      createdAt: now,
    })),
    ...ctas.map((text) => ({
      id: uid('snip'),
      text,
      kind: 'cta' as const,
      createdAt: now,
    })),
  ]
}
