var cards = (function() {

	var $cardsD = $('.dealer-cards');
	var $cardsP = $('.player-cards');
	
	function getCardURL(hand, position){
		var suit = hand[position].suit;
		var value = hand[position].value;
		var face_up = hand[position].extra.face_up;
		var cardURL = mapToCardImg(face_up, value, suit);
		return cardURL
	}

	function createCard(cardURL){
		var $newCard = $('<img src="'+cardURL+'">');
		return $newCard
	}
	
	
	// attached a back card image to respective hand
	function showBack(actor){
		var cardURL = 'img/back_dark.png';
		var $newCard = createCard(cardURL);
		appendCard($newCard, actor);	
	}
	
	
	function openUp(actor, hand, position){
		var cardURL = getCardURL(hand, position);
		
		function flipUpDealer(){
			$('.dealer-cards > img').eq(position).attr("src", cardURL);
		}
		function flipUpPlayer(){
			$('.player-cards > img').eq(position).attr("src", cardURL);
		}


		if (actor === "dealer"){
			setTimeout(flipUpDealer, 500);
		} else {
			setTimeout(flipUpPlayer, 500);
		}		
	}

		
	/// HELPERS ///
	
	function mapToCardImg(face_up, value, suit){
		if (face_up === true){
			var cardName = suit+'_'+value+'.png';
			var cardURL = 'img/' + cardName;
		} else {
			var cardURL = 'img/back_dark.png';
		}
		return cardURL
	}
	
	
	function appendCard(newCard, actor){
		if (actor === "player"){
			$cardsP.append(newCard);
		} else {
			$cardsD.append(newCard);
		}
	}
	

	

	var module = {
		"getCardURL": getCardURL,
		"createCard": createCard,
		"showBack": showBack,
		"openUp": openUp
	}
	return module

})();