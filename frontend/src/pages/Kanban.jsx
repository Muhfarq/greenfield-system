import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Kanban.css';

const priorityClassMap = {
  low: 'kanban-priority-low',
  medium: 'kanban-priority-medium',
  high: 'kanban-priority-high',
};

const dotClassMap = {
  todo: 'kanban-col-dot-todo',
  in_progress: 'kanban-col-dot-inprogress',
  done: 'kanban-col-dot-done',
};

const columns = [
  { id: 'todo', label: 'TO DO', dotClass: dotClassMap.todo },
  { id: 'in_progress', label: 'IN PROGRESS', dotClass: dotClassMap.in_progress },
  { id: 'done', label: 'DONE', dotClass: dotClassMap.done },
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
    <div className="kanban-page">
      <Sidebar />
      <div className="kanban-loading">Loading...</div>
    </div>
  );

  return (
    <div className="kanban-page">
      <Sidebar />
      <div className="kanban-inner">
        <div className="kanban-header">
          <div>
            <h1 className="kanban-title">Kanban Board</h1>
            <p className="kanban-subtitle">Manajemen task visual berbasis kolom</p>
          </div>
          {user?.role === 'admin' && (
            <button onClick={() => setShowForm(true)} className="kanban-btn-add">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Buat Task
            </button>
          )}
        </div>

        <div className="kanban-board">
          {columns.map((col) => {
            const colTasks = getTasksByStatus(col.id);
            return (
              <div key={col.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(col.id)}
                className="kanban-column"
              >
                <div className="kanban-col-header">
                  <div className="kanban-col-header-left">
                    <div className={`kanban-col-dot ${col.dotClass}`}></div>
                    <h2 className="kanban-col-label">{col.label}</h2>
                  </div>
                  <span className="kanban-col-count">{colTasks.length}</span>
                </div>

                <div className="kanban-cards">
                  {colTasks.map((task) => (
                    <div key={task.id}
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

                      <div className="kanban-card-meta">
                        <span className={`kanban-priority ${priorityClassMap[task.priority] || priorityClassMap.medium}`}>
                          {task.priority}
                        </span>

                        {task.assigned_to_name && (
                          <span className="kanban-assignee">
                            {task.assigned_to_name}
                          </span>
                        )}

                        {task.due_date && (
                          <div className="kanban-due-date">
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {task.due_date.substring(0, 10)}
                          </div>
                        )}
                      </div>

                      <div className="kanban-card-actions">
                        <div>
                          {col.id !== 'todo' && (user?.role === 'admin' || task.assigned_to === user?.id) && (
                            <button onClick={() => handleStatusChange(task.id, columns[columns.findIndex(c => c.id === col.id) - 1].id)} className="kanban-btn-back">
                              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                              </svg>
                              Back
                            </button>
                          )}
                        </div>
                        <div>
                          {col.id !== 'done' && (user?.role === 'admin' || task.assigned_to === user?.id) && (
                            <button onClick={() => handleStatusChange(task.id, columns[columns.findIndex(c => c.id === col.id) + 1].id)} className="kanban-btn-next">
                              Next
                              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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

        {showForm && (
          <div className="kanban-modal-overlay">
            <div className="kanban-modal-card">
              <div className="kanban-modal-header">
                <h2 className="kanban-modal-title">Buat Task Baru</h2>
                <button onClick={() => { setShowForm(false); setForm(emptyForm); }} className="kanban-modal-close">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="kanban-modal-body">
                <div>
                  <label className="kanban-form-label">Judul Task</label>
                  <input placeholder="Deskripsi singkat task" value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })} className="kanban-form-input" />
                </div>
                <div>
                  <label className="kanban-form-label">Deskripsi</label>
                  <textarea placeholder="Detail task..." value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })} className="kanban-form-textarea" />
                </div>
                <div className="kanban-form-grid">
                  <div>
                    <label className="kanban-form-label">Assign ke Operator</label>
                    <select value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} className="kanban-form-select">
                      <option value="">Belum di-assign</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="kanban-form-label">Priority</label>
                    <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="kanban-form-select">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="kanban-form-label">Due Date (Opsional)</label>
                  <input type="datetime-local" value={form.due_date}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="kanban-form-input" />
                </div>
              </div>

              <div className="kanban-modal-footer">
                <button onClick={() => { setShowForm(false); setForm(emptyForm); }} className="kanban-btn-cancel">Batal</button>
                <button onClick={handleAddTask} className="kanban-btn-submit">Buat Task</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
