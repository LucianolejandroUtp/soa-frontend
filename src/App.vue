<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f5f5f5;
}

#app {
  height: 100vh;
  width: 100vw;
  overflow-x: hidden;
}

/* Forzar ancho completo en todos los contenedores de Element Plus */
.el-container {
  width: 100% !important;
  max-width: none !important;
}

.el-main {
  width: 100% !important;
  max-width: none !important;
  padding: 20px !important;
}

.el-aside {
  flex-shrink: 0 !important;
}

/* Asegurar que las filas de Element Plus usen todo el ancho */
.el-row {
  width: 100% !important;
  max-width: none !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.el-col {
  max-width: none !important;
}

/* Forzar ancho completo en cards y tablas */
.el-card {
  width: 100% !important;
  max-width: none !important;
}

.el-table {
  width: 100% !important;
  max-width: none !important;
}
</style>
