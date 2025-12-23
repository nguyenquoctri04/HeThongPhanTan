import { useEffect, useState } from 'react';
import { History, ArrowUpRight, ArrowDownRight, Filter, Calendar } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import { getTransactions } from '../services/api';
import type { Transaction } from '../services/api';
import { formatCurrency, formatDate, formatRelativeTime } from '../utils/format';

export default function TransactionHistory() {
  const { user } = useAuth();
  const { showBalance } = useUI();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user, filter]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await getTransactions(user?.id);
      if (response.success && response.data) {
        let filtered = response.data;

        if (filter === 'sent') {
          filtered = response.data.filter(t => t.fromUserId === user?.id);
        } else if (filter === 'received') {
          filtered = response.data.filter(t => t.toUserId === user?.id);
        }

        setTransactions(filtered);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <History className="w-6 h-6 text-blue-600" />
          Lịch sử giao dịch
        </h1>
        <p className="text-gray-600">Xem tất cả các giao dịch của bạn</p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <Filter className="w-5 h-5 text-gray-500" />
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilter('sent')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'sent'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Đã gửi
          </button>
          <button
            onClick={() => setFilter('received')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'received'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Đã nhận
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-md p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-500">Đang tải giao dịch...</p>
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((transaction) => {
              const isSent = transaction.fromUserId === user.id;
              return (
                <div
                  key={transaction.id}
                  className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isSent ? 'bg-red-100' : 'bg-green-100'
                          }`}
                      >
                        {isSent ? (
                          <ArrowUpRight className="w-6 h-6 text-red-600" />
                        ) : (
                          <ArrowDownRight className="w-6 h-6 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 mb-1">
                          {isSent ? (
                            <>
                              Gửi đến <span className="text-gray-600">{transaction.toName}</span>
                            </>
                          ) : (
                            <>
                              Nhận từ <span className="text-gray-600">{transaction.fromName}</span>
                            </>
                          )}
                        </p>
                        {transaction.note && (
                          <p className="text-sm text-gray-600 mb-1 truncate">
                            {transaction.note}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{formatRelativeTime(transaction.timestamp)}</span>
                          <span>•</span>
                          <span>{formatDate(transaction.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p
                        className={`text-xl font-bold ${isSent ? 'text-red-600' : 'text-green-600'
                          }`}
                      >
                        {isSent ? '-' : '+'}
                        {showBalance ? formatCurrency(transaction.amount) : '•••'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {transaction.status === 'completed' ? 'Hoàn thành' : transaction.status}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">Chưa có giao dịch nào</p>
            <p className="text-gray-400 text-sm">
              {filter === 'all'
                ? 'Bạn chưa có giao dịch nào trong hệ thống'
                : filter === 'sent'
                  ? 'Bạn chưa gửi tiền cho ai'
                  : 'Bạn chưa nhận tiền từ ai'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
