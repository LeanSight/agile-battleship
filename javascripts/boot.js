$(function() {
	// app ignores f5, preventing to reset the game by mistake
	document.onkeydown = function(){
	  switch (event.keyCode){
			case 116 : //F5 button
				event.returnValue = false;
				event.keyCode = 0;
				return false;
			case 82 : //R button
				if (event.ctrlKey){ 
					event.returnValue = false;
					event.keyCode = 0;
					return false;
				}
		}
	}
	// initialize game
	var game;
	$("#newGame").bind("click", function() {
		if (game) {
			game.destroy();
		}
		game = new Game({shotsPerIteration: $("#shotsPerIteration").val()});
		new GameView({model: game}).render();
	});
});