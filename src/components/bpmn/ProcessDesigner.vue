<template>
  <div class="my-process-designer">
    <div class="my-process-designer__header">
      <el-button-group key="file-control">
        <el-button size="mini" type="primary" icon="el-icon-folder-opened" @click="$refs.refFile.click()">打开文件</el-button>
        <el-tooltip effect="light">
          <div slot="content">
            <el-button size="mini" type="text" @click="downloadProcessAsXml">下载为XML文件 </el-button>
            <br>
            <el-button size="mini" type="text" @click="downloadProcessAsSvg">下载为SVG文件</el-button>
            <br>
            <el-button size="mini" type="text" @click="downloadProcessAsBpmn">下载为BPMN文件</el-button>
          </div>
          <el-button size="mini" type="primary" icon="el-icon-download">下载文件</el-button>
        </el-tooltip>
        <el-tooltip effect="light">
          <div slot="content">
            <el-button size="mini" type="text" @click="previewProcessXML">预览XML</el-button>
            <br>
            <el-button size="mini" type="text" @click="previewProcessJson">预览JSON</el-button>
          </div>
          <el-button size="mini" type="primary" icon="el-icon-view">预览</el-button>
        </el-tooltip>
        <el-tooltip effect="light">
          <div slot="content">
            <div v-for="item in enumBoard" :key="item.key" class="keyboard">
              <div>{{ item.label }}</div>
              <div>{{ item.key }}</div>
            </div>
          </div>
          <el-button size="mini" type="primary" icon="el-icon-c-scale-to-original">快捷键</el-button>
        </el-tooltip>

        <el-button size="mini" type="primary" icon="el-icon-folder-checked" @click="handleUpdateBpmnXML">保存</el-button>
        <el-button size="mini" type="primary" icon="el-icon-error" @click="handlecancel">返回</el-button>
      </el-button-group>
      <el-button-group key="align-control">
        <el-tooltip effect="light" content="向左对齐">
          <el-button size="mini" @click="elementsAlign('left')">
            <svg-icon icon-class="align-2-left" />
          </el-button>
        </el-tooltip>
        <el-tooltip effect="light" content="向右对齐">
          <el-button size="mini" @click="elementsAlign('right')">
            <svg-icon icon-class="align-2-right" />
          </el-button>
        </el-tooltip>
        <el-tooltip effect="light" content="向上对齐">
          <el-button size="mini" @click="elementsAlign('top')">
            <svg-icon icon-class="align-2-top" />
          </el-button>
        </el-tooltip>
        <el-tooltip effect="light" content="向下对齐">
          <el-button size="mini" @click="elementsAlign('bottom')">
            <svg-icon icon-class="align-2-bottom" />
          </el-button>
        </el-tooltip>
        <el-tooltip effect="light" content="水平居中">
          <el-button size="mini" @click="elementsAlign('center')">
            <svg-icon icon-class="align-2-center" />
          </el-button>
        </el-tooltip>
        <el-tooltip effect="light" content="垂直居中">
          <el-button size="mini" @click="elementsAlign('middle')">
            <svg-icon icon-class="align-2-middle" />
          </el-button>
        </el-tooltip>
      </el-button-group>
      <el-button-group key="scale-control">
        <el-tooltip effect="light" content="缩小视图">
          <el-button size="mini" :disabled="defaultZoom < 0.2" icon="el-icon-zoom-out" @click="processZoomOut()" />
        </el-tooltip>
        <el-button size="mini" icon="el-icon-aim">{{ Math.floor(defaultZoom * 10 * 10) + "%" }}</el-button>
        <el-tooltip effect="light" content="放大视图">
          <el-button size="mini" :disabled="defaultZoom > 4" icon="el-icon-zoom-in" @click="processZoomIn()" />
        </el-tooltip>
        <el-tooltip effect="light" content="重置视图并居中">
          <el-button size="mini" icon="el-icon-c-scale-to-original" @click="processReZoom()" />
        </el-tooltip>
        <el-tooltip effect="light" content="展开/收起小地图">
          <el-button size="mini" icon="el-icon-map-location" @click="minimapToggle()" />
        </el-tooltip>
      </el-button-group>
      <!-- 用于打开本地文件-->
      <input id="files" ref="refFile" type="file" style="display: none" accept=".xml, .bpmn" @change="importLocalFile">
    </div>
    <div class="my-process-designer__container">
      <div ref="bpmn-canvas" class="my-process-designer__canvas" />
    </div>
    <el-dialog title="预览" width="60%" :visible.sync="previewModelVisible" append-to-body destroy-on-close>
      <highlightjs :language="previewType" :code="previewResult" />
    </el-dialog>
  </div>
</template>

<script>
import Vue from 'vue'
import './style/index.scss'
// 引入相关的依赖
import BpmnModeler from 'bpmn-js/lib/Modeler'

import DefaultEmptyXML from './defaultEmpty'
// 翻译方法
import customTranslate from './translate/customTranslate'
import translationsCN from './translate/zh'
// 小地图
import minimapModule from 'diagram-js-minimap'
// 标签解析 Moddle
import flowableModdleDescriptor from './descriptor/flowableDescriptor.json'
// 标签解析 Extension
import flowableModdleExtension from './extension-moddle/flowable'

// import MyPropertiesPanel from './panel/PropertiesPanel.vue'
// 自定义左侧菜单
import CustomPaletteProvider from './palette/index'

import rendererModule from './renderer/index.js'
import contextPadModule from './contextPad/index.js'
// import UserSql from './extension/user.json'
import custom from './extension/custom.json'
import elDragDialog from '@/directive/el-drag-dialog'
import { vuePlugin } from '@/components/bpmn/highlight'
Vue.use(vuePlugin)
// import { xmlStr } from '@/mock/xmlStr.xml'
// 引入json转换与高亮
import X2JS from 'x2js'
export default {
  name: '',
  components: {
    // MyPropertiesPanel
  },
  directives: { elDragDialog },
  props: {
    processId: {
      type: String,
      default: 'id001'
    },
    processName: {
      type: String,
      default: '业务流程1'
    }
  },
  data() {
    return {
      // bpmn建模器
      bpmnModeler: null,
      container: null,
      canvas: null,
      // 自定义moddle
      moddleExtension: {
        custom

      },
      events: ['element.click', 'element.contextmenu'],
      previewModelVisible: false,
      simulationStatus: false,
      previewResult: '',
      previewType: 'xml',
      defaultZoom: 1,
      enumBoard: [
        { label: '撤回', key: 'Ctrl + Z' },
        { label: '全选', key: 'Ctrl + A' },
        { label: '放大/缩小', key: 'Ctrl + 滚轮' },
        { label: '多选', key: 'Shift + 鼠标左键' },
        { label: '编辑', key: 'E' },
        { label: '手工具', key: 'H' },
        { label: '套索工具', key: 'L' },
        { label: '创建/删除空间工具', key: 'S' }
      ]
    }
  },
  computed: {
    additionalModules() {
      const Modules = []
      Modules.push(minimapModule)
      // 翻译模块
      const TranslateModule = {
        translate: ['value', customTranslate(this.translations || translationsCN)]
      }
      Modules.push(TranslateModule)
      Modules.push(flowableModdleExtension)
      // 自定义侧边栏
      Modules.push(CustomPaletteProvider)
      // 自定义模块
      Modules.push(rendererModule)
      Modules.push(contextPadModule)
      return Modules
    },
    moddleExtensions() {
      const Extensions = {}
      Extensions.flowable = flowableModdleDescriptor
      // 插入用户自定义模块
      if (this.moddleExtension) {
        for (const key in this.moddleExtension) {
          Extensions[key] = this.moddleExtension[key]
        }
      }
      return Extensions
    }
  },
  created() {
  },
  mounted() {
    // 禁用右键默认行为
    document.oncontextmenu = function() {
      return false
    }
    this.initBpmnModeler()
    this.$once('hook:beforeDestroy', () => {
      // 恢复右键默认行为
      document.oncontextmenu = function() {
        return true
      }
    })
  },
  methods: {
    initBpmnModeler() {
      this.bpmnModeler = new BpmnModeler({
        container: this.$refs['bpmn-canvas'],
        keyboard: { bindTo: document },
        additionalModules: this.additionalModules,
        moddleExtensions: this.moddleExtensions,
        taskResizingEnabled: true,
        eventResizingEnabled: true,
        minimap: {
          open: true
        }
      })

      this.$emit('init-finished', this.bpmnModeler)
      this.initModelListeners()

      const local = this.processId
      const xmlStr = localStorage.getItem(`${local}`) || ''
      this.createNewDiagram(xmlStr)

      // const data = ['StartEvent_17tqbu3']

      // this.bpmnModeler.get('canvas').zoom('fit-viewport', 'auto')
    },
    initModelListeners() {
      const EventBus = this.bpmnModeler.get('eventBus')
      const that = this
      // 注册需要的监听事件, 将. 替换为 - , 避免解析异常
      this.events.forEach(event => {
        EventBus.on(event, function(eventObj) {
          const eventName = event.replace(/\./g, '-')
          const element = eventObj ? eventObj.element : null
          that.$emit(eventName, element, eventObj)
        })
      })

      // 监听图形改变返回xml
      EventBus.on('commandStack.changed', async event => {
        // console.log('commandStack.changed')
        // try {
        //   this.recoverable = this.bpmnModeler.get('commandStack').canRedo()
        //   this.revocable = this.bpmnModeler.get('commandStack').canUndo()
        //   const { xml } = await this.bpmnModeler.saveXML({ format: true })
        //   this.$emit('commandStack-changed', event)
        //   this.$emit('input', xml)
        //   this.$emit('change', xml)
        // } catch (e) {
        //   console.error(`[Process Designer Warn]: ${e.message || e}`)
        // }
      })

      // 监听视图缩放变化
      this.bpmnModeler.on('canvas.viewbox.changed', ({ viewbox }) => {
        this.$emit('canvas-viewbox-changed', { viewbox })
        const { scale } = viewbox
        this.defaultZoom = Math.floor(scale * 100) / 100
      })
    },
    createMarkerEnd() {
      const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker')
      const markerAttrs = {
        id: 'sequenceflow-arrow-normal-red',
        viewBox: '0 0 20 20',
        refX: '11',
        refY: '10',
        markerWidth: '10',
        markerHeight: '10',
        orient: 'auto'
      }

      const keys = Object.keys(markerAttrs)
      for (const key of keys) {
        marker.setAttribute(key, markerAttrs[key])
      }

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      const pathAttrs = {
        d: 'M 1 5 L 11 10 L 1 15 Z',
        style: 'fill: red; stroke-width: 1px; stroke-linecap: round; stroke-dasharray: 10000, 1; stroke: red;'
      }
      const pathKeys = Object.keys(pathAttrs)
      for (const key of pathKeys) {
        path.setAttribute(key, pathAttrs[key])
      }

      marker.appendChild(path)
      return marker
    },
    createMarkerStartCondition() {
      const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker')
      const markerAttrs = {
        id: 'conditional-flow-marker-red',
        viewBox: '0 0 20 20',
        refX: '-1',
        refY: '10',
        markerWidth: '10',
        markerHeight: '10',
        orient: 'auto'
      }

      const keys = Object.keys(markerAttrs)
      for (const key of keys) {
        marker.setAttribute(key, markerAttrs[key])
      }

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      const pathAttrs = {
        d: 'M 0 10 L 8 6 L 16 10 L 8 14 Z',
        style: 'fill: white; stroke-width: 1px; stroke-linecap: round; stroke-dasharray: 10000, 1; stroke: red;'
      }
      const pathKeys = Object.keys(pathAttrs)
      for (const key of pathKeys) {
        path.setAttribute(key, pathAttrs[key])
      }

      marker.appendChild(path)
      return marker
    },
    /* 创建新的流程图 */
    async createNewDiagram(xml) {
      // 将字符串转换成图显示出来
      const newId = this.processId || `Process_${new Date().getTime()}`
      const newName = this.processName || `业务流程_${new Date().getTime()}`
      const xmlString = xml || DefaultEmptyXML(newId, newName, 'flowable')
      try {
        const { warnings } = await this.bpmnModeler.importXML(xmlString)
        this.processReZoom()
        this.coloring()
        if (warnings && warnings.length) {
          warnings.forEach(warn => console.log(warn, 97))
        }
      } catch (e) {
        console.error(`[Process Designer Warn]: ${e?.message || e}`)
      }
    },
    // 保存
    async handleUpdateBpmnXML() {
      const { xml } = await this.bpmnModeler.saveXML({ format: false })
      console.log({ xml: xml }, 129)
      const result = window?.bpmnInstances?.bpmnElement?.businessObject || {}
      localStorage.setItem(`${result.id}`, xml)
    },
    handlecancel() {
      this.$router.push({
        path: '/flowChart/administration'
      })
    },
    // 加载本地文件
    importLocalFile() {
      const that = this
      const file = this.$refs.refFile.files[0]
      const reader = new FileReader()
      reader.readAsText(file)
      reader.onload = function() {
        const xmlStr = this.result
        that.createNewDiagram(xmlStr)
      }
    },
    /* -----------------------------    渲染方法结束     ---------------------------------*/
    // 走过的节点上色
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
      // const canvas = this.bpmnModeler.get('canvas')
      // for (const item of highLine) {
      //   canvas.addMarker(item, 'highlight-red')
      // }
      // for (const item of highPoint) {
      //   canvas.addMarker(item, 'highlight-red')
      // }

      // canvas.addMarker('Activity_1tjwl5v', 'highlight-current')

      const elementRegistry = this.bpmnModeler.get('elementRegistry')
      const modeling = this.bpmnModeler.get('modeling')
      // 走过的线高亮
      highLine.forEach(e => {
        if (e != null) {
          const highLineEle = elementRegistry.get(e)
          if (highLineEle) {
            modeling.setColor(highLineEle, {
              stroke: 'red'
              // fill: 'red'
            })
          }
        }
      })
      // 走过的节点高亮
      highPoint.forEach(e => {
        if (e != null) {
          const highPointEle = elementRegistry.get(e)
          if (highPointEle) {
            modeling.setColor(highPointEle, {
              stroke: 'red'
              // fill: 'red'
            })
          }
        }
      })
    },
    // 预览XML
    previewProcessXML() {
      this.bpmnModeler.saveXML({ format: true }).then(({ xml }) => {
        this.previewResult = xml
        this.previewType = 'xml'
        this.previewModelVisible = true
      })
    },
    // 预览JSON
    previewProcessJson() {
      const newConvert = new X2JS()
      this.bpmnModeler.saveXML({ format: true }).then(({ xml }) => {
        const { definitions } = newConvert.xml2js(xml)
        if (definitions) {
          this.previewResult = JSON.stringify(definitions, null, 4)
        } else {
          this.previewResult = ''
        }

        this.previewType = 'json'
        this.previewModelVisible = true
      })
    },
    /* -----------------------------    下载文件     ---------------------------------*/
    // 下载流程图到本地
    /**
     * @param {string} type
     * @param {*} name
     */
    async downloadProcess(type, name) {
      try {
        const _this = this
        // 按需要类型创建文件并下载
        if (type === 'xml' || type === 'bpmn') {
          const { err, xml } = await this.bpmnModeler.saveXML()
          // 读取异常时抛出异常
          if (err) {
            console.error(`[Process Designer Warn ]: ${err.message || err}`)
          }
          const { href, filename } = _this.setEncoded(type.toUpperCase(), name, xml)
          downloadFunc(href, filename)
        } else {
          const { err, svg } = await this.bpmnModeler.saveSVG()
          // 读取异常时抛出异常
          if (err) {
            return console.error(err)
          }
          const { href, filename } = _this.setEncoded('SVG', name, svg)
          downloadFunc(href, filename)
        }
      } catch (e) {
        console.error(`[Process Designer Warn ]: ${e.message || e}`)
      }
      // 文件下载方法
      function downloadFunc(href, filename) {
        if (href && filename) {
          const a = document.createElement('a')
          a.download = filename // 指定下载的文件名
          a.href = href //  URL对象
          a.click() // 模拟点击
          URL.revokeObjectURL(a.href) // 释放URL 对象
        }
      }
    },
    // 根据所需类型进行转码并返回下载地址
    setEncoded(type, filename = 'diagram', data) {
      const encodedData = encodeURIComponent(data)
      return {
        filename: `${filename}.${type}`,
        href: `data:application/${type === 'svg' ? 'text/xml' : 'bpmn20-xml'};charset=UTF-8,${encodedData}`,
        data: data
      }
    },
    // 下载为BPMN文件
    downloadProcessAsBpmn() {
      this.downloadProcess('bpmn')
    },
    // 下载为xml文件
    downloadProcessAsXml() {
      this.downloadProcess('xml')
    },
    // // 下载为svg文件 存在问题 自定义图片类型无法正常显示
    downloadProcessAsSvg() {
      this.downloadProcess('svg')
    },
    processZoomOut(zoomStep = 0.1) {
      const newZoom = Math.floor(this.defaultZoom * 100 - zoomStep * 100) / 100
      this.defaultZoom = newZoom
      this.bpmnModeler.get('canvas').zoom(this.defaultZoom)
    },
    processZoomIn(zoomStep = 0.1) {
      const newZoom = Math.floor(this.defaultZoom * 100 + zoomStep * 100) / 100
      this.defaultZoom = newZoom
      this.bpmnModeler.get('canvas').zoom(this.defaultZoom)
    },
    // 重置视图并居中
    processReZoom() {
      this.defaultZoom = 1
      this.bpmnModeler.get('canvas').zoom('fit-viewport', 'auto')
    },
    minimapToggle() {
      this.bpmnModeler.get('minimap').toggle()
    },
    elementsAlign(align) {
      const Align = this.bpmnModeler.get('alignElements')
      const Selection = this.bpmnModeler.get('selection')
      const SelectedElements = Selection.get()
      if (!SelectedElements || SelectedElements.length <= 1) {
        this.$message.warning('请按住 Shift 键选择多个元素对齐')
        return
      }
      this.$confirm('自动对齐可能造成图形变形，是否继续？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => Align.trigger(SelectedElements, align))
    }
  }
}
</script>

<style scoped lang="scss">
// 以下为bpmn工作流绘图工具的样式
@import '~bpmn-js/dist/assets/diagram-js.css';
@import '~bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
@import '~bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css';
@import '~bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
@import '~diagram-js-minimap/assets/diagram-js-minimap.css';

@import '~highlight.js/styles/atom-one-dark-reasonable.css';
.my-process-designer {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100vh - 50px);
  box-sizing: border-box;
  ::v-deep .my-process-designer__header {
    width: 100%;
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
  .my-process-designer__container {
    display: inline-flex;
    width: 100%;
    flex: 1;
    .my-process-designer__canvas {
      flex: 1;
      width: 100%;
      height: 100%;
      position: relative;
      background-color: #fff;
      background: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMTBoNDBNMTAgMHY0ME0wIDIwaDQwTTIwIDB2NDBNMCAzMGg0ME0zMCAwdjQwIiBmaWxsPSJub25lIiBzdHJva2U9IiNlMGUwZTAiIG9wYWNpdHk9Ii4yIi8+PHBhdGggZD0iTTQwIDBIMHY0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZTBlMGUwIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+")
      repeat !important;
      ::v-deep div.toggle-mode {
        display: none;
      }
    }
  }

  // ::v-deep.highlight-red .djs-visual > :nth-child(1) {
  //   stroke: red !important;
  // }

  // ::v-deep.highlight-red.djs-connection path {
  //   marker-end: url(#sequenceflow-arrow-normal-red) !important;
  // }

  // ::v-deep.conditional-flow.highlight-red .djs-visual > :nth-child(1) {
  //   marker-start: url(#conditional-flow-marker-red) !important;
  // }

  // ::v-deep.highlight-current .djs-outline {
  //   stroke: red;
  //   stroke-width: 1px;
  //   visibility: visible;
  //   shape-rendering: geometricPrecision;
  //   stroke-dasharray: 3,3;
  // }
  ::v-deep.djs-minimap .map {
    width: 250px;
    height: 140px;
  }

}
::v-deep .keyboard {
  display: flex;
  justify-content: space-between;
  width: 250px;
  margin: 5px;
  & :nth-child(1) {
    flex: 5;
  }
  & :nth-child(2) {
    flex: 4;
    margin-right: 20px;
  }
}
::v-deep ::-webkit-scrollbar{
  width:6px;
  height:6px;
  background-color:rgba(0,0,0,0);
}
::v-deep ::-webkit-scrollbar-thumb{
  background-color:#cfcfcf;
  border-radius:10px;
}
::v-deep ::-webkit-scrollbar-track{
  background-color:transparent;
}
::v-deep {
  .el-table td,
  .el-table th {
    color: #333;
  }
  .el-drawer__header {
    padding: 16px 16px 8px 16px;
    margin: 0;
    line-height: 24px;
    font-size: 18px;
    color: #303133;
    box-sizing: border-box;
    border-bottom: 1px solid #e8e8e8;
  }
  div[class^="el-drawer"]:focus,
  span:focus {
    outline: none;
  }
  .el-drawer__body {
    box-sizing: border-box;
    padding: 16px;
    width: 100%;
    overflow-y: auto;
  }

  .el-dialog {
    margin-top: 50vh !important;
    transform: translateY(-50%);
    overflow: hidden;
  }
  .el-dialog__wrapper {
    overflow: hidden;
    max-height: 100vh;
  }
  .el-dialog__header {
    padding: 16px 16px 8px 16px;
    box-sizing: border-box;
    border-bottom: 1px solid #e8e8e8;
  }
  .el-dialog__body {
    padding: 16px;
    max-height: 80vh;
    box-sizing: border-box;
    overflow-y: auto;
  }
  .el-dialog__footer {
    padding: 16px;
    box-sizing: border-box;
    border-top: 1px solid #e8e8e8;
  }
  .el-dialog__close {
    font-weight: 600;
  }
  .el-select {
    width: 100%;
  }
  .el-divider:not(.el-divider--horizontal) {
    margin: 0 8px ;
  }
  .el-divider.el-divider--horizontal {
    margin: 16px 0;
  }
}
</style>
