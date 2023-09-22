import { question } from 'readline-sync';
import clear from 'clear';
import fs from 'fs';

import { promisify } from 'util';
import { 
    generateDeck,
    shuffle,
    drawUntilPlayable,
    matchesAnyProperty,
    handToString,
    deal,
    draw
} from '../lib/cards.mjs';

const SUITS = ['♠️', '❤️', '♣️', '♦️'];
// Display the current state of the game to the console
function displayGameState(deck, playerHand, computerHand, discardPile, nextPlay) {
    const windowWidth = process.stdout.columns;

    // Function to print centered text
    const printCentered = (text) => {
        const leftPadding = Math.floor((windowWidth - text.length) / 2);
        const paddedText = ' '.repeat(leftPadding) + text;
        console.log(paddedText);
    };

    clear();
     // Display game title and other info
    printCentered("CR🤪ZY 8's");
    console.log('-'.repeat(windowWidth));
   // Display the suit or rank + suit, based on the "showSuitOnly" flag
    if (nextPlay.showSuitOnly) {
        printCentered(`Next suit/rank to play: ➡️  ${nextPlay.suit}  ⬅️`);
    } else {
        printCentered(`Next suit/rank to play: ➡️  ${nextPlay.rank}${nextPlay.suit}  ⬅️`);
    }
    console.log('-'.repeat(windowWidth));
    printCentered(`Top of discard pile: ${discardPile[discardPile.length - 1].rank}${discardPile[discardPile.length - 1].suit}`);
    printCentered(`Number of cards left in deck: ${deck.length}`);
    console.log('-'.repeat(windowWidth));
    printCentered(`🤖✋ (computer hand): ${handToString(computerHand)}`);
    printCentered(`😊✋ (player hand): ${handToString(playerHand)}`);
    console.log('-'.repeat(windowWidth));
}

// Function to handle the computer's turn
function computerTurn(deck, computerHand, discardPile, nextPlay) {
    // Filtering cards that can be played
    const playableCards = computerHand.filter(card => matchesAnyProperty(card, nextPlay) || card.rank === '8');
    //console.log(`test: ${handToString(playableCards)}`)
    let cardPlayed;
    console.log(`Computer's hand is: ${handToString(computerHand)}`);
    if (playableCards.length) {
        cardPlayed = { ...playableCards[0] };// Clone the object
        computerHand.splice(computerHand.indexOf(playableCards[0]), 1);// Remove the original card from the computer's hand
        discardPile.push(cardPlayed);// Add the clone to the discard pile
    } else {
        [deck, cardPlayed] = drawUntilPlayable(deck, nextPlay);

        if (cardPlayed) {
            computerHand.push(...cardPlayed.slice(0, cardPlayed.length - 1));// Add all but last to the computer's hand
            cardPlayed = { ...cardPlayed[cardPlayed.length - 1] };// Clone the object
            discardPile.push(cardPlayed);// Add the clone to the discard pile
        } else {
            console.log("🤖 Computer couldn't find a playable card even after drawing.");
            return null;// Return null indicating computer couldn't play
        }
    }

    if (cardPlayed.rank === '8') {
       cardPlayed.suit = SUITS[Math.floor(Math.random() * SUITS.length)];// Modify the clone's suit
        //nextPlay.suit=SUITS[Math.floor(Math.random() * SUITS.length)];
        nextPlay = {
            ...cardPlayed,
            showSuitOnly: true
        };
    }
    if (cardPlayed.rank !== '8') {
        nextPlay = {
            ...cardPlayed,
            showSuitOnly: false
        };
    }
    console.log(`🤖 Computer played: ${cardPlayed.rank}${cardPlayed.suit}`);
    question("Press ENTER to continue");

    //return { cardPlayed };
    return { cardPlayed, nextPlay };
}


// Function to handle the player's turn
function playerTurn(deck, playerHand, discardPile, nextPlay) {
    let cardPlayed = null;
    let newDeck = [...deck];// Create a copy of the deck

    // Check for playable cards
    const playableCards = playerHand.filter(card => matchesAnyProperty(card, nextPlay) || card.rank === '8');
    // Logic for player's turn
    if (playableCards.length > 0) {
        console.log("Enter the number of the card you would like to play:");
        console.log(handToString(playableCards, '\n', true));

        let choice;
        do {
            choice = question(">");
            choice = parseInt(choice);
        } while (isNaN(choice) || choice < 1 || choice > playableCards.length);

        cardPlayed = playableCards[choice - 1];
        playerHand.splice(playerHand.indexOf(cardPlayed), 1);
        discardPile.push(cardPlayed);

        if (cardPlayed.rank === '8') {
            console.log("CRAZY EIGHTS! You played an 8 - choose a suit");
            SUITS.forEach((suit, index) => {
                console.log(`${index + 1}: ${suit}`);
            });

            do {
                choice = question(">");
                choice = parseInt(choice);
            } while (isNaN(choice) || choice < 1 || choice > SUITS.length);
            cardPlayed.suit = SUITS[choice - 1];
            console.log(`You chose to set the suit to ${cardPlayed.suit}`);
        }
    } else {
        const drawnCards = [];
        let choice;
        do {
            const [updatedDeck, drawnCard] = draw(newDeck, 1);// Update the deck copy
            newDeck = updatedDeck;// Make the new deck the "official" deck
            drawnCards.push(drawnCard[0]);
            playerHand.push(drawnCard[0]);

            if (matchesAnyProperty(drawnCard[0], nextPlay)) {
                cardPlayed = drawnCard[0];
            }
        } while (!cardPlayed && newDeck.length > 0);
        if (drawnCards.length > 0) {
            console.log(`Cards drawn: ${handToString(drawnCards)}`);
        }
        if (cardPlayed) {
            playerHand.splice(playerHand.indexOf(cardPlayed), 1);
            discardPile.push(cardPlayed);
            console.log(`😊 You played: ${cardPlayed.rank}${cardPlayed.suit}`);
            if (cardPlayed.rank === '8') {//added to fix the case if 8 when drawn
                console.log("CRAZY EIGHTS! You played an 8 - choose a suit");
                SUITS.forEach((suit, index) => {
                    console.log(`${index + 1}: ${suit}`);
                });
    
                do {
                    choice = question(">");
                    choice = parseInt(choice);
                } while (isNaN(choice) || choice < 1 || choice > SUITS.length);
                cardPlayed.suit = SUITS[choice - 1];

                console.log(`You chose to set the suit to ${cardPlayed.suit}`);
            }
           
            
        }
        else {
            console.log("No playable card was found.");
        }
    }

    question("Press ENTER to continue");

    return { cardPlayed, newDeck };// Return the new deck
}

const readFileAsync = promisify(fs.readFile);
// Function to load deck from a JSON file
async function loadDeckFromJSON(filePath) {
    try {
        const data = await readFileAsync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        throw err;
    }
}

// Utility function to safely draw cards from the deck
function safeDraw(deck, n) {
    if (n > deck.length) {
        console.error(`Tried to draw ${n} cards, but only ${deck.length} are left.`);
        return [deck, []];
    }
    return draw(deck, n);
}
// Function to initialize a new deck
function initializeNewDeck() {
    const shuffledDeck = shuffle(generateDeck());
    const { deck: deckAfterDeal, hands: [dealtPlayerHand, dealtComputerHand] } = deal(shuffledDeck, 2, 5);
    const [restOfDeck, initialDiscardPile] = safeDraw(deckAfterDeal, 1);
    
    return {
        deck: restOfDeck,
        playerHand: dealtPlayerHand,
        computerHand: dealtComputerHand,
        discardPile: initialDiscardPile,
        nextPlay: initialDiscardPile[0]
    };
}


// Main game loop
async function main() {
    // Declare variables to hold game state
   let deck;
   let playerHand;
   let computerHand;
   let discardPile;
   let nextPlay;
   // Fetch JSON file path from command line argument
   const jsonFilePath = process.argv[2];
   // If a JSON file path is provided
   if (jsonFilePath) {
       try {
           const loadedData = await loadDeckFromJSON(jsonFilePath);
           
           deck = loadedData.deck;
           playerHand = loadedData.playerHand;
           computerHand = loadedData.computerHand;
           discardPile = loadedData.discardPile;
           nextPlay = loadedData.nextPlay;
       } catch (err) {
           // Handle errors related to loading the JSON file
           console.error('Error reading the deck from the JSON file:', err);
           const response = question('Do you want to generate a new deck? (yes/no)');
           if (response.toLowerCase() !== 'yes') {
               console.log('Exiting the game. Please fix the JSON file and retry.');
               return;
           }
           // Initialize a new deck if the JSON load failed and the user wants to continue
           const gameData = initializeNewDeck();
           deck = gameData.deck;
           playerHand = gameData.playerHand;
           computerHand = gameData.computerHand;
           discardPile = gameData.discardPile;
           nextPlay = gameData.nextPlay;
       }
   } else {
       // Initialize a new deck if no JSON file path is provided
       const gameData = initializeNewDeck();
       deck = gameData.deck;
       playerHand = gameData.playerHand;
       computerHand = gameData.computerHand;
       discardPile = gameData.discardPile;
       nextPlay = gameData.nextPlay;
   }
       // Main gameplay loop
   while (deck.length > 0 && playerHand.length > 0 && computerHand.length > 0) {
       displayGameState(deck, playerHand, computerHand, discardPile, nextPlay);

       // Call the updated playerTurn function
       const playerCard = playerTurn(deck, playerHand, discardPile, nextPlay);
       if (playerCard.cardPlayed) {
           nextPlay = playerCard.cardPlayed;
       }
       deck = playerCard.newDeck;// Update the deck in the main loop


       displayGameState(deck, playerHand, computerHand, discardPile, nextPlay);

       const computerCard = computerTurn(deck, computerHand, discardPile, nextPlay);
       if (computerCard.cardPlayed) {
           //nextPlay = computerCard.cardPlayed;
           nextPlay = computerCard.nextPlay || computerCard.cardPlayed;
       }

       displayGameState(deck, playerHand, computerHand, discardPile, nextPlay);
   }
   // Check game over conditions
   if (playerHand.length === 0) {
       console.log("Player has no more cards. Player wins!");
       playerHand.length=0;
   } else if (computerHand.length === 0) {
       console.log("Computer has no more cards. Computer wins!");
       computerHand.length=0;
   } else {
       console.log("Deck is empty. Game over!");
       deck.length=0;
   }
}

main();



