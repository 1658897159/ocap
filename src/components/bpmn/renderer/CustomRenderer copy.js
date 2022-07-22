import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer'
import { customElements, customConfig } from './customElementConfig'
import {
  append as svgAppend,
  attr as svgAttr,
  create as svgCreate,
  classes as svgClasses,
  remove as svgRemove
} from 'tiny-svg'
import { assign, isObject } from 'min-dash'
import { rotate, transform, translate } from 'diagram-js/lib/util/SvgTransformUtil'
import { getRoundRectPath } from 'bpmn-js/lib/draw/BpmnRenderUtil'

import { is } from 'bpmn-js/lib/util/ModelUtil'
import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil'

const HIGH_PRIORITY = 1500
const TASK_BORDER_RADIUS = 2

export default class CustomRenderer extends BaseRenderer {
  // 继承BaseRenderer
  constructor(eventBus, bpmnRenderer, styles, textRenderer, canvas) {
    super(eventBus, HIGH_PRIORITY, styles, textRenderer, canvas)
    this.bpmnRenderer = bpmnRenderer
    this.textRenderer = textRenderer
    // this.CONNECTION_STYLE = styles.style(['no-fill'], { strokeWidth: 1, stroke: 'fuchsia' })
    this.canvas = this.bpmnRenderer.canvas
    this.styles = this.bpmnRenderer.styles
  }

  canRender(element) {
    return !element.labelTarget
  }

  renderLabel(parentGfx, label, options) {
    options = assign({
      size: {
        width: 100
      }
    }, options)

    var text = this.textRenderer.createText(label || '', options)

    svgClasses(text).add('djs-label')

    svgAppend(parentGfx, text)

    return text
  }

  drawShape(parentNode, element) {
    const type = element.type// 获取到类型
    // 所有节点都会走到这个函数，所以此时只限制，需要自定义的才去自定义，否则仍然显示bpmn默认图标
    if (customElements.includes(type)) {
      const key = type.split(':')[1]
      const { url, attr } = customConfig[key]
      const customIcon = svgCreate('image', { ...attr, href: url })
      element['width'] = attr.width
      element['height'] = attr.height
      svgAppend(parentNode, customIcon)
      console.log(element, 61)
      // this.renderLabel(parentNode, element.businessObject.name, {
      //   box: element,
      //   fitBox: true,
      //   align: 'center-middle',
      //   style: {
      //     fill: 'black'
      //   }
      // })
      // const top = element.height
      // transform(textBox, 0, top / 2, 0)

      return customIcon
    }
    const shape = this.bpmnRenderer.drawShape(parentNode, element)
    return shape
  }
  getShapePath(shape) {
    return this.bpmnRenderer.getShapePath(shape)
  }
}

CustomRenderer.$inject = ['eventBus', 'bpmnRenderer']
