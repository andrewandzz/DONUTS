class Hand {
	constructor(game) {
		this.game = game;
		this.hand;
		this.shadow;
	}

	show() {
		const gemID = this.game.Matrix.getGemHint().id;
		const gem = this.gem = this.game.gemsGroup.getByName(gemID);
		const direction = this.game.Matrix.getGemHint().direction;

		if (!gem || !direction) return;

		const GEM_SIZE = this.game.GEM_SIZE;
		const MAX_HEIGHT = this.game.world.height / 3;
		const WAIT_BEFORE_SHOW = 600; // all in ms
		const SCALE_TIME = 300;
		const CHANGE_ALPHA_TIME	= 100;
		const WAIT_BEFORE_MOVE = 400;
		const MOVE_TIME = 600;
		const WAIT_TIME = 500;
		const MOVE_BACK_TIME = 200;
		const REPEAT_CYCLE_TIME	= 1100;
		const SHADOW_MARGIN	= this.gem.height * .07;

		// shadow
		const shadow = this.shadow = this.game.add.sprite(gem.x + SHADOW_MARGIN / 2, gem.y + SHADOW_MARGIN, 'hand');
		shadow.anchor.setTo(.5);
		shadow.tint = '0x4e2e5a';
		shadow.alpha = 0;

		// hand
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


		const shadowScaleInTween = this.game.add.tween(shadow.scale).to({x: handScale, y: handScale}, SCALE_TIME, Phaser.Easing.Back.Out, false, WAIT_BEFORE_SHOW);
		const shadowAlphaInTween = this.game.add.tween(shadow).to({alpha: .6}, CHANGE_ALPHA_TIME, Phaser.Easing.Linear.None, false, WAIT_BEFORE_SHOW);


		const handScaleInTween = this.game.add.tween(hand.scale).to({x: handScale, y: handScale}, SCALE_TIME, Phaser.Easing.Back.Out, false, WAIT_BEFORE_SHOW);
		const handAlphaInTween = this.game.add.tween(hand).to({alpha: 1}, CHANGE_ALPHA_TIME, Phaser.Easing.Linear.None, false, WAIT_BEFORE_SHOW);


		// set up move direction
		let handMoveTween, shadowMoveTween;

		if (direction === 'up') {
			handMoveTween = this.game.add.tween(hand).to({y: hand.y - GEM_SIZE}, MOVE_TIME, Phaser.Easing.Linear.None, false, WAIT_BEFORE_MOVE);
			shadowMoveTween = this.game.add.tween(shadow).to({y: shadow.y - GEM_SIZE}, MOVE_TIME, Phaser.Easing.Linear.None, false, WAIT_BEFORE_MOVE);

		} else if (direction === 'down') {
			handMoveTween = this.moveTween = this.game.add.tween(hand).to({y: hand.y + GEM_SIZE}, MOVE_TIME, Phaser.Easing.Linear.None, false, WAIT_BEFORE_MOVE);
			shadowMoveTween = this.game.add.tween(shadow).to({y: shadow.y + GEM_SIZE}, MOVE_TIME, Phaser.Easing.Linear.None, false, WAIT_BEFORE_MOVE);

		} else if (direction === 'left') {
			handMoveTween = this.game.add.tween(hand).to({x: hand.x - GEM_SIZE}, MOVE_TIME, Phaser.Easing.Linear.None, false, WAIT_BEFORE_MOVE);
			shadowMoveTween = this.game.add.tween(shadow).to({x: shadow.x - GEM_SIZE}, MOVE_TIME, Phaser.Easing.Linear.None, false, WAIT_BEFORE_MOVE);

		} else if (direction === 'right') {
			handMoveTween = this.game.add.tween(hand).to({x: hand.x + GEM_SIZE}, MOVE_TIME, Phaser.Easing.Linear.None, false, WAIT_BEFORE_MOVE);
			shadowMoveTween = this.game.add.tween(shadow).to({x: shadow.x + GEM_SIZE}, MOVE_TIME, Phaser.Easing.Linear.None, false, WAIT_BEFORE_MOVE);
		}


		const handMoveBackTween = this.game.add.tween(hand).to({x: gem.x, y: gem.y}, MOVE_BACK_TIME, Phaser.Easing.Linear.None, false, WAIT_TIME);
		const shadowMoveBackTween = this.game.add.tween(shadow).to({x: gem.x + SHADOW_MARGIN / 2, y: gem.y + SHADOW_MARGIN}, MOVE_BACK_TIME, Phaser.Easing.Linear.None, false, WAIT_TIME);



		handScaleInTween.chain(handMoveTween);
		handMoveTween.chain(handMoveBackTween);
		handMoveBackTween.chain(handMoveTween);

		shadowScaleInTween.chain(shadowMoveTween);
		shadowMoveTween.chain(shadowMoveBackTween);
		shadowMoveBackTween.chain(shadowMoveTween);


		handAlphaInTween.start();
		handScaleInTween.start();
		shadowAlphaInTween.start();
		shadowScaleInTween.start();

		// change delay after first move
		handMoveTween.onComplete.addOnce(() => {
			handMoveTween.delay(REPEAT_CYCLE_TIME);
			shadowMoveTween.delay(REPEAT_CYCLE_TIME);
		});
	}


	remove() {
		const REMOVE_TIME = 120;

		return new Promise(resolve => {
			const hand = this.hand;
			const shadow = this.shadow;

			// remove shadow
			this.game.add.tween(shadow).to({alpha: 0}, REMOVE_TIME, Phaser.Easing.Linear.None, true);
			this.game.add.tween(shadow.scale).to({x: 0, y: 0}, REMOVE_TIME, Phaser.Easing.Linear.None, true);

			// remove hand
			this.game.add.tween(hand).to({alpha: 0}, REMOVE_TIME, Phaser.Easing.Linear.None, true);
			const removeTween = this.game.add.tween(hand.scale).to({x: 0, y: 0}, REMOVE_TIME, Phaser.Easing.Linear.None, true);

			// destroy hand and shadow after they are removed
			removeTween.onComplete.add(() => {
				hand.destroy();
				shadow.destroy();

				resolve();
			});
		});
	}
}

export default Hand;