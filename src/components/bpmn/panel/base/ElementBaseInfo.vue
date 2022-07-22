<template>
  <div class="panel-tab__content">
    <el-form size="mini" label-width="70px" @submit.native.prevent>
      <el-form-item label="节点类型">
        <el-input v-model="elementBaseInfo.$type" disabled clearable />
      </el-form-item>
      <el-form-item label="ID">
        <el-input v-model="elementBaseInfo.id" clearable @change="updateBaseInfo('id')" />
      </el-form-item>
      <el-form-item label="名称">
        <el-input v-model="elementBaseInfo.name" clearable @change="updateBaseInfo('name')" />
      </el-form-item>
      <!--流程的基础属性-->
      <template v-if="elementBaseInfo.$type === 'bpmn:Process'">
        <el-form-item label="版本标签">
          <el-input v-model="elementBaseInfo.versionTag" clearable @change="updateBaseInfo('versionTag')" />
        </el-form-item>
      </template>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'ElementBaseInfo',
  props: {
    businessObject: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      elementBaseInfo: {}
    }
  },
  watch: {
    businessObject: {
      immediate: false,
      handler: function(val) {
        if (val) {
          this.$nextTick(() => this.resetBaseInfo())
        }
      }
    }
  },
  beforeDestroy() {
    this.bpmnElement = null
  },
  methods: {
    resetBaseInfo() {
      this.bpmnElement = window?.bpmnInstances?.bpmnElement || {}
      this.elementBaseInfo = JSON.parse(JSON.stringify(this.bpmnElement.businessObject))
      // this.elementBaseInfo.type = this.elementBaseInfo.$type
      if (this.elementBaseInfo && this.elementBaseInfo.$type === 'bpmn:SubProcess') {
        this.$set(this.elementBaseInfo, 'isExpanded', this.elementBaseInfo.di?.isExpanded)
      }
    },
    updateBaseInfo(key) {
      if (key === 'id') {
        window.bpmnInstances.modeling.updateProperties(this.bpmnElement, {
          id: this.elementBaseInfo[key],
          di: { id: `${this.elementBaseInfo[key]}_di` }
        })
        return
      }
      const attrObj = Object.create(null)
      attrObj[key] = this.elementBaseInfo[key]
      window.bpmnInstances.modeling.updateProperties(this.bpmnElement, attrObj)
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
