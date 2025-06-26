import { useState } from 'react'
import { X, Plus, Trash2, Zap } from 'lucide-react'
import { ruleTemplates } from '@/lib/automation'

export default function AutoListBuilder({ onSubmit, onCancel }) {
  const [listType, setListType] = useState('MANUAL')
  const [title, setTitle] = useState('')
  const [rules, setRules] = useState([])
  const [showRuleBuilder, setShowRuleBuilder] = useState(false)
  const [currentRule, setCurrentRule] = useState({
    field: 'dueDate',
    operator: '<=',
    value: 'endOfWeek'
  })

  const fieldOptions = [
    { value: 'dueDate', label: '截止日期' },
    { value: 'completed', label: '完成状态' },
    { value: 'priority', label: '优先级' },
    { value: 'title', label: '标题' },
    { value: 'description', label: '描述' }
  ]

  const operatorOptions = {
    dueDate: [
      { value: '<=', label: '早于或等于' },
      { value: '<', label: '早于' },
      { value: '>=', label: '晚于或等于' },
      { value: '>', label: '晚于' },
      { value: '=', label: '等于' }
    ],
    completed: [
      { value: '=', label: '等于' },
      { value: '!=', label: '不等于' }
    ],
    priority: [
      { value: '=', label: '等于' },
      { value: '!=', label: '不等于' },
      { value: 'in', label: '包含在' }
    ],
    title: [
      { value: 'contains', label: '包含' },
      { value: 'startsWith', label: '开始于' },
      { value: 'endsWith', label: '结束于' },
      { value: 'equals', label: '等于' }
    ],
    description: [
      { value: 'contains', label: '包含' },
      { value: 'startsWith', label: '开始于' },
      { value: 'endsWith', label: '结束于' },
      { value: 'equals', label: '等于' }
    ]
  }

  const valueOptions = {
    dueDate: [
      { value: 'today', label: '今天' },
      { value: 'tomorrow', label: '明天' },
      { value: 'endOfWeek', label: '本周末' },
      { value: 'startOfWeek', label: '本周开始' },
      { value: 'now', label: '现在' }
    ],
    completed: [
      { value: true, label: '已完成' },
      { value: false, label: '未完成' }
    ],
    priority: [
      { value: 'low', label: '低' },
      { value: 'medium', label: '中' },
      { value: 'high', label: '高' }
    ]
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return

    const listData = {
      title: title.trim(),
      type: listType,
      rules: listType === 'AUTO' ? rules : null
    }

    onSubmit(listData)
  }

  const addRule = () => {
    if (currentRule.field && currentRule.operator && currentRule.value !== undefined) {
      setRules([...rules, { ...currentRule }])
      setCurrentRule({
        field: 'dueDate',
        operator: '<=',
        value: 'endOfWeek'
      })
      setShowRuleBuilder(false)
    }
  }

  const removeRule = (index) => {
    setRules(rules.filter((_, i) => i !== index))
  }

  const applyTemplate = (templateKey) => {
    const template = ruleTemplates[templateKey]
    if (template) {
      setTitle(template.name)
      setRules(template.rules)
      setListType('AUTO')
    }
  }

  const getRuleDescription = (rule) => {
    const field = fieldOptions.find(f => f.value === rule.field)?.label
    const operator = operatorOptions[rule.field]?.find(o => o.value === rule.operator)?.label
    let value = rule.value
    
    if (rule.field === 'dueDate') {
      value = valueOptions.dueDate.find(v => v.value === rule.value)?.label || rule.value
    } else if (rule.field === 'completed') {
      value = rule.value ? '已完成' : '未完成'
    } else if (rule.field === 'priority') {
      value = valueOptions.priority.find(v => v.value === rule.value)?.label || rule.value
    }
    
    return `${field} ${operator} ${value}`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">创建新列表</h2>
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* List Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                列表名称
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="输入列表名称"
                required
              />
            </div>

            {/* List Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                列表类型
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setListType('MANUAL')}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    listType === 'MANUAL'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">手动列表</div>
                  <div className="text-sm text-gray-600 mt-1">
                    手动添加和管理任务项目
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setListType('AUTO')}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    listType === 'AUTO'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <Zap className="w-4 h-4 text-yellow-500 mr-2" />
                    <span className="font-medium text-gray-900">智能列表</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    基于规则自动筛选任务
                  </div>
                </button>
              </div>
            </div>

            {/* Auto List Templates */}
            {listType === 'AUTO' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  快速模板
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(ruleTemplates).map(([key, template]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => applyTemplate(key)}
                      className="p-3 text-left border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900 text-sm">
                        {template.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Auto List Rules */}
            {listType === 'AUTO' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    自动化规则
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowRuleBuilder(true)}
                    className="flex items-center px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    添加规则
                  </button>
                </div>

                {/* Existing Rules */}
                <div className="space-y-2 mb-4">
                  {rules.map((rule, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">
                        {getRuleDescription(rule)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeRule(index)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Rule Builder */}
                {showRuleBuilder && (
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          字段
                        </label>
                        <select
                          value={currentRule.field}
                          onChange={(e) => setCurrentRule({ ...currentRule, field: e.target.value })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          {fieldOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          操作符
                        </label>
                        <select
                          value={currentRule.operator}
                          onChange={(e) => setCurrentRule({ ...currentRule, operator: e.target.value })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          {operatorOptions[currentRule.field]?.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          值
                        </label>
                        {valueOptions[currentRule.field] ? (
                          <select
                            value={currentRule.value}
                            onChange={(e) => {
                              let value = e.target.value
                              if (currentRule.field === 'completed') {
                                value = value === 'true'
                              }
                              setCurrentRule({ ...currentRule, value })
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            {valueOptions[currentRule.field].map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={currentRule.value}
                            onChange={(e) => setCurrentRule({ ...currentRule, value: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="输入值"
                          />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowRuleBuilder(false)}
                        className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-200 rounded transition-colors"
                      >
                        取消
                      </button>
                      <button
                        type="button"
                        onClick={addRule}
                        className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                      >
                        添加
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                创建列表
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}