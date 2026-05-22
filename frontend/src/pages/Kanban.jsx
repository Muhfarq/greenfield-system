// src/pages/Kanban.jsx
import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Kanban.css';

const columns = [
  { id: 'todo', label: 'TO DO' },
  { id: 'in_progress', label: 'IN PROGRESS' },
  { id: 'done', label: 'DONE' },
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
      // 1. Semua user (Admin & Operator) berhak mengambil data tasks
      const tasksResponse = await api.get('/tasks');
      setTasks(tasksResponse.data);

      // 2. Hanya ambil data users jika role-nya adalah admin
      if (user?.role === 'admin') {
        const usersResponse = await api.get('/auth/users');
        setUsers(usersResponse.data);
      }
    } catch (err) {
      console.error('Gagal mengambil data Kanban:', err);
    } finally {
      setLoading(false);
    }
  };

  // Jalankan fetchData hanya saat data user dari AuthContext sudah tersedia
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

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
    try {
      await api.delete(`/tasks/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragStart = (id) => setDragId(id);

  const handleDrop = (status) => {
    if (!dragId) return;
    handleStatusChange(dragId, status);
    setDragId(null);
  };

  const getTasksByStatus = (status) => {
    // Log dibersihkan agar tidak mengotori console Anda saat render ulang
    return tasks.filter(t => {
      const matchStatus = t.status === status;
      const matchOwner = user?.role === 'admin' || t.assigned_to === user?.id || t.created_by === user?.id;
      return matchStatus && matchOwner;
    });
  };

  if (loading) return (
    <div className="kanban-loading">
      <Sidebar />
      <div className="kanban-loading-inner">Loading...</div>
    </div>
  );

  return (
    <div className="kanban-page">
      <Sidebar />
      
      <div className="kanban-content">
        
        {/* Header */}
        <div className="kanban-header">
          <div>
            <h1 className="text-[24px] font-bold text-[#032b1d] mb-1">Kanban Board</h1>
            <p className="text-[#6b7280] text-[14px]">Manajemen task visual berbasis kolom</p>
          </div>
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowForm(true)}
              className="kanban-add-btn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Buat Task
            </button>
          )}
        </div>

        {/* Board */}
        <div className="kanban-board">
          {columns.map((col) => {
            const colTasks = getTasksByStatus(col.id);
            return (
              <div
                key={col.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(col.id)}
                className="kanban-column"
              >
                {/* Column Header */}
                <div className="kanban-column-header">
                  <div className="kanban-column-title">
                    <div className={`kanban-column-dot ${col.id}`}></div>
                    <h2 className="kanban-column-label">{col.label}</h2>
                  </div>
                  <span className="kanban-column-count">
                    {colTasks.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="kanban-cards">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                      className="kanban-card"
                    >
                      <h3 className="kanban-card-title">{task.title}</h3>
                      
                      {task.description && (
                        <p className="kanban-card-desc">
                          {task.description.slice(0, 80)}{task.description.length > 80 ? '...' : ''}
                        </p>
                      )}
                      
                      <div className="kanban-card-tags">
                        <span className={`kanban-priority-badge ${task.priority}`}>
                          {task.priority}
                        </span>
                        
                        {task.assigned_to_name && (
                          <span className="kanban-assignee-badge">
                            {task.assigned_to_name.split(' ')[0]}
                          </span>
                        )}

                        {task.due_date && (
                          <div className="kanban-due-date">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {task.due_date.substring(0, 10)}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons (Next / Back) */}
                      <div className="kanban-card-actions">
                        <div>
                          {col.id !== 'todo' && (user?.role === 'admin' || task.assigned_to === user?.id) && (
                            <button
                              onClick={() => handleStatusChange(task.id, columns[columns.findIndex(c => c.id === col.id) - 1].id)}
                              className="kanban-back-btn"
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
                              className="kanban-next-btn"
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
          <div className="kanban-modal-overlay">
            <div className="kanban-modal">
              
              <div className="kanban-modal-header">
                <h2 className="text-[16px] font-bold text-[#032b1d]">Buat Task Baru</h2>
                <button 
                  onClick={() => { setShowForm(false); setForm(emptyForm); }}
                  className="kanban-modal-close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="kanban-modal-body">
                <div>
                  <label className="kanban-field-label">Judul Task</label>
                  <input
                    placeholder="Deskripsi singkat task"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="kanban-field-input"
                  />
                </div>
                
                <div>
                  <label className="kanban-field-label">Deskripsi</label>
                  <textarea
                    placeholder="Detail task..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="kanban-field-textarea"
                  />
                </div>

                <div className="kanban-modal-grid">
                  <div>
                    <label className="kanban-field-label">Assign ke Operator</label>
                    <select
                      value={form.assigned_to}
                      onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                      className="kanban-field-select"
                    >
                      <option value="">Belum di-assign</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="kanban-field-label">Priority</label>
                    <select
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
                      className="kanban-field-select"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="kanban-field-label">Due Date (Opsional)</label>
                  <input
                    type="datetime-local"
                    value={form.due_date}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    className="kanban-field-input"
                  />
                </div>
              </div>

              <div className="kanban-modal-footer">
                <button 
                  onClick={() => { setShowForm(false); setForm(emptyForm); }} 
                  className="kanban-btn-batal"
                >
                  Batal
                </button>
                <button 
                  onClick={handleAddTask} 
                  className="kanban-btn-submit"
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