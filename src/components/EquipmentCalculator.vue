<script lang="ts" setup>
import leagueYaml from '../assets/league.yml'
import equipmentYaml from '../assets/equipment.yml'
import oreRewardsYaml from '../assets/oreRewards.yml'
import EquipmentList from './EquipmentList.vue'

const { list: leagueList } = leagueYaml as LeagueYaml
const { list: equipmentList, config: equipmentConfig } = equipmentYaml as EquipmentYaml
const { starBonus, CWLose, CWWin } = oreRewardsYaml as OreRewardsYaml

const accumulateCost = equipmentConfig.map((rarity) => {
  const cost = []
  const resource: Resource = {
    shiny: 0,
    glowy: 0,
    starry: 0,
  }
  for (let i = 0; i < rarity.upgradeCost.length; i++) {
    resource.shiny += rarity.upgradeCost[i][0]
    resource.glowy += rarity.upgradeCost[i][1]
    resource.starry += rarity.upgradeCost[i][2]
    cost.push({ ...resource })
  }
  return cost
})
const maxLevel = equipmentConfig.map((item) => item.maxLevel)

const leagueOptions = leagueList.map((item, index) => ({
  label: item,
  value: index,
}))

const model = ref({
  // 杯段
  league: 0,
  // 每周领几次每日奖励
  rewardCount: 0,
  // 部落战胜利场次
  cwWinCount: 0,
  // 部落战失败场次
  cwLoseCount: 0,
  // 常攻击的大本营等级
  thLevel: 6,
  // 每周开几次部落战
  cwCount: 0,
})

const equipments = shallowRef(
  equipmentList.map((item) => {
    return {
      ...item,
      selected: false,
      bgColor: equipmentConfig[item.rarity].color,
      maxLevel: maxLevel[item.rarity],
      currentLevel: 1,
    }
  }),
)
// 计算欠缺的资源
const calculateLackResource = () => {
  const lackResource: Resource = {
    shiny: 0,
    glowy: 0,
    starry: 0,
  }
  const selectedEquipments = equipments.value.filter((item) => item.selected)

  selectedEquipments.forEach((item) => {
    const { rarity, currentLevel } = item
    // 已经消耗的资源
    const cost = accumulateCost[rarity][currentLevel - 1]
    // 升到满级需要的资源
    const maxCost = accumulateCost[rarity][maxLevel[rarity] - 1]
    // 欠缺的资源
    lackResource.shiny += maxCost.shiny - cost.shiny
    lackResource.glowy += maxCost.glowy - cost.glowy
    lackResource.starry += maxCost.starry - cost.starry
  })

  return lackResource
}
// 计算平均每日可以获取的资源
const calculateDailyResource = () => {
  const dailyResource: Resource = {
    shiny: 0,
    glowy: 0,
    starry: 0,
  }
  // 每日奖励
  if (model.value.rewardCount > 0) {
    const starBonusResource = starBonus[model.value.league]
    // 计算 1 天领几次每日奖励
    const rewardCount = model.value.rewardCount / 7
    dailyResource.shiny += starBonusResource.shiny * rewardCount
    dailyResource.glowy += starBonusResource.glowy * rewardCount
    dailyResource.starry += starBonusResource.starry || 0 * rewardCount
  }
  // 部落战奖励
  if (model.value.thLevel >= 8 && model.value.cwCount > 0) {
    // 计算胜率
    const winRate = calculateCWWinRate()
    // 计算 1 天进行几次部落战
    const cwCount = model.value.cwCount / 7
    const cwWinResource = CWWin[model.value.thLevel - 8]
    const cwLoseResource = CWLose[model.value.thLevel - 8]
    dailyResource.shiny +=
      (cwWinResource.shiny * winRate + cwLoseResource.shiny * (1 - winRate)) * cwCount
    dailyResource.glowy +=
      (cwWinResource.glowy * winRate + cwLoseResource.glowy * (1 - winRate)) * cwCount
    dailyResource.starry +=
      (cwWinResource.starry * winRate + cwLoseResource.starry * (1 - winRate)) * cwCount
  }
  return dailyResource
}
// 计算部落战胜率
const calculateCWWinRate = () => {
  if (model.value.cwWinCount === 0 && model.value.cwLoseCount === 0) return 0.5
  const winRate = model.value.cwWinCount / (model.value.cwWinCount + model.value.cwLoseCount)
  return winRate
}

interface TableData {
  name: string
  shiny: number | string
  glowy: number | string
  starry: number | string
}
const tableData = shallowRef<TableData[]>([])

const calculate = () => {
  const dailyResource = calculateDailyResource()
  const lackResource = calculateLackResource()
  // 计算预计所需天数
  const days = {
    shiny:
      dailyResource.shiny > 0
        ? Math.ceil(lackResource.shiny / dailyResource.shiny) + '天'
        : '缺少获取途径',
    glowy:
      dailyResource.glowy > 0
        ? Math.ceil(lackResource.glowy / dailyResource.glowy) + '天'
        : '缺少获取途径',
    starry:
      dailyResource.starry > 0
        ? Math.ceil(lackResource.starry / dailyResource.starry) + '天'
        : '缺少获取途径',
  }
  tableData.value = [
    {
      name: '平均每日可获的资源',
      shiny: Math.round(dailyResource.shiny),
      glowy: Math.round(dailyResource.glowy),
      starry: Math.round(dailyResource.starry),
    },
    {
      name: '欠缺资源',
      ...lackResource,
    },
    {
      name: '预计所需天数',
      ...days,
    },
  ]
}

const loading = ref(false)

const handleConfirmButtonClick = () => {
  if (loading.value) return
  loading.value = true
  setTimeout(() => {
    calculate()
    loading.value = false
  }, 200)
}
</script>

<template>
  <el-form label-position="left" :label-width="140">
    <el-form-item label="选择你的杯段">
      <el-select v-model="model.league">
        <el-option
          v-for="item in leagueOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="每周领几次每日奖励">
      <el-input-number v-model="model.rewardCount" :min="0" :max="7" />
    </el-form-item>
    <el-form-item label="部落战胜利场次">
      <el-input-number v-model="model.cwWinCount" :min="0" :max="9999" />
    </el-form-item>
    <el-form-item label="部落战失败场次">
      <el-input-number v-model="model.cwLoseCount" :min="0" :max="9999" />
    </el-form-item>
    <el-form-item label="常攻击的大本营等级">
      <el-input-number v-model="model.thLevel" :min="6" :max="16" />
    </el-form-item>
    <el-form-item label="每周开几次部落战">
      <el-input-number v-model="model.cwCount" :min="0" :max="3.5" />
    </el-form-item>
    <div class="label">选择需要升级的装备</div>
    <EquipmentList v-model="equipments" />
  </el-form>

  <el-button
    class="confirm-button"
    type="primary"
    :loading="loading"
    @click="handleConfirmButtonClick"
  >
    计算
  </el-button>

  <el-table v-if="tableData.length > 0" :data="tableData">
    <el-table-column prop="name" width="150" />
    <el-table-column prop="shiny">
      <template #header>
        <img class="icon-ore" src="/images/ore/shiny_ore.webp" alt="shiny" />
        <span>闪亮矿石</span>
      </template>
    </el-table-column>
    <el-table-column prop="glowy">
      <template #header>
        <img class="icon-ore" src="/images/ore/glowy_ore.webp" alt="glowy" />
        <span>璀璨矿石</span>
      </template>
    </el-table-column>
    <el-table-column prop="starry">
      <template #header>
        <img class="icon-ore" src="/images/ore/starry_ore.webp" alt="starry" />
        <span>星辉矿石</span>
      </template>
    </el-table-column>
  </el-table>
</template>

<style lang="scss" scoped>
.el-form {
  margin-bottom: 40px;
}
.el-select {
  width: 150px;
}
.label {
  font-size: 14px;
  line-height: 32px;
  color: #606266;
  margin-bottom: 12px;
}

.confirm-button {
  margin-bottom: 20px;
  width: 160px;
}

.icon-ore {
  width: 24px;
  height: 24px;
  object-fit: contain;
  vertical-align: bottom;
  margin-right: 10px;
}
</style>
