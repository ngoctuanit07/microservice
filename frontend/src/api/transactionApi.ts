import { http } from './http';

export async function getTransactions() {
  return http.get('/transaction');
}

export async function createTransaction(data: { name: string; type: string; amount: number; date: string }) {
  return http.post('/transaction', data);
}

export async function updateTransaction(id: number, data: { name?: string; type?: string; amount?: number; date?: string }) {
  return http.put(`/transaction/${id}`, data);
}

export async function deleteTransaction(id: number) {
  return http.delete(`/transaction/${id}`);
}
