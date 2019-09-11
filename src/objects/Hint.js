class Hint {
	constructor(game) {
		this.game = game;
	}

	show() {
		const ID 		= this.game.Matrix.getGemHint().id;
		
		if (!ID) return;

		const direction = this.game.Matrix.getGemHint().direction;
		const gem 		= this.game.gemsGroup.getByName(ID);
		const shadow 	= this.game.shadowsGroup.getByName(ID);

		if (!gem || !shadow) return;

		const JUMP_DIST	= gem.height * .07;
		const JUMP_DUR = 90; // duration in ms
		const JUMP_BACK_DUR = 120;


		let gemJumpTween, gemJumpBackTween, shadowJumpTween, shadowJumpBackTween;

		if (direction === 'up') {
			gemJumpTween = this.game.add.tween(gem).to({y: gem.y - JUMP_DIST}, JUMP_DUR, Phaser.Easing.Linear.None, false);
			shadowJumpTween = this.game.add.tween(shadow).to({y: shadow.y - JUMP_DIST}, JUMP_DUR, Phaser.Easing.Linear.None, false);
			gemJumpBackTween = this.game.add.tween(gem).to({y: gem.y}, JUMP_BACK_DUR, Phaser.Easing.Linear.None, false);
			shadowJumpBackTween = this.game.add.tween(shadow).to({y: shadow.y}, JUMP_BACK_DUR, Phaser.Easing.Linear.None, false);

		} else if (direction === 'down') {
			gemJumpTween = this.game.add.tween(gem).to({y: gem.y + JUMP_DIST}, JUMP_DUR, Phaser.Easing.Linear.None, false);
			shadowJumpTween = this.game.add.tween(shadow).to({y: shadow.y + JUMP_DIST}, JUMP_DUR, Phaser.Easing.Linear.None, false);
			gemJumpBackTween = this.game.add.tween(gem).to({y: gem.y}, JUMP_BACK_DUR, Phaser.Easing.Linear.None, false);
			shadowJumpBackTween = this.game.add.tween(shadow).to({y: shadow.y}, JUMP_BACK_DUR, Phaser.Easing.Linear.None, false);

		} else if (direction === 'left') {
			gemJumpTween = this.game.add.tween(gem).to({x: gem.x - JUMP_DIST}, JUMP_DUR, Phaser.Easing.Linear.None, false);
			shadowJumpTween = this.game.add.tween(shadow).to({x: shadow.x - JUMP_DIST}, JUMP_DUR, Phaser.Easing.Linear.None, false);
			gemJumpBackTween = this.game.add.tween(gem).to({x: gem.x}, JUMP_BACK_DUR, Phaser.Easing.Linear.None, false);
			shadowJumpBackTween = this.game.add.tween(shadow).to({x: shadow.x}, JUMP_BACK_DUR, Phaser.Easing.Linear.None, false);

		} else if (direction === 'right') {
			gemJumpTween = this.game.add.tween(gem).to({x: gem.x + JUMP_DIST}, JUMP_DUR, Phaser.Easing.Linear.None, false);
			shadowJumpTween = this.game.add.tween(shadow).to({x: shadow.x + JUMP_DIST}, JUMP_DUR, Phaser.Easing.Linear.None, false);
			gemJumpBackTween = this.game.add.tween(gem).to({x: gem.x}, JUMP_BACK_DUR, Phaser.Easing.Linear.None, false);
			shadowJumpBackTween = this.game.add.tween(shadow).to({x: shadow.x}, JUMP_BACK_DUR, Phaser.Easing.Linear.None, false);
		}

		gemJumpTween.chain(gemJumpBackTween);
		shadowJumpTween.chain(shadowJumpBackTween);

		// jump second time
		gemJumpBackTween.onComplete.addOnce(() => {
			gemJumpTween.start();
			shadowJumpTween.start();
		});

		gemJumpTween.start();
		shadowJumpTween.start();
	}
}

export default Hint;