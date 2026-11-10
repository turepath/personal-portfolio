# WebRTC连接时序问题分析与修复

## 🚨 **原始问题**

### 问题描述
在视频通话流程中，User2 接受通话后会调用两次 `ensurePeer()`：

1. **第一次调用**：`CallContext.acceptCall()` → `startPeerCall()` → `useWebRTC.startCall()` → `ensurePeer()`
2. **第二次调用**：收到 User1 的 offer 信令时，事件处理函数中再次调用 `ensurePeer()`

### 原始代码问题
```typescript
// 原始 ensurePeer 函数的问题
const ensurePeer = () => {
  // 如果连接已存在且状态不是new，先清理旧连接
  if (peerRef.current && peerRef.current.connectionState !== 'new') {
    peerRef.current.close(); // ❌ 这里会关闭正在建立的连接！
    peerRef.current = null;
  }
  
  if (peerRef.current) return peerRef.current;
  // 创建新连接...
};
```

**问题分析：**
- 当 User2 接受通话时，`startCall()` 创建连接A，状态变为 `'connecting'`
- 收到 offer 时，`ensurePeer()` 检测到连接状态不是 `'new'`，就关闭了连接A
- 然后创建新连接B，导致连接A丢失，WebRTC握手失败

## ✅ **修复方案**

### 1. 优化 ensurePeer 函数
```typescript
const ensurePeer = () => {
  // 如果连接已存在，直接返回（不管什么状态）
  if (peerRef.current) {
    console.log(`[useWebRTC] Using existing connection with state: ${peerRef.current.connectionState}`);
    return peerRef.current;
  }
  
  // 只有在没有连接时才创建新连接
  // ... 创建新连接的逻辑
};
```

### 2. 添加 forceNewPeer 函数
```typescript
// 强制创建新连接的函数（用于需要重新建立连接的场景）
const forceNewPeer = () => {
  console.log(`[useWebRTC] Force creating new connection`);
  if (peerRef.current) {
    try {
      peerRef.current.close();
    } catch {}
    peerRef.current = null;
    // 清理相关状态
    tracksAddedRef.current.clear();
    iceCandidateQueueRef.current = [];
    setRemoteStream(null);
  }
  return ensurePeer();
};
```

### 3. 修改 startCall 函数
```typescript
const startCall = async (toUserId: string) => {
  // 强制创建新连接（因为这是主动发起通话）
  const pc = forceNewPeer();
  // ... 其余逻辑
};
```

## 🔄 **修复后的时序流程**

### User1 发起通话
```
User1.startCall() 
  → forceNewPeer() 
  → 创建连接A 
  → 发送 offer 
  → 等待 answer
```

### User2 接受通话
```
User2.acceptCall() 
  → startPeerCall() 
  → useWebRTC.startCall() 
  → forceNewPeer() 
  → 创建连接B 
  → 发送 accept 信令
```

### User2 收到 offer
```
User2 收到 offer 信令
  → 事件处理函数
  → ensurePeer() 
  → 返回现有连接B ✅
  → 处理 offer
  → 发送 answer
```

### User1 收到 answer
```
User1 收到 answer 信令
  → 事件处理函数
  → ensurePeer() 
  → 返回现有连接A ✅
  → 处理 answer
  → 连接建立成功
```

## 🎯 **关键改进**

### 1. **连接复用**
- `ensurePeer()` 现在会复用现有连接，不会意外关闭正在建立的连接
- 只有在真正需要时才创建新连接

### 2. **明确的责任分离**
- `ensurePeer()`：获取或创建连接（优先复用）
- `forceNewPeer()`：强制创建新连接（用于主动发起通话）

### 3. **时序保护**
- 避免了在连接建立过程中意外关闭连接
- 确保每个用户只有一个活跃的 WebRTC 连接

## 📊 **修复前后对比**

| 场景 | 修复前 | 修复后 |
|------|--------|--------|
| User2 接受通话 | 创建连接A | 创建连接A |
| User2 收到 offer | 关闭连接A，创建连接B ❌ | 复用连接A ✅ |
| 连接状态 | 连接A丢失，握手失败 | 连接A继续，握手成功 |
| 结果 | 视频通话失败 | 视频通话成功 |

## 🔍 **调试建议**

### 关键日志
```typescript
console.log(`[useWebRTC] Using existing connection with state: ${pc.connectionState}`);
console.log(`[useWebRTC] Force creating new connection`);
```

### 连接状态监控
- 监控 `connectionState` 变化
- 检查是否出现意外的连接关闭
- 验证 ICE 候选交换是否正常

## 🚀 **测试验证**

### 测试步骤
1. User1 发起通话给 User2
2. User2 接受通话
3. 检查控制台日志，确认：
   - User2 只创建一次连接
   - 收到 offer 时复用现有连接
   - 连接状态正常变化
   - 视频通话成功建立

### 预期结果
- 每个用户只有一个 WebRTC 连接
- 连接建立过程稳定
- 视频通话正常工作
- 无重复连接创建
