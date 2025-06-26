import { useState, useEffect } from 'react'
import { Plus, Edit3, Trash2, Calendar, Flag, CheckCircle, Circle, MoreVertical, Zap } from 'lucide-react'
import { format, isAfter, isBefore } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export default function ListView({ list, onUpdate, onDelete }) {
  const [items, setItems] = useState(list?.items || [])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium'
  })

  useEffect(() => {
    setItems(list?.items || [])
  }, [list])

  const handleAddItem = async (e) => {
    e.preventDefault()
    if (!newItem.title.trim()) return

    try {
      const response = await fetch(`/api/lists/${list.id}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newItem,
          dueDate: newItem.dueDate || null
        })
      })

      if (response.ok) {
        const item = await response.json()
        setItems([item, ...items])
        setNewItem({ title: '', description: '', dueDate: '', priority: 'medium' })
        setShowAddForm(false)
        onUpdate()
      }
    } catch (error) {
      console.error('Failed to add item:', error)
    }
  }

  const handleUpdateItem = async (itemId, updates) => {
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        const updatedItem = await response.json()
        setItems(items.map(item => 
          item.id === itemId ? updatedItem : item
        ))
        onUpdate()
      }
    } catch (error) {
      console.error('Failed to update item:', error)
    }
  }

  const handleDeleteItem = async (itemId) => {
    if (!confirm('确定要删除这个任务吗？')) return

    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setItems(items.filter(item => item.id !== itemId))
        onUpdate()
      }
    } catch (error) {
      console.error('Failed to delete item:', error)
    }
  }

  const toggleComplete = (item) => {
    handleUpdateItem(item.id, { completed: !item.completed })
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return '高'
      case 'medium': return '中'
      case 'low': return '低'
      default: return '中'
    }
  }

  const isOverdue = (dueDate) => {
    if (!dueDate) return false
    return isBefore(new Date(dueDate), new Date()) && !items.find(item => item.dueDate === dueDate)?.completed
  }

  const formatDueDate = (dueDate) => {
    if (!dueDate) return null
    return format(new Date(dueDate), 'MM月dd日', { locale: zhCN })
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-900">{list.title}</h2>
            {list.type === 'AUTO' && (
              <div className="flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                <Zap className="w-3 h-3 mr-1" />
                智能列表
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {list.type === 'MANUAL' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                添加任务
              </button>
            )}
            
            <div className="relative">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        {list.type === 'AUTO' && (
          <p className="text-sm text-gray-600 mt-2">
            此列表根据设定规则自动显示符合条件的任务
          </p>
        )}
      </div>

      {/* Add Item Form */}
      {showAddForm && list.type === 'MANUAL' && (
        <div className="p-6 border-b bg-gray-50">
          <form onSubmit={handleAddItem} className="space-y-4">
            <div>
              <input
                type="text"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="任务标题"
                required
              />
            </div>
            
            <div>
              <textarea
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="任务描述（可选）"
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  截止日期
                </label>
                <input
                  type="date"
                  value={newItem.dueDate}
                  onChange={(e) => setNewItem({ ...newItem, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  优先级
                </label>
                <select
                  value={newItem.priority}
                  onChange={(e) => setNewItem({ ...newItem, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setNewItem({ title: '', description: '', dueDate: '', priority: 'medium' })
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                添加任务
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Items List */}
      <div className="divide-y divide-gray-200">
        {items.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {list.type === 'AUTO' ? '暂无符合条件的任务' : '暂无任务'}
            </h3>
            <p className="text-gray-600">
              {list.type === 'AUTO' 
                ? '当有任务符合此列表的自动化规则时，它们会自动显示在这里'
                : '点击上方按钮添加您的第一个任务'
              }
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-3">
                {/* Checkbox */}
                <button
                  onClick={() => toggleComplete(item)}
                  className="mt-1 flex-shrink-0"
                >
                  {item.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`text-sm font-medium ${
                        item.completed 
                          ? 'text-gray-500 line-through' 
                          : 'text-gray-900'
                      }`}>
                        {item.title}
                      </h4>
                      
                      {item.description && (
                        <p className={`text-sm mt-1 ${
                          item.completed 
                            ? 'text-gray-400 line-through' 
                            : 'text-gray-600'
                        }`}>
                          {item.description}
                        </p>
                      )}
                      
                      {/* Meta Info */}
                      <div className="flex items-center space-x-4 mt-2">
                        {item.dueDate && (
                          <div className={`flex items-center text-xs ${
                            isOverdue(item.dueDate) && !item.completed
                              ? 'text-red-600'
                              : item.completed
                              ? 'text-gray-400'
                              : 'text-gray-600'
                          }`}>
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDueDate(item.dueDate)}
                          </div>
                        )}
                        
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          item.completed 
                            ? 'text-gray-400 bg-gray-100'
                            : getPriorityColor(item.priority)
                        }`}>
                          <Flag className="w-3 h-3 mr-1" />
                          {getPriorityLabel(item.priority)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    {list.type === 'MANUAL' && (
                      <div className="flex items-center space-x-1 ml-4">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">编辑任务</h3>
              
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.target)
                  const updates = {
                    title: formData.get('title'),
                    description: formData.get('description'),
                    dueDate: formData.get('dueDate') || null,
                    priority: formData.get('priority')
                  }
                  handleUpdateItem(editingItem.id, updates)
                  setEditingItem(null)
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    任务标题
                  </label>
                  <input
                    name="title"
                    type="text"
                    defaultValue={editingItem.title}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    任务描述
                  </label>
                  <textarea
                    name="description"
                    defaultValue={editingItem.description || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      截止日期
                    </label>
                    <input
                      name="dueDate"
                      type="date"
                      defaultValue={editingItem.dueDate ? editingItem.dueDate.split('T')[0] : ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      优先级
                    </label>
                    <select
                      name="priority"
                      defaultValue={editingItem.priority}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="low">低</option>
                      <option value="medium">中</option>
                      <option value="high">高</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    保存
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}