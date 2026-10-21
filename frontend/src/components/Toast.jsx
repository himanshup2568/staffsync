import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ToastContainer = () => {
  const { toasts, removeToast } = useAuth();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => {
        let Icon = Info;
        let toastClass = '';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          toastClass = 'toast-success';
        } else if (toast.type === 'error') {
          Icon = AlertTriangle;
          toastClass = 'toast-error';
        }

        return (
          <div key={toast.id} className={`toast ${toastClass}`}>
            <Icon 
              size={18} 
              color={toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#f43f5e' : '#38bdf8'} 
            />
            <span style={{ fontSize: '0.85rem', flex: 1, fontWeight: 500 }}>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
