import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, RefreshCw, Home, X } from 'lucide-react';
import { Button } from './Button';

interface ErrorModalProps {
  isOpen: boolean;
  onRetry: () => void;
  onUseDefault: () => void;
  onGoHome: () => void;
  retryCount?: number;
  maxRetries?: number;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onRetry,
  onUseDefault,
  onGoHome,
  retryCount = 0,
  maxRetries = 3
}) => {
  if (!isOpen) return null;

  const canRetry = retryCount < maxRetries;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            // 点击背景不关闭，必须选择操作
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-full">
                <AlertCircle className="text-amber-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-800">⚠️ 连接超时</h3>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-gray-600">
              无法连接到AI服务，请检查网络后重试
            </p>
            {canRetry && (
              <p className="text-sm text-gray-500">
                已重试 {retryCount}/{maxRetries} 次
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {canRetry ? (
              <Button
                variant="primary"
                onClick={onRetry}
                className="w-full"
                isLoading={false}
              >
                <RefreshCw size={18} />
                重新生成
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={onUseDefault}
                className="w-full"
              >
                使用默认解读
              </Button>
            )}

            {canRetry && (
              <Button
                variant="ghost"
                onClick={onUseDefault}
                className="w-full"
              >
                使用默认解读
              </Button>
            )}

            <button
              onClick={onGoHome}
              className="text-sm text-gray-500 hover:text-gray-700 text-center py-2 transition-colors"
            >
              返回首页
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};



