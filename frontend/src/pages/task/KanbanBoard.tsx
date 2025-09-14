import React, { useEffect, useState } from 'react';
import { Card, Button, Modal, Form } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { getBoards, createTask, moveTask } from '../../api/taskApi';
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
  const [newTask, setNewTask] = useState<{ title: string; description: string; boardId: number | null }>({ title: '', description: '', boardId: null });
  const [newBoardName, setNewBoardName] = useState('');

  const handleCreateBoard = async () => {
    if (newBoardName.trim()) {
      await http.post('/api/task/boards', { name: newBoardName });
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
    await moveTask(taskId, boardId, 'todo'); // status can be improved
    fetchBoards();
  };

  const handleCreateTask = async () => {
    if (newTask.boardId !== null) {
      await createTask(newTask.boardId, newTask.title, newTask.description);
      setShowModal(false);
      setNewTask({ title: '', description: '', boardId: null });
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
          <Modal.Title>Tạo Board mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Tên Board</Form.Label>
              <Form.Control value={newBoardName} onChange={e => setNewBoardName(e.target.value)} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBoardModal(false)}>
            Đóng
          </Button>
          <Button variant="primary" onClick={handleCreateBoard}>
            Tạo
          </Button>
        </Modal.Footer>
      </Modal>
      <DragDropContext onDragEnd={handleDragEnd}>
        {boards.map((board: Board) => (
          <div className="col" key={board.id}>
            <h5>{board.name}</h5>
            <Droppable droppableId={String(board.id)}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {board.tasks.map((task: Task, idx: number) => (
                    <Draggable key={task.id} draggableId={String(task.id)} index={idx}>
                      {(provided) => (
                        <Card className="mb-2" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                          <Card.Body>
                            <Card.Title>{task.title}</Card.Title>
                            <Card.Text>{task.description}</Card.Text>
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
      </DragDropContext>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Tạo Task mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Tiêu đề</Form.Label>
              <Form.Control value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Mô tả</Form.Label>
              <Form.Control value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Board</Form.Label>
              <Form.Control as="select" value={newTask.boardId ?? ''} onChange={e => setNewTask({ ...newTask, boardId: e.target.value ? Number(e.target.value) : null })}>
                <option value="">Chọn board</option>
                {boards.map((board: Board) => (
                  <option key={board.id} value={board.id}>{board.name}</option>
                ))}
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Đóng
          </Button>
          <Button variant="primary" onClick={handleCreateTask}>
            Tạo
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
