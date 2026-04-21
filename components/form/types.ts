/* -------------------- DATA -------------------- */

export type FormData = {
    identity: string
    age: string
    situation: string
  
    sex: string
    poids: string
    taille: string
  
    job: string
    time_extra: string
    equipment: string
  
    level: string
    injuries: string
    sports: string
  
    sleep_hours: string
    sleep_quality: string
    sleep_schedule: string
  
    meals: string
    food_quality: string
    cravings: string
  
    why: string
    commitment: string
    quitting: string
  
    short_goal: string
    dream: string
    why_me: string
  
    email: string
    number: string
  }
  
 export const INITIAL: FormData = {
    identity: '',
    age: '',
    situation: '',
  
    sex: '',
    poids: '',
    taille: '',
  
    job: '',
    time_extra: '',
    equipment: '',
  
    level: '',
    injuries: '',
    sports: '',
  
    sleep_hours: '',
    sleep_quality: '',
    sleep_schedule: '',
  
    meals: '',
    food_quality: '',
    cravings: '',
  
    why: '',
    commitment: '',
    quitting: '',
  
    short_goal: '',
    dream: '',
    why_me: '',
  
    email: '',
    number: '',
  }
  
 export const STEPS = [
    'Présentation',
    'Identité',
    'Infos',
    'Organisation',
    'Sport',
    'Sommeil',
    'Nutrition',
    'Objectif',
    'Engagement',
    'Vision',
    'Contact',
    'Récapitulatif',
  ]
  
 export const GOALS = [
    { id: 'confident',  title: 'Confiance & Aura',      desc: 'Devenir un sportif plus confiant et charismatique' },
    { id: 'healthy',    title: 'Healthy & No stress',    desc: 'Devenir un sportif plus sain et moins stressé' },
    { id: 'productive', title: 'Productivité & Clarté',  desc: 'Devenir une personne plus productive et intéressante' },
    { id: 'global',     title: 'Meilleur dans tout',     desc: 'Devenir meilleur globalement, amélioration générale' },
  ]
  
 export const GOAL_LABELS: Record<string, string> = {
    confident:  'Confiance & Aura',
    healthy:    'Healthy & No stress',
    productive: 'Productivité & Clarté',
    global:     'Meilleur dans tout',
  }
  
 export const COMMITMENT_LABELS: Record<string, string> = {
    '5': '5 - À FOND !',
    '4': '4 - Carrément',
    '3': '3 - Ça va',
    '2': '2 - Pas tant',
    '1': '1 - Pas du tout',
  }
  
 export const LEVEL_LABELS: Record<string, string> = {
    '1': '1 - Non Sportif',
    '2': '2 - Sportif Débutant',
    '3': '3 - Sportif Loisir',
    '4': '4 - Sportif de Compétition',
    '5': '5 - Athlète',
  }
  