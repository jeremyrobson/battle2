var Building = function(i) {
	this.x = randint(0, 4096);
	this.y = i*64;
	this.width = randint(120,240);
	this.height = randint(120,480);
	
	this.roofcolor = new Color(100,100,100,1.0);
	this.bodycolor = new Color(155,155,155,1.0);
};

Building.prototype.draw = function(ctx, offsetx, offsety) {
	var dx = this.x + offsetx;
	var dy = this.y + offsety;
	
	if (dx >= -this.width && dx < 640 && dy >= -this.height && dy < 480) {
		var height2 = this.height / 3;
		ctx.fillStyle = this.bodycolor.toString();
		ctx.fillRect(dx, dy, this.width, this.height);
		ctx.fillStyle = this.roofcolor.toString();
		ctx.fillRect(dx, dy, this.width, height2);
	}
};

function create_river(prevx, prevy) {
	var x = prevx + randint(-64,64);
	var y = prevy + 64;
	var width = 64;
	var height = 64;
	
	function draw(ctx, offsetx, offsety) {
		var dx = x + offsetx;
		var dy = y + offsety;
		
		ctx.fillStyle = "rgb(0,0,255)";
		if (dx >= -width && dx < 640 && dy >= -height && dy < 480) {
			ctx.fillRect(dx-64, dy, 128, 64);
		}
	}
	
	return {
		x: x,
		y: y,
		draw: draw
	};
};

var Tree = function() {
	this.canvas = document.createElement("canvas");
	this.canvas.width = randint(32,96);
	this.canvas.height = randint(128,256);
	this.context = this.canvas.getContext("2d");
	this.x = randint(0, 4096);
	this.y = randint(0, 4096);
	this.width = this.canvas.width;
	this.height = this.canvas.height;
	this.color = "rgb(0,255,0)";
	
	this.context.fillStyle = "rgb(139,69,19)";
	this.context.fillRect(this.width * 1/3, this.height * 5/6, this.width*1/3, this.height*1/6);
	
	this.path = new Path2D();
	this.path.moveTo(0,this.height * 5/6);
    this.path.lineTo(this.width/2,0);
    this.path.lineTo(this.width,this.height * 5/6);
	this.context.fillStyle = this.color;
	this.context.fill(this.path);
};

Tree.prototype.draw = function(ctx, offsetx, offsety) {
	var dx = this.x + offsetx;
	var dy = this.y + offsety;
	
	if (dx >= -this.width && dx < 640 && dy >= -this.height && dy < 480) {
		ctx.drawImage(this.canvas, dx, dy);
	}
};

var Town = function(party) {
	this.party = party;
	this.buildings = [];
	this.trees = [];
	this.npcs = [];
	this.units = [];
	this.objects = [];
	this.sprites = [];
	this.river = [];
	
	var r = create_river(2048, 0);
	for (var i=0; i<64; i++) {
		this.river.push(r);
		r = create_river(r.x, r.y);
	}
	
	for (var i=0; i<64; i++)
		this.buildings.push(new Building(i));
	
	var test = new Building(0);
	test.x = 0;
	test.y = 0;
	this.buildings.push(test);
	
	for (var i=0; i<100;i++)
		this.trees.push(new Tree());
	
	this.objects = this.buildings.concat(this.trees);
	
	this.objects.sort(function(a,b) {
		return (a.y+a.height) - (b.y+b.height);
	});
	
	for (var i=0; i<50; i++)
		this.npcs.push(new Unit("npc", null, null));
		
	this.units = this.npcs.concat(this.party.units);
};

Town.prototype.loop = function(offsetx, offsety) {
	this.npcs.forEach(function(npc) {
		npc.loop(offsetx, offsety);
	});
	
	this.sprites = this.units
	.concat(this.objects)
	.sort(function(a,b) {
		return (a.y+a.height) - (b.y+b.height); //z-order
	});
};

Town.prototype.draw = function(ctx, offsetx, offsety, x, y) {
	ctx.fillStyle = "rgb(50,150,100)";
	ctx.fillRect(0,0,640,480);
	
	this.river.forEach(function(r) {
		r.draw(ctx, offsetx, offsety);
	});
	
	this.sprites.forEach(function(s) {
		s.draw(ctx, offsetx, offsety);
	});
};