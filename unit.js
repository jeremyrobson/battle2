var teamcolors = {
	"user": "rgb(0,255,0)",
	"cpu": "rgb(255,0,0)"
};

function create_name() {
	var vowels = "a,e,i,o,u,y".split(",");
	var consonants = "b,d,f,g,h,j,k,m,n,p,r,s,t,w".split(",");
	var length = randint(2,5) * 2;
	var name = "";
	for (var i=0;i<length;i++)
		name += (i % 2) ? vowels[randint(0,vowels.length)] : consonants[randint(0,consonants.length)];
	name = name.charAt(0).toUpperCase() + name.slice(1,name.length)
	return name;
}

function create_unit(team) {
	var _id = randint(100000,1000000);
	var NAME = create_name();
	var x = randint(0,640);
	var y = randint(0,320);
	var color = teamcolors[team];
	var radians = 0;
	var vel = 0;
	var target = null;
	var protectee = null;
	var range = 50;
	var stats = {
		"hp": {"val": randint(50,100), "max": randint(100,150)},
		"mp": {"val": randint(50,100), "max": randint(100,150)},
		"pwr": {"val": randint(5,20)},
		"def": {"val": randint(0,5)},
		"agl": {"val": randint(2,5)},
		"dex": {"val": randint(5,20)},
		"eva": {"val": randint(0,10)},
		"at": {"val": 0, "max": 1000}
	};

	function get_x() { return x; }
	function get_y() { return y; }

	function unit_loop(map, units, create_bullet, create_dialog_box) {
		if (stats.at.val < 1000)
			stats.at.val += stats.dex.val;
		
		if (target && target.is_alive()) {
			chase_target(target, create_bullet, "attack");
		}
		else if (target && !target.is_alive()) {
			target = null;
			aquire_target(units);
		}
		else if (protectee && protectee.is_alive()) {
			chase_target(protectee, create_bullet, "heal");
			if (protectee.get_stat("hp").val >= protectee.get_stat("hp").max * 2 / 3)
				protectee = null;
		}
		else {
			vel = 0;
			aquire_target(units);
			aquire_protectee(units);
		}
		
		if (protectee && !protectee.is_alive()) {
			create_dialog_box(NAME, color, protectee.NAME + "!! Noooooooo!");
			protectee = null;
		}	
		
		unit_move(map.width, map.height);
	}

	function unit_move(mapwidth, mapheight) {
		x += -Math.cos(radians) * vel;
		y += -Math.sin(radians) * vel;
		if (x < 0) x = 0;
		if (x >= mapwidth) x = mapwidth-1;
		if (y < 0) y = 0;
		if (y >= mapheight) y = mapheight-1;
	}
	
	function unit_draw(ctx, selunit, offsetx, offsety) {
		if (selunit && selunit._id == _id) {
			ctx.fillStyle = "rgba(255,255,0,0.66)";
			ctx.fillRect(x-16+offsetx,y-8+160+offsety,32,24);
		}
		
		var drawcolor = (is_alive()) ? color : "rgb(0,0,0)";
		
		ctx.fillStyle = drawcolor;
		ctx.fillRect(x-8+offsetx, y-24+160+offsety,16,32);
	}
	
	function is_alive() { return stats.hp.val > 0; }
	
	function get_stat(stat) { return stats[stat]; }

	function get_target() { return target; }
	function set_target(unit) {
		target = unit;
	}

	function aquire_target(units) {
		target = find_closest(units, function(u) {
			return team != u.team;
		});
	}

	function aquire_protectee(units) {
		protectee = find_closest(units, function(u) {
			return team == u.team &&
				u.get_stat("hp").val < u.get_stat("hp").max / 2;
		});
	}

	function find_closest(units, condition) {
		var closest_unit = null;
		var closest_distance = Infinity;
		units.filter(function(u) {
			return _id != u._id && condition(u) && u.is_alive();
		}).forEach(function(u) {
			var distance = get_distance(x, y, u.get_x(), u.get_y());
			if (distance < closest_distance) {
				closest_distance = distance;
				closest_unit = u;
			}
		});
		return closest_unit;
	}

	function chase_target(target, create_bullet, bullettype) {
		var tx = target.get_x();
		var ty = target.get_y();
		radians = Math.atan2(y - ty, x - tx);
		var distance = get_distance(x, y, tx, ty);
	
		if (distance > range)
			vel = stats.agl.val;
		if (distance < range && stats.at.val >= stats.at.max) {
			vel = 0;
			create_bullet(new Bullet(bullettype, stats.pwr, x, y, target));
			stats.at.val = 0;
		}
		if (distance < range / 7) { //back away, not today!
			vel = -stats.agl.val / 4;
		}
	}

	function apply_damage(damage, damagetype) {
		if (damagetype == "attack")
			stats.hp.val -= damage;
		else
			stats.hp.val += damage;
		if (stats.hp.val < 0) stats.hp.val = 0;
		if (stats.hp.val > stats.hp.max) stats.hp.val = stats.hp.max;
	}

	return {
		_id: _id,
		NAME: NAME,
		team: team,
		color: color,
		get_x: get_x,
		get_y: get_y,
		get_stat: get_stat,
		is_alive: is_alive,
		set_target: set_target,
		get_target: get_target,
		apply_damage: apply_damage,
		loop: unit_loop,
		draw: unit_draw
	};
}

function create_party(team) {
	var units = [];
	for (var i=0;i<4;i++)
		units.push(create_unit(team));
	
	return {
		team: team,
		units: units
	};
}