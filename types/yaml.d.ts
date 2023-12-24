declare module '*.yml' {
  const content: any
  export default content
}

interface Equipment {
  name: string
  image: string
  rarity: number
  selected: boolean
  bgColor: string
  maxLevel: number
  currentLevel: number
}

interface EquipmentYaml {
  list: {
    name: string
    rarity: number
    image: string
  }[]
  config: {
    rarity: string
    color: string
    maxLevel: number
    upgradeCost: number[][]
  }[]
}

interface Resource {
  shiny: number
  glowy: number
  starry: number
}

interface OreRewardsYaml {
  starBonus: Resource[]
  CWWin: Resource[]
  CWLose: Resource[]
}

interface LeagueYaml {
  list: string[]
}
