var DialogBox = function(name, color, text) {
	this.rect = new Rect(0,320,640,140);
	this.name = name;
	this.color = color;
	this.text = text;
	this.displaytext = "";
	this.index = 0;
	this.timeout = 100;
};

DialogBox.prototype.loop = function() {
	if (this.displaytext.length < this.text.length) {
		this.displaytext += this.text[this.index];
		this.index += 1;
	}
	else
		this.timeout--;
};

DialogBox.prototype.draw = function(ctx) {
	ctx.fillStyle = "rgba(0,0,255,0.75)";
	ctx.fillRect(this.rect.x,this.rect.y,this.rect.w,this.rect.h);
	
	ctx.fillStyle = "rgba(155,155,155,0.5)";
	ctx.fillRect(this.rect.x, this.rect.y,160,this.rect.h);
	
	ctx.fillStyle = this.color;
	ctx.fillRect(this.rect.x + 20, this.rect.y+20, 80, 120);
	
	ctx.fillStyle = "rgb(255,255,255)";
	ctx.font = "32px monospace";
	ctx.fillText(this.displaytext, this.rect.x + 160, this.rect.y);	
};