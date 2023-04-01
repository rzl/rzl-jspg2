import * as vscode from 'vscode';
//  import Vue from 'vue';


//var that =  new Vue();
export const thatCompletionProvider = vscode.languages.registerCompletionItemProvider(
    'javascript',
    {
        provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
            //console.log(that)
            // get all text until the `position` and check if it reads `console.`
            // and if so then complete if `log`, `warn`, and `error`
            const linePrefix = document.lineAt(position).text.substr(0, position.character).trim();

            // if (linePrefix.endsWith('that.')) {
            //     return [
            //         new vscode.CompletionItem('log', vscode.CompletionItemKind.Method),
            //         new vscode.CompletionItem('warn', vscode.CompletionItemKind.Method),
            //         new vscode.CompletionItem('error', vscode.CompletionItemKind.Method),
            //     ];
            // }
            console.log(linePrefix.substring(0, linePrefix.length - 1))
            if (linePrefix.startsWith('that.')) {
                try {
                    let obj = eval(linePrefix.substring(0, linePrefix.length - 1));
                    console.log(obj)
                    return Object.keys(obj).map((k) => {
                       return new vscode.CompletionItem(k, vscode.CompletionItemKind.Method)
                    });
                } catch(e) {
    
                }

            }
            return undefined;

        }
    },
    '.' // triggered whenever a '.' is being typed
);