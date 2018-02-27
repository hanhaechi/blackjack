var bj = (function() {

	function Game(status,playerTurn,dealerHand,playerHand){
		this.status = status; // 0 game does not exist, 1 unfinished game exits
		this.playerTurn = playerTurn // true is player, false is dealer
		this.deck;
		this.bust = 21;
		this.winner = null; // 0 = dealer, 1 = player, 2 = tie
		this.message;
		
		this.dealer = {
			hand : dealerHand,
			handTotal : 0,
			bust : false
		}
		this.player = {
			hand : playerHand,
			handTotal : 0,
			bust : false
		}
		
		// WINING CASES
		var BJ_WIN = "blackjack";
		var POINT_WIN = "afterHit";
		
		
		this.createDeck = function(){
			var initialDeck = new casino.StandardShuffledDeck();
			var deck = new casino.ShuffledShoe(initialDeck, 5);

			this.adjustValues = function(){
				for (var i = 0; i < deck.length; i++){
					var card_gameValue = deck[i].extra.game_value;
					if (card_gameValue >= 10 && card_gameValue <= 13){
						deck[i].extra.game_value = 10;
					}
				}
				for (var i = 0; i < deck.length; i++){
				var card_gameValue = deck[i].extra.game_value;
					if (card_gameValue === 14){
						deck[i].extra.game_value = 11;
					} 
				}
			}
			this.adjustValues();
			this.deck = deck;
		}
		
		
		this.deal = function(){
			var DEAL_COUNT = 4;
			var player = true;
			for (var i = 0; i < DEAL_COUNT; i++){
				var newCard = casino.draw(1, this.deck);
				if (player) {
					this.player.hand = casino.Hand(newCard, this.player.hand);
					this.faceUp(this.player.hand);
					player = false;
				} else {
					this.dealer.hand = casino.Hand(newCard, this.dealer.hand);
					player = true;
				}
			}
			this.faceUp(this.dealer.hand);
			this.dealer.hand[1].extra.face_up = false;
			this.player.handTotal = this.getHandTotal(this.player.hand);
			this.dealer.handTotal = this.getHandTotal(this.dealer.hand);
			this.checkPoints(BJ_WIN); // check if any player wins with a natural Blackjack
		}
		
		
		this.hit = function(){
			var newCard = casino.draw(1, this.deck);
			if (this.playerTurn){
				this.player.hand = casino.Hand(newCard, this.player.hand);
				this.faceUp(this.player.hand, this.player.hand.length-1);
				this.player.handTotal = this.getHandTotal(this.player.hand);
				this.isBust(this.player.handTotal);
			} else {
				this.dealer.hand = casino.Hand(newCard, this.dealer.hand);
				this.faceUp(this.dealer.hand, this.dealer.hand.length-1);
				this.dealer.handTotal = this.getHandTotal(this.dealer.hand);
				this.isBust(this.dealer.handTotal);
				this.dealerAction();
			}
		}	
		
			
		this.getHandTotal = function(hand){
			this.hand = hand;
			var totalValue = 0;
			for (var i = 0; i < this.hand.length; i++){
				var cardValue = this.hand[i].extra.game_value;
				totalValue = totalValue +  cardValue;
			}
			if (totalValue > this.bust){
				totalValue = this.adjustForAces(this.hand, totalValue);
			}
			this.hand = [];
			return totalValue;
		}
	
		
		this.stand = function(){
			this.toggleTurn();
			this.faceUp(this.dealer.hand, 1); // turn the second dealer's card face up
			this.dealerAction();
		}
		
		
		
		///// HELPERS /////
		
		// determine dealer's action based on handTotal
		this.dealerAction = function(){
			var dealerHandTotal = this.dealer.handTotal;
			if (dealerHandTotal <= 16){
				this.hit();
			} else if (dealerHandTotal >= 17 && dealerHandTotal <= this.bust){
				this.checkPoints(BJ_WIN);
				if (this.winner === null){
					this.checkPoints(POINT_WIN);
				}
			}
		}
		
		// toggle player's turn
		this.toggleTurn = function(){
			this.playerTurn = !this.playerTurn;
		}
		
		// adjust hand value if hand total exceeds 21 and Aces are found
		this.adjustForAces = function(hand, totalValue){
			var count = 0;
			for (var i = 0; i < hand.length; i++){
				if (hand[i].extra.game_value === 11){
					count++;
				}
			}
			if (count > 0){
				deductPoints();
				while (totalValue > this.bust && count > 0){
					deductPoints();
				}
			}
			
			function deductPoints(){
				totalValue = totalValue - 10;
				count--;
			}
			
			return totalValue;
		}
		
			
		
		// check if hand total exceeds 21
		this.isBust = function(handTotal){
			// if it's player's turn, and he has busted, dealer wins
			// if it's dealer's turn, and he has busted, player wins
			if (handTotal > this.bust && this.playerTurn){
				this.player.bust = true;
				this.faceUp(this.dealer.hand,1);
				this.declareWinner("dealer");
			} else if (handTotal > this.bust && !this.playerTurn) {
				this.dealer.bust = true;
				this.declareWinner("player");
			}
		}
		
		
		// if no bust, check who has a better hand value
		this.checkPoints = function(situation){
			if (situation === "blackjack"){
				if (this.player.handTotal === this.bust && this.dealer.handTotal !== this.bust){
					this.declareWinner("playerBJ");
					this.faceUp(this.dealer.hand,1);
				} else if (this.player.handTotal === this.bust && this.dealer.handTotal === this.bust){
					this.declareWinner("tieBJ");
					this.faceUp(this.dealer.hand,1);
				} else if (this.dealer.handTotal === this.bust && this.player.handTotal !== this.bust){
					this.declareWinner("dealerBJ");
					this.faceUp(this.dealer.hand,1);
				}
			} else if (situation === "afterHit"){
				if (this.dealer.handTotal > this.player.handTotal || this.dealer.handTotal === this.bust){
					this.declareWinner("dealer");
					this.faceUp(this.dealer.hand,1);
				} else if (this.dealer.handTotal < this.player.handTotal || this.player.handTotal === this.bust){
					this.declareWinner("player");
					this.faceUp(this.dealer.hand,1);
				} else {
					this.declareWinner("tie");
					this.faceUp(this.dealer.hand,1);
				}
			}
		}

		
		// store the announcement on who's the winner and how
		this.declareWinner = function(situation){
			var message;

			if (situation === "playerBJ"){
				this.winner = 1;
				message = "You won with a Blackjack";
			} else if (situation === "dealerBJ"){
				this.winner = 0;
				message = "Dealer won with a Blackjack";
			} else if (situation === "tieBJ"){
				message = "It's a tie of two Blackjack pairs";
			} else if (situation === "dealer"){
				this.winner = 0;
					if (this.player.handTotal > this.bust){
						message = "You busted! Dealer won with a score " + this.dealer.handTotal + ':' + this.player.handTotal;
					} else {
						message = "Dealer won with a score " + this.dealer.handTotal + ':' + this.player.handTotal;
					}

			} else if (situation === "player") {
				this.winner = 1;
					if (this.dealer.handTotal > this.bust) {
						message = "Dealer busted! You won with a score " + this.player.handTotal + ':' + this.dealer.handTotal;
					} else {
						message = "You won with a score " + this.player.handTotal + ':' + this.dealer.handTotal;
					}
			} else if (situation === "tie"){
				this.winner = 2;
				message = "It's a tie with a score " + this.player.handTotal + ':' + this.dealer.handTotal;
			}
				this.warning(message);
		}
		
		// formulate a message to show
		this.warning = function(message){
			this.message = message;
		}
		
		// change value of face-up for any card
		this.faceUp = function(hand, index){
			if (index === undefined){
				index = hand.length-1;
			}
			
			for (var i = index; i >= 0; i--){
				hand[i].extra.face_up = true;
			}
		}
		
		// create the new Game
		this.newGame = function(){
			this.dealer.hand = casino.clearHand();
			this.dealer.handTotal = 0;
			this.player.hand = casino.clearHand();
			this.player.handTotal = 0;
			this.playerTurn = true;
			this.status = 1;
			this.winner = null;
			this.createDeck();
		}
		
		// removes cards from newly created deck that players already have in their hands
		this.adjustDeck = function(){
	
			var allCards = this.dealer.hand.concat(this.player.hand)
			for (var i = 0; i < allCards.length; i++){
				var value = allCards[i].value;
				var suit = allCards[i].suit;
				
				function findCard(card){
					return card.value === value && card.suit === suit
				}
				
				var cardToDelete = this.deck.find(findCard);
				var index = this.deck.indexOf(cardToDelete);
				this.deck.splice(index,1);
			}
		}
		
		///// GAME START /////
		
		if (status === 0){
			this.newGame();
		} else if (status === 1){
			this.createDeck();
			this.adjustDeck();
			this.dealer.handTotal = this.getHandTotal(this.dealer.hand); // calculate handTotals
			this.player.handTotal = this.getHandTotal(this.player.hand);
		}
	
			
	} // Game object end
		
	
	var module = {
		"Game": Game
	}
	return module
	
})();


