import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(React.createElement(App));

// Also export for library usage
export * from './types';
export * from './adapter';
export * from './constants';
export { default as App } from './App';
export * from './utils/parser';
export { Graph, Node, Connection, Pin, PinType, PinDirection } from '../types';
