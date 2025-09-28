import { useState } from 'react'

interface FinancialData {
  chartData: Array<{
    month: string
    income: number
    expense: number
    profit: number
  }>
  totalIncome: number
  totalExpense: number
  netProfit: number
  monthlyAverage: number
}

interface FinancialChartProps {
  data: FinancialData
}

export default function FinancialChart({ data }: FinancialChartProps) {
  const [viewMode, setViewMode] = useState<'profit' | 'income' | 'expense'>('profit')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit'
    })
  }

  const getBarColor = (value: number, type: string) => {
    if (type === 'profit') {
      return value >= 0 ? '#28a745' : '#dc3545'
    }
    return type === 'income' ? '#17a2b8' : '#ffc107'
  }

  const maxValue = Math.max(
    ...data.chartData.map(d => Math.max(Math.abs(d.income), Math.abs(d.expense), Math.abs(d.profit)))
  )

  return (
    <div className="card">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">💰 Financial Overview</h5>
          <div className="btn-group btn-group-sm" role="group">
            <input
              type="radio"
              className="btn-check"
              id="profit-view"
              checked={viewMode === 'profit'}
              onChange={() => setViewMode('profit')}
            />
            <label className="btn btn-outline-primary" htmlFor="profit-view">
              Profit
            </label>
            
            <input
              type="radio"
              className="btn-check"
              id="income-view"
              checked={viewMode === 'income'}
              onChange={() => setViewMode('income')}
            />
            <label className="btn btn-outline-info" htmlFor="income-view">
              Income
            </label>
            
            <input
              type="radio"
              className="btn-check"
              id="expense-view"
              checked={viewMode === 'expense'}
              onChange={() => setViewMode('expense')}
            />
            <label className="btn btn-outline-warning" htmlFor="expense-view">
              Expense
            </label>
          </div>
        </div>
      </div>
      
      <div className="card-body">
        {/* Summary Cards */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="text-center">
              <h6 className="text-muted">Total Income</h6>
              <h5 className="text-info">{formatCurrency(data.totalIncome)}</h5>
            </div>
          </div>
          <div className="col-md-3">
            <div className="text-center">
              <h6 className="text-muted">Total Expense</h6>
              <h5 className="text-warning">{formatCurrency(data.totalExpense)}</h5>
            </div>
          </div>
          <div className="col-md-3">
            <div className="text-center">
              <h6 className="text-muted">Net Profit</h6>
              <h5 className={data.netProfit >= 0 ? 'text-success' : 'text-danger'}>
                {formatCurrency(data.netProfit)}
              </h5>
            </div>
          </div>
          <div className="col-md-3">
            <div className="text-center">
              <h6 className="text-muted">Monthly Avg</h6>
              <h5 className={data.monthlyAverage >= 0 ? 'text-success' : 'text-danger'}>
                {formatCurrency(data.monthlyAverage)}
              </h5>
            </div>
          </div>
        </div>

        {/* Simple Bar Chart */}
        <div className="chart-container" style={{ height: '300px' }}>
          {data.chartData.length === 0 ? (
            <div className="d-flex align-items-center justify-content-center h-100">
              <div className="text-center text-muted">
                <div className="fs-1">📊</div>
                <p>No financial data available</p>
              </div>
            </div>
          ) : (
            <div className="d-flex align-items-end h-100">
              {data.chartData.map((item, index) => {
                const value = item[viewMode]
                const height = Math.abs(value) / maxValue * 250
                const color = getBarColor(value, viewMode)
                
                return (
                  <div key={index} className="flex-grow-1 d-flex flex-column align-items-center mx-1">
                    <div
                      className="position-relative mb-2"
                      style={{
                        height: '250px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end'
                      }}
                    >
                      <div
                        className="rounded"
                        style={{
                          backgroundColor: color,
                          height: `${height}px`,
                          minHeight: '2px',
                          width: '100%',
                          opacity: 0.8
                        }}
                      >
                      </div>
                      <small
                        className="position-absolute text-dark fw-bold"
                        style={{
                          top: value >= 0 ? '-20px' : '100%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: '0.7rem'
                        }}
                      >
                        {formatCurrency(value).replace(/\$/, '')}
                      </small>
                    </div>
                    <small className="text-muted text-center">
                      {formatMonth(item.month)}
                    </small>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {data.chartData.length > 0 && (
          <div className="mt-3 text-center">
            <small className="text-muted">
              Financial data for the last {data.chartData.length} months
            </small>
          </div>
        )}
      </div>
    </div>
  )
}