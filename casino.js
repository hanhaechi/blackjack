var cards = (function(){

	// constants for a 52 card deck
	var CARD_VALUE_LIST = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"]
	var CARD_SUIT_LIST = ["hearts","diamonds","clubs","spades"]
	var CARD_COLOR_LIST = ["red","black"]
	var CARD_COLOR_MAP = {
		clubs: "black",
		spades: "black",
		hearts: "red",
		diamonds: "red",
	}
	var CARD_GAME_VALUE_LIST = [2,3,4,5,6,7,8,9,10,11,12,13,14]
	var CARD_FACE_UP = false;

	
	// card object contructor
	function Card(value,color,suit,game_value,face_up){
		this.value = value
		this.color = color
		this.suit = suit
		this.extra = {
			game_value: game_value,
			face_up: face_up
		}
	}

	
	// standard (52 cards) shuffled deck constructor
	function StandardShuffledDeck(){
		this.card_list = []
		this.unshuffled_card_list = []
		
		this.init = function(){
			this.create();
			this.shuffle();	
		}

		this.create = function(){
			for (var suit_index = 0; suit_index < CARD_SUIT_LIST.length; suit_index++){
				for (var value_index = 0; value_index < CARD_VALUE_LIST.length; value_index++){
					var suit = CARD_SUIT_LIST[suit_index]
					var value = CARD_VALUE_LIST[value_index]
					var color = CARD_COLOR_MAP[suit]
					var game_value = CARD_GAME_VALUE_LIST[value_index]
					var face_up = CARD_FACE_UP
					var card = new Card(value,color,suit,game_value,face_up)
					this.card_list.push(card)
					this.unshuffled_card_list.push(card)
					}
				}
			}
		
		this.shuffle = function(){
			this.card_list = shuffleHelper(this.card_list)
			}
		
		this.init();	
		return this.card_list;
	}
	
	
	// shuffled shoe constructor - takes any deck, multiples it by deck_count
	function ShuffledShoe(deck, deck_count){
		this.deck = deck;
		this.deck_count = deck_count;
		this.card_list = [];
		
		this.init = function(){
			this.create();
			this.shuffle();
		}
		
		this.create = function(){
			for (var i = 0; i < this.deck_count; i++){
				this.card_list = this.card_list.concat(this.deck)
				}
		}

		this.shuffle = function(){
			this.card_list = shuffleHelper(this.card_list)
		}
		
		this.init();
		return this.card_list
	}
	
	
	// hand constructor
	function Hand(cards, card_list){
		if (card_list === undefined){
			card_list = [];
		}
		
		this.cards = cards;
		this.card_list = card_list;
		
		this.add = function(){
			for (var i = 0; i < cards.length; i++){
				this.card_list.push(cards[i]);
      }
		}
		this.add();
		return this.card_list
	}
	
	
	function clearHand(){
		this.card_list = []
	}	
	
	// main card draw function
	function draw(count, deck){
		this.card_list = [];
		this.count = count;
		this.deck = deck;
			for (var i = 0; i < this.count; i++){
				var card = this.deck[0]
				this.card_list.push(card)
				this.deck.splice(0,1)
			}
		return this.card_list
	}
	

	//shuffle helper function
	function shuffleHelper(card_list){
		var shuffled_card_list = [];
		
		for (var i = card_list.length-1; i >= 0; i--) {
			var random_number = Math.floor(Math.random() * card_list.length)
			shuffled_card_list[i] = card_list[random_number];
			card_list.splice(random_number, 1)
		}
		return shuffled_card_list
	}	
	



	
	var module = {
		"Card": Card,
		"StandardShuffledDeck": StandardShuffledDeck,
		"ShuffledShoe": ShuffledShoe,
		"Hand": Hand,
		"clearHand": clearHand,
		"draw": draw,
		"shuffleHelper": shuffleHelper
		}
	return module
	
})();