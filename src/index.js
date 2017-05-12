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

	//----障害物----
	let planet = new createjs.Bitmap('./img/planet.png');
	stage.addChild(planet);
	//中心
	planet.regX = 123;
	planet.regY = 72;
	//表示位置
	planet.x = 150;
	planet.y = 100;
	planet.rotation = -30;

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
	//中心
	shape.regX = 51;//shape.image.width / 2;
	shape.regY = 66;//shape.image.height / 2;
	//初期表示位置
	shape.x = stage.canvas.width / 2;
	shape.y = stage.canvas.height / 2;

	let angle = 0;
	let speed = 0;

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
			speed -= 1;
		} else if(keyCode == 38) {
			//上
			speed += 1;
		}
	}

	createjs.Ticker.addEventListener('tick', handleTick);
	function handleTick() {
		//ブラックホールの回転
		blackhole.rotation +=3;

		//ロケットの角度
		shape.rotation = angle;
		let radian = angle * Math.PI / 180 - 90;
		//ロケットの位置
		let vx = speed * Math.cos(radian);
		let vy = speed * Math.sin(radian);
		shape.x += vx;
		shape.y += vy;
		//スピードの摩擦！
		speed *= 0.90;

		//画面の端に到達した時の処理
		if(shape.x < 0) shape.x = 0;
		if(shape.x > width) shape.x = width;
		if(shape.y < 0) shape.y = 0;
		if(shape.y > height) shape.y = height;

		//衝突イベント
		let bomb = new createjs.Shape();
		//shapeとplanet(planet爆発、shape薄くなる)
		let planetPoint = shape.localToLocal(0, 0, planet);
		let planetHit = planet.hitTest(planetPoint.x, planetPoint.y);
		if(planetHit == true) {
			//当たった時
			let r = 50;
			if(bomb.getStage() == null) {
				bomb.graphics.beginFill('yellow')
					.drawPolyStar(planetPoint.x, planetPoint.y, r, 10, 0.4, -90);
				stage.addChild(bomb);
			} else {
				createjs.Tween.get(bomb).to({r: 100}, 500);
			};
			createjs.Tween.get(shape).to({alpha: 0.2}, 200);
		} else {
			createjs.Tween.get(bomb).to({alpha: 0}, 1000);
			createjs.Tween.get(shape).to({alpha: 1.0}, 200);
		}

		//shapeとblackhole(shapeが吸い込まれる)
		let blackholePoint = shape.localToLocal(0, 0, blackhole);
		let blackholeHit = blackhole.hitTest(blackholePoint.x, blackholePoint.y);
		// console.log(blackholeHit);
		if(blackholeHit == true) {
			createjs.Tween.get(shape).to({scaleX: 0, scaleY: 0}, 1000);
			// console.log('hoge');
		}

		stage.update();
	}

	//スマホ傾き取得
	window.addEventListener('deviceorientation', deviceOrientationHandler);
	let x, y, z;
	function deviceOrientationHandler(event) {
		x = event.beta;
		y = event.gamma;
		z = event.alpha;
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

