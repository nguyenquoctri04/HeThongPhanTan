import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Send, Search, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { getUsers, transferMoney, type User } from '../services/api';
import { formatCurrency } from '../utils/format';

export default function Transaction() {
  const { user, refreshUser } = useAuth();
  const { showBalance, toggleShowBalance } = useUI();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [transferError, setTransferError] = useState('');
  const [transferSuccess, setTransferSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(
        u => 
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await getUsers();
      if (response.success && response.data) {
        setUsers(response.data);
        setFilteredUsers(response.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleTransfer = async () => {
    setTransferError('');
    setTransferSuccess('');
    setLoading(true);

    if (!user) {
      setTransferError('Bạn chưa đăng nhập');
      setLoading(false);
      navigate('/login');
      return;
    }

    if (!recipient || !amount) {
      setTransferError('Vui lòng nhập đầy đủ thông tin');
      setLoading(false);
      return;
    }

    const transferAmount = parseFloat(amount);

    if (transferAmount <= 0) {
      setTransferError('Số tiền phải lớn hơn 0');
      setLoading(false);
      return;
    }

    if (transferAmount > user.balance) {
      setTransferError('Số dư không đủ để thực hiện giao dịch');
      setLoading(false);
      return;
    }

    try {
      const response = await transferMoney({
        fromUserId: user.id,
        toUsername: recipient,
        amount: transferAmount,
        note: note || 'Chuyển tiền'
      });

      if (response.success && response.data) {
        // Cập nhật user trong context (sẽ được reload từ server)
        const recipientUser = users.find(u => u.username === recipient);
        setTransferSuccess(`Chuyển tiền thành công ${formatCurrency(transferAmount)} đến ${recipientUser?.name || recipient}`);
        setRecipient('');
        setAmount('');
        setNote('');
        
        // Reload users và user data
        setTimeout(async () => {
          loadUsers();
          // Refresh user data from context
          await refreshUser();
        }, 1500);
      } else {
        setTransferError(response.message || 'Có lỗi xảy ra, vui lòng thử lại');
      }
    } catch (err: any) {
      setTransferError(err.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Send className="w-6 h-6 text-blue-600" />
            Chuyển tiền
          </h1>
          <button
            onClick={toggleShowBalance}
            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
          >
            {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showBalance ? 'Ẩn' : 'Hiện'}</span>
          </button>
        </div>
        <p className="text-gray-600">Chuyển tiền đến người dùng khác trong hệ thống</p>
      </div>

      {/* Form chuyển tiền */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Thông tin chuyển tiền</h3>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm người nhận
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tìm kiếm theo tên hoặc username..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn người nhận
            </label>
            <select
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loadingUsers}
            >
              <option value="">Chọn người nhận</option>
              {filteredUsers
                .filter(u => u.id !== user.id)
                .map(u => (
                  <option key={u.id} value={u.username}>
                    {u.name} (@{u.username}) - {showBalance ? formatCurrency(u.balance) : '•••'}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số tiền (VNĐ)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập số tiền"
              min="1000"
              step="1000"
            />
            {amount && (
              <p className="mt-2 text-sm text-gray-600">
                {showBalance ? formatCurrency(parseFloat(amount) || 0) : '•••'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung chuyển tiền (không bắt buộc)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Nhập nội dung chuyển tiền..."
              rows={3}
            />
          </div>

          {transferError && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm flex items-start gap-2">
              <span>⚠️</span>
              <span>{transferError}</span>
            </div>
          )}

          {transferSuccess && (
            <div className="bg-green-50 text-green-600 p-4 rounded-lg text-sm flex items-start gap-2">
              <span>✓</span>
              <span>{transferSuccess}</span>
            </div>
          )}

          <button
            onClick={handleTransfer}
            disabled={loading || !recipient || !amount}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                Chuyển tiền
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Danh sách người dùng */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            Danh sách người dùng ({filteredUsers.length})
          </h3>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Xóa tìm kiếm
            </button>
          )}
        </div>
        {loadingUsers ? (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-500">Đang tải danh sách...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map(userItem => (
              <div
                key={userItem.id}
                className={`p-4 rounded-lg border transition-all ${
                  userItem.id === user.id
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-linear-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {userItem.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {userItem.name}
                      {userItem.id === user.id && (
                        <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                          Bạn
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500 truncate">@{userItem.username}</p>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Số dư</p>
                  <p className="font-semibold text-gray-800">{showBalance ? formatCurrency(userItem.balance) : '•••'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}