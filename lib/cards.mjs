// cards.mjs
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const suits = {
  SPADES: '♠️',
  HEARTS: '❤️',
  CLUBS: '♣️',
  DIAMONDS: '♦️'
};

// Function to generate an array of numbers based on provided parameters
const range = (...args) => {
    let start = 0, end = 0, inc = 1;

    if (args.length === 1) [end] = args;
    else if (args.length === 2) [start, end] = args;
    else if (args.length === 3) [start, end, inc] = args;

    const result = [];
    for (let i = start; i < end; i += inc) {
        result.push(i);
    }
    return result;
}

// Create a deck of cards using the specified suits and ranks
const generateDeck = () => {
    const deck = [];
    for (let suitKey in suits) {
        for (let rank of RANKS) {
            deck.push({ suit: suits[suitKey], rank });
        }
    }
    return deck;
}

// Randomize the order of cards in a given deck
const shuffle = (deck) => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Draw a specific number of cards from the end of a deck
const draw = (cardsArray, n = 1) => {
    const newDeck = cardsArray.slice(0, -n);
    const drawnCards = cardsArray.slice(-n);
    return [newDeck, drawnCards];
}

// Distribute cards to a specified number of players
const deal = (cardsArray, numHands = 2, cardsPerHand = 5) => {
    const hands = [];
    let deckCopy = [...cardsArray];

    for (let i = 0; i < numHands; i++) {
        let [updatedDeck, drawnCards] = draw(deckCopy, cardsPerHand);
        hands.push(drawnCards);
        deckCopy = updatedDeck;
    }

    return { deck: deckCopy, hands };
}

// Convert a hand of cards into a formatted string representation
const handToString = (hand, sep = '  ', numbers = false) => {
    return hand.map((card, index) => {
        const cardStr = `${card.rank}${card.suit}`;
        return numbers ? `${index + 1}: ${cardStr}` : cardStr;
    }).join(sep);
}

// Check if an object matches any property-value pair in a given matching object
const matchesAnyProperty = (obj, matchObj) => {
    for (const key in matchObj) {
        if (obj.hasOwnProperty(key) && obj[key] === matchObj[key]) {
            return true;
        }
    }
    return false;
}

// Draw cards from the deck until a playable card (based on provided criteria) is found
const drawUntilPlayable = (deck, matchObject) => {
    let drawnCards = [];
    
    while (deck.length > 0) {
        let card = deck.pop();
        drawnCards.push(card);
        
        if (card.rank === '8' || matchesAnyProperty(card, matchObject)) {
            return [deck, drawnCards];
        }
    }
    
    return [deck, drawnCards];  // Return the empty deck and all the drawn cards if no match is found.
}


export {
    range,
    generateDeck,
    shuffle,
    draw,
    deal,
    handToString,
    matchesAnyProperty,
    drawUntilPlayable
}


