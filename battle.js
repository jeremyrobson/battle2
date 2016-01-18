var UnitMenu = function(unit, index) {
	this.unit = unit;
	this.index = index;
	this.rect = new Rect(index * 160, 0, 160, 120);
	this.labels = [
		function() { return unit.NAME; },
		function() { return unit.get_stat("hp").val + " / " + unit.get_stat("hp").max; },
		function() { return unit.get_stat("mp").val + " / " + unit.get_stat("mp").max; },
		function() { return unit.get_stat("at").val + " / " + unit.get_stat("at").max; }
	];
};

UnitMenu.prototype.loop  = function() {

};

UnitMenu.prototype.mouse_down = function(mx, my) {
	if (this.rect.hit(mx, my)) return this;
};

UnitMenu.prototype.draw = function(ctx, selmenu) {
	ctx.fillStyle = (selmenu && this.index == selmenu.index) ? "rgba(155,255,255,0.33)" : "rgba(0,200,200,0.33)";
	ctx.fillRect(this.rect.x, 0, 160, 120);
	ctx.strokeRect(this.rect.x, 0, 160, 120);
	ctx.fillStyle = "rgb(255,255,255)";
	this.labels.forEach(function(label, i) {
		ctx.fillText(label(), this.rect.x+16, i*20+16);
	}, this);
};

function create_battle_menu(party) {
	var menus = [];
	party.units.forEach(function(u, i) {
		menus.push(new UnitMenu(u, i));
	});
	var selmenu = menus[0];
	
	function mouse_down(mx, my) {
		selmenu = menus.filter(function(menu) {
			return menu.mouse_down(mx, my);
		})[0];
		return selmenu;
	}
	
	function draw(ctx) {
		ctx.lineWidth = 1.0;
		ctx.strokeStyle = "rgb(200,200,255)";
		ctx.shadowColor = "rgb(0,0,0)";
		ctx.shadowOffsetX = 1;
		ctx.shadowOffsetY = 1;
		ctx.font = "16px sans-serif";
		menus.forEach(function(m) {
			m.draw(ctx, selmenu);
		});
	}
	
	return {
		menus: menus,
		mouse_down: mouse_down,
		draw: draw
	};
}

var DamageText = function(damagetype, text, x, y) { //todo: damagetype
	this.size = 24;
	this.color = new Color(255,255,255,1.0);
	
	var value = parseInt(text);
	
	if (damagetype == "attack") {
		this.size = Math.floor((value+600) / 50);
		text = value.toString();
	}
	else if (damagetype == "heal") {
		this.color = new Color(0,255,155,1.0);
		this.size = Math.floor((value+600) / 50);
		text = value.toString();
	}
	else //missed (NaN)
		text = "missed";
	
	this.bordercolor = new Color(0,0,0,1.0);
	this.text = text;
	this.x = x;
	this.y = y;
	this.offsety = 0;
	this.offsetx = 0;
	this.vx = (Math.random() > 0.5) ? -0.5: 0.5;
	this.vy = -3;
	this.life = 255;
};

DamageText.prototype.loop = function() {
	this.life--;
	this.vy += 0.1;
	this.offsetx += this.vx;
	this.offsety += this.vy;
	if (this.offsety >= 0) this.vy = -this.life/100;
	this.color.edit("a", this.life/256);
	this.bordercolor.edit("a", this.life/256);
};

DamageText.prototype.draw = function(ctx, offsetx, offsety) {
	ctx.lineWidth = 1.0;
	ctx.strokeStyle = this.bordercolor.toString();
	ctx.shadowColor = "rgb(0,0,0)";
	ctx.shadowOffsetX = 1;
	ctx.shadowOffsetY = 1;
	ctx.fillStyle = this.color.toString();
	ctx.font = this.size+"px Courier New";
	ctx.strokeText(this.text, this.x + this.offsetx + offsetx, this.y + this.offsety + 160 + offsety);
	ctx.fillText(this.text, this.x + this.offsetx + offsetx, this.y + this.offsety + 160 + offsety);
};

var Bullet = function(type, pwr, x, y, target) { //todo: hit rate
	this.type = type;
	this.pwr = pwr;
	this.x = x;
	this.y = y;
	this.target = target;
	var tx = target.get_x();
	var ty = target.get_y();
	this.radians = Math.atan2(y-ty, x-tx);
	this.vel = 5;
	this.life = 100;
	this.size = 8;
	this.color = (type=="attack") ? "rgb(255,0,255)" : "rgb(0,255,255)";
};

Bullet.prototype.loop = function(callback) {
	this.x -= Math.cos(this.radians) * this.vel;
	this.y -= Math.sin(this.radians) * this.vel;
	
	if (get_distance(this.x, this.y, this.target.get_x(), this.target.get_y()) < 8) {
		this.life = 0;
		var damage = this.pwr.val - this.target.get_stat("def").val;
		this.target.apply_damage(damage, this.type);
		var damagetext = new DamageText(this.type, damage, this.x, this.y);
		callback(damagetext);
	}
	
	this.life--;
};

Bullet.prototype.draw = function(ctx, offsetx, offsety) {
	ctx.fillStyle = this.color;
	ctx.fillRect(this.x+offsetx,this.y+160+offsety,this.size,this.size);
};

function create_battle(party) {
	var map = create_battle_map();
	var offsetx = 0;
	var offsety = 0;
	var teams = [];
	var units = [];
	var bullets = [];
	var damagetexts = [];
	var battlemenu = create_battle_menu(party);
	var selunit, selmenu;
	var dialogboxes = [];
	
	teams[0] = party;
	teams[1] = create_party("cpu");
	
	units = units.concat(teams[0].units);
	units = units.concat(teams[1].units);

	function battle_loop() {
		units.forEach(function(u) {
			if (u.is_alive()) {
				u.loop(map, units, function(b) {
					bullets.push(b);
				}, function(name, color, text) {
					create_dialog_box(name, color, text);
				});
			}
		});
		
		bullets = bullets.filter(function(b) {
			return b.life > 0;
		});
		
		bullets.forEach(function(b) {
			b.loop(function(dt) {
				damagetexts.push(dt);
			});
		});
		
		damagetexts = damagetexts.filter(function(dt) {
			return dt.life > 0;
		});
		
		damagetexts.forEach(function(dt) {
			dt.loop();
		});
		
		dialogboxes = dialogboxes.filter(function(db) {
			return db.timeout > 0;
		});
		
		if (dialogboxes[0]) dialogboxes[0].loop();
		
		if (selunit) {
			offsetx = 320 - selunit.get_x();
			offsety = 160 - selunit.get_y();
		}
	}

	function mouse_down(mx, my) {
		selmenu = battlemenu.mouse_down(mx, my);
		selunit = (selmenu) ? selmenu.unit : null;
	}

	function battle_draw(ctx) {
		map.draw(ctx, offsetx, offsety);
		
		units.forEach(function(u) {
			u.draw(ctx, selunit, offsetx, offsety);
		});
		
		bullets.forEach(function(b) {
			b.draw(ctx, offsetx, offsety);
		});
		
		ctx.save();
		battlemenu.draw(ctx);
		ctx.restore();
		
		ctx.save();
		damagetexts.forEach(function(dt) {
			dt.draw(ctx, offsetx, offsety);
		});
		ctx.restore();
		
		if (dialogboxes[0]) dialogboxes[0].draw(ctx);
	}

	function create_dialog_box(name, color, text) {
		dialogboxes.push(new DialogBox(name, color, text));
	}

	return {
		units: units,
		bullets: bullets,
		damagetexts: damagetexts,
		loop: battle_loop,
		mouse_down: mouse_down,
		draw: battle_draw,
		create_dialog_box: create_dialog_box
	};
}