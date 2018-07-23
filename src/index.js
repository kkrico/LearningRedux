import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import registerServiceWorker from './registerServiceWorker';

const createStore = (reducer) => {
    let internalState;
    let handlers = [];

    return {
        dispatch: (action) => {
            internalState = reducer(internalState, action);
            handlers.forEach(h => { h(); })
        },
        subscribe: (handler) => {
            handlers.push(handler)
        },
        getState: () => internalState
    }
};

let container = createStore((model = { running: false, time: 0 }, intent) => {

    // Updates: Guarda todas as intentions e trabalha nelas
    const updates = {
        'START': (model) => Object.assign(model, { running: true }), // Start intent : Pega a model e faz um merge para alterar a propriedade running para true
        'STOP': (model) => Object.assign(model, { running: false }), // Stop intent : Pega a model e faz um merge para alterar a propriedade running para false
        'TICK': (model) => Object.assign(model, { time: model.time + (model.running ? 1 : 0) }) // Tick intent: Pega o time da model (time é o total em segundos), verifica se está rodando. Se tiver, adiciona 1. Se não, adiciona 0
    }

    // Manha balistica: Tenta chamar a propriedade com o nome da 
    // intent. Toda propriedade intent é uma function. Se não tiver essa 
    // propriedade intent no updates, roda uma IIFE para não recebe nada e retorna a model
    // Além disso, passa para a IIFE a model recebida para fechar o ciclo
    return (updates[intent] || (() => model))(model);
});

const view = (model) => {
    let minutes = Math.floor(model.time / 60);
    let remainingSeconds = model.time - (minutes * 60);
    let secondsFormatted = `${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;

    let handler = (event) => {
        debugger;
        container.dispatch(model.running ? 'STOP' : 'START');
    };

    return <div>
        <div>{minutes} : {secondsFormatted}</div>
        <button onClick={handler}>{model.running ? "Stop" : "Start"}</button>
    </div>;
}

const render = () => {
    ReactDOM.render(view(container.getState()), document.getElementById('root'));
}

container.subscribe(render);

setInterval(() => {
    container.dispatch('TICK');
}, 1000);

registerServiceWorker();
