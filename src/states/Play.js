import Matrix from '../Matrix';

class Play extends Phaser.State {
	create() {
		const SIDE_MARGIN = this.world.width / 7,
			  BOTTOM_MARGIN = (this.world.height - this.game.scoreBoard.bottom) / 10,
			  GEM_SIZE = 100, // in pixels
			  TIME = 60, // in seconds
			  COLS = Math.floor((this.world.width - SIDE_MARGIN * 2) / GEM_SIZE),
			  ROWS = Math.floor((this.world.height - this.game.scoreBoard.bottom - BOTTOM_MARGIN * 1.3) / GEM_SIZE),
			  WALL_LEFT = (this.world.width - (COLS * GEM_SIZE)) / 2,
			  WALL_RIGHT = this.world.width - WALL_LEFT,
			  WALL_BOTTOM = this.world.height - BOTTOM_MARGIN,
			  SCORE_TEXT_HEIGHT = this.game.scoreBoard.height / 7 * 3,
			  SCOTE_TEXT_MARGIN_TOP = this.game.scoreBoard.height / 3,
			  TIME_BOARD_MAX_HEIGHT = this.world.height / window.devicePixelRatio / 9,
			  TIME_BOARD_MARGIN = .1,
			  TEXT_TIME_UP_MAX_HEIGHT = this.world.height / window.devicePixelRatio / 8;


		const gemID = () => {
			let id = 0;

			return () => {
				return ++id;
			}
		}


		// make some variables global
		this.MATRIX = new Matrix(COLS, ROWS, this);
		this.game.SCORE = 0;
		this.game.TIME = TIME;
		this.game.GEM_SIZE = GEM_SIZE;
		this.game.COLS = COLS;
		this.game.ROWS = ROWS;
		this.game.WALL_LEFT = WALL_LEFT;
		this.game.WALL_BOTTOM = WALL_BOTTOM;
		this.game.getGemID = gemID();
		this.game.gemsOverlap = false;
		this.game.updateScore = this.updateScore;
		this.game.rollDonut = false;
		this.game.shiftUpTimeBoard = false;
		this.game.shiftUpScoreBoard = false;
		this.game.moveDownTextTimeUp = false;
		this.game.moveDownTextGameOver = false;
		this.game.IS_GAME_OVER = false;
		this.game.BIAS = 30;
		this.game.logoIsOpened = false;
		this.game.btnPlayIsOpened = false;
		this.game.SHADOW_MARGIN = 4;
		this.game.notRotateNumbers = ['7', '8', '9', 'a', 'b']; // gem numbers, that we CAN'T rotate
		this.game.doublePoints = false;
		this.game.isExploading = false;


		// SHADOWS GROUP
		this.game.shadowsGroup = this.game.add.group();


		// GEMS GROUP
		const gemsGroup = this.game.gemsGroup = this.game.add.physicsGroup(Phaser.Physics.ARCADE);
		gemsGroup.enableBody = true;



		this.MATRIX.generateMatrix();
		this.renderGems();
		this.countdownToHint();



		// TIME BOARD
		const timeBoard = this.game.timeBoard = this.game.add.sprite(0, 0, 'time-board');
		if (timeBoard.height > TIME_BOARD_MAX_HEIGHT) {
			const timeBoardScale = TIME_BOARD_MAX_HEIGHT / timeBoard.height;
			timeBoard.scale.setTo(timeBoardScale);
		}
		timeBoard.angle = .5;
		timeBoard.anchor.setTo(.5);
		timeBoard.left = timeBoard.width * TIME_BOARD_MARGIN;
		timeBoard.bottom = 0;
		// physics
		this.game.physics.arcade.enable(timeBoard);
		timeBoard.body.gravity.y = 2000;
		timeBoard.body.bounce.y = .2;


		// FLOOR FOR TIME BOARD
		const floorForTimeBoard = this.game.floorForTimeBoard = this.game.add.sprite(timeBoard.width / 2,
			timeBoard.height + timeBoard.height * TIME_BOARD_MARGIN,
			'transparent');
		// physics
		this.game.physics.arcade.enable(floorForTimeBoard);
		floorForTimeBoard.body.immovable = true;


		// TIMER TEXT
		const timerText = this.game.timerText = this.game.add.text(0, 0, this.formatTime(this.game.TIME));
		timerText.font = 'Fredoka One';
		timerText.fontSize = timeBoard.height / 2 * window.devicePixelRatio;
		timerText.align = 'center';
		timerText.fill = '#fff';
		timerText.anchor.setTo(.5);
		timeBoard.addChild(timerText);


		// TEXT TIME UP
		const textTimeUp = this.game.textTimeUp = this.game.add.sprite(this.world.centerX, 0, 'text-timeup');
		textTimeUp.anchor.setTo(.5, 1);
		textTimeUp.y = 0;
		if (textTimeUp.height > TEXT_TIME_UP_MAX_HEIGHT) {
			this.game.TEXT_TIME_UP_SCALE = TEXT_TIME_UP_MAX_HEIGHT / textTimeUp.height;
			textTimeUp.scale.setTo(this.game.TEXT_TIME_UP_SCALE);
		}
		// physics
		this.game.physics.arcade.enable(textTimeUp);
		textTimeUp.body.gravity.y = 2000;
		textTimeUp.body.bounce.y = .2;
		textTimeUp.body.allowGravity = false;


		// FLOOR FOR TEXT TIME UP
		const floorForTextTimeUp = this.game.floorForTextTimeUp = this.game.add.sprite(this.world.centerX, this.world.height * .75, 'transparent');
		// physics
		this.game.physics.arcade.enable(floorForTextTimeUp);
		floorForTextTimeUp.body.immovable = true;


		// 'GAME OVER' text
		const textGameOver = this.game.textGameOver = this.game.add.text(this.world.centerX, 0, 'GAME OVER');
		textGameOver.font = 'Fredoka One';
		textGameOver.fontSize = this.world.height / window.devicePixelRatio / 11;
		textGameOver.fill = '#ff5050';
		textGameOver.align = 'center';
		textGameOver.anchor.setTo(.5, 1);
		textGameOver.stroke = '#fff';
		textGameOver.strokeThickness = this.world.height / window.devicePixelRatio * .03;
		textGameOver.setShadow(2, this.world.height / window.devicePixelRatio * .01, 'rgba(78, 46, 90, .6)', 2, true, false);
		this.game.physics.arcade.enable(textGameOver);
		textGameOver.body.gravity.y = 2000;
		textGameOver.body.bounce.y = .2;
		textGameOver.body.allowGravity = false;


		// FLOOR FOR 'GAME OVER' text
		const floorForTextGameOver = this.game.floorForTextGameOver = this.game.add.sprite(this.world.centerX, this.world.height * .75, 'transparent');
		// physics
		this.game.physics.arcade.enable(floorForTextGameOver);
		floorForTextGameOver.body.immovable = true;


		// SOUND KILL
		this.game.soundKill = this.game.sound.add('kill');
		this.game.soundKill.volume = .5;
		this.game.soundKill.loop = false;


		this.game.gameTimer = this.game.time.events.loop(Phaser.Timer.SECOND, this.updateTime, this);
		this.game.rotateGemsLoop = this.game.time.events.loop(Phaser.Timer.SECOND * 8, this.rotateGems, this);
	}


	update() {
		this.game.physics.arcade.collide(this.game.scoreBoard, this.game.floorForScoreBoard);
		this.game.physics.arcade.collide(this.game.timeBoard, this.game.floorForTimeBoard);

		// for not checking for overlapping after game is over
		if (!this.game.IS_GAME_OVER) {
			// if already overlapped, then don't check second time
			if (!this.game.gemsOverlap) {
				this.game.physics.arcade.overlap(this.game.gemsGroup, this.game.gemsGroup, null, this.onGemsOverlap, this);
			}
		}


		// move down 'Time Up' text
		if (!this.game.moveDownTextTimeUp) {
			this.game.physics.arcade.collide(this.game.textTimeUp, this.game.floorForTextTimeUp);
		}
		

		// BIG DONUT ANIMATION
		if (this.game.rollDonut) {
			this.game.bigDonut.x += 30 / window.devicePixelRatio;
			this.game.bigDonut.angle += 4;
			this.game.donutShadow.x += 30 / window.devicePixelRatio;
		}

		// donut is on center
		if (this.game.bigDonut.x > this.world.centerX - this.game.BIAS
			&& this.game.bigDonut.x < this.world.centerX + this.game.BIAS) {
			this.clearScreen();
		}

		// donut is behind the screen
		if (this.game.bigDonut.x >= this.world.width + this.game.bigDonut.width) {
			this.gotoMainMenu();
		}

		// shift time board
		if (this.game.shiftUpTimeBoard && this.game.timeBoard.bottom > 0) {
			this.game.timeBoard.y -= 5;
		}

		// shift score board
		if (this.game.shiftUpScoreBoard && this.game.scoreBoard.bottom > 0) {
			this.game.scoreBoard.y -= 5;
		}

		if (this.game.IS_GAME_OVER && !this.game.moveDownTextGameOver) {
			this.game.physics.arcade.collide(this.game.textGameOver, this.game.floorForTextGameOver);
		}
	}


	renderGems() {
		if (this.game.IS_GAME_OVER) return;

		const MATRIX = this.MATRIX.getMatrix();

		MATRIX.forEach((colArr, colIndex) => {
			colArr.forEach((gemData, cellIndex) => {
				// if we already have gem with this ID (name)
				if (this.game.gemsGroup.getByName(gemData.id)) return;

				this.createGem(colIndex, cellIndex, gemData.id, gemData.number);
			});
		});

		return new Promise(resolve => {
			setTimeout(() => {
				resolve();
			}, 250);
		});
	}


	createGem(col, cell, gemID, gemNumber) {
		const gemPosition = this.getGemPositionByCell({col, cell});

		// SHADOW
		const shadow = this.game.shadowsGroup.create(0, 0, 'gem-shadow');
		shadow.alpha = .9;
		shadow.anchor.setTo(.5);
		shadow.name = gemID;
		shadow.left = gemPosition.x - this.game.SHADOW_MARGIN;
		shadow.top = gemPosition.y - this.game.SHADOW_MARGIN;
		shadow.scale.setTo(.1);
		this.game.add.tween(shadow.scale).to({x: 1, y: 1}, 200, Phaser.Easing.Back.Out, true);

		const isBonusGem = (this.game.notRotateNumbers.indexOf('' + gemNumber) !== -1) ? true : false;

		const gemAngle = (!isBonusGem) ? Math.floor(Math.random() * 360) : 0;

		// GEM
		const gem = this.game.gemsGroup.create(0, 0, 'gem-' + gemNumber);
		gem.name = gemID;
		gem.anchor.setTo(.5);
		gem.left = gemPosition.x;
		gem.top = gemPosition.y;
		gem.scale.setTo(.1);
		gem.angle = gemAngle;
		gem.inputEnabled = true;
		gem.input.enableDrag(false);

		this.game.add.tween(gem.scale).to({x: 1, y: 1}, 200, Phaser.Easing.Back.Out, true);
		gem.events.onDragStart.add(this.onDragStart, this);
		gem.events.onDragStop.add(this.onDragStop, this);

		return gem;
	}


	onDragStart(gem, pointer) {
		this.game.dragDirection = null;
		this.game.dragStartPosX = pointer.clientX;
		this.game.dragStartPosY = pointer.clientY;
		gem.events.onDragUpdate.add(this.onDragUpdate, this);
	}


	onDragUpdate(gem, pointer) {
		const shadow = this.game.shadowsGroup.getByName(gem.name);
		shadow.left = gem.left - this.game.SHADOW_MARGIN;
		shadow.top = gem.top - this.game.SHADOW_MARGIN;

		if (!this.game.dragDirection) {
			this.getDragDirection(gem, pointer);
		}
		
		this.checkDragDistance(gem, pointer);
	}


	onDragStop(gem) {
		// if stopped dragging not overlapped next gem
		if (!this.game.gemsOverlap) {
			const gemCell = this.MATRIX.getGemCell(gem.name);
			const gemPosition = this.getGemPositionByCell(gemCell);

			this.moveToXY(gem, gemPosition.x, gemPosition.y);
		}

		gem.events.onDragUpdate.removeAll();
	}


	getDragDirection(gem, pointer) {
		const left = Math.abs(pointer.clientX - this.game.dragStartPosX);
		const top = Math.abs(pointer.clientY - this.game.dragStartPosY);

		if (left !== top) {
			if (left > top){
				gem.input.allowVerticalDrag = false;
				gem.input.allowHorizontalDrag = true;
				this.game.dragDirection = 'hor';

			} else {
				gem.input.allowHorizontalDrag = false;
				gem.input.allowVerticalDrag = true;
				this.game.dragDirection = 'ver';
			}
		}
	}

	// to prevent throwing the gem out
	checkDragDistance(gem, pointer) {
		const left = Math.abs(pointer.clientX - this.game.dragStartPosX);
		const top = Math.abs(pointer.clientY - this.game.dragStartPosY);

		if (this.game.dragDirection === 'hor') {
			if (left >= this.game.GEM_SIZE) {
				gem.input.allowHorizontalDrag = false;
			} else {
				gem.input.allowHorizontalDrag = true;
			}

		} else if (this.game.dragDirection === 'ver') {
			if (top >= this.game.GEM_SIZE) {
				gem.input.allowVerticalDrag = false;
			} else {
				gem.input.allowVerticalDrag = true;
			}
		}		
	}


	async onGemsOverlap(gem1, gem2) {
		// to prevent second call
		if (this.game.gemsOverlap) return;

		this.game.gemsOverlap = true;
		gem1.input.disableDrag();

		try {
			await this.swapGems(gem1, gem2);

			if (await this.checkForMatches() === false) {
				// swap gems back
				this.game.gemsOverlap = true;
				gem1.input.disableDrag();
				this.swapGems(gem1, gem2);
			}
		} catch (e) {
			console.log(e);
		}	
	}


	async swapGems(gem1, gem2) {
		// FIRST GEM
		const gem1Cell = this.MATRIX.getGemCell(gem1.name);

		const gem1Position = this.getGemPositionByCell(gem1Cell);
		this.moveToXY(gem2, gem1Position.x, gem1Position.y);

		// SECOND GEM
		const gem2Cell = this.MATRIX.getGemCell(gem2.name);
		
		const gem2Position = this.getGemPositionByCell(gem2Cell);
		await this.moveToXY(gem1, gem2Position.x, gem2Position.y);

		this.MATRIX.swapGems(gem1.name, gem2.name);

		gem1.input.enableDrag(false);
		gem2.input.enableDrag(false);
	}


	async checkForMatches() {
		const matchedIDs = this.MATRIX.checkForMatches();

		if (matchedIDs) {
			this.game.gemsOverlap = true; // TRUE to prevent listening for overlapping
			this.game.gemsGroup.setAll('inputEnabled', false);
			this.calculatePoints(this.MATRIX.getMatchedIDsArrays());
			this.game.isExploading = true;
			this.MATRIX.removeMatchedGems();
			try {
				await this.explodeGems(matchedIDs);
			} catch (e) {
				console.log(e);
			}
			await this.moveDownRestGems();
			this.MATRIX.addNewGems();
			await this.renderGems();
			this.countdownToHint();
			this.checkForMatches();
			return true;
		} else {
			// no more matches
			if (!this.MATRIX.checkForPosibles()) {
				this.game.time.events.add(Phaser.Timer.SECOND * 3,
					() => { this.gameOver('no-turns'); }, 
					this);
				return false;
			}

			this.game.gemsGroup.setAll('inputEnabled', true);
			this.game.isExploading = false;
			this.countdownToHint();
			return false;
		}
	}


	moveToXY(gemToMove, newX, newY) {
		const START_TIME = performance.now(),
			  DURATION = 200,
			  START_X = gemToMove.left,
			  START_Y = gemToMove.top,
			  leftDist = newX - START_X,
			  topDist = newY - START_Y;

		const shadowToMove = this.game.shadowsGroup.getByName(gemToMove.name);

		return new Promise(resolve => {
			let progress = 0;

			const move = curTime => {
				progress = (curTime - START_TIME) / DURATION;

				if (progress >= 1) {
					// MOVING IS FINISHED
					progress = 1;
					this.game.gemsOverlap = false;
					resolve();
				}

				gemToMove.left = START_X + (leftDist * progress);
				gemToMove.top = START_Y + (topDist * progress);

				shadowToMove.left = START_X + (leftDist * progress) - this.game.SHADOW_MARGIN;
				shadowToMove.top = START_Y + (topDist * progress) - this.game.SHADOW_MARGIN;

				if (progress < 1) {
					requestAnimationFrame(move);
				}
			}

			requestAnimationFrame(move);
		});
	}


	getGemPositionByCell(cell) {
		return {
			x: this.game.WALL_LEFT + cell.col * this.game.GEM_SIZE,
			y: this.game.WALL_BOTTOM - cell.cell * this.game.GEM_SIZE - this.game.GEM_SIZE
		};
	}


	moveDownRestGems() {
		this.game.gemsGroup.forEach(gem => {
			this.moveToMatrixPosition(gem);
		});

		return new Promise(resolve => {
			setTimeout(() => {
				resolve()
			}, 200);
		});
		
	}


	moveToMatrixPosition(gem) {
		const gemCell = this.MATRIX.getGemCell(gem.name);

		const gemX = this.game.WALL_LEFT + gemCell.col * this.game.GEM_SIZE;
		const gemY = this.game.WALL_BOTTOM - gemCell.cell * this.game.GEM_SIZE - this.game.GEM_SIZE;

		this.moveToXY(gem, gemX, gemY);
	}


	calculatePoints(matchedIDsArrays) {
		const NUM_OF_GROUPS_FOR_BONUS = 1;
		const TIME_TO_ADD = 10; // in seconds
		const numberOfGroups = matchedIDsArrays.length;

		matchedIDsArrays.forEach(group => {
			this.checkForTimeOrDouble(group);
			this.addPoints(group);
			this.addTime((group.length - 3) * TIME_TO_ADD, group);
		});

		if (numberOfGroups === NUM_OF_GROUPS_FOR_BONUS) {
			this.MATRIX.getBonus = true;
		}

		this.addTime((numberOfGroups - 1) * TIME_TO_ADD);
	}


	addPoints(group) {
		const numberOfGemsInGroup = group.length;
		let points;

		switch (numberOfGemsInGroup) {
			case 3:
				points = 10;
				break;
			case 4:
				points = 15;
				break;
			case 5:
				points = 25;
				break;
			case 6:
				points = 40;
				break;
			case 7:
				points = 70;
				break;
			case 8:
				points = 100;
				break;
		}

		let pointsToAdd = numberOfGemsInGroup * points;

		if (this.game.doublePoints) {
			pointsToAdd *= 2;
			this.game.doublePoints = false;
		}

		this.updateScore(pointsToAdd);
		this.showAddedPoints(group, pointsToAdd);
	}


	addTime(secondsToAdd, group) {
		if (secondsToAdd === 0) return;

		const curSeconds = this.game.TIME,
			   newSeconds = curSeconds + secondsToAdd,
			   distance = newSeconds - curSeconds,
			   DURATION = 200;

		const startTime = performance.now();
		let progress = 0, newNumber;

		const animate = curTime => {
			progress = (curTime - startTime) / DURATION;
			if (progress > 1) progress = 1;

			newNumber = Math.floor(distance * progress);

			this.game.timerText.text = this.formatTime(curSeconds + newNumber);

			if (progress < 1) {
				requestAnimationFrame(animate);
			}
		}

		requestAnimationFrame(animate);

		this.game.TIME += secondsToAdd;

		this.showAddedSeconds(group, secondsToAdd);
	}


	showAddedPoints(group, pointsToAdd) {
		const textPosition = this.getTextToShowPosition(group);
		this.showAddedText(textPosition, pointsToAdd);
	}


	showAddedSeconds(group, secondsToAdd) {
		let textPosition;

		if (group) {
			textPosition = this.getTextToShowPosition(group);
		} else {
			textPosition = {
				x: this.world.centerX,
				y: this.world.centerY
			};
		}

		this.showAddedText(textPosition, secondsToAdd + 's');
	}


	showAddedText(textPosition, textToShow) {
		const GEM_SIZE = this.game.GEM_SIZE;
		const text = this.game.add.text(
			textPosition.x,
			textPosition.y, '+' + textToShow);

		if (textToShow.toString().indexOf('s') !== -1) {
			// this is text for seconds
			// so show it a littile aside
			text.x += text.width;
			text.y += text.height;
		}

		text.fill = '#fff';
		text.font = 'Fredoka One';
		text.fontSize = this.game.scoreBoard.height / 3;
		text.anchor.setTo(.5);
		text.scale.setTo(.3);
		text.alpha = 0;
		text.setShadow(GEM_SIZE * .02, GEM_SIZE * .04, 'rgba(78, 46, 90, .6)');
		const scaleTween = this.game.add.tween(text.scale).to({x: 1, y: 1}, 300, Phaser.Easing.Back.Out, true);
		this.game.add.tween(text).to({y: text.y - GEM_SIZE / 2}, 500, Phaser.Easing.Circular.Out, true);
		this.game.add.tween(text).to({alpha: 1}, 100, Phaser.Easing.Linear.None, true);

		scaleTween.onComplete.add(() => {
			const fadeOutTween = this.game.add.tween(text).to({alpha: 0}, 300, Phaser.Easing.Linear.None, true);
			fadeOutTween.onComplete.add(() => {
				text.destroy();
			});
		}, this);
	}


	getTextToShowPosition(group) {
		// 1. find position of the first and the last gem in group
		// 2. get center position

		// 1st step
		const firstGemID = group[0];
		const lastGemID = group[group.length - 1];
		const firstGemCell = this.MATRIX.getGemCell(firstGemID);
		const lastGemCell = this.MATRIX.getGemCell(lastGemID);
		const firstGemPosition = this.getGemPositionByCell(firstGemCell);
		const lastGemPosition = this.getGemPositionByCell(lastGemCell);

		// 2nd step
		const distanceX = Math.max(firstGemPosition.x, lastGemPosition.x) - Math.min(firstGemPosition.x, lastGemPosition.x);
		const textX = Math.min(firstGemPosition.x, lastGemPosition.x) + distanceX / 2;

		const distanceY = Math.max(firstGemPosition.y, lastGemPosition.y) - Math.min(firstGemPosition.y, lastGemPosition.y);
		const textY = Math.min(firstGemPosition.y, lastGemPosition.y) + distanceY / 2;

		return {
			x: textX + this.game.GEM_SIZE / 2,
			y: textY + this.game.GEM_SIZE / 2
		};
	}


	checkForTimeOrDouble(groupOfIDs) {
		groupOfIDs.forEach(id => {
			const gemNumber = this.MATRIX.getGemDataByID(id).number;
			if (gemNumber === 'a') this.addTime(5);
			if (gemNumber === 'b') this.game.doublePoints = true;
		});
	}


	explodeGems(matchedIDs) {
		return new Promise(resolve => {
			const destroy = (gem, shadow) => {
				gem.destroy();
				shadow.destroy();
				resolve();
			}

			const showParticles = (emitter, emitterExp) => {
				emitter.start(true, 500, null, 4);
				emitterExp.start(true, 500, null, 3);
			}

			matchedIDs.forEach(id => {
				const gem = this.game.gemsGroup.getByName(id);
				const gemNumber = gem.key.split('-')[1];
				let particleNumber;

				// if 'a' or 'b' or more than 5
				if (isNaN(gemNumber) || gemNumber > 5) {
					particleNumber = 4;
				} else {
					particleNumber = gemNumber;
				}

				const shadow = this.game.shadowsGroup.getByName(id);


				const emitter = this.game.add.emitter(gem.x, gem.y, 6);
				const emitterScale = .5 + Math.ceil(Math.random() * 5) / 10;
				emitter.makeParticles('particle-' + particleNumber);
				emitter.setAlpha(.9, 0, 400, Phaser.Easing.Linear.None);
				emitter.gravity = 20;
				emitter.setScale(emitterScale, 0, emitterScale, 0, 500, Phaser.Easing.Linear.None);
				emitter.setXSpeed(-100, 100);
				emitter.setYSpeed(-100, 100);
				emitter.blendMode = Phaser.blendModes.OVERLAY;
				

				const emitterExp = this.game.add.emitter(gem.x, gem.y, 3);
				emitterExp.makeParticles(['particle_ex-1', 'particle_ex-2', 'particle_ex-3']);
				emitterExp.setAlpha(.9, 0, 400, Phaser.Easing.Linear.None);
				emitterExp.gravity = 20;
				emitterExp.setScale(.9, 0, .9, 0, 500, Phaser.Easing.Linear.None);
				emitterExp.setXSpeed(-100, 100);
				emitterExp.setYSpeed(-100, 100);
				emitterExp.blendMode = Phaser.blendModes.OVERLAY;
				

				// FADING OUT TWEEN
				this.game.add.tween(gem).to({alpha: 0}, 120, Phaser.Easing.Linear.None, true);
				const scaleOutTween = this.game.add.tween(gem.scale).to({x: 0, y: 0}, 120, Phaser.Easing.Back.In, true);

				this.game.add.tween(shadow).to({alpha: 0}, 120, Phaser.Easing.Linear.None, true);
				this.game.add.tween(shadow.scale).to({x: 0, y: 0}, 120, Phaser.Easing.Back.In, true);



				scaleOutTween.onComplete.add(() => {
					showParticles(emitter, emitterExp);
				}, this);

				this.game.time.events.add(300, () => { // 300 ms
					destroy(gem, shadow);
				}, this);

				this.game.soundKill.play();

			});
		});
	}


	updateScore(numberToAdd) {
		const curScore = this.game.SCORE,
			  newScore = curScore + numberToAdd,
			  distance = newScore - curScore,
			  DURATION = 200;

		const startTime = performance.now();
		let progress = 0, newNumber;

		const animate = curTime => {
			progress = (curTime - startTime) / DURATION;
			if (progress > 1) progress = 1;

			newNumber = Math.ceil(distance * progress);

			this.game.scoreText.text = this.formatScore(curScore + newNumber);

			if (progress < 1) {
				requestAnimationFrame(animate);
			}
		}

		requestAnimationFrame(animate);

		this.game.SCORE += numberToAdd;
	}


	jumpScoreText() {
		const scoreText = this.game.scoreText;

		this.game.add.tween(scoreText).to({y: scoreText.x - scoreText.height * .1}, 60, Phaser.Easing.Linear.None, true, 0, 0, true);
		this.game.add.tween(scoreText.scale).to({x: 1.2, y: 1.2}, 60, Phaser.Easing.Linear.None, true, 0, 0, true);
	}


	formatTime(secs) {
		const minutes = Math.floor(secs / 60);
		const seconds = secs % 60;

		const mm = (minutes < 10) ? '0' + minutes : minutes;
		const ss = (seconds < 10) ? '0' + seconds : seconds;
			
		return mm + ':' + ss;
	}


	formatScore(number) {
		// Rule of formatting: 25,234
		if (number < 1000) return number;

		const reverse = number.toString().split('').reverse().join('');
		const withCommas = reverse.match(/\d{1,3}/g).join(',');
		const result = withCommas.split('').reverse().join('');
		
		return result;
	}


	rotateGems() {
		this.game.gemsGroup.forEach(gem => {
			const curAngle = gem.angle;
			const newAngle = curAngle + Math.ceil(Math.random() * 40) - 20;
			const gemNumber = gem.key.split('-')[1];

			// if it's not a bonus gem
			if (this.game.notRotateNumbers.indexOf(gemNumber) === -1) {
				this.game.add.tween(gem).to({angle: newAngle}, 500, Phaser.Easing.Bounce.Out, true);
			}
		});
	}


	updateTime() {
		const timerText = this.game.timerText;
		timerText.alpha = 1;

		if (this.game.TIME > 0) {
			this.game.TIME -= 1;
		}

		if (this.game.TIME === 0) {
			// wait until all explosions end
			if (this.game.isExploading) return;
			this.gameOver('time-up');
		}

		// fill timer text with another color
		if (this.game.TIME <= 10) {
			timerText.fill = '#ff5106';

			if (this.game.TIME <= 5 && this.game.TIME > 0) {
				this.blinkTimerText();
			}

		} else {
			timerText.fill = '#fff';
		}

		timerText.text = this.formatTime(this.game.TIME);
	}


	gameOver(why) {
		this.game.time.events.remove(this.game.gameTimer);
		this.game.IS_GAME_OVER = true;
		this.saveHighestScore();

		if (why === 'time-up') {
			this.game.textTimeUp.body.allowGravity = true;
			this.game.time.events.add(Phaser.Timer.SECOND * 2, this.moveDownTextTimeUp, this);
			this.explodeAllGems();

		} else if (why === 'no-turns') {
			this.game.textGameOver.body.allowGravity = true;
			this.game.time.events.remove(this.game.rotateGemsLoop);
			this.game.time.events.add(Phaser.Timer.SECOND, this.explodeAllGems, this);
			this.game.time.events.add(Phaser.Timer.SECOND * 2, this.moveDownTextGameOver, this);
		}
		
		this.game.time.events.add(Phaser.Timer.SECOND * 2, this.shiftUpTimeBoard, this);
		this.game.time.events.add(Phaser.Timer.SECOND * 2.1, this.shiftUpScoreBoard, this);
		this.game.time.events.add(Phaser.Timer.SECOND * 2.2, this.showUserScore, this);
	}


	saveHighestScore() {
		const prevHighestScore = window.localStorage.getItem('highestScore');
		if (!prevHighestScore) {
			window.localStorage.setItem('highestScore', this.game.SCORE);
		} else {
			if (prevHighestScore < this.game.SCORE) {
				window.localStorage.setItem('highestScore', this.game.SCORE);
			}
		}
	}


	explodeAllGems() {
		const allIDs = [];
		this.game.gemsGroup.forEach(gem => {
			gem.input.disableDrag();
			allIDs.push(gem.name);
		});
		this.explodeGems(allIDs);
	}


	shiftUpTimeBoard() {
		this.game.timeBoard.body.allowGravity = false;
		this.game.shiftUpTimeBoard = true;
	}


	shiftUpScoreBoard() {
		this.game.scoreBoard.body.allowGravity = false;
		this.game.shiftUpScoreBoard = true;
	}


	moveDownTextTimeUp() {
		this.game.moveDownTextTimeUp = true;
	}


	moveDownTextGameOver() {
		this.game.moveDownTextGameOver = true;
	}


	blinkTimerText() {
		this.game.timerText.alpha = 1;
		this.game.time.events.add(500, () => {
			this.game.timerText.alpha = 0;
		}, this);
	}


	countdownToHint() {
		this.game.time.events.remove(this.game.hintTimer);
		this.game.hintTimer = this.game.time.events.loop(Phaser.Timer.SECOND * 10, this.showHint, this);
	}


	showHint() {
		const gemHintID = this.MATRIX.getGemHintID();
		const gem = this.game.gemsGroup.getByName(gemHintID);
		const shadow = this.game.shadowsGroup.getByName(gemHintID);

		if (!gem) return;
		this.game.add.tween(gem).to({y: gem.y - gem.height * .05}, 100, Phaser.Easing.Linear.None, true, 0, 0, true);

		if (!shadow) return;
		this.game.add.tween(shadow).to({y: gem.y + this.game.SHADOW_MARGIN}, 100, Phaser.Easing.Linear.None, true, 0, 0, true);
	}


	removeTimeBoard() {
		this.game.timeBoard.kill();
		this.game.timerText.kill();
	}


	showUserScore() {
		const highestScore = window.localStorage.getItem('highestScore');

		// 'YOUR SCORE' text
		const yourScoreText = this.game.yourScoreText = this.game.add.text(0, 0, 'YOUR SCORE:  ' + this.formatScore(this.game.SCORE));
		yourScoreText.font = 'Fredoka One';
		yourScoreText.fontSize = this.world.height / window.devicePixelRatio / 11;
		yourScoreText.fill = '#ff5050';
		yourScoreText.align = 'center';
		yourScoreText.anchor.setTo(.5, 1);
		yourScoreText.x = this.world.centerX;
		yourScoreText.y = this.world.centerY;
		yourScoreText.angle = -.3;
		yourScoreText.alpha = 0;
		yourScoreText.scale.setTo(.4);
		yourScoreText.stroke = '#fff';
		yourScoreText.strokeThickness = this.world.height / window.devicePixelRatio * .03;
		yourScoreText.setShadow(2, this.world.height / window.devicePixelRatio * .01, 'rgba(78, 46, 90, .6)', 2, true, false);
		this.game.add.tween(yourScoreText.scale).to({x: 1, y: 1}, 300, Phaser.Easing.Back.Out, true);
		this.game.add.tween(yourScoreText).to({alpha: 1}, 100, Phaser.Easing.Linear.None, true);

		// 'HIGHEST SCORE' text
		const highestScoreText = this.game.highestScoreText = this.game.add.text(0, 0, 'HIGHEST SCORE:  ' + this.formatScore(highestScore));
		highestScoreText.font = 'Fredoka One';
		highestScoreText.fontSize = this.world.height / window.devicePixelRatio / 11;
		highestScoreText.fill = '#ff5050';
		highestScoreText.align = 'center';
		highestScoreText.anchor.setTo(.5, 0);
		highestScoreText.x = this.world.centerX;
		highestScoreText.y = this.world.centerY;
		highestScoreText.angle = .4;
		highestScoreText.alpha = 0;
		highestScoreText.scale.setTo(.4);
		highestScoreText.stroke = '#fff';
		highestScoreText.strokeThickness = this.world.height / window.devicePixelRatio * .03;
		highestScoreText.setShadow(2, this.world.height / window.devicePixelRatio * .01, 'rgba(78, 46, 90, .6)', 2, true, false);
		this.game.add.tween(highestScoreText.scale).to({x: 1, y: 1}, 300, Phaser.Easing.Back.Out, true);
		this.game.add.tween(highestScoreText).to({alpha: 1}, 100, Phaser.Easing.Linear.None, true);

		// 'TAP TO CONTINUE' text
		const tapToContinueText = this.game.tapToContinueText = this.game.add.text(0, 0, 'Tap to continue...');
		tapToContinueText.font = 'Fredoka One';
		tapToContinueText.fontSize = this.world.height / window.devicePixelRatio / 15;
		tapToContinueText.fill = '#fff';
		tapToContinueText.align = 'center';
		tapToContinueText.alpha = 0;
		tapToContinueText.anchor.setTo(.5, 1);
		tapToContinueText.x = this.world.centerX;
		tapToContinueText.y = this.world.height - tapToContinueText.height;
		tapToContinueText.setShadow(2, tapToContinueText.height * .04, 'rgba(78, 46, 90, .6)', tapToContinueText.height * .01);

		this.game.time.events.loop(Phaser.Timer.SECOND, this.blinkTapToContinueText, this);
		this.game.time.events.add(Phaser.Timer.SECOND, this.allowTap, this);
	}


	blinkTapToContinueText() {
		if (this.game.tapToContinueText.alpha === 0) {
			this.game.tapToContinueText.alpha = 1;
		} else {
			this.game.tapToContinueText.alpha = 0;
		}
	}


	allowTap() {
		this.game.input.onTap.add(this.rollDonut, this);
	}


	rollDonut() {
		this.world.swap(this.game.bigDonut, this.game.yourScoreText);
		this.world.swap(this.game.donutShadow, this.game.yourScoreText);
		this.world.swap(this.game.bigDonut, this.game.highestScoreText);
		this.world.swap(this.game.donutShadow, this.game.highestScoreText);
		this.world.swap(this.game.bigDonut, this.game.tapToContinueText);
		this.world.swap(this.game.donutShadow, this.game.tapToContinueText);
		this.game.rollDonut = true;
	}


	clearScreen() {
		this.game.yourScoreText.kill();
		this.game.highestScoreText.kill();
		this.game.tapToContinueText.kill();
		this.game.time.events.removeAll();
		this.game.scoreBoard.kill();
		this.game.floorForScoreBoard.kill();
		this.game.scoreText.kill();
		this.game.timerText.kill();
		this.game.textTimeUp.kill();
		this.game.floorForTextTimeUp.kill();
		this.game.textGameOver.kill();
		this.game.floorForTextGameOver.kill();
	}


	gotoMainMenu() {
		this.state.start('MainMenu', true, false, true);
	}
}

export default Play;