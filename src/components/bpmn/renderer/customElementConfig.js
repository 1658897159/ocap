const BrowseTask = require('../assets/svg/member.svg')
const MySqlTask = require('../assets/svg/mySql.svg')
const RtdTask = require('../assets/svg/RTD.svg')
const PtsTask = require('../assets/svg/PTS.svg')

const attr = { x: 4, y: 3, width: 28, height: 28 }
const customElements = [
  {
    type: 'custom:RtdTask',
    attr: { x: 4, y: 1, width: 28, height: 28 }
  },
  {
    type: 'custom:PtsTask',
    attr: { x: 4, y: 1, width: 28, height: 28 }
  }
]
const customConfig = Object.create(null)

customElements.forEach((item) => {
  const shortType = item.type.replace(/^custom:/, '')
  customConfig[shortType] = {
    // eslint-disable-next-line no-eval
    url: eval(shortType),
    attr: item.attr
  }
})
export { customElements, customConfig }
