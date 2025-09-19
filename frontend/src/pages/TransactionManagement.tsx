import React, { useEffect, useState } from 'react';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '../api/transactionApi';

type Transaction = {
  id: number;
  name: string;
  type: string;
  amount: number;
  date: string;
};

const typeOptions = [
  { value: 'INCOME', label: 'Thu' },
  { value: 'EXPENSE', label: 'Chi' },
];

export default function TransactionManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [form, setForm] = useState<{ name: string; type: string; amount: string; date: string }>({ name: '', type: 'INCOME', amount: '', date: '' });
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => { fetchData(); }, []);
  async function fetchData() {
    const res = await getTransactions();
    setTransactions(res.data || []);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name || !form.type || !form.amount || !form.date) return;
    if (editId) {
      await updateTransaction(editId, { ...form, amount: Number(form.amount) });
    } else {
      await createTransaction({ ...form, amount: Number(form.amount) });
    }
    setForm({ name: '', type: 'INCOME', amount: '', date: '' });
    setEditId(null);
    fetchData();
  }

  function handleEdit(tx: Transaction) {
    setEditId(tx.id);
    setForm({ name: tx.name, type: tx.type, amount: tx.amount.toString(), date: tx.date.slice(0, 10) });
  }

  async function handleDelete(id: number) {
    if (window.confirm('Xóa khoản này?')) {
      await deleteTransaction(id);
      fetchData();
    }
  }

  return (
    <div className="container py-4">
      <h2>Quản lý Thu Chi</h2>
      <form className="row g-2 mb-4" onSubmit={handleSubmit}>
        <div className="col-md-3">
          <input className="form-control" placeholder="Tên khoản" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="col-md-2">
          <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
            {typeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div className="col-md-2">
          <input type="number" className="form-control" placeholder="Số tiền" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
        </div>
        <div className="col-md-3">
          <input type="date" className="form-control" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        </div>
        <div className="col-md-2">
          <button className="btn btn-primary w-100" type="submit">{editId ? 'Cập nhật' : 'Thêm mới'}</button>
        </div>
      </form>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Tên khoản</th>
            <th>Loại</th>
            <th>Số tiền</th>
            <th>Ngày</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx => (
            <tr key={tx.id}>
              <td>{tx.name}</td>
              <td>{tx.type === 'INCOME' ? 'Thu' : 'Chi'}</td>
              <td>{tx.amount.toLocaleString()}</td>
              <td>{tx.date.slice(0, 10)}</td>
              <td>
                <button className="btn btn-sm btn-warning mx-1" onClick={() => handleEdit(tx)}>Sửa</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(tx.id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
