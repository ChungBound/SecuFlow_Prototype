import { defaultsDeep } from 'lodash-es'
import type { RecursiveRequired, Settings } from '#/global'
import settingsDefault from '@/settings.default'

const globalSettings: Settings.all = {
  "app": {
    "enableDynamicTitle": true
  },
  "layout": {
    "enableMobileAdaptation": true
  },
  "menu": {
    "enableSubMenuCollapseButton": true,
    "enableHotkeys": true,
    "mode": "head",
    "switchMainMenuAndPageJump": true
  },
  "topbar": {
    "mode": "fixed"
  },
  "tabbar": {
    "enable": true,
    "enableIcon": true,
    "enableHotkeys": true
  },
  "toolbar": {
    "fullscreen": true,
    "pageReload": true,
    "colorScheme": true,
    "breadcrumb": false,
    "navSearch": false
  },
  "copyright": {
    "enable": true,
    "dates": "2024",
    "company": "SecuFlow_PG1",
    "website": "https://github.cs.adelaide.edu.au/SecuFlow-PG1"
  },
  "home": {
    "title": "Home"
  }
}

export default defaultsDeep(globalSettings, settingsDefault) as RecursiveRequired<Settings.all>
