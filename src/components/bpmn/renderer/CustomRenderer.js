import BpmnRenderer from 'bpmn-js/lib/draw/BpmnRenderer'
import { customElements, customConfig } from './customElementConfig'

import { append as svgAppend, create as svgCreate, attr as svgAttr } from 'tiny-svg'
import { transform } from 'diagram-js/lib/util/SvgTransformUtil'
import {
  getFillColor,
  getStrokeColor
} from 'bpmn-js/lib/draw/BpmnRenderUtil'

export default class CustomRenderer extends BpmnRenderer {
  constructor(config, eventBus, styles, pathMap, canvas, textRenderer) {
    super(config, eventBus, styles, pathMap, canvas, textRenderer, 2000)
    var computeStyle = styles.computeStyle
    var defaultFillColor = config && config.defaultFillColor
    var defaultStrokeColor = config && config.defaultStrokeColor

    function drawPath(parentGfx, d, attrs) {
      attrs = computeStyle(attrs, ['no-fill'], {
        strokeWidth: 2,
        stroke: 'black'
      })

      var path = svgCreate('path')
      svgAttr(path, { d: d })
      svgAttr(path, attrs)

      svgAppend(parentGfx, path)

      return path
    }

    const that = this
    customElements.forEach((item) => {
      this.handlers[item.type] = function(parentGfx, element) {
        const task = that.handlers['bpmn:Task'](parentGfx, element)
        const type = element.type
        const key = type.split(':')[1]

        const { url, attr } = customConfig[key]
        const customIcon = svgCreate('image', { ...attr, href: url, strokeWidth: 20 })
        // element['width'] = attr.width
        // element['height'] = attr.height
        svgAppend(parentGfx, customIcon)

        return task
      }
    })

    this.handlers['custom:DatumTask'] = function(parentGfx, element) {
      const task = that.handlers['bpmn:Task'](parentGfx, element)

      const pathData = 'm19.000483,42.689018l0,0c0,21.856269 61.560855,39.574288 137.500021,39.574288c75.939129,0 137.499965,-17.71802 137.499965,-39.574288l0,0c0,-21.856282 61.560874,-39.574288 137.500039,-39.574288c75.939166,0 137.499965,17.71802 137.499965,39.574288l0,316.594307c0,-21.856269 -61.560818,-39.574315 -137.499965,-39.574315c-75.939166,0 -137.500039,17.718033 -137.500039,39.574315c0,21.856255 -61.560837,39.574275 -137.499965,39.574275c-75.939166,0 -137.500021,-17.71802 -137.500021,-39.574275l0,-316.594307z'
      const pathEle = drawPath(parentGfx, pathData, {
        strokeWidth: 25,
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      })
      transform(pathEle, 5, 5, 0, 0.04)

      return task
    }
  }
}

