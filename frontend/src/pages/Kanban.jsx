// src/pages/Kanban.jsx
import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const priorityStyles = {
  low: 'bg-[#e0e7ff] text-[#4338ca]', // Blue
  medium: 'bg-[#fef3c7] text-[#d97706]', // Amber/Yellow
  high: 'bg-[#fee2e2] text-[#dc2626]', // Red
};

const columns = [
  { id: 'todo', label: 'TO DO', dotColor: 'bg-gray-400' },
  { id: 'in_progress', label: 'IN PROGRESS', dotColor: 'bg-[#087448]' },
  { id: 'done', label: 'DONE', dotColor: 'bg-[#10b981]' },
];

const emptyForm = {
  title: '', description: '', assigned_to: '',
  priority: 'medium', due_date: ''
};

export default function Kanban() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [dragId, setDragId] = useState(null);

  const fetchData = async () => {
    try {
      const [t, u] = await Promise.all([
        api.get('/tasks'),
        api.get('/auth/users'),
      ]);
      setTasks(t.data);
      setUsers(u.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddTask = async () => {
    try {
      await api.post('/tasks', {
        ...form,
        assigned_to: form.assigned_to || null,
        due_date: form.due_date || null,
      });
      setShowForm(false);
      setForm(emptyForm);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus task ini?')) return;
    await api.delete(`/tasks/${id}`);
    fetchData();
  };

  const handleDragStart = (id) => setDragId(id);

  const handleDrop = (status) => {
    if (!dragId) return;
    handleStatusChange(dragId, status);
    setDragId(null);
  };

  const getTasksByStatus = (status) =>
    tasks.filter(t => {
      const matchStatus = t.status === status;
      const matchOwner = user?.role === 'admin' || t.assigned_to === user?.id || t.created_by === user?.id;
      return matchStatus && matchOwner;
    });

  if (loading) return (
    <div className="flex min-h-screen bg-[#f4f7f6]">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center text-gray-500">Loading...</div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f4f7f6]">
      <Sidebar />
      
      <div className="ml-[220px] flex-1 p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[24px] font-bold text-[#032b1d] mb-1">Kanban Board</h1>
            <p className="text-[#6b7280] text-[14px]">Manajemen task visual berbasis kolom</p>
          </div>
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#087448] hover:bg-[#065f3a] text-white px-5 py-2.5 rounded-xl text-[14px] font-bold flex items-center gap-2 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Buat Task
            </button>
          )}
        </div>

        {/* Board */}
        <div className="grid grid-cols-3 gap-6 items-start">
          {columns.map((col) => {
            const colTasks = getTasksByStatus(col.id);
            return (
              <div
                key={col.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(col.id)}
                className="flex flex-col gap-4 min-h-[400px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${col.dotColor}`}></div>
                    <h2 className="text-[13px] font-bold text-[#032b1d] tracking-wider">{col.label}</h2>
                  </div>
                  <span className="text-[12px] font-bold bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full shadow-sm">
                    {colTasks.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex flex-col gap-4">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                      className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition"
                    >
                      <h3 className="text-[14px] font-bold text-[#032b1d] mb-1.5">{task.title}</h3>
                      
                      {task.description && (
                        <p className="text-[13px] text-[#6b7280] mb-4 leading-relaxed">
                          {task.description.slice(0, 80)}{task.description.length > 80 ? '...' : ''}
                        </p>
                      )}
                      
                      <div className="flex items-center flex-wrap gap-2 mb-4">
                        <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wide ${priorityStyles[task.priority] || priorityStyles.medium}`}>
                          {task.priority}
                        </span>
                        
                        {task.assigned_to_name && (
                          <span className="text-[11px] bg-[#d1fae5] text-[#065f46] px-2 py-1 rounded-md font-bold">
                            {task.assigned_to_name.split(' ')[0]}
                          </span>
                        )}

                        {task.due_date && (
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium ml-auto">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {task.due_date.substring(0, 10)}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons (Next / Back) */}
                      <div className="flex items-center justify-between mt-4">
                        <div>
                          {col.id !== 'todo' && (user?.role === 'admin' || task.assigned_to === user?.id) && (
                            <button
                              onClick={() => handleStatusChange(task.id, columns[columns.findIndex(c => c.id === col.id) - 1].id)}
                              className="text-[13px] font-bold text-gray-400 hover:text-[#087448] transition flex items-center gap-1"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                              </svg>
                              Back
                            </button>
                          )}
                        </div>
                        
                        <div>
                          {col.id !== 'done' && (user?.role === 'admin' || task.assigned_to === user?.id) && (
                            <button
                              onClick={() => handleStatusChange(task.id, columns[columns.findIndex(c => c.id === col.id) + 1].id)}
                              className="text-[13px] font-bold text-[#087448] hover:text-[#065f3a] transition flex items-center gap-1"
                            >
                              Next
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Form Tambah Task */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-[640px] shadow-2xl flex flex-col overflow-hidden">
              
              <div className="px-6 py-5 flex justify-between items-center border-b border-gray-100">
                <h2 className="text-[16px] font-bold text-[#032b1d]">Buat Task Baru</h2>
                <button 
                  onClick={() => { setShowForm(false); setForm(emptyForm); }}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-2">Judul Task</label>
                  <input
                    placeholder="Deskripsi singkat task"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] text-[#032b1d] focus:outline-none focus:border-[#087448] focus:ring-1 focus:ring-[#087448] transition"
                  />
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-2">Deskripsi</label>
                  <textarea
                    placeholder="Detail task..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] text-[#032b1d] focus:outline-none focus:border-[#087448] focus:ring-1 focus:ring-[#087448] h-24 resize-none transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-2">Assign ke Operator</label>
                    <select
                      value={form.assigned_to}
                      onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] text-[#032b1d] focus:outline-none focus:border-[#087448] focus:ring-1 focus:ring-[#087448] transition appearance-none bg-white"
                    >
                      <option value="">Belum di-assign</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-2">Priority</label>
                    <select
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] text-[#032b1d] focus:outline-none focus:border-[#087448] focus:ring-1 focus:ring-[#087448] transition appearance-none bg-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-2">Due Date (Opsional)</label>
                  <input
                    type="datetime-local"
                    value={form.due_date}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] text-[#032b1d] focus:outline-none focus:border-[#087448] focus:ring-1 focus:ring-[#087448] transition"
                  />
                </div>
              </div>

              <div className="px-6 py-5 flex justify-end gap-3">
                <button 
                  onClick={() => { setShowForm(false); setForm(emptyForm); }} 
                  className="px-6 py-2.5 text-[14px] font-bold text-[#032b1d] hover:bg-gray-100 rounded-lg transition"
                >
                  Batal
                </button>
                <button 
                  onClick={handleAddTask} 
                  className="px-6 py-2.5 bg-[#087448] hover:bg-[#065f3a] text-white text-[14px] font-bold rounded-lg transition"
                >
                  Buat Task
                </button>
              </div>
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
}