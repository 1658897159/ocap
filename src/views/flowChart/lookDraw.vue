<template>
  <div class="lookDraw">
    <div class="container">
      <div class="container_item1 item" />
      <div class="container_item2 item" />
      <div class="container_item3 item" />
      <div class="container_item4 item" />
      <div class="container_item5 item">
        <ProcessDiagramViewer />
      </div>
      <div class="container_item6 item" />
      <div class="container_item7 item" />
      <div class="container_item8 item" />
      <div class="container_item9 item" />
    </div>

  </div>
</template>

<script>
import ProcessDiagramViewer from '@/components/bpmn/ProcessDiagramViewer.vue'
export default {
  name: 'LookDraw',
  components: {
    ProcessDiagramViewer
  }
}
</script>

<style lang="scss" scoped>
.lookDraw {
  width: 100%;
  min-height: calc(100vh - 50px);
  .container {
    width: 100%;
    min-height: calc(100vh - 50px);
    background-color: #F2F6FC;

    display: grid;
    grid-gap: 5px;
    grid-template-columns: 1fr 80fr 1fr;
    grid-template-rows: 2fr 80fr 2fr;
    .item {
      background-color: #fff;
    }
  }
}

</style>
