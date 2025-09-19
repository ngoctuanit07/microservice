import React, { useEffect, useState } from 'react';
import { Card, Button, Modal, Form } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { getBoards, createTask, moveTask } from '../../api/taskApi';
// ...existing code...
import { http } from '../../api/http';

type Task = {
  id: number;
  title: string;
  description?: string;
  status: string;
};

type Board = {
  id: number;
  name: string;
  tasks: Task[];
};

export default function KanbanBoard() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [newTask, setNewTask] = useState<{ title: string; description: string; boardId: number | null; status?: string }>({ title: '', description: '', boardId: null, status: 'todo' });
  const [newBoardName, setNewBoardName] = useState('');
  const [editBoardId, setEditBoardId] = useState<number | null>(null);
  const [editBoardName, setEditBoardName] = useState('');
  const [editTaskId, setEditTaskId] = useState<number | null>(null);
  const [editTask, setEditTask] = useState<{ title: string; description: string; boardId: number | null; status?: string }>({ title: '', description: '', boardId: null, status: 'todo' });
  const handleEditBoard = (board: Board) => {
    setEditBoardId(board.id);
    setEditBoardName(board.name);
    setShowBoardModal(true);
  };

  const handleUpdateBoard = async () => {
    if (editBoardId && editBoardName.trim()) {
      await http.put(`/api/task/boards/${editBoardId}`, { name: editBoardName });
      setShowBoardModal(false);
      setEditBoardId(null);
      setEditBoardName('');
      fetchBoards();
    }
  };

  const handleDeleteBoard = async (boardId: number) => {
    if (window.confirm('Bạn có chắc muốn xóa board này?')) {
      await http.delete(`/api/task/boards/${boardId}`);
      fetchBoards();
    }
  };

  const handleEditTask = (task: Task) => {
  setEditTaskId(task.id);
  setEditTask({ title: task.title, description: task.description || '', boardId: null, status: task.status });
    setShowModal(true);
  };

  const handleUpdateTask = async () => {
    if (editTaskId && editTask.title.trim()) {
      await http.put(`/api/task/tasks/${editTaskId}`, { title: editTask.title, description: editTask.description, status: editTask.status });
      setShowModal(false);
      setEditTaskId(null);
      setEditTask({ title: '', description: '', boardId: null, status: 'todo' });
      fetchBoards();
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm('Bạn có chắc muốn xóa task này?')) {
      await http.delete(`/api/task/tasks/${taskId}`);
      fetchBoards();
    }
  };

  const handleCreateBoard = async () => {
    if (newBoardName.trim()) {
  await http.post('/task/boards', { name: newBoardName });
      setShowBoardModal(false);
      setNewBoardName('');
      fetchBoards();
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    const data = await getBoards();
    setBoards(Array.isArray(data) ? data : []);
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    const taskId = parseInt(draggableId);
    const boardId = parseInt(destination.droppableId);
    // Determine new status based on board name
    let newStatus = 'todo';
    const destBoard = boards.find(b => b.id === boardId);
    if (destBoard) {
      const name = destBoard.name.toLowerCase();
      if (name.includes('progress') || name.includes('doing') || name.includes('inprogress')) newStatus = 'inprogress';
      else if (name.includes('done') || name.includes('completed') || name.includes('finish')) newStatus = 'done';
      else if (name.includes('todo') || name.includes('backlog')) newStatus = 'todo';
    }
    await moveTask(taskId, boardId, newStatus);
    // Optionally show a toast or alert for status change
    // window.alert(`Task status updated to ${newStatus}`);
    fetchBoards();
  };

  const handleCreateTask = async () => {
    if (newTask.boardId !== null) {
      const created = await createTask(newTask.boardId, newTask.title, newTask.description);
      // Nếu status khác 'todo', cập nhật lại status cho task vừa tạo
      if (newTask.status && newTask.status !== 'todo' && created?.id) {
        await http.put(`/api/task/tasks/${created.id}`, { status: newTask.status });
      }
      setShowModal(false);
      setNewTask({ title: '', description: '', boardId: null, status: 'todo' });
      fetchBoards();
    }
  };

  return (
    <div className="row">
      <div className="mb-3 d-flex gap-2">
        <Button onClick={() => setShowModal(true)}>
          Tạo Task mới
        </Button>
        <Button variant="secondary" onClick={() => setShowBoardModal(true)}>
          Tạo Board mới
        </Button>
      </div>
      <Modal show={showBoardModal} onHide={() => setShowBoardModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editBoardId ? 'Cập nhật Board' : 'Tạo Board mới'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Tên Board</Form.Label>
              <Form.Control value={editBoardId ? editBoardName : newBoardName} onChange={e => editBoardId ? setEditBoardName(e.target.value) : setNewBoardName(e.target.value)} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowBoardModal(false); setEditBoardId(null); setEditBoardName(''); }}>
            Đóng
          </Button>
          {editBoardId ? (
            <Button variant="primary" onClick={handleUpdateBoard}>
              Cập nhật
            </Button>
          ) : (
            <Button variant="primary" onClick={handleCreateBoard}>
              Tạo
            </Button>
          )}
        </Modal.Footer>
      </Modal>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="d-flex flex-wrap gap-4">
          {boards.map((board: Board) => (
            <div className="kanban-board card shadow-sm border-primary" style={{ minWidth: 320, maxWidth: 350 }} key={board.id}>
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <span className="fw-bold">{board.name}</span>
                <span className="badge bg-info">{board.tasks.length} Task</span>
                <div className="d-flex gap-2">
                  <Button size="sm" variant="light" onClick={() => handleEditBoard(board)} title="Sửa board"><i className="bi bi-pencil"></i></Button>
                  <Button size="sm" variant="danger" onClick={() => handleDeleteBoard(board.id)} title="Xóa board"><i className="bi bi-trash"></i></Button>
                </div>
              </div>
              <Droppable droppableId={String(board.id)}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="card-body p-2" style={{ minHeight: 120 }}>
                    {board.tasks.length === 0 && (
                      <div className="text-muted text-center py-3">Chưa có task nào</div>
                    )}
                    {board.tasks.map((task: Task, idx: number) => (
                        <Draggable key={task.id} draggableId={String(task.id)} index={idx}>
                          {(provided) => (
                            <Card className="mb-2 border-0 shadow-sm" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                              <Card.Body>
                                <div className="d-flex justify-content-between align-items-center">
                                  <div className="d-flex align-items-center gap-2">
                                    <Card.Title className="mb-0">{task.title}</Card.Title>
                                    <Button size="sm" variant="primary" onClick={() => handleEditTask(task)} title="Chỉnh sửa task" aria-label="Edit task">
                                      <i className="bi bi-pencil"></i> Sửa
                                    </Button>
                                  </div>
                                  <span className="badge bg-secondary" title="Trạng thái sẽ tự động cập nhật khi kéo sang board khác">{task.status}</span>
                                  <Button size="sm" variant="danger" onClick={() => handleDeleteTask(task.id)} title="Xóa task"><i className="bi bi-trash"></i></Button>
                                </div>
                                {task.description && <Card.Text className="text-muted small">{task.description}</Card.Text>}
                              </Card.Body>
                            </Card>
                          )}
                        </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
      <Modal show={showModal} onHide={() => { setShowModal(false); setEditTaskId(null); setEditTask({ title: '', description: '', boardId: null }); }}>
        <Modal.Header closeButton>
          <Modal.Title>{editTaskId ? 'Cập nhật Task' : 'Tạo Task mới'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Tiêu đề</Form.Label>
              <Form.Control value={editTaskId ? editTask.title : newTask.title} onChange={e => editTaskId ? setEditTask({ ...editTask, title: e.target.value }) : setNewTask({ ...newTask, title: e.target.value })} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Mô tả</Form.Label>
              <Form.Control value={editTaskId ? editTask.description : newTask.description} onChange={e => editTaskId ? setEditTask({ ...editTask, description: e.target.value }) : setNewTask({ ...newTask, description: e.target.value })} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Trạng thái</Form.Label>
              <Form.Select value={editTaskId ? editTask.status : newTask.status ?? 'todo'} onChange={e => editTaskId ? setEditTask({ ...editTask, status: e.target.value }) : setNewTask({ ...newTask, status: e.target.value })}>
                <option value="todo">Todo</option>
                <option value="inprogress">In Progress</option>
                <option value="done">Done</option>
              </Form.Select>
            </Form.Group>
            {!editTaskId && (
              <Form.Group>
                <Form.Label>Board</Form.Label>
                <Form.Control as="select" value={newTask.boardId ?? ''} onChange={e => setNewTask({ ...newTask, boardId: e.target.value ? Number(e.target.value) : null })}>
                  <option value="">Chọn board</option>
                  {boards.map((board: Board) => (
                    <option key={board.id} value={board.id}>{board.name}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowModal(false); setEditTaskId(null); setEditTask({ title: '', description: '', boardId: null }); }}>
            Đóng
          </Button>
          {editTaskId ? (
            <Button variant="primary" onClick={handleUpdateTask}>
              Cập nhật
            </Button>
          ) : (
            <Button variant="primary" onClick={handleCreateTask}>
              Tạo
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}
