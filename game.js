function randint(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function clamp(value, min, max) {
	if (value < min) return min;
	if (value > max) return max;
	return value;
}

function get_distance(x1, y1, x2, y2) {
	var dx = x2-x1;
	var dy = y2-y1;
	return Math.sqrt(dx*dx+dy*dy);
}

var Rect = function(x, y, w, h) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
};

Rect.prototype.hit = function(mx, my) {
	return mx >= this.x && mx < this.x + this.w &&
	my >= this.y && my < this.h;
};

var Color = function(r, g, b, a) {
    this.r = r; this.g = g; this.b = b; this.a = a;
};

Color.prototype.edit = function(key, value) {
    if (key == "r" || key == "g" || key=="b" || key=="a")
        this[key] = value;
    return this;
};

Color.prototype.toString = function() {
    return "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.a + ")";
};

var Game = function() {
    var party = create_party("user");
    
	this.battle = create_battle(party);
};

Game.prototype.loop = function() {

	game.battle.loop();
	game.draw();
	
	requestAnimationFrame(game.loop);
};

Game.prototype.draw = function() {
	this.battle.draw(context);
};