import path = require("path");
import { Uri } from "vscode";
import * as vscode from "vscode";
import { getActiveTextEditor } from "../utils/host";

export function getActiveDocumentUri() {
    const active = getActiveTextEditor();
    if (!active || !active.document) {
        return;
    }
    return active.document.uri;
}

export function getActiveFolder() {
    const uri = getActiveDocumentUri();
    if (!uri) {
        return;
    }
    return Uri.file(path.dirname(uri.fsPath));
}

export function getActiveWorkspace() {
    const uri = getActiveDocumentUri();
    if (!uri) {
        return;
    }
    return vscode.workspace.getWorkspaceFolder(uri);
}

