@queryable
class Target implements GameObject {

    readonly velocity = {x: 0, y: 0};
    z: number;
    hit: false;
    
    constructor(readonly game : Game, public x: number, public y: number){
        this.game = game;
        this.x = x;
        this.y = y;

    }

    tick(dt: number) {
        if(this.hit){
            this.game.remove(this);
        }
    }

    draw(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.fillStyle = 'green';
    }
}

