<script setup lang="ts">
const { message, visible } = useToast()
</script>

<template>
  <Transition name="toast">
    <div v-if="visible" class="toast" role="status">{{ message }}</div>
  </Transition>
</template>
