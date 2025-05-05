<template>
  <div class="chatbot-page">
    <!-- 小助手挂载点 -->
    <div id="chatbot-root"></div>
  </div>
</template>

<script setup>
import {onMounted} from 'vue'

onMounted(() => {
  // 加载小助手需要的CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.crossOrigin = 'anonymous';
  link.href = 'https://g.alicdn.com/aliyun-documentation/web-chatbot-ui/0.0.24/index.css';
  document.head.appendChild(link);

  // 加载小助手JS
  const script = document.createElement('script');
  script.type = 'module';
  script.crossOrigin = 'anonymous';
  script.src = 'https://g.alicdn.com/aliyun-documentation/web-chatbot-ui/0.0.24/index.js';
  script.onload = () => {
    window.CHATBOT_CONFIG = {
      endpoint: "https://webchat-bot-ddw-aiygepqrfd.cn-hangzhou.fcapp.run/chat",
      displayByDefault: true,
      title: 'AI 助手',
      draggable: true,
      resizable: true,
      position: 'fixed',
      dragOptions: {
        handle: '.webchat-dialog-header',
        cursor: 'move',
        disabled: false
      },
      aiChatOptions: {
        conversationOptions: {
          conversationStarters: [
            {prompt: '我想报名参加社区活动，怎么操作？'},
            {prompt: '活动服务有哪些类型？'},
            {prompt: '帮助老人时应注意哪些事项'},
          ]
        },
        displayOptions: {
          height: 600,
          width: 400,
          minHeight: 400,
          minWidth: 300,
          maxHeight: 1200,
          maxWidth: 800,
        },
        personaOptions: {
          assistant: {
            name: '你好，我是你的 AI 助手',
            avatar: 'https://img.alicdn.com/imgextra/i2/O1CN01Pda9nq1YDV0mnZ31H_!!6000000003025-54-tps-120-120.apng',
            tagline: '您可以尝试点击下方的快捷入口开启体验！',
          }
        },
        messageOptions: {
          waitTimeBeforeStreamCompletion: 'never'
        }
      },
      dataProcessor: {
        rewritePrompt(prompt) {
          return prompt;
        }
      }
    };

    if (window.createWebChatBot && window.CHATBOT_CONFIG) {
      window.createWebChatBot(window.CHATBOT_CONFIG);
    }
  };
  document.body.appendChild(script);
});
</script>

<style scoped>
:root {
  --webchat-toolbar-background-color: #1464E4;
  --webchat-toolbar-text-color: #FFF;
}

.webchat-container {
  z-index: 100;
  bottom: 20px;
  right: 20px;
  max-width: 400px;
  position: fixed !important;
  cursor: move;
}

.webchat-bubble-tip {
  z-index: 99;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  transform: scale(1.2);
  cursor: pointer;
}

.webchat-dialog {
  position: fixed !important;
  cursor: move;
}

.webchat-dialog-header {
  cursor: move;
  user-select: none;
}
</style>
