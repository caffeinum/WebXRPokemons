export const game = document.querySelector('iframe#game');

console.log('game', game);

export const emitter = new EventTarget();

game.addEventListener('load', () => {
    console.log('game loaded');
    const gameWindow = game.contentWindow;

    gameWindow.postMessage("TEST", "*")

    window.addEventListener('message', (event) => {
        console.log('WebXR: receive game message', event.origin, event.data);

        if (!event.origin.includes('localhost')) return;

        // emitter.dispatchEvent(event);

    }, false);
});

window.game = game;

export default game;
