var Tile = function(type, x, y) {
	this.type = type;
	this.x = x;
	this.y = y;	
};

function create_battle_map() {
	var tile = [];
	var width = 1024;
	var height = 786;

	for (var x=0;x<32;x++) {
		tile[x] = [];
		for (var y=0;y<24;y++) {
			tile[x][y] = 0;
		}
	}
	
	function draw(ctx, offsetx, offsety) {
		ctx.fillStyle = SKY_GRADIENT;
		ctx.fillRect(0,0,640,offsety+160);
		ctx.fillStyle = GROUND_GRADIENT;
		ctx.fillRect(0,offsety+160,640,480-offsety+160);
		
		for (var x=0;x<20;x++) {
			for (var y=0;y<20;y++) {
				ctx.fillStyle = "rgba(25,150,75,0.75)";
				ctx.fillRect(x*32+offsetx,y*16+160+offsety,31,15);
			}
		}
	}
	
	return {
		tile: tile,
		width: width,
		height: height,
		draw: draw
	};
}
