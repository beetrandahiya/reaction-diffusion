const gpu = new GPU();


const calc=gpu.createKernel(function(arr){
    // fn = sin(x)
    for(let i=0;i<arr.length;i++){
        arr[i] = Math.sin(arr[i]);
    }
    return arr;
}).setOutput([512]);


var grid=[];
var nextGrid=[];

for(let i=0;i<512;i++){
    grid.push([]);
    nextGrid.push([]);
    for(let j=0;j<512;j++){
        grid[i].push({a:0,b:0});
        nextGrid[i].push({a:0,b:0});
    }
}


const render = gpu.createKernel(function () {
    function map(n, start1, stop1, start2, stop2) {
        return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
    }
    var w = this.constants.width;
    var h = this.constants.height;
    var grid = this.constants.grid;
    var nextGrid = this.constants.nextGrid;

    //reaction diffusion

    var a = grid[this.thread.x][this.thread.y].a;
    var b = grid[this.thread.x][this.thread.y].b;

    var a_next = a + (b - a) * 0.1;
    var b_next = b + (a - b) * 0.1;

    nextGrid[this.thread.x][this.thread.y].a = a_next;
    nextGrid[this.thread.x][this.thread.y].b = b_next;

    this.color(a_next, b_next, 0,1);

    //drawing

    for (let i = 0; i < w; i++) {
        for (let j = 0; j < h; j++) {
            var a = grid[i][j].a;
            var b = grid[i][j].b;
            var c = map(a, 0, 1, 0, 1);
            var d = map(b, 0, 1, 0, 1);
            this.color(c, d, 0);
        }
    }


}, {
    constants: {
        width: 512,
        height: 512,
        grid: grid,
        nextGrid: nextGrid
    }
}).setOutput([512, 512]).setGraphical(true);


render();
const canvas = render.canvas;

document.getElementsByTagName('body')[0].appendChild(canvas);