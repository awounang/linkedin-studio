import { formatLabel } from './catalog'
import { publishingSlots, todayIso } from './dates'
import { generateDraft } from './engines'
import { uid } from './ids'
import type { Angle, Format, Objective, Pillar, Post, Profile, Topic } from '../types'

export type IdeaCtx = {
  profession: string
  audience: string
  audienceDetails: string
  expertise: string
  otherExpertise: string
  monthIndex: number
  season: string
}

export type FreshIdea = {
  title: string
  angle: Angle
  objective: Objective
  format: Format
  notes: string
  pillarKey: PillarKey
}

export type PillarKey = 'audience' | 'myths' | 'craft' | 'judgment' | 'conversation' | 'season'

export const PILLAR_META: Record<PillarKey, { title: string; description: string }> = {
  audience: {
    title: 'Le quotidien de votre audience',
    description:
      'Leurs réunions, dilemmes et charges — pas un catalogue de ce que vous vendez.',
  },
  myths: {
    title: 'Idées reçues et distinguos',
    description: 'Démêler deux choses que l’on confond, sans devenir donneur de leçons.',
  },
  craft: {
    title: 'Métier et méthode',
    description: 'Votre pratique, de façon utile, sans répéter “voici ce que je fais”.',
  },
  judgment: {
    title: 'Jugement et limites',
    description: 'Ce que vous refusez, ce que vous ne généralisez pas, les vrais arbitrages.',
  },
  conversation: {
    title: 'Conversations utiles',
    description: 'Des questions et des invitations à l’échange, sans pitch.',
  },
  season: {
    title: 'Rythme de l’année',
    description: 'Des sujets liés au calendrier professionnel, renouvelables chaque mois.',
  },
}

const SEASON_LABEL = [
  'début d’année',
  'cœur de l’hiver',
  'fin de trimestre',
  'milieu de printemps',
  'montée de charge',
  'clôture de semestre',
  'rythme d’été',
  'préparation de rentrée',
  'rentrée',
  'saison des arbitrages',
  'fin d’année qui s’approche',
  'bilan de décembre',
]

function ctxFromProfile(profile: Profile, monthIndex = new Date().getMonth()): IdeaCtx {
  const expertise = profile.expertise.map((item) => item.trim()).filter(Boolean)
  return {
    profession: profile.profession.trim() || 'professionnel·le',
    audience: profile.audience.trim() || 'votre audience',
    audienceDetails:
      profile.audienceDetails.trim() || 'des personnes qui doivent avancer sans jargon inutile',
    expertise: expertise[0] || 'votre métier',
    otherExpertise: expertise[1] || expertise[0] || 'la qualité du travail',
    monthIndex,
    season: SEASON_LABEL[monthIndex] ?? 'ce moment de l’année',
  }
}

function fingerprint(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function tooClose(a: string, b: string): boolean {
  const left = new Set(fingerprint(a).split(' ').filter((word) => word.length > 3))
  const right = new Set(fingerprint(b).split(' ').filter((word) => word.length > 3))
  if (left.size === 0 || right.size === 0) return fingerprint(a) === fingerprint(b)
  let overlap = 0
  for (const word of left) if (right.has(word)) overlap += 1
  return overlap / Math.min(left.size, right.size) >= 0.62
}

export function usedIdeaTitles(posts: Post[], pillars: Pillar[]): string[] {
  return [
    ...posts.map((post) => post.topic || post.title),
    ...pillars.flatMap((pillar) => pillar.topics.map((topic) => topic.title)),
  ]
}

function isUsed(title: string, used: string[]): boolean {
  return used.some((item) => tooClose(title, item))
}

type Seed = {
  angle: Angle
  objective: Objective
  format: Format
  pillarKey: PillarKey
  title: (ctx: IdeaCtx) => string
  titles?: (ctx: IdeaCtx) => string[]
  notes: (ctx: IdeaCtx) => string
}

function titlesOf(seed: Seed, ctx: IdeaCtx): string[] {
  const list = seed.titles?.(ctx) ?? [seed.title(ctx)]
  return [...new Set(list.filter(Boolean))]
}

const SEEDS: Seed[] = [
  {
    angle: 'audience',
    objective: 'education',
    format: 'educational',
    pillarKey: 'audience',
    title: (ctx) => `Ce qui ralentit vraiment ${ctx.audience} au quotidien`,
    titles: (ctx) => [
      `Ce qui ralentit vraiment ${ctx.audience} au quotidien`,
      `Où ${ctx.audience} perd du temps sans le nommer`,
      `Le grain de sable dans une semaine de ${ctx.audience}`,
    ],
    notes: (ctx) =>
      `Parlez de leur journée de travail, pas de votre offre. Contexte : ${ctx.audienceDetails}.`,
  },
  {
    angle: 'audience',
    objective: 'networking',
    format: 'opinion',
    pillarKey: 'audience',
    title: (ctx) => `Une réunion typique chez ${ctx.audience} — et ce qu’on y mélange`,
    notes: () =>
      `Observez une réunion réelle (la vôtre en tant que témoin, ou la leur). Rien d’inventé.`,
  },
  {
    angle: 'decision',
    objective: 'education',
    format: 'educational',
    pillarKey: 'audience',
    title: (ctx) => `Comment ${ctx.audience} décide trop tôt — ou trop tard`,
    notes: () => `Décrivez le moment de la décision, pas le résultat commercial.`,
  },
  {
    angle: 'audience',
    objective: 'education',
    format: 'lesson',
    pillarKey: 'audience',
    title: (ctx) => `Quand ${ctx.audience} a trop d’outils et pas assez de critère`,
    notes: () => `Un distinguo outil vs critère. Pas de liste de logiciels à vendre.`,
  },
  {
    angle: 'audience',
    objective: 'networking',
    format: 'educational',
    pillarKey: 'audience',
    title: (ctx) => `Ce que ${ctx.audience} demande rarement… et devrait demander`,
    notes: (ctx) => `Une question utile liée à : ${ctx.audienceDetails}.`,
  },
  {
    angle: 'tradeoff',
    objective: 'credibility',
    format: 'opinion',
    pillarKey: 'audience',
    title: (ctx) => `Aller vite ou voir clair : le dilemme de ${ctx.audience}`,
    notes: () => `Un arbitrage réel, sans désigner un camp du bien.`,
  },
  {
    angle: 'audience',
    objective: 'education',
    format: 'educational',
    pillarKey: 'audience',
    title: (ctx) => `Trois types de flou que ${ctx.audience} prend pour de la stratégie`,
    notes: () => `Nommez des formes de flou (objectif, rôle, critère) — à compléter avec le réel.`,
  },
  {
    angle: 'myth',
    objective: 'education',
    format: 'educational',
    pillarKey: 'myths',
    title: (ctx) => `“On n’a pas le temps” : ce que ça cache chez ${ctx.audience}`,
    notes: () => `Pas un slogan productivité. Une lecture professionnelle du manque de temps.`,
  },
  {
    angle: 'myth',
    objective: 'credibility',
    format: 'opinion',
    pillarKey: 'myths',
    title: () => `La “bonne pratique” qui n’en est souvent pas une`,
    notes: (ctx) => `Une pratique de ${ctx.expertise} présentée comme évidente — et ses limites.`,
  },
  {
    angle: 'language',
    objective: 'education',
    format: 'educational',
    pillarKey: 'myths',
    title: (ctx) => `Un mot que ${ctx.audience} emploie trop tôt`,
    notes: () => `Choisissez UN mot (alignement, agile, impact, transformation…) et dépliez-le.`,
  },
  {
    angle: 'myth',
    objective: 'education',
    format: 'educational',
    pillarKey: 'myths',
    title: (ctx) => `On confond encore ${ctx.expertise} et ${ctx.otherExpertise}`,
    notes: () => `Un distinguo net. Si les deux expertises sont proches, prenez deux notions du métier.`,
  },
  {
    angle: 'language',
    objective: 'networking',
    format: 'opinion',
    pillarKey: 'myths',
    title: () => `Quand le vocabulaire tient lieu de décision`,
    notes: (ctx) => `Utile pour ${ctx.audience} : un mot qui clôt la discussion trop tôt.`,
  },
  {
    angle: 'myth',
    objective: 'education',
    format: 'lesson',
    pillarKey: 'myths',
    title: () => `Simplifier n’est pas appauvrir — encore faut-il savoir quoi couper`,
    notes: () => `Une règle de coupe concrète, pas un éloge de la simplicité.`,
  },
  {
    angle: 'method',
    objective: 'education',
    format: 'educational',
    pillarKey: 'craft',
    title: (ctx) => `Avant de parler de ${ctx.expertise} : la question que je pose`,
    notes: () => `Une question de cadrage. Pas un argumentaire “voici mon process”.`,
  },
  {
    angle: 'craft',
    objective: 'credibility',
    format: 'lesson',
    pillarKey: 'craft',
    title: (ctx) => `Ce que ${ctx.expertise} ne règle pas tout seul`,
    notes: () => `Les limites de l’expertise, pour rester honnête.`,
  },
  {
    angle: 'method',
    objective: 'education',
    format: 'educational',
    pillarKey: 'craft',
    title: (ctx) => `Une manière sobre de cadrer un sujet de ${ctx.expertise}`,
    notes: () => `3 étapes maximum, chacune à compléter avec un cas réel.`,
  },
  {
    angle: 'craft',
    objective: 'visibility',
    format: 'opinion',
    pillarKey: 'craft',
    title: (ctx) => `Ce que mon métier de ${ctx.profession} n’est pas`,
    notes: () => `Délimiter le périmètre, sans attaquer les voisins.`,
  },
  {
    angle: 'method',
    objective: 'education',
    format: 'case-study',
    pillarKey: 'craft',
    title: (ctx) => `Décortiquer un cas réel de ${ctx.expertise} — sans le romancer`,
    notes: () => `Uniquement si vous avez un cas réel. Sinon laissez les crochets.`,
  },
  {
    angle: 'craft',
    objective: 'education',
    format: 'educational',
    pillarKey: 'craft',
    title: (ctx) => `${ctx.otherExpertise} : par où commencer sans tout chambouler`,
    notes: () => `Un premier pas, pas une transformation complète.`,
  },
  {
    angle: 'limit',
    objective: 'credibility',
    format: 'opinion',
    pillarKey: 'judgment',
    title: (ctx) => `Ce que je refuse de promettre à ${ctx.audience}`,
    notes: () => `Une limite assumée. Ça crédibilise plus qu’une promesse large.`,
  },
  {
    angle: 'limit',
    objective: 'business',
    format: 'educational',
    pillarKey: 'judgment',
    title: (ctx) => `Pour qui ${ctx.expertise} n’est pas le bon levier`,
    notes: () => `Clarifier le non-public, sans mépris.`,
  },
  {
    angle: 'tradeoff',
    objective: 'credibility',
    format: 'opinion',
    pillarKey: 'judgment',
    title: () => `Quand je choisis de ne pas tout traiter`,
    notes: () => `Un arbitrage de périmètre. Complétez avec une situation réelle.`,
  },
  {
    angle: 'limit',
    objective: 'visibility',
    format: 'lesson',
    pillarKey: 'judgment',
    title: () => `Une erreur que je ne referai pas — sans en faire un trophée`,
    notes: () => `Leçon réelle seulement. Sinon gardez les crochets.`,
  },
  {
    angle: 'tradeoff',
    objective: 'education',
    format: 'educational',
    pillarKey: 'judgment',
    title: (ctx) => `Qualité, délai, clarté : ce que ${ctx.audience} ne peut pas tout avoir`,
    notes: () => `Un triangle d’arbitrage, sans chiffres inventés.`,
  },
  {
    angle: 'question',
    objective: 'networking',
    format: 'opinion',
    pillarKey: 'conversation',
    title: (ctx) => `Question à ${ctx.audience} : comment vous nommez ce problème ?`,
    notes: () => `Le post est une vraie question, pas un prétexte pour répondre à votre place.`,
  },
  {
    angle: 'question',
    objective: 'networking',
    format: 'educational',
    pillarKey: 'conversation',
    title: () => `Une question que je pose trop tard — et que je pose maintenant plus tôt`,
    notes: () => `Utile en réseau. Restez concret.`,
  },
  {
    angle: 'question',
    objective: 'networking',
    format: 'lesson',
    pillarKey: 'conversation',
    title: (ctx) => `Si vous êtes ${ctx.audience} : par où vous commencez, vous ?`,
    notes: () => `Invitation à décrire une pratique, pas à commenter une promo.`,
  },
  {
    angle: 'question',
    objective: 'business',
    format: 'educational',
    pillarKey: 'conversation',
    title: () => `Avant de travailler ensemble : les 3 clarifications utiles`,
    notes: () => `Pas un tunnel de vente. Des questions de cadrage.`,
  },
  {
    angle: 'decision',
    objective: 'networking',
    format: 'opinion',
    pillarKey: 'conversation',
    title: (ctx) => `${ctx.audience} : qu’est-ce qui rend une décision “assez claire” ?`,
    notes: () => `Ouvrez le débat. N’apportez pas “la” réponse universelle.`,
  },
  {
    angle: 'language',
    objective: 'education',
    format: 'educational',
    pillarKey: 'myths',
    title: () => `Le statut “en cours” qui ne veut souvent rien dire`,
    notes: () => `Un mot de reporting à remplacer par un fait observable.`,
  },
  {
    angle: 'audience',
    objective: 'education',
    format: 'educational',
    pillarKey: 'audience',
    title: (ctx) => `Qui porte vraiment le problème, chez ${ctx.audience} ?`,
    notes: () => `Rôle, responsabilité, périmètre — pas un organigramme inventé.`,
  },
  {
    angle: 'method',
    objective: 'education',
    format: 'educational',
    pillarKey: 'craft',
    title: () => `Un brief utile tient en une page. Voici ce que j’y mets.`,
    notes: () => `Listez les rubriques. Laissez les contenus réels en crochets.`,
  },
  {
    angle: 'audience',
    objective: 'networking',
    format: 'opinion',
    pillarKey: 'audience',
    title: (ctx) => `L’agenda d’une semaine de ${ctx.audience} comme diagnostic`,
    notes: () => `Ce qui occupe le temps dit souvent plus que le discours officiel.`,
  },
  {
    angle: 'myth',
    objective: 'education',
    format: 'opinion',
    pillarKey: 'myths',
    title: () => `Ce qu’on appelle “stratégie” par politesse`,
    notes: () => `Quand le mot habille une liste de tâches. Distinguo sobre.`,
  },
  {
    angle: 'method',
    objective: 'credibility',
    format: 'educational',
    pillarKey: 'craft',
    title: () => `Demander un exemple avant de donner un avis`,
    notes: () => `Une discipline de travail. Pas une pose de coach.`,
  },
  {
    angle: 'tradeoff',
    objective: 'education',
    format: 'educational',
    pillarKey: 'judgment',
    title: (ctx) => `Faire moins de sujets, mieux : ce que ${ctx.audience} peut couper`,
    notes: () => `Un type de sujet à arrêter, pas une injonction de productivité.`,
  },
  {
    angle: 'language',
    objective: 'networking',
    format: 'lesson',
    pillarKey: 'myths',
    title: () => `Ce qu’on ne met pas dans un compte-rendu — et pourquoi`,
    notes: () => `Une convention d’écriture. Exemple réel bienvenu.`,
  },
  {
    angle: 'question',
    objective: 'networking',
    format: 'educational',
    pillarKey: 'conversation',
    title: (ctx) => `À ${ctx.audience} : quel est le dernier sujet que vous avez volontairement laissé tomber ?`,
    notes: () => `Question de réseau. Vous pouvez donner la vôtre, si elle est réelle.`,
  },
  {
    angle: 'limit',
    objective: 'business',
    format: 'opinion',
    pillarKey: 'judgment',
    title: () => `Travailler avec un pair, pas avec un prestataire fantôme`,
    notes: () => `Conditions d’une collaboration lisible, sans argumentaire.`,
  },
]

const MONTH_SEEDS: Seed[][] = [
  [
    {
      angle: 'season',
      objective: 'education',
      format: 'educational',
      pillarKey: 'season',
      title: (ctx) => `Janvier : ce que ${ctx.audience} ferait mieux d’arrêter, pas d’ajouter`,
      notes: () => `Sujet de cadrage de l’année. Une chose à cesser, pas dix résolutions.`,
    },
    {
      angle: 'season',
      objective: 'visibility',
      format: 'opinion',
      pillarKey: 'season',
      title: () => `Priorités de début d’année : un critère, pas une liste`,
      notes: () => `Comment on choisit, pas le contenu de VOTRE liste personnelle inventée.`,
    },
  ],
  [
    {
      angle: 'season',
      objective: 'education',
      format: 'educational',
      pillarKey: 'season',
      title: (ctx) => `En février, les projets de ${ctx.audience} s’enlisent souvent ici`,
      notes: () => `Un point de friction récurrent (décision, rôle, rythme). Pas une stat.`,
    },
    {
      angle: 'season',
      objective: 'networking',
      format: 'opinion',
      pillarKey: 'season',
      title: () => `Les réunions de l’hiver : trop d’ordre du jour, pas assez de question`,
      notes: () => `Une observation de forme de réunion, à étayer par un cas réel.`,
    },
  ],
  [
    {
      angle: 'season',
      objective: 'credibility',
      format: 'educational',
      pillarKey: 'season',
      title: (ctx) => `Fin de trimestre : ce que ${ctx.audience} mesure trop tôt`,
      notes: () => `Indicateur vs. jugement. Aucun chiffre inventé.`,
    },
    {
      angle: 'season',
      objective: 'education',
      format: 'lesson',
      pillarKey: 'season',
      title: () => `Un bilan de trimestre utile tient en trois questions`,
      notes: () => `Écrivez les trois questions. Laissez les réponses à votre réalité.`,
    },
  ],
  [
    {
      angle: 'season',
      objective: 'education',
      format: 'educational',
      pillarKey: 'season',
      title: (ctx) => `Printemps : transmettre un sujet de ${ctx.expertise} sans noyer les gens`,
      notes: () => `Onboarding, passation, documentation — selon votre réel.`,
    },
    {
      angle: 'season',
      objective: 'networking',
      format: 'opinion',
      pillarKey: 'season',
      title: (ctx) => `Recruter ou former : le faux dilemme de ${ctx.audience}`,
      notes: () => `Un arbitrage, pas un conseil RH universel.`,
    },
  ],
  [
    {
      angle: 'season',
      objective: 'education',
      format: 'opinion',
      pillarKey: 'season',
      title: (ctx) => `Mai et la surcharge : ce que ${ctx.audience} peut encore trancher`,
      notes: () => `Dire non à un type de demande. Exemple réel requis.`,
    },
    {
      angle: 'season',
      objective: 'credibility',
      format: 'lesson',
      pillarKey: 'season',
      title: () => `Quand la charge monte, je simplifie d’abord le critère — pas l’équipe`,
      notes: () => `Méthode. Pas d’anecdote héroïque.`,
    },
  ],
  [
    {
      angle: 'season',
      objective: 'education',
      format: 'educational',
      pillarKey: 'season',
      title: (ctx) => `Mi-année : ce que ${ctx.audience} peut clôturer sans tout juger`,
      notes: () => `Clôturer un chantier ≠ bilan moral.`,
    },
    {
      angle: 'season',
      objective: 'networking',
      format: 'lesson',
      pillarKey: 'season',
      title: () => `Ce que le premier semestre a rendu plus net — pour moi, factuellement`,
      notes: () => `Une seule leçon réelle, ou crochets.`,
    },
  ],
  [
    {
      angle: 'season',
      objective: 'education',
      format: 'educational',
      pillarKey: 'season',
      title: (ctx) => `L’été n’efface pas les sujets de ${ctx.audience} : lesquels garder chauds`,
      notes: () => `Continuité, pas “profitez de la plage”.`,
    },
    {
      angle: 'season',
      objective: 'visibility',
      format: 'opinion',
      pillarKey: 'season',
      title: () => `Rythme d’été : ce que je continue de documenter`,
      notes: () => `Une habitude de travail, pas une pose lifestyle.`,
    },
  ],
  [
    {
      angle: 'season',
      objective: 'education',
      format: 'educational',
      pillarKey: 'season',
      title: (ctx) => `Avant la rentrée : ce que ${ctx.audience} a intérêt à écrire maintenant`,
      notes: () => `Une note de cadrage, un rituel, une question. Pas un plan d’attaque.`,
    },
    {
      angle: 'season',
      objective: 'education',
      format: 'educational',
      pillarKey: 'season',
      title: () => `Préparer septembre sans tout réinventer`,
      notes: () => `Ce qu’on reprend tel quel, ce qu’on ajuste.`,
    },
  ],
  [
    {
      angle: 'season',
      objective: 'education',
      format: 'educational',
      pillarKey: 'season',
      title: (ctx) => `Rentrée : les rituels de ${ctx.audience} qui méritent un reset`,
      notes: () => `Un rituel (réunion, reporting, brief). Un seul.`,
    },
    {
      angle: 'season',
      objective: 'networking',
      format: 'opinion',
      pillarKey: 'season',
      title: () => `Septembre n’exige pas un “nouveau positionnement”`,
      notes: (ctx) => `Contre la surenchère. Utile si vous êtes ${ctx.profession}.`,
    },
  ],
  [
    {
      angle: 'season',
      objective: 'business',
      format: 'educational',
      pillarKey: 'season',
      title: (ctx) => `Saison des budgets : ce que ${ctx.audience} mélange trop souvent`,
      notes: () => `Coût, valeur, risque — distinguo, sans chiffre inventé.`,
    },
    {
      angle: 'season',
      objective: 'credibility',
      format: 'opinion',
      pillarKey: 'season',
      title: () => `Un arbitrage d’octobre : ce qu’on finance, ce qu’on documente seulement`,
      notes: () => `Décision d’allocation. Cas réel ou crochets.`,
    },
  ],
  [
    {
      angle: 'season',
      objective: 'education',
      format: 'lesson',
      pillarKey: 'season',
      title: (ctx) => `Novembre : ce que ${ctx.audience} a encore le temps de clarifier`,
      notes: () => `Pas “il est trop tard”. Un sujet encore tenable.`,
    },
    {
      angle: 'season',
      objective: 'visibility',
      format: 'opinion',
      pillarKey: 'season',
      title: () => `Arrêter de promettre pour l’année suivante trop tôt`,
      notes: () => `Limite de langage commercial, utile en fin d’année.`,
    },
  ],
  [
    {
      angle: 'season',
      objective: 'education',
      format: 'educational',
      pillarKey: 'season',
      title: (ctx) => `Bilan de décembre pour ${ctx.audience} : trois faits, zéro slogan`,
      notes: () => `Des faits vérifiables. Pas de storytelling de réussite.`,
    },
    {
      angle: 'season',
      objective: 'networking',
      format: 'lesson',
      pillarKey: 'season',
      title: () => `Ce que je ne généralise pas à partir de cette année`,
      notes: () => `La limite d’une leçon annuelle. Honnêteté > morale.`,
    },
  ],
]

function allSeeds(monthIndex: number): Seed[] {
  const seasonal = MONTH_SEEDS[monthIndex] ?? MONTH_SEEDS[0]
  const extras: Seed[] = [
    {
      angle: 'audience',
      objective: 'education',
      format: 'educational',
      pillarKey: 'audience',
      title: (ctx) => `Le vrai goulot de ${ctx.audience} n’est souvent pas technique`,
      notes: (ctx) => `Peut-être un rôle, une décision, un langage. Contexte : ${ctx.audienceDetails}.`,
    },
    {
      angle: 'method',
      objective: 'education',
      format: 'educational',
      pillarKey: 'craft',
      title: (ctx) => `Comment j’explique ${ctx.expertise} à quelqu’un pressé`,
      notes: () => `Un mini-modèle en langage simple. Pas un pitch.`,
    },
    {
      angle: 'myth',
      objective: 'education',
      format: 'opinion',
      pillarKey: 'myths',
      title: () => `“Il faut plus de communication” : rarement le bon diagnostic`,
      notes: () => `Souvent un problème de décision ou de rôle. Dépliez.`,
    },
    {
      angle: 'decision',
      objective: 'credibility',
      format: 'educational',
      pillarKey: 'judgment',
      title: (ctx) => `Ce qui rend une demande de ${ctx.audience} vraiment cadrée`,
      notes: () => `Critères d’une demande claire.`,
    },
  ]
  return [...SEEDS, ...seasonal, ...extras]
}

export function collectFreshIdeas(
  profile: Profile,
  used: string[],
  count: number,
  monthIndex = new Date().getMonth(),
): FreshIdea[] {
  const ctx = ctxFromProfile(profile, monthIndex)
  const pool = allSeeds(monthIndex)
  const picked: FreshIdea[] = []
  const localUsed = [...used]
  const angleCount: Partial<Record<Angle, number>> = {}

  const scored: { seed: Seed; title: string; already: boolean; index: number; angleLoad: number }[] = []
  pool.forEach((seed, index) => {
    for (const title of titlesOf(seed, ctx)) {
      scored.push({
        seed,
        title,
        already: isUsed(title, localUsed),
        index,
        angleLoad: angleCount[seed.angle] ?? 0,
      })
    }
  })

  scored.sort((a, b) => Number(a.already) - Number(b.already) || a.angleLoad - b.angleLoad || a.index - b.index)

  for (const item of scored) {
    if (picked.length >= count) break
    if (item.already) continue
    if (picked.some((idea) => tooClose(idea.title, item.title))) continue
    const idea: FreshIdea = {
      title: item.title,
      angle: item.seed.angle,
      objective: item.seed.objective,
      format: item.seed.format,
      notes: item.seed.notes(ctx),
      pillarKey: item.seed.pillarKey,
    }
    picked.push(idea)
    localUsed.push(idea.title)
    angleCount[idea.angle] = (angleCount[idea.angle] ?? 0) + 1
  }

  if (picked.length < count) {
    const expertise = profile.expertise.filter(Boolean)
    expertise.forEach((skill, index) => {
      if (picked.length >= count) return
      const title = `Une nuance utile sur ${skill.toLowerCase()} que ${ctx.audience} mélange encore (${SEASON_LABEL[monthIndex]}, variante ${index + 1})`
      if (isUsed(title, localUsed)) return
      picked.push({
        title,
        angle: 'craft',
        objective: 'education',
        format: 'educational',
        notes: `Restez sur une nuance, pas un catalogue de ${skill}.`,
        pillarKey: 'craft',
      })
    })
  }

  return picked.slice(0, count)
}

function topicFromIdea(idea: FreshIdea): Topic {
  return {
    id: uid('topic'),
    title: idea.title,
    objective: idea.objective,
    notes: idea.notes,
    angle: idea.angle,
  }
}

function attachIdeas(pillars: Pillar[], ideas: FreshIdea[]): Pillar[] {
  const next = pillars.map((pillar) => ({ ...pillar, topics: [...pillar.topics] }))
  for (const idea of ideas) {
    const meta = PILLAR_META[idea.pillarKey]
    let pillar = next.find((item) => item.title === meta.title)
    if (!pillar) {
      pillar = emptyPillar(idea.pillarKey)
      next.push(pillar)
    }
    if (!pillar.topics.some((topic) => tooClose(topic.title, idea.title))) {
      pillar.topics.push(topicFromIdea(idea))
    }
  }
  return next
}

function emptyPillar(key: PillarKey): Pillar {
  return {
    id: uid('pillar'),
    title: PILLAR_META[key].title,
    description: PILLAR_META[key].description,
    topics: [],
  }
}

export function buildStrategy(profile: Profile, monthIndex = new Date().getMonth()): Pillar[] {
  const keys: PillarKey[] = ['audience', 'myths', 'craft', 'judgment', 'conversation', 'season']
  const ideas = collectFreshIdeas(profile, [], 18, monthIndex)
  const pillars = keys.map((key) => {
    const pillar = emptyPillar(key)
    pillar.topics = ideas.filter((idea) => idea.pillarKey === key).slice(0, 4).map(topicFromIdea)
    return pillar
  })
  return pillars.filter((pillar) => pillar.topics.length > 0)
}

export function mergeFreshTopics(
  profile: Profile,
  pillars: Pillar[],
  posts: Post[],
  count = 8,
  monthIndex = new Date().getMonth(),
): { pillars: Pillar[]; ideas: FreshIdea[] } {
  const used = usedIdeaTitles(posts, pillars)
  const ideas = collectFreshIdeas(profile, used, count, monthIndex)
  return { pillars: attachIdeas(pillars, ideas), ideas }
}

function ideaToPost(
  profile: Profile,
  idea: FreshIdea,
  pillars: Pillar[],
  scheduledDate: string | undefined,
  index: number,
): Post {
  const pillar = pillars.find((item) => item.title === PILLAR_META[idea.pillarKey].title)
  const length = index % 3 === 2 ? 'short' : index % 3 === 0 ? 'medium' : 'long'
  const draft = generateDraft(profile, {
    format: idea.format,
    length,
    tone: profile.tone,
    objective: idea.objective,
    topic: idea.title,
    notes: idea.notes,
    pillarId: pillar?.id,
    formatLabel: formatLabel[idea.format],
  })
  const now = new Date().toISOString()
  return {
    id: uid('post'),
    ...draft,
    format: idea.format,
    length,
    tone: profile.tone,
    audience: profile.audience,
    objective: idea.objective,
    topic: idea.title,
    pillarId: pillar?.id,
    angle: idea.angle,
    status: 'idea',
    scheduledDate,
    createdAt: now,
    updatedAt: now,
    notes: idea.notes,
  }
}

export function planMonth(
  profile: Profile,
  pillars: Pillar[],
  existing: Post[],
  year: number,
  monthIndex: number,
  count = 8,
): { posts: Post[]; pillars: Pillar[] } {
  const occupied = new Set(
    existing.map((post) => post.scheduledDate).filter((value): value is string => Boolean(value)),
  )
  const slots = publishingSlots(year, monthIndex, occupied, count)
  const used = usedIdeaTitles(existing, pillars)
  const target = slots.length > 0 ? slots.length : count
  const ideas = collectFreshIdeas(profile, used, target, monthIndex)
  const nextPillars = attachIdeas(pillars, ideas)
  const posts = ideas.map((idea, index) => ideaToPost(profile, idea, nextPillars, slots[index], index))
  return { posts, pillars: nextPillars }
}

export function nextUnusedIdea(
  profile: Profile,
  posts: Post[],
  pillars: Pillar[],
  monthIndex = new Date().getMonth(),
): FreshIdea | null {
  return collectFreshIdeas(profile, usedIdeaTitles(posts, pillars), 1, monthIndex)[0] ?? null
}

export function upcomingGap(posts: Post[]): number {
  const today = todayIso()
  return posts.filter(
    (post) => post.scheduledDate && post.scheduledDate >= today && post.status !== 'published',
  ).length
}
