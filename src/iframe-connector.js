import { parseCommand, controller } from "./state";

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

    commands.forEach(c => parseCommand(roomid, c));

}



// gameController.dispatchEvent(new DataEvent('choose', { roomid: 'battle-gen8ou-777', type: 'move', n: 3 } ))
// gameController.dispatchEvent(new DataEvent('choose', { roomid: 'battle-gen8ou-777', type: 'switch', n: 3 } ))

// roomid is the state.battle.roomid
// type is 'switch' or 'move'
// n is the slot which you choose
controller.addEventListener('choose', (event) => {
    // console.log('event', event);

    const { roomid, type, n, m } = event.data;

    console.log('choose', roomid, type, n, m);
    const data = `/choose ${type} ${n}|${m}`;

    // battle-gen8ou-1505621379|/choose move 3|5

    gameWindow.postMessage({ dest: 'showdown-client', data, roomid }, "*");

})

controller.addEventListener('data', event => {
    // console.log('event', event);

    const { roomid, data } = event.data;

    // const message = roomid ? `${roomid}|${data}` : data;

    gameWindow.postMessage({ dest: 'showdown-client', data, roomid }, "*");
})

export const sendMessage = (roomid, message) => {
    const data = `${roomid}|${message}`;

    // battle-gen8ou-1505621379|/choose move 3|5

    gameWindow.postMessage({ dest: 'showdown-client', data }, "*");
}

game.addEventListener('load', () => {
    console.log('game loaded');

    gameWindow.postMessage({ dest: 'showdown-client', data: "ping" }, "*");

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
