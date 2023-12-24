<script setup lang="ts">
import EquipmentCalculator from './components/EquipmentCalculator.vue'
import PageHeader from './components/PageHeader.vue'
import PageFooter from './components/PageFooter.vue'
</script>

<template>
  <PageHeader />
  <main class="container">
    <EquipmentCalculator />
  </main>
  <PageFooter />
</template>

<style lang="scss" scoped>
.container {
  max-width: 980px;
  margin: 0 auto;
  padding: 0 16px;
}
</style>
