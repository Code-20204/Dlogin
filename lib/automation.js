import { startOfWeek, endOfWeek, startOfDay, endOfDay, addDays, isAfter, isBefore, isEqual } from 'date-fns'

/**
 * 处理自动化列表的核心引擎
 * @param {Array} items - 所有列表项
 * @param {Array} rules - 自动化规则数组
 * @returns {Array} 过滤后的列表项
 */
export const processAutoList = (items, rules) => {
  if (!rules || rules.length === 0) {
    return items
  }

  return items.filter(item => {
    return rules.every(rule => {
      return evaluateRule(item, rule)
    })
  })
}

/**
 * 评估单个规则
 * @param {Object} item - 列表项
 * @param {Object} rule - 规则对象
 * @returns {boolean} 是否符合规则
 */
const evaluateRule = (item, rule) => {
  const { field, operator, value } = rule
  const itemValue = item[field]

  switch (field) {
    case 'dueDate':
      return evaluateDateRule(itemValue, operator, value)
    
    case 'completed':
      return evaluateBooleanRule(itemValue, operator, value)
    
    case 'priority':
      return evaluateStringRule(itemValue, operator, value)
    
    case 'title':
    case 'description':
      return evaluateTextRule(itemValue, operator, value)
    
    default:
      return true
  }
}

/**
 * 评估日期规则
 */
const evaluateDateRule = (itemDate, operator, value) => {
  if (!itemDate) return false
  
  const date = new Date(itemDate)
  const now = new Date()
  let compareDate

  // 处理特殊值
  switch (value) {
    case 'today':
      compareDate = endOfDay(now)
      break
    case 'tomorrow':
      compareDate = endOfDay(addDays(now, 1))
      break
    case 'endOfWeek':
      compareDate = endOfWeek(now)
      break
    case 'startOfWeek':
      compareDate = startOfWeek(now)
      break
    case 'now':
      compareDate = now
      break
    default:
      compareDate = new Date(value)
  }

  switch (operator) {
    case '<':
    case 'before':
      return isBefore(date, compareDate)
    case '>':
    case 'after':
      return isAfter(date, compareDate)
    case '=':
    case 'equals':
      return isEqual(startOfDay(date), startOfDay(compareDate))
    case '<=':
      return isBefore(date, compareDate) || isEqual(date, compareDate)
    case '>=':
      return isAfter(date, compareDate) || isEqual(date, compareDate)
    default:
      return false
  }
}

/**
 * 评估布尔规则
 */
const evaluateBooleanRule = (itemValue, operator, value) => {
  switch (operator) {
    case '=':
    case 'equals':
      return itemValue === value
    case '!=':
    case 'not':
      return itemValue !== value
    default:
      return false
  }
}

/**
 * 评估字符串规则
 */
const evaluateStringRule = (itemValue, operator, value) => {
  if (!itemValue) return false
  
  switch (operator) {
    case '=':
    case 'equals':
      return itemValue === value
    case '!=':
    case 'not':
      return itemValue !== value
    case 'in':
      return Array.isArray(value) && value.includes(itemValue)
    default:
      return false
  }
}

/**
 * 评估文本规则
 */
const evaluateTextRule = (itemValue, operator, value) => {
  if (!itemValue) return false
  
  const text = itemValue.toLowerCase()
  const searchValue = value.toLowerCase()
  
  switch (operator) {
    case 'contains':
      return text.includes(searchValue)
    case 'startsWith':
      return text.startsWith(searchValue)
    case 'endsWith':
      return text.endsWith(searchValue)
    case 'equals':
      return text === searchValue
    case 'not':
      return !text.includes(searchValue)
    default:
      return false
  }
}

/**
 * 预定义的自动化规则模板
 */
export const ruleTemplates = {
  thisWeek: {
    name: '本周到期',
    rules: [{
      field: 'dueDate',
      operator: '<=',
      value: 'endOfWeek'
    }]
  },
  overdue: {
    name: '已过期',
    rules: [{
      field: 'dueDate',
      operator: '<',
      value: 'now'
    }, {
      field: 'completed',
      operator: '=',
      value: false
    }]
  },
  highPriority: {
    name: '高优先级',
    rules: [{
      field: 'priority',
      operator: '=',
      value: 'high'
    }]
  },
  completed: {
    name: '已完成',
    rules: [{
      field: 'completed',
      operator: '=',
      value: true
    }]
  },
  pending: {
    name: '待完成',
    rules: [{
      field: 'completed',
      operator: '=',
      value: false
    }]
  }
}

/**
 * 验证规则格式
 */
export const validateRule = (rule) => {
  const { field, operator, value } = rule
  
  if (!field || !operator || value === undefined) {
    return false
  }
  
  const validFields = ['dueDate', 'completed', 'priority', 'title', 'description']
  const validOperators = ['=', '!=', '<', '>', '<=', '>=', 'contains', 'startsWith', 'endsWith', 'in', 'not', 'equals', 'before', 'after']
  
  return validFields.includes(field) && validOperators.includes(operator)
}