const gpu = new GPU();


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
        grid[x][y] = [1, 0];
        next[x][y] = [1, 0];
    }
}

for (var i = 100; i < 110; i++) {
    for (var j = 100; j < 110; j++) {
        grid[i][j][1] = 1;
    }
}

//click event
canvas.addEventListener('click', function (e) {
    var x = e.pageX - this.offsetLeft;
    var y = e.pageY - this.offsetTop;
    var i = Math.floor(x / (width / width));
    var j = Math.floor(y / (height / height));
    for (x = i - 10; x < i + 10; x++) {
        for (y = j - 10; y < j + 10; y++) {
            grid[x][y][1] = 1;
        }
    }
    draw();
});

//gpu shit
const calcdiff = gpu.createKernel(function (grid) {

    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var id = ctx.getImageData(0, 0, 500, 500);
    var pixels = id.data;


    var dA = this.constants.dA;
    var dB = this.constants.dB;
    var feed = this.constants.feed;
    var k = this.constants.k;
    var dt = this.constants.dt;
    var width = this.constants.width;
    var a = grid[this.thread.y][this.thread.x][0];
    var b = grid[this.thread.y][this.thread.x][1];
    var valA = a + (dA * laplaceA(grid, this.thread.y, this.thread.x) - a * b * b + feed * (1 - a)) * dt;
    var valB = b + (dB * laplaceB(grid, this.thread.y, this.thread.x) + a * b * b - (k + feed) * b) * dt;

    valA = constrain(valA, 0, 1);
    valB = constrain(valB, 0, 1);

    var pix = (this.thread.y + this.thread.x * width) * 4;
    var c = valA*255;
    var rgb = [c, c, c];
    pixels[pix + 0] = rgb[0];
    pixels[pix + 1] = rgb[1];
    pixels[pix + 2] = rgb[2];
    pixels[pix + 3] = 255;


    //changing the indexes in laplacian
    function laplaceA(grid, x, y) {
        var sumA = 0;
        sumA += grid[x][y][0] * -1;
        sumA += grid[x + 1][y][0] * 0.2;
        sumA += grid[x - 1][y][0] * 0.2;
        sumA += grid[x][y - 1][0] * 0.2;
        sumA += grid[x][y + 1][0] * 0.2;
        sumA += grid[x + 1][y + 1][0] * 0.05;
        sumA += grid[x - 1][y + 1][0] * 0.05;
        sumA += grid[x - 1][y - 1][0] * 0.05;
        sumA += grid[x + 1][y - 1][0] * 0.05;
        return sumA;
    }

    function laplaceB(grid, x, y) {
        var sumB = 0;
        sumB += grid[x][y][1] * -1;
        sumB += grid[x + 1][y][1] * 0.2;
        sumB += grid[x - 1][y][1] * 0.2;
        sumB += grid[x][y - 1][1] * 0.2;
        sumB += grid[x][y + 1][1] * 0.2;
        sumB += grid[x + 1][y + 1][1] * 0.05;
        sumB += grid[x - 1][y + 1][1] * 0.05;
        sumB += grid[x - 1][y - 1][1] * 0.05;
        sumB += grid[x + 1][y - 1][1] * 0.05;
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
    /*
function HSLtoRGB(h, s, l) {
    s /= 100;
    l /= 100;

    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c / 2,
        r = 0,
        g = 0,
        b = 0;
    if (0 <= h && h < 60) {
        r = c;
        g = x;
        b = 0;
    } else if (60 <= h && h < 120) {
        r = x;
        g = c;
        b = 0;
    } else if (120 <= h && h < 180) {
        r = 0;
        g = c;
        b = x;
    } else if (180 <= h && h < 240) {
        r = 0;
        g = x;
        b = c;
    } else if (240 <= h && h < 300) {
        r = x;
        g = 0;
        b = c;
    } else if (300 <= h && h < 360) {
        r = c;
        g = 0;
        b = x;
    }
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return [r, g, b];
}*/

    return [valA, valB];

}, {
    constants: {
        dA: dA,
        dB: dB,
        feed: feed,
        k: k,
        dt: dt,
        width: width,
        height: height
    }
}).setOutput([width, height]);

function draw() {


    next = calcdiff(grid);

    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            var pix = (x + y * width) * 4;
            var a = next[x][y][0];
            var b = next[x][y][1];
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


function swap() {
    var temp = grid;
    grid = next;
    next = temp;
}

function map(n, start1, stop1, start2, stop2) {
    return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
}

draw();