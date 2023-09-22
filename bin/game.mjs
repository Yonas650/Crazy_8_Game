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

