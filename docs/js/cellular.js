paper.install(window);

var running = false
var pauseBetweenFrames = 0
var intervalHandle
var world

window.onload = function() {
    paper.setup('myCanvas');

    var tool = new Tool();
    tool.onMouseDown = function(event) {
        world.toggle(event.point)
    }
    tool.activate()

    var canvas = document.getElementById('myCanvas');

    var resetButton = document.getElementById('resetButton');
    resetButton.onclick = function() {
        world.world = world.generateRandomWorld(world.numCols, world.numRows, world.cellProbability)
        world.draw()
        if(running) {
            playButton.onclick()
        }
    }

    var clearButton = document.getElementById('clearButton');
    clearButton.onclick = function() {
        world.clearWorld()
        world.draw()
        if(running) {
            playButton.onclick()
        }
    }

    var fpsSlider = document.getElementById('fpsSlider');
    fpsSlider.oninput = function() {
        window.clearInterval(intervalHandle)
        if(this.value > 0) {
            window.clearInterval
            intervalHandle = window.setInterval(function (event) {
                world.update();
            }, 1000 / this.value);
        }
    }



    var worldCenter = new Point(canvas.width / 2, canvas.height / 2);

    var world = new World(canvas.width, canvas.height,
                          100, 50);

    world.worldGroup.position = worldCenter;
}

var World = function(canvasWidth, canvasHeight, worldWidth, worldHeight) {
    this.numRows = worldHeight;
    this.numCols = worldWidth;
    this.cellProbability = 0.1;

    this.canvasWidth = canvasWidth
    this.canvasHeight = canvasHeight
    this.gridSize = Math.min(canvasWidth / this.numCols, canvasHeight / this.numRows);

    this.clearWorld()

    this.worldGroup = new Group();
    for(var row = 0; row < this.numRows; ++row) {
        for(var col = 0; col < this.numCols; ++col) {
            var rect = new Path.Rectangle(new Point(col * this.gridSize, row * this.gridSize),
                                         new Point((col + 1) * this.gridSize, (row + 1) * this.gridSize))
            rect.strokeColor = 'black';

            var color;
            switch(this.world[row][col]) {
                case -1:
                    color = 'green';
                    break;
                case 0:
                    color = 'white';
                    break;
                case 1:
                    color = 'black';
                    break;
            }

            rect.fillColor = color;
            rect.name = this.getGridName(col, row);
            this.worldGroup.addChild(rect);
        }
    }
}

World.prototype.toggle = function(point) {
    //This assumes width > height

    var horizontalPadding = (this.canvasWidth - (this.numCols * this.gridSize)) / 2

    var gridX = Math.floor(((point.x - horizontalPadding) / (this.gridSize * this.numCols)) * this.numCols)
    if(gridX < 0 || gridX > this.numCols) {
        return;
    }

    var verticalPadding = (this.canvasHeight - (this.numRows * this.gridSize)) / 2

    var gridY = Math.floor(((point.y - verticalPadding) / (this.gridSize * this.numRows)) * this.numRows)
    if(gridY < 0 || gridY > this.numRows) {
        return;
    }

    var result = 0
    switch(this.world[gridY][gridX]) {
        case 1:
            result = 0;
            break;
        default:
            result = 1;
            break;
    }

    this.world[gridY][gridX] = result;
    this.draw()
}

World.prototype.clearWorld = function() {
    this.world = this.generateRandomWorld(this.numCols, this.numRows, 0.0)
}

World.prototype.generateRandomWorld = function(width, height, cellProbability) {
    var world = new Array(height);
    for(var i = 0; i < height; ++i) {
        world[i] = new Array(width);

        for(var j = 0; j < width; ++j) {
            if(coinFlip(cellProbability)) {
                world[i][j] = 1;
            } else {
                world[i][j] = 0;
            }
        }
    }

    return world;
}

World.prototype.getGridName = function(x, y) {
    return 'x' + x + 'y' + y;
}

World.prototype.update = function() {
    var neighbourMap = this.determineNeighbours();

    for(var row = 0; row < this.numRows; ++row) {
        for(var col = 0; col < this.numCols; ++col) {
            switch(this.world[row][col]) {
                case -1:
                case 0:
                    //Repopulation
                    if(neighbourMap[row][col] == 3) {
                        this.world[row][col] = 1;
                    }
                    break;
                case 1:
                    //Death by over or underpopulation
                    if(neighbourMap[row][col] < 2 || neighbourMap[row][col] > 3) {
                        this.world[row][col] = -1;
                    }
                    break;
            }
        }
    }

    this.draw()
}

World.prototype.draw = function() {
    for(var row = 0; row < this.numRows; ++row) {
        for(var col = 0; col < this.numCols; ++col) {

            var rectName = this.getGridName(col, row);
            var rect = this.worldGroup.children[rectName];

            rect.strokeColor = 'black';

            var color;
            switch(this.world[row][col]) {
                case -1:
                    color = 'green';
                    break;
                case 0:
                    color = 'white';
                    break;
                case 1:
                    color = 'black';
                    break;
            }

            rect.fillColor = color;
        }
    }
}

World.prototype.determineNeighbours = function() {
    var neighbourMap = new Array(this.numRows);

    for(var i = 0; i < this.numRows; ++i) {
        neighbourMap[i] = new Array(this.numCols);

        for(var j = 0; j < this.numCols; ++j) {
            neighbourMap[i][j] = 0;
        }
    }

    for(var row = 0; row < this.numRows; ++row) {
        for(var col = 0; col < this.numCols; ++col) {
            if(this.world[row][col] == 1) {
                this.incrementCount(neighbourMap, col - 1, row - 1, );
                this.incrementCount(neighbourMap, col - 1, row);
                this.incrementCount(neighbourMap, col - 1, row + 1);
                this.incrementCount(neighbourMap, col, row - 1);
                this.incrementCount(neighbourMap, col, row + 1);
                this.incrementCount(neighbourMap, col + 1, row - 1);
                this.incrementCount(neighbourMap, col + 1, row);
                this.incrementCount(neighbourMap, col + 1, row + 1);
            }
        }
    }

    return neighbourMap;
}

World.prototype.incrementCount = function(neighbourMap, x, y) {
    var coords = this.getCellCoordinates(x, y);
    neighbourMap[coords[1]][coords[0]] += 1;
}

World.prototype.getCellCoordinates = function(x, y) {
    if(x == -1) {
        x = this.numCols - 1;
    } else {
        x = x % this.numCols;
    }

    if(y == -1) {
        y = this.numRows - 1;
    } else {
        y = y % this.numRows;
    }

    return [x,y];
}