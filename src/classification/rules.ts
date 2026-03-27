// src/classification/rules.ts
import type { TabInfo } from './types'

export interface CategoryRule {
  name: string
  nameKey: string // i18n key
  patterns: RegExp[]
}

export const CATEGORY_RULES: CategoryRule[] = [
  {
    name: 'Work',
    nameKey: 'categoryWork',
    patterns: [
      /jira\./i,
      /confluence\./i,
      /notion\./i,
      /slack\./i,
      /teams\./i,
      /zoom\./i,
      /linear\./i,
      /asana\./i,
      /monday\./i,
      /trello\./i,
      /clickup\./i
    ]
  },
  {
    name: 'Development',
    nameKey: 'categoryDevelopment',
    patterns: [
      /github\./i,
      /gitlab\./i,
      /bitbucket\./i,
      /stackoverflow\./i,
      /npmjs\./i,
      /pypi\./i,
      /docker\./i,
      /vercel\./i,
      /netlify\./i,
      /codepen\./i,
      /codesandbox\./i,
      /stackblitz\./i,
      /dev\.to/i
    ]
  },
  {
    name: 'Social',
    nameKey: 'categorySocial',
    patterns: [
      /twitter\./i,
      /x\.com/i,
      /facebook\./i,
      /instagram\./i,
      /linkedin\./i,
      /reddit\./i,
      /weibo\./i,
      /discord\./i,
      /telegram\./i,
      /whatsapp\./i,
      /messenger\./i
    ]
  },
  {
    name: 'Shopping',
    nameKey: 'categoryShopping',
    patterns: [
      /amazon\./i,
      /taobao\./i,
      /jd\.com/i,
      /ebay\./i,
      /shopify\./i,
      /temu\./i,
      /pinduoduo\./i,
      /aliexpress\./i,
      /walmart\./i,
      /target\./i
    ]
  },
  {
    name: 'Entertainment',
    nameKey: 'categoryEntertainment',
    patterns: [
      /youtube\./i,
      /bilibili\./i,
      /netflix\./i,
      /spotify\./i,
      /twitch\./i,
      /tiktok\./i,
      /douyin\./i,
      /iqiyi\./i,
      /youku\./i,
      /hulu\./i,
      /disneyplus\./i,
      /hbo\./i
    ]
  },
  {
    name: 'News',
    nameKey: 'categoryNews',
    patterns: [
      /news\./i,
      /bbc\./i,
      /cnn\./i,
      /nytimes\./i,
      /theverge\./i,
      /techcrunch\./i,
      /reuters\./i,
      /guardian\./i,
      /wsj\./i,
      /bloomberg\./i,
      /medium\./i,
      /substack\./i
    ]
  },
  {
    name: 'Docs',
    nameKey: 'categoryDocs',
    patterns: [
      /docs\./i,
      /documentation\./i,
      /google\.com\/docs/i,
      /google\.com\/sheets/i,
      /google\.com\/slides/i,
      /office\.com/i,
      /sharepoint\./i,
      /dropbox\./i,
      /drive\.google\./i
    ]
  }
]

export function matchRule(tab: TabInfo): string | null {
  const url = tab.url.toLowerCase()
  const title = tab.title.toLowerCase()

  for (const rule of CATEGORY_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(url) || pattern.test(title)) {
        return rule.name
      }
    }
  }

  return null
}
