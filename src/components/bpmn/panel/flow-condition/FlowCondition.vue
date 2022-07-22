<template>
  <div class="panel-tab__content">
    <el-form size="mini" label-width="70px" @submit.native.prevent>
      <el-form-item label="流转类型">
        <el-select v-model="flowConditionForm.type" @change="updateFlowType">
          <el-option label="普通流转路径" value="normal" />
          <!-- <el-option label="默认流转路径" value="default" /> -->
          <el-option label="条件流转路径" value="condition" />
        </el-select>
      </el-form-item>
      <el-form-item label="表达式">
        <el-input v-model="flowConditionForm.body" placeholder="输入表达式" :disabled="!(flowConditionForm.conditionType && flowConditionForm.conditionType === 'expression')" clearable @change="updateFlowCondition" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'FlowCondition',
  props: {
    businessObject: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      flowConditionForm: {}
    }
  },
  watch: {
    businessObject: {
      immediate: true,
      handler() {
        this.$nextTick(() => this.resetFlowCondition())
      }
    }
  },
  methods: {
    resetFlowCondition() {
      this.bpmnElement = window.bpmnInstances.bpmnElement
      this.bpmnElementSource = this.bpmnElement.source
      console.log(this.bpmnElement, 44)
      this.bpmnElementSourceRef = this.bpmnElement.businessObject.sourceRef
      if (this.bpmnElementSourceRef && this.bpmnElementSourceRef.default && this.bpmnElementSourceRef.default.id === this.bpmnElement.id) {
        // 默认
        this.flowConditionForm = { type: 'default' }
      } else if (!this.bpmnElement.businessObject.conditionExpression) {
        // 普通
        this.flowConditionForm = { type: 'normal' }
      } else {
        // 带条件
        const conditionExpression = this.bpmnElement.businessObject.conditionExpression
        this.flowConditionForm = { ...conditionExpression, type: 'condition' }
        this.$set(this.flowConditionForm, 'conditionType', 'expression')
      }
    },
    // 更新表达式
    updateFlowCondition() {
      const { conditionType, body } = this.flowConditionForm
      let condition
      if (conditionType === 'expression') {
        condition = window.bpmnInstances.moddle.create('bpmn:FormalExpression', { body })
      }
      // 更新xml文件内容
      window.bpmnInstances.modeling.updateProperties(this.bpmnElement, { conditionExpression: condition })
    },

    updateFlowType(flowType) {
      // 正常条件类
      if (flowType === 'condition') {
        this.flowConditionRef = window.bpmnInstances.moddle.create('bpmn:FormalExpression')
        window.bpmnInstances.modeling.updateProperties(this.bpmnElement, {
          conditionExpression: this.flowConditionRef
        })
        return
      }
      // 默认路径
      if (flowType === 'default') {
        window.bpmnInstances.modeling.updateProperties(this.bpmnElement, {
          conditionExpression: null
        })
        window.bpmnInstances.modeling.updateProperties(this.bpmnElementSource, {
          default: this.bpmnElement
        })
        return
      }
      // 正常路径，如果来源节点的默认路径是当前连线时，清除父元素的默认路径配置
      if (this.bpmnElementSourceRef.default && this.bpmnElementSourceRef.default.id === this.bpmnElement.id) {
        window.bpmnInstances.modeling.updateProperties(this.bpmnElementSource, {
          default: null
        })
      }
      window.bpmnInstances.modeling.updateProperties(this.bpmnElement, {
        conditionExpression: null
      })
    }
  }
}
</script>

<style>
.panel-tab__content {
	width: 100%;
  box-sizing: border-box;
  padding: 8px 16px;
}
</style>
