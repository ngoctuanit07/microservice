import { http } from './http';

export async function getBoards() {
  const res = await http.get('/task/boards');
  return res.data;
}

export async function createTask(boardId: number, title: string, description?: string) {
  const res = await http.post(`/task/boards/${boardId}/tasks`, { title, description });
  return res.data;
}

export async function moveTask(id: number, boardId: number, status: string) {
  const res = await http.put(`/task/tasks/${id}/move`, { boardId, status });
  return res.data;
}
