
const flowAction = {
  type: 'global-connect-tool',
  action: ['bpmn:SequenceFlow', 'connect', 'icon-custom bpmn-icon-connection-multi', '连接线']
}
const customShapeAction = [
  {
    type: 'create.task',
    action: ['bpmn:Task', 'model', 'bpmn-icon-task', '追加任务']
  },
  {
    type: 'create.user-task',
    action: ['bpmn:UserTask', 'model', 'bpmn-icon-user-task', '追加用户任务']
  },
  {
    type: 'create.exclusive-gateway',
    action: ['bpmn:ExclusiveGateway', 'activity', 'bpmn-icon-gateway-xor', '追加互斥网关']
  }
]
const customFlowAction = [
  flowAction
]
/**
     * 循环创建出一系列的元素
     * @param {Array} actions 元素集合
     * @param {Object} fn 处理的函数
     */
export function batchCreateCustom(actions, fn) {
  const customs = {}
  actions.forEach(item => {
    customs[item['type']] = fn(...item['action'])
  })
  return customs
}

export { customFlowAction, customShapeAction }
