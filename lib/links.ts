import { IconPrefix, IconName } from '@fortawesome/fontawesome-svg-core'

export interface DynamicLink {
  name: string
  url: string
  icon: {
    prefix: IconPrefix
    name: IconName
  }
}

export const links: DynamicLink[] = [
  {
    name: 'GitHub',
    url: 'https://github.com/chrisae9',
    icon: { prefix: 'fab', name: 'github' },
  },
  {
    name: 'Coin Flip Tracker',
    url: 'https://coin.chis.dev/',
    icon: { prefix: 'fas', name: 'coins' },
  },
  {
    name: 'File Hosting',
    url: 'https://share.chis.dev/',
    icon: { prefix: 'fas', name: 'folder' },
  },
  {
    name: 'SyncLounge',
    url: 'https://lounge.chis.dev/',
    icon: { prefix: 'fas', name: 'couch' },
  },
  {
    name: 'Phase10 Randomizer',
    url: 'https://phase.chis.dev/',
    icon: { prefix: 'fas', name: 'shuffle' },
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/chrisae9/',
    icon: { prefix: 'fab', name: 'linkedin' },
  },
  {
    name: 'TypeRacer',
    url: 'https://data.typeracer.com/pit/profile?user=chrisae9',
    icon: { prefix: 'fas', name: 'keyboard' },
  },
]
