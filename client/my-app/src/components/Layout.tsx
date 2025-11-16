import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Home, Send, History, Users, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { formatCurrency } from '../utils/format';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { showBalance } = useUI();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Trang chủ' },
    { path: '/transfer', icon: Send, label: 'Chuyển tiền' },
    { path: '/transactions', icon: History, label: 'Lịch sử' },
    { path: '/users', icon: Users, label: 'Người dùng' },
    { path: '/profile', icon: UserIcon, label: 'Hồ sơ' },
  ];

  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 w-20 md:w-64 h-screen bg-white border-r shadow-sm z-40 flex flex-col justify-between">
        <div className="px-2 pt-4 md:px-3 md:pt-4">
          <div className="flex items-center gap-3 md:gap-4 px-1 md:px-2 mb-6 justify-center md:justify-start">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="hidden md:block">
              <h3 className="font-semibold text-gray-800">{user.name}</h3>
              <p className="text-xs text-gray-500">@{user.username}</p>
            </div>
          </div>

          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 md:gap-4 px-3 py-3 rounded-md mx-2 transition-colors hover:bg-gray-50 ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                      : 'text-gray-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden md:inline text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="px-3 pb-6">
          <div className="hidden md:block mb-4 px-2">
            <p className="text-xs text-gray-500">Số dư</p>
            <p className={`font-bold ${showBalance ? 'text-green-600' : 'text-gray-400'}`}>
              {showBalance ? formatCurrency(user.balance) : '••••••••'}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline text-sm font-medium">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Content area */}
      <div className="ml-20 md:ml-64">
        <header className="bg-white border-b shadow-sm sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <h1 className="text-lg font-semibold text-gray-800">Ngân hàng số</h1>
                <div className="hidden sm:block text-sm text-gray-500">Chào mừng bạn</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-md">
                  <div className="text-xs text-gray-500">Số dư</div>
                  <div className="font-medium text-gray-800">
                    {showBalance ? formatCurrency(user.balance) : '•••••••'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
};
