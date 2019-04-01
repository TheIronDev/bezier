const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

class Point {
  constructor(relX, relY, canvas, dpr, pointName) {
    this.relX = relX;
    this.relY = relY;
    this.canvas = canvas;
    this.dpr = dpr;
    this.pointName = pointName;
    this.r = 5;
  }
  draw(ctx, start) {
    const {relX, relY, width, height, r, pointName} = this;
    const x = this.getX();
    const y = this.getY();
    ctx.save();

    ctx.beginPath();
    ctx.textBaseline = 'top';
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillText(`${pointName}`, x, y + r +5);
    ctx.fillText(`${~~(x - start.getX())} ${~~(y - start.getY())}`, x, y + r + 15);
    ctx.fill();

    ctx.restore();
  }
  getX() {
    return this.relX * this.canvas.width / this.dpr;
  }
  getY() {
    return this.relY * this.canvas.height / this.dpr;
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
let cp1, cp2;

window.addEventListener('resize', () => resize());
canvas.addEventListener('mousedown', ev => {
  const {clientX, clientY} = ev;
  const {width, height} = canvas;

  if (!cp1) {
    cp1 = new Point(clientX/width * dpr, clientY/height * dpr, canvas, dpr, 'CP1');
  } else if (!cp2) {
    cp2 = new Point(clientX/width * dpr, clientY/height * dpr, canvas, dpr, 'CP2');
  }
  draw();

});


resize();
draw();

