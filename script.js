const gpu = new GPU();




const render = gpu.createKernel(function () {
    function map(n, start1, stop1, start2, stop2) {
        return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
    }

    var w = this.constants.width;
    var h = this.constants.height;

    x=map(this.thread.x,0,w,-1,1);
    y=Math.sin(x)
    y= map(y, -1, 1, 0, h);


}, {
    constants: {
        width: 512,
        height: 512
    }
}).setOutput([512, 512]).setGraphical(true);


render();
const canvas = render.canvas;

document.getElementsByTagName('body')[0].appendChild(canvas);