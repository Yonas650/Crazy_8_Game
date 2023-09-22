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
