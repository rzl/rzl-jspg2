import * as vscode from 'vscode';
import { prefix } from './prefix';
let isShow = false;
const outputChannel = vscode.window.createOutputChannel(prefix);
export function show() {
  outputChannel.show();
  isShow = true;
}

export function hide() {
  outputChannel.hide();
  isShow = false;
}

export function toggle() {
  if (isShow) {
    hide();
  } else {
    show();
  }
}

export function print(...args: any[]) {
  const msg = args
    .map(arg => {
      if (!arg) {
        return arg;
      }

      if (arg instanceof Error) {
        return arg.stack;
      } else if (!arg.toString || arg.toString() === '[object Object]') {
        return JSON.stringify(arg);
      }

      return arg;
    })
    .join(' ');

  outputChannel.appendLine(msg);
}
