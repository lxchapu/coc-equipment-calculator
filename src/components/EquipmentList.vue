<script lang="ts" setup>
import { produce } from 'immer'


const props = defineProps<{
  modelValue: Equipment[]
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', value: Equipment[]): void
}>()

const toggleEquipment = (index: number) => {
  const newValue = produce(props.modelValue, (draft) => {
    draft[index].selected = !draft[index].selected
  })
  emits('update:modelValue', newValue)
}

const updateEquipmentLevel = (index: number, value: number | undefined) => {
  if (value === undefined) return
  const newValue = produce(props.modelValue, (draft) => {
    draft[index].currentLevel = value
  })
  emits('update:modelValue', newValue)
}
</script>

<template>
  <div class="equipment-list">
    <div
      class="equipment-item"
      :class="{ selected: item.selected }"
      v-for="(item, index) in modelValue"
      :key="item.name"
      :style="{
        '--bg': item.bgColor,
      }"
    >
      <img
        class="equipment-image"
        :src="item.image"
        :alt="item.name"
        @click="toggleEquipment(index)"
      />

      <i v-if="item.selected" class="iconfont icon-check"></i>

      <div v-if="item.selected" class="equipment-info">
        <div class="equipment-name">{{ item.name }}</div>
        <div class="equipment-current-level">
          <span class="label">当前等级</span>
          <el-input-number
            :model-value="item.currentLevel"
            size="small"
            :max="item.maxLevel"
            :min="1"
            @update:model-value="updateEquipmentLevel(index, $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.equipment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.equipment-item {
  border-radius: 4px;
  border: 1px solid #111;
  box-shadow: 0 0 4px #111;
  cursor: pointer;
  background-color: var(--bg);
  transition: all 0.2s ease;
  position: relative;
}
.equipment-item.selected {
  display: flex;
  background-color: #817c74;
  border-color: transparent;
  box-shadow: none;
}
.equipment-image {
  display: block;
  width: 64px;
  height: 64px;
  object-fit: contain;
}

.icon-check {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #95d649;
  color: white;
  border-radius: 4px;
  border: 1px solid #111;
  box-shadow: 0 0 4px #111;
}

.equipment-info {
  padding: 0 10px;
  color: white;
  text-shadow: 0 0 2px #111;
}
.equipment-name {
  margin-bottom: 4px;
  font-weight: bold;
  text-align: center;
}
.equipment-current-level .label {
  margin-right: 10px;
  font-size: 14px;
}

.equipment-current-level .el-input-number {
  width: 80px;
}
</style>
