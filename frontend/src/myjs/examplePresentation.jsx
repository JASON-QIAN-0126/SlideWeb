import { v4 as uuidv4 } from 'uuid';

// 创建示例演示文稿
export function createExamplePresentation() {
  return {
    id: 'example-slide-' + Date.now(),
    name: '示例演示文稿',
    description: '这是一个示例演示文稿，展示了各种元素的使用方法',
    thumbnailSlideIndex: 0,
    defaultBackground: { type: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    slides: [
      {
        id: uuidv4(),
        background: { type: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        elements: [
          {
            id: uuidv4(),
            type: 'text',
            position: { x: 4, y: 30 },
            size: { width: 90, height: 15 },
            layer: 1,
            properties: {
              text: '欢迎使用 Love Slide',
              fontSize: 2,
              color: '#ffffff',
              fontFamily: '微软雅黑',
              textAlign: 'center',
              fontWeight: 'bold'
            }
          },
          {
            id: uuidv4(),
            type: 'text',
            position: { x: 5, y: 50 },
            size: { width: 100, height: 15 },
            layer: 1,
            properties: {
              text: '随时随地在线制作演示文稿！',
              fontSize: 2,
              color: '#ffffff',
              fontFamily: '微软雅黑',
              textAlign: 'center',
              fontWeight: 'bold'
            }
          },
        ]
      },
      {
        id: uuidv4(),
        background: { type: 'solid', value: '#ffffff' },
        elements: [
          {
            id: uuidv4(),
            type: 'text',
            position: { x: 10, y: 10 },
            size: { width: 80, height: 15 },
            layer: 1,
            properties: {
              text: '操作指南',
              fontSize: 2,
              color: '#252525',
              fontFamily: '微软雅黑',
              textAlign: 'center',
              fontWeight: 'bold'
            }
          },
          {
            id: uuidv4(),
            type: 'text',
            position: { x: 10, y: 35 },
            size: { width: 80, height: 50 },
            layer: 2,
            properties: {
              text: '基本操作：\n\n1. 添加元素：点击工具栏的"添加元素"按钮\n2. 编辑元素：双击文本或代码元素直接编辑\n3. 移动元素：拖拽元素到新位置\n4. 调整大小：拖拽元素边缘调整尺寸\n5. 删除元素：选中元素后按Delete键\n6. 设置背景：点击"设置背景"按钮\n7. 预览演示：点击"预览演示"按钮',
              fontSize: 1.1,
              color: '#252525',
              fontFamily: '微软雅黑',
              textAlign: 'left',
              fontWeight: 'normal'
            }
          }
        ]
      },
      {
        id: uuidv4(),
        background: { type: 'gradient', value: 'linear-gradient(45deg, #ff6b6b 0%, #feca57 100%)' },
        elements: [
          {
            id: uuidv4(),
            type: 'text',
            position: { x: 10, y: 10 },
            size: { width: 80, height: 15 },
            layer: 1,
            properties: {
              text: '开始创作',
              fontSize: 2,
              color: '#ffffff',
              fontFamily: '微软雅黑',
              textAlign: 'center',
              fontWeight: 'bold'
            }
          },
          {
            id: uuidv4(),
            type: 'text',
            position: { x: 10, y: 35 },
            size: { width: 80, height: 50 },
            layer: 2,
            properties: {
              text: '现在您可以：\n\n🎯 创建自己的演示文稿\n📝 添加各种内容元素\n🎨 自定义样式和布局\n💾 保存您的工作\n📤 分享您的作品\n\n点击"创建演示文稿"开始您的创作之旅！',
              fontSize: 1.2,
              color: '#ffffff',
              fontFamily: '微软雅黑',
              textAlign: 'center',
              fontWeight: 'normal'
            }
          }
        ]
      }
    ]
  };
} 