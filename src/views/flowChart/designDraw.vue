<template>
  <div id="designDraw">
    <div class="process-designer-container">
      <MyProcessDesigner
        ref="processDesigner"
        :process-id="processId"
        :process-name="processName"
        @element-click="elementClick"
        @element-contextmenu="elementContextmenu"
        @init-finished="initModeler"
      />
    </div>
    <div class="property-panel-container" :style="{ width: panelWidth }">
      <!-- 右侧属性面板 -->
      <MyPropertiesPanel
        v-show="collapsed"
        :bpmn-modeler="modeler"
        :width="width"
        class="property-panel"
      />
      <div class="collapse-property-panel" @click="handleCollapsePanel">
        <i :class="[collapsed ? 'el-icon-d-arrow-right' : 'el-icon-d-arrow-left']" />
      </div>

    </div>
  </div>
</template>

<script>
import MyProcessDesigner from '@/components/bpmn/ProcessDesigner'
import MyPropertiesPanel from '@/components/bpmn/panel/PropertiesPanel'
export default {
  name: 'DesignDraw',
  components: {
    MyProcessDesigner,
    MyPropertiesPanel
  },
  data() {
    return {
      modeler: null,
      processId: 'processId232323',
      processName: 'processName名称',
      width: 400,
      collapsed: true
    }
  },
  computed: {
    panelWidth: function() {
      return this.collapsed ? '430px' : '40px'
    },
    iconName: function() {
      return 'el-icon-d-arrow-left'
    }
  },
  created() {
    if (this.$route.query && this.$route.query.processId) {
      this.processId = this.$route.query.processId
      this.processName = this.$route.query.processName
    }
  },
  methods: {
    initModeler(modeler) {
      setTimeout(() => {
        this.modeler = modeler
        console.log(modeler, 85)
        // const canvas = modeler.get("canvas");
        // const rootElement = canvas.getRootElement();
        // Log.prettyPrimary("Process Id:", rootElement.id);
        // Log.prettyPrimary("Process Name:", rootElement.businessObject.name);
      }, 10)
    },
    elementClick(element) {

    },
    elementContextmenu(element) {

    },
    handleCollapsePanel() {
      this.collapsed = !this.collapsed
    }
  }
}
</script>

<style lang="scss">
#designDraw {
  width: 100%;
  height: 100%;
	display: flex;
	.process-designer-container {
		height: 100%;
		flex: auto;
	}
	.property-panel-container {
    position: relative;
    box-shadow: 0 0 8px #cccccc;
    transition: all 0.4s ease-out;
    .property-panel {
      height: calc(100% - 40px);
    }
    .collapse-property-panel {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 40px;
      border-top: 1px dashed #e3e3e3;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
    }
	}
}
</style>
