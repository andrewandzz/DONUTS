class Gems {
	constructor(game, matrix) {
		this.game = game;
		this.matrix = matrix;
		this.GEM_SIZE = this.game.GEM_SIZE;
		this.SHADOW_MARGIN = this.GEM_SIZE * .03;
		this.notRotateNumbers = ['7', '8', '9', 'a', 'b']; // gem numbers, that we CAN'T rotate

		this._init();
	}


	_init() {
		// shadows group
		this.game.shadowsGroup = this.game.add.group();
		this.shadowsGroup = this.game.shadowsGroup;

		// gems group
		this.game.gemsGroup = this.game.add.physicsGroup(Phaser.Physics.ARCADE);
		this.game.gemsGroup.enableBody = true;
		this.gemsGroup = this.game.gemsGroup;
	}


	render() {
		return new Promise(resolve => {
			const matrix = this.matrix.getMatrix();

			matrix.forEach((colArr, colIndex) => {
				colArr.forEach((gemData, cellIndex) => {
					// if we already have gem with this ID (name)
					if (this.gemsGroup.getByName(gemData.id)) return;

					this._createGem(colIndex, cellIndex, gemData);
				});
			});

			const timer = window.setTimeout(() => {
				window.clearTimeout(timer);

				resolve();
			}, 200);
		});
	}


	_createGem(col, cell, gemData) {
		const ID = gemData.id;
		const number = gemData.number;
		const position = this._getScreenPositionByCell({col, cell});
		const SHOW_TIME = 200; // in ms
		const ALPHA_TIME = 100;


		// shadow
		const shadow = this.shadowsGroup.create(0, 0, 'gem-shadow');
		shadow.alpha = 0;
		shadow.anchor.setTo(.5);
		shadow.name = ID;
		shadow.left = position.x - this.SHADOW_MARGIN;
		shadow.top = position.y - this.SHADOW_MARGIN;
		shadow.scale.setTo(.1);
		this.game.add.tween(shadow.scale).to({x: 1, y: 1}, SHOW_TIME, Phaser.Easing.Back.Out, true);
		this.game.add.tween(shadow).to({alpha: .8}, ALPHA_TIME, Phaser.Easing.Linear.None, true);


		// gem
		const gem = this.gemsGroup.create(0, 0, 'gem-' + number);
		gem.name = ID;
		gem.anchor.setTo(.5);
		gem.left = position.x;
		gem.top = position.y;
		gem.scale.setTo(.1);
		const isBonus = (this.notRotateNumbers.indexOf('' + number) !== -1) ? true : false;
		const angle = (!isBonus) ? Math.floor(Math.random() * 360) : 0;
		gem.angle = angle;
		gem.alpha = 0;
		gem.inputEnabled = true;
		gem.input.enableDrag(false);

		this.game.add.tween(gem.scale).to({x: 1, y: 1}, SHOW_TIME, Phaser.Easing.Back.Out, true);
		this.game.add.tween(gem).to({alpha: 1}, ALPHA_TIME, Phaser.Easing.Linear.None, true);


		gem.events.onDragStart.add(this._onDragStart, this);
		gem.events.onDragStop.add(this._onDragStop, this);
	}


	_getScreenPositionByCell(cell) {
		return {
			x: this.game.WALL_LEFT + cell.col * this.GEM_SIZE,
			y: this.game.WALL_BOTTOM - cell.cell * this.GEM_SIZE - this.GEM_SIZE
		};
	}


	_onDragStart(gem, pointer) {
		this._dragDirection = null;
		this._dragStartPosX = pointer.clientX;
		this._dragStartPosY = pointer.clientY;
		gem.events.onDragUpdate.add(this._onDragUpdate, this);
	}


	_onDragUpdate(gem, pointer) {
		this._checkDragDistance(gem, pointer);

		const shadow = this.game.shadowsGroup.getByName(gem.name);
		shadow.left = gem.left - this.SHADOW_MARGIN;
		shadow.top = gem.top - this.SHADOW_MARGIN;

		if (!this._dragDirection) {
			this._getDragDirection(gem, pointer);
		}
	}


	_onDragStop(gem) {
		gem.events.onDragUpdate.removeAll();

		// if stopped dragging when not overlapping the next gem
		if (!this.game.gemsOverlap) {
			const cell = this.matrix.getGemCell(gem.name);
			const nativePosition = this._getScreenPositionByCell(cell);

			this._moveToPosition(gem, nativePosition);
		}
	}


	_getDragDirection(gem, pointer) {
		const left = Math.abs(pointer.clientX - this._dragStartPosX);
		const top = Math.abs(pointer.clientY - this._dragStartPosY);

		if (left !== top) {
			if (left > top){
				gem.input.allowVerticalDrag = false;
				gem.input.allowHorizontalDrag = true;
				this._dragDirection = 'hor';

			} else {
				gem.input.allowHorizontalDrag = false;
				gem.input.allowVerticalDrag = true;
				this._dragDirection = 'ver';
			}
		}
	}


	_moveToPosition(gem, newPosition) {
		return new Promise(resolve => {
			const newX = newPosition.x;
			const newY = newPosition.y;
			const startTime = performance.now();
			const DURATION = 200;
			const startX = gem.left;
			const startY = gem.top;
			const leftDist = newX - startX;
			const topDist = newY - startY;

			const shadow = this.shadowsGroup.getByName(gem.name);

			let progress = 0;

			const move = curTime => {
				progress = (curTime - startTime) / DURATION;

				if (progress >= 1) {
					// moving is finished
					progress = 1;
					this.game.gemsOverlap = false;
					resolve();
				}

				gem.left = startX + (leftDist * progress);
				gem.top = startY + (topDist * progress);

				shadow.left = startX + (leftDist * progress) - this.SHADOW_MARGIN;
				shadow.top = startY + (topDist * progress) - this.SHADOW_MARGIN;

				if (progress < 1) {
					requestAnimationFrame(move);
				}
			}

			requestAnimationFrame(move);
		});
	}

	// to prevent throwing gem out
	_checkDragDistance(gem, pointer) {
		const left = Math.abs(pointer.clientX - this._dragStartPosX);
		const top = Math.abs(pointer.clientY - this._dragStartPosY);

		if (this._dragDirection === 'hor') {
			if (left >= this.GEM_SIZE) {
				gem.input.allowHorizontalDrag = false;
			} else {
				gem.input.allowHorizontalDrag = true;
			}

		} else if (this._dragDirection === 'ver') {
			if (top >= this.GEM_SIZE) {
				gem.input.allowVerticalDrag = false;
			} else {
				gem.input.allowVerticalDrag = true;
			}
		}		
	}


	async swap(gem1, gem2) {
		const gem1Cell = this.matrix.getGemCell(gem1.name);
		const gem1Position = this._getScreenPositionByCell(gem1Cell);
		this._moveToPosition(gem2, gem1Position);

		const gem2Cell = this.matrix.getGemCell(gem2.name);
		const gem2Position = this._getScreenPositionByCell(gem2Cell);
		await this._moveToPosition(gem1, gem2Position);
		
		this.matrix.swapGems(gem1.name, gem2.name);

		gem1.input.enableDrag(false);
		gem2.input.enableDrag(false);
	}


	explode(IDs) {
		return new Promise(resolve => {
			const PARTICLE_ALPHA_TIME = 400; // all in ms
			const PARTICLE_SCALE_TIME = 500;
			const PARTICLE_SPEED = 100;
			const PARTICLE_FADE_OUT_TIME = 120;
			const PARTICLE_LIVE_TIME = 500;
			const DESTROY_IN = 300;

			IDs.forEach(id => {
				const gem = this.gemsGroup.getByName(id);
				const gemNumber = gem.key.split('-')[1]; // string
				const shadow = this.shadowsGroup.getByName(id);

				let particleNumber;
				// if 'a' or 'b' or more than 5
				if (isNaN(gemNumber) || +gemNumber > 5) {
					particleNumber = 4;
				} else {
					particleNumber = gemNumber;
				}

				// color particles
				const colorEmitter = this.game.add.emitter(gem.x, gem.y, 7);
				const colorEmitterScale = .5 + Math.ceil(Math.random() * 5) / 10;
				colorEmitter.makeParticles('particle-' + particleNumber);
				colorEmitter.setAlpha(.9, 0, PARTICLE_ALPHA_TIME, Phaser.Easing.Linear.None);
				colorEmitter.gravity = 20;
				colorEmitter.setScale(colorEmitterScale, 0, colorEmitterScale, 0, PARTICLE_SCALE_TIME, Phaser.Easing.Linear.None);
				colorEmitter.setXSpeed(-PARTICLE_SPEED, PARTICLE_SPEED);
				colorEmitter.setYSpeed(-PARTICLE_SPEED, PARTICLE_SPEED);
				colorEmitter.blendMode = Phaser.blendModes.OVERLAY;

				// explosion particles
				const explosionEmitter = this.game.add.emitter(gem.x, gem.y, 5);
				explosionEmitter.makeParticles(['particle_ex-1', 'particle_ex-2', 'particle_ex-3']);
				explosionEmitter.setAlpha(.9, 0, PARTICLE_ALPHA_TIME, Phaser.Easing.Linear.None);
				explosionEmitter.gravity = 20;
				explosionEmitter.setScale(.9, 0, .9, 0, PARTICLE_SCALE_TIME, Phaser.Easing.Linear.None);
				explosionEmitter.setXSpeed(-PARTICLE_SPEED, PARTICLE_SPEED);
				explosionEmitter.setYSpeed(-PARTICLE_SPEED, PARTICLE_SPEED);
				explosionEmitter.blendMode = Phaser.blendModes.OVERLAY;

				// fade out tween
				const fadeOutTween = this.game.add.tween(gem).to({alpha: 0}, PARTICLE_FADE_OUT_TIME, Phaser.Easing.Linear.None, true);
				this.game.add.tween(gem.scale).to({x: 0, y: 0}, PARTICLE_FADE_OUT_TIME, Phaser.Easing.Back.In, true);

				this.game.add.tween(shadow).to({alpha: 0}, PARTICLE_FADE_OUT_TIME, Phaser.Easing.Linear.None, true);
				this.game.add.tween(shadow.scale).to({x: 0, y: 0}, PARTICLE_FADE_OUT_TIME, Phaser.Easing.Back.In, true);

				fadeOutTween.onComplete.add(() => {
					renderParticles(colorEmitter, explosionEmitter);
				}, this);

				const destroyTimer = window.setTimeout(() => {
					window.clearTimeout(destroyTimer);
					destroy(gem, shadow);
				}, DESTROY_IN);

				this.game.soundKill.play();
			});


			function renderParticles(colorEmitter, explosionEmitter) {
				colorEmitter.start(true, PARTICLE_LIVE_TIME, null, 6);
				explosionEmitter.start(true, PARTICLE_LIVE_TIME, null, 4);
			}


			function destroy(gem, shadow) {
				gem.destroy();
				shadow.destroy();

				resolve();
			}
		});
	}


	explodeAll() {
		const allIDs = [];
		
		this.gemsGroup.forEach(gem => {
			gem.input.disableDrag();
			allIDs.push(gem.name);
		});

		this.explode(allIDs);
	}


	moveDownRest() {
		this.gemsGroup.forEach(gem => {
			this._moveToMatrixPosition(gem);
		});

		return new Promise(resolve => {
			setTimeout(() => {
				resolve()
			}, 250);
		});
	}


	_moveToMatrixPosition(gem) {
		const gemCell = this.matrix.getGemCell(gem.name);
		const newPosition = this._getScreenPositionByCell(gemCell);

		this._moveToPosition(gem, newPosition);
	}


	rotate() {
		const ROTATE_TIME = 500; // in ms

		this.gemsGroup.forEach(gem => {
			const curAngle = gem.angle;
			const newAngle = curAngle + Math.ceil(Math.random() * 40) - 20;
			const gemNumber = gem.key.split('-')[1];

			// if it's not a bonus gem
			if (this.notRotateNumbers.indexOf('' + gemNumber) === -1) {
				this.game.add.tween(gem).to({angle: newAngle}, ROTATE_TIME, Phaser.Easing.Bounce.Out, true);
			}
		});
	}
}

export default Gems;