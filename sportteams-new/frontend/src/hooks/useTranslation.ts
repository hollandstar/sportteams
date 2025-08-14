import { useAppSelector } from './redux'

export interface Translation {
  [key: string]: string | Translation
}

export interface Translations {
  nl: Translation
  en: Translation
  de?: Translation
  fr?: Translation
}

// Default translations - will be loaded from backend later
const defaultTranslations: Translations = {
  nl: {
    nav: {
      logo: 'SportTeams',
      login: 'Inloggen',
      logout: 'Uitloggen',
      dashboard: 'Dashboard',
      players: 'Spelers',
      teams: 'Teams',
      evaluations: 'Evaluaties',
      settings: 'Instellingen',
      profile: 'Profiel'
    },
    hero: {
      title: 'Sport Team Manager voor teams',
      subtitle: 'Wetenschappelijk onderbouwd teammanagement voor moderne sportteams',
      cta: 'Probeer gratis demo'
    },
    features: {
      scientific: {
        title: 'Wetenschappelijk onderbouwd',
        description: 'Gebruik bewezen motorische testen en ontwikkel data-inzicht bij iedere speler.'
      },
      allinone: {
        title: 'Alles-in-één platform',
        description: 'Van voortgangsregistratie tot evaluaties, doelen en teaminteractie. Alles centraal.'
      },
      collaboration: {
        title: 'Samenwerken met je staf',
        description: 'Coach, trainer, fysio? Iedereen werkt in dezelfde omgeving met realtime feedback.'
      },
      growth: {
        title: 'Gericht op groei & prestatie',
        description: 'Stel teamdoelen op, meet voortgang en stimuleer persoonlijke ontwikkeling.'
      }
    },
    coaches: {
      title: 'Krachtige functies voor moderne coaches',
      evaluations: {
        title: 'Speler evaluaties',
        description: 'Beoordeel spelers direct op het veld met mobiele evaluatie tools.'
      },
      planning: {
        title: 'Teamdoelen plannen',
        description: 'Stel doelen vast, volg progressie en motiveer je team richting succes.'
      },
      dashboard: {
        title: 'Voortgang dashboard',
        description: 'Krijg inzicht in individuele en team prestaties met visuele rapporten.'
      }
    },
    demo: {
      title: 'Klaar om slimmer te coachen?',
      subtitle: 'Ontdek hoe SportTeams jouw team naar een hoger niveau brengt.',
      name: 'Naam',
      email: 'E-mailadres',
      club: 'Club/Team',
      function: 'Functie',
      selectFunction: 'Selecteer functie',
      message: 'Vertel ons over je team (optioneel)',
      submit: 'Vraag direct een gratis demo aan',
      messagePlaceholder: 'Aantal spelers, leeftijdsgroep, huidige uitdagingen...'
    },
    roles: {
      admin: 'Beheerder',
      team_admin: 'Team Beheerder',
      coach: 'Coach',
      player: 'Speler'
    }
  },
  en: {
    nav: {
      logo: 'SportTeams',
      login: 'Login',
      logout: 'Logout',
      dashboard: 'Dashboard',
      players: 'Players',
      teams: 'Teams',
      evaluations: 'Evaluations',
      settings: 'Settings',
      profile: 'Profile'
    },
    hero: {
      title: 'Sport Team Manager for teams',
      subtitle: 'Science-based team management for modern sports teams',
      cta: 'Try free demo'
    },
    features: {
      scientific: {
        title: 'Science-based approach',
        description: 'Use proven motor tests and develop data insights for every player.'
      },
      allinone: {
        title: 'All-in-one platform',
        description: 'From progress tracking to evaluations, goals and team interaction. Everything centralized.'
      },
      collaboration: {
        title: 'Collaborate with your staff',
        description: 'Coach, trainer, physio? Everyone works in the same environment with real-time feedback.'
      },
      growth: {
        title: 'Focused on growth & performance',
        description: 'Set team goals, measure progress and stimulate personal development.'
      }
    },
    coaches: {
      title: 'Powerful features for modern coaches',
      evaluations: {
        title: 'Player evaluations',
        description: 'Evaluate players directly on the field with mobile evaluation tools.'
      },
      planning: {
        title: 'Team goal planning',
        description: 'Set goals, track progress and motivate your team towards success.'
      },
      dashboard: {
        title: 'Progress dashboard',
        description: 'Get insights into individual and team performance with visual reports.'
      }
    },
    demo: {
      title: 'Ready to coach smarter?',
      subtitle: 'Discover how SportTeams brings your team to the next level.',
      name: 'Name',
      email: 'Email address',
      club: 'Club/Team',
      function: 'Function',
      selectFunction: 'Select function',
      message: 'Tell us about your team (optional)',
      submit: 'Request a free demo now',
      messagePlaceholder: 'Number of players, age group, current challenges...'
    },
    roles: {
      admin: 'Administrator',
      team_admin: 'Team Administrator',
      coach: 'Coach',
      player: 'Player'
    }
  }
}

export const useTranslation = (namespace?: string) => {
  const { user } = useAppSelector((state) => state.auth)
  const currentLanguage = user?.preferred_language || 'nl'

  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = defaultTranslations[currentLanguage as keyof Translations]
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        // Fallback to Dutch if translation not found
        value = defaultTranslations.nl
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey]
          } else {
            return key // Return key if translation not found
          }
        }
        break;
      }
    }
    
    return typeof value === 'string' ? value : key
  }

  return { t, currentLanguage }
}