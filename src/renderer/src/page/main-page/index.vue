<template>
    <n-layout class="main-comp">
        <n-layout-header class="main-header">
            <mainTopControlBar />
        </n-layout-header>
        <n-layout has-sider>
            <mainLeftMenuBar />
            <n-layout-content class="main-content-view">
                <router-view />
            </n-layout-content>
        </n-layout>
        <n-layout-footer class="main-footer">
            <mainFooterBar />
        </n-layout-footer>
    </n-layout>
</template>

<script lang="ts" setup>
import mainTopControlBar from './components/main-top-control-bar.vue'
import mainLeftMenuBar from './components/main-left-menu-bar.vue'
import mainFooterBar from './components/main-footer-bar.vue'
</script>

<style lang="less" scoped>
@import '../../assets/css/mainstyle.less';
</style>
