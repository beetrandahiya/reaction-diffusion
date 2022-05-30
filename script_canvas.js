var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
ctx.clearRect(0, 0, canvas.width, canvas.height);
var id = ctx.getImageData(0, 0, 500, 500);
var pixels = id.data;


width = 500;
height = 500;
var grid = [];
var next = [];

var dA = 1;
var dB = 0.5;
var feed = 0.07;
var k = 0.061;
var dt = 1.12;


grid = [];
next = [];
for (var x = 0; x < width; x++) {
    grid[x] = [];
    next[x] = [];
    for (var y = 0; y < height; y++) {
        grid[x][y] = {
            a: 1,
            b: 0
        };
        next[x][y] = {
            a: 1,
            b: 0
        };
    }
}

for (var i = 100; i < 110; i++) {
    for (var j = 100; j < 110; j++) {
        grid[i][j].b = 1;
    }
}

//click event
canvas.addEventListener('click', function (e) {
    var x = e.pageX - this.offsetLeft;
    var y = e.pageY - this.offsetTop;
    var i = Math.floor(x / (width / width));
    var j = Math.floor(y / (height / height));
    for(x=i-10;x<i+10;x++){
        for(y=j-10;y<j+10;y++){
            grid[x][y].b = 1;
        }
    }
});
function draw() {
    
    for (var x = 1; x < width - 1; x++) {
        for (var y = 1; y < height - 1; y++) {
            var a = grid[x][y].a;
            var b = grid[x][y].b;
            next[x][y].a = a + (dA * laplaceA(x, y) - a * b * b + feed * (1 - a)) * dt;
            next[x][y].b = b + (dB * laplaceB(x, y) + a * b * b - (k + feed) * b) * dt;

            next[x][y].a = constrain(next[x][y].a, 0, 1);
            next[x][y].b = constrain(next[x][y].b, 0, 1);
        }
    }

    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            var pix = (x + y * width) * 4;
            var a = next[x][y].a;
            var b = next[x][y].b;
            var c = map(a, 0, 1, 0, 255);
            var rgb = HSLtoRGB(c, 100, 50);
            pixels[pix + 0] = rgb.r;
            pixels[pix + 1] = rgb.g;
            pixels[pix + 2] = rgb.b;
            pixels[pix + 3] = 255;
        }
    }
    ctx.putImageData(id, 0, 0);

    swap();
    requestAnimationFrame(draw);
}

function laplaceA(x, y) {
    var sumA = 0;
    sumA += grid[x][y].a * -1;
    sumA += grid[x - 1][y].a * 0.2;
    sumA += grid[x + 1][y].a * 0.2;
    sumA += grid[x][y + 1].a * 0.2;
    sumA += grid[x][y - 1].a * 0.2;
    sumA += grid[x - 1][y - 1].a * 0.05;
    sumA += grid[x + 1][y - 1].a * 0.05;
    sumA += grid[x + 1][y + 1].a * 0.05;
    sumA += grid[x - 1][y + 1].a * 0.05;
    return sumA;
}

function laplaceB(x, y) {
    var sumB = 0;
    sumB += grid[x][y].b * -1;
    sumB += grid[x - 1][y].b * 0.2;
    sumB += grid[x + 1][y].b * 0.2;
    sumB += grid[x][y + 1].b * 0.2;
    sumB += grid[x][y - 1].b * 0.2;
    sumB += grid[x - 1][y - 1].b * 0.05;
    sumB += grid[x + 1][y - 1].b * 0.05;
    sumB += grid[x + 1][y + 1].b * 0.05;
    sumB += grid[x - 1][y + 1].b * 0.05;
    return sumB;
}

function constrain(value, min, max) {
    if (value < min) {
        return min;
    } else if (value > max) {
        return max;
    } else {
        return value;
    }
}

function HSLtoRGB(h,s,l){
    s /= 100;
    l /= 100;
  
    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c/2,
        r = 0,
        g = 0,
        b = 0;
    if (0 <= h && h < 60) {
        r = c; g = x; b = 0;  
        } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0;
        } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x;
        } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c;
        } else if (240 <= h && h < 300) {
        r = x; g = 0; b = c;
        } else if (300 <= h && h < 360) {
        r = c; g = 0; b = x;
        }
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);
    
        return {
            r : r,
            g : g,
            b : b 
        }
}


function swap() {
    var temp = grid;
    grid = next;
    next = temp;
}
function map(n, start1, stop1, start2, stop2) {
    return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
}

draw();