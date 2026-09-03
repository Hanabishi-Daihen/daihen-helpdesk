import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, X, Lock } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  showToast,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'control') {
      onLoginSuccess();
      setPassword('');
      onClose();
      showToast('เข้าสู่ระบบผู้ดูแล (Admin) สำเร็จ');
    } else {
      setShake(true);
      showToast('รหัสผ่านไม่ถูกต้อง (รหัสเริ่มต้น: control)', 'error');
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#181715]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className={`bg-[#faf9f5] border border-[#e6dfd8] rounded-3xl w-full max-w-sm p-6 shadow-2xl fade-scale-in relative ${
          shake ? 'shake-anim' : ''
        }`}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-xl text-[#8e8b82] hover:text-[#141413] hover:bg-[#efe9de] transition-colors"
        >
          <X size={16} />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#cc785c]/15 text-[#cc785c] flex items-center justify-center mx-auto mb-3">
            <ShieldCheck size={24} />
          </div>
          <h3 className="font-serif-claude text-xl font-bold text-[#141413]">
            ยืนยันตัวตนผู้ดูแลระบบ
          </h3>
          <p className="text-xs text-[#6c6a64] mt-1">
            กรุณากรอกรหัสผ่านเพื่อเข้าสู่โหมด Admin (รหัสผ่านเริ่มต้น: <span className="font-mono-code font-semibold text-[#cc785c]">control</span>)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-3 text-[#8e8b82]" />
            <input
              autoFocus
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="รหัสผ่าน Admin"
              className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-[#e6dfd8] bg-[#f5f0e8] focus:bg-white focus:border-[#cc785c] outline-none text-[#141413] transition-colors"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-[#8e8b82] hover:text-[#141413]"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-[#efe9de] hover:bg-[#e6dfd8] text-[#3d3d3a] text-xs font-semibold transition-all md3-state-layer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-[#cc785c] hover:bg-[#b8674d] text-white text-xs font-bold shadow-xs transition-all md3-state-layer"
            >
              เข้าสู่ระบบ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
