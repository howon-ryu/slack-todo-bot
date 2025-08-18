const { App, ExpressReceiver } = require('@slack/bolt');

// Express receiver 사용 (Vercel용)
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET || 'dummy-secret',
  endpoints: '/api/slack',
  processBeforeResponse: true
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN || 'dummy-token',
  receiver
});

// TODO 항목을 파싱하는 함수
function parseTodoList(message) {
  const todos = [];
  const lines = message.split('\n');
  
  lines.forEach(line => {
    // '진행 중' 상태인 항목만 처리
    if (!line.includes('진행 중')) {
      return;
    }
    
    // 날짜 패턴 찾기 (YYYY-MM-DD)
    const dateMatch = line.match(/(\d{4}-\d{2}-\d{2})/);
    // 사용자 ID 패턴 찾기 (U로 시작하는 슬랙 ID)
    const userMatch = line.match(/(U[A-Z0-9]{10})/);
    // 작업 제목 추출
    const titleMatch = line.match(/^(.*?)(?:\d{4}-\d{2}-\d{2}|진행 중)/);
    
    if (dateMatch && userMatch && titleMatch) {
      todos.push({
        title: titleMatch[1].trim(),
        dueDate: dateMatch[1],
        userId: userMatch[1],
        status: '진행 중',
        originalLine: line
      });
    }
  });
  
  return todos;
}

// 마감일이 지난 작업 찾기
function getOverdueTasks(todos) {
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  
  return todos.filter(todo => {
    // 마감일이 오늘보다 이전인 경우 (마감일 지남)
    return todo.dueDate < todayString;
  });
}

// 리마인드 메시지 보내기 (마감 지연 알림)
async function sendOverdueReminder(todo) {
  const today = new Date();
  const dueDate = new Date(todo.dueDate);
  const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
  
  try {
    await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: todo.userId, // DM으로 전송
      text: `🚨 *마감일 경과 알림*\n\n📝 작업: ${todo.title}\n📅 마감일: ${todo.dueDate} (${daysOverdue}일 경과)\n📊 상태: ${todo.status}\n\n⚠️ 마감일이 ${daysOverdue}일 지났습니다. 빠른 처리 부탁드립니다!`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `🚨 *마감일 경과 알림*\n\n📝 작업: ${todo.title}\n📅 마감일: ${todo.dueDate} (${daysOverdue}일 경과)\n📊 상태: ${todo.status}\n\n⚠️ 마감일이 ${daysOverdue}일 지났습니다. 빠른 처리 부탁드립니다!`
          }
        }
      ]
    });
    console.log(`마감 지연 알림 전송 완료: ${todo.title} -> ${todo.userId} (${daysOverdue}일 지연)`);
  } catch (error) {
    console.error('마감 지연 알림 전송 실패:', error);
  }
}

// 전역 변수 (간단한 메모리 저장)
let currentTodos = [];

// 메시지 모니터링 (특정 DM에서만 작동)
app.message(/\[결제AM\] TO-DO List/, async ({ message }) => {
  // DM인지 확인 (채널 ID가 D로 시작하면 DM)
  if (!message.channel.startsWith('D')) {
    console.log('채널 메시지는 무시합니다. DM에서만 작동합니다.');
    return;
  }
  
  console.log('TODO 리스트 감지:', message.text);
  
  // TODO 항목 파싱
  const todos = parseTodoList(message.text);
  console.log('파싱된 TODO 항목들:', todos);
  
  // 메모리에 저장
  currentTodos = todos;
});

// 수동 리마인드 체크 명령어
app.command('/check_reminders', async ({ command, ack, respond }) => {
  await ack();
  
  if (!currentTodos || currentTodos.length === 0) {
    await respond("등록된 TODO 리스트가 없습니다.");
    return;
  }
  
  const overdueTasks = getOverdueTasks(currentTodos);
  
  if (overdueTasks.length === 0) {
    await respond("마감일이 지난 작업이 없습니다.");
  } else {
    await respond(`마감일이 지난 작업 ${overdueTasks.length}개를 발견했습니다. 담당자들에게 알림을 전송합니다.`);
    
    // 각 담당자에게 DM 전송
    for (const task of overdueTasks) {
      await sendOverdueReminder(task);
    }
  }
});

// 에러 핸들링 추가
app.error(async (error) => {
  console.error('App error:', error);
});

// 기본 라우트 추가 (테스트용)
receiver.app.get('/api/slack', (req, res) => {
  res.json({ message: 'Slack bot is running!', timestamp: new Date().toISOString() });
});

// Vercel 서버리스 함수로 export
module.exports = receiver.app;