const gpu = new GPU();


const calc=gpu.createKernel(function(arr){
    // fn = sin(x)
    for(let i=0;i<arr.length;i++){
        arr[i] = Math.sin(arr[i]);
    }
    return arr;
}).setOutput([512]);


grid=[];
nextGrid=[];

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

    //reaction diffusion

    

}, {
    constants: {
        width: 512,
        height: 512
    }
}).setOutput([512, 512]).setGraphical(true);


render();
const canvas = render.canvas;

document.getElementsByTagName('body')[0].appendChild(canvas);