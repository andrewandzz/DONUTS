class PopupText {
	constructor(game, matrix) {
		this.game = game;
		this.matrix = matrix;
	}

	show(groupOfGemIDs, textToShow) {
		const position = this._getPosition(groupOfGemIDs);
		const GEM_SIZE = this.game.GEM_SIZE;

		const text = this.game.add.text(
			position.x,
			position.y, '+' + textToShow);

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

		scaleTween.onComplete.add(fadeOut, this);

		function fadeOut() {
			const fadeOutTween = this.game.add.tween(text).to({alpha: 0}, 300, Phaser.Easing.Linear.None, true);
			fadeOutTween.onComplete.add(() => {
				text.destroy();
			});
		}
	}


	_getPosition(groupOfGemIDs) {
		// 1. find position of the first and the last gem in group
		// 2. get center position


		// 1.
		const firstGemID = groupOfGemIDs[0];
		const lastGemID = groupOfGemIDs[groupOfGemIDs.length - 1];
		const firstGemCell = this.matrix.getGemCell(firstGemID);
		const lastGemCell = this.matrix.getGemCell(lastGemID);
		
		if (!firstGemCell || !lastGemCell) return {
			x: this.game.world.width / 2,
			y: this.game.world.height / 2
		};

		const firstGemPosition = this.game.gems._getScreenPositionByCell(firstGemCell);
		const lastGemPosition = this.game.gems._getScreenPositionByCell(lastGemCell);

		// 2.
		const distanceX = Math.max(firstGemPosition.x, lastGemPosition.x) - Math.min(firstGemPosition.x, lastGemPosition.x);
		const textX = Math.min(firstGemPosition.x, lastGemPosition.x) + distanceX / 2;

		const distanceY = Math.max(firstGemPosition.y, lastGemPosition.y) - Math.min(firstGemPosition.y, lastGemPosition.y);
		const textY = Math.min(firstGemPosition.y, lastGemPosition.y) + distanceY / 2;

		return {
			x: textX + this.game.GEM_SIZE / 2,
			y: textY + this.game.GEM_SIZE / 2
		};
	}
}

export default PopupText;