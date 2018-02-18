$(document).ready(function() {
	checkIfUnfinishedGameExists();
});


var game;
var gameID = "mod-trial";
var gameURL = createGameURL();

// ACTORS
var dealer = "dealer";
var player = "player";
var dealerHand;
var playerHand;

// HTML INVENTORY FOR GLOBAL ACCESS
var $dealerSection = $('.dealer');
var $playerSection = $('.player');
var $totalD = $('.dealer-count');
var $totalP = $('.player-count');
var $cardsD = $('.dealer-cards')
var $cardsP = $('.player-cards')
var $message = $('.card');
var $footer = $('footer');

// buttons
var $dealBtn = $('#deal');
var $hitBtn = $('#hit');
var $standBtn = $('#stand');





// fetch player's and dealer's hands after the deal event or after the game is restored from the server
function fetchInitialCards(){
	var count = 0;
	
	// open up dealer's cards one by one
	function fetchDealerCards(position){
		openUp(dealerHand, position);
		count++; 
		if (count < dealerHand.length){ // self-iteration until all dealer's cards that have 'extra.face-up=true' value are face up
			fetchDealerCards(count);
		}
	}
	
	// open up player's cards one by one
	function fetchPlayerCards(position){
		openUp(playerHand, position);
		count++;
		setTimeout(flipPlayers, 750); // delay flipping consecutive card(s)
		var delayNumber = playerHand.length * 750 // number of available cards * delay in miliseconds
		setTimeout(showLastSegment, delayNumber); // to ensure the Player's total & action buttons are revealed when the last player card flips face-up
	}

	function showLastSegment(){
		if (count === playerHand.length){
			showTotals(player);
			setTimeout(showPlayerActionButtons, 750);
		}
	}
	
	function flipDealers(){
		createDealerBack(dealerHand.length);
		fetchDealerCards(count);
		count = 0; // reset the count to work for player's hand
		createPlayerBack(playerHand.length);
		setTimeout(flipPlayers, 750) // delay flipping the first player's card
	}
	function flipPlayers(){
		if (count < playerHand.length){
			fetchPlayerCards(count);	
		}
	}
	
	flipDealers();
}




// creates a face-down representation of a card, adds to dealer's hand
function createDealerBack(number){
	for (var i = 0; i < number; i++){
		showBack(dealer);
	}
}

// creates a face-down representation of a card, adds to player's hand
function createPlayerBack(number){
	for (var i = 0; i < number; i++){
		showBack(player);
	}
}



function showBack(actor){
	var cardURL = 'img/back_dark.png';
	var $newCard = createCard(cardURL);
	if (actor === "dealer"){
		appendCard($newCard, dealerHand);	
	} else {
		appendCard($newCard, playerHand);	
	}
}

function openUp(hand, position){
	if (position === undefined){
		position = hand.length-1;
	}
	
	function flipUpDealer(){
		$('.dealer-cards > img').eq(position).attr("src", cardURL);
	}
	function flipUpPlayer(){
		$('.player-cards > img').eq(position).attr("src", cardURL);
	}
	
	var cardURL = getCard(hand, position);
	
	if (hand === game.dealer.hand){
		setTimeout(flipUpDealer, 750);
	} else {
		setTimeout(flipUpPlayer, 750);
	}		
}



function fetchCard(actor){
	if (actor === "player"){
		createPlayerBack(1);
		var position = playerHand.length-1;
		var cardURL = getCard(playerHand, position)
		var $newCard = createCard(cardURL)
		openUp(playerHand);
	} else if (actor === "dealer"){
			var length = dealerHand.length;

			for (var i = 2; i < length; i++){
				createDealerBack(1);
				var cardURL = getCard(dealerHand, i)
				var $newCard = createCard(cardURL);
				openUp(dealerHand, i);
			}
	}
}



function appendCard(newCard, hand){
	if (hand === game.player.hand){
		$cardsP.append(newCard);
	} else {
		$cardsD.append(newCard);
	}
}

	
function getCard(hand, position){
	var suit = hand[position].suit;
	var value = hand[position].value;
	var face_up = hand[position].extra.face_up
	var cardURL = mapToCardImg(face_up, value, suit)
	return cardURL
}

function mapToCardImg(face_up, value, suit){
	if (face_up === true){
		var valueUp = value.toUpperCase();
		var cardName = suit+'_'+valueUp+'.png'
		var cardURL = 'img/' + cardName
	} else {
		var cardURL = 'img/back_dark.png'
	}
	return cardURL
}
	
function createCard(cardURL){
	var $newCard = $('<img src="'+cardURL+'">');
	return $newCard
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
		openUp(dealerHand);
		showTotals(dealer);
		$message.text(message);
		$message.show(); // need to hide it afterwards!
		setTimeout(function(){
				newGameButtons();
				$footer.show();
		}, 1500);
	}
}


/// STAGE SET UPS ///


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


/// EVENT LISTENERS

$dealBtn.on('click', function(e){
	if (game.winner === null){
		game.deal();
		dealerHand = game.dealer.hand;
		playerHand = game.player.hand;
		POSTgameStatus();
		setTimeout(function(){
			postDealSetUp();
			fetchInitialCards();
			setTimeout(checkIfWinExists, 5000);
		}, 500);
	} else {
		consecutiveGameSetUp();
		game = new bj.Game(0);
		game.deal();
		dealerHand = game.dealer.hand;
		playerHand = game.player.hand;
		POSTgameStatus();
		setTimeout(function(){
			postDealSetUp();
			fetchInitialCards();
			setTimeout(checkIfWinExists, 5000);
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
	openUp(dealerHand, 1);
	setTimeout(function(){
		afterStand();
		checkIfWinExists();
	}, 1000);
})


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
					console.log("Identifier did not exist, created one")
				}
		},
		success: function(data) { // if it exists, check saved game status
			retrieveGame(data);
				console.log("Identifier existed, retrieved game data");
		}
	});
}

// 2. Retrieves game data from server
function retrieveGame(data){
	if (data.data.status === "1"){ // if unfinished game exists, import game date
		importGameData(data);
	} else if (data.data.status === "0") { // if game was finished, create a new game
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
					console.log(data);
				}
			});
	} else {
			$.ajax({
				url: gameURL,
				type: 'POST',
				data: { data: { msg: 'next time start new game', status: 0}},
				success: function(data) {
					console.log(data);
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
	console.log(dealerHand, playerHand);
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
			// enable deal button
		}	
	});
}


function createGameURL(){
	var url = 'https://ce-sample-api.herokuapp.com/card_games/';
	var gameURL = url + gameID + '.json';
	return gameURL;
}