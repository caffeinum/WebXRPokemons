import { parseCommand } from "./state";

export const game = document.querySelector('iframe#game');

export const gameWindow = game.contentWindow;

export const parseMessage = (message) => {
    // get roomid
    let [roomid, ...commands] = message.split('\n');

    if (roomid.charAt(0) !== '>') {
        commands = [roomid, ...commands];
        roomid = '';
    } else {
        roomid = roomid.substr(1);
    }

    if (!roomid.includes('battle')) {
        console.log('ignoring roomid', roomid);
        return;
    }

    commands.forEach(parseCommand);

}


game.addEventListener('load', () => {
    console.log('game loaded');

    gameWindow.postMessage({ for: 'showdown-client', data: "ping" }, "*");

    window.addEventListener('message', (event) => {
        console.log('WebXR: receive game message', event.data);

        const { data, dest } = event.data;

        if (dest !== 'webxr') return;

        console.log('WebXR: event filtered', data);

        parseMessage(data);

    }, false);
});

window.game = game;

export default game;
