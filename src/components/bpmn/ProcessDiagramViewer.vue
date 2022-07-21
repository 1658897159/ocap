<template>
  <div class="diagram-view">
    <div class="diagram-view-header">
      <el-button-group key="scale-control">
        <el-tooltip effect="light" content="缩小视图">
          <el-button size="mini" icon="el-icon-zoom-out" :disabled="defaultZoom < 0.2" @click="processZoomOut()" />
        </el-tooltip>
        <el-button size="mini" icon="el-icon-aim">{{ Math.floor(defaultZoom * 10 * 10) + "%" }}</el-button>
        <el-tooltip effect="light" content="放大视图">
          <el-button size="mini" icon="el-icon-zoom-in" :disabled="defaultZoom > 4" @click="processZoomIn()" />
        </el-tooltip>
        <el-tooltip effect="light" content="重置视图并居中">
          <el-button size="mini" icon="el-icon-c-scale-to-original" @click="processReZoom()" />
        </el-tooltip>
        <el-tooltip effect="light" content="展开/收起小地图">
          <el-button size="mini" icon="el-icon-map-location" @click="minimapToggle()" />
        </el-tooltip>
      </el-button-group>
    </div>
    <div class="diagram-view-container">
      <div ref="bpmn-canvas" :style="{width: '100%', height: '100%'}" />
    </div>
    <el-dialog
      destroy-on-close
      :visible.sync="dialogVisible"
      width="30%"
      :before-close="() => dialogVisible = false"
    >
      <div v-if="activateEle">
        <el-button v-for="item in activateEle.businessObject.outgoing" :key="item.id">{{ item.name || '-' }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import './style/index.scss'
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer'
// 小地图
import minimapModule from 'diagram-js-minimap'
// 标签解析 Extension
import flowableModdleExtension from './extension-moddle/flowable'
import renderModule from './renderer/index'
import custom from './extension/custom.json'
// 标签解析 Moddle
import flowableModdleDescriptor from './descriptor/flowableDescriptor.json'
// 自定义左侧菜单
import DefaultEmptyXML from './defaultEmpty'
export default {
  name: 'ProcessDiagramViewer',
  data() {
    return {
      BpmnViewer: null,
      defaultZoom: 1,
      events: ['element.click', 'element.contextmenu'],
      dialogVisible: false,
      activateEle: null
    }
  },
  mounted() {
    document.oncontextmenu = function() {
      return false
    }
    this.initBpmnModeler()
  },
  methods: {
    initBpmnModeler() {
      this.BpmnViewer = new BpmnViewer({
        container: this.$refs['bpmn-canvas'],
        additionalModules: [
          minimapModule,
          flowableModdleExtension,
          renderModule
        ],
        moddleExtensions: {
          flowable: flowableModdleDescriptor,
          custom: custom
        },
        minimap: {
          open: true
        }
      })

      this.initViewerListeners()

      const xmlStr = localStorage.getItem('Id001')
      this.createNewDiagram(xmlStr)
    },
    initViewerListeners() {
      const EventBus = this.BpmnViewer.get('eventBus')
      const that = this
      // 注册需要的监听事件, 将. 替换为 - , 避免解析异常
      this.events.forEach(event => {
        EventBus.on(event, function(eventObj) {
          const eventName = event.replace(/\./g, '-')
          const element = eventObj ? eventObj.element : null
          if (event === 'element.click') {
            that.handlerClick(element)
          }
          that.$emit(eventName, element, eventObj)
        })
      })

      // 监听视图缩放变化
      this.BpmnViewer.on('canvas.viewbox.changed', ({ viewbox }) => {
        this.$emit('canvas-viewbox-changed', { viewbox })
        const { scale } = viewbox
        this.defaultZoom = Math.floor(scale * 100) / 100
      })
    },
    handlerClick(element) {
      if (element.type === 'bpmn:UserTask') {
        console.log(element, 112)
        this.activateEle = element
        // 选择的元素
        // this.hoverElem = document.querySelector(`g[data-element-id=${element.id}]`)
        // this.dialogVisible = true
      }
    },
    async createNewDiagram(xml) {
      // 将字符串转换成图显示出来
      const newId = this.processId || `Process_${new Date().getTime()}`
      const newName = this.processName || `业务流程_${new Date().getTime()}`
      const xmlString = xml || DefaultEmptyXML(newId, newName, 'flowable')
      try {
        const { warnings } = await this.BpmnViewer.importXML(xmlString)
        this.processReZoom()
        this.coloring()
        if (warnings && warnings.length) {
          warnings.forEach(warn => console.log(warn, 97))
        }
      } catch (e) {
        console.error(`[Process Designer Warn]: ${e?.message || e}`)
      }
    },
    coloring() {
      // const defs = document.querySelector('.djs-container svg')
      // if (defs) {
      //   const markerEnd = this.createMarkerEnd()
      //   // 添加箭头
      //   defs.appendChild(markerEnd)
      //   const conditionalMarker = this.createMarkerStartCondition()
      //   defs.appendChild(conditionalMarker)
      // }
      // 高亮线
      const highLine = ['Flow_06j5y1o', 'Flow_15qdd01']
      // 高亮节点
      const highPoint = ['Activity_1livoes']
      // // const highPoint = ['Event_10knohk', 'Gateway_0rh2az9', 'Activity_1tjwl5v']
      // const canvas = this.BpmnViewer.get('canvas')
      // for (const item of highLine) {
      //   canvas.addMarker(item, 'highlight-red')
      // }
      // for (const item of highPoint) {
      //   canvas.addMarker(item, 'highlight-red')
      // }
    },
    processZoomOut(zoomStep = 0.1) {
      const newZoom = Math.floor(this.defaultZoom * 100 - zoomStep * 100) / 100
      this.defaultZoom = newZoom
      this.BpmnViewer.get('canvas').zoom(this.defaultZoom)
    },
    processZoomIn(zoomStep = 0.1) {
      const newZoom = Math.floor(this.defaultZoom * 100 + zoomStep * 100) / 100
      this.defaultZoom = newZoom
      this.BpmnViewer.get('canvas').zoom(this.defaultZoom)
    },
    // 重置视图并居中
    processReZoom() {
      this.defaultZoom = 1
      this.BpmnViewer.get('canvas').zoom('fit-viewport', 'auto')
    },
    minimapToggle() {
      this.BpmnViewer.get('minimap').toggle()
    }
  }

}
</script>

<style lang="scss" scoped>
// 以下为bpmn工作流绘图工具的样式
@import '~bpmn-js/dist/assets/diagram-js.css';
@import '~bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
@import '~bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css';
@import '~bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
@import '~diagram-js-minimap/assets/diagram-js-minimap.css';

@import '~highlight.js/styles/atom-one-dark-reasonable.css';
.diagram-view {
	display: flex;
	flex-wrap: wrap;
	flex-direction: column;
	width: 100%;
	height: 100%;
	::v-deep.diagram-view-header {
		display: flex;
		align-items: center;
		min-height: 36px;
		background-color: #f7f7f8;
		.el-button {
      text-align: center;
    }
    .el-button-group {
      margin: 4px;
    }
    .el-tooltip__popper {
      .el-button {
        width: 100%;
        text-align: left;
        padding-left: 8px;
        padding-right: 8px;
      }
      .el-button:hover {
        background: rgba(64, 158, 255, 0.8);
        color: #ffffff;
      }
    }
	}
	.diagram-view-container {
		flex: auto;
		background: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMTBoNDBNMTAgMHY0ME0wIDIwaDQwTTIwIDB2NDBNMCAzMGg0ME0zMCAwdjQwIiBmaWxsPSJub25lIiBzdHJva2U9IiNlMGUwZTAiIG9wYWNpdHk9Ii4yIi8+PHBhdGggZD0iTTQwIDBIMHY0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZTBlMGUwIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+")
		repeat !important;
	}
	::v-deep .djs-minimap .map {
		width: 250px;
		height: 140px;
	}
}

</style>
