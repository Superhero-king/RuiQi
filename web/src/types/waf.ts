// 攻击事件查询参数
export interface AttackEventQuery {
  clientIpAddress?: string;
  domain?: string;
  port?: number;
  startTime?: string;
  endTime?: string;
  page?: number;
  pageSize?: number;
}

// 攻击日志查询参数
export interface AttackLogQuery {
  ruleId?: number;
  clientIpAddress?: string;
  domain?: string;
  port?: number;
  startTime?: string;
  endTime?: string;
  page?: number;
  pageSize?: number;
}

// 攻击事件聚合结果
export interface AttackEventAggregateResult {
  clientIpAddress: string;     // 客户端IP地址
  count: number;               // 攻击次数
  domain: string;              // 域名
  durationInMinutes: number;   // 攻击持续时间(分钟)
  firstAttackTime: string;     // 首次攻击时间
  isOngoing: boolean;          // 是否正在进行中
  lastAttackTime: string;      // 最近攻击时间
}

// 攻击事件分页结果
export interface AttackEventResponse {
  currentPage: number;
  pageSize: number;
  results: AttackEventAggregateResult[];
  totalCount: number;
  totalPages: number;
}

// WAF日志条目
export interface Log {
  accuracy: number;           // 规则匹配的准确度(0-10)
  logRaw: string;             // 原始日志数据
  message: string;            // 日志消息
  payload: string;            // 攻击载荷
  phase: number;              // 请求处理阶段
  ruleId: number;             // 规则标识符
  secLangRaw: string;         // 原始安全语言
  secMark: string;            // 规则安全标记
  severity: number;           // 严重程度(0-5)
}

// WAF安全事件日志记录
export interface WAFLog {
  accuracy: number;           // 规则匹配的准确度(0-10)
  clientIpAddress: string;    // 来源IP地址
  createdAt: string;          // 事件时间戳
  domain: string;             // 目标域名
  logs: Log[];                // 相关日志条目
  message: string;            // 事件消息或描述
  payload: string;            // 攻击载荷
  phase: number;              // 请求处理阶段
  request: string;            // 原始HTTP请求
  response: string;           // 原始HTTP响应
  ruleId: number;             // 触发的规则ID
  secLangRaw: string;         // 原始安全语言定义
  secMark: string;            // 规则安全标记
  serverIpAddress: string;    // 目标IP地址
  severity: number;           // 事件严重程度(0-5)
  uri: string;                // 请求URI
}

// 攻击日志分页结果
export interface AttackLogResponse {
  currentPage: number;
  pageSize: number;
  results: WAFLog[];
  totalCount: number;
  totalPages: number;
}

// 日志详情对话框数据
export interface AttackDetailData {
  target: string;           // 目标 (domain + URI)
  clientIpAddress: string;  // 客户端IP
  payload: string;          // 攻击载荷
  message: string;          // 消息
  ruleId: number;           // 规则ID
  createdAt: string;        // 创建时间
  request: string;          // 请求内容
  response: string;         // 响应内容
  logs: string;             // 日志内容
} 