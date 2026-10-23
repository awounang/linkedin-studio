import type { Angle, Format, Length, Objective, PostStatus, Tone } from '../types'

export const OBJECTIVES: Objective[] = [
  'visibility',
  'credibility',
  'education',
  'networking',
  'business',
]

export const TONES: Tone[] = [
  'expert',
  'accessible',
  'inspiring',
  'direct',
  'conversational',
]

export const FORMATS: Format[] = [
  'story',
  'educational',
  'opinion',
  'lesson',
  'case-study',
]

export const LENGTHS: Length[] = ['short', 'medium', 'long']

export const STATUSES: PostStatus[] = ['idea', 'draft', 'ready', 'published']

export const objectiveLabel: Record<Objective, string> = {
  visibility: 'Visibilité',
  credibility: 'Crédibilité',
  education: 'Éducation',
  networking: 'Réseau',
  business: 'Développement commercial',
}

export const objectiveHelp: Record<Objective, string> = {
  visibility:
    'Faire comprendre qui vous êtes et sur quels sujets vous prenez la parole.',
  credibility:
    'Montrer une méthode, un raisonnement ou une exigence professionnelle.',
  education:
    'Rendre un sujet utile et actionnable pour votre audience.',
  networking:
    'Ouvrir une conversation, une collaboration ou un échange d’expérience.',
  business:
    'Clarifier qui vous aidez, comment vous travaillez, sans argumentaire forcé.',
}

export const toneLabel: Record<Tone, string> = {
  expert: 'Expert',
  accessible: 'Accessible',
  inspiring: 'Inspirant',
  direct: 'Direct',
  conversational: 'Conversationnel',
}

export const toneHelp: Record<Tone, string> = {
  expert: 'Précis, posé, vocabulaire maîtrisé, peu d’emphase.',
  accessible: 'Phrases courtes, langage clair, exemples concrets.',
  inspiring: 'Tournée vers l’élan, sans slogans ni promesses creuses.',
  direct: 'Aller droit au point, peu de précautions de langage.',
  conversational: 'Ton de discussion professionnelle, questions naturelles.',
}

export const formatLabel: Record<Format, string> = {
  story: 'Récit personnel',
  educational: 'Post éducatif',
  opinion: 'Avis professionnel',
  lesson: 'Leçon apprise',
  'case-study': 'Étude de cas',
}

export const formatHelp: Record<Format, string> = {
  story:
    'Une situation réelle que vous avez vécue. Le texte laisse des crochets à compléter : n’inventez rien.',
  educational:
    'Expliquer une méthode, un distinguo ou une erreur fréquente, utile pour votre audience.',
  opinion:
    'Prendre position sur une pratique de votre métier, en assumant le point de vue.',
  lesson:
    'Partager ce que vous retenez d’une expérience, sans la romancer.',
  'case-study':
    'Décortiquer une situation réelle (la vôtre ou un cas explicitement autorisé).',
}

export const lengthLabel: Record<Length, string> = {
  short: 'Court',
  medium: 'Moyen',
  long: 'Long',
}

export const lengthHelp: Record<Length, string> = {
  short: 'Environ 600 à 900 caractères, une idée, une conclusion.',
  medium: 'Environ 1 000 à 1 500 caractères, une structure en 4 à 6 blocs.',
  long: 'Jusqu’à environ 2 000 caractères, développement plus complet.',
}

export const ANGLES: Angle[] = [
  'audience',
  'myth',
  'decision',
  'season',
  'question',
  'limit',
  'method',
  'language',
  'tradeoff',
  'craft',
]

export const angleLabel: Record<Angle, string> = {
  audience: 'Quotidien de l’audience',
  myth: 'Idée reçue',
  decision: 'Décision',
  season: 'Moment de l’année',
  question: 'Conversation',
  limit: 'Limites',
  method: 'Méthode',
  language: 'Langage',
  tradeoff: 'Arbitrage',
  craft: 'Métier',
}

export const angleHelp: Record<Angle, string> = {
  audience: 'Leurs tensions, réunions, dilemmes — pas votre offre.',
  myth: 'Une confusion fréquente à démêler, sans polémique.',
  decision: 'Comment on tranche, ce qu’on reporte, ce qu’on éclaire.',
  season: 'Un moment récurrent du calendrier professionnel.',
  question: 'Ouvrir un échange utile, sans pitch.',
  limit: 'Ce que vous ne promettez pas, ou pas à tout le monde.',
  method: 'Une manière de poser un problème, étape par étape.',
  language: 'Des mots qui brouillent le travail réel.',
  tradeoff: 'Deux exigences qui tirent dans des sens différents.',
  craft: 'Votre pratique, sans catalogue de services.',
}

export const statusLabel: Record<PostStatus, string> = {
  idea: 'Idée',
  draft: 'Brouillon',
  ready: 'Prêt',
  published: 'Publié',
}

export const GENERIC_PHRASES = [
  'dans un monde en constante évolution',
  'dans un monde qui change',
  'à l’ère du digital',
  'à l’ère du numérique',
  'je suis ravi de partager',
  'je suis ravie de partager',
  'heureux de partager',
  'heureuse de partager',
  'n’hésitez pas',
  'n’hésitez surtout pas',
  'game changer',
  'game-changer',
  'le secret que personne',
  'vous ne devinerez jamais',
  'synergie',
  'disruption',
  'disruptif',
  'passionné de',
  'passionnée de',
  'je suis honoré',
  'je suis honorée',
  'thrilled to announce',
  'unique en son genre',
  'révolutionnaire',
  'incontournable',
  'changer la donne',
  'sortir de sa zone de confort',
  'penser en dehors de la boîte',
  'hors de la boite',
  'le meilleur du marché',
  'numéro 1',
  '100 % des cas',
  'jamais vu',
  'toujours fonctionné',
]

export const UNSUPPORTED_CLAIM_PATTERNS: { label: string; pattern: RegExp }[] = [
  {
    label: 'Chiffre ou pourcentage sans source',
    pattern: /\b\d+(?:[.,]\d+)?\s?%|\b\d{2,}\b/g,
  },
  {
    label: 'Superlative ou promesse trop large',
    pattern:
      /\b(le meilleur|la meilleure|toujours|jamais|tous les|toutes les|personne ne|garanti|révolutionnaire|incontournable|unique)\b/gi,
  },
  {
    label: 'Étude ou statistique non sourcée',
    pattern:
      /\b(les études montrent|selon les études|il a été prouvé|la science dit|statistiquement)\b/gi,
  },
]

export const LENGTH_TARGET: Record<Length, { min: number; max: number }> = {
  short: { min: 500, max: 950 },
  medium: { min: 900, max: 1600 },
  long: { min: 1400, max: 2300 },
}

export const WEEKDAY_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export const MONTHS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
]
