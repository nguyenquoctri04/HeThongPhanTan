import React, { useEffect, useState } from 'react';
import { User as UserIcon, DollarSign, TrendingUp, ArrowDownRight, Calendar, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getTransactions } from '../services/api';
import type { Transaction } from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';
import { useUI } from '../context/UIContext';

export default function Profile() {
  const { user } = useAuth();
  const { showBalance, toggleShowBalance } = useUI();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSent: 0,
    totalReceived: 0,
    transactionCount: 0,
    firstTransactionDate: null as string | null,
  });

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await getTransactions(user?.id);
      if (response.success && response.data) {
        setTransactions(response.data);
        
        // Calculate stats
        const sent = response.data
          .filter(t => t.fromUserId === user?.id)
          .reduce((sum, t) => sum + t.amount, 0);
        const received = response.data
          .filter(t => t.toUserId === user?.id)
          .reduce((sum, t) => sum + t.amount, 0);
        
        const sortedTransactions = [...response.data].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        
        setStats({
          totalSent: sent,
          totalReceived: received,
          transactionCount: response.data.length,
          firstTransactionDate: sortedTransactions.length > 0 ? sortedTransactions[0].timestamp : null,
        });
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
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <UserIcon className="w-6 h-6 text-blue-600" />
            Hồ sơ cá nhân
          </h1>
          <button
            onClick={toggleShowBalance}
            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
          >
            {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showBalance ? 'Ẩn' : 'Hiện'}</span>
          </button>
        </div>
        <p className="text-gray-600">Thông tin tài khoản và thống kê giao dịch</p>
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-3xl">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
            <p className="text-blue-100">@{user.username}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-white/20">
          <div>
            <p className="text-blue-100 text-sm mb-1">Số dư khả dụng</p>
            <p className="text-3xl font-bold">{showBalance ? formatCurrency(user.balance) : '•••••••'}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm mb-1">ID người dùng</p>
            <p className="text-xl font-semibold">#{user.id}</p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-500 text-sm">Đã gửi</p>
            <TrendingUp className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">{showBalance ? formatCurrency(stats.totalSent) : '••••'}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-500 text-sm">Đã nhận</p>
            <ArrowDownRight className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{showBalance ? formatCurrency(stats.totalReceived) : '••••'}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-500 text-sm">Số giao dịch</p>
            <DollarSign className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.transactionCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-500 text-sm">Thành viên từ</p>
            <Calendar className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-lg font-semibold text-gray-800">
            {stats.firstTransactionDate
              ? formatDate(stats.firstTransactionDate).split(' ')[0]
              : 'Mới'}
          </p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">5 giao dịch gần nhất</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-500">Đang tải...</p>
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.slice(0, 5).map((transaction) => {
              const isSent = transaction.fromUserId === user.id;
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isSent ? 'bg-red-100' : 'bg-green-100'
                      }`}
                    >
                      {isSent ? (
                        <TrendingUp className="w-5 h-5 text-red-600" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {isSent ? transaction.toName : transaction.fromName}
                      </p>
                      <p className="text-sm text-gray-500">{formatDate(transaction.timestamp)}</p>
                    </div>
                  </div>
                  <p
                    className={`font-semibold ${
                      isSent ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {isSent ? '-' : '+'}
                    {showBalance ? formatCurrency(transaction.amount) : '•••'}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Chưa có giao dịch nào</p>
        )}
      </div>
    </div>
  );
}
