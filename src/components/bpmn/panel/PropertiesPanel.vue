<template>
  <div class="process-panel__container">
    <div class="container_top">
      <div class="container_item">
        <div class="title"><i class="el-icon-info mr10" />常规信息</div>
        <ElementBaseInfo :business-object="elementBusinessObject" />
      </div>
      <template v-if="conditionFormVisible">
        <div class="container_item">
          <div class="title"><i class="el-icon-s-promotion mr10" />流转条件</div>
          <FlowCondition :business-object="elementBusinessObject" />
        </div>
      </template>
      <template v-if="elementType.indexOf('Task') !== -1">
        <div class="container_item">
          <div class="title"><i class="el-icon-s-claim mr10" />任务</div>
          <element-task :id="elementId" :type="elementType" />
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import ElementBaseInfo from './base/ElementBaseInfo'
import FlowCondition from './flow-condition/FlowCondition'
import ElementTask from './task/ElementTask'
export default {
  name: 'MyPropertiesPanel',
  componentName: 'MyPropertiesPanel',
  components: {
    ElementBaseInfo,
    FlowCondition,
    ElementTask
  },
  props: {
    bpmnModeler: {
      type: Object,
      default: () => {}
    },
    width: {
      type: Number,
      default: 480
    }
  },
  data() {
    return {
      elementId: '',
      elementType: '',
      elementBusinessObject: {}, // 元素 businessObject 镜像，提供给需要做判断的组件使用
      conditionFormVisible: false // 流转条件
    }
  },
  created() {
    this.initModels()
  },
  mounted() {
    // 离开页面删除window.bpmnInstances数据
    this.$once('hook:beforeDestroy', () => {
      Reflect.deleteProperty(window, 'bpmnInstances')
    })
  },
  methods: {
    initModels() {
      // 初始化 modeler 以及其他 moddle
      if (!this.bpmnModeler) {
        // 避免加载时 流程图 并未加载完成
        this.timer = setTimeout(() => this.initModels(), 10)
        return
      }
      if (this.timer) clearTimeout(this.timer)
      window.bpmnInstances = {
        modeler: this.bpmnModeler,
        modeling: this.bpmnModeler.get('modeling'),
        moddle: this.bpmnModeler.get('moddle'),
        eventBus: this.bpmnModeler.get('eventBus'),
        bpmnFactory: this.bpmnModeler.get('bpmnFactory'),
        elementFactory: this.bpmnModeler.get('elementFactory'),
        elementRegistry: this.bpmnModeler.get('elementRegistry'),
        replace: this.bpmnModeler.get('replace'),
        selection: this.bpmnModeler.get('selection')
      }
      this.getActiveElement()
    },
    getActiveElement() {
      // 初始第一个选中元素 bpmn:Process
      this.initFormOnChanged(null)
      this.bpmnModeler.on('import.done', e => {
        this.initFormOnChanged(null)
      })
      // 监听选择事件，修改当前激活的元素以及表单
      this.bpmnModeler.on('selection.changed', ({ newSelection }) => {
        this.initFormOnChanged(newSelection[0] || null)
      })
      this.bpmnModeler.on('element.changed', ({ element }) => {
        // 保证 修改 "默认流转路径" 类似需要修改多个元素的事件发生的时候，更新表单的元素与原选中元素不一致。
        if (element && element.id === this.elementId) {
          this.initFormOnChanged(element)
        }
      })
    },
    // 初始化数据
    initFormOnChanged(element) {
      let activatedElement = element
      if (!activatedElement) {
        activatedElement =
          window.bpmnInstances.elementRegistry.find(el => el.type === 'bpmn:Process') ??
          window.bpmnInstances.elementRegistry.find(el => el.type === 'bpmn:Collaboration')
      }
      if (!activatedElement) return
      window.bpmnInstances.bpmnElement = activatedElement
      this.bpmnElement = activatedElement
      this.elementId = activatedElement.id
      this.elementType = activatedElement.type.split(':')[1] || ''
      this.elementBusinessObject = JSON.parse(JSON.stringify(activatedElement.businessObject))
      console.log(activatedElement, '点击元素')
      // 流转条件
      // this.conditionFormVisible = !!(
      //   this.elementType === 'SequenceFlow' &&
      //   activatedElement.source &&
      //   activatedElement.source.type.indexOf('StartEvent') === -1
      // )

      this.conditionFormVisible = this.showConditionSeqFlow(activatedElement)
      this.formVisible = this.elementType === 'UserTask' || this.elementType === 'StartEvent'
    },
    showConditionSeqFlow(element) {
      if (element?.type !== 'bpmn:SequenceFlow') {
        return false
      }
      const bo = element?.businessObject

      // 来源节点为并行网关 bpmn:ParallelGateway
      if (bo?.sourceRef?.$type === 'bpmn:ParallelGateway') {
        return false
      }
      // 来源节点为互斥网关 bpmn:ExclusiveGateway
      if (bo?.sourceRef?.$type === 'bpmn:ExclusiveGateway') {
        return true
      }

      // return !!bo?.conditionExpression
      return this.elementType === 'SequenceFlow' && element.source && element.source.type.indexOf('StartEvent') === -1
    }
  }
}
</script>

<style lang="scss" scoped>
.process-panel__container {
  width: 100%;
	height: 100%;
  box-sizing: border-box;
  padding: 20px 24px;
  border-left: 1px solid #eeeeee;
  .container_top {
    width: 100%;
    height: calc(100vh - 200px);
    overflow-x: hidden;
    overflow-y: auto;
  }
	.container_item {
		.title {
			font-weight: 700;
			font-size: 18px;
			color: #2160aa;
			margin: 10px 10px;
			margin-top: 10px;
			margin-bottom: 10px
		}
	}
  .container_button {
    display: flex;
    justify-content: space-around;
    text-align: center;
    padding: 0 80px;
    ::v-deep .el-button+.el-button {
      margin: 0;
    }
  }
}
.mr10 {
  margin-right: 10px;
}
/* 设置滚动条的样式 */
::v-deep ::-webkit-scrollbar {
width: 8px;
}
/* 滚动槽 */
::v-deep ::-webkit-scrollbar-track {
  // -webkit-box-shadow:inset006pxrgba(0,0,0,0.3);
  border-radius:10px;
}
/* 滚动条滑块 */
::v-deep ::-webkit-scrollbar-thumb {
  border-radius:10px;
  background:rgba(0,0,0,0.1);
  // -webkit-box-shadow:inset006pxrgba(0,0,0,0.5);
}
::v-deep ::-webkit-scrollbar-thumb:window-inactive {
  // background:inset006pxrgba(0,0,0,0.3);
}
</style>
