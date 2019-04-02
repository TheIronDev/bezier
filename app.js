const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const DRAG_REGION = 50;

class Point {
  constructor(relX, relY, canvas, dpr, pointName) {
    this.relX = relX;
    this.relY = relY;
    this.canvas = canvas;
    this.dpr = dpr;
    this.pointName = pointName;
    this.r = 5;

    this.isDraggable = false;
  }
  draw(ctx, start) {
    const {relX, relY, width, height, r, pointName} = this;
    const x = this.getX();
    const y = this.getY();
    ctx.save();

    ctx.beginPath();
    ctx.textBaseline = 'top';

    ctx.fillStyle = 'black';
    ctx.fillText(`${pointName}`, x, y + r +5);
    ctx.fillText(`(${~~(x - start.getX())}, ${~~(y - start.getY())})`, x, y + r + 15);

    ctx.fillStyle = this.isDraggable ? 'green' : 'black';
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
  getDistance(x, y) {
    return Math.sqrt(
        Math.pow(this.getX() - x, 2) +
        Math.pow(this.getY() - y, 2));
  }
  getX() {
    return this.relX * this.canvas.width / this.dpr;
  }
  getY() {
    return this.relY * this.canvas.height / this.dpr;
  }
  updateIsDragable(x, y, override = null) {
    const distance = this.getDistance(x, y);
    this.isDraggable = distance < DRAG_REGION;
    if (override !== null) this.isDraggable = override;
  }
  updatePosition(relX, relY) {
    this.relX = relX;
    this.relY = relY;
  }
}
class Bezier {
  constructor(start, end, cp1 = null, cp2 = null) {
    this.start = start;
    this.end = end;
    this.cp1 = cp1;
    this.cp2 = cp2;
  }
  draw(ctx) {
    const {start, end, cp1, cp2} = this;
    ctx.save();

    ctx.beginPath();
    ctx.moveTo(start.getX(), start.getY());
    if (cp1 && cp2) ctx.bezierCurveTo(cp1.getX(), cp1.getY(), cp2.getX(), cp2.getY(), end.getX(), end.getY());
    else if (cp1) ctx.quadraticCurveTo(cp1.getX(), cp1.getY(), end.getX(), end.getY());
    else ctx.lineTo(end.getX(), end.getY());
    ctx.stroke();

    ctx.restore();
  }
}

const draw = () => {
  const dpr = window.devicePixelRatio;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const {width, height} = canvas;
  const bezier = new Bezier(start, end, cp1, cp2);
  

  start.draw(ctx, start);
  end.draw(ctx, start);
  cp1 && cp1.draw(ctx, start);
  cp2 && cp2.draw(ctx, start);

  bezier.draw(ctx);
}

const resize = () => {
  const dpr = window.devicePixelRatio;
  canvas.width = devicePixelRatio * window.innerWidth;
  canvas.height = devicePixelRatio * window.innerHeight;
  ctx.scale(devicePixelRatio, devicePixelRatio);

  draw();
}



const dpr = window.devicePixelRatio || 1;
const start = new Point(.25, .5, canvas, dpr, 'Start');
const end = new Point(.75, .5, canvas, dpr, 'End');
let cp1, cp2, dragPoint;

const addOrSelect = ev => {
  ev.preventDefault();
  const {width, height} = canvas;
  let {clientX, clientY, targetTouches} = ev;

  if (targetTouches) {
    clientX = targetTouches[0].clientX;
    clientY = targetTouches[0].clientY;
  }

  if (!cp1) {
    cp1 = new Point(clientX/width * dpr, clientY/height * dpr, canvas, dpr, 'CP1');
  } else if (!cp2) {
    cp2 = new Point(clientX/width * dpr, clientY/height * dpr, canvas, dpr, 'CP2');
  } else {
    const cp1Distance = cp1.getDistance(clientX, clientY);
    const cp2Distance = cp2.getDistance(clientX, clientY);
    const isCp1Closer = Math.abs(cp1Distance) < Math.abs(cp2Distance);

    if (isCp1Closer && cp1Distance < DRAG_REGION) dragPoint = cp1;
    else if (cp2Distance < DRAG_REGION) dragPoint = cp2;
    return;
  }
  draw();
}

const move = ev => {
  ev.preventDefault();
  const {width, height} = canvas;
  let {clientX, clientY, targetTouches} = ev;


  canvas.classList.remove('move');
  canvas.classList.remove('add');

  if (targetTouches) {
    clientX = targetTouches[0].clientX;
    clientY = targetTouches[0].clientY;
  }

  if (cp2) {
    const cp1Distance = cp1.getDistance(clientX, clientY);
    const cp2Distance = cp2.getDistance(clientX, clientY);
    const isCp1Closer = Math.abs(cp1Distance) < Math.abs(cp2Distance);
    cp1.updateIsDragable(clientX, clientY, isCp1Closer);
    cp2.updateIsDragable(clientX, clientY, !isCp1Closer);
    if (cp1.isDraggable || cp2.isDraggable || dragPoint) canvas.classList.add('move');
    if (dragPoint) dragPoint.updatePosition(clientX/width * dpr, clientY/height * dpr);
  } else {
    canvas.classList.add('add');
  }

  draw();
}

const clearDrag = ev => {
  dragPoint = null;
}

window.addEventListener('resize', resize);

canvas.addEventListener('mousedown', addOrSelect);
canvas.addEventListener('touchstart', addOrSelect);


canvas.addEventListener('mousemove', move);
canvas.addEventListener('touchmove', move);

canvas.addEventListener('touchend', clearDrag);
canvas.addEventListener('mouseup', clearDrag);
canvas.addEventListener('mouseleave', clearDrag);

resize();
draw();

