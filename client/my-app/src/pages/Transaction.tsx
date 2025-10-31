import React, { useState, useEffect } from 'react';
import { ArrowRight, LogOut, User, DollarSign, Send } from 'lucide-react';


type User = {
  id: number;
  username: string;
  password: string;
  name: string;
  balance: number;
};

// Dữ liệu giả người dùng
const MOCK_USERS = [
  { id: 1, username: 'nguyenquoctri', password: '123456', name: 'Nguyễn Quốc Trí', balance: 5000000 },
  { id: 2, username: 'nguyenhuungochoang', password: '123456', name: 'Nguyễn Hữu Ngọc Hoàng', balance: 3000000 },
  { id: 3, username: 'tranvantrong', password: '123456', name: 'Trần Văn Trọng', balance: 10000000 },
  { id: 4, username: 'phamtiendat', password: '123456', name: 'Phạm Tiến Đạt', balance: 7500000 },
  { id: 5, username: 'nguyenthanhphong', password: '123456', name: 'Nguyễn Thanh Phong', balance: 17500000 },
];

const formatCurrency = (amount: number | bigint) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

export default function Transaction() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Form chuyển tiền
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [transferError, setTransferError] = useState('');
  const [transferSuccess, setTransferSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Load dữ liệu từ memory khi component mount
  useEffect(() => {
    const savedUsers = MOCK_USERS;
    setUsers(savedUsers);
  }, []);

  const handleLogin = () => {
    setError('');
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      setCurrentUser(user);
      setUsername('');
      setPassword('');
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không đúng');
    }
  };

const handleLogout = () => {
setCurrentUser(null);
setRecipient('');
setAmount('');
setNote('');
setTransferError('');
setTransferSuccess('');
};

    const handleTransfer = async () => {
    setTransferError('');
    setTransferSuccess('');
    setLoading(true);

    // Kiểm tra người dùng đã đăng nhập chưa
    if (!currentUser) {
        setTransferError('Bạn chưa đăng nhập');
        setLoading(false);
        return;
    }

    // Validate dữ liệu đầu vào
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

    if (transferAmount > currentUser.balance) {
        setTransferError('Số dư không đủ để thực hiện giao dịch');
        setLoading(false);
        return;
    }

    const recipientUser = users.find(u => u.username === recipient);

    if (!recipientUser) {
        setTransferError('Không tìm thấy người nhận');
        setLoading(false);
        return;
    }

    if (recipientUser.id === currentUser.id) {
        setTransferError('Không thể chuyển tiền cho chính mình');
        setLoading(false);
        return;
    }

    // Giả lập gọi API
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const updatedUsers = users.map(user => {
        if (user.id === currentUser.id) {
            return { ...user, balance: user.balance - transferAmount };
        }
        if (user.id === recipientUser.id) {
            return { ...user, balance: user.balance + transferAmount };
        }
        return user;
        });

        setUsers(updatedUsers);

        const updatedCurrentUser = updatedUsers.find(u => u.id === currentUser.id) || null;
        setCurrentUser(updatedCurrentUser);

        setTransferSuccess(`Chuyển tiền thành công ${formatCurrency(transferAmount)} đến ${recipientUser.name}`);
        setRecipient('');
        setAmount('');
        setNote('');
    } catch (err) {
        setTransferError('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
        setLoading(false);
    }
    };


  // Màn hình đăng nhập
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Chuyển tiền</h1>
            <p className="text-gray-600 mt-2">Đăng nhập để tiếp tục</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên đăng nhập
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập tên đăng nhập"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập mật khẩu"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Đăng nhập
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2 font-medium">Tài khoản demo:</p>
            <div className="space-y-1 text-xs text-gray-500">
              {users.map((user) =>(
                <p key={user.id}>
                    {user.username} - {user.password} - ({user.balance.toLocaleString('vi-VN')}đ)
                </p>
              ) )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Màn hình chuyển tiền
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">{currentUser.name}</h2>
              <p className="text-sm text-gray-500">@{currentUser.username}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Đăng xuất</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Số dư */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white mb-8 shadow-lg">
          <p className="text-blue-100 text-sm mb-2">Số dư khả dụng</p>
          <p className="text-4xl font-bold">{formatCurrency(currentUser.balance)}</p>
        </div>

        {/* Form chuyển tiền */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Send className="w-5 h-5" />
            Chuyển tiền
          </h3>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Người nhận
              </label>
              <select
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Chọn người nhận</option>
                {users
                  .filter(u => u.id !== currentUser.id)
                  .map(u => (
                    <option key={u.id} value={u.username}>
                      {u.name} (@{u.username})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số tiền
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập số tiền"
                min="0"
                step="1000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung chuyển tiền
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập nội dung (không bắt buộc)"
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
              disabled={loading}
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
        <div className="mt-8 bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Danh sách người dùng
          </h3>
          <div className="space-y-3">
            {users.map(user => (
              <div
                key={user.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  user.id === currentUser.id
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {user.name}
                      {user.id === currentUser.id && (
                        <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">
                          Bạn
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">
                    {formatCurrency(user.balance)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}