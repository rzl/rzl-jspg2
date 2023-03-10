import * as output from './output';
import logger from './logger';
import { showErrorMessage, showInformationMessage } from './host';

export function reportError(err: Error | string, ctx?: string) {
  let errorString: string;
  if (err instanceof Error) {
    errorString = err.message;
    logger.error(`${err.stack}`, ctx);
  } else {
    errorString = err;
    logger.error(errorString, ctx);
  }

  showErrorMessage(errorString, 'Detail').then(result => {
    if (result === 'Detail') {
      output.show();
    }
  });
  return;
}

export function reportInfo(str: string, ctx?: string) {
  logger.log(str, ctx);
  showInformationMessage(str, 'Detail').then(result => {
    if (result === 'Detail') {
      output.show();
    }
  });
  return;
}
