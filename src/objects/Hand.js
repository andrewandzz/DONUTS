class Hand {
	constructor(game, matrix) {
		this.game = game;
		this.matrix = matrix;
	}

	show() {
		const gemID = this.matrix.getGemHint().id;
		this.gem = this.game.gemsGroup.getByName(gemID);
		this.direction = this.matrix.getGemHint().direction;

		if (!this.gem || !this.direction) return;

		const MAX_HEIGHT 		= this.game.world.height / 3;
		const WAIT_BEFORE_MOVE 	= 400; // all in ms
		const SCALE_TIME		= 300;
		const CHANGE_ALPHA_TIME	= 100;
		this.MOVE_TIME 			= 600;
		this.WAIT_TIME 			= 500;
		this.MOVE_BACK_TIME		= 200;
		this.REMOVE_TIME		= 120;
		this.REPEAT_CYCLE_TIME	= 2400;
		this.SHADOW_MARGIN		= this.gem.height * .07;

		const gem = this.gem;

		const shadow = this.shadow = this.game.add.sprite(gem.x + this.SHADOW_MARGIN / 2, gem.y + this.SHADOW_MARGIN, 'hand');
		shadow.anchor.setTo(.5);
		shadow.tint = '0x4e2e5a';
		shadow.alpha = 0;


		const hand = this.hand = this.game.add.sprite(gem.x, gem.y, 'hand');
		hand.anchor.setTo(.5);
		hand.alpha = 0;

		let handScale = 1;
		// scale hand if needed
		if (hand.height > MAX_HEIGHT) {
			handScale = MAX_HEIGHT / hand.height;
		}
		hand.scale.setTo(handScale * .4);
		shadow.scale.setTo(handScale * .4);

		this.game.add.tween(shadow.scale).to({x: handScale, y: handScale}, SCALE_TIME, Phaser.Easing.Back.Out, true);
		this.game.add.tween(shadow).to({alpha: .6}, CHANGE_ALPHA_TIME, Phaser.Easing.Linear.None, true);


		const showTween = this.game.add.tween(hand.scale).to({x: handScale, y: handScale}, SCALE_TIME, Phaser.Easing.Back.Out, true);
		this.game.add.tween(hand).to({alpha: 1}, CHANGE_ALPHA_TIME, Phaser.Easing.Linear.None, true);

		showTween.onComplete.add(() => {
			this.waitBeforeMoveTimer = window.setTimeout(() => {
				this._move();
			}, WAIT_BEFORE_MOVE);
		});
	}


	_move() {
		window.clearTimeout(this.waitBeforeMoveTimer);

		const hand = this.hand;
		const shadow = this.shadow;
		let moveTween;

			if (this.direction === 'up') {
				moveTween = this.game.add.tween(hand).to({y: hand.y - this.game.GEM_SIZE}, this.MOVE_TIME, Phaser.Easing.Linear.None, true);
				this.game.add.tween(shadow).to({y: shadow.y - this.game.GEM_SIZE}, this.MOVE_TIME, Phaser.Easing.Linear.None, true);

			} else if (this.direction === 'down') {
				moveTween = this.game.add.tween(hand).to({y: hand.y + this.game.GEM_SIZE}, this.MOVE_TIME, Phaser.Easing.Linear.None, true);
				this.game.add.tween(shadow).to({y: shadow.y + this.game.GEM_SIZE}, this.MOVE_TIME, Phaser.Easing.Linear.None, true);

			} else if (this.direction === 'left') {
				moveTween = this.game.add.tween(hand).to({x: hand.x - this.game.GEM_SIZE}, this.MOVE_TIME, Phaser.Easing.Linear.None, true);
				this.game.add.tween(shadow).to({x: shadow.x - this.game.GEM_SIZE}, this.MOVE_TIME, Phaser.Easing.Linear.None, true);

			} else if (this.direction === 'right') {
				moveTween = this.game.add.tween(hand).to({x: hand.x + this.game.GEM_SIZE}, this.MOVE_TIME, Phaser.Easing.Linear.None, true);
				this.game.add.tween(shadow).to({x: shadow.x + this.game.GEM_SIZE}, this.MOVE_TIME, Phaser.Easing.Linear.None, true);
			}


			moveTween.onComplete.add(() => {
				this.waitTimer = window.setTimeout(() => {
					this._moveBack();
				}, this.WAIT_TIME);
			});


			this.moveLoop = window.setInterval(() => {
				this._move();
			}, this.REPEAT_CYCLE_TIME);
	}


	_moveBack() {
		window.clearTimeout(this.waitTimer);

		const hand = this.hand;
		const shadow = this.shadow;
		const gem = this.gem;

		// tweens
		this.game.add.tween(hand).to({x: gem.x, y: gem.y}, this.MOVE_BACK_TIME, Phaser.Easing.Linear.None, true);
		this.game.add.tween(shadow).to({x: gem.x + this.SHADOW_MARGIN / 2, y: gem.y + this.SHADOW_MARGIN}, this.MOVE_BACK_TIME, Phaser.Easing.Linear.None, true);
	}

	remove() {
		return new Promise(resolve => {
			const hand = this.hand;
			const shadow = this.shadow;

			// remove shadow tweens
			this.game.add.tween(shadow).to({alpha: 0}, this.REMOVE_TIME, Phaser.Easing.Linear.None, true);
			this.game.add.tween(shadow.scale).to({x: 0, y: 0}, this.REMOVE_TIME, Phaser.Easing.Linear.None, true);

			// remove hand tweens
			this.game.add.tween(hand).to({alpha: 0}, this.REMOVE_TIME, Phaser.Easing.Linear.None, true);
			const removeTween = this.game.add.tween(hand.scale).to({x: 0, y: 0}, this.REMOVE_TIME, Phaser.Easing.Linear.None, true);

			// destroy hand and shadow after they are removed
			removeTween.onComplete.add(() => {
				hand.destroy();
				shadow.destroy();
				window.clearInterval(this.moveLoop);

				resolve();
			});
		});
	}
}

export default Hand;