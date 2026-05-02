"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const POLL_INTERVAL = 5000;

export default function Home() {
  const [email, setEmail] = useState("");
  const [userEmail, setUserEmail] = useState(null);

  // Tab: 'tasks' | 'board'
  const [activeTab, setActiveTab] = useState("tasks");

  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [title, setTitle] = useState("");
  const [assignTo, setAssignTo] = useState("");
  const [addingTask, setAddingTask] = useState(false);
  const [expandedTask, setExpandedTask] = useState(null);
  const [comments, setComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [postingComment, setPostingComment] = useState({});

  // Notice board state
  const [notices, setNotices] = useState([]);
  const [loadingNotices, setLoadingNotices] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  const [postingNotice, setPostingNotice] = useState(false);

  const pollRef = useRef(null);

  // ── Session ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("tc_user");
    if (saved) setUserEmail(saved);
  }, []);

  const handleSignIn = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    localStorage.setItem("tc_user", email.trim());
    setUserEmail(email.trim());
    setEmail("");
  };

  const handleSignOut = () => {
    localStorage.removeItem("tc_user");
    setUserEmail(null);
    setTasks([]);
    setNotices([]);
    clearInterval(pollRef.current);
  };

  // ── Tasks ──────────────────────────────────────────────────────────────────
  const fetchTasks = useCallback(async (spinner = false) => {
    if (spinner) setLoadingTasks(true);
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      if (data.tasks) setTasks(data.tasks);
    } catch (e) {
      console.error("fetch tasks error:", e);
    } finally {
      if (spinner) setLoadingTasks(false);
    }
  }, []);

  const fetchNotices = useCallback(async (spinner = false) => {
    if (spinner) setLoadingNotices(true);
    try {
      const res = await fetch("/api/notices");
      const data = await res.json();
      if (data.notices) setNotices(data.notices);
    } catch (e) {
      console.error("fetch notices error:", e);
    } finally {
      if (spinner) setLoadingNotices(false);
    }
  }, []);

  // Real-time polling for both
  useEffect(() => {
    if (!userEmail) return;
    fetchTasks(true);
    fetchNotices(true);
    pollRef.current = setInterval(() => {
      fetchTasks(false);
      fetchNotices(false);
    }, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [userEmail, fetchTasks, fetchNotices]);

  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setAddingTask(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          assignee: userEmail,
          assignedTo: assignTo.trim() || userEmail,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTitle("");
        setAssignTo("");
        fetchTasks(false);
      } else {
        alert("Failed to save task: " + (data.error || "Unknown error"));
      }
    } catch (e) {
      alert("Network error. Please try again.");
    } finally {
      setAddingTask(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
    try {
      await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      console.error("update status error:", e);
      fetchTasks(false);
    }
  };

  // ── Comments ───────────────────────────────────────────────────────────────
  const toggleComments = async (taskId) => {
    if (expandedTask === taskId) { setExpandedTask(null); return; }
    setExpandedTask(taskId);
    if (!comments[taskId]) await fetchComments(taskId);
  };

  const fetchComments = async (taskId) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`);
      const data = await res.json();
      if (data.comments) setComments((p) => ({ ...p, [taskId]: data.comments }));
    } catch (e) {
      console.error("fetch comments error:", e);
    }
  };

  const postComment = async (taskId) => {
    const text = (commentInputs[taskId] || "").trim();
    if (!text) return;
    setPostingComment((p) => ({ ...p, [taskId]: true }));
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, author: userEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setCommentInputs((p) => ({ ...p, [taskId]: "" }));
        await fetchComments(taskId);
      }
    } catch (e) {
      console.error("post comment error:", e);
    } finally {
      setPostingComment((p) => ({ ...p, [taskId]: false }));
    }
  };

  // ── Notices ────────────────────────────────────────────────────────────────
  const postNotice = async (e) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeMessage.trim()) return;
    setPostingNotice(true);
    try {
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: noticeTitle.trim(),
          message: noticeMessage.trim(),
          author: userEmail,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNoticeTitle("");
        setNoticeMessage("");
        fetchNotices(false);
      } else {
        alert("Failed to post notice: " + (data.error || "Unknown error"));
      }
    } catch (e) {
      alert("Network error. Please try again.");
    } finally {
      setPostingNotice(false);
    }
  };

  const statusColor = (s) =>
    s === "Active" ? "var(--warning)" : s === "Done" ? "var(--success)" : "var(--text-muted)";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <main className="container">
      {/* Header */}
      <div className="glass-panel">
        <div className="header-row">
          <div>
            <h1 className="logo">🤝 Team Collaborator</h1>
            <p className="tagline">Real-time team coordination</p>
          </div>
          {userEmail && (
            <div className="user-info">
              <span className="user-badge">{userEmail}</span>
              <button onClick={handleSignOut} className="btn-danger" id="sign-out-btn">Sign Out</button>
            </div>
          )}
        </div>
      </div>

      {/* Sign In */}
      {!userEmail ? (
        <div className="glass-panel auth-section">
          <div className="auth-icon">🤝</div>
          <h2>Join your team</h2>
          <p className="auth-sub">Enter your email to access shared tasks and the notice board</p>
          <form onSubmit={handleSignIn} className="auth-form">
            <input id="email-input" type="email" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
            <button type="submit" className="btn-primary" id="continue-btn">Join →</button>
          </form>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="tabs-bar">
            <button
              id="tab-tasks"
              className={`tab-btn ${activeTab === "tasks" ? "active" : ""}`}
              onClick={() => setActiveTab("tasks")}
            >
              📋 Tasks
            </button>
            <button
              id="tab-board"
              className={`tab-btn ${activeTab === "board" ? "active" : ""}`}
              onClick={() => setActiveTab("board")}
            >
              📌 Notice Board
            </button>
            <span className="live-badge">🟢 Live</span>
          </div>

          {/* ── TASKS TAB ── */}
          {activeTab === "tasks" && (
            <>
              <div className="glass-panel">
                <form onSubmit={addTask} className="add-task-form">
                  <input id="task-title-input" type="text" placeholder="Task title..."
                    value={title} onChange={(e) => setTitle(e.target.value)} required />
                  <input id="assign-to-input" type="email"
                    placeholder="Assign to (email, optional)"
                    value={assignTo} onChange={(e) => setAssignTo(e.target.value)} />
                  <button type="submit" className="btn-primary" id="add-task-btn" disabled={addingTask}>
                    {addingTask ? "…" : "+ Add"}
                  </button>
                </form>
              </div>

              <div className="glass-panel">
                <div className="section-header">
                  <h2 className="section-title">Team Tasks</h2>
                  <span className="task-count">{tasks.length} tasks</span>
                </div>

                {loadingTasks ? (
                  <div className="empty-state"><div className="spinner"></div><p>Loading...</p></div>
                ) : tasks.length === 0 ? (
                  <div className="empty-state"><p>🎉 No tasks yet. Add one above!</p></div>
                ) : (
                  <ul className="task-list" role="list">
                    {tasks.map((task) => (
                      <li key={task.id} className="task-item-wrapper">
                        <div className="task-item">
                          <div className="task-info">
                            <span className="task-name">{task.title}</span>
                            <span className="task-meta">
                              Created by <strong>{task.assignee}</strong>
                              {task.assignedTo && task.assignedTo !== task.assignee && (
                                <> &nbsp;→&nbsp; Assigned to <strong className="assigned-chip">{task.assignedTo}</strong></>
                              )}
                              &nbsp;·&nbsp;
                              <span style={{ color: statusColor(task.status), fontWeight: 600 }}>{task.status}</span>
                            </span>
                          </div>
                          <div className="task-actions">
                            <select id={`status-${task.id}`}
                              className={`status-select ${task.status}`}
                              value={task.status}
                              onChange={(e) => updateStatus(task.id, e.target.value)}
                              aria-label={`Status for ${task.title}`}>
                              <option value="Todo">Todo</option>
                              <option value="Active">Active</option>
                              <option value="Done">Done</option>
                            </select>
                            <button className="comment-toggle"
                              onClick={() => toggleComments(task.id)}
                              aria-expanded={expandedTask === task.id}
                              id={`comments-btn-${task.id}`}>
                              💬 {expandedTask === task.id ? "Hide" : "Comments"}
                            </button>
                          </div>
                        </div>

                        {expandedTask === task.id && (
                          <div className="comment-panel" role="region" aria-label="Comments">
                            <div className="comment-list">
                              {(comments[task.id] || []).length === 0 ? (
                                <p className="no-comments">No comments yet. Be the first!</p>
                              ) : (
                                (comments[task.id] || []).map((c) => (
                                  <div key={c.id} className="comment-item">
                                    <span className="comment-author">{c.author}</span>
                                    <p className="comment-text">{c.text}</p>
                                    <span className="comment-time">{new Date(c.createdAt).toLocaleString()}</span>
                                  </div>
                                ))
                              )}
                            </div>
                            <div className="comment-form">
                              <input id={`comment-input-${task.id}`} type="text"
                                placeholder="Add a comment..."
                                value={commentInputs[task.id] || ""}
                                onChange={(e) => setCommentInputs((p) => ({ ...p, [task.id]: e.target.value }))}
                                onKeyDown={(e) => { if (e.key === "Enter") postComment(task.id); }} />
                              <button className="btn-primary btn-sm"
                                onClick={() => postComment(task.id)}
                                disabled={postingComment[task.id]}
                                id={`comment-submit-${task.id}`}>
                                {postingComment[task.id] ? "…" : "Send"}
                              </button>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}

          {/* ── NOTICE BOARD TAB ── */}
          {activeTab === "board" && (
            <>
              <div className="glass-panel">
                <h2 className="section-title" style={{ marginBottom: "16px" }}>📌 Post a Notice</h2>
                <form onSubmit={postNotice} className="notice-form">
                  <input id="notice-title-input" type="text" placeholder="Notice title..."
                    value={noticeTitle} onChange={(e) => setNoticeTitle(e.target.value)} required />
                  <textarea id="notice-message-input" placeholder="Write your announcement..."
                    value={noticeMessage} onChange={(e) => setNoticeMessage(e.target.value)} required rows={3} />
                  <button type="submit" className="btn-primary" id="post-notice-btn" disabled={postingNotice}>
                    {postingNotice ? "Posting…" : "📢 Publish to Board"}
                  </button>
                </form>
              </div>

              <div className="glass-panel">
                <div className="section-header">
                  <h2 className="section-title">All Announcements</h2>
                  <span className="task-count">{notices.length} posts</span>
                </div>

                {loadingNotices ? (
                  <div className="empty-state"><div className="spinner"></div><p>Loading...</p></div>
                ) : notices.length === 0 ? (
                  <div className="empty-state"><p>📭 No notices yet. Publish one above!</p></div>
                ) : (
                  <div className="notice-list">
                    {notices.map((n) => (
                      <div key={n.id} className="notice-card">
                        <div className="notice-header">
                          <span className="notice-title">{n.title}</span>
                          <span className="notice-author">{n.author}</span>
                        </div>
                        <p className="notice-message">{n.message}</p>
                        <span className="notice-time">{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </main>
  );
}
