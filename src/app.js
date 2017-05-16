window.addEventListener('load', init);

//描画
function init() {
	
	//canvas描画
	let width = window.innerWidth;
	let height = window.innerHeight;
	let stage = new createjs.Stage('myCanvas');
	stage.canvas.setAttribute('width', width);
	stage.canvas.setAttribute('height', height);

	
	let starList = [];

	for(let i = 0; i < 600; i++) {
		let color = 360 * Math.random();
		let starColor = 'hsl(' + color + ', 100%, 50%';
		let star = new createjs.Shape();
		star.graphics.beginFill(starColor)
			.drawPolyStar(0, 0, 6 * Math.random(), 4, 0.6, -90);

		stage.addChild(star);
		star.x = width * Math.random();
		star.y = height * Math.random();
		starList[i] = star;
	}

	//スタート
	let start = new createjs.Bitmap('./img/start.png');
	stage.addChild(start);

	start.x = width - 200;
	start.y = 500;

	let flag2 = new createjs.Bitmap('./img/flag2.png');
	stage.addChild(flag2);

	flag2.x = width - 100;
	flag2.y = 450;

	//----ゴール----
	let planet = new createjs.Bitmap('./img/planet.png');
	stage.addChild(planet);
	
	planet.regX = 123 + 30;
	planet.regY = 72 + 30;
	
	planet.x = 150;
	planet.y = 200;
	planet.rotation = -30;

	let flag = new createjs.Bitmap('./img/flag.png');
	stage.addChild(flag);

	flag.x = 130;
	flag.y = 60;

	//----ブラックホール----
	let blackhole = new createjs.Bitmap('./img/blackhole.png');
	stage.addChild(blackhole);
	//中心
	blackhole.regX = 101;
	blackhole.regY = 102;
	//表示位置
	blackhole.x = 200;
	blackhole.y = 500;
	blackhole.rotation = 90;

	//----ロケット（描いてもらうもの）----
	let shape = new createjs.Bitmap('./img/rocket2.png');
	stage.addChild(shape);

	shape.scaleX = 0.1;
	shape.scaleY = 0.1;

	createjs.Tween.get(shape).to({scaleX: 1.0, scaleY: 1.0}, 1500);
	//中心
	shape.regX = 51;//shape.image.width / 2;
	shape.regY = 66;//shape.image.height / 2;
	//初期表示位置
	shape.x = width - 150;
	shape.y = 550;

	let angle = -35;
	let speed = 0;
	//ロケットHP
	let shapeHP = 1.0;
	shape.alpha = shapeHP;

	//障害物（宇宙人）
	let aliens = [];
	let numAliens = 4;
	function initialize() {
		createAlien(numAliens);
		stage.update();
	}

	function createAlien() {
		for(let j = 0; j < numAliens; j++) {
			let x = (850 - 350) * Math.random() + 350;
			let y = 150 * (j + 1);

			let obstacle = new Alien(x, y);
			aliens.push(obstacle);
			stage.addChild(obstacle);
		}
		return aliens;
	}

	function Alien(x, y) {
		this.x = x;
		this.y = y;
	}
	Alien.prototype = new createjs.Bitmap('./img/alien.png');

	initialize();

	//キーボードでロケット操作
	window.addEventListener('keydown', handleKeyDown);
	function handleKeyDown(event) {
		let keyCode = event.keyCode;
		
		if(keyCode == 39) {
			//右
			angle += 5;
		} else if(keyCode == 37) {
			//左
			angle -= 5;
		}

		if(keyCode == 40) {
			//下
			speed -= 2;
		} else if(keyCode == 38) {
			//上
			speed += 2;
		}
	}

	createjs.Ticker.addEventListener('tick', handleTick);
	//フラグ
	let isAttacked = false;
	function handleTick() {
		//ブラックホールの回転
		blackhole.rotation +=3;
		shape.rotation = angle;
		//ロケットの角度
		let radian = angle * Math.PI / 180 - 90;
		//ロケットの位置
		let vx = speed * Math.cos(radian);
		let vy = speed * Math.sin(radian);
		shape.x += vx;
		shape.y += vy;
		//スピードの摩擦
		speed *= 0.90;

		//画面の端に到達した時の処理
		if(shape.x < 0) shape.x = 0;
		if(shape.x > width) shape.x = width;
		if(shape.y < 0) shape.y = 0;
		if(shape.y > height) shape.y = height;

		attackPlanet();
		attackBlackhole();
		attackAlien();

		stage.update();
	}

	//衝突イベント
	//shapeとplanet(planet爆発、shape薄くなる。ゴールなので変更するかも)
	let attackPlanet = function() {
		let bomb = new createjs.Shape();
		let planetPoint = shape.localToLocal(123, 72, planet);
		let planetHit = planet.hitTest(planetPoint.x, planetPoint.y);
		if(planetHit == true) {
			//当たった時
			let r = 100;
			bomb.graphics.beginFill('yellow')
				.drawPolyStar(planetPoint.x, planetPoint.y, r, 10, 0.4, -90);
			stage.addChild(bomb);
			createjs.Tween.get(shape).to({alpha: 0.2}, 200);
		} else {
			stage.removeChild(bomb);
			createjs.Tween.get(shape).to({alpha: 1.0}, 200);
		}
	}
	
	//shapeとblackhole(shapeが吸い込まれる)
	let attackBlackhole = function() {
		let blackholePoint = shape.localToLocal(101, 102, blackhole);
		let blackholeHit = blackhole.hitTest(blackholePoint.x, blackholePoint.y);
		
		if(blackholeHit == true) {
			createjs.Tween.get(shape).to({scaleX: 0, scaleY: 0}, 1000);
		}
		if(shape.scaleX == 0) {
			stage.removeChild(shape);
		}
	}
	
	//shapeとalien（ぶつかるとshapeが薄くなる）
	let attackAlien = function() {
		for(let k = 0; k < aliens.length; k++) {
			let alien = aliens[k];
			let alienPoint = alien.localToLocal(0, 0, shape);
			let alienHit = alien.hitTest(alienPoint.x, alienPoint.y);

			if(alienHit == true) {
				shapeHP = -0.2;
				createjs.Tween.get(shape).to({alpha: shapeHP});
			}
		}
	}
	

	//スマホ傾き取得
	window.addEventListener('deviceorientation', deviceOrientationHandler);
	let x, y, z;
	function deviceOrientationHandler(event) {
		x = ~~event.beta;	//縦に持って床と水平が0　0〜360
		y = ~~event.gamma;	//縦に持って床と垂直が0
		z = ~~event.alpha;
		let html = '';
		html += 'X: ' + x + '<br>';
		html += 'Y: ' + y + '<br>';
		html += 'Z: ' + z + '<br>';

		if(y < 0) {
			//画面の右にいく
			shape.x += 1;	//sp
		} else if(y > 0) {
			//画面の左にいく
			shape.x -= 1;	//sp
		}

		if(x < 0) {
			//画面の上にいく
			shape.y -= 1;	//sp
		} else if(x > 0) {
			//画面の下にいく
			shape.y += 1;	//sp
		};

		document.querySelector('#debug').innerHTML = html;
	}
}

