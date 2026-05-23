import { useStore } from '../../store/useStore';

const Topbar = () => {
  const { user } = useStore();

  return (
    <div className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-64 px-6 flex items-center justify-between z-10">
      <h2 className="text-xl font-semibold text-gray-800">Admin Dashboard</h2>
      
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-800">{user?.name}</p>
          <p className="text-xs text-gray-500">{user?.role}</p>
        </div>
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
