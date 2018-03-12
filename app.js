$(document).ready(function() {

	function theGame() {

		var game;
		var gameID = "mod-trial";
		var gameURL = createGameURL();

		// ACTORS
		var dealer = "dealer";
		var player = "player";
		var dealerHand;
		var playerHand;		
		var dealerCardsOpen = 0;
		var playerCardsOpen = 0;

		// HTML INVENTORY FOR GLOBAL ACCESS
		var $dealerSection = $('.dealer');
		var $playerSection = $('.player');
		var $totalD = $('.dealer-count');
		var $totalP = $('.player-count');
		var $cardsD = $('.dealer-cards');
		var $cardsP = $('.player-cards');
		var $message = $('.card');
		var $footer = $('footer');

		var $dealBtn = $('#deal');
		var $hitBtn = $('#hit');
		var $standBtn = $('#stand');


		// run the game from checking if game exists (line 273)
		checkIfUnfinishedGameExists();



		///// FLIPPING CARDS FACE-UP /////

		// fetch player's and dealer's hands after the deal event or after the game is restored from the server
		function fetchInitialCards(){

			var totalCardsToOpen = (dealerHand.length + playerHand.length) - 1;
			var delayTotal = totalCardsToOpen * 500;

			createDealerBack(dealerHand.length);
			createPlayerBack(playerHand.length);

			function flipDealers(position){
				dealerHand[0].extra.face_up = true;
				cards.openUp(dealer, dealerHand, position);
				dealerCardsOpen+=1;
				setTimeout(function(){
					flipPlayers(playerCardsOpen);
				}, 500);
			}

			function flipPlayers(position){
				cards.openUp(player, playerHand, position);
				playerCardsOpen+=1;
				if (playerCardsOpen < playerHand.length){
					setTimeout(function(){
							flipPlayers(playerCardsOpen);
					}, 500);
				}
				setTimeout(showLastSegment, delayTotal);
			}

			function showLastSegment(){ // show hand total, and Hit/Stand buttons
				if (playerCardsOpen === playerHand.length){
					showTotals(player);
					setTimeout(showPlayerActionButtons, 500);
				}
			}

			// two below create card back img before flipping
			function createDealerBack(quantity){
				for (var i = 0; i < quantity; i++){
					cards.showBack(dealer);
				}
			}
			function createPlayerBack(quantity){
				for (var i = 0; i < quantity; i++){
					cards.showBack(player);
				}
			}

			setTimeout(function(){ 
				flipDealers(dealerCardsOpen);
			}, 500);	
		}


		function fetchCard(actor){
			if (actor === "player"){
				cards.showBack(actor);
				var cardURL = cards.getCardURL(playerHand, playerCardsOpen);
				var $newCard = cards.createCard(cardURL)
				cards.openUp(player, playerHand, playerCardsOpen);
				playerCardsOpen+=1;
			} else if (actor === "dealer"){
					for (var i = dealerCardsOpen; i < dealerHand.length; i++){
						cards.showBack(actor);
						var cardURL = cards.getCardURL(dealerHand, i);
						var $newCard = cards.createCard(cardURL);
						cards.openUp(dealer, dealerHand, i);
						dealerCardsOpen+=1;
					}
			}
		}




		function showTotals(actor){
			var totalDealer = game.dealer.handTotal;
			var totalPlayer = game.player.handTotal;
			if (actor === "player"){
				$totalP.text(totalPlayer);
			} else if (actor === "dealer"){
				$totalD.text(totalDealer);
			}
		}

		function afterStand(){
			if (dealerHand.length > 2){
				fetchCard(dealer);	
			}
			var delayTotal = (dealerHand.length - 2) * 800;
			setTimeout(function(){
				showTotals(dealer);
				newGameButtons();
			}, delayTotal);
		}

		function checkIfWinExists(){
			var message = game.message;
			if (game.winner !== null){

				if (game.winner === 0){
					$message.addClass('bg-danger');
				} else if (game.winner === 1){
					$message.addClass('bg-primary');
				} else if (game.winner === 2){
					$message.addClass('bg-dark');
				} 
				cards.openUp(dealer, dealerHand, 1);
				dealerCardsOpen+=1;
				showTotals(dealer);
				$message.text(message);
				$message.show();
				setTimeout(function(){
						newGameButtons();
						$footer.show();
				}, 1500);
			}
		}

		///// STAGE SET-UPS /////


		function setUp(situation){
			if (situation === 0){ // new Game
				sessionStartSetUp();
			} else if (situation === 1){ // existing Game
				postDealSetUp();
				fetchInitialCards();
			} 
		}

		function sessionStartSetUp(){
			$footer.hide();
			$message.hide();
			$message.removeClass("bg-danger bg-primary bg-dark");
			$dealBtn.show();
			hidePlayerActionButtons();
			$dealerSection.hide();
			$playerSection.hide();
		}

		function postDealSetUp() {
			$footer.hide();
			$dealBtn.hide();
			$dealerSection.show();
			$playerSection.show();
		}

		function newGameButtons(){
			hidePlayerActionButtons();
			$dealBtn.text("start new game");
			$dealBtn.show();
		}

		function consecutiveGameSetUp(){
			$message.removeClass("bg-danger bg-primary bg-dark");
			$message.hide();
			$footer.hide();
			$dealBtn.hide();
			$dealBtn.text("deal the cards");
			$('img').remove();
			$totalD.text('~');
			$totalP.text('~');
		}

		function showPlayerActionButtons(){
			$hitBtn.show();
			$standBtn.show();
		}
		function hidePlayerActionButtons(){
			$hitBtn.hide();
			$standBtn.hide();
		}


		///// EVENT LISTENERS /////

		$dealBtn.on('click', function(e){
			if (game.winner === null){
				game.deal();
				dealerHand = game.dealer.hand;
				playerHand = game.player.hand;
				POSTgameStatus();
				setTimeout(function(){
					postDealSetUp();
					fetchInitialCards();
					setTimeout(checkIfWinExists, 3000);
				}, 500);
			} else {
				consecutiveGameSetUp();
				game = new bj.Game(0);
				game.deal();
				dealerHand = game.dealer.hand;
				playerHand = game.player.hand;
				dealerCardsOpen = 0;
				playerCardsOpen = 0;
				POSTgameStatus();
				setTimeout(function(){
					postDealSetUp();
					fetchInitialCards();
					setTimeout(checkIfWinExists, 3000);
				}, 500);
			}
		})

		$hitBtn.on('click', function(e) {
			game.hit();
			POSTgameStatus();
			fetchCard(player);
			setTimeout(function(){
				showTotals(player);
				checkIfWinExists();
			}, 1000)
		})

		$standBtn.on('click', function(e){
			$hitBtn.hide();
			$standBtn.hide();
			game.stand();
			POSTgameStatus();
			cards.openUp(dealer, dealerHand, dealerCardsOpen);
			dealerCardsOpen+=1;
			setTimeout(function(){
				afterStand();
				checkIfWinExists();
			}, 1000);
		})



		///// AJAX /////

		// 1. Check if ufinished game exists on server
		function checkIfUnfinishedGameExists(){
		sessionStartSetUp();
		$message.show();
		$dealBtn.hide();

			$.ajax({
				url: gameURL,
				type: 'GET',
				statusCode: {
						0: function(data){ // if my identifier does not exist, create one
							createGameOnServer();
							console.log("Identifier did not exist, created one");
						}
				},
				success: function(data) { // if it exists, check saved game status
					retrieveGame(data);
						console.log("Identifier existed, retrieving game data");
				}
			});
		}

		// 2. Retrieves game data from server
		function retrieveGame(data){
			if (data.data.status === "1"){ // if unfinished game exists, import game date
				importGameData(data);
				console.log("Importing game data");
			} else if (data.data.status === "0") { // if game was finished, create a new game
				console.log("Game was finished, creating new game");
				game = new bj.Game(0);
				setUp(0);
			}
			$message.hide();
		}

		// 3. Posts game data to server
		function POSTgameStatus(){
			if (game.winner === null){
					$.ajax({
						url: gameURL,
						type: 'POST',
						data: { data: { msg: 'saving unfinished game', status: game.status, winner: game.winner, dealerHand: JSON.stringify(dealerHand), playerHand: JSON.stringify(playerHand)}},
						success: function(data) {
							// enable player actions?
						}
					});
			} else {
					$.ajax({
						url: gameURL,
						type: 'POST',
						data: { data: { msg: 'next time start new game', status: 0}},
						success: function(data) {
						}
					});		
			}
		}

		function importGameData(data){
			var interimDealerHand = JSON.parse(data.data.dealerHand);
			var interimPlayerHand = JSON.parse(data.data.playerHand);
			var status = parseInt(data.data.status);
			var playerTurn = true;
			game = new bj.Game(status, playerTurn, interimDealerHand, interimPlayerHand);
			dealerHand = game.dealer.hand;
			playerHand = game.player.hand;
			console.log("Done importing game data");
			setTimeout(function(){
				setUp(1);}, 750);
		}

		// One time action of creating the initial identifier
		function createGameOnServer(){
			$.ajax({
				type: 'POST',
				url: 'https://ce-sample-api.herokuapp.com/card_games.json',
				data: { identifier: gameID, data: { msg: 'creating game ID' } },
				statusCode: {
					422: function(data){ // such an ID exists
						console.log("ups, such an ID exists already");
					}
				},
				success: function(data) { 
					createGameURL();
				}	
			});
		}


		function createGameURL(){
			var url = 'https://ce-sample-api.herokuapp.com/card_games/';
			var gameURL = url + gameID + '.json';
			return gameURL;
		}
	}

	theGame();
	
});
