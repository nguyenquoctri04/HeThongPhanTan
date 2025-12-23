import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, History, Users, ArrowUpRight, ArrowDownRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getTransactions } from '../services/api';
import type { Transaction } from '../services/api';
import { formatCurrency, formatRelativeTime } from '../utils/format';
import { useUI } from '../context/UIContext';

export default function Dashboard() {
  const { user } = useAuth();
  const { showBalance, toggleShowBalance } = useUI();
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({ totalSent: 0, totalReceived: 0 });

  useEffect(() => {
    if (user) {
      loadRecentTransactions();
    }
  }, [user]);

  const loadRecentTransactions = async () => {
    try {
      const response = await getTransactions(user?.id);
      if (response.success && response.data) {
        const transactions = response.data.slice(0, 5);
        setRecentTransactions(transactions);
        
        // Tính thống kê
        const sent = response.data
          .filter(t => t.fromUserId === user?.id)
          .reduce((sum, t) => sum + t.amount, 0);
        const received = response.data
          .filter(t => t.toUserId === user?.id)
          .reduce((sum, t) => sum + t.amount, 0);
        
        setStats({ totalSent: sent, totalReceived: received });
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 md:p-8 text-white shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Xin chào, {user.name}!</h1>
        <p className="text-blue-100 mb-4">Chào mừng bạn trở lại hệ thống</p>
        <div className="mt-4 flex items-center gap-4">
          <div>
            <p className="text-blue-100 text-sm mb-1">Số dư khả dụng</p>
            <p className="text-3xl md:text-4xl font-bold">{showBalance ? formatCurrency(user.balance) : '•••••••'}</p>
          </div>
          <button
            onClick={toggleShowBalance}
            className="ml-2 inline-flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm"
          >
            {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="text-sm">{showBalance ? 'Ẩn' : 'Hiện'}</span>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Link
          to="/transfer"
          className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow flex flex-col items-center justify-center gap-3 border-2 border-transparent hover:border-blue-500"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Send className="w-6 h-6 text-blue-600" />
          </div>
          <span className="font-medium text-gray-800 text-center">Chuyển tiền</span>
        </Link>

        <Link
          to="/transactions"
          className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow flex flex-col items-center justify-center gap-3 border-2 border-transparent hover:border-blue-500"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <History className="w-6 h-6 text-purple-600" />
          </div>
          <span className="font-medium text-gray-800 text-center">Lịch sử</span>
        </Link>

        <Link
          to="/users"
          className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow flex flex-col items-center justify-center gap-3 border-2 border-transparent hover:border-blue-500 md:col-span-1 col-span-2"
        >
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <span className="font-medium text-gray-800 text-center">Người dùng</span>
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-red-500" />
              Đã gửi
            </h3>
          </div>
          <p className="text-2xl font-bold text-red-600">{showBalance ? formatCurrency(stats.totalSent) : '••••'}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <ArrowDownRight className="w-5 h-5 text-green-500" />
              Đã nhận
            </h3>
          </div>
          <p className="text-2xl font-bold text-green-600">{showBalance ? formatCurrency(stats.totalReceived) : '••••'}</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Giao dịch gần đây</h3>
          <Link
            to="/transactions"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Xem tất cả
          </Link>
        </div>
        {recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => {
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
                        <ArrowUpRight className="w-5 h-5 text-red-600" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {isSent ? transaction.toName : transaction.fromName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatRelativeTime(transaction.timestamp)}
                      </p>
                    </div>
                  </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          isSent ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {isSent ? '-' : '+'}
                        {showBalance ? formatCurrency(transaction.amount) : '•••'}
                      </p>
                    </div>
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
