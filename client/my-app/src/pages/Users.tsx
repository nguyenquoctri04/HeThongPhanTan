import { useEffect, useState } from 'react';
import { Search, User as UserIcon, TrendingUp, DollarSign, Eye, EyeOff } from 'lucide-react';
import { getUsers } from '../services/api';
import type { User } from '../services/api';
import { formatCurrency } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

export default function Users() {
  const { user: currentUser } = useAuth();
  const { showBalance, toggleShowBalance } = useUI();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'balance'>('name');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    let filtered = [...users];
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        u =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name, 'vi');
      } else {
        return b.balance - a.balance;
      }
    });
    
    setFilteredUsers(filtered);
  }, [searchQuery, users, sortBy]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      if (response.success && response.data) {
        setUsers(response.data);
        setFilteredUsers(response.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Statistics
  const totalUsers = users.length;
  const totalBalance = users.reduce((sum, u) => sum + u.balance, 0);
  const avgBalance = totalUsers > 0 ? totalBalance / totalUsers : 0;
  const topBalance = users.length > 0 ? Math.max(...users.map(u => u.balance)) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <UserIcon className="w-6 h-6 text-blue-600" />
            Danh sách người dùng
          </h1>
          <button
            onClick={toggleShowBalance}
            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
          >
            {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showBalance ? 'Ẩn' : 'Hiện'}</span>
          </button>
        </div>
        <p className="text-gray-600">Tìm kiếm và xem thông tin người dùng trong hệ thống</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-500 text-sm">Tổng người dùng</p>
            <UserIcon className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{totalUsers}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-500 text-sm">Tổng số dư</p>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{showBalance ? formatCurrency(totalBalance) : '•••'}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-500 text-sm">Số dư trung bình</p>
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{showBalance ? formatCurrency(avgBalance) : '•••'}</p>
        </div>
      </div>

      {/* Search and Sort */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tìm kiếm theo tên hoặc username..."
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'balance')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name">Sắp xếp theo tên</option>
            <option value="balance">Sắp xếp theo số dư</option>
          </select>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-md p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-500">Đang tải danh sách...</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-600">
                Tìm thấy <span className="font-semibold">{filteredUsers.length}</span> người dùng
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((userItem) => (
                <div
                  key={userItem.id}
                  className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                    currentUser?.id === userItem.id
                      ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                      : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                      {userItem.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate text-sm">
                        {userItem.name}
                        {currentUser?.id === userItem.id && (
                          <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                            Bạn
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 truncate">@{userItem.username}</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Số dư</p>
                    <p className="font-bold text-gray-800 text-lg">
                      {showBalance ? formatCurrency(userItem.balance) : '•••'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
