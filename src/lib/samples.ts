import { uid } from './ids'
import { addDays, todayIso } from './dates'
import type { Post, Profile, SavedSnippet } from '../types'

export const DEMO_PROFILE: Profile = {
  profession: 'consultant·e en organisation (profil exemple)',
  expertise: ['clarification de problèmes', 'animation de comités', 'priorisation'],
  audience: 'les responsables d’équipe en transformation',
  audienceDetails:
    'Personnes qui doivent faire avancer un chantier sans ajouter de jargon, ni de slides inutiles.',
  objectives: ['education', 'credibility', 'networking'],
  tone: 'direct',
  positioning:
    'Profil exemple — pas une personne réelle. Je clarifie des problèmes d’organisation pour des responsables d’équipe. Je publie pour expliquer, crédibiliser une méthode sobre, et ouvrir des échanges utiles.',
  communicationNotes:
    'Pas de storytelling inventé. Pas de chiffres. Phrases courtes. Une idée par post.',
}

const now = () => new Date().toISOString()

export function examplePosts(): Post[] {
  const createdAt = now()
  const start = todayIso()
  return [
    {
      id: uid('ex'),
      title: 'Exemple — Cinq blocs d’un post lisible',
      hook: 'Un post LinkedIn lisible tient souvent en cinq blocs.',
      hooks: ['Un post LinkedIn lisible tient souvent en cinq blocs.'],
      outline: [
        'Annoncer la structure',
        'Lister les cinq blocs',
        'Dire ce qui manque si on en retire un',
        'Question de transfert',
      ],
      cta: 'Quel bloc vous demande le plus d’effort en ce moment ?',
      content: `Un post LinkedIn lisible tient souvent en cinq blocs.

1. Une première ligne qui pose un sujet précis.
2. Un contexte court : pour qui, dans quelle situation.
3. Une idée utile, expliquée sans jargon.
4. Un exemple concret — le vôtre, pas un cas inventé.
5. Une question ou une invitation à continuer la discussion.

Si vous retirez le bloc 4, le post reste générique.
Si vous retirez le bloc 5, il se ferme trop tôt.

Ce texte est un exemple de structure. Il ne raconte pas une réussite personnelle.

Quel bloc vous demande le plus d’effort en ce moment ?`,
      format: 'educational',
      length: 'medium',
      tone: 'direct',
      audience: 'professionnels qui publient sur LinkedIn',
      objective: 'education',
      topic: 'Structure d’un post',
      status: 'ready',
      scheduledDate: addDays(start, 2),
      createdAt,
      updatedAt: createdAt,
      isExample: true,
    },
    {
      id: uid('ex'),
      title: 'Exemple — Avis sans posture de gourou',
      hook: 'Un avis professionnel n’a pas besoin d’être définitif pour être utile.',
      hooks: ['Un avis professionnel n’a pas besoin d’être définitif pour être utile.'],
      outline: [
        'Position',
        'Nuance',
        'Conséquence concrète',
        'Invitation au désaccord',
      ],
      cta: 'Quelle nuance refusez-vous d’effacer pour “aller plus vite” ?',
      content: `Un avis professionnel n’a pas besoin d’être définitif pour être utile.

Mon avis : on gagne du temps à dire ce qu’on ne sait pas encore, plutôt qu’à recouvrir le flou d’une méthode trop lisse.

Ce n’est pas une attaque contre les frameworks. C’est une exigence de langage.

Conséquence concrète : dans une réunion, remplacer “on a la solution” par “voici le problème tel qu’on le voit, et la première question à trancher”.

Ce texte est un exemple de prise de position. Il n’invente ni client, ni résultat.

Quelle nuance refusez-vous d’effacer pour “aller plus vite” ?`,
      format: 'opinion',
      length: 'short',
      tone: 'expert',
      audience: 'responsables d’équipe',
      objective: 'credibility',
      topic: 'Clarté de langage',
      status: 'ready',
      scheduledDate: addDays(start, 5),
      createdAt,
      updatedAt: createdAt,
      isExample: true,
    },
    {
      id: uid('ex'),
      title: 'Exemple — Leçon, avec crochets',
      hook: 'Une leçon utile tient souvent en une phrase trop simple pour paraître “stratégique”.',
      hooks: ['Une leçon utile tient souvent en une phrase trop simple pour paraître “stratégique”.'],
      outline: ['Leçon', 'Contexte à compléter', 'Limite', 'Question'],
      cta: 'Quelle leçon trop simple avez-vous mis du temps à admettre ?',
      content: `Une leçon utile tient souvent en une phrase trop simple pour paraître “stratégique”.

Leçon : [formulez la leçon comme à un collègue, sans formule magique].

Contexte : [rôle, moment, contrainte — uniquement si c’est réel].

Ce que je ne généralise pas : [les cas où cette leçon ne s’applique pas].

Les crochets sont volontaires. Tant qu’ils sont là, le post n’est pas prêt.

Quelle leçon trop simple avez-vous mis du temps à admettre ?`,
      format: 'lesson',
      length: 'short',
      tone: 'conversational',
      audience: 'pairs professionnels',
      objective: 'networking',
      topic: 'Leçons de terrain',
      status: 'draft',
      scheduledDate: addDays(start, 9),
      createdAt,
      updatedAt: createdAt,
      isExample: true,
    },
  ]
}

export function exampleSnippets(): SavedSnippet[] {
  const createdAt = now()
  return [
    {
      id: uid('snip'),
      kind: 'hook',
      text: 'On confond souvent l’intention et la méthode.',
      createdAt,
    },
    {
      id: uid('snip'),
      kind: 'hook',
      text: 'Un avis professionnel n’a pas besoin d’être définitif pour être utile.',
      createdAt,
    },
    {
      id: uid('snip'),
      kind: 'cta',
      text: 'Quel point voulez-vous que je développe, sans jargon ?',
      createdAt,
    },
    {
      id: uid('snip'),
      kind: 'cta',
      text: 'Vous le voyez comment, de votre côté ?',
      createdAt,
    },
  ]
}
