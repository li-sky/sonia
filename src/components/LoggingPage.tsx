import React, { useEffect, useState } from 'react';

const LoggingPage = () => {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // 获取缓存日志
    window.electron.fetchPythonLog().then((cachedLogs: string[]) => {
      setLogs(cachedLogs);
    });
    // 订阅后续日志
    window.electron.onPythonLog((log: string) => {
      setLogs((prev) => [...prev, log]);
      // 滚动到底部
      window.scrollTo(0, document.body.scrollHeight);
    });
  }, []);

  return (
    <div>
      <h2>Python Logging</h2>
      <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
        {logs}
      </pre>
    </div>
  );
};

export default LoggingPage;