import re

def contains_chinese(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            has_chinese = False
            # 逐行读取文件内容，并检查每一行是否包含中文字符
            for line_number, line in enumerate(file, start=1):
                # 使用正则表达式检查是否包含中文字符
                if re.search(r'[\u4e00-\u9fff]', line):
                    has_chinese = True
                    print(f"第 {line_number} 行包含中文字符: {line.strip()}")
            if not has_chinese:
                print("文件中不包含中文字符。")
    except FileNotFoundError:
        print(f"文件未找到: {file_path}")
    except Exception as e:
        print(f"读取文件时发生错误: {e}")

# 替换为你的文件路径
file_path = "/Users/qianjianghao/Desktop/6991/ass2/rsheet/src/lib.rs"
contains_chinese(file_path)

import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';

function Register({ onRegister, isAuthenticated }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (email && name && password) {
      onRegister();
    } else {
      setError('Please fill in all required text');
    }
  };

  return (
    <div>
      <h2>Register</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        /><br/>
        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br/>
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br/>
        <input
          type="password"
          placeholder="confirmed password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        /><br/>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;