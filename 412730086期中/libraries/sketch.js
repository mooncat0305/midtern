let seagrasses = [];
let bubbles = [];
let decorBubbles = [];
let fishes = [];
let iframeContainer;

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 初始化海草聚落
  for (let i = 0; i < 25; i++) {
    seagrasses.push(new Seagrass(random(width), height, random(150, 350)));
  }

  // 初始化背景裝飾小氣泡
  for (let i = 0; i < 60; i++) {
    decorBubbles.push(new DecorativeBubble());
  }

  // 初始化氣泡 (作業聚落)
  // 這裡請填入你的截圖檔名 (例如: work1.png)
  let assignments = [
    { name: "第一次作業", url: "第一次作業.png" }, 
    { name: "第二次作業", url: "第二次.png" }, 
    { name: "期中報告", url: "期中2.png" }
  ];
  
  for (let i = 0; i < assignments.length; i++) {
    // 將索引 i (0, 1, 2) 映射到螢幕寬度的 25% 到 75% 之間
    let xPos = map(i, 0, assignments.length - 1, width * 0.25, width * 0.75);
    bubbles.push(new Bubble(xPos, random(height * 0.3, height * 0.7), assignments[i]));
  }

  // 創建一個隱藏的 Iframe 容器 (使用 p5.dom)
  iframeContainer = createDiv('');
  iframeContainer.id('iframe-modal');
  iframeContainer.style('position', 'fixed');
  iframeContainer.style('top', '10%');
  iframeContainer.style('left', '10%');
  iframeContainer.style('width', '80%');
  iframeContainer.style('height', '80%');
  iframeContainer.style('background', 'rgba(255, 255, 255, 0.9)');
  iframeContainer.style('border', '5px solid #005f73');
  iframeContainer.style('border-radius', '20px');
  iframeContainer.style('display', 'none');
  iframeContainer.style('z-index', '9999');
}

function draw() {
  background(220);
  // 水底漸層背景
  background(10, 25, 47); 
  noStroke();
  fill(20, 60, 100, 150);
  rect(0, 0, width, height);

  // 繪製背景裝飾小氣泡
  for (let db of decorBubbles) {
    db.update();
    db.display();
  }

  // 繪製海草 (Class & Array)
  for (let s of seagrasses) {
    s.update();
    s.display();
  }

  // 繪製獨特的奇幻魚群 (Vertex / beginShape)
  drawFishCluster();

  // 繪製作業氣泡 (Iframe 整合入口)
  for (let b of bubbles) {
    b.update();
    b.display();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// --- 海草類別 (Class & Array 控制搖擺) ---
class Seagrass {
  constructor(x, y, h) {
    this.x = x;
    this.y = y;
    this.h = h;
    this.segments = 12;
    this.offset = random(1000); // 隨機雜訊位移
  }

  update() {
    this.sway = map(noise(this.offset, frameCount * 0.01), 0, 1, -40, 40);
  }

  display() {
    push();
    stroke(30, 200, 80, 180);
    strokeWeight(6);
    noFill();
    beginShape();
    vertex(this.x, this.y);
    for (let i = 1; i <= this.segments; i++) {
      let segH = this.h / this.segments;
      // 利用 i 讓越頂端的海草搖擺幅度越大
      let currentSway = this.sway * (i / this.segments);
      let px = this.x + currentSway + sin(frameCount * 0.05 + i) * 5;
      let py = this.y - i * segH;
      vertex(px, py);
    }
    endShape();
    pop();
  }
}

// --- 氣泡類別 (Iframe 彈出邏輯) ---
class Bubble {
  constructor(x, y, info) {
    this.baseX = x; // 紀錄初始水平基準
    this.baseY = y; // 紀錄初始垂直基準
    this.x = x;
    this.y = y;
    this.info = info;
    this.size = 150; // 作業氣泡調大
    this.floatOffset = random(1000); // 隨機位移讓氣泡節奏錯開
  }

  update() {
    // 使用 sin 函數實現穩定的上下小幅度漂浮，不會離開視窗
    this.y = this.baseY + sin(frameCount * 0.05 + this.floatOffset) * 20;
    // 水平方向也加入微小的擺動，增加靈動感
    this.x = this.baseX + cos(frameCount * 0.02 + this.floatOffset) * 10;
  }

  display() {
    push();
    translate(this.x, this.y);
    // 氣泡質感
    fill(135, 206, 235, 100);
    stroke(255, 255, 255, 200);
    strokeWeight(2);
    circle(0, 0, this.size);
    fill(255, 200);
    ellipse(-this.size/4, -this.size/4, 15, 20); // 反光
    
    // 文字標籤
    textAlign(CENTER, CENTER);
    noStroke();
    fill(255);
    textSize(14);
    text(this.info.name, 0, 0);
    pop();
  }

  isClicked(mx, my) {
    return dist(mx, my, this.x, this.y) < this.size / 2;
  }
}

// --- 背景裝飾氣泡類別 ---
class DecorativeBubble {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.size = random(3, 10); // 迷你尺寸
    this.speed = random(0.2, 1.2); // 緩慢上升
  }

  update() {
    this.y -= this.speed;
    if (this.y < -this.size) {
      this.y = height + this.size;
      this.x = random(width);
    }
  }

  display() {
    noStroke();
    fill(255, 255, 255, 60); // 較透明的白色
    circle(this.x, this.y, this.size);
  }
}

// --- 獨特的魚群繪製 (Vertex 勾勒) ---
function drawFishCluster() {
  let x = noise(frameCount * 0.005) * width;
  let y = noise(frameCount * 0.005 + 500) * height;
  
  push();
  translate(x, y);
  fill(255, 150, 0, 220); // 橘色小魚
  noStroke();
  beginShape();
  vertex(0, 0); // 魚頭
  bezierVertex(20, -15, 40, -15, 50, 0); // 魚背
  vertex(65, -15); // 魚尾上
  vertex(58, 0);   // 魚尾中
  vertex(65, 15);  // 魚尾下
  vertex(50, 0);
  bezierVertex(40, 15, 20, 15, 0, 0); // 魚肚
  endShape(CLOSE);
  pop();
}

function mousePressed() {
  for (let b of bubbles) {
    if (b.isClicked(mouseX, mouseY)) {
      openIframe(b.info.url);
      return;
    }
  }
}

function openIframe(url) {
  const isImage = /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(url);
  let content;

  if (isImage) {
    content = `<div style="display:flex; justify-content:center; align-items:center; height:calc(100% - 50px); background:#f0f9ff; border-radius:0 0 15px 15px;">
                 <img src="${url}" style="max-width:100%; max-height:100%; object-fit:contain; border-radius:10px; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
               </div>`;
  } else {
    content = `<iframe src="${url}" style="width:100%; height:calc(100% - 50px); border:none; border-radius:0 0 15px 15px;"></iframe>`;
  }

  iframeContainer.html(`
    <div style="padding:10px; background:#005f73; color:white; display:flex; justify-content:space-between; align-items:center; border-radius:20px 20px 0 0;">
      <span style="margin-left:10px; font-family:sans-serif;">作品預覽</span>
      <button onclick="document.getElementById('iframe-modal').style.display='none'" style="cursor:pointer; background:#ae2012; color:white; border:none; padding:5px 15px; border-radius:5px;">關閉 (X)</button>
    </div>
    ${content}
  `);
  iframeContainer.style('display', 'block');
}
